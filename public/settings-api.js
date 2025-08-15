// Settings API and Data Management for OneStep Urban Solve
import { SETTINGS_CONFIG, SUCCESS_MESSAGES } from './settings-constants.js';
import { SettingsValidator, FormErrorHandler } from './settings-validation.js';

export class SettingsAPI {
    static async saveProfile(formData, originalData = {}) {
        const validation = SettingsValidator.validateAllProfileFields(formData);
        
        if (!validation.isValid) {
            FormErrorHandler.showErrors(validation.errors);
            return { success: false, errors: validation.errors };
        }
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, SETTINGS_CONFIG.delays.profileSave));
        
        const userData = {
            ...originalData,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.profileEmail,
            phone: formData.profilePhone,
            department: formData.department
        };
        
        localStorage.setItem(SETTINGS_CONFIG.storage.keys.userData, JSON.stringify(userData));
        
        return { 
            success: true, 
            data: userData,
            message: SUCCESS_MESSAGES.profile
        };
    }
    
    static async changePassword(formData) {
        const validation = SettingsValidator.validateAllPasswordFields(formData);
        
        if (!validation.isValid) {
            FormErrorHandler.showErrors(validation.errors);
            return { success: false, errors: validation.errors };
        }
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, SETTINGS_CONFIG.delays.passwordSave));
        
        // In a real app, this would make an actual API call
        return { 
            success: true,
            message: SUCCESS_MESSAGES.password
        };
    }
    
    static async savePreferences(preferences) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, SETTINGS_CONFIG.delays.preferencesSave));
        
        localStorage.setItem(SETTINGS_CONFIG.storage.keys.preferences, JSON.stringify(preferences));
        
        return { 
            success: true,
            data: preferences,
            message: SUCCESS_MESSAGES.preferences
        };
    }
    
    static loadUserData() {
        const userData = JSON.parse(localStorage.getItem(SETTINGS_CONFIG.storage.keys.userData) || '{}');
        return userData;
    }
    
    static loadPreferences() {
        const stored = JSON.parse(localStorage.getItem(SETTINGS_CONFIG.storage.keys.preferences) || '{}');
        return { ...SETTINGS_CONFIG.preferences.defaults, ...stored };
    }
}

export class SettingsFormManager {
    constructor(elements) {
        this.elements = elements;
        this.originalData = {};
    }
    
    async handleProfileSubmit(e) {
        e.preventDefault();
        
        const formData = {
            firstName: this.elements.firstName?.value || '',
            lastName: this.elements.lastName?.value || '',
            profileEmail: this.elements.profileEmail?.value || '',
            profilePhone: this.elements.profilePhone?.value || '',
            department: this.elements.department?.value || ''
        };
        
        // Show loading state
        this.setLoadingState(this.elements.saveProfile, true);
        
        try {
            const result = await SettingsAPI.saveProfile(formData, this.originalData);
            
            if (result.success) {
                this.originalData = result.data;
                this.showSuccessModal(result.message.title, result.message.message);
                FormErrorHandler.clearAllErrors();
            }
            
            return result;
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: 'An error occurred while saving your profile.' };
        } finally {
            this.setLoadingState(this.elements.saveProfile, false);
        }
    }
    
    async handlePasswordSubmit(e) {
        e.preventDefault();
        
        const formData = {
            currentPassword: this.elements.currentPassword?.value || '',
            newPassword: this.elements.newPassword?.value || '',
            confirmPassword: this.elements.confirmPassword?.value || ''
        };
        
        // Show loading state
        this.setLoadingState(this.elements.savePassword, true);
        
        try {
            const result = await SettingsAPI.changePassword(formData);
            
            if (result.success) {
                this.showSuccessModal(result.message.title, result.message.message);
                this.resetPasswordForm();
                FormErrorHandler.clearAllErrors();
            }
            
            return result;
        } catch (error) {
            console.error('Password update error:', error);
            return { success: false, error: 'An error occurred while updating your password.' };
        } finally {
            this.setLoadingState(this.elements.savePassword, false);
        }
    }
    
    async handlePreferencesSubmit(e) {
        e.preventDefault();
        
        const preferences = {};
        Object.keys(SETTINGS_CONFIG.preferences.defaults).forEach(key => {
            const checkbox = document.getElementById(key);
            if (checkbox) {
                preferences[key] = checkbox.checked;
            }
        });
        
        // Show loading state
        this.setLoadingState(this.elements.savePreferences, true);
        
        try {
            const result = await SettingsAPI.savePreferences(preferences);
            
            if (result.success) {
                this.showSuccessModal(result.message.title, result.message.message);
            }
            
            return result;
        } catch (error) {
            console.error('Preferences update error:', error);
            return { success: false, error: 'An error occurred while saving your preferences.' };
        } finally {
            this.setLoadingState(this.elements.savePreferences, false);
        }
    }
    
    setLoadingState(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
    
    loadUserData() {
        const userData = SettingsAPI.loadUserData();
        
        if (userData.name) {
            const nameParts = userData.name.split(' ');
            if (this.elements.firstName) this.elements.firstName.value = nameParts[0] || '';
            if (this.elements.lastName) this.elements.lastName.value = nameParts.slice(1).join(' ') || '';
        }
        
        if (this.elements.profileEmail && userData.email) {
            this.elements.profileEmail.value = userData.email;
        }
        
        if (this.elements.profilePhone && userData.phone) {
            this.elements.profilePhone.value = userData.phone;
        }
        
        if (this.elements.department && userData.department) {
            this.elements.department.value = userData.department;
        }
        
        // Update avatar
        this.updateUserAvatar(userData);
        
        // Store original data
        this.originalData = { ...userData };
    }
    
    loadPreferences() {
        const preferences = SettingsAPI.loadPreferences();
        
        Object.entries(preferences).forEach(([key, value]) => {
            const checkbox = document.getElementById(key);
            if (checkbox) {
                checkbox.checked = value;
            }
        });
    }
    
    updateUserAvatar(userData) {
        if (this.elements.userAvatarLarge && userData.name && userData.name !== 'Staff Member') {
            const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase();
            this.elements.userAvatarLarge.innerHTML = `<span style="font-weight: 600; font-size: 1.5rem;">${initials}</span>`;
        }
    }
    
    resetPasswordForm() {
        this.elements.passwordForm?.reset();
        if (typeof updatePasswordStrength === 'function') {
            updatePasswordStrength('', this.elements.strengthFill, this.elements.strengthText);
        }
        FormErrorHandler.clearAllErrors(document.getElementById('security'));
    }
    
    resetProfileForm() {
        this.loadUserData();
        FormErrorHandler.clearAllErrors(document.getElementById('profile'));
    }
    
    resetPreferencesForm() {
        this.loadPreferences();
    }
    
    showSuccessModal(title, message) {
        if (this.elements.successTitle) this.elements.successTitle.textContent = title;
        if (this.elements.successMessage) this.elements.successMessage.textContent = message;
        if (this.elements.successModal) {
            this.elements.successModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
}

export function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Make closeSuccessModal available globally
window.closeSuccessModal = closeSuccessModal;