// Settings Constants and Configuration for OneStep Urban Solve
export const SETTINGS_CONFIG = {
    themes: {
        primary: '#8b5cf6',
        primaryRgb: '139, 92, 246',
        secondary: '#a855f7',
        accent: '#06b6d4'
    },
    
    animations: {
        particleCount: {
            mobile: 8,
            desktop: 12
        },
        colors: ['#8b5cf6', '#a855f7', '#06b6d4', '#3b82f6', '#6366f1'],
        particleLifetime: {
            min: 600,
            max: 1000
        }
    },
    
    validation: {
        name: {
            minLength: 2,
            pattern: /^[a-zA-Z\s]+$/
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        password: {
            minLength: 8,
            patterns: {
                uppercase: /[A-Z]/,
                lowercase: /[a-z]/,
                numbers: /\d/,
                symbols: /[!@#$%^&*]/
            }
        }
    },
    
    preferences: {
        defaults: {
            emailNewAssignments: true,
            emailUpdates: true,
            emailReports: false,
            autoRefresh: true,
            showResolved: false
        }
    },
    
    departments: [
        { value: '', label: 'Select department' },
        { value: 'public-works', label: 'Public Works' },
        { value: 'utilities', label: 'Utilities' },
        { value: 'transportation', label: 'Transportation' },
        { value: 'parks-recreation', label: 'Parks & Recreation' },
        { value: 'code-enforcement', label: 'Code Enforcement' },
        { value: 'environmental', label: 'Environmental Services' },
        { value: 'other', label: 'Other' }
    ],
    
    storage: {
        keys: {
            userData: 'staffUserData',
            preferences: 'staffPreferences'
        }
    },
    
    delays: {
        profileSave: 1500,
        passwordSave: 2000,
        preferencesSave: 1000
    }
};

export const FORM_FIELDS = {
    profile: ['firstName', 'lastName', 'profileEmail', 'profilePhone', 'department'],
    password: ['currentPassword', 'newPassword', 'confirmPassword'],
    preferences: ['emailNewAssignments', 'emailUpdates', 'emailReports', 'autoRefresh', 'showResolved']
};

export const ERROR_MESSAGES = {
    required: (field) => `${field} is required`,
    minLength: (field, length) => `${field} must be at least ${length} characters`,
    pattern: (field) => `Please enter a valid ${field.toLowerCase()}`,
    email: 'Please enter a valid email address',
    passwordMatch: 'Passwords do not match',
    namePattern: 'Name should only contain letters and spaces'
};

export const SUCCESS_MESSAGES = {
    profile: {
        title: 'Profile Updated!',
        message: 'Your profile information has been saved successfully.'
    },
    password: {
        title: 'Password Updated!',
        message: 'Your password has been changed successfully. Please use your new password for future logins.'
    },
    preferences: {
        title: 'Preferences Saved!',
        message: 'Your notification and dashboard preferences have been updated.'
    }
};