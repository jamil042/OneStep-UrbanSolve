// Enhanced Staff Dashboard JavaScript with Fixed Navigation and Dummy Data
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Dashboard state
    let complaintsData = [];
    let selectedComplaint = null;
    let currentSort = { field: 'assignedAt', direction: 'desc' };
    let currentSection = 'dashboard';
    
    // DOM elements
    const elements = {
        userName: document.getElementById('userName'),
        welcomeTitle: document.getElementById('welcomeTitle'),
        dropdownToggle: document.getElementById('dropdownToggle'),
        dropdownMenu: document.getElementById('dropdownMenu'),
        mobileMenuBtn: document.getElementById('mobileMenuBtn'),
        mobileNav: document.getElementById('mobileNav'),
        hamburger: document.getElementById('hamburger'),
        
        // Navigation
        navLinks: document.querySelectorAll('.nav-link'),
        
        // Complaints table
        complaintsTableBody: document.getElementById('complaintsTableBody'),
        emptyState: document.getElementById('emptyState'),
        loadingState: document.getElementById('loadingState'),
        
        // Update form
        updateForm: document.getElementById('updateForm'),
        noSelectionState: document.getElementById('noSelectionState'),
        selectedNumber: document.getElementById('selectedNumber'),
        complaintInfo: document.getElementById('complaintInfo'),
        updateStatus: document.getElementById('updateStatus'),
        updateNotes: document.getElementById('updateNotes'),
        charCount: document.getElementById('charCount'),
        submitUpdate: document.getElementById('submitUpdate'),
        
        // Stats
        assignedCount: document.getElementById('assignedCount'),
        resolvedCount: document.getElementById('resolvedCount'),
        pendingCount: document.getElementById('pendingCount'),
        
        // Buttons
        refreshBtn: document.getElementById('refreshBtn'),
        successModal: document.getElementById('successModal'),
        
        // Info fields
        infoTitle: document.getElementById('infoTitle'),
        infoDescription: document.getElementById('infoDescription')
    };

    // Initialize dashboard
    function initializeDashboard() {
        initUrbanSketch();
        initBackgroundEffects();
        loadUserData();
        generateDummyComplaints();
        loadComplaints();
        setupEventListeners();
        updateStats();
        showSection('dashboard');
    }

    // Initialize urban sketch background
    function initUrbanSketch() {
        const urbanSketchLayer = document.getElementById('urbanSketch');
        if (urbanSketchLayer && typeof createUrbanSketchSVG === 'function') {
            urbanSketchLayer.innerHTML = createUrbanSketchSVG('home', '#3b82f6');
        }
    }

    // Background effects manager
    class DashboardBackgroundManager {
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
            const count = window.innerWidth < 768 ? 12 : 20;
            const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
            
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 3 + 2;
                const data = {
                    element: particle,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: size,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: Math.random() * 200,
                    maxLife: 400 + Math.random() * 200
                };
                
                Object.assign(particle.style, {
                    position: 'absolute',
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: data.color,
                    transform: `translate(${data.x}px, ${data.y}px)`,
                    pointerEvents: 'none',
                    borderRadius: '50%',
                    opacity: '0.6',
                    boxShadow: `0 0 ${size * 2}px ${data.color}40`
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

    function initBackgroundEffects() {
        window.backgroundManager = new DashboardBackgroundManager();
    }

    // Load user data
    function loadUserData() {
        const userData = JSON.parse(localStorage.getItem('staffUserData') || '{}');
        const staffName = userData.name || 'Staff Member';
        
        if (elements.userName) {
            elements.userName.textContent = staffName;
        }
        
        if (elements.welcomeTitle) {
            elements.welcomeTitle.textContent = `Hello, ${staffName}!`;
        }

        // Set user avatar initials
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && staffName !== 'Staff Member') {
            const initials = staffName.split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.innerHTML = `<span style="font-weight: 600; font-size: 0.875rem;">${initials}</span>`;
        }
    }

    // Generate realistic dummy complaints
    function generateDummyComplaints() {
        const complaints = [
            {
                id: 'COMP-2025-001',
                title: 'Large pothole on Main Street causing vehicle damage',
                description: 'There is a significant pothole approximately 2 feet in diameter on Main Street between 5th and 6th Avenue. Multiple vehicles have reported tire damage. The hole appears to be getting deeper with recent rain.',
                location: 'Main Street between 5th & 6th Ave',
                priority: 'high',
                status: 'pending',
                assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
                citizenName: 'Sarah Johnson',
                citizenEmail: 'sarah.j@email.com',
                lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'COMP-2025-002',
                title: 'Broken streetlight creating safety hazard',
                description: 'The streetlight at the intersection of Oak Avenue and 3rd Street has been out for several days. This intersection gets quite dark at night and pedestrians have difficulty crossing safely.',
                location: 'Oak Avenue & 3rd Street intersection',
                priority: 'medium',
                status: 'in-progress',
                assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                citizenName: 'Michael Chen',
                citizenEmail: 'mchen@email.com',
                lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'COMP-2025-003',
                title: 'Missed garbage collection in Residential Zone 3',
                description: 'Garbage trucks missed our entire block on scheduled pickup day (Tuesday). Bins are still full and attracting pests. This is the second week in a row this has happened.',
                location: 'Maple Street 200-300 block, Residential Zone 3',
                priority: 'medium',
                status: 'pending',
                assignedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
                reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                citizenName: 'Emily Rodriguez',
                citizenEmail: 'emily.r@email.com',
                lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
                id: 'COMP-2025-004',
                title: 'Water leak near City Park fountain',
                description: 'Noticed a significant water leak coming from the underground pipes near the main fountain in City Park. Water is pooling and may be creating slip hazards. Also seems wasteful during drought season.',
                location: 'Central City Park, near main fountain',
                priority: 'high',
                status: 'on-hold',
                assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                citizenName: 'David Park',
                citizenEmail: 'dpark@email.com',
                lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'COMP-2025-005',
                title: 'Cracked sidewalk near Lincoln Elementary',
                description: 'Large cracks in the sidewalk right in front of Lincoln Elementary School. Children are tripping and parents are concerned about safety during drop-off and pickup.',
                location: 'Lincoln Elementary School front entrance',
                priority: 'high',
                status: 'resolved',
                assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
                reportedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                citizenName: 'Lisa Thompson',
                citizenEmail: 'lthompson@email.com',
                lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'COMP-2025-006',
                title: 'Graffiti on City Hall building needs removal',
                description: 'Someone spray painted graffiti on the east side of City Hall building overnight. It\'s quite visible from the street and should be cleaned as soon as possible.',
                location: 'City Hall building, east wall',
                priority: 'low',
                status: 'pending',
                assignedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
                reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
                citizenName: 'Robert Kim',
                citizenEmail: 'rkim@email.com',
                lastUpdated: new Date(Date.now() - 45 * 60 * 1000).toISOString()
            }
        ];

        complaintsData = complaints;
    }

    // Show specific section
    function showSection(sectionName) {
        currentSection = sectionName;
        
        // Update navigation
        elements.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionName}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Show appropriate content
        const sections = document.querySelectorAll('.dashboard-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // For now, show complaints table for all sections
        // In a real app, you'd have different content for each section
        switch(sectionName) {
            case 'dashboard':
                // Show main dashboard content
                renderComplaints();
                break;
            case 'complaints':
                // Show complaints specific view
                renderComplaints();
                break;
            case 'reports':
                // Show reports view
                renderComplaints(); // For now, show same content
                break;
        }
    }

    // Load complaints
    async function loadComplaints() {
        showLoadingState();
        
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            sortComplaints();
            renderComplaints();
            updateStats();
            
        } catch (error) {
            console.error('Error loading complaints:', error);
            showEmptyState();
        }
    }

    // Show loading state
    function showLoadingState() {
        if (elements.loadingState) elements.loadingState.style.display = 'block';
        if (elements.emptyState) elements.emptyState.style.display = 'none';
        if (elements.complaintsTableBody) elements.complaintsTableBody.innerHTML = '';
    }

    // Show empty state
    function showEmptyState() {
        if (elements.loadingState) elements.loadingState.style.display = 'none';
        if (elements.emptyState) elements.emptyState.style.display = 'block';
        if (elements.complaintsTableBody) elements.complaintsTableBody.innerHTML = '';
    }

    // Sort complaints
    function sortComplaints() {
        complaintsData.sort((a, b) => {
            let aVal = a[currentSort.field];
            let bVal = b[currentSort.field];
            
            if (currentSort.field === 'assignedAt' || currentSort.field === 'reportedAt') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            let result = 0;
            if (aVal < bVal) result = -1;
            if (aVal > bVal) result = 1;
            
            return currentSort.direction === 'desc' ? -result : result;
        });
    }

    // Render complaints table
    function renderComplaints() {
        if (!elements.complaintsTableBody) return;
        
        if (elements.loadingState) elements.loadingState.style.display = 'none';
        
        if (complaintsData.length === 0) {
            showEmptyState();
            return;
        }
        
        if (elements.emptyState) elements.emptyState.style.display = 'none';
        
        elements.complaintsTableBody.innerHTML = complaintsData.map(complaint => `
            <tr data-complaint-id="${complaint.id}" class="complaint-row">
                <td>
                    <span class="complaint-number">${complaint.id}</span>
                </td>
                <td>
                    <span class="complaint-title" title="${complaint.title}">${complaint.title}</span>
                </td>
                <td>
                    <span class="complaint-date">${formatDate(complaint.assignedAt)}</span>
                </td>
                <td>
                    <span class="priority-badge priority-${complaint.priority}">${formatPriority(complaint.priority)}</span>
                </td>
                <td>
                    <span class="status-badge status-${complaint.status}">${formatStatus(complaint.status)}</span>
                </td>
                <td>
                    <button class="action-button" title="Update Complaint" data-complaint-id="${complaint.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.complaint-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.action-button')) {
                    const complaintId = row.dataset.complaintId;
                    selectComplaint(complaintId);
                }
            });
        });

        // Add action button handlers
        document.querySelectorAll('.action-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const complaintId = btn.dataset.complaintId;
                selectComplaint(complaintId);
            });
        });
    }

    // Format functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        
        if (diffMinutes < 60) {
            return `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hours ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    function formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    function formatPriority(priority) {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }

    // Select complaint for editing
    window.selectComplaint = function(complaintId) {
        selectedComplaint = complaintsData.find(c => c.id === complaintId);
        
        if (!selectedComplaint) return;
        
        // Update UI
        if (elements.selectedNumber) {
            elements.selectedNumber.textContent = selectedComplaint.id;
        }
        
        // Show complaint info
        showComplaintInfo(selectedComplaint);
        
        // Show update form
        if (elements.updateForm) {
            elements.updateForm.classList.add('active');
            elements.updateForm.style.display = 'flex';
        }
        
        if (elements.noSelectionState) {
            elements.noSelectionState.style.display = 'none';
        }
        
        // Highlight selected row
        document.querySelectorAll('.complaint-row').forEach(row => {
            row.classList.remove('selected');
        });
        
        const selectedRow = document.querySelector(`[data-complaint-id="${complaintId}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
            selectedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Reset form
        resetUpdateForm();
        checkFormValidity();
    };

    // Show complaint information
    function showComplaintInfo(complaint) {
        if (elements.complaintInfo) {
            elements.complaintInfo.style.display = 'block';
            
            if (elements.infoTitle) {
                elements.infoTitle.textContent = complaint.title;
            }
            if (elements.infoDescription) {
                elements.infoDescription.textContent = complaint.description;
            }
        }
    }

    // Reset update form
    function resetUpdateForm() {
        if (elements.updateStatus) elements.updateStatus.value = '';
        if (elements.updateNotes) {
            elements.updateNotes.value = '';
            updateCharCount();
        }
        clearErrors();
    }

    // Update character count
    function updateCharCount() {
        if (elements.updateNotes && elements.charCount) {
            const count = elements.updateNotes.value.length;
            elements.charCount.textContent = count;
            elements.charCount.style.color = count > 500 ? '#ef4444' : '#6b7280';
        }
    }

    // Check form validity
    function checkFormValidity() {
        const isValid = elements.updateStatus?.value && 
                       elements.updateNotes?.value && 
                       elements.updateNotes.value.length <= 500;
        
        if (elements.submitUpdate) {
            elements.submitUpdate.disabled = !isValid;
        }
    }

    // Clear errors
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
    }

    // Update statistics
    function updateStats() {
        const assigned = complaintsData.length;
        const resolved = complaintsData.filter(c => c.status === 'resolved').length;
        const pending = complaintsData.filter(c => c.status === 'pending').length;
        
        if (elements.assignedCount) elements.assignedCount.textContent = assigned;
        if (elements.resolvedCount) elements.resolvedCount.textContent = resolved;
        if (elements.pendingCount) elements.pendingCount.textContent = pending;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Navigation links
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                const sectionName = href.replace('#', '');
                showSection(sectionName);
            });
        });

        // User dropdown
        if (elements.dropdownToggle) {
            elements.dropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                elements.dropdownMenu?.classList.toggle('show');
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            elements.dropdownMenu?.classList.remove('show');
        });

        // Mobile menu
        if (elements.mobileMenuBtn && elements.hamburger) {
            elements.mobileMenuBtn.addEventListener('click', () => {
                elements.mobileNav?.classList.toggle('active');
                elements.hamburger.classList.toggle('active');
            });
        }

        // Refresh button
        if (elements.refreshBtn) {
            elements.refreshBtn.addEventListener('click', loadComplaints);
        }

        // Form validation
        if (elements.updateStatus) {
            elements.updateStatus.addEventListener('change', checkFormValidity);
        }

        if (elements.updateNotes) {
            elements.updateNotes.addEventListener('input', () => {
                updateCharCount();
                checkFormValidity();
            });
        }

        // Form submission
        if (elements.updateForm) {
            elements.updateForm.addEventListener('submit', handleFormSubmit);
        }

        // Modal
        if (elements.successModal) {
            elements.successModal.addEventListener('click', (e) => {
                if (e.target === elements.successModal || e.target.classList.contains('success-modal-overlay')) {
                    closeSuccessModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (elements.successModal?.style.display === 'block') {
                    closeSuccessModal();
                }
                elements.dropdownMenu?.classList.remove('show');
            }
            
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                loadComplaints();
            }
        });
    }

    // Handle form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!selectedComplaint) return;
        
        const status = elements.updateStatus?.value;
        const notes = elements.updateNotes?.value;
        
        if (!status || !notes || notes.length > 500) {
            return;
        }

        // Show loading
        elements.submitUpdate?.classList.add('loading');
        elements.submitUpdate.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update complaint data
            selectedComplaint.status = status;
            selectedComplaint.lastUpdated = new Date().toISOString();
            selectedComplaint.notes = notes;
            
            // Re-render table
            renderComplaints();
            updateStats();
            
            // Show success modal
            showSuccessModal();
            
            // Reset form
            resetUpdateForm();
            selectedComplaint = null;
            
            if (elements.updateForm) elements.updateForm.style.display = 'none';
            if (elements.noSelectionState) elements.noSelectionState.style.display = 'block';
            if (elements.selectedNumber) elements.selectedNumber.textContent = 'None';
            
        } catch (error) {
            console.error('Error updating complaint:', error);
        } finally {
            elements.submitUpdate?.classList.remove('loading');
            checkFormValidity();
        }
    }

    // Show success modal
    function showSuccessModal() {
        if (elements.successModal) {
            elements.successModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Close success modal
    window.closeSuccessModal = function() {
        if (elements.successModal) {
            elements.successModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    // Make selectComplaint available globally
    window.selectComplaint = (complaintId) => {
        const complaint = complaintsData.find(c => c.id === complaintId);
        if (complaint) {
            selectedComplaint = complaint;
            
            if (elements.selectedNumber) {
                elements.selectedNumber.textContent = complaint.id;
            }
            
            showComplaintInfo(complaint);
            
            if (elements.updateForm) {
                elements.updateForm.classList.add('active');
                elements.updateForm.style.display = 'flex';
            }
            
            if (elements.noSelectionState) {
                elements.noSelectionState.style.display = 'none';
            }
            
            document.querySelectorAll('.complaint-row').forEach(row => {
                row.classList.remove('selected');
                if (row.dataset.complaintId === complaintId) {
                    row.classList.add('selected');
                }
            });
            
            resetUpdateForm();
            checkFormValidity();
        }
    };

    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (window.backgroundManager) {
            window.backgroundManager.destroy();
        }
    });

    console.log('OneStep Urban Solve - Staff Dashboard loaded successfully');
});

// Enhanced button interactions with smooth effects
document.addEventListener('click', function(e) {
    if (e.target.matches('button, .btn-primary, .btn-secondary') && !e.target.disabled) {
        const button = e.target;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 10;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
});

// Add ripple animation
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