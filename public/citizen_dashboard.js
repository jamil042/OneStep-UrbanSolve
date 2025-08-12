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

// Mock location data
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

// Initial data
let complaints = [
  {
    id: 1,
    title: 'Pothole Issue on Main Street',
    status: 'Pending',
    dept: 'Roads',
    zone: 'North',
    ward: 'Ward 1',
    areaName: 'Main Street',
    problemType: 'pothole',
    description: 'Large pothole causing traffic issues',
    lastUpdated: '2025-08-09',
    createdAt: '2025-08-08',
    priority: 'High'
  },
  {
    id: 2,
    title: 'Water Leak Emergency',
    status: 'In Progress',
    dept: 'Water',
    zone: 'South',
    ward: 'Ward 3',
    areaName: 'Park Avenue',
    problemType: 'water-leak',
    description: 'Major water leak affecting multiple buildings',
    lastUpdated: '2025-08-07',
    createdAt: '2025-08-05',
    priority: 'High'
  },
  {
    id: 3,
    title: 'Street Light Not Working',
    status: 'Resolved',
    dept: 'Roads',
    zone: 'East',
    ward: 'Ward 2',
    areaName: 'Commercial Area',
    problemType: 'street-light',
    description: 'Street light has been non-functional for weeks',
    lastUpdated: '2025-08-05',
    createdAt: '2025-08-01',
    priority: 'Medium'
  }
];

let notifications = [
  { id: 1, date: '2025-08-09', message: 'Your complaint "Pothole Issue" is now assigned to staff.', read: false },
  { id: 2, date: '2025-08-02', message: 'Your complaint "Water Leak" was resolved. Please give feedback.', read: false },
  { id: 3, date: '2025-07-28', message: 'New complaint tracking feature is now available.', read: true },
];

// Initialize the dashboard
function initDashboard() {
  updateDashboardStats();
  renderComplaintsTable();
  renderNotifications();
  
  // Set username in welcome message
  const username = localStorage.getItem('username') || 'John';
  document.getElementById('username').textContent = username;
  document.getElementById('welcomeName').textContent = username;
}

// Update dashboard statistics
function updateDashboardStats() {
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  
  document.getElementById('totalComplaints').textContent = total;
  document.getElementById('pendingComplaints').textContent = pending;
  document.getElementById('inProgressComplaints').textContent = inProgress;
  document.getElementById('resolvedComplaints').textContent = resolved;
  document.getElementById('resolutionRate').textContent = `${resolutionRate}%`;
  document.getElementById('resolutionProgress').style.width = `${resolutionRate}%`;
}

// Render complaints table
function renderComplaintsTable() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusFilterValue = statusFilter.value;
  const deptFilterValue = deptFilter.value;
  
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
    emptyState.style.display = 'flex';
    return;
  }
  
  emptyState.style.display = 'none';
  
  complaintsTableBody.innerHTML = filteredComplaints.map(complaint => `
    <tr>
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
  if (!complaint) return;
  
  modalTitle.textContent = `Complaint #${complaint.id}`;
  
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
  
  complaintModal.classList.add('show');
}

// Format problem type for display
function formatProblemType(type) {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Close modal
function closeModal() {
  complaintModal.classList.remove('show');
}

// Update wards when zone changes
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

// Update areas when ward changes
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

// Show complaint form
function showComplaintForm() {
  complaintFormContainer.classList.add('show');
  document.getElementById('title').focus();
}

// Hide complaint form
function hideComplaintForm() {
  complaintFormContainer.classList.remove('show');
  complaintForm.reset();
  clearFormErrors();
  fileName.textContent = 'No file chosen';
  
  // Reset location selects
  zoneSelect.value = '';
  wardSelect.innerHTML = '<option value="">Select Ward</option>';
  wardSelect.disabled = true;
  areaSelect.innerHTML = '<option value="">Select Area</option>';
  areaSelect.disabled = true;
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
  
  if (!title.value.trim()) {
    document.getElementById('titleError').textContent = 'Title is required';
    title.classList.add('error');
    isValid = false;
  }
  
  if (!problemType.value) {
    document.getElementById('problemTypeError').textContent = 'Problem type is required';
    problemType.classList.add('error');
    isValid = false;
  }
  
  if (!zone.value) {
    document.getElementById('zoneError').textContent = 'Zone is required';
    zone.classList.add('error');
    isValid = false;
  }
  
  if (!ward.value) {
    document.getElementById('wardError').textContent = 'Ward is required';
    ward.classList.add('error');
    isValid = false;
  }
  
  if (!areaName.value) {
    document.getElementById('areaNameError').textContent = 'Area is required';
    areaName.classList.add('error');
    isValid = false;
  }
  
  if (!description.value.trim()) {
    document.getElementById('descriptionError').textContent = 'Description is required';
    description.classList.add('error');
    isValid = false;
  }
  
  return isValid;
}

// Handle form submission
async function handleComplaintSubmit(e) {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtnText.textContent = 'Submitting...';
  submitSpinner.style.display = 'block';
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const formData = new FormData(complaintForm);
  const newComplaint = {
    id: complaints.length + 1,
    title: formData.get('title'),
    problemType: formData.get('problemType'),
    zone: formData.get('zone'),
    ward: formData.get('ward'),
    areaName: formData.get('areaName'),
    description: formData.get('description'),
    status: 'Pending',
    dept: formData.get('problemType').includes('water') ? 'Water' : 'Roads',
    lastUpdated: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString().split('T')[0],
    priority: Math.random() > 0.5 ? 'High' : 'Medium'
  };
  
  // Add to complaints array
  complaints.unshift(newComplaint);
  
  // Add success notification
  const successNotification = {
    id: notifications.length + 1,
    date: new Date().toISOString().split('T')[0],
    message: `Your complaint "${newComplaint.title}" has been submitted successfully. Tracking ID: #${newComplaint.id}`,
    read: false
  };
  
  notifications.unshift(successNotification);
  
  // Update UI
  updateDashboardStats();
  renderComplaintsTable();
  renderNotifications();
  hideComplaintForm();
  
  // Show success message
  alert(`Complaint submitted successfully!\n\nTracking ID: #${newComplaint.id}`);
  
  // Reset button state
  submitBtn.disabled = false;
  submitBtnText.textContent = 'Submit Complaint';
  submitSpinner.style.display = 'none';
}

// Track complaints
function trackComplaints() {
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  
  alert(`Complaint Tracking Summary:\n\nTotal: ${complaints.length}\nPending: ${pending}\nIn Progress: ${inProgress}\nResolved: ${resolved}`);
}

// Logout
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('username');
    window.location.href = 'index.html';
  }
}

// Event Listeners
newComplaintBtn.addEventListener('click', showComplaintForm);
trackComplaintsBtn.addEventListener('click', trackComplaints);
closeFormBtn.addEventListener('click', hideComplaintForm);
cancelFormBtn.addEventListener('click', hideComplaintForm);
complaintForm.addEventListener('submit', handleComplaintSubmit);
zoneSelect.addEventListener('change', updateWards);
wardSelect.addEventListener('change', updateAreas);
photoInput.addEventListener('change', function() {
  fileName.textContent = this.files[0] ? this.files[0].name : 'No file chosen';
});
searchInput.addEventListener('input', renderComplaintsTable);
statusFilter.addEventListener('change', renderComplaintsTable);
deptFilter.addEventListener('change', renderComplaintsTable);
notificationBell.addEventListener('click', function() {
  notificationsList.parentElement.scrollIntoView({ behavior: 'smooth' });
});
logoutBtn.addEventListener('click', logout);
closeModalBtn.addEventListener('click', closeModal);
closeModalBtn2.addEventListener('click', closeModal);

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);