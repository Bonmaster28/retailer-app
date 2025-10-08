

// Consolidated application script with simplified login
// Features: Password-based auth for DSR demo, prospect management, tab system

(() => {
  // DOM references
  const loginSection = document.getElementById('loginSection');
  const appSection = document.getElementById('appSection');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const userRoleDisplay = document.getElementById('userRoleDisplay');
  const userPhoneDisplay = document.getElementById('userPhoneDisplay');
  const passwordGroup = document.getElementById('passwordGroup');
  const userRoleSelect = document.getElementById('userRole');

  // Tab elements
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  // Retailer form elements
  const form = document.getElementById('dataForm');
  const tableBody = document.querySelector('#dataTable tbody');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const entryCount = document.getElementById('entryCount');

  // Prospect form elements
  const prospectForm = document.getElementById('prospectForm');
  const prospectTableBody = document.querySelector('#prospectTable tbody');
  const downloadProspectsBtn = document.getElementById('downloadProspectsBtn');
  const clearProspectBtn = document.getElementById('clearProspectBtn');
  const clearAllProspectsBtn = document.getElementById('clearAllProspectsBtn');
  const prospectCount = document.getElementById('prospectCount');

  // Table controls
  const searchInput = document.getElementById('searchInput');
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  const paginationContainer = document.getElementById('pagination');

  const prospectSearchInput = document.getElementById('prospectSearchInput');
  const prospectPageSizeSelect = document.getElementById('prospectPageSizeSelect');
  const prospectPaginationContainer = document.getElementById('prospectPagination');

  // State
  let data = JSON.parse(localStorage.getItem('retailerData')) || [];
  let prospects = JSON.parse(localStorage.getItem('prospectData')) || [];
  let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

  const uiStateKey = 'tableUIState';
  let uiState = JSON.parse(localStorage.getItem(uiStateKey)) || {
    searchText: '', sortBy: null, sortDir: 'asc', page: 1, pageSize: 20
  };

  const prospectUIStateKey = 'prospectUIState';
  let prospectUIState = JSON.parse(localStorage.getItem(prospectUIStateKey)) || {
    searchText: '', sortBy: null, sortDir: 'asc', page: 1, pageSize: 20
  };

  function saveUIState() { localStorage.setItem(uiStateKey, JSON.stringify(uiState)); }
  function saveProspectUIState() { localStorage.setItem(prospectUIStateKey, JSON.stringify(prospectUIState)); }

  // Tab system
  function initTabs() {
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show active tab content
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.id === tabId) {
            content.classList.add('active');
          }
        });
      });
    });
  }

  // Initialize the app
  function init() {
    // Check if user is already logged in
    if (currentUser) {
      showApp();
    } else {
      showLogin();
    }

    initTabs();
    setupEventListeners();
    updateEntryCount();
    updateProspectCount();
    renderTable();
    renderProspectTable();
    setupInstallPrompt();
    setupOnboarding();
  }

  // Setup event listeners
  function setupEventListeners() {
    // Show/hide password field based on role selection
    userRoleSelect.addEventListener('change', function() {
      if (this.value === 'DSR') {
        passwordGroup.style.display = 'block';
      } else {
        passwordGroup.style.display = 'none';
      }
    });

    // Login form submission
    loginForm.addEventListener('submit', handleLoginSubmit);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Retailer form submission
    form.addEventListener('submit', handleFormSubmit);

    // Prospect form submission
    prospectForm.addEventListener('submit', handleProspectSubmit);

    // Clear buttons
    clearBtn.addEventListener('click', clearForm);
    clearProspectBtn.addEventListener('click', clearProspectForm);

    // Clear all data buttons
    clearAllBtn.addEventListener('click', clearAllData);
    clearAllProspectsBtn.addEventListener('click', clearAllProspects);

    // Download buttons
    downloadBtn.addEventListener('click', downloadCSV);
    downloadProspectsBtn.addEventListener('click', downloadProspectsCSV);

    // Table controls
    searchInput.addEventListener('input', handleSearch);
    pageSizeSelect.addEventListener('change', handlePageSizeChange);
    prospectSearchInput.addEventListener('input', handleProspectSearch);
    prospectPageSizeSelect.addEventListener('change', handleProspectPageSizeChange);

    // TSM-only fields visibility
    document.getElementById('userRole').addEventListener('change', toggleTSMFields);
    
    // Auto-set date and time for TSM
    document.getElementById('visitationDate').valueAsDate = new Date();
    const now = new Date();
    document.getElementById('visitationTime').value = 
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Lock date/time fields for TSM
    document.getElementById('visitationDate').readOnly = true;
    document.getElementById('visitationTime').readOnly = true;

    // Set default follow-up date to today
    document.getElementById('followUpDate').valueAsDate = new Date();
  }

  // Login handler
  function handleLoginSubmit(e) {
    e.preventDefault();
    const phoneNumber = document.getElementById('phoneNumber').value;
    const userRole = document.getElementById('userRole').value;
    const password = document.getElementById('password')?.value;

    // Validate phone number format
    if (!phoneNumber.startsWith('254') || phoneNumber.length !== 12) {
      showNotification('Please enter a valid Airtel Kenya number starting with 254 (12 digits)', 'error');
      return;
    }

    // DSR demo authentication
    if (userRole === 'DSR') {
      if (phoneNumber === '786478620' && password === 'demo123') {
        // Successful DSR demo login
        currentUser = { phoneNumber, role: userRole, isDemo: true };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showApp();
        showNotification('DSR Demo Login successful!', 'success');
      } else {
        showNotification('Invalid DSR credentials. Use phone 786478620 and password "demo123"', 'error');
        return;
      }
    } else {
      // TSM or other roles - simple authentication without password
      currentUser = { phoneNumber, role: userRole };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showApp();
      showNotification(`Welcome ${userRole}! Login successful.`, 'success');
    }
  }

  // Show app section
  function showApp() {
    loginSection.style.display = 'none';
    appSection.style.display = 'block';
    userRoleDisplay.textContent = currentUser.role;
    userPhoneDisplay.textContent = currentUser.phoneNumber;
    
    // Toggle TSM-only fields based on role
    toggleTSMFields();
    
    // Update counts
    updateEntryCount();
    updateProspectCount();
    
    // Render tables
    renderTable();
    renderProspectTable();
  }

  // Show login section
  function showLogin() {
    loginSection.style.display = 'flex';
    appSection.style.display = 'none';
    loginForm.reset();
    passwordGroup.style.display = 'none';
  }

  // Logout handler
  function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
    showNotification('Logged out successfully', 'success');
  }

  // Toggle TSM-only fields
  function toggleTSMFields() {
    const userRole = currentUser ? currentUser.role : document.getElementById('userRole').value;
    const tsmFields = document.querySelectorAll('.tsm-only');
    
    tsmFields.forEach(field => {
      if (userRole === 'TSM') {
        field.style.display = 'block';
      } else {
        field.style.display = 'none';
      }
    });
  }

  // Retailer form submission
  function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const entry = Object.fromEntries(formData.entries());
    
    // Add timestamp and user info
    entry.timestamp = new Date().toISOString();
    entry.addedBy = currentUser.phoneNumber;
    entry.userRole = currentUser.role;
    
    // Add to data array
    data.push(entry);
    
    // Save to localStorage
    localStorage.setItem('retailerData', JSON.stringify(data));
    
    // Update UI
    updateEntryCount();
    renderTable();
    clearForm();
    
    showNotification('Retailer added successfully!', 'success');
  }

  // Prospect form submission
  function handleProspectSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(prospectForm);
    const entry = Object.fromEntries(formData.entries());
    
    // Add timestamp, user info and initial status
    entry.timestamp = new Date().toISOString();
    entry.addedBy = currentUser.phoneNumber;
    entry.userRole = currentUser.role;
    entry.status = 'Pending';
    
    // Add to prospects array
    prospects.push(entry);
    
    // Save to localStorage
    localStorage.setItem('prospectData', JSON.stringify(prospects));
    
    // Update UI
    updateProspectCount();
    renderProspectTable();
    clearProspectForm();
    
    showNotification('Prospect added successfully!', 'success');
  }

  // Clear retailer form
  function clearForm() {
    form.reset();
    // Reset date and time to current for TSM
    if (currentUser.role === 'TSM') {
      document.getElementById('visitationDate').valueAsDate = new Date();
      const now = new Date();
      document.getElementById('visitationTime').value = 
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
  }

  // Clear prospect form
  function clearProspectForm() {
    prospectForm.reset();
    // Set follow-up date to today by default
    document.getElementById('followUpDate').valueAsDate = new Date();
  }

  // Clear all retailer data
  function clearAllData() {
    if (confirm('Are you sure you want to clear all retailer data? This action cannot be undone.')) {
      data = [];
      localStorage.removeItem('retailerData');
      updateEntryCount();
      renderTable();
      showNotification('All retailer data cleared', 'success');
    }
  }

  // Clear all prospect data
  function clearAllProspects() {
    if (confirm('Are you sure you want to clear all prospect data? This action cannot be undone.')) {
      prospects = [];
      localStorage.removeItem('prospectData');
      updateProspectCount();
      renderProspectTable();
      showNotification('All prospect data cleared', 'success');
    }
  }

  // Update retailer entry count
  function updateEntryCount() {
    entryCount.textContent = data.length;
    // Color code based on count
    if (data.length >= 2000) {
      entryCount.style.color = '#dc3545';
    } else if (data.length >= 1500) {
      entryCount.style.color = '#ffc107';
    } else {
      entryCount.style.color = '#28a745';
    }
  }

  // Update prospect count
  function updateProspectCount() {
    prospectCount.textContent = prospects.length;
    // Color code based on count
    if (prospects.length >= 500) {
      prospectCount.style.color = '#dc3545';
    } else if (prospects.length >= 400) {
      prospectCount.style.color = '#ffc107';
    } else {
      prospectCount.style.color = '#28a745';
    }
  }

  // Render retailer table with pagination and search
  function renderTable() {
    let filteredData = [...data];
    
    // Apply search filter
    if (uiState.searchText) {
      const searchLower = uiState.searchText.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.msisdn.toLowerCase().includes(searchLower) ||
        item.firstName.toLowerCase().includes(searchLower) ||
        item.lastName.toLowerCase().includes(searchLower) ||
        item.siteId.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (uiState.sortBy) {
      filteredData.sort((a, b) => {
        let aVal = a[uiState.sortBy];
        let bVal = b[uiState.sortBy];
        
        // Handle numeric sorting for numbers
        if (uiState.sortBy === 'lines') {
          aVal = parseInt(aVal) || 0;
          bVal = parseInt(bVal) || 0;
        }
        
        if (aVal < bVal) return uiState.sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return uiState.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    // Pagination
    const totalPages = Math.ceil(filteredData.length / uiState.pageSize);
    if (uiState.page > totalPages) uiState.page = 1;
    
    const startIndex = (uiState.page - 1) * uiState.pageSize;
    const endIndex = startIndex + uiState.pageSize;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    // Render table rows
    tableBody.innerHTML = '';
    
    if (pageData.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      const colSpan = currentUser.role === 'TSM' ? 18 : 8;
      td.colSpan = colSpan;
      td.textContent = 'No retailer data available. Add some entries using the form above.';
      td.style.textAlign = 'center';
      td.style.padding = '2rem';
      td.style.color = '#666';
      tr.appendChild(td);
      tableBody.appendChild(tr);
    } else {
      pageData.forEach((item, index) => {
        const row = document.createElement('tr');
        const globalIndex = startIndex + index;
        
        row.innerHTML = `
          <td>${item.msisdn}</td>
          <td>${item.firstName}</td>
          <td>${item.lastName}</td>
          <td>${item.siteId}</td>
          ${currentUser.role === 'TSM' ? `
            <td>${item.lm || ''}</td>
            <td>${item.mtd || ''}</td>
            <td>${item.amLm || ''}</td>
            <td>${item.amaMtd || ''}</td>
          ` : ''}
          <td>${item.lines || ''}</td>
          <td>${item.given || ''}</td>
          <td>${item.floatServiced || ''}</td>
          ${currentUser.role === 'TSM' ? `
            <td>${item.qsso || 'No'}</td>
            <td>${item.qama || 'No'}</td>
            <td>${item.kcbAgents || 'No'}</td>
          ` : ''}
          <td>${item.newRecruitment || 'No'}</td>
          ${currentUser.role === 'TSM' ? `
            <td>${item.visitation || 'No'}</td>
            <td>${item.visitationDate || ''}</td>
            <td>${item.visitationTime || ''}</td>
          ` : ''}
        `;
        
        tableBody.appendChild(row);
      });
    }
    
    // Render pagination
    renderPagination(totalPages, uiState.page, paginationContainer, (page) => {
      uiState.page = page;
      saveUIState();
      renderTable();
    });
  }

  // Render prospect table with pagination and search
  function renderProspectTable() {
    let filteredProspects = [...prospects];
    
    // Apply search filter
    if (prospectUIState.searchText) {
      const searchLower = prospectUIState.searchText.toLowerCase();
      filteredProspects = filteredProspects.filter(item => 
        item.prospectMsisdn.toLowerCase().includes(searchLower) ||
        item.prospectFirstName.toLowerCase().includes(searchLower) ||
        item.prospectLastName.toLowerCase().includes(searchLower) ||
        item.prospectLocation.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (prospectUIState.sortBy) {
      filteredProspects.sort((a, b) => {
        let aVal = a[prospectUIState.sortBy];
        let bVal = b[prospectUIState.sortBy];
        
        if (aVal < bVal) return prospectUIState.sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return prospectUIState.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    // Pagination
    const totalPages = Math.ceil(filteredProspects.length / prospectUIState.pageSize);
    if (prospectUIState.page > totalPages) prospectUIState.page = 1;
    
    const startIndex = (prospectUIState.page - 1) * prospectUIState.pageSize;
    const endIndex = startIndex + prospectUIState.pageSize;
    const pageData = filteredProspects.slice(startIndex, endIndex);
    
    // Render table rows
    prospectTableBody.innerHTML = '';
    
    if (pageData.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 9;
      td.textContent = 'No prospects available. Add some prospects using the form above.';
      td.style.textAlign = 'center';
      td.style.padding = '2rem';
      td.style.color = '#666';
      tr.appendChild(td);
      prospectTableBody.appendChild(tr);
    } else {
      pageData.forEach((item, index) => {
        const row = document.createElement('tr');
        const globalIndex = startIndex + index;
        
        // Check if follow-up date is today or in the past
        const today = new Date().toISOString().split('T')[0];
        const followUpDate = item.followUpDate;
        const isDue = followUpDate <= today;
        const statusClass = isDue ? 'status-due' : 'status-pending';
        const statusText = isDue ? 'Due' : 'Pending';
        
        row.innerHTML = `
          <td>${item.prospectMsisdn}</td>
          <td>${item.prospectFirstName}</td>
          <td>${item.prospectLastName}</td>
          <td>${item.prospectLocation}</td>
          <td>${item.prospectBusinessType}</td>
          <td>${item.prospectInterestLevel}</td>
          <td>${item.followUpDate}</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>
            <button class="btn-small btn-primary" onclick="markAsRecruited(${globalIndex})">Recruited</button>
            <button class="btn-small btn-danger" onclick="deleteProspect(${globalIndex})">Delete</button>
          </td>
        `;
        
        prospectTableBody.appendChild(row);
      });
    }
    
    // Render pagination
    renderPagination(totalPages, prospectUIState.page, prospectPaginationContainer, (page) => {
      prospectUIState.page = page;
      saveProspectUIState();
      renderProspectTable();
    });
  }

  // Mark prospect as recruited
  window.markAsRecruited = function(index) {
    if (confirm('Mark this prospect as recruited?')) {
      // Remove from prospects and add to retailer data
      const recruitedProspect = prospects.splice(index, 1)[0];
      
      // Create retailer entry from prospect
      const retailerEntry = {
        msisdn: recruitedProspect.prospectMsisdn,
        firstName: recruitedProspect.prospectFirstName,
        lastName: recruitedProspect.prospectLastName,
        siteId: recruitedProspect.prospectLocation,
        newRecruitment: 'Yes',
        timestamp: new Date().toISOString(),
        addedBy: currentUser.phoneNumber,
        userRole: currentUser.role
      };
      
      data.push(retailerEntry);
      
      // Save both datasets
      localStorage.setItem('retailerData', JSON.stringify(data));
      localStorage.setItem('prospectData', JSON.stringify(prospects));
      
      // Update UI
      updateEntryCount();
      updateProspectCount();
      renderTable();
      renderProspectTable();
      
      showNotification('Prospect marked as recruited!', 'success');
    }
  };

  // Delete prospect
  window.deleteProspect = function(index) {
    if (confirm('Delete this prospect?')) {
      prospects.splice(index, 1);
      localStorage.setItem('prospectData', JSON.stringify(prospects));
      updateProspectCount();
      renderProspectTable();
      showNotification('Prospect deleted', 'success');
    }
  };

  // Render pagination controls
  function renderPagination(totalPages, currentPage, container, onPageChange) {
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = '‹';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => onPageChange(currentPage - 1));
    container.appendChild(prevButton);
    
    // Page buttons
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.className = i === currentPage ? 'active' : '';
      pageButton.addEventListener('click', () => onPageChange(i));
      container.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = '›';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => onPageChange(currentPage + 1));
    container.appendChild(nextButton);
  }

  // Search handler for retailer table
  function handleSearch(e) {
    uiState.searchText = e.target.value;
    uiState.page = 1;
    saveUIState();
    renderTable();
  }

  // Page size handler for retailer table
  function handlePageSizeChange(e) {
    uiState.pageSize = parseInt(e.target.value);
    uiState.page = 1;
    saveUIState();
    renderTable();
  }

  // Search handler for prospect table
  function handleProspectSearch(e) {
    prospectUIState.searchText = e.target.value;
    prospectUIState.page = 1;
    saveProspectUIState();
    renderProspectTable();
  }

  // Page size handler for prospect table
  function handleProspectPageSizeChange(e) {
    prospectUIState.pageSize = parseInt(e.target.value);
    prospectUIState.page = 1;
    saveProspectUIState();
    renderProspectTable();
  }

  // Download retailer data as CSV
  function downloadCSV() {
    if (data.length === 0) {
      showNotification('No data to export', 'error');
      return;
    }
    
    const headers = currentUser.role === 'TSM' 
      ? ['MSISDN', 'First Name', 'Last Name', 'Site ID', 'GA LM', 'GA MTD', 'AM LM', 'AMA MTD', 'LINES', 'GIVEN', 'Float Serviced', 'QSSO', 'QAMA', 'KCB Agents', 'New Recruitment', 'Visitation Status', 'Visitation Date', 'Visitation Time', 'Added By', 'User Role']
      : ['MSISDN', 'First Name', 'Last Name', 'Site ID', 'LINES', 'GIVEN', 'Float Serviced', 'New Recruitment', 'Added By', 'User Role'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        currentUser.role === 'TSM'
          ? [row.msisdn, row.firstName, row.lastName, row.siteId, row.lm, row.mtd, row.amLm, row.amaMtd, row.lines, row.given, row.floatServiced, row.qsso, row.qama, row.kcbAgents, row.newRecruitment, row.visitation, row.visitationDate, row.visitationTime, row.addedBy, row.userRole].join(',')
          : [row.msisdn, row.firstName, row.lastName, row.siteId, row.lines, row.given, row.floatServiced, row.newRecruitment, row.addedBy, row.userRole].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retailer-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('CSV exported successfully', 'success');
  }

  // Download prospect data as CSV
  function downloadProspectsCSV() {
    if (prospects.length === 0) {
      showNotification('No prospects to export', 'error');
      return;
    }
    
    const headers = ['MSISDN', 'First Name', 'Last Name', 'Location', 'Business Type', 'Interest Level', 'Follow-up Date', 'Status', 'Notes', 'Added By', 'User Role'];
    
    const csvContent = [
      headers.join(','),
      ...prospects.map(row => 
        [row.prospectMsisdn, row.prospectFirstName, row.prospectLastName, row.prospectLocation, row.prospectBusinessType, row.prospectInterestLevel, row.followUpDate, row.status, row.followUpNotes, row.addedBy, row.userRole].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospect-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Prospects CSV exported successfully', 'success');
  }

  // Show notification
  function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  // PWA Installation
  let deferredPrompt;

  function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById('installBtn');
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', installApp);
      }
    });

    window.addEventListener('appinstalled', () => {
      const installBtn = document.getElementById('installBtn');
      if (installBtn) installBtn.style.display = 'none';
      deferredPrompt = null;
      showNotification('App installed successfully!', 'success');
    });
  }

  function installApp() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    }
  }

  // Onboarding modal
  function setupOnboarding() {
    const onboardingShown = localStorage.getItem('onboardingShown');
    const modal = document.getElementById('onboardingModal');
    const dismissBtn = document.getElementById('dismissOnboarding');
    const learnMoreBtn = document.getElementById('learnMore');

    if (!onboardingShown && modal) {
      modal.style.display = 'flex';
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        localStorage.setItem('onboardingShown', 'true');
      });
    }

    if (learnMoreBtn) {
      learnMoreBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        localStorage.setItem('onboardingShown', 'true');
        installApp();
      });
    }
  }

  // Initialize the application
  document.addEventListener('DOMContentLoaded', init);
})();
