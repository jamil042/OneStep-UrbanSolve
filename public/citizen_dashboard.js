// UPDATED VERSION - citizen_dashboard.js with complaint tracking modal

// DOM Elements
const newComplaintBtn = document.getElementById('newComplaintBtn');
const trackComplaintsBtn = document.getElementById('trackComplaintsBtn');
const complaintFormContainer = document.getElementById('complaintFormContainer');
const closeFormBtn = document.getElementById('closeFormBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const complaintForm = document.getElementById('complaintForm');
const zoneSelect = document.getElementById('zone');
const wardSelect = document.getElementById('ward');
const areaSelect = document.getElementById('areaName');
const photoInput = document.getElementById('photo');
const fileName = document.getElementById('fileName');
const submitBtn = document.getElementById('complaintForm').querySelector('button[type="submit"]');
const submitBtnText = document.getElementById('submitBtnText');
const submitSpinner = document.getElementById('submitSpinner');
const complaintsTableBody = document.getElementById('complaintsTableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const deptFilter = document.getElementById('deptFilter');
const notificationsList = document.getElementById('notificationsList');
const notificationBadge = document.getElementById('notificationBadge');
const notificationBell = document.querySelector('.notification-bell');
const logoutBtn = document.getElementById('logoutBtn');
const complaintModal = document.getElementById('complaintModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalBtn2 = document.getElementById('closeModalBtn2');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
// Feedback modal elements
const feedbackModal = document.getElementById('feedbackModal');
const closeFeedbackModalBtn = document.getElementById('closeFeedbackModalBtn');
const feedbackModalTitle = document.getElementById('feedbackModalTitle');
const feedbackComplaintInfo = document.getElementById('feedbackComplaintInfo');
const feedbackForm = document.getElementById('feedbackForm');
const starRating = document.getElementById('starRating');
const feedbackRating = document.getElementById('feedbackRating');
const feedbackComment = document.getElementById('feedbackComment');
const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');

let currentFeedbackComplaintId = null;

// Mock location data (keeping existing functionality)
const locationData = {
  "North": {
    "Ward 1": ["Main Street", "Park Road", "Commercial Complex"],
    "Ward 2": ["Residential Area A", "Shopping Center", "Government Colony"],
    "Ward 3": ["Industrial Area", "New Town", "Railway Station Area"]
  },
  "South": {
    "Ward 1": ["Hospital Road", "School Street", "Market Area"],
    "Ward 2": ["Bus Stand", "Old City", "Temple Road"],
    "Ward 3": ["Park Avenue", "Sports Complex", "University Area"]
  },
  "East": {
    "Ward 1": ["Tech Park", "Lake View", "Hillside"],
    "Ward 2": ["Commercial Area", "Residential Plot", "Metro Station"],
    "Ward 3": ["Airport Road", "IT Corridor", "Business District"]
  },
  "West": {
    "Ward 1": ["Sunset Boulevard", "River Side", "Green Park"],
    "Ward 2": ["Industrial Estate", "Farmers Market", "Heritage Area"],
    "Ward 3": ["New Development", "Sports Stadium", "Cultural Center"]
  },
  "Central": {
    "Ward 1": ["City Center", "Town Hall", "Central Square"],
    "Ward 2": ["Financial District", "Court Complex", "Administrative Area"],
    "Ward 3": ["Convention Center", "Exhibition Ground", "Central Park"]
  }
};

// Global variables
let complaints = [];
let notifications = [
  { id: 1, date: '2025-08-09', message: 'Welcome to OneStep UrbanSolve! You can now submit and track complaints.', read: false },
  { id: 2, date: '2025-08-02', message: 'New complaint tracking feature is now available.', read: true },
];
let currentUser = null;

// FIXED: Improved login check with retry mechanism
function checkLogin() {
  console.log('=== CHECKING LOGIN STATUS ===');
  
  // Try sessionStorage first
  let user = null;
  try {
    const sessionData = sessionStorage.getItem('user');
    console.log('Raw sessionStorage data:', sessionData);
    if (sessionData) {
      user = JSON.parse(sessionData);
      console.log('Parsed sessionStorage user:', user);
    }
  } catch (e) {
    console.error('Error parsing sessionStorage:', e);
  }
  
  // Try localStorage as fallback
  if (!user) {
    try {
      const localData = localStorage.getItem('user');
      console.log('Raw localStorage data:', localData);
      if (localData) {
        user = JSON.parse(localData);
        console.log('Parsed localStorage user:', user);
        // Move to sessionStorage for consistency
        if (user) {
          sessionStorage.setItem('user', JSON.stringify(user));
          console.log('Moved user data from localStorage to sessionStorage');
        }
      }
    } catch (e) {
      console.error('Error parsing localStorage:', e);
    }
  }
  
  console.log('Final user object:', user);
  
  if (!user) {
    console.error('No user data found in storage');
    showLoginError('No user session found. Please login again.');
    return null;
  }
  
  // FIXED: Properly handle different ID field names from backend
  const userId = user.id || user.user_id || user.userId;
  if (!userId) {
    console.error('User object missing ID field:', user);
    console.log('Available user fields:', Object.keys(user));
    showLoginError('Invalid user session. Please login again.');
    return null;
  }
  
  // FIXED: Normalize the ID field to 'id' for consistency
  if (!user.id && userId) {
    user.id = userId;
    sessionStorage.setItem('user', JSON.stringify(user));
    console.log('Normalized user ID field:', user.id);
  }
  
  console.log('✅ Login check passed. User ID:', user.id);
  return user;
}

// FIXED: Add a more user-friendly login error handler
function showLoginError(message) {
  console.error('Login error:', message);
  
  // Show a more user-friendly message
  const shouldRedirect = confirm(
    `${message}\n\nWould you like to go to the login page now?`
  );
  
  if (shouldRedirect) {
    window.location.href = '/signin.html';
  } else {
    // Give user a chance to stay on page for debugging
    console.log('User chose to stay on page for debugging');
  }
}

// FIXED: Initialize dashboard with retry mechanism
async function initDashboard() {
  console.log('=== INITIALIZING DASHBOARD ===');
  
  // Add a small delay to ensure any redirects from signin are complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  currentUser = checkLogin();
  if (!currentUser) {
    console.error('Failed to get current user, stopping initialization');
    return;
  }
  
  console.log('✅ Current user set:', currentUser);
  
  // Set username in welcome message
  const username = currentUser.name || currentUser.username || currentUser.email || 'User';
  const userElement = document.getElementById('username');
  const welcomeElement = document.getElementById('welcomeName');
  
  if (userElement) {
    userElement.textContent = username;
    console.log('Set username element to:', username);
  }
  if (welcomeElement) {
    const firstName = username.split(' ')[0];
    welcomeElement.textContent = firstName;
    console.log('Set welcome element to:', firstName);
  }
  
  // Make currentUser globally accessible for debugging
  window.currentUser = currentUser;
  window.complaints = complaints;
  
  console.log('🔍 Debug info available in window.currentUser and window.complaints');
  
  // Load user complaints from backend
  console.log('Loading user complaints...');
  await loadUserComplaints();
  
  renderNotifications();
  
  console.log('✅ Dashboard initialization complete');
}

// IMPROVED: Load user complaints with better error handling and logging
async function loadUserComplaints() {
  if (!currentUser || !currentUser.id) {
    console.error('Cannot load complaints: currentUser or currentUser.id is missing');
    console.log('currentUser:', currentUser);
    return;
  }
  
  try {
    console.log('Loading complaints for user ID:', currentUser.id);
    const url = `/api/complaints/${currentUser.id}`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const backendComplaints = await response.json();
      console.log('Raw backend complaints:', backendComplaints);
      
      // Transform backend data to match frontend format
      complaints = backendComplaints.map(complaint => {
        const transformed = {
          id: complaint.id,
          title: complaint.title,
          status: complaint.status,
          dept: mapProblemTypeToDept(complaint.problemType),
          zone: complaint.zone,
          ward: complaint.ward,
          areaName: complaint.areaName,
          problemType: complaint.problemType,
          description: complaint.description,
          lastUpdated: formatDate(complaint.lastUpdated || complaint.createdAt),
          createdAt: formatDate(complaint.createdAt),
          priority: complaint.priority || 'Medium'
        };
        console.log('Transformed complaint:', transformed);
        return transformed;
      });
      
      console.log('Final processed complaints:', complaints);
      
    } else {
      const errorText = await response.text();
      console.log('API response not OK:', response.status, errorText);
      complaints = []; // Keep empty array for fresh users
    }
  } catch (error) {
    console.error('Error loading complaints:', error);
    complaints = []; // Fallback to empty array
  }
  
  // Always update UI after loading complaints (whether successful or not)
  console.log('Updating dashboard with', complaints.length, 'complaints');
  updateDashboardStats();
  renderComplaintsTable();
}

// Map problem type to department
function mapProblemTypeToDept(problemType) {
  if (!problemType) return 'General';
  
  // Convert to lowercase for case-insensitive comparison
  const type = problemType.toLowerCase();
  
  const waterTypes = ['water leak', 'water quality', 'water supply', 'water pressure', 'water'];
  const roadTypes = ['pothole', 'road damage', 'street light', 'traffic signal', 'road'];
  const wasteTypes = ['garbage', 'waste', 'sanitation', 'cleanliness'];
  const electricityTypes = ['power', 'electricity', 'electrical'];
  
  if (waterTypes.some(t => type.includes(t))) return 'Water';
  if (roadTypes.some(t => type.includes(t))) return 'Roads';
  if (wasteTypes.some(t => type.includes(t))) return 'Waste';
  if (electricityTypes.some(t => type.includes(t))) return 'Electricity';
  
  return 'General';
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  // Handle both string and Date objects
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  
  // Return in YYYY-MM-DD format
  return date.toISOString().split('T')[0];
}

// Update dashboard statistics
function updateDashboardStats() {
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  
  console.log('Updating dashboard stats:', { total, pending, inProgress, resolved, resolutionRate });
  
  // Update DOM elements
  const totalElement = document.getElementById('totalComplaints');
  const pendingElement = document.getElementById('pendingComplaints');
  const inProgressElement = document.getElementById('inProgressComplaints');
  const resolvedElement = document.getElementById('resolvedComplaints');
  const resolutionRateElement = document.getElementById('resolutionRate');
  const resolutionProgressElement = document.getElementById('resolutionProgress');
  
  if (totalElement) {
    totalElement.textContent = total;
    console.log('Updated total complaints to:', total);
  }
  if (pendingElement) pendingElement.textContent = pending;
  if (inProgressElement) inProgressElement.textContent = inProgress;
  if (resolvedElement) resolvedElement.textContent = resolved;
  if (resolutionRateElement) resolutionRateElement.textContent = `${resolutionRate}%`;
  if (resolutionProgressElement) resolutionProgressElement.style.width = `${resolutionRate}%`;
}

// Render complaints table
function renderComplaintsTable() {
  console.log('Rendering complaints table, total complaints:', complaints.length);
  
  if (!complaintsTableBody) {
    console.error('complaintsTableBody element not found');
    return;
  }
  
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const statusFilterValue = statusFilter ? statusFilter.value : 'all';
  const deptFilterValue = deptFilter ? deptFilter.value : 'all';
  
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm) ||
      complaint.description.toLowerCase().includes(searchTerm) ||
      complaint.areaName.toLowerCase().includes(searchTerm);
    
    const matchesStatus = statusFilterValue === 'all' || complaint.status === statusFilterValue;
    const matchesDept = deptFilterValue === 'all' || complaint.dept === deptFilterValue;
    
    return matchesSearch && matchesStatus && matchesDept;
  });
  
  console.log('Filtered complaints for display:', filteredComplaints.length);
  
  if (filteredComplaints.length === 0) {
    complaintsTableBody.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'flex';
      console.log('Showing empty state');
    }
    return;
  }
  
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  complaintsTableBody.innerHTML = filteredComplaints.map(complaint => `
  <tr onclick="viewComplaintDetails(${complaint.id})" style="cursor: pointer;">
    <td>#${complaint.id}</td>
    <td>
      <strong>${complaint.title}</strong>
      ${complaint.status === 'Resolved' ? 
        `<button class="feedback-btn" onclick="event.stopPropagation(); showFeedbackForm(${complaint.id})" title="Give Feedback">
          <i class="fas fa-comment-dots"></i>
        </button>` : ''}
    </td>
    <td><span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></td>
    <td>${complaint.dept}</td>
    <td>${complaint.zone} - ${complaint.ward} - ${complaint.areaName}</td>
    <td><span class="priority-${complaint.priority.toLowerCase()}">${complaint.priority}</span></td>
    <td>${complaint.lastUpdated}</td>
  </tr>
`).join('');
  
  console.log('Complaints table rendered successfully');
}

function renderNotifications() {
  const unreadCount = notifications.filter(n => !n.read).length;
  if (notificationBadge) {
    notificationBadge.textContent = `${unreadCount} new`;
  }
  
  if (notificationsList) {
    notificationsList.innerHTML = notifications.map(notification => `
      <div class="notification-item ${notification.read ? '' : 'unread'}" onclick="markNotificationAsRead(${notification.id})">
        <div class="notification-date">
          ${notification.date}
          ${!notification.read ? '<span class="unread-dot"></span>' : ''}
        </div>
        <p class="notification-message">${notification.message}</p>
      </div>
    `).join('');
  }
}

function markNotificationAsRead(id) {
  notifications = notifications.map(notification => 
    notification.id === id ? { ...notification, read: true } : notification
  );
  renderNotifications();
}

function viewComplaintDetails(id) {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) return;
  
  if (modalTitle) modalTitle.textContent = `Complaint #${complaint.id}`;
  
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="complaint-detail">
        <h4>Title</h4>
        <p>${complaint.title}</p>
      </div>
      
      <div class="complaint-status ${complaint.status.toLowerCase().replace(' ', '-')}">
        ${complaint.status}
      </div>
      
      <div class="complaint-detail">
        <h4>Department</h4>
        <p>${complaint.dept}</p>
      </div>
      
      <div class="complaint-detail">
        <h4>Location</h4>
        <p>${complaint.zone} Zone - ${complaint.ward} - ${complaint.areaName}</p>
      </div>
      
      <div class="complaint-detail">
        <h4>Problem Type</h4>
        <p>${formatProblemType(complaint.problemType)}</p>
      </div>
      
      <div class="complaint-detail">
        <h4>Priority</h4>
        <p class="priority-${complaint.priority.toLowerCase()}">${complaint.priority}</p>
      </div>
      
      <div class="complaint-detail">
        <h4>Description</h4>
        <p>${complaint.description}</p>
      </div>
      
      <div class="complaint-detail">
        <h4>Submitted On</h4>
        <p>${complaint.createdAt}</p>
      </div>
      
      <div class="complaint-detail">
        <h4>Last Updated</h4>
        <p>${complaint.lastUpdated}</p>
      </div>
    `;
  }
  
  if (complaintModal) {
    complaintModal.classList.add('show');
  }
}

// Show feedback form for resolved complaints
async function showFeedbackForm(complaintId) {
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;
    
    if (complaint.status !== 'Resolved') {
        alert('You can only provide feedback for resolved complaints.');
        return;
    }
    
    // Check if feedback already exists
    try {
        const response = await fetch(`/api/complaints/${complaintId}/feedback/${currentUser.id}`);
        if (response.ok) {
            const existingFeedback = await response.json();
            alert('You have already submitted feedback for this complaint.');
            return;
        }
    } catch (error) {
        // No existing feedback, continue
    }
    
    currentFeedbackComplaintId = complaintId;
    
    if (feedbackModalTitle) {
        feedbackModalTitle.textContent = `Feedback for Complaint #${complaintId}`;
    }
    
    if (feedbackComplaintInfo) {
        feedbackComplaintInfo.innerHTML = `
            <div class="feedback-complaint-info">
                <h4>${complaint.title}</h4>
                <p><strong>Status:</strong> <span class="status-badge resolved">${complaint.status}</span></p>
                <p><strong>Department:</strong> ${complaint.dept}</p>
                <p><strong>Resolution Date:</strong> ${complaint.lastUpdated}</p>
            </div>
        `;
    }
    
    // Reset form
    if (feedbackForm) feedbackForm.reset();
    if (feedbackRating) feedbackRating.value = '';
    resetStarRating();
    clearFeedbackErrors();
    
    if (feedbackModal) {
        feedbackModal.classList.add('show');
    }
}

// Handle star rating clicks
function handleStarRating() {
    if (!starRating) return;
    
    const stars = starRating.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            feedbackRating.value = rating;
            
            // Update visual state
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('selected');
                } else {
                    s.classList.remove('selected');
                }
            });
        });
        
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
    });
    
    starRating.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'));
    });
}

// Reset star rating visual state
function resetStarRating() {
    if (!starRating) return;
    const stars = starRating.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('selected', 'hover');
    });
}

// Validate feedback form
function validateFeedbackForm() {
    let isValid = true;
    clearFeedbackErrors();
    
    if (!feedbackRating.value) {
        const ratingError = document.getElementById('ratingError');
        if (ratingError) ratingError.textContent = 'Please select a rating';
        isValid = false;
    }
    
    if (!feedbackComment.value.trim()) {
        const commentError = document.getElementById('commentError');
        if (commentError) commentError.textContent = 'Please provide your feedback';
        feedbackComment.classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// Clear feedback form errors
function clearFeedbackErrors() {
    document.querySelectorAll('#feedbackModal .error-message').forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll('#feedbackModal input, #feedbackModal textarea').forEach(el => {
        el.classList.remove('error');
    });
}

// Submit feedback
async function submitFeedback() {
    if (!validateFeedbackForm() || !currentFeedbackComplaintId || !currentUser) return;
    
    try {
        submitFeedbackBtn.disabled = true;
        submitFeedbackBtn.textContent = 'Submitting...';
        
        const feedbackData = {
            userId: currentUser.id,
            rating: parseInt(feedbackRating.value),
            comment: feedbackComment.value.trim()
        };
        
        const response = await fetch(`/api/complaints/${currentFeedbackComplaintId}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Thank you for your feedback! It has been submitted successfully.');
            closeFeedbackModal();
            
            // Add notification
            notifications.unshift({
                id: notifications.length + 1,
                date: new Date().toISOString().split('T')[0],
                message: `Feedback submitted for complaint #${currentFeedbackComplaintId}`,
                read: false
            });
            renderNotifications();
            
        } else {
            alert('Error: ' + (result.error || 'Failed to submit feedback'));
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Network error. Please try again.');
    } finally {
        submitFeedbackBtn.disabled = false;
        submitFeedbackBtn.textContent = 'Submit Feedback';
    }
}

// Close feedback modal
function closeFeedbackModal() {
    if (feedbackModal) {
        feedbackModal.classList.remove('show');
    }
    currentFeedbackComplaintId = null;
    if (feedbackForm) feedbackForm.reset();
    resetStarRating();
    clearFeedbackErrors();
}

// NEW: Improved tracking function with modal interface
function trackComplaints() {
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  
  // Calculate average resolution time (mock data for demonstration)
  const avgResolutionTime = resolved > 0 ? Math.round(Math.random() * 10 + 5) : 0;
  
  // Get recent activity
  const recentComplaints = complaints
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, 5);
  
  if (modalTitle) modalTitle.textContent = 'Complaint Tracking Summary';
  
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="tracking-summary">
        <div class="tracking-header">
          <h4><i class="fas fa-chart-bar"></i> Your Complaint Statistics</h4>
          <p class="tracking-subtitle">Track all your submitted complaints and their current status</p>
        </div>
        
        <div class="tracking-stats">
          <div class="tracking-stat-card">
            <div class="stat-number">${total}</div>
            <div class="stat-label">Total Complaints</div>
            <i class="fas fa-file-alt stat-icon"></i>
          </div>
          
          <div class="tracking-stat-card pending">
            <div class="stat-number">${pending}</div>
            <div class="stat-label">Pending</div>
            <i class="fas fa-clock stat-icon"></i>
          </div>
          
          <div class="tracking-stat-card in-progress">
            <div class="stat-number">${inProgress}</div>
            <div class="stat-label">In Progress</div>
            <i class="fas fa-sync-alt stat-icon"></i>
          </div>
          
          <div class="tracking-stat-card resolved">
            <div class="stat-number">${resolved}</div>
            <div class="stat-label">Resolved</div>
            <i class="fas fa-check-circle stat-icon"></i>
          </div>
        </div>
        
        <div class="tracking-metrics">
          <div class="metric-card">
            <h5><i class="fas fa-percentage"></i> Resolution Rate</h5>
            <div class="metric-value">${resolutionRate}%</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${resolutionRate}%;"></div>
            </div>
          </div>
          
          <div class="metric-card">
            <h5><i class="fas fa-stopwatch"></i> Avg. Resolution Time</h5>
            <div class="metric-value">${avgResolutionTime} days</div>
            <div class="metric-note">Average time to resolve complaints</div>
          </div>
        </div>
        
        ${total > 0 ? `
        <div class="recent-activity">
          <h5><i class="fas fa-history"></i> Recent Activity</h5>
          <div class="activity-list">
            ${recentComplaints.map(complaint => `
              <div class="activity-item" onclick="viewComplaintDetails(${complaint.id})" style="cursor: pointer;">
                <div class="activity-icon">
                  <span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
                </div>
                <div class="activity-content">
                  <div class="activity-title">${complaint.title}</div>
                  <div class="activity-meta">#${complaint.id} • ${complaint.dept} • ${complaint.lastUpdated}</div>
                </div>
                <i class="fas fa-arrow-right activity-arrow"></i>
              </div>
            `).join('')}
          </div>
        </div>
        ` : `
        <div class="no-complaints">
          <i class="fas fa-clipboard-list"></i>
          <h5>No complaints yet</h5>
          <p>You haven't submitted any complaints yet. Click "Submit New Complaint" to get started!</p>
        </div>
        `}
        
        <div class="tracking-actions">
          <button class="tracking-action-btn primary" onclick="closeModal(); showComplaintForm();">
            <i class="fas fa-plus"></i> Submit New Complaint
          </button>
          ${total > 0 ? `
          <button class="tracking-action-btn secondary" onclick="closeModal(); document.querySelector('.complaint-history').scrollIntoView({behavior: 'smooth'});">
            <i class="fas fa-list"></i> View All Complaints
          </button>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  if (complaintModal) {
    complaintModal.classList.add('show');
  }
}

function formatProblemType(type) {
  if (!type) return 'General';
  return type
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function closeModal() {
  if (complaintModal) {
    complaintModal.classList.remove('show');
  }
}

function updateWards() {
  const selectedZone = zoneSelect.value;
  wardSelect.innerHTML = '<option value="">Select Ward</option>';
  areaSelect.innerHTML = '<option value="">Select Area</option>';
  areaSelect.disabled = true;
  
  if (selectedZone && locationData[selectedZone]) {
    wardSelect.disabled = false;
    Object.keys(locationData[selectedZone]).forEach(ward => {
      const option = document.createElement('option');
      option.value = ward;
      option.textContent = ward;
      wardSelect.appendChild(option);
    });
  } else {
    wardSelect.disabled = true;
  }
}

function updateAreas() {
  const selectedZone = zoneSelect.value;
  const selectedWard = wardSelect.value;
  areaSelect.innerHTML = '<option value="">Select Area</option>';
  
  if (selectedZone && selectedWard && locationData[selectedZone][selectedWard]) {
    areaSelect.disabled = false;
    locationData[selectedZone][selectedWard].forEach(area => {
      const option = document.createElement('option');
      option.value = area;
      option.textContent = area;
      areaSelect.appendChild(option);
    });
  } else {
    areaSelect.disabled = true;
  }
}

function showComplaintForm() {
  if (complaintFormContainer) {
    complaintFormContainer.classList.add('show');
    const titleInput = document.getElementById('title');
    if (titleInput) titleInput.focus();
  }
}

function hideComplaintForm() {
  if (complaintFormContainer) {
    complaintFormContainer.classList.remove('show');
  }
  if (complaintForm) {
    complaintForm.reset();
  }
  clearFormErrors();
  if (fileName) {
    fileName.textContent = 'No file chosen';
  }
  
  // Reset location selects
  if (zoneSelect) zoneSelect.value = '';
  if (wardSelect) {
    wardSelect.innerHTML = '<option value="">Select Ward</option>';
    wardSelect.disabled = true;
  }
  if (areaSelect) {
    areaSelect.innerHTML = '<option value="">Select Area</option>';
    areaSelect.disabled = true;
  }
}

function clearFormErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
  });
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.classList.remove('error');
  });
}

function validateForm() {
  let isValid = true;
  clearFormErrors();
  
  const title = document.getElementById('title');
  const problemType = document.getElementById('problemType');
  const zone = document.getElementById('zone');
  const ward = document.getElementById('ward');
  const areaName = document.getElementById('areaName');
  const description = document.getElementById('description');
  
  if (!title || !title.value.trim()) {
    const titleError = document.getElementById('titleError');
    if (titleError) titleError.textContent = 'Title is required';
    if (title) title.classList.add('error');
    isValid = false;
  }
  
  if (!problemType || !problemType.value) {
    const problemTypeError = document.getElementById('problemTypeError');
    if (problemTypeError) problemTypeError.textContent = 'Problem type is required';
    if (problemType) problemType.classList.add('error');
    isValid = false;
  }
  
  if (!zone || !zone.value) {
    const zoneError = document.getElementById('zoneError');
    if (zoneError) zoneError.textContent = 'Zone is required';
    if (zone) zone.classList.add('error');
    isValid = false;
  }
  
  if (!ward || !ward.value) {
    const wardError = document.getElementById('wardError');
    if (wardError) wardError.textContent = 'Ward is required';
    if (ward) ward.classList.add('error');
    isValid = false;
  }
  
  if (!areaName || !areaName.value) {
    const areaNameError = document.getElementById('areaNameError');
    if (areaNameError) areaNameError.textContent = 'Area is required';
    if (areaName) areaName.classList.add('error');
    isValid = false;
  }
  
  if (!description || !description.value.trim()) {
    const descriptionError = document.getElementById('descriptionError');
    if (descriptionError) descriptionError.textContent = 'Description is required';
    if (description) description.classList.add('error');
    isValid = false;
  }
  
  return isValid;
}

// IMPROVED: Handle form submission with proper user ID
async function handleComplaintSubmit(e) {
  e.preventDefault();
  
  // Double-check user is still logged in
  if (!currentUser || !currentUser.id) {
    console.error('User not logged in during complaint submission');
    alert('Session expired. Please login again.');
    window.location.href = '/signin.html';
    return;
  }
  
  if (!validateForm()) return;
  
  // Show loading state
  if (submitBtn) submitBtn.disabled = true;
  if (submitBtnText) submitBtnText.textContent = 'Submitting...';
  if (submitSpinner) submitSpinner.style.display = 'block';
  
  try {
    const formData = new FormData(complaintForm);
    const complaintData = {
      title: formData.get('title'),
      description: formData.get('description'),
      problemType: formData.get('problemType'),
      zone: formData.get('zone'),
      ward: formData.get('ward'),
      areaName: formData.get('areaName'),
      userId: currentUser.id  // IMPORTANT: Ensure user ID is included
    };
    
    console.log('Submitting complaint with data:', complaintData);
    console.log('User ID being sent:', currentUser.id);
    
    const response = await fetch('/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(complaintData)
    });
    
    const result = await response.json();
    console.log('Complaint submission response:', result);
    
    if (result.success) {
      // Add success notification
      const successNotification = {
        id: notifications.length + 1,
        date: new Date().toISOString().split('T')[0],
        message: `Your complaint "${complaintData.title}" has been submitted successfully. Tracking ID: #${result.complaint_id}`,
        read: false
      };
      
      notifications.unshift(successNotification);
      
      // Reload complaints from backend to get the latest data
      console.log('Reloading complaints after successful submission...');
      await loadUserComplaints();
      
      // Update UI
      renderNotifications();
      hideComplaintForm();
      
      // Show success message
      alert(`Complaint submitted successfully!\n\nTracking ID: #${result.complaint_id}`);
    } else {
      alert('Error: ' + (result.error || 'Failed to submit complaint'));
    }
  } catch (error) {
    console.error('Error submitting complaint:', error);
    alert('Network error. Please try again.');
  } finally {
    // Reset button state
    if (submitBtn) submitBtn.disabled = false;
    if (submitBtnText) submitBtnText.textContent = 'Submit Complaint';
    if (submitSpinner) submitSpinner.style.display = 'none';
  }
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user'); // Also clear localStorage
    window.location.href = '/signin.html';
  }
}

// Event Listeners
if (newComplaintBtn) newComplaintBtn.addEventListener('click', showComplaintForm);
if (trackComplaintsBtn) trackComplaintsBtn.addEventListener('click', trackComplaints);
if (closeFormBtn) closeFormBtn.addEventListener('click', hideComplaintForm);
if (cancelFormBtn) cancelFormBtn.addEventListener('click', hideComplaintForm);
if (complaintForm) complaintForm.addEventListener('submit', handleComplaintSubmit);
if (zoneSelect) zoneSelect.addEventListener('change', updateWards);
if (wardSelect) wardSelect.addEventListener('change', updateAreas);
if (photoInput) {
  photoInput.addEventListener('change', function() {
    if (fileName) {
      fileName.textContent = this.files[0] ? this.files[0].name : 'No file chosen';
    }
  });
}
if (searchInput) searchInput.addEventListener('input', renderComplaintsTable);
if (statusFilter) statusFilter.addEventListener('change', renderComplaintsTable);
if (deptFilter) deptFilter.addEventListener('change', renderComplaintsTable);
if (notificationBell) {
  notificationBell.addEventListener('click', function() {
    if (notificationsList && notificationsList.parentElement) {
      notificationsList.parentElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (closeModalBtn2) closeModalBtn2.addEventListener('click', closeModal);

// Feedback modal event listeners
if (closeFeedbackModalBtn) closeFeedbackModalBtn.addEventListener('click', closeFeedbackModal);
if (cancelFeedbackBtn) cancelFeedbackBtn.addEventListener('click', closeFeedbackModal);
if (submitFeedbackBtn) submitFeedbackBtn.addEventListener('click', submitFeedback);

// Initialize star rating functionality
handleStarRating();

// Click outside modal to close feedback modal
if (feedbackModal) {
    feedbackModal.addEventListener('click', function(e) {
        if (e.target === feedbackModal) {
            closeFeedbackModal();
        }
    });
}

// Make feedback functions globally accessible
window.showFeedbackForm = showFeedbackForm;
window.submitFeedback = submitFeedback;

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

// Make functions globally accessible for debugging
window.loadUserComplaints = loadUserComplaints;
window.updateDashboardStats = updateDashboardStats;
window.renderComplaintsTable = renderComplaintsTable;
window.checkLogin = checkLogin;
window.trackComplaints = trackComplaints;