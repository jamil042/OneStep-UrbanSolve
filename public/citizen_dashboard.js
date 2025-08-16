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

// FIXED: Check if user is logged in - now using localStorage to match signin
function checkLogin() {
  console.log('Checking login status...');
  
  // First try localStorage (new method)
  let user = localStorage.getItem('currentUser');
  if (user) {
    try {
      user = JSON.parse(user);
      console.log('User found in localStorage:', user);
      return user;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      localStorage.removeItem('currentUser');
    }
  }
  
  // Fallback to sessionStorage (old method)
  user = sessionStorage.getItem('user');
  if (user) {
    try {
      user = JSON.parse(user);
      console.log('User found in sessionStorage:', user);
      return user;
    } catch (e) {
      console.error('Error parsing user from sessionStorage:', e);
      sessionStorage.removeItem('user');
    }
  }
  
  console.log('No user found, redirecting to signin');
  alert('Please login first');
  window.location.href = '/signin';
  return null;
}

// Initialize the dashboard
async function initDashboard() {
  console.log('Initializing dashboard...');
  
  currentUser = checkLogin();
  if (!currentUser) return;
  
  console.log('Current user:', currentUser);
  
  // Set username in welcome message
  const username = currentUser.name || 'User';
  const usernameElement = document.getElementById('username');
  const welcomeNameElement = document.getElementById('welcomeName');
  
  if (usernameElement) {
    usernameElement.textContent = username;
  }
  if (welcomeNameElement) {
    welcomeNameElement.textContent = username.split(' ')[0]; // First name only
  }
  
  // Load user complaints from backend
  await loadUserComplaints();
  
  renderNotifications();
}

// FIXED: Load user complaints from backend - using user_id instead of id
async function loadUserComplaints() {
  try {
    // Use user_id which is the correct field name from auth.js
    const userId = currentUser.user_id || currentUser.id;
    console.log('Loading complaints for user_id:', userId);
    
    const response = await fetch(`/api/complaints/${userId}`);
    
    if (response.ok) {
      const backendComplaints = await response.json();
      console.log('Backend complaints:', backendComplaints);
      
      // Transform backend data to match frontend format
      complaints = backendComplaints.map(complaint => ({
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
      }));
      
      // Update UI after loading complaints
      updateDashboardStats();
      renderComplaintsTable();
    } else {
      console.log('No complaints found or error loading complaints');
      complaints = []; // Keep empty array for fresh users
      updateDashboardStats();
      renderComplaintsTable();
    }
  } catch (error) {
    console.error('Error loading complaints:', error);
    complaints = []; // Fallback to empty array
    updateDashboardStats();
    renderComplaintsTable();
  }
}

// Map problem type to department
function mapProblemTypeToDept(problemType) {
  if (!problemType) return 'General';
  
  // Convert to lowercase for case-insensitive comparison
  const type = problemType.toLowerCase();
  
  const waterTypes = ['water-leak', 'water-quality', 'water-supply', 'water-pressure', 'water'];
  const roadTypes = ['pothole', 'road-damage', 'street-light', 'traffic-signal', 'road'];
  
  if (waterTypes.some(t => type.includes(t))) return 'Water';
  if (roadTypes.some(t => type.includes(t))) return 'Roads';
  
  return 'General';
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  // Handle both string and Date objects
  const date = new Date(dateString);
  
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
  
  const totalElement = document.getElementById('totalComplaints');
  const pendingElement = document.getElementById('pendingComplaints');
  const inProgressElement = document.getElementById('inProgressComplaints');
  const resolvedElement = document.getElementById('resolvedComplaints');
  const resolutionRateElement = document.getElementById('resolutionRate');
  const resolutionProgressElement = document.getElementById('resolutionProgress');
  
  if (totalElement) totalElement.textContent = total;
  if (pendingElement) pendingElement.textContent = pending;
  if (inProgressElement) inProgressElement.textContent = inProgress;
  if (resolvedElement) resolvedElement.textContent = resolved;
  if (resolutionRateElement) resolutionRateElement.textContent = `${resolutionRate}%`;
  if (resolutionProgressElement) resolutionProgressElement.style.width = `${resolutionRate}%`;
}

// Render complaints table
function renderComplaintsTable() {
  if (!complaintsTableBody) {
    console.log('Complaints table body not found');
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
  
  if (filteredComplaints.length === 0) {
    complaintsTableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  complaintsTableBody.innerHTML = filteredComplaints.map(complaint => `
    <tr onclick="viewComplaintDetails(${complaint.id})" style="cursor: pointer;">
      <td>#${complaint.id}</td>
      <td><strong>${complaint.title}</strong></td>
      <td><span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></td>
      <td>${complaint.dept}</td>
      <td>${complaint.zone} - ${complaint.ward} - ${complaint.areaName}</td>
      <td><span class="priority-${complaint.priority.toLowerCase()}">${complaint.priority}</span></td>
      <td>${complaint.lastUpdated}</td>
    </tr>
  `).join('');
}

// Render notifications
function renderNotifications() {
  if (!notificationBadge || !notificationsList) {
    console.log('Notification elements not found');
    return;
  }
  
  const unreadCount = notifications.filter(n => !n.read).length;
  notificationBadge.textContent = `${unreadCount} new`;
  
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

// Mark notification as read
function markNotificationAsRead(id) {
  notifications = notifications.map(notification => 
    notification.id === id ? { ...notification, read: true } : notification
  );
  renderNotifications();
}

// View complaint details
function viewComplaintDetails(id) {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint || !complaintModal) return;
  
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
  
  complaintModal.classList.add('show');
}

// Format problem type for display
function formatProblemType(type) {
  if (!type) return 'General';
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Close modal
function closeModal() {
  if (complaintModal) complaintModal.classList.remove('show');
}

// Update wards when zone changes
function updateWards() {
  if (!zoneSelect || !wardSelect || !areaSelect) return;
  
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

// Update areas when ward changes
function updateAreas() {
  if (!zoneSelect || !wardSelect || !areaSelect) return;
  
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

// Show complaint form
function showComplaintForm() {
  if (complaintFormContainer) {
    complaintFormContainer.classList.add('show');
    const titleElement = document.getElementById('title');
    if (titleElement) titleElement.focus();
  }
}

// Hide complaint form
function hideComplaintForm() {
  if (complaintFormContainer) complaintFormContainer.classList.remove('show');
  if (complaintForm) complaintForm.reset();
  clearFormErrors();
  if (fileName) fileName.textContent = 'No file chosen';
  
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

// Clear form errors
function clearFormErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
  });
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.classList.remove('error');
  });
}

// Validate form
function validateForm() {
  let isValid = true;
  clearFormErrors();
  
  const title = document.getElementById('title');
  const problemType = document.getElementById('problemType');
  const zone = document.getElementById('zone');
  const ward = document.getElementById('ward');
  const areaName = document.getElementById('areaName');
  const description = document.getElementById('description');
  
  if (title && !title.value.trim()) {
    const titleError = document.getElementById('titleError');
    if (titleError) titleError.textContent = 'Title is required';
    title.classList.add('error');
    isValid = false;
  }
  
  if (problemType && !problemType.value) {
    const problemTypeError = document.getElementById('problemTypeError');
    if (problemTypeError) problemTypeError.textContent = 'Problem type is required';
    problemType.classList.add('error');
    isValid = false;
  }
  
  if (zone && !zone.value) {
    const zoneError = document.getElementById('zoneError');
    if (zoneError) zoneError.textContent = 'Zone is required';
    zone.classList.add('error');
    isValid = false;
  }
  
  if (ward && !ward.value) {
    const wardError = document.getElementById('wardError');
    if (wardError) wardError.textContent = 'Ward is required';
    ward.classList.add('error');
    isValid = false;
  }
  
  if (areaName && !areaName.value) {
    const areaNameError = document.getElementById('areaNameError');
    if (areaNameError) areaNameError.textContent = 'Area is required';
    areaName.classList.add('error');
    isValid = false;
  }
  
  if (description && !description.value.trim()) {
    const descriptionError = document.getElementById('descriptionError');
    if (descriptionError) descriptionError.textContent = 'Description is required';
    description.classList.add('error');
    isValid = false;
  }
  
  return isValid;
}

// FIXED: Handle form submission - using correct user_id
async function handleComplaintSubmit(e) {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  if (!submitBtn || !submitBtnText || !submitSpinner) {
    console.error('Submit button elements not found');
    return;
  }
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtnText.textContent = 'Submitting...';
  submitSpinner.style.display = 'block';
  
  try {
    const formData = new FormData(complaintForm);
    const complaintData = {
      title: formData.get('title'),
      description: formData.get('description'),
      problemType: formData.get('problemType'),
      zone: formData.get('zone'),
      ward: formData.get('ward'),
      areaName: formData.get('areaName'),
      userId: currentUser.user_id || currentUser.id // Use correct field
    };
    
    console.log('Submitting complaint:', complaintData);
    
    const response = await fetch('/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(complaintData)
    });
    
    const result = await response.json();
    console.log('Complaint response:', result);
    
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
    submitBtn.disabled = false;
    submitBtnText.textContent = 'Submit Complaint';
    submitSpinner.style.display = 'none';
  }
}

// Track complaints
function trackComplaints() {
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  
  alert(`Complaint Tracking Summary:\n\nTotal: ${complaints.length}\nPending: ${pending}\nIn Progress: ${inProgress}\nResolved: ${resolved}`);
}

// FIXED: Logout - clear both localStorage and sessionStorage
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    // Clear both storage methods
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    
    window.location.href = '/signin';
  }
}

// Event Listeners with null checks
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up event listeners...');
  
  if (newComplaintBtn) newComplaintBtn.addEventListener('click', showComplaintForm);
  if (trackComplaintsBtn) trackComplaintsBtn.addEventListener('click', trackComplaints);
  if (closeFormBtn) closeFormBtn.addEventListener('click', hideComplaintForm);
  if (cancelFormBtn) cancelFormBtn.addEventListener('click', hideComplaintForm);
  if (complaintForm) complaintForm.addEventListener('submit', handleComplaintSubmit);
  if (zoneSelect) zoneSelect.addEventListener('change', updateWards);
  if (wardSelect) wardSelect.addEventListener('change', updateAreas);
  if (photoInput) {
    photoInput.addEventListener('change', function() {
      if (fileName) fileName.textContent = this.files[0] ? this.files[0].name : 'No file chosen';
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
  
  // Initialize the dashboard
  initDashboard();
});