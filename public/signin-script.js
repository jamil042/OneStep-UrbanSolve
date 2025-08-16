// signin-script.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signinForm');
    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton.querySelector('.button-text');
    const loadingSpinner = submitButton.querySelector('.loading-spinner');

    // Password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            togglePasswordVisibility();
        });
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('Signin form submitted');
        
        // Clear previous errors
        clearErrors();
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role')
        };

        console.log('Signin form data:', data);

        // Validate form
        if (!validateForm(data)) {
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            console.log('Sending request to /api/signin');
            
            const response = await fetch('/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            console.log('Signin response status:', response.status);
            
            const result = await response.json();
            console.log('Signin response data:', result);

            if (response.ok && result.success) {
                console.log('Login successful for user:', result.user);
                
                // Store user data in localStorage for session management
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', result.user.role);
                
                // Show success message
                showSuccessModal('Welcome back, ' + result.user.name + '!');
                
                // Redirect based on role after a delay
                setTimeout(() => {
                    redirectToDashboard(result.user.role);
                }, 2000);
                
            } else {
                // Show error message
                showError('generalError', result.error || 'An error occurred during signin');
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

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Role validation
        if (!data.role) {
            showError('roleError', 'Please select a role');
            isValid = false;
        }

        // Password validation
        if (!data.password || data.password.length < 1) {
            showError('passwordError', 'Please enter your password');
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

        // Also show the general error container if it's a general error
        if (elementId === 'generalError') {
            const generalErrorContainer = document.getElementById('generalError');
            if (generalErrorContainer) {
                const errorTextElement = document.getElementById('generalErrorText');
                if (errorTextElement) {
                    errorTextElement.textContent = message;
                }
                generalErrorContainer.style.display = 'block';
            }
        }
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });

        // Also clear general error
        const generalError = document.getElementById('generalError');
        if (generalError) {
            generalError.style.display = 'none';
        }
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

    function redirectToDashboard(role) {
        console.log('Redirecting user with role:', role);
        
        // Clear any existing redirects
        window.location.replace(getDashboardUrl(role));
    }

    function getDashboardUrl(role) {
        switch(role) {
            case 'staff':
                return '/staff_dashboard';
            case 'admin':
                return '/admin_dashboard';
            case 'user':
            case 'citizen':
            default:
                return '/citizen_dashboard';
        }
    }

    function togglePasswordVisibility() {
        const eyeOpen = passwordToggle.querySelector('.eye-open');
        const eyeClosed = passwordToggle.querySelector('.eye-closed');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            if (eyeOpen) eyeOpen.style.display = 'none';
            if (eyeClosed) eyeClosed.style.display = 'block';
        } else {
            passwordInput.type = 'password';
            if (eyeOpen) eyeOpen.style.display = 'block';
            if (eyeClosed) eyeClosed.style.display = 'none';
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

// Add this function to handle the loginUser() function called in the HTML
function loginUser() {
    // Trigger the form submission
    const form = document.getElementById('signinForm');
    if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
}