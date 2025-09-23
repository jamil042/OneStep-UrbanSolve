// DOM Elements - FIXED: Updated to match HTML IDs
const addDepartmentBtn = document.getElementById('addDepartmentBtn');
const addProblemTypeBtn = document.getElementById('addProblemTypeBtn');
const addStaffBtn = document.getElementById('addStaffBtn');
const viewAllComplaintsBtn = document.getElementById('viewAllComplaintsBtn');
const assignmentFormContainer = document.getElementById('assignmentFormContainer');
const closeAssignmentFormBtn = document.getElementById('closeAssignmentFormBtn');
const cancelAssignmentBtn = document.getElementById('cancelAssignmentBtn');
const assignmentForm = document.getElementById('assignmentForm');
const selectedComplaintInfo = document.getElementById('selectedComplaintInfo');

// FIXED: Changed from 'assignDepartment' to 'staffDepartment' to match HTML
const assignDepartment = document.getElementById('staffDepartment');
const assignStaff = document.getElementById('assignStaff');
const assignPriority = document.getElementById('assignPriority');
const assignNotes = document.getElementById('assignNotes');

const complaintsTableBody = document.getElementById('complaintsTableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const departmentFilter = document.getElementById('departmentFilter');
const staffList = document.getElementById('staffList');
const staffBadge = document.getElementById('staffBadge');
const logsList = document.getElementById('logsList');
const logsBadge = document.getElementById('logsBadge');
const logoutBtn = document.getElementById('logoutBtn');
const complaintModal = document.getElementById('complaintModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalBtn2 = document.getElementById('closeModalBtn2');
const assignFromModalBtn = document.getElementById('assignFromModalBtn');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const notificationBadge = document.getElementById('notificationBadge');

// Modal elements
const departmentModal = document.getElementById('departmentModal');
const staffModal = document.getElementById('staffModal');
const closeDepartmentModalBtn = document.getElementById('closeDepartmentModalBtn');
const closeStaffModalBtn = document.getElementById('closeStaffModalBtn');
const departmentForm = document.getElementById('departmentForm');
const staffForm = document.getElementById('staffForm');
const saveDepartmentBtn = document.getElementById('saveDepartmentBtn');
const saveStaffBtn = document.getElementById('saveStaffBtn');
const cancelDepartmentBtn = document.getElementById('cancelDepartmentBtn');
const cancelStaffBtn = document.getElementById('cancelStaffBtn');

// Global variables
let allComplaints = [];
let staffMembers = [];
let systemLogs = [];
let currentUser = null;
let selectedComplaintId = null;
let departmentChart = null;
let trendsChart = null;

// Check admin login
function checkAdminLogin() {
  console.log('=== CHECKING ADMIN LOGIN STATUS ===');
  
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
    showAdminLoginError('No user session found. Please login again.');
    return null;
  }
  
  // Check for user ID (try different possible field names)
  const userId = user.user_id ;
  if (!userId) {
    console.error('User object missing ID field:', user);
    console.log('Available user fields:', Object.keys(user));
    
    // TEMPORARY FIX: If we have email but no ID, create a temporary ID
    if (user.email) {
      console.warn('User has email but no ID, creating temporary session...');
      user.user_id = Date.now(); // Use timestamp as temporary ID
      sessionStorage.setItem('user', JSON.stringify(user));
      console.log('Added temporary ID to user:', user);
    } else {
      showAdminLoginError('Invalid user session. Please login again.');
      return null;
    }
  }
  
  // Ensure user.id is set properly
  if (!user.user_id && userId) {
    user.user_id = userId;
    sessionStorage.setItem('user', JSON.stringify(user));
    console.log('Normalized user ID field:', user);
  }
  
  console.log('✅ Admin login check passed. User ID:', user.user_id);
  return user;
}

function showAdminLoginError(message) {
  console.error('Admin login error:', message);
  
  const shouldRedirect = confirm(
    `${message}\n\nWould you like to go to the login page now?`
  );
  
  if (shouldRedirect) {
    window.location.href = '/signin.html';
  } else {
    console.log('User chose to stay on page for debugging');
  }
}

// Initialize admin dashboard
async function initAdminDashboard() {
  console.log('=== INITIALIZING ADMIN DASHBOARD ===');
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  currentUser = checkAdminLogin();
  if (!currentUser) {
    console.error('Failed to get current user, stopping initialization');
    return;
  }
  
  console.log('✅ Current admin user set:', currentUser);
  
  // Set username
  const username = currentUser.name || currentUser.username || currentUser.email || 'Admin User';
  const userElement = document.getElementById('username');
  const welcomeElement = document.getElementById('welcomeName');
  
  if (userElement) {
    userElement.textContent = username;
    console.log('Set admin username element to:', username);
  }
  if (welcomeElement) {
    const firstName = username.split(' ')[0];
    welcomeElement.textContent = firstName;
    console.log('Set admin welcome element to:', firstName);
  }
  
  // Make currentUser globally accessible for debugging
  window.currentUser = currentUser;
  window.allComplaints = allComplaints;
  
  console.log('🔍 Debug info available in window.currentUser and window.allComplaints');
  
  // Load all data
  console.log('Loading admin dashboard data...');
  await loadAllComplaints();
  loadStaffMembers();
  loadSystemLogs();
  
  // Update dashboard
  updateDashboardStats();
  renderComplaintsTable();
  renderStaffList();
  renderSystemLogs();
  initializeCharts();
  updateNotificationBadge();
  
  console.log('✅ Admin dashboard initialization complete');
}


// Load all complaints
async function loadAllComplaints() {
  try {
    console.log('Loading all complaints for admin from /api/admin/complaints');
    const response = await fetch('/api/admin/complaints');
    if (!response.ok) {
      throw new Error('Failed to fetch complaints: ' + response.status);
    }
    allComplaints = await response.json();
    console.log('Loaded', allComplaints.length, 'complaints for admin dashboard');
    console.log('First complaint data structure:', allComplaints[0]);
    
  } catch (error) {
    console.error('Error loading complaints:', error);
    // Don't fall back to mock data
    allComplaints = [];
    alert('Failed to load complaints. Please check console for details.');
  }
}

// Generate mock staff data
function generateMockStaff() {
  return [
    {
      id: 101,
      name: 'John Smith',
      email: 'john.smith@city.gov',
      department: 'Road Maintenance',
      status: 'available',
      complaintsHandled: 24,
      performance: 4.5
    },
    {
      id: 102,
      name: 'Maria Garcia',
      email: 'maria.garcia@city.gov',
      department: 'Water Management',
      status: 'busy',
      complaintsHandled: 18,
      performance: 4.8
    },
    {
      id: 103,
      name: 'Robert Johnson',
      email: 'robert.j@city.gov',
      department: 'Electrical',
      status: 'available',
      complaintsHandled: 31,
      performance: 4.2
    },
    {
      id: 104,
      name: 'Lisa Davis',
      email: 'lisa.davis@city.gov',
      department: 'Sanitation',
      status: 'available',
      complaintsHandled: 15,
      performance: 4.7
    }
  ];
}

// Load staff members
async function loadStaffMembers() {
  try {
    console.log('Loading staff members from /api/admin/staff');
    const response = await fetch('/api/admin/staff');
    if (!response.ok) {
      throw new Error('Failed to fetch staff: ' + response.status);
    }
    
    const data = await response.json();
    console.log('Loaded raw staff data:', data);
    
    // Map the received data to our expected format
    staffMembers = data.map(staff => ({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      department: staff.department,
      status: staff.status,
      active_assignments: staff.active_assignments || 0,
      performance: staff.performance || 5.0
    }));
    
    console.log('Processed', staffMembers.length, 'staff members from database');
    
  } catch (error) {
    console.error('Error loading staff members:', error);
    // Don't fallback to mock data in production
    staffMembers = [];
    alert('Error loading staff members. Please refresh the page to try again.');
  }
}

// Load system logs

// Load system logs
function loadSystemLogs() {
  const adminName = currentUser ? (currentUser.name || currentUser.username || 'Admin') : 'Admin';
  
  systemLogs = [
    {
      id: 1,
      timestamp: new Date(),
      action: `${adminName} logged into admin dashboard`,
      type: 'success'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      action: 'Complaint #1003 assigned to John Smith',
      type: 'success'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      action: 'New complaint #1006 received from Tom Wilson',
      type: 'warning'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      action: 'Complaint #1004 marked as resolved',
      type: 'success'
    }
  ];
}

// Update dashboard statistics
function updateDashboardStats() {
  const total = allComplaints.length;
  const pending = allComplaints.filter(c => c.status === 'Pending').length;
  const inProgress = allComplaints.filter(c => c.status === 'In Progress').length;
  const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
  
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  
  console.log('Updating admin dashboard stats:', { total, pending, inProgress, resolved, resolutionRate });
  
  // Update DOM elements
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

// Update notification badge
function updateNotificationBadge() {
  const pendingCount = allComplaints.filter(c => c.status === 'Pending').length;
  if (notificationBadge) {
    notificationBadge.textContent = pendingCount;
    notificationBadge.style.display = pendingCount > 0 ? 'flex' : 'none';
  }
}

async function fetchAndPopulateDepartments() {
  console.log('Fetching departments from DB...');
  try {
    const response = await fetch('/api/admin/departments');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const departments = await response.json();
    const staffDepartmentSelect = document.getElementById('staffDepartment');

    // Clear existing options, keeping the first "Select department" option
    while (staffDepartmentSelect.options.length > 1) {
      staffDepartmentSelect.remove(1);
    }

    // Populate with departments from the database
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept.name;
      option.textContent = dept.name;
      staffDepartmentSelect.appendChild(option);
    });

    console.log('Departments populated successfully.');

  } catch (error) {
    console.error('Failed to fetch departments:', error);
  }
}



// Render complaints table
function renderComplaintsTable() {
  console.log('Rendering admin complaints table, total complaints:', allComplaints.length);
  
  if (!complaintsTableBody) {
    console.error('complaintsTableBody element not found');
    return;
  }
  
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const statusFilterValue = statusFilter ? statusFilter.value : 'all';
  const departmentFilterValue = departmentFilter ? departmentFilter.value : 'all';
  
  const filteredComplaints = allComplaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm) ||
      complaint.description.toLowerCase().includes(searchTerm) ||
      complaint.citizen_name.toLowerCase().includes(searchTerm) ||
      complaint.location.toLowerCase().includes(searchTerm);
    
    const matchesStatus = statusFilterValue === 'all' || complaint.status === statusFilterValue;
    const matchesDepartment = departmentFilterValue === 'all' || complaint.department === departmentFilterValue;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });
  
  console.log('Filtered complaints for admin display:', filteredComplaints.length);
  
  if (filteredComplaints.length === 0) {
    complaintsTableBody.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'flex';
      console.log('Showing empty state for admin');
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
    <td>${complaint.citizenName}</td>
    <td>${complaint.department || 'Not Assigned'}</td>
    <td>${complaint.assignedStaff || 'Not Assigned'}</td>
    <td><span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></td>
    <td>${formatDateTime(complaint.reportedAt)}</td>
    <td>
      <button class="assign-btn" onclick="event.stopPropagation(); openAssignmentForm(${complaint.id})" ${complaint.status === 'Resolved' ? 'disabled' : ''}>
        <i class="fas fa-user-tag"></i> ${complaint.status === 'Pending' ? 'Assign' : 'Reassign'}
      </button>
    </td>
  </tr>
`).join('');
  
  console.log('Admin complaints table rendered successfully');
}

// Render staff list
function renderStaffList() {
  if (staffBadge) {
    staffBadge.textContent = `${staffMembers.length} staff members`;
  }
  
  if (staffList) {
    staffList.innerHTML = staffMembers.map(staff => `
      <div class="staff-item">
        <div class="staff-info">
          <span class="staff-name">${staff.name}</span>
          <span class="staff-status ${staff.status}">${staff.status}</span>
        </div>
        <div class="staff-details">
          <div>${staff.department}</div>
          <div>${staff.email}</div>
        </div>
        <div class="staff-performance">
          <div class="performance-stars">
            ${'★'.repeat(Math.floor(staff.performance))}${'☆'.repeat(5 - Math.floor(staff.performance))}
          </div>
          <span class="complaints-count">${staff.complaintsHandled} complaints handled</span>
        </div>
      </div>
    `).join('');
  }
}

// Render system logs
function renderSystemLogs() {
  const today = new Date().toDateString();
  const todayLogs = systemLogs.filter(log => 
    new Date(log.timestamp).toDateString() === today
  );
  
  if (logsBadge) {
    logsBadge.textContent = `${todayLogs.length} today`;
  }
  
  if (logsList) {
    logsList.innerHTML = systemLogs.map(log => `
      <div class="log-item ${log.type}">
        <span class="log-time">${formatDateTime(log.timestamp)}</span>
        ${log.action}
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

// Open assignment form
async function openAssignmentForm(complaintId) {
  try {
    const complaint = allComplaints.find(c => c.id === complaintId || c.complaint_id === complaintId);
    if (!complaint) {
      console.error('Complaint not found with ID:', complaintId);
      return;
    }
    
    selectedComplaintId = complaint.id || complaint.complaint_id;
    
    if (selectedComplaintInfo) {
      selectedComplaintInfo.innerHTML = `
        <h4>Complaint #${selectedComplaintId}</h4>
        <p><strong>${complaint.title}</strong></p>
        <p>Reported by: ${complaint.citizenName || 'Unknown'}</p>
        <p>Location: ${complaint.location || 'Unknown location'}</p>
        <p>Current Status: <span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></p>
      `;
    }
    
    // --- FIX IS HERE ---
    // Fetch departments and staff from the server
    const [deptResponse, staffResponse] = await Promise.all([
        fetch('/api/admin/departments'),
        fetch('/api/admin/staff')
    ]);

    if (!deptResponse.ok) throw new Error('Failed to fetch departments');
    if (!staffResponse.ok) throw new Error('Failed to fetch staff');

    const departments = await deptResponse.json();
    const staffMembers = await staffResponse.json();
    
    // Clear and populate department dropdown from the database
    if (assignDepartment) {
      assignDepartment.innerHTML = '<option value="">Select Department</option>';
      departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.name; // Use department name as value
        option.textContent = dept.name;
        assignDepartment.appendChild(option);
      });
    }
    
    // Store staff members globally for the dropdown update function
    window.availableStaff = staffMembers;
    
    // Set up staff dropdown
    if (assignStaff) {
      assignStaff.innerHTML = '<option value="">Select Staff Member</option>';
      staffMembers.forEach(staff => {
          const option = document.createElement('option');
          option.value = staff.name;
          option.textContent = `${staff.name} (${staff.active_assignments || 0} active cases)`;
          assignStaff.appendChild(option);
      });
    }
    
    // Pre-fill form if already assigned
    if (complaint.department && assignDepartment) assignDepartment.value = complaint.department;
    if (complaint.assignedStaff && assignStaff) assignStaff.value = complaint.assignedStaff;
    
    // Set up priority options
    if (assignPriority) {
        assignPriority.innerHTML = `
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
        `;
        if (complaint.priority) assignPriority.value = complaint.priority;
    }
    
    // Show form
    if (assignmentFormContainer) assignmentFormContainer.classList.add('show');
    if (assignDepartment) assignDepartment.focus();
    
  } catch (error) {
    console.error('Error opening assignment form:', error);
    alert('Error loading assignment data. Please try again.');
  }
}

// Close assignment form
function closeAssignmentForm() {
  if (assignmentFormContainer) {
    assignmentFormContainer.classList.remove('show');
  }
  selectedComplaintId = null;
  if (assignmentForm) assignmentForm.reset();
  clearAssignmentFormErrors();
}

// Update staff dropdown based on selected department
async function updateStaffDropdown() {
  if (!assignStaff || !assignDepartment) return;
  
  try {
    const selectedDepartment = assignDepartment.value;
    
    // Clear and set default option
    assignStaff.innerHTML = '<option value="">Select staff member</option>';
    
    // If no department is selected, do nothing further
    if (!selectedDepartment) return;
    
    // --- FIX IS HERE ---
    // The original code tried to filter staff, but the API doesn't provide
    // department info for each staff member. This new code simply shows all staff.
    // In the future, you can update the GET /api/admin/staff endpoint and
    // re-add the filtering logic here.
    
    if (window.availableStaff && window.availableStaff.length > 0) {
        window.availableStaff.forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.name;
            // Display active cases to help the admin choose
            const activeCases = staff.active_assignments || 0;
            option.textContent = `${staff.name} (${activeCases} active cases)`;
            assignStaff.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'No staff members found';
        assignStaff.appendChild(option);
    }
    
  } catch (error) {
    console.error('Error updating staff dropdown:', error);
    const option = document.createElement('option');
    option.disabled = true;
    option.textContent = 'Error loading staff members';
    assignStaff.appendChild(option);
  }
}
// Clear form errors
function clearAssignmentFormErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
  });
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.classList.remove('error');
  });
}

// Validate assignment form
function validateAssignmentForm() {
  let isValid = true;
  clearAssignmentFormErrors();
  
  if (!assignDepartment || !assignDepartment.value) {
    const departmentError = document.getElementById('departmentError');
    if (departmentError) departmentError.textContent = 'Department is required';
    if (assignDepartment) assignDepartment.classList.add('error');
    isValid = false;
  }
  
  if (!assignStaff || !assignStaff.value) {
    const staffError = document.getElementById('staffError');
    if (staffError) staffError.textContent = 'Staff assignment is required';
    if (assignStaff) assignStaff.classList.add('error');
    isValid = false;
  }
  
  if (!assignPriority || !assignPriority.value) {
    const priorityError = document.getElementById('priorityError');
    if (priorityError) priorityError.textContent = 'Priority is required';
    if (assignPriority) assignPriority.classList.add('error');
    isValid = false;
  }
  
  return isValid;
}

// Handle assignment form submission
async function handleAssignmentSubmit(e) {
  e.preventDefault();
  
  if (!validateAssignmentForm() || !selectedComplaintId) return;
  
  try {
    // Show loading state
    const assignBtn = assignmentForm.querySelector('button[type="submit"]');
    const assignBtnText = document.getElementById('assignBtnText');
    const assignSpinner = document.getElementById('assignSpinner');
    
    if (assignBtn) assignBtn.disabled = true;
    if (assignBtnText) assignBtnText.textContent = 'Assigning...';
    if (assignSpinner) assignSpinner.style.display = 'inline-block';
    
    // Send assignment request to admin endpoint
    const response = await fetch(`/api/admin/complaints/${selectedComplaintId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        department: assignDepartment.value,
        assignedStaff: assignStaff.value,
        priority: assignPriority.value,
        notes: assignNotes.value
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to assign complaint');
    }
    
    const result = await response.json();
    
    // ... inside handleAssignmentSubmit
if (result.success) {
    // Option 1: Trust the server response and update UI
    // The server response `result` could contain the updated complaint object.
    // If it does, you can update the local array and render without re-fetching everything.
    // However, since the current code re-fetches, we will correct that logic.

    // Option 2: Ensure re-fetch completes before re-render (safer approach)

    // First, update the local data temporarily for a smooth UI transition.
    // This part is already correct.
    const complaintIndex = allComplaints.findIndex(c => c.id === selectedComplaintId || c.complaint_id === selectedComplaintId);
    if (complaintIndex !== -1) {
        allComplaints[complaintIndex].department = assignDepartment.value;
        allComplaints[complaintIndex].assignedStaff = assignStaff.value;
        allComplaints[complaintIndex].priority = assignPriority.value;
        allComplaints[complaintIndex].status = 'In Progress';
        
        // Add to system logs
        const adminName = currentUser ? (currentUser.name || currentUser.username || 'Admin') : 'Admin';
        systemLogs.unshift({
            id: Date.now(),
            timestamp: new Date(),
            action: `${adminName} assigned complaint #${selectedComplaintId} to ${assignStaff.value}`,
            type: 'success'
        });
    }

    // Await both promises to ensure data is fresh.
    await loadAllComplaints(); // This will fetch the latest data from the server
    await loadDashboardStats(); // This will update the stats from the server
    
    // Now that the data is guaranteed to be up-to-date, re-render the UI.
    renderComplaintsTable();
    renderSystemLogs();
    updateNotificationBadge();
    
    // Close form and show success
    alert(`Complaint #${selectedComplaintId} has been assigned successfully to ${assignStaff.value}!`);
    closeAssignmentForm();
}
// ...
    else {
      throw new Error(result.error || 'Failed to assign complaint');
    }
    
  } catch (error) {
    console.error('Error assigning complaint:', error);
    alert('Error assigning complaint: ' + error.message);
  } finally {
    // Reset button state
    const assignBtn = assignmentForm.querySelector('button[type="submit"]');
    const assignBtnText = document.getElementById('assignBtnText');
    const assignSpinner = document.getElementById('assignSpinner');
    
    if (assignBtn) assignBtn.disabled = false;
    if (assignBtnText) assignBtnText.textContent = 'Assign Complaint';
    if (assignSpinner) assignSpinner.style.display = 'none';
  }
}


// Add this function to fetch stats from your admin endpoint
async function loadDashboardStats() {
  try {
    console.log('Loading dashboard stats from /api/admin/stats');
    const response = await fetch('/api/admin/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch stats: ' + response.status);
    }
    const stats = await response.json();
    console.log('Loaded dashboard stats:', stats);
    
    // Update DOM elements
    const totalElement = document.getElementById('totalComplaints');
    const pendingElement = document.getElementById('pendingComplaints');
    const inProgressElement = document.getElementById('inProgressComplaints');
    const resolvedElement = document.getElementById('resolvedComplaints');
    const resolutionRateElement = document.getElementById('resolutionRate');
    const resolutionProgressElement = document.getElementById('resolutionProgress');
    
    if (totalElement) totalElement.textContent = stats.total;
    if (pendingElement) pendingElement.textContent = stats.pending;
    if (inProgressElement) inProgressElement.textContent = stats.inProgress;
    if (resolvedElement) resolvedElement.textContent = stats.resolved;
    if (resolutionRateElement) resolutionRateElement.textContent = `${stats.resolutionRate}%`;
    if (resolutionProgressElement) resolutionProgressElement.style.width = `${stats.resolutionRate}%`;
    
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    // Fallback to calculating from allComplaints
    updateDashboardStats();
  }
}

// Update your initAdminDashboard function to use the new stats function
async function initAdminDashboard() {
  console.log('=== INITIALIZING ADMIN DASHBOARD ===');

  await new Promise(resolve => setTimeout(resolve, 100));

  currentUser = checkAdminLogin();
  if (!currentUser) {
    console.error('Failed to get current user, stopping initialization');
    return;
  }

  console.log('✅ Current admin user set:', currentUser);

  // Set username
  const username = currentUser.name || currentUser.username || currentUser.email || 'Admin User';
  const userElement = document.getElementById('username');
  const welcomeElement = document.getElementById('welcomeName');

  if (userElement) {
    userElement.textContent = username;
    console.log('Set admin username element to:', username);
  }
  if (welcomeElement) {
    const firstName = username.split(' ')[0];
    welcomeElement.textContent = firstName;
    console.log('Set admin welcome element to:', firstName);
  }

  // Make currentUser globally accessible for debugging
  window.currentUser = currentUser;
  window.allComplaints = allComplaints;

  console.log('🔍 Debug info available in window.currentUser and window.allComplaints');

  // Load all data
  console.log('Loading admin dashboard data...');
  await loadAllComplaints();
  loadStaffMembers();
  loadSystemLogs();
  await fetchAndPopulateDepartments(); // This is the new line you should add

  // Update dashboard
  updateDashboardStats();
  renderComplaintsTable();
  renderStaffList();
  renderSystemLogs();
  initializeCharts();
  updateNotificationBadge();

  console.log('✅ Admin dashboard initialization complete');
}

// View complaint details in modal
function viewComplaintDetails(complaintId) {
  // Find complaint - try both id and complaint_id fields
  const complaint = allComplaints.find(c => c.id === complaintId || c.complaint_id === complaintId);
  if (!complaint) {
    console.error('Complaint not found with ID:', complaintId);
    return;
  }
  
  if (modalTitle) modalTitle.textContent = `Complaint #${complaint.id || complaint.complaint_id}`;
  
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
        <h4>Description</h4>
        <p>${complaint.description}</p>
      </div>
      
      <div class="complaint-detail">
        <h4>Citizen Information</h4>
        <p><strong>Name:</strong> ${complaint.citizenName || complaint.citizen_name || 'Unknown'}</p>
        <p><strong>Email:</strong> ${complaint.citizenEmail || complaint.citizen_email || 'Not provided'}</p>
      </div>
      
      <div class="complaint-detail">
        <h4>Location Details</h4>
        <p><strong>Location:</strong> ${complaint.location || 'Not specified'}</p>
        <p><strong>Ward:</strong> ${complaint.ward || 'Not specified'}</p>
        <p><strong>Zone:</strong> ${complaint.zone || 'Not specified'}</p>
        <p><strong>Area:</strong> ${complaint.areaName || complaint.area_name || 'Not specified'}</p>
      </div>
      
      <div class="complaint-detail">
        <h4>Assignment Information</h4>
        <p><strong>Department:</strong> ${complaint.department || 'Not Assigned'}</p>
        <p><strong>Assigned Staff:</strong> ${complaint.assignedStaff || complaint.assigned_staff_name || 'Not Assigned'}</p>
        <p><strong>Priority:</strong> ${complaint.priority || 'Not Set'}</p>
      </div>
      
      <div class="complaint-detail">
        <h4>Timeline</h4>
        <p><strong>Reported:</strong> ${formatDateTime(complaint.reportedAt || complaint.created_at)}</p>
        ${complaint.assigned_at ? `<p><strong>Assigned:</strong> ${formatDateTime(complaint.assigned_at)}</p>` : ''}
        ${complaint.updated_at && complaint.updated_at !== (complaint.reportedAt || complaint.created_at) ? 
          `<p><strong>Last Updated:</strong> ${formatDateTime(complaint.updated_at)}</p>` : ''}
      </div>
    `;
  }
  
  // Store complaint ID for assign button
  if (assignFromModalBtn) {
    const actualComplaintId = complaint.id || complaint.complaint_id;
    assignFromModalBtn.setAttribute('data-complaint-id', actualComplaintId);
    assignFromModalBtn.style.display = complaint.status === 'Resolved' ? 'none' : 'inline-block';
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

// Initialize charts
function initializeCharts() {
  initializeDepartmentChart();
  initializeTrendsChart();
}

// Initialize department distribution chart
function initializeDepartmentChart() {
  const ctx = document.getElementById('departmentChart');
  if (!ctx) return;
  
  const departmentCounts = {
    'WATER': 0,
    'ROADS': 0,
    'WASTE': 0,
    'ELECTRICITY': 0,
    'GENERAL': 0,
    'Unassigned': 0
  };
  
  allComplaints.forEach(complaint => {
    const dept = complaint.department || 'Unassigned';
    if (departmentCounts.hasOwnProperty(dept)) {
      departmentCounts[dept]++;
    }
  });
  
  departmentChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(departmentCounts),
      datasets: [{
        data: Object.values(departmentCounts),
        backgroundColor: [
          '#7c3aed',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#6b7280'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Initialize trends chart
function initializeTrendsChart() {
  const ctx = document.getElementById('trendsChart');
  if (!ctx) return;
  
  // Generate mock trend data for the last 7 days
  const last7Days = [];
  const complaintsPerDay = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Mock data - in reality this would come from API
    complaintsPerDay.push(Math.floor(Math.random() * 5) + 1);
  }
  
  trendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last7Days,
      datasets: [{
        label: 'New Complaints',
        data: complaintsPerDay,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Handle add department
function handleAddDepartment() {
  if (departmentModal) {
    departmentModal.classList.add('show');
  }
  const departmentNameInput = document.getElementById('departmentName');
  if (departmentNameInput) departmentNameInput.focus();
}

// Handle add staff
function handleAddStaff() {
  if (staffModal) {
    staffModal.classList.add('show');
  }
  const staffNameInput = document.getElementById('staffName');
  if (staffNameInput) staffNameInput.focus();
}

// Save department
async function saveDepartment() {
  const departmentName = document.getElementById('departmentName').value.trim();
  const departmentDescription = document.getElementById('departmentDescription').value.trim();
  
  if (!departmentName) {
    alert('Department name is required');
    return;
  }

  try {
    const response = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: departmentName, description: departmentDescription }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save department');
    }

    const result = await response.json();
    console.log('Server response:', result);

    // Add to system logs
    const adminName = currentUser ? (currentUser.name || currentUser.username || 'Admin') : 'Admin';
    systemLogs.unshift({
      id: Date.now(),
      timestamp: new Date(),
      action: `${adminName} added new department: ${departmentName}`,
      type: 'success'
    });
    
    // Update UI
    renderSystemLogs();
    
    // Close modal and clear the form
    if (departmentModal) departmentModal.classList.remove('show');
    if (departmentForm) departmentForm.reset();
    
    alert(`Department "${departmentName}" has been added successfully!`);
    
    // IMPORTANT: Refresh the department list in the "Add Staff" form
    await fetchAndPopulateDepartments();

  } catch (error) {
      console.error('Error saving department:', error);
      alert('Error: ' + error.message);
  }
}
// Save staff
function saveStaff() {
  const staffName = document.getElementById('staffName').value.trim();
  const staffEmail = document.getElementById('staffEmail').value.trim();
  const staffDepartment = document.getElementById('staffDepartment').value;
  
  if (!staffName || !staffEmail || !staffDepartment) {
    alert('All fields are required');
    return;
  }
  
  // Add to staff list
  const newStaff = {
    id: Date.now(),
    name: staffName,
    email: staffEmail,
    department: staffDepartment,
    status: 'available',
    complaintsHandled: 0,
    performance: 5.0
  };
  
  staffMembers.push(newStaff);
  
  // Add to system logs
  const adminName = currentUser ? (currentUser.name || currentUser.username || 'Admin') : 'Admin';
  systemLogs.unshift({
    id: Date.now(),
    timestamp: new Date(),
    action: `${adminName} added new staff member: ${staffName} (${staffDepartment})`,
    type: 'success'
  });
  
  // Update UI
  renderStaffList();
  renderSystemLogs();
  
  // Close modal
  if (staffModal) staffModal.classList.remove('show');
  if (staffForm) staffForm.reset();
  
  alert(`Staff member "${staffName}" has been added successfully!`);
}

// View all complaints
function viewAllComplaints() {
  // Reset filters
  if (searchInput) searchInput.value = '';
  if (statusFilter) statusFilter.value = 'all';
  if (departmentFilter) departmentFilter.value = 'all';
  renderComplaintsTable();
  
  // Scroll to table
  const complaintsTable = document.getElementById('complaintsTable');
  if (complaintsTable) {
    complaintsTable.scrollIntoView({ behavior: 'smooth' });
  }
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    window.location.href = '/signin.html';
  }
}

// Event Listeners
if (addDepartmentBtn) addDepartmentBtn.addEventListener('click', handleAddDepartment);
if (addProblemTypeBtn) addProblemTypeBtn.addEventListener('click', () => alert('Problem Type management coming soon!'));
if (addStaffBtn) addStaffBtn.addEventListener('click', handleAddStaff);
if (viewAllComplaintsBtn) viewAllComplaintsBtn.addEventListener('click', viewAllComplaints);
if (closeAssignmentFormBtn) closeAssignmentFormBtn.addEventListener('click', closeAssignmentForm);
if (cancelAssignmentBtn) cancelAssignmentBtn.addEventListener('click', closeAssignmentForm);
if (assignmentForm) assignmentForm.addEventListener('submit', handleAssignmentSubmit);

if (assignDepartment) {
  assignDepartment.addEventListener('change', updateStaffDropdown);
}

if (searchInput) searchInput.addEventListener('input', renderComplaintsTable);
if (statusFilter) statusFilter.addEventListener('change', renderComplaintsTable);
if (departmentFilter) departmentFilter.addEventListener('change', renderComplaintsTable);

if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (closeModalBtn2) closeModalBtn2.addEventListener('click', closeModal);

if (assignFromModalBtn) {
  assignFromModalBtn.addEventListener('click', function() {
    const complaintId = parseInt(this.getAttribute('data-complaint-id'));
    closeModal();
    openAssignmentForm(complaintId);
  });
}

// Department modal events
if (closeDepartmentModalBtn) closeDepartmentModalBtn.addEventListener('click', () => {
  departmentModal.classList.remove('show');
});
if (cancelDepartmentBtn) cancelDepartmentBtn.addEventListener('click', () => {
  departmentModal.classList.remove('show');
});
if (saveDepartmentBtn) saveDepartmentBtn.addEventListener('click', saveDepartment);

// Staff modal events
if (closeStaffModalBtn) closeStaffModalBtn.addEventListener('click', () => {
  staffModal.classList.remove('show');
});
if (cancelStaffBtn) cancelStaffBtn.addEventListener('click', () => {
  staffModal.classList.remove('show');
});
if (saveStaffBtn) saveStaffBtn.addEventListener('click', saveStaff);

// Click outside modal to close
if (complaintModal) {
  complaintModal.addEventListener('click', function(e) {
    if (e.target === complaintModal) {
      closeModal();
    }
  });
}

if (departmentModal) {
  departmentModal.addEventListener('click', function(e) {
    if (e.target === departmentModal) {
      departmentModal.classList.remove('show');
    }
  });
}

if (staffModal) {
  staffModal.addEventListener('click', function(e) {
    if (e.target === staffModal) {
      staffModal.classList.remove('show');
    }
  });
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminDashboard);

// Auto-refresh every 5 minutes
setInterval(async () => {
  await loadAllComplaints();
  loadSystemLogs();
  updateDashboardStats();
  renderComplaintsTable();
  renderSystemLogs();
  updateNotificationBadge();
}, 5 * 60 * 1000);

// Make functions globally accessible for debugging
window.loadAllComplaints = loadAllComplaints;
window.updateDashboardStats = updateDashboardStats;
window.renderComplaintsTable = renderComplaintsTable;
window.checkAdminLogin = checkAdminLogin;
window.viewComplaintDetails = viewComplaintDetails;
window.openAssignmentForm = openAssignmentForm;

console.log('Admin Dashboard loaded successfully');