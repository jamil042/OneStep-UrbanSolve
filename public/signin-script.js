// Enhanced Signin Page JavaScript with Urban Sketches
document.addEventListener('DOMContentLoaded', function() {
    // Initialize urban sketch background
    initUrbanSketch();
    
    // Form elements
    const form = document.getElementById('signinForm');
    const submitButton = document.getElementById('submitButton');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const successModal = document.getElementById('successModal');
    const generalError = document.getElementById('generalError');
    const generalErrorText = document.getElementById('generalErrorText');

    // Form inputs
    const inputs = {
        email: document.getElementById('email'),
        role: document.getElementById('role'),
        password: passwordInput
    };

    // Error elements
    const errorElements = {
        email: document.getElementById('emailError'),
        role: document.getElementById('roleError'),
        password: document.getElementById('passwordError')
    };

    // Initialize urban sketch background
    function initUrbanSketch() {
        const urbanSketchLayer = document.getElementById('urbanSketch');
        if (urbanSketchLayer && typeof createUrbanSketchSVG === 'function') {
            urbanSketchLayer.innerHTML = createUrbanSketchSVG('signin', '#06b6d4');
        }
    }

    // Enhanced Background Manager for Signin (Cyan theme)
    class SigninBackgroundManager {
        constructor() {
            this.container = document.getElementById('backgroundParticles');
            this.particles = [];
            this.animationId = null;
            this.lastTime = 0;
            this.isVisible = true;
            
            if (this.container && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.init();
            }
        }
        
        init() {
            this.createParticles();
            this.animate();
            this.setupEventListeners();
        }
        
        createParticles() {
            const count = window.innerWidth < 768 ? 12 : 20;
            const colors = ['#06b6d4', '#4299e1', '#0891b2', '#0e7490', '#164e63', '#67e8f9'];
            
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 4 + 2;
                const data = {
                    element: particle,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    size: size,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: Math.random() * 200,
                    maxLife: 250 + Math.random() * 150
                };
                
                Object.assign(particle.style, {
                    position: 'absolute',
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: data.color,
                    transform: `translate(${data.x}px, ${data.y}px)`,
                    pointerEvents: 'none',
                    willChange: 'transform',
                    boxShadow: `0 0 ${size * 2}px ${data.color}50`
                });
                
                this.container.appendChild(particle);
                this.particles.push(data);
            }
        }
        
        animate() {
            if (!this.isVisible) return;
            
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            if (deltaTime >= 33) { // ~30fps
                this.updateParticles(deltaTime);
            }
            
            this.animationId = requestAnimationFrame(() => this.animate());
        }
        
        updateParticles(deltaTime) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            this.particles.forEach(particle => {
                particle.x += particle.vx * deltaTime * 0.08;
                particle.y += particle.vy * deltaTime * 0.08;
                particle.life += deltaTime * 0.01;
                
                if (particle.x < -particle.size) particle.x = width + particle.size;
                if (particle.x > width + particle.size) particle.x = -particle.size;
                if (particle.y < -particle.size) particle.y = height + particle.size;
                if (particle.y > height + particle.size) particle.y = -particle.size;
                
                particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
                
                if (particle.life >= particle.maxLife) {
                    particle.x = Math.random() * width;
                    particle.y = Math.random() * height;
                    particle.life = 0;
                }
            });
        }
        
        setupEventListeners() {
            document.addEventListener('visibilitychange', () => {
                this.isVisible = !document.hidden;
                if (this.isVisible && !this.animationId) {
                    this.animate();
                }
            });
        }
        
        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            this.particles.forEach(particle => {
                if (particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
            });
        }
    }

    // Initialize background
    const backgroundManager = new SigninBackgroundManager();

    // Show/hide general error
    function showGeneralError(message) {
        generalErrorText.textContent = message;
        generalError.style.display = 'block';
        generalError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideGeneralError() {
        generalError.style.display = 'none';
    }

    // Real-time validation setup
    Object.keys(inputs).forEach(field => {
        const input = inputs[field];
        if (!input) return;

        input.addEventListener('input', (e) => {
            const value = e.target.value;
            FormUtils.validateField(field, value, errorElements, inputs);
            hideGeneralError(); // Hide general error when user starts typing
        });

        input.addEventListener('change', (e) => {
            const value = e.target.value;
            FormUtils.validateField(field, value, errorElements, inputs);
        });
    });

    // Password toggle functionality
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            
            const eyeOpen = passwordToggle.querySelector('.eye-open');
            const eyeClosed = passwordToggle.querySelector('.eye-closed');
            
            eyeOpen.style.display = isPassword ? 'none' : 'block';
            eyeClosed.style.display = isPassword ? 'block' : 'none';
        });
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide previous general error
        hideGeneralError();
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            role: formData.get('role'),
            password: formData.get('password')
        };

        // Validate all fields
        let isValid = true;
        Object.keys(data).forEach(field => {
            if (!FormUtils.validateField(field, data[field], errorElements, inputs)) {
                isValid = false;
            }
        });

        if (!isValid) {
            const firstError = form.querySelector('.form-input.error, .form-select.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

        // Show loading state
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        try {
            // Simulate API call with potential failure
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate random success/failure for demo
                    const success = Math.random() > 0.3; // 70% success rate
                    if (success) {
                        resolve();
                    } else {
                        reject(new Error('Invalid credentials'));
                    }
                }, 1500);
            });
            
            // Show success modal
            showSuccessModal(data);
            
        } catch (error) {
            console.error('Signin error:', error);
            showGeneralError('Invalid email, role, or password. Please check your credentials and try again.');
        } finally {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    });

    // Success modal functions
    function showSuccessModal(userData) {
        const messageEl = document.getElementById('successMessage');
        if (messageEl) {
            messageEl.textContent = `Welcome back! You are now signed in as ${userData.role}.`;
        }
        successModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Close modal function (global)
    window.closeSuccessModal = function() {
        successModal.style.display = 'none';
        document.body.style.overflow = '';
    };

    // Close modal on overlay click
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal || e.target.classList.contains('success-modal-overlay')) {
                closeSuccessModal();
            }
        });
    }

    // Enhanced button interactions with ripple effect
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.disabled) return;
            FormUtils.addRippleEffect(this, e);
        });
    });

    // Input field enhancements
    Object.keys(inputs).forEach(field => {
        const input = inputs[field];
        if (!input) return;

        // Enhanced focus effects
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.01)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (backgroundManager) {
            backgroundManager.destroy();
        }
    });

    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
        // ESC key closes modal
        if (e.key === 'Escape' && successModal && successModal.style.display === 'block') {
            closeSuccessModal();
        }
        
        // Enter key submits form when focus is on form element
        if (e.key === 'Enter' && e.target.form === form && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            form.requestSubmit();
        }
        
        // Tab navigation improvements
        if (e.key === 'Tab') {
            const focusableElements = form.querySelectorAll(
                'input, select, button, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });

    console.log('OneStep Urban Solve - Signin page loaded successfully with urban sketches');
});

// Demo account suggestions (for development/testing)
function showDemoAccounts() {
    const demoAccounts = [
        { email: 'citizen@demo.com', role: 'user', password: 'demo123' },
        { email: 'staff@demo.com', role: 'staff', password: 'staff123' },
        { email: 'admin@demo.com', role: 'admin', password: 'admin123' }
    ];
    
    console.log('Demo accounts available:', demoAccounts);
    return demoAccounts;
}

// Auto-fill demo account (for development)
function fillDemoAccount(type = 'user') {
    const demoAccounts = {
        user: { email: 'citizen@demo.com', role: 'user', password: 'demo123' },
        staff: { email: 'staff@demo.com', role: 'staff', password: 'staff123' },
        admin: { email: 'admin@demo.com', role: 'admin', password: 'admin123' }
    };
    
    const account = demoAccounts[type];
    if (account) {
        document.getElementById('email').value = account.email;
        document.getElementById('role').value = account.role;
        document.getElementById('password').value = account.password;
    }
}

// Make fillDemoAccount available globally for testing
window.fillDemoAccount = fillDemoAccount;