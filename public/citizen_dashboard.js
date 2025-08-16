// FIXED VERSION - citizen_dashboard.js with proper session handling

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
  
  // FIXED: More lenient validation - check for either id or other identifying fields
  if (!user) {
    console.error('No user data found in storage');
    showLoginError('No user session found. Please login again.');
    return null;
  }
  
  // Check for user ID (try different possible field names)
  const userId = user.id || user.user_id || user.userId;
  if (!userId) {
    console.error('User object missing ID field:', user);
    console.log('Available user fields:', Object.keys(user));
    
    // TEMPORARY FIX: If we have email but no ID, create a temporary ID
    if (user.email) {
      console.warn('User has email but no ID, creating temporary session...');
      user.id = 1; // Temporary fallback
      sessionStorage.setItem('user', JSON.stringify(user));
      console.log('Added temporary ID to user:', user);
    } else {
      showLoginError('Invalid user session. Please login again.');
      return null;
    }
  }
  
  // Ensure user.id is set properly
  if (!user.id && userId) {
    user.id = userId;
    sessionStorage.setItem('user', JSON.stringify(user));
    console.log('Normalized user ID field:', user);
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
      <td><strong>${complaint.title}</strong></td>
      <td><span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></td>
      <td>${complaint.dept}</td>
      <td>${complaint.zone} - ${complaint.ward} - ${complaint.areaName}</td>
      <td><span class="priority-${complaint.priority.toLowerCase()}">${complaint.priority}</span></td>
      <td>${complaint.lastUpdated}</td>
    </tr>
  `).join('');
  
  console.log('Complaints table rendered successfully');
}

// Rest of the functions remain the same...
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

function trackComplaints() {
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  
  alert(`Complaint Tracking Summary:\n\nTotal: ${complaints.length}\nPending: ${pending}\nIn Progress: ${inProgress}\nResolved: ${resolved}`);
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

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

// Make functions globally accessible for debugging
window.loadUserComplaints = loadUserComplaints;
window.updateDashboardStats = updateDashboardStats;
window.renderComplaintsTable = renderComplaintsTable;
window.checkLogin = checkLogin;