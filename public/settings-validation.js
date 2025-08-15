// Settings Validation Utilities for OneStep Urban Solve
import { SETTINGS_CONFIG, ERROR_MESSAGES } from './settings-constants.js';

export class SettingsValidator {
    static validateProfileField(input) {
        if (!input) return { isValid: true, error: null };
        
        let fieldName = input.name;
        if (fieldName === 'profileEmail') fieldName = 'email';
        if (fieldName === 'profilePhone') fieldName = 'phone';
        
        const value = input.value;
        
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                return this.validateName(value, fieldName);
            case 'email':
                return this.validateEmail(value);
            case 'phone':
                return this.validatePhone(value);
            default:
                return { isValid: true, error: null };
        }
    }
    
    static validatePasswordField(input, allInputs = {}) {
        if (!input) return { isValid: true, error: null };
        
        const value = input.value;
        const fieldName = input.name || input.id;
        
        switch (fieldName) {
            case 'currentPassword':
                return this.validateCurrentPassword(value);
            case 'newPassword':
                return this.validateNewPassword(value);
            case 'confirmPassword':
                return this.validateConfirmPassword(value, allInputs.newPassword?.value);
            default:
                return { isValid: true, error: null };
        }
    }
    
    static validateName(value, fieldType) {
        if (!value?.trim()) {
            const fieldLabel = fieldType === 'firstName' ? 'First name' : 'Last name';
            return { isValid: false, error: ERROR_MESSAGES.required(fieldLabel) };
        }
        
        if (value.trim().length < SETTINGS_CONFIG.validation.name.minLength) {
            return { isValid: false, error: ERROR_MESSAGES.minLength('Name', SETTINGS_CONFIG.validation.name.minLength) };
        }
        
        if (!SETTINGS_CONFIG.validation.name.pattern.test(value)) {
            return { isValid: false, error: ERROR_MESSAGES.namePattern };
        }
        
        return { isValid: true, error: null };
    }
    
    static validateEmail(value) {
        if (!value?.trim()) {
            return { isValid: false, error: ERROR_MESSAGES.required('Email') };
        }
        
        if (!SETTINGS_CONFIG.validation.email.pattern.test(value)) {
            return { isValid: false, error: ERROR_MESSAGES.email };
        }
        
        return { isValid: true, error: null };
    }
    
    static validatePhone(value) {
        // Phone is optional, so if empty, it's valid
        if (!value?.trim()) {
            return { isValid: true, error: null };
        }
        
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length < 10) {
            return { isValid: false, error: 'Enter a valid phone number' };
        }
        
        return { isValid: true, error: null };
    }
    
    static validateCurrentPassword(value) {
        if (!value) {
            return { isValid: false, error: ERROR_MESSAGES.required('Current password') };
        }
        
        if (value.length < 6) {
            return { isValid: false, error: 'Please enter your current password' };
        }
        
        return { isValid: true, error: null };
    }
    
    static validateNewPassword(value) {
        if (!value) {
            return { isValid: false, error: ERROR_MESSAGES.required('New password') };
        }
        
        if (value.length < SETTINGS_CONFIG.validation.password.minLength) {
            return { isValid: false, error: ERROR_MESSAGES.minLength('Password', SETTINGS_CONFIG.validation.password.minLength) };
        }
        
        const patterns = SETTINGS_CONFIG.validation.password.patterns;
        const checks = [
            patterns.uppercase.test(value) && patterns.lowercase.test(value),
            patterns.numbers.test(value),
            patterns.symbols.test(value)
        ];
        
        if (checks.filter(Boolean).length < 3) {
            return { isValid: false, error: 'Password needs uppercase, lowercase, numbers, and symbols' };
        }
        
        return { isValid: true, error: null };
    }
    
    static validateConfirmPassword(value, newPasswordValue) {
        if (!value) {
            return { isValid: false, error: ERROR_MESSAGES.required('Password confirmation') };
        }
        
        if (value !== newPasswordValue) {
            return { isValid: false, error: ERROR_MESSAGES.passwordMatch };
        }
        
        return { isValid: true, error: null };
    }
    
    static checkPasswordStrength(password) {
        if (!password) return { score: 0, level: 'weak', text: 'Password strength' };

        const patterns = SETTINGS_CONFIG.validation.password.patterns;
        const checks = [
            password.length >= SETTINGS_CONFIG.validation.password.minLength,
            patterns.uppercase.test(password) && patterns.lowercase.test(password),
            patterns.numbers.test(password),
            patterns.symbols.test(password)
        ];
        
        const strength = checks.filter(Boolean).length;
        const levels = ['weak', 'fair', 'good', 'strong'];
        const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
        
        return {
            score: strength,
            level: levels[Math.max(0, strength - 1)] || 'weak',
            text: labels[strength] || 'Very weak'
        };
    }
    
    static validateAllProfileFields(formData) {
        const errors = {};
        let isValid = true;
        
        // Validate required fields
        ['firstName', 'lastName', 'profileEmail'].forEach(fieldName => {
            const value = formData[fieldName];
            const result = fieldName === 'profileEmail' 
                ? this.validateEmail(value)
                : this.validateName(value, fieldName);
                
            if (!result.isValid) {
                errors[fieldName] = result.error;
                isValid = false;
            }
        });
        
        return { isValid, errors };
    }
    
    static validateAllPasswordFields(formData) {
        const errors = {};
        let isValid = true;
        
        // Validate current password
        const currentResult = this.validateCurrentPassword(formData.currentPassword);
        if (!currentResult.isValid) {
            errors.currentPassword = currentResult.error;
            isValid = false;
        }
        
        // Validate new password
        const newResult = this.validateNewPassword(formData.newPassword);
        if (!newResult.isValid) {
            errors.newPassword = newResult.error;
            isValid = false;
        }
        
        // Validate confirm password
        const confirmResult = this.validateConfirmPassword(formData.confirmPassword, formData.newPassword);
        if (!confirmResult.isValid) {
            errors.confirmPassword = confirmResult.error;
            isValid = false;
        }
        
        return { isValid, errors };
    }
}

export class FormErrorHandler {
    static showError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    static hideError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }
    
    static clearAllErrors(container = document) {
        container.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
    }
    
    static showErrors(errors) {
        Object.entries(errors).forEach(([fieldName, message]) => {
            this.showError(fieldName, message);
        });
    }
}

export function formatPhone(value) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}

export function updatePasswordStrength(password, strengthFill, strengthText) {
    if (!strengthFill || !strengthText) return;
    
    const result = SettingsValidator.checkPasswordStrength(password);
    
    strengthFill.className = `strength-fill ${result.level}`;
    strengthText.textContent = result.text;
    
    return result;
}