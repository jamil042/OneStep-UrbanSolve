// Mobile Menu Toggle and Responsive Background Management
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const hamburger = document.getElementById('hamburger');

    if (mobileMenuBtn && mobileNav && hamburger) {
        mobileMenuBtn.addEventListener('click', function() {
            // Toggle mobile menu visibility
            mobileNav.classList.toggle('active');
            
            // Toggle hamburger animation
            hamburger.classList.toggle('active');
        });

        // Close mobile menu when clicking on navigation links
        const mobileNavLinks = document.querySelectorAll('.nav-mobile-link');
        mobileNavLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideMenu = mobileNav.contains(event.target);
            const isClickOnMenuButton = mobileMenuBtn.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnMenuButton && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }

    // Responsive Animated Background Manager
    class ResponsiveBackgroundManager {
        constructor() {
            this.particlesContainer = document.getElementById('backgroundParticles');
            this.particles = [];
            this.animationId = null;
            this.lastTime = 0;
            this.isTabVisible = true;
            this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            this.init();
            this.setupEventListeners();
        }
        
        init() {
            if (this.prefersReducedMotion || !this.particlesContainer) return;
            
            this.createParticles();
            this.startAnimation();
        }
        
        setupEventListeners() {
            // Handle window resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 250);
            });
            
            // Handle tab visibility changes for performance
            document.addEventListener('visibilitychange', () => {
                this.isTabVisible = !document.hidden;
                if (this.isTabVisible && !this.animationId) {
                    this.startAnimation();
                } else if (!this.isTabVisible && this.animationId) {
                    this.stopAnimation();
                }
            });
            
            // Handle reduced motion preference changes
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            motionQuery.addEventListener('change', (e) => {
                this.prefersReducedMotion = e.matches;
                if (e.matches) {
                    this.stopAnimation();
                    this.clearParticles();
                } else {
                    this.init();
                }
            });
        }
        
        getParticleCount() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const area = width * height;
            
            // Responsive particle count based on screen size and device capability
            if (width < 480) return Math.min(8, Math.floor(area / 50000)); // Mobile
            if (width < 768) return Math.min(12, Math.floor(area / 40000)); // Tablet
            if (width < 1024) return Math.min(16, Math.floor(area / 35000)); // Small desktop
            return Math.min(20, Math.floor(area / 30000)); // Large desktop
        }
        
        createParticles() {
            if (!this.particlesContainer) return;
            
            this.clearParticles();
            const particleCount = this.getParticleCount();
            
            for (let i = 0; i < particleCount; i++) {
                this.createParticle(i);
            }
        }
        
        createParticle(index) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Responsive particle properties
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Size based on screen size
            let size;
            if (width < 480) {
                size = Math.random() * 2 + 1; // 1-3px on mobile
            } else if (width < 768) {
                size = Math.random() * 3 + 1; // 1-4px on tablet
            } else {
                size = Math.random() * 4 + 2; // 2-6px on desktop
            }
            
            // Color variations
            const colors = [
                '#3b82f6', '#8b5cf6', '#10b981', 
                '#f59e0b', '#ef4444', '#06b6d4',
                '#ec4899', '#84cc16'
            ];
            
            // Particle properties
            const particleData = {
                element: particle,
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * (width < 768 ? 0.3 : 0.5),
                vy: (Math.random() - 0.5) * (width < 768 ? 0.3 : 0.5),
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.4 + 0.2,
                rotationSpeed: (Math.random() - 0.5) * 2,
                rotation: 0,
                life: Math.random() * 100,
                maxLife: 200 + Math.random() * 100
            };
            
            // Apply styles
            Object.assign(particle.style, {
                position: 'absolute',
                width: `${particleData.size}px`,
                height: `${particleData.size}px`,
                backgroundColor: particleData.color,
                borderRadius: '50%',
                opacity: particleData.opacity,
                transform: `translate(${particleData.x}px, ${particleData.y}px)`,
                pointerEvents: 'none',
                willChange: 'transform, opacity'
            });
            
            this.particlesContainer.appendChild(particle);
            this.particles.push(particleData);
        }
        
        updateParticles(deltaTime) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            this.particles.forEach((particle, index) => {
                // Update position
                particle.x += particle.vx * deltaTime * 0.1;
                particle.y += particle.vy * deltaTime * 0.1;
                particle.rotation += particle.rotationSpeed * deltaTime * 0.1;
                particle.life += deltaTime * 0.01;
                
                // Boundary checking with wrapping
                if (particle.x < -particle.size) particle.x = width + particle.size;
                if (particle.x > width + particle.size) particle.x = -particle.size;
                if (particle.y < -particle.size) particle.y = height + particle.size;
                if (particle.y > height + particle.size) particle.y = -particle.size;
                
                // Opacity variation
                const lifeProgress = particle.life / particle.maxLife;
                let opacity = particle.opacity;
                
                if (lifeProgress > 0.8) {
                    opacity *= (1 - (lifeProgress - 0.8) * 5);
                }
                
                // Apply transform with better performance
                const transform = `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg)`;
                particle.element.style.transform = transform;
                particle.element.style.opacity = Math.max(0, opacity);
                
                // Reset particle if life exceeded
                if (particle.life >= particle.maxLife) {
                    particle.x = Math.random() * width;
                    particle.y = Math.random() * height;
                    particle.life = 0;
                    particle.vx = (Math.random() - 0.5) * (width < 768 ? 0.3 : 0.5);
                    particle.vy = (Math.random() - 0.5) * (width < 768 ? 0.3 : 0.5);
                }
            });
        }
        
        animate(currentTime) {
            if (!this.isTabVisible || this.prefersReducedMotion) return;
            
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // Throttle animation to 30fps on mobile for better performance
            const targetFPS = window.innerWidth < 768 ? 30 : 60;
            const frameDuration = 1000 / targetFPS;
            
            if (deltaTime >= frameDuration) {
                this.updateParticles(deltaTime);
            }
            
            this.animationId = requestAnimationFrame((time) => this.animate(time));
        }
        
        startAnimation() {
            if (!this.animationId) {
                this.lastTime = performance.now();
                this.animationId = requestAnimationFrame((time) => this.animate(time));
            }
        }
        
        stopAnimation() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
        
        clearParticles() {
            this.particles.forEach(particle => {
                if (particle.element && particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
            });
            this.particles = [];
        }
        
        handleResize() {
            // Recreate particles with new count for new screen size
            this.createParticles();
        }
        
        destroy() {
            this.stopAnimation();
            this.clearParticles();
        }
    }

    // Initialize responsive background manager
    const backgroundManager = new ResponsiveBackgroundManager();

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Enhanced scroll effects for header
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    let ticking = false;

    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            header.style.backdropFilter = 'blur(12px)';
        } else {
            header.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            header.style.backdropFilter = 'blur(8px)';
        }
        
        lastScrollTop = scrollTop;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });

    // Intersection observer for animations with better performance
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation with staggered delays
    const animatedElements = document.querySelectorAll('.feature-card, .role-card');
    animatedElements.forEach(function(element, index) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        observer.observe(element);
    });

    // Enhanced counter animation with better performance
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(function(counter) {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const frameDuration = 1000 / 60; // 60fps
            const totalFrames = Math.round(duration / frameDuration);
            let frame = 0;
            
            const timer = setInterval(function() {
                frame++;
                const progress = frame / totalFrames;
                const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                const current = Math.round(target * easeOutProgress);
                
                if (target === 500) {
                    counter.textContent = current + '+';
                } else if (target === 1200) {
                    counter.textContent = current + '+';
                } else if (target === 24) {
                    counter.textContent = current + 'hrs';
                }
                
                if (frame >= totalFrames) {
                    clearInterval(timer);
                    // Final values
                    if (target === 500) counter.textContent = '500+';
                    else if (target === 1200) counter.textContent = '1,200+';
                    else if (target === 24) counter.textContent = '24hrs';
                }
            }, frameDuration);
        });
    }

    // Trigger counter animation when stats section is visible
    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        const statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
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
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
            
            // Handle different button actions
            if (buttonText.includes('Report an Issue')) {
                console.log('Redirecting to complaint form...');
                this.style.transform = 'scale(0.95)';
                setTimeout(() => { this.style.transform = ''; }, 150);
            } else if (buttonText.includes('Track Complaints')) {
                console.log('Redirecting to complaint tracking...');
            } else if (buttonText.includes('Sign In')) {
                console.log('Opening sign in modal...');
            } else if (buttonText.includes('Get Started')) {
                console.log('Redirecting to signup page...');
                window.location.href = 'signup.html';
            }
        });
    });

    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Add enhanced hover effects for cards with throttling
    const cards = document.querySelectorAll('.feature-card, .role-card');
    let hoverTimeout;
    
    cards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                this.style.transform = 'translateY(0) scale(1)';
            }, 50);
        });
    });

    // Performance monitoring and cleanup
    window.addEventListener('beforeunload', function() {
        if (backgroundManager) {
            backgroundManager.destroy();
        }
    });

    // Add resize handler for responsive behavior
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Close mobile menu on resize to larger screen
            if (window.innerWidth >= 768) {
                mobileNav.classList.remove('active');
                hamburger.classList.remove('active');
            }
            
            // Update header backdrop filter on resize
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 100) {
                header.style.backdropFilter = 'blur(12px)';
            }
        }, 250);
    });

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            const mobileNav = document.getElementById('mobileNav');
            const hamburger = document.getElementById('hamburger');
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
        
        // Enter key on buttons triggers click
        if (e.key === 'Enter' && e.target.classList.contains('btn')) {
            e.target.click();
        }
    });

    console.log('OneStep Urban Solve - Enhanced responsive homepage loaded successfully');
});

// Utility functions with better error handling
function scrollToTop() {
    try {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (e) {
        window.scrollTo(0, 0);
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
}

// Lazy loading for better performance
function addLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(function(img) {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        images.forEach(function(img) {
            img.src = img.dataset.src;
        });
    }
}

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}