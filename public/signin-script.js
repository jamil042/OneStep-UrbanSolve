// signin-script.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signinForm');
    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton.querySelector('.button-text');
    const loadingSpinner = submitButton.querySelector('.loading-spinner');

    // Password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');

    passwordToggle.addEventListener('click', function() {
        togglePasswordVisibility();
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('Signin form submitted'); // Debug log
        
        // Clear previous errors
        clearErrors();
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role')
        };

        console.log('Signin form data:', data); // Debug log

        // Validate form
        if (!validateForm(data)) {
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            console.log('Sending request to /api/signin'); // Debug log
            
            const response = await fetch('/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
            if(data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'citizen_dashboard.html';
            }
            });
            console.log('Signin response status:', response.status); // Debug log
            
            const result = await response.json();
            console.log('Signin response data:', result); // Debug log

            if (response.ok && result.success) {
                // Store user data in sessionStorage (since we can't use localStorage)
                const userData = {
                    user: result.user,
                    loginTime: new Date().toISOString()
                };
                
                // Show success message
                showSuccessModal('Welcome back, ' + result.user.name + '!');
                
                // Redirect after a delay
                setTimeout(() => {
                    window.location.href = 'citizen_dashboard.html';
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