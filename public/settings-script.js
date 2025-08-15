// Enhanced Settings Page JavaScript - Main Script (Refactored)
import { SETTINGS_CONFIG } from './settings-constants.js';
import { SettingsValidator, FormErrorHandler, formatPhone, updatePasswordStrength } from './settings-validation.js';
import { SettingsFormManager, closeSuccessModal } from './settings-api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings page
    const settingsApp = new SettingsApp();
    settingsApp.init();
});

class SettingsApp {
    constructor() {
        this.currentTab = 'profile';
        this.formManager = null;
        this.backgroundManager = null;
        
        // Get all DOM elements
        this.elements = this.getElements();
    }
    
    getElements() {
        return {
            // Tabs
            tabButtons: document.querySelectorAll('.tab-button'),
            tabPanels: document.querySelectorAll('.tab-panel'),
            
            // Profile form
            profileForm: document.getElementById('profileForm'),
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            profileEmail: document.getElementById('profileEmail'),
            profilePhone: document.getElementById('profilePhone'),
            department: document.getElementById('department'),
            saveProfile: document.getElementById('saveProfile'),
            cancelProfile: document.getElementById('cancelProfile'),
            
            // Password form
            passwordForm: document.getElementById('passwordForm'),
            currentPassword: document.getElementById('currentPassword'),
            newPassword: document.getElementById('newPassword'),
            confirmPassword: document.getElementById('confirmPassword'),
            strengthFill: document.getElementById('strengthFill'),
            strengthText: document.getElementById('strengthText'),
            savePassword: document.getElementById('savePassword'),
            cancelPassword: document.getElementById('cancelPassword'),
            
            // Preferences form
            preferencesForm: document.getElementById('preferencesForm'),
            savePreferences: document.getElementById('savePreferences'),
            cancelPreferences: document.getElementById('cancelPreferences'),
            
            // Modal and UI
            successModal: document.getElementById('successModal'),
            successTitle: document.getElementById('successTitle'),
            successMessage: document.getElementById('successMessage'),
            userAvatarLarge: document.getElementById('userAvatarLarge')
        };
    }
    
    init() {
        this.initUrbanSketch();
        this.initBackgroundEffects();
        this.initFormManager();
        this.setupEventListeners();
        this.setupPasswordToggles();
        this.setupFormValidation();
        this.loadData();
        this.switchTab('profile');
    }
    
    initUrbanSketch() {
        const urbanSketchLayer = document.getElementById('urbanSketch');
        if (urbanSketchLayer && typeof createUrbanSketchSVG === 'function') {
            urbanSketchLayer.innerHTML = createUrbanSketchSVG('signup', SETTINGS_CONFIG.themes.primary);
        }
    }
    
    initBackgroundEffects() {
        this.backgroundManager = new SettingsBackgroundManager();
    }
    
    initFormManager() {
        this.formManager = new SettingsFormManager(this.elements);
    }
    
    setupEventListeners() {
        // Tab switching
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(button.dataset.tab);
            });
        });

        // Form submissions
        if (this.elements.profileForm) {
            this.elements.profileForm.addEventListener('submit', (e) => this.formManager.handleProfileSubmit(e));
        }
        
        if (this.elements.passwordForm) {
            this.elements.passwordForm.addEventListener('submit', (e) => this.formManager.handlePasswordSubmit(e));
        }
        
        if (this.elements.preferencesForm) {
            this.elements.preferencesForm.addEventListener('submit', (e) => this.formManager.handlePreferencesSubmit(e));
        }

        // Cancel buttons
        this.elements.cancelProfile?.addEventListener('click', () => this.formManager.resetProfileForm());
        this.elements.cancelPassword?.addEventListener('click', () => this.formManager.resetPasswordForm());
        this.elements.cancelPreferences?.addEventListener('click', () => this.formManager.resetPreferencesForm());

        // Modal events
        this.elements.successModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.successModal || e.target.classList.contains('success-modal-overlay')) {
                closeSuccessModal();
            }
        });

        // Phone formatting
        this.elements.profilePhone?.addEventListener('input', (e) => {
            e.target.value = formatPhone(e.target.value);
        });

        // Password strength
        this.elements.newPassword?.addEventListener('input', () => {
            updatePasswordStrength(this.elements.newPassword.value, this.elements.strengthFill, this.elements.strengthText);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    setupPasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.dataset.target;
                const input = document.getElementById(targetId);
                
                if (input) {
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    
                    const eyeOpen = toggle.querySelector('.eye-open');
                    const eyeClosed = toggle.querySelector('.eye-closed');
                    
                    if (eyeOpen && eyeClosed) {
                        eyeOpen.style.display = isPassword ? 'none' : 'block';
                        eyeClosed.style.display = isPassword ? 'block' : 'none';
                    }
                }
            });
        });
    }
    
    setupFormValidation() {
        // Profile validation
        ['firstName', 'lastName', 'profileEmail'].forEach(fieldName => {
            const input = this.elements[fieldName];
            if (input) {
                ['input', 'blur'].forEach(event => {
                    input.addEventListener(event, () => {
                        const result = SettingsValidator.validateProfileField(input);
                        if (result.isValid) {
                            FormErrorHandler.hideError(input.name);
                        } else if (result.error) {
                            FormErrorHandler.showError(input.name, result.error);
                        }
                    });
                });
            }
        });

        // Password validation
        ['currentPassword', 'newPassword', 'confirmPassword'].forEach(fieldName => {
            const input = this.elements[fieldName];
            if (input) {
                ['input', 'blur'].forEach(event => {
                    input.addEventListener(event, () => {
                        const result = SettingsValidator.validatePasswordField(input, this.elements);
                        if (result.isValid) {
                            FormErrorHandler.hideError(input.name);
                        } else if (result.error) {
                            FormErrorHandler.showError(input.name, result.error);
                        }
                    });
                });
            }
        });
    }
    
    switchTab(tabId) {
        this.currentTab = tabId;
        
        // Update tab buttons
        this.elements.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });
        
        // Update tab panels
        this.elements.tabPanels.forEach(panel => {
            const isActive = panel.id === tabId;
            panel.classList.toggle('active', isActive);
            panel.style.display = isActive ? 'block' : 'none';
        });
        
        // Animate active panel
        const activePanel = document.getElementById(tabId);
        if (activePanel) {
            activePanel.style.animation = 'none';
            activePanel.offsetHeight; // Force reflow
            activePanel.style.animation = 'fadeInUp 0.5s ease-out';
        }
    }
    
    loadData() {
        this.formManager.loadUserData();
        this.formManager.loadPreferences();
    }
    
    handleKeyboardShortcuts(e) {
        if (e.key === 'Escape') {
            closeSuccessModal();
        }
        
        // Tab switching shortcuts
        if (e.ctrlKey) {
            if (e.key === '1') {
                e.preventDefault();
                this.switchTab('profile');
            } else if (e.key === '2') {
                e.preventDefault();
                this.switchTab('security');
            } else if (e.key === '3') {
                e.preventDefault();
                this.switchTab('preferences');
            }
        }
    }
    
    destroy() {
        this.backgroundManager?.destroy();
    }
}

// Background effects manager
class SettingsBackgroundManager {
    constructor() {
        this.container = document.getElementById('backgroundParticles');
        this.particles = [];
        this.animationId = null;
        this.isVisible = true;
        
        if (this.container && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.init();
        }
    }
    
    init() {
        this.createParticles();
        this.animate();
    }
    
    createParticles() {
        const count = window.innerWidth < 768 
            ? SETTINGS_CONFIG.animations.particleCount.mobile 
            : SETTINGS_CONFIG.animations.particleCount.desktop;
            
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 3 + 2;
            const color = SETTINGS_CONFIG.animations.colors[Math.floor(Math.random() * SETTINGS_CONFIG.animations.colors.length)];
            
            const data = {
                element: particle,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size,
                color,
                life: Math.random() * 200,
                maxLife: SETTINGS_CONFIG.animations.particleLifetime.min + 
                        Math.random() * (SETTINGS_CONFIG.animations.particleLifetime.max - SETTINGS_CONFIG.animations.particleLifetime.min)
            };
            
            Object.assign(particle.style, {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                transform: `translate(${data.x}px, ${data.y}px)`,
                pointerEvents: 'none',
                borderRadius: '50%',
                opacity: '0.4',
                boxShadow: `0 0 ${size * 3}px ${color}40`
            });
            
            this.container.appendChild(particle);
            this.particles.push(data);
        }
    }
    
    animate() {
        if (!this.isVisible) return;
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life += 1;
            
            // Wrap around edges
            if (particle.x < -particle.size) particle.x = window.innerWidth + particle.size;
            if (particle.x > window.innerWidth + particle.size) particle.x = -particle.size;
            if (particle.y < -particle.size) particle.y = window.innerHeight + particle.size;
            if (particle.y > window.innerHeight + particle.size) particle.y = -particle.size;
            
            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
            
            if (particle.life >= particle.maxLife) {
                particle.life = 0;
                particle.x = Math.random() * window.innerWidth;
                particle.y = Math.random() * window.innerHeight;
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.particles.forEach(p => p.element.remove());
    }
}

// Enhanced button interactions
document.addEventListener('click', function(e) {
    if (e.target.matches('button') && !e.target.disabled) {
        const button = e.target;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.4);
            transform: scale(0); animation: ripple 0.6s ease-out; width: ${size}px; height: ${size}px;
            left: ${x}px; top: ${y}px; pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.settingsApp) {
        window.settingsApp.destroy();
    }
});

console.log('OneStep Urban Solve - Settings page loaded successfully (modular)');