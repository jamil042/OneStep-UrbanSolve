// Enhanced Homepage JavaScript with Improved Animations and Interactions
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const hamburger = document.getElementById('hamburger');

    // Enhanced Mobile Menu Toggle
    if (mobileMenuBtn && mobileNav && hamburger) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
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

    // Enhanced Animated Background Manager
    class EnhancedBackgroundManager {
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
            
            // Enhanced responsive particle count
            if (width < 480) return Math.min(15, Math.floor(area / 50000)); // Mobile
            if (width < 768) return Math.min(20, Math.floor(area / 40000)); // Tablet
            if (width < 1024) return Math.min(25, Math.floor(area / 35000)); // Small desktop
            return Math.min(30, Math.floor(area / 30000)); // Large desktop
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
            
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Enhanced size based on screen size
            let size;
            if (width < 480) {
                size = Math.random() * 3 + 2; // 2-5px on mobile
            } else if (width < 768) {
                size = Math.random() * 4 + 2; // 2-6px on tablet
            } else {
                size = Math.random() * 5 + 3; // 3-8px on desktop
            }
            
            // Enhanced color variations with lighter tones
            const colors = [
                '#4299e1', '#48bb78', '#9f7aea', '#ed8936', 
                '#f56565', '#38b2ac', '#ed64a6', '#9ae6b4',
                '#667eea', '#764ba2', '#f093fb', '#4facfe'
            ];
            
            const particleData = {
                element: particle,
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * (width < 768 ? 0.4 : 0.6),
                vy: (Math.random() - 0.5) * (width < 768 ? 0.4 : 0.6),
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.4,
                rotationSpeed: (Math.random() - 0.5) * 2,
                rotation: 0,
                life: Math.random() * 100,
                maxLife: 200 + Math.random() * 150,
                pulseSpeed: Math.random() * 2 + 1,
                pulseOffset: Math.random() * Math.PI * 2
            };
            
            // Enhanced styling
            Object.assign(particle.style, {
                position: 'absolute',
                width: `${particleData.size}px`,
                height: `${particleData.size}px`,
                backgroundColor: particleData.color,
                borderRadius: '50%',
                opacity: particleData.opacity,
                transform: `translate(${particleData.x}px, ${particleData.y}px)`,
                pointerEvents: 'none',
                willChange: 'transform, opacity',
                boxShadow: `0 0 ${particleData.size * 2}px ${particleData.color}40`,
                filter: 'blur(0.5px)'
            });
            
            this.particlesContainer.appendChild(particle);
            this.particles.push(particleData);
        }
        
        updateParticles(deltaTime) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const time = performance.now() * 0.001;
            
            this.particles.forEach((particle, index) => {
                // Enhanced movement with wave motion
                particle.x += particle.vx * deltaTime * 0.1;
                particle.y += particle.vy * deltaTime * 0.1 + Math.sin(time * particle.pulseSpeed + particle.pulseOffset) * 0.5;
                particle.rotation += particle.rotationSpeed * deltaTime * 0.1;
                particle.life += deltaTime * 0.01;
                
                // Boundary checking with wrapping
                if (particle.x < -particle.size) particle.x = width + particle.size;
                if (particle.x > width + particle.size) particle.x = -particle.size;
                if (particle.y < -particle.size) particle.y = height + particle.size;
                if (particle.y > height + particle.size) particle.y = -particle.size;
                
                // Enhanced opacity variation with pulsing
                const lifeProgress = particle.life / particle.maxLife;
                const pulse = Math.sin(time * particle.pulseSpeed + particle.pulseOffset) * 0.3 + 0.7;
                let opacity = particle.opacity * pulse;
                
                if (lifeProgress > 0.8) {
                    opacity *= (1 - (lifeProgress - 0.8) * 5);
                }
                
                // Enhanced transform with scale pulsing
                const scale = 0.8 + pulse * 0.4;
                const transform = `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg) scale(${scale})`;
                particle.element.style.transform = transform;
                particle.element.style.opacity = Math.max(0, opacity);
                
                // Reset particle if life exceeded
                if (particle.life >= particle.maxLife) {
                    particle.x = Math.random() * width;
                    particle.y = Math.random() * height;
                    particle.life = 0;
                    particle.vx = (Math.random() - 0.5) * (width < 768 ? 0.4 : 0.6);
                    particle.vy = (Math.random() - 0.5) * (width < 768 ? 0.4 : 0.6);
                    particle.pulseOffset = Math.random() * Math.PI * 2;
                }
            });
        }
        
        animate(currentTime) {
            if (!this.isTabVisible || this.prefersReducedMotion) return;
            
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // Adaptive frame rate
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
            this.createParticles();
        }
        
        destroy() {
            this.stopAnimation();
            this.clearParticles();
        }
    }

    // Initialize enhanced background manager
    const backgroundManager = new EnhancedBackgroundManager();

    // Enhanced smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                // Enhanced smooth scrolling with easing
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = Math.min(Math.abs(distance) * 0.5, 1000);
                let start = null;

                function step(timestamp) {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / duration, 1);
                    
                    // Easing function for smoother animation
                    const ease = progress < 0.5 
                        ? 4 * progress * progress * progress 
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                    
                    window.scrollTo(0, startPosition + distance * ease);
                    
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    }
                }
                
                requestAnimationFrame(step);
            }
        });
    });

    // Enhanced header effects with scroll
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    let ticking = false;

    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollProgress = Math.min(scrollTop / 200, 1);
        
        // Enhanced backdrop blur and shadow based on scroll
        const blurAmount = 8 + (scrollProgress * 8);
        const shadowOpacity = 0.06 + (scrollProgress * 0.1);
        
        header.style.backdropFilter = `blur(${blurAmount}px)`;
        header.style.boxShadow = `0 1px 3px 0 rgba(0, 0, 0, ${shadowOpacity})`;
        
        // Add background opacity change
        const bgOpacity = 0.95 + (scrollProgress * 0.05);
        header.style.backgroundColor = `rgba(255, 255, 255, ${bgOpacity})`;
        
        lastScrollTop = scrollTop;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });

    // Enhanced intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add staggered animation for children if they exist
                const children = entry.target.querySelectorAll('.feature-card, .role-card');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, index * 100);
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation with better selectors
    const animatedElements = document.querySelectorAll('.features, .user-roles, .cta-section');
    animatedElements.forEach(function(element, index) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.8s ease-out ${index * 0.2}s, transform 0.8s ease-out ${index * 0.2}s`;
        observer.observe(element);
    });

    // Enhanced counter animation with better easing
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(function(counter) {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2500; // Longer duration for smoother animation
            const frameDuration = 1000 / 60; // 60fps
            const totalFrames = Math.round(duration / frameDuration);
            let frame = 0;
            
            const timer = setInterval(function() {
                frame++;
                const progress = frame / totalFrames;
                
                // Enhanced easing function (ease-out-cubic)
                const easeOutProgress = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(target * easeOutProgress);
                
                // Format numbers with appropriate suffixes
                if (target === 500) {
                    counter.textContent = current.toLocaleString() + '+';
                } else if (target === 1200) {
                    counter.textContent = current.toLocaleString() + '+';
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

    // Enhanced stats animation trigger
    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        const statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        animateCounters();
                    }, 300); // Delay for better visual effect
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // Enhanced button interactions with ripple effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                z-index: 1;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            // Enhanced button feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => { 
                this.style.transform = ''; 
            }, 150);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
        
        // Enhanced hover effects
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Enhanced card hover effects
    const cards = document.querySelectorAll('.feature-card, .role-card');
    let hoverTimeout;
    
    cards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Add glow effect
            this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(66, 153, 225, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            }, 50);
        });
    });

    // Enhanced parallax effect for hero background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero-background');
        
        if (heroBackground && scrolled < window.innerHeight) {
            const rate = scrolled * -0.3;
            heroBackground.style.transform = `translateY(${rate}px)`;
        }
    });

    // Performance monitoring and cleanup
    window.addEventListener('beforeunload', function() {
        if (backgroundManager) {
            backgroundManager.destroy();
        }
    });

    // Enhanced resize handler
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Close mobile menu on resize to larger screen
            if (window.innerWidth >= 768) {
                mobileNav.classList.remove('active');
                hamburger.classList.remove('active');
            }
            
            // Update header effects
            updateHeader();
        }, 250);
    });

    // Enhanced keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
        
        // Enhanced Enter key handling
        if (e.key === 'Enter' && e.target.classList.contains('btn')) {
            e.target.click();
        }
        
        // Arrow key navigation for cards
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            const focusableCards = document.querySelectorAll('.feature-card, .role-card');
            const currentIndex = Array.from(focusableCards).indexOf(document.activeElement);
            
            if (currentIndex !== -1) {
                e.preventDefault();
                const nextIndex = e.key === 'ArrowDown' 
                    ? Math.min(currentIndex + 1, focusableCards.length - 1)
                    : Math.max(currentIndex - 1, 0);
                
                focusableCards[nextIndex].focus();
            }
        }
    });

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .feature-card, .role-card {
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .feature-card:focus, .role-card:focus {
            outline: 2px solid #4299e1;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);

    console.log('OneStep Urban Solve - Enhanced homepage loaded successfully');
});

// Enhanced utility functions
function scrollToTop() {
    const startPosition = window.pageYOffset;
    const duration = Math.min(startPosition * 0.5, 1000);
    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        
        // Smooth easing
        const ease = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, startPosition * (1 - ease));
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    
    requestAnimationFrame(step);
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

// Lazy loading enhancement
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
        }, {
            rootMargin: '50px 0px'
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

// Enhanced performance monitoring
if ('PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
                console.log('LCP:', entry.startTime);
            }
        }
    });
    
    try {
        perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
        // Silently handle unsupported browsers
    }
}