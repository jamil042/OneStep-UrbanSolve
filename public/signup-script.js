// signup-script.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton.querySelector('.button-text');
    const loadingSpinner = submitButton.querySelector('.loading-spinner');

    // Password strength checker
    const passwordInput = document.getElementById('password');
    const strengthBar = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        updateStrengthIndicator(strength);
    });

    // Password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    passwordToggle.addEventListener('click', function() {
        togglePasswordVisibility();
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('Form submitted'); // Debug log
        
        // Clear previous errors
        clearErrors();
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            nid: formData.get('nid'),
            phone: formData.get('phone'),
            role: formData.get('role'),
            password: formData.get('password'),
            terms: formData.get('terms')
        };

        console.log('Form data:', data); // Debug log

        // Validate form
        if (!validateForm(data)) {
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            console.log('Sending request to /api/signup'); // Debug log
            
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status); // Debug log
            
            const result = await response.json();
            console.log('Response data:', result); // Debug log

            if (response.ok && result.success) {
                // Show success message
                showSuccessModal('Account created successfully!');
                form.reset();
            } else {
                // Show error message
                showError('generalError', result.error || 'An error occurred during signup');
            }
        } catch (error) {
            console.error('Network error:', error);
            showError('generalError', 'Network error. Please check your connection and try again.');
        } finally {
            setLoadingState(false);
        }
    });

    function validateForm(data) {
        let isValid = true;

        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            showError('nameError', 'Name must be at least 2 characters long');
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }

        // NID validation
        if (!data.nid || data.nid.length < 10) {
            showError('nidError', 'NID must be at least 10 digits');
            isValid = false;
        }

        // Phone validation
        const phoneRegex = /^[\d\-\+\s\(\)]+$/;
        if (!data.phone || !phoneRegex.test(data.phone)) {
            showError('phoneError', 'Please enter a valid phone number');
            isValid = false;
        }

        // Role validation
        if (!data.role) {
            showError('roleError', 'Please select a role');
            isValid = false;
        }

        // Password validation
        if (!data.password || data.password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters long');
            isValid = false;
        }

        // Terms validation
        if (!data.terms) {
            showError('termsError', 'You must agree to the terms and conditions');
            isValid = false;
        }

        return isValid;
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        if (elementId === 'generalError') {
            // Create general error element if it doesn't exist
            let generalError = document.getElementById('generalError');
            if (!generalError) {
                generalError = document.createElement('div');
                generalError.id = 'generalError';
                generalError.className = 'general-error';
                generalError.style.cssText = 'background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; color: #dc2626;';
                form.insertBefore(generalError, form.firstChild);
            }
            generalError.textContent = message;
            generalError.style.display = 'block';
        }
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';

            // Clear general error too
        const generalError = document.getElementById('generalError');
        if (generalError) {
            generalError.style.display = 'none';
        }
        });
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
            buttonText.style.display = 'none';
            loadingSpinner.style.display = 'block';
        } else {
            submitButton.disabled = false;
            buttonText.style.display = 'block';
            loadingSpinner.style.display = 'none';
        }
    }

    function showSuccessModal(message) {
        const modal = document.getElementById('successModal');
        const messageElement = document.getElementById('successMessage');
        if (modal && messageElement) {
            messageElement.textContent = message;
            modal.style.display = 'flex';
        }
    }

    function checkPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        return score;
    }

    function updateStrengthIndicator(strength) {
        const strengthColors = ['#ff4757', '#ff6b7a', '#ffa502', '#2ed573', '#20bf6b'];
        const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        
        if (passwordInput.value.length === 0) {
            strengthBar.style.width = '0%';
            strengthText.textContent = 'Password strength';
            return;
        }

        const percentage = (strength / 5) * 100;
        strengthBar.style.width = percentage + '%';
        strengthBar.style.backgroundColor = strengthColors[strength - 1] || strengthColors[0];
        strengthText.textContent = strengthTexts[strength - 1] || strengthTexts[0];
    }

    function togglePasswordVisibility() {
        const eyeOpen = passwordToggle.querySelector('.eye-open');
        const eyeClosed = passwordToggle.querySelector('.eye-closed');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
        } else {
            passwordInput.type = 'password';
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
        }
    }
});

// Close success modal
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
}