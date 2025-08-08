// Enhanced Signup Page JavaScript with Urban Sketches
document.addEventListener('DOMContentLoaded', function() {
    // Initialize urban sketch background
    initUrbanSketch();
    
    // Form elements
    const form = document.getElementById('signupForm');
    const submitButton = document.getElementById('submitButton');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const successModal = document.getElementById('successModal');

    // Form inputs
    const inputs = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        nid: document.getElementById('nid'),
        phone: document.getElementById('phone'),
        role: document.getElementById('role'),
        password: passwordInput,
        terms: document.getElementById('terms')
    };

    // Error elements
    const errorElements = {
        name: document.getElementById('nameError'),
        email: document.getElementById('emailError'),
        nid: document.getElementById('nidError'),
        phone: document.getElementById('phoneError'),
        role: document.getElementById('roleError'),
        password: document.getElementById('passwordError'),
        terms: document.getElementById('termsError')
    };

    // Initialize urban sketch background
    function initUrbanSketch() {
        const urbanSketchLayer = document.getElementById('urbanSketch');
        if (urbanSketchLayer && typeof createUrbanSketchSVG === 'function') {
            urbanSketchLayer.innerHTML = createUrbanSketchSVG('signup', '#10b981');
        }
    }

    // Enhanced Background Manager for Signup
    class SignupBackgroundManager {
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
            const count = window.innerWidth < 768 ? 15 : 25;
            const colors = ['#10b981', '#4299e1', '#34d399', '#059669', '#065f46', '#6ee7b7'];
            
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 4 + 2;
                const data = {
                    element: particle,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: size,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: Math.random() * 200,
                    maxLife: 300 + Math.random() * 200
                };
                
                Object.assign(particle.style, {
                    position: 'absolute',
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: data.color,
                    transform: `translate(${data.x}px, ${data.y}px)`,
                    pointerEvents: 'none',
                    willChange: 'transform',
                    boxShadow: `0 0 ${size * 2}px ${data.color}40`
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
                particle.x += particle.vx * deltaTime * 0.1;
                particle.y += particle.vy * deltaTime * 0.1;
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
    const backgroundManager = new SignupBackgroundManager();

    // Update password strength indicator
    function updatePasswordStrength(password) {
        if (!strengthFill || !strengthText) return;
        
        const result = FormUtils.checkPasswordStrength(password);
        
        strengthFill.className = `strength-fill ${result.level}`;
        strengthText.textContent = result.text;
    }

    // Handle input changes with formatting and validation
    function handleInputChange(field, input) {
        input.addEventListener('input', (e) => {
            let value = e.target.value;
            
            // Auto-formatting
            if (field === 'nid') {
                value = FormUtils.formatters.nid(value);
                input.value = value;
            } else if (field === 'phone') {
                value = FormUtils.formatters.phone(value);
                input.value = value;
            } else if (field === 'password') {
                updatePasswordStrength(value);
            }
            
            FormUtils.validateField(field, field === 'terms' ? input.checked : value, errorElements, inputs);
        });

        if (field === 'terms') {
            input.addEventListener('change', (e) => {
                FormUtils.validateField(field, e.target.checked, errorElements, inputs);
            });
        }
    }

    // Setup real-time validation for all inputs
    Object.keys(inputs).forEach(field => {
        const input = inputs[field];
        if (input) {
            handleInputChange(field, input);
        }
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
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            nid: formData.get('nid'),
            phone: formData.get('phone'),
            role: formData.get('role'),
            password: formData.get('password'),
            terms: formData.get('terms') === 'on'
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success modal
            showSuccessModal(data);
            
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    });

    // Success modal functions
    function showSuccessModal(userData) {
        const messageEl = document.getElementById('successMessage');
        if (messageEl) {
            messageEl.textContent = `Welcome to OneStep Urban Solve, ${userData.name}! Your ${userData.role} account has been created.`;
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

    // Enhanced button interactions
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.disabled) return;
            FormUtils.addRippleEffect(this, e);
        });
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (backgroundManager) {
            backgroundManager.destroy();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && successModal && successModal.style.display === 'block') {
            closeSuccessModal();
        }
        
        if (e.key === 'Enter' && e.target.form === form && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            form.requestSubmit();
        }
    });

    console.log('Signup page loaded successfully with urban sketches');
});