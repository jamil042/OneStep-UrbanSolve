// Form Utilities for OneStep Urban Solve
// Common validation and helper functions

const FormUtils = {
    // Validation rules
    validators: {
        email: (value) => {
            if (!value.trim()) return 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
            return null;
        },
        
        name: (value) => {
            if (!value.trim()) return 'Name is required';
            if (value.trim().length < 2) return 'Name must be at least 2 characters';
            if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name should only contain letters and spaces';
            return null;
        },
        
        phone: (value) => {
            if (!value.trim()) return 'Phone number is required';
            const clean = value.replace(/\D/g, '');
            if (clean.length < 10) return 'Enter a valid phone number';
            return null;
        },
        
        nid: (value) => {
            if (!value.trim()) return 'NID number is required';
            if (!/^\d{10,17}$/.test(value.replace(/\s+/g, ''))) return 'Enter valid NID (10-17 digits)';
            return null;
        },
        
        role: (value) => {
            if (!value) return 'Please select a role';
            if (!['user', 'staff', 'admin'].includes(value)) return 'Please select a valid role';
            return null;
        },
        
        password: (value) => {
            if (!value) return 'Password is required';
            if (value.length < 8) return 'Password must be at least 8 characters';
            const checks = [/[A-Z]/, /[a-z]/, /\d/, /[!@#$%^&*]/];
            if (checks.filter(check => check.test(value)).length < 3) {
                return 'Password needs uppercase, lowercase, numbers, and symbols';
            }
            return null;
        },
        
        terms: (checked) => checked ? null : 'You must agree to terms and conditions'
    },

    // Format functions
    formatters: {
        phone: (value) => {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 3) return cleaned;
            if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
        },
        
        nid: (value) => {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 4) return cleaned;
            if (cleaned.length <= 8) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 17)}`;
        }
    },

    // Password strength checker
    checkPasswordStrength: (password) => {
        if (!password) return { score: 0, text: 'Password strength' };

        const checks = [
            password.length >= 8,
            /[A-Z]/.test(password) && /[a-z]/.test(password),
            /\d/.test(password),
            /[!@#$%^&*]/.test(password)
        ];
        
        const strength = checks.filter(Boolean).length;
        const levels = ['weak', 'fair', 'good', 'strong'];
        const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
        
        return {
            score: strength,
            level: levels[Math.max(0, strength - 1)] || 'weak',
            text: labels[strength] || 'Very weak'
        };
    },

    // Show/hide error messages
    showError: (field, message, errorElements, inputs) => {
        const input = inputs[field];
        const errorEl = errorElements[field];
        if (input && errorEl) {
            input.classList.add('error');
            input.classList.remove('success');
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    },

    hideError: (field, errorElements, inputs) => {
        const input = inputs[field];
        const errorEl = errorElements[field];
        if (input && errorEl) {
            input.classList.remove('error');
            input.classList.add('success');
            errorEl.classList.remove('show');
        }
    },

    // Validate single field
    validateField: (field, value, errorElements, inputs) => {
        const validator = FormUtils.validators[field];
        if (!validator) return true;
        
        const error = validator(value);
        if (error) {
            FormUtils.showError(field, error, errorElements, inputs);
            return false;
        } else {
            FormUtils.hideError(field, errorElements, inputs);
            return true;
        }
    },

    // Add ripple effect to buttons
    addRippleEffect: (button, event) => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormUtils;
}