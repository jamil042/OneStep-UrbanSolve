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

// FIXED: Check staff login using same logic as citizen dashboard
function checkStaffLogin() {
  console.log('=== CHECKING STAFF LOGIN STATUS ===');
  
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
  
  // Check if user exists and has required fields
  if (!user) {
    console.error('No user data found in storage');
    showStaffLoginError('No user session found. Please login again.');
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
      user.id = Date.now(); // Use timestamp as temporary ID
      sessionStorage.setItem('user', JSON.stringify(user));
      console.log('Added temporary ID to user:', user);
    } else {
      showStaffLoginError('Invalid user session. Please login again.');
      return null;
    }
  }
  
  // Ensure user.id is set properly
  if (!user.id && userId) {
    user.id = userId;
    sessionStorage.setItem('user', JSON.stringify(user));
    console.log('Normalized user ID field:', user);
  }
  
  console.log('✅ Staff login check passed. User ID:', user.id);
  return user;
}

// FIXED: Add a more user-friendly staff login error handler
function showStaffLoginError(message) {
  console.error('Staff login error:', message);
  
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

// FIXED: Initialize staff dashboard with proper user handling
async function initStaffDashboard() {
  console.log('=== INITIALIZING STAFF DASHBOARD ===');
  
  // Add a small delay to ensure any redirects from signin are complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  currentUser = checkStaffLogin();
  if (!currentUser) {
    console.error('Failed to get current user, stopping initialization');
    return;
  }
  
  console.log('✅ Current staff user set:', currentUser);
  
  // FIXED: Set username using actual user data (same as citizen dashboard)
  const username = currentUser.name || currentUser.username || currentUser.email || 'Staff User';
  const userElement = document.getElementById('username');
  const welcomeElement = document.getElementById('welcomeName');
  
  if (userElement) {
    userElement.textContent = username;
    console.log('Set staff username element to:', username);
  }
  if (welcomeElement) {
    const firstName = username.split(' ')[0];
    welcomeElement.textContent = firstName;
    console.log('Set staff welcome element to:', firstName);
  }
  
  // Make currentUser globally accessible for debugging
  window.currentUser = currentUser;
  window.assignedComplaints = assignedComplaints;
  
  console.log('🔍 Debug info available in window.currentUser and window.assignedComplaints');
  
  // Load assigned complaints
  console.log('Loading assigned complaints...');
  await loadAssignedComplaints();
  
  // Load recent updates
  loadRecentUpdates();
  
  // Update dashboard stats
  updateDashboardStats();
  
  // Render complaints table
  renderComplaintsTable();
  
  // Render recent updates
  renderRecentUpdates();
  
  console.log('✅ Staff dashboard initialization complete');
}

// IMPROVED: Load assigned complaints with better error handling
async function loadAssignedComplaints() {
  if (!currentUser || !currentUser.id) {
    console.error('Cannot load assigned complaints: currentUser or currentUser.id is missing');
    return;
  }
  
  try {
    const staffId = currentUser.id;
    console.log(`Loading assigned complaints for staff ID: ${staffId}`);
    
    // 1. UNCOMMENT THIS: This is the real API call
    const response = await fetch(`/api/complaints/staff/${staffId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch complaints: ${response.status}`);
    }
    
    // 2. This line now gets REAL data from the server
    assignedComplaints = await response.json();
    
    // 3. REMOVE THE MOCK DATA CALL: The line below is no longer needed
    // assignedComplaints = generateMockComplaints();
    
    console.log('Loaded', assignedComplaints.length, 'assigned complaints for staff:', currentUser.name || currentUser.email);

  } catch (error) {
    console.error('Error loading assigned complaints:', error);
    assignedComplaints = []; // Clear complaints on error to avoid showing stale data
    alert('Failed to load your assigned complaints. Please check the console and try refreshing the page.');
  }
}

// Load recent updates
function loadRecentUpdates() {
  const today = new Date().toDateString();
  const todayUpdates = assignedComplaints.filter(complaint => 
    complaint.status === 'Resolved' && 
    new Date(complaint.assignedAt).toDateString() === today
  );
  
  // IMPROVED: Use actual user name in updates
  const staffName = currentUser ? (currentUser.name || currentUser.username || 'You') : 'You';
  
  recentUpdates = [
    {
      id: 1,
      date: formatDateTime(new Date()),
      message: `${staffName} have ${assignedComplaints.length} complaints assigned.`
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
  
  console.log('Updating staff dashboard stats:', { assigned, pending, inProgress, resolvedToday, completionRate });
  
  // Update DOM elements
  const assignedElement = document.getElementById('assignedComplaints');
  const pendingElement = document.getElementById('pendingComplaints');
  const inProgressElement = document.getElementById('inProgressComplaints');
  const resolvedTodayElement = document.getElementById('resolvedToday');
  const completionRateElement = document.getElementById('completionRate');
  const completionProgressElement = document.getElementById('completionProgress');
  
  if (assignedElement) assignedElement.textContent = assigned;
  if (pendingElement) pendingElement.textContent = pending;
  if (inProgressElement) inProgressElement.textContent = inProgress;
  if (resolvedTodayElement) resolvedTodayElement.textContent = resolvedToday;
  if (completionRateElement) completionRateElement.textContent = `${completionRate}%`;
  if (completionProgressElement) completionProgressElement.style.width = `${completionRate}%`;
}

// Render complaints table
function renderComplaintsTable() {
  console.log('Rendering staff complaints table, total complaints:', assignedComplaints.length);
  
  if (!complaintsTableBody) {
    console.error('complaintsTableBody element not found');
    return;
  }
  
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const statusFilterValue = statusFilter ? statusFilter.value : 'all';
  const priorityFilterValue = priorityFilter ? priorityFilter.value : 'all';
  
  const filteredComplaints = assignedComplaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm) ||
      complaint.description.toLowerCase().includes(searchTerm) ||
      complaint.location.toLowerCase().includes(searchTerm);
    
    const matchesStatus = statusFilterValue === 'all' || complaint.status === statusFilterValue;
    const matchesPriority = priorityFilterValue === 'all' || complaint.priority === priorityFilterValue;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  console.log('Filtered complaints for staff display:', filteredComplaints.length);
  
  if (filteredComplaints.length === 0) {
    complaintsTableBody.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'flex';
      console.log('Showing empty state for staff');
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
  
  console.log('Staff complaints table rendered successfully');
}

// Render recent updates
function renderRecentUpdates() {
  const todayCount = recentUpdates.length;
  if (updatesBadge) {
    updatesBadge.textContent = `${todayCount} today`;
  }
  
  if (updatesList) {
    updatesList.innerHTML = recentUpdates.map(update => `
      <div class="notification-item">
        <div class="notification-date">
          ${update.date}
        </div>
        <p class="notification-message">${update.message}</p>
      </div>
    `).join('');
  }
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
  if (selectedComplaintInfo) {
    selectedComplaintInfo.innerHTML = `
      <h4>Complaint #${complaint.id}</h4>
      <p><strong>${complaint.title}</strong></p>
      <p>Current Status: <span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></p>
      <p>Priority: <span class="priority-${complaint.priority.toLowerCase()}">${complaint.priority}</span></p>
    `;
  }
  
  // Reset form
  if (updateForm) updateForm.reset();
  clearUpdateFormErrors();
  if (photoFileName) photoFileName.textContent = 'No file chosen';
  
  // Show form
  if (updateFormContainer) {
    updateFormContainer.classList.add('show');
  }
  if (updateStatus) updateStatus.focus();
}

// Close update form
function closeUpdateForm() {
  if (updateFormContainer) {
    updateFormContainer.classList.remove('show');
  }
  selectedComplaintId = null;
  if (updateForm) updateForm.reset();
  clearUpdateFormErrors();
  if (photoFileName) photoFileName.textContent = 'No file chosen';
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
  
  if (!updateStatus || !updateStatus.value) {
    const statusError = document.getElementById('statusError');
    if (statusError) statusError.textContent = 'Status is required';
    if (updateStatus) updateStatus.classList.add('error');
    isValid = false;
  }
  
  if (!updateNotes || !updateNotes.value.trim()) {
    const notesError = document.getElementById('notesError');
    if (notesError) notesError.textContent = 'Notes are required';
    if (updateNotes) updateNotes.classList.add('error');
    isValid = false;
  }
  
  return isValid;
}

// Handle update form submission
// staff_dashboard.js

async function handleUpdateSubmit(e) {
  e.preventDefault();
  
  if (!validateUpdateForm() || !selectedComplaintId) return;
  
  // Show loading state
  if (updateBtn) updateBtn.disabled = true;
  if (updateBtnText) updateBtnText.textContent = 'Updating...';
  if (updateSpinner) updateSpinner.style.display = 'inline-block';
  
  try {
    // FIXED: Removed '/api' prefix to match backend route
    const response = await fetch(`/api/complaints/${selectedComplaintId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            status: updateStatus.value,
            notes: updateNotes.value,
            staffId: currentUser.id
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update complaint on the server.');
    }

    const result = await response.json();

    if (result.success) {
        await refreshComplaints();
        alert(`Complaint #${selectedComplaintId} has been updated successfully!`);
        closeUpdateForm();
        
    } else {
        throw new Error(result.message || 'An unknown error occurred.');
    }
    
  } catch (error) {
    console.error('Error updating complaint:', error);
    alert('Error updating complaint: ' + error.message);
  } finally {
    // Reset button state
    if (updateBtn) updateBtn.disabled = false;
    if (updateBtnText) updateBtnText.textContent = 'Update Status';
    if (updateSpinner) updateSpinner.style.display = 'none';
  }
}
// View complaint details in modal
function viewComplaintDetails(id) {
  const complaint = assignedComplaints.find(c => c.id === id);
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
  }
  
  // Store complaint ID for update button
  if (updateFromModalBtn) {
    updateFromModalBtn.setAttribute('data-complaint-id', id);
  }
  
  if (complaintModal) {
    complaintModal.classList.add('show');
  }
}

// Close modal
function closeModal() {
  if (complaintModal) {
    complaintModal.classList.remove('show');
  }
}

// Refresh complaints
async function refreshComplaints() {
  await loadAssignedComplaints();
  loadRecentUpdates();
  updateDashboardStats();
  renderComplaintsTable();
  renderRecentUpdates();
  
  // Show refresh animation
  if (refreshComplaintsBtn) {
    refreshComplaintsBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
    setTimeout(() => {
      refreshComplaintsBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Complaints';
    }, 1000);
  }
}

// View all assigned complaints
function viewAllAssigned() {
  // Reset filters to show all
  if (searchInput) searchInput.value = '';
  if (statusFilter) statusFilter.value = 'all';
  if (priorityFilter) priorityFilter.value = 'all';
  renderComplaintsTable();
  
  // Scroll to table
  const complaintsTable = document.getElementById('complaintsTable');
  if (complaintsTable) {
    complaintsTable.scrollIntoView({ behavior: 'smooth' });
  }
}

// FIXED: Logout function using same logic as citizen dashboard
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user'); // Also clear localStorage
    window.location.href = '/signin.html';
  }
}

// Event Listeners
if (refreshComplaintsBtn) refreshComplaintsBtn.addEventListener('click', refreshComplaints);
if (viewAllBtn) viewAllBtn.addEventListener('click', viewAllAssigned);
if (closeUpdateFormBtn) closeUpdateFormBtn.addEventListener('click', closeUpdateForm);
if (cancelUpdateBtn) cancelUpdateBtn.addEventListener('click', closeUpdateForm);
if (updateForm) updateForm.addEventListener('submit', handleUpdateSubmit);

if (workPhoto) {
  workPhoto.addEventListener('change', function() {
    if (photoFileName) {
      photoFileName.textContent = this.files[0] ? this.files[0].name : 'No file chosen';
    }
  });
}

if (searchInput) searchInput.addEventListener('input', renderComplaintsTable);
if (statusFilter) statusFilter.addEventListener('change', renderComplaintsTable);
if (priorityFilter) priorityFilter.addEventListener('change', renderComplaintsTable);

if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (closeModalBtn2) closeModalBtn2.addEventListener('click', closeModal);

if (updateFromModalBtn) {
  updateFromModalBtn.addEventListener('click', function() {
    const complaintId = parseInt(this.getAttribute('data-complaint-id'));
    closeModal();
    openUpdateForm(complaintId);
  });
}

// Click outside modal to close
if (complaintModal) {
  complaintModal.addEventListener('click', function(e) {
    if (e.target === complaintModal) {
      closeModal();
    }
  });
}

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

// Make functions globally accessible for debugging
window.loadAssignedComplaints = loadAssignedComplaints;
window.updateDashboardStats = updateDashboardStats;
window.renderComplaintsTable = renderComplaintsTable;
window.checkStaffLogin = checkStaffLogin;

console.log('Staff Dashboard loaded successfully');