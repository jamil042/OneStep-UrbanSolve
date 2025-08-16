// DOM Elements
const refreshComplaintsBtn = document.getElementById('refreshComplaintsBtn');
const viewAllBtn = document.getElementById('viewAllBtn');
const updateFormContainer = document.getElementById('updateFormContainer');
const closeUpdateFormBtn = document.getElementById('closeUpdateFormBtn');
const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');
const updateForm = document.getElementById('updateForm');
const selectedComplaintInfo = document.getElementById('selectedComplaintInfo');
const updateStatus = document.getElementById('updateStatus');
const updateNotes = document.getElementById('updateNotes');
const workPhoto = document.getElementById('workPhoto');
const photoFileName = document.getElementById('photoFileName');
const updateBtn = document.getElementById('updateForm').querySelector('button[type="submit"]');
const updateBtnText = document.getElementById('updateBtnText');
const updateSpinner = document.getElementById('updateSpinner');
const complaintsTableBody = document.getElementById('complaintsTableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');
const updatesList = document.getElementById('updatesList');
const updatesBadge = document.getElementById('updatesBadge');
const logoutBtn = document.getElementById('logoutBtn');
const complaintModal = document.getElementById('complaintModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalBtn2 = document.getElementById('closeModalBtn2');
const updateFromModalBtn = document.getElementById('updateFromModalBtn');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

// Global variables
let assignedComplaints = [];
let recentUpdates = [];
let currentUser = null;
let selectedComplaintId = null;

// Mock staff data - would come from backend in real app
const staffData = {
  id: 'staff_001',
  name: 'John Staff',
  department: 'Public Works',
  role: 'Field Supervisor'
};

// Check if staff is logged in
function checkStaffLogin() {
  // For demo purposes, use mock data
  // In real app, this would check session/token
  const staff = JSON.parse(sessionStorage.getItem('staffUser')) || staffData;
  if (!staff) {
    alert('Please login as staff first');
    window.location.href = '/signin';
    return null;
  }
  return staff;
}

// Initialize the staff dashboard
async function initStaffDashboard() {
  currentUser = checkStaffLogin();
  if (!currentUser) return;
  
  // Set staff name in welcome message
  const staffName = currentUser.name || 'Staff Member';
  document.getElementById('username').textContent = staffName;
  document.getElementById('welcomeName').textContent = staffName.split(' ')[0];
  
  // Load assigned complaints
  await loadAssignedComplaints();
  
  // Load recent updates
  loadRecentUpdates();
  
  // Update dashboard stats
  updateDashboardStats();
  
  // Render complaints table
  renderComplaintsTable();
  
  // Render recent updates
  renderRecentUpdates();
}

// Generate mock assigned complaints
function generateMockComplaints() {
  const mockComplaints = [
    {
      id: 1001,
      title: 'Water pipe burst on Main Street',
      description: 'Large water pipe has burst causing flooding on Main Street near the shopping center.',
      assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      status: 'Pending',
      priority: 'High',
      location: 'Main Street, Downtown',
      zone: 'Central',
      ward: 'Ward 1',
      areaName: 'City Center',
      problemType: 'Water Leak',
      citizenName: 'Sarah Johnson',
      reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 1002,
      title: 'Pothole causing vehicle damage',
      description: 'Deep pothole on Oak Avenue is causing damage to vehicles. Multiple complaints received.',
      assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      status: 'In Progress',
      priority: 'Medium',
      location: 'Oak Avenue, Block 200',
      zone: 'North',
      ward: 'Ward 2',
      areaName: 'Residential Area A',
      problemType: 'Pothole',
      citizenName: 'Mike Chen',
      reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 1003,
      title: 'Street light not working',
      description: 'Street light at Park Road intersection has been out for several days.',
      assignedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      status: 'Pending',
      priority: 'Low',
      location: 'Park Road Intersection',
      zone: 'South',
      ward: 'Ward 1',
      areaName: 'Market Area',
      problemType: 'Street Light',
      citizenName: 'Lisa Wang',
      reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 1004,
      title: 'Water quality issue reported',
      description: 'Citizens reporting unusual taste and color in water supply in residential area.',
      assignedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      status: 'Resolved',
      priority: 'High',
      location: 'Green Park Colony',
      zone: 'West',
      ward: 'Ward 3',
      areaName: 'Green Park',
      problemType: 'Water Quality',
      citizenName: 'David Park',
      reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 1005,
      title: 'Traffic signal malfunction',
      description: 'Traffic signal at busy intersection is not working properly, causing traffic issues.',
      assignedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      status: 'In Progress',
      priority: 'High',
      location: '5th Street & Market',
      zone: 'Central',
      ward: 'Ward 2',
      areaName: 'Financial District',
      problemType: 'Traffic Signal',
      citizenName: 'Emily Rodriguez',
      reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  return mockComplaints;
}

// Load assigned complaints (mock data for demo)
async function loadAssignedComplaints() {
  try {
    // In real app, this would be an API call to get staff's assigned complaints
    // const response = await fetch(`/api/staff/${currentUser.id}/complaints`);
    
    // For demo, use mock data
    assignedComplaints = generateMockComplaints();
    
    console.log('Loaded assigned complaints:', assignedComplaints.length);
  } catch (error) {
    console.error('Error loading assigned complaints:', error);
    assignedComplaints = [];
  }
}

// Load recent updates
function loadRecentUpdates() {
  const today = new Date().toDateString();
  const todayUpdates = assignedComplaints.filter(complaint => 
    complaint.status === 'Resolved' && 
    new Date(complaint.assignedAt).toDateString() === today
  );
  
  recentUpdates = [
    {
      id: 1,
      date: formatDateTime(new Date()),
      message: `You have ${assignedComplaints.length} complaints assigned to you.`
    },
    {
      id: 2,
      date: formatDateTime(new Date(Date.now() - 30 * 60 * 1000)),
      message: 'New complaint #1003 assigned: Street light not working'
    },
    ...todayUpdates.map(complaint => ({
      id: complaint.id + 100,
      date: formatDateTime(new Date(complaint.assignedAt)),
      message: `Complaint #${complaint.id} marked as resolved: ${complaint.title}`
    }))
  ];
}

// Update dashboard statistics
function updateDashboardStats() {
  const assigned = assignedComplaints.length;
  const pending = assignedComplaints.filter(c => c.status === 'Pending').length;
  const inProgress = assignedComplaints.filter(c => c.status === 'In Progress').length;
  
  // Count resolved today
  const today = new Date().toDateString();
  const resolvedToday = assignedComplaints.filter(c => 
    c.status === 'Resolved' && 
    new Date(c.assignedAt).toDateString() === today
  ).length;
  
  const completionRate = assigned > 0 ? Math.round(((inProgress + resolvedToday) / assigned) * 100) : 0;
  
  document.getElementById('assignedComplaints').textContent = assigned;
  document.getElementById('pendingComplaints').textContent = pending;
  document.getElementById('inProgressComplaints').textContent = inProgress;
  document.getElementById('resolvedToday').textContent = resolvedToday;
  document.getElementById('completionRate').textContent = `${completionRate}%`;
  document.getElementById('completionProgress').style.width = `${completionRate}%`;
}

// Render complaints table
function renderComplaintsTable() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusFilterValue = statusFilter.value;
  const priorityFilterValue = priorityFilter.value;
  
  const filteredComplaints = assignedComplaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm) ||
      complaint.description.toLowerCase().includes(searchTerm) ||
      complaint.location.toLowerCase().includes(searchTerm);
    
    const matchesStatus = statusFilterValue === 'all' || complaint.status === statusFilterValue;
    const matchesPriority = priorityFilterValue === 'all' || complaint.priority === priorityFilterValue;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  if (filteredComplaints.length === 0) {
    complaintsTableBody.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }
  
  emptyState.style.display = 'none';
  
  complaintsTableBody.innerHTML = filteredComplaints.map(complaint => `
    <tr onclick="viewComplaintDetails(${complaint.id})" style="cursor: pointer;">
      <td>#${complaint.id}</td>
      <td><strong>${complaint.title}</strong></td>
      <td>${formatDateTime(complaint.assignedAt)}</td>
      <td><span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></td>
      <td><span class="priority-${complaint.priority.toLowerCase()}">${complaint.priority}</span></td>
      <td>${complaint.location}</td>
      <td>
        <button class="update-btn" onclick="event.stopPropagation(); openUpdateForm(${complaint.id})">
          <i class="fas fa-edit"></i> Update
        </button>
      </td>
    </tr>
  `).join('');
}

// Render recent updates
function renderRecentUpdates() {
  const todayCount = recentUpdates.length;
  updatesBadge.textContent = `${todayCount} today`;
  
  updatesList.innerHTML = recentUpdates.map(update => `
    <div class="notification-item">
      <div class="notification-date">
        ${update.date}
      </div>
      <p class="notification-message">${update.message}</p>
    </div>
  `).join('');
}

// Format date and time for display
function formatDateTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Open update form for specific complaint
function openUpdateForm(complaintId) {
  const complaint = assignedComplaints.find(c => c.id === complaintId);
  if (!complaint) return;
  
  selectedComplaintId = complaintId;
  
  // Update selected complaint info
  selectedComplaintInfo.innerHTML = `
    <h4>Complaint #${complaint.id}</h4>
    <p><strong>${complaint.title}</strong></p>
    <p>Current Status: <span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></p>
    <p>Priority: <span class="priority-${complaint.priority.toLowerCase()}">${complaint.priority}</span></p>
  `;
  
  // Reset form
  updateForm.reset();
  clearUpdateFormErrors();
  photoFileName.textContent = 'No file chosen';
  
  // Show form
  updateFormContainer.classList.add('show');
  updateStatus.focus();
}

// Close update form
function closeUpdateForm() {
  updateFormContainer.classList.remove('show');
  selectedComplaintId = null;
  updateForm.reset();
  clearUpdateFormErrors();
  photoFileName.textContent = 'No file chosen';
}

// Clear form errors
function clearUpdateFormErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
  });
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.classList.remove('error');
  });
}

// Validate update form
function validateUpdateForm() {
  let isValid = true;
  clearUpdateFormErrors();
  
  if (!updateStatus.value) {
    document.getElementById('statusError').textContent = 'Status is required';
    updateStatus.classList.add('error');
    isValid = false;
  }
  
  if (!updateNotes.value.trim()) {
    document.getElementById('notesError').textContent = 'Notes are required';
    updateNotes.classList.add('error');
    isValid = false;
  }
  
  return isValid;
}

// Handle update form submission
async function handleUpdateSubmit(e) {
  e.preventDefault();
  
  if (!validateUpdateForm() || !selectedComplaintId) return;
  
  // Show loading state
  updateBtn.disabled = true;
  updateBtnText.textContent = 'Updating...';
  updateSpinner.style.display = 'inline-block';
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Find and update the complaint
    const complaintIndex = assignedComplaints.findIndex(c => c.id === selectedComplaintId);
    if (complaintIndex !== -1) {
      assignedComplaints[complaintIndex].status = updateStatus.value;
      assignedComplaints[complaintIndex].lastUpdated = new Date().toISOString();
      
      // Add to recent updates
      recentUpdates.unshift({
        id: Date.now(),
        date: formatDateTime(new Date()),
        message: `Complaint #${selectedComplaintId} updated to "${updateStatus.value}": ${updateNotes.value.substring(0, 50)}...`
      });
    }
    
    // Update UI
    updateDashboardStats();
    renderComplaintsTable();
    renderRecentUpdates();
    
    // Close form and show success
    closeUpdateForm();
    alert(`Complaint #${selectedComplaintId} has been updated successfully!`);
    
  } catch (error) {
    console.error('Error updating complaint:', error);
    alert('Error updating complaint. Please try again.');
  } finally {
    // Reset button state
    updateBtn.disabled = false;
    updateBtnText.textContent = 'Update Status';
    updateSpinner.style.display = 'none';
  }
}

// View complaint details in modal
function viewComplaintDetails(id) {
  const complaint = assignedComplaints.find(c => c.id === id);
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
      <h4>Priority</h4>
      <p class="priority-${complaint.priority.toLowerCase()}">${complaint.priority}</p>
    </div>
    
    <div class="complaint-detail">
      <h4>Location</h4>
      <p>${complaint.location}</p>
    </div>
    
    <div class="complaint-detail">
      <h4>Problem Type</h4>
      <p>${complaint.problemType}</p>
    </div>
    
    <div class="complaint-detail">
      <h4>Description</h4>
      <p>${complaint.description}</p>
    </div>
    
    <div class="complaint-detail">
      <h4>Citizen</h4>
      <p>${complaint.citizenName}</p>
    </div>
    
    <div class="complaint-detail">
      <h4>Reported On</h4>
      <p>${formatDateTime(complaint.reportedAt)}</p>
    </div>
    
    <div class="complaint-detail">
      <h4>Assigned At</h4>
      <p>${formatDateTime(complaint.assignedAt)}</p>
    </div>
  `;
  
  // Store complaint ID for update button
  updateFromModalBtn.setAttribute('data-complaint-id', id);
  
  complaintModal.classList.add('show');
}

// Close modal
function closeModal() {
  complaintModal.classList.remove('show');
}

// Refresh complaints
async function refreshComplaints() {
  await loadAssignedComplaints();
  loadRecentUpdates();
  updateDashboardStats();
  renderComplaintsTable();
  renderRecentUpdates();
  
  // Show refresh animation
  refreshComplaintsBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
  setTimeout(() => {
    refreshComplaintsBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Complaints';
  }, 1000);
}

// View all assigned complaints
function viewAllAssigned() {
  // Reset filters to show all
  searchInput.value = '';
  statusFilter.value = 'all';
  priorityFilter.value = 'all';
  renderComplaintsTable();
  
  // Scroll to table
  document.getElementById('complaintsTable').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

// Logout
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('staffUser');
    window.location.href = '/signin';
  }
}

// Event Listeners
refreshComplaintsBtn.addEventListener('click', refreshComplaints);
viewAllBtn.addEventListener('click', viewAllAssigned);
closeUpdateFormBtn.addEventListener('click', closeUpdateForm);
cancelUpdateBtn.addEventListener('click', closeUpdateForm);
updateForm.addEventListener('submit', handleUpdateSubmit);

workPhoto.addEventListener('change', function() {
  photoFileName.textContent = this.files[0] ? this.files[0].name : 'No file chosen';
});

searchInput.addEventListener('input', renderComplaintsTable);
statusFilter.addEventListener('change', renderComplaintsTable);
priorityFilter.addEventListener('change', renderComplaintsTable);

logoutBtn.addEventListener('click', logout);
closeModalBtn.addEventListener('click', closeModal);
closeModalBtn2.addEventListener('click', closeModal);

updateFromModalBtn.addEventListener('click', function() {
  const complaintId = parseInt(this.getAttribute('data-complaint-id'));
  closeModal();
  openUpdateForm(complaintId);
});

// Click outside modal to close
complaintModal.addEventListener('click', function(e) {
  if (e.target === complaintModal) {
    closeModal();
  }
});

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initStaffDashboard);

// Auto-refresh every 5 minutes
setInterval(async () => {
  await loadAssignedComplaints();
  loadRecentUpdates();
  updateDashboardStats();
  renderComplaintsTable();
  renderRecentUpdates();
}, 5 * 60 * 1000);

console.log('Staff Dashboard loaded successfully');