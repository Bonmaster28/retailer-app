// Authentication and User Management
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const otpSection = document.getElementById('otpSection');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const resendOtpBtn = document.getElementById('resendOtpBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userRoleDisplay = document.getElementById('userRoleDisplay');
const userPhoneDisplay = document.getElementById('userPhoneDisplay');

// Main App Elements
const form = document.getElementById('dataForm');
const tableBody = document.querySelector('#dataTable tbody');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const entryCount = document.getElementById('entryCount');

// Application State
let data = JSON.parse(localStorage.getItem('retailerData')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let otpData = JSON.parse(localStorage.getItem('otpData')) || {};

// Initialize the application
function initApp() {
  if (currentUser && currentUser.isAuthenticated) {
    showAppSection();
  } else {
    showLoginSection();
  }
  updateEntryCount();
}

// Show/Hide Sections
function showLoginSection() {
  loginSection.style.display = 'flex';
  appSection.style.display = 'none';
}

function showAppSection() {
  loginSection.style.display = 'none';
  appSection.style.display = 'block';
  updateUserInterface();
  renderTable();
}

// Update UI based on user role
function updateUserInterface() {
  if (!currentUser) return;
  
  userRoleDisplay.textContent = `Role: ${currentUser.role}`;
  userPhoneDisplay.textContent = `Phone: ${currentUser.phoneNumber}`;
  
  // Show/hide TSM-only elements
  const isTSM = currentUser.role === 'TSM';
  document.body.classList.toggle('user-tsm', isTSM);
  
  // Set default date and time for TSM users
  if (isTSM) {
    document.getElementById('visitationDate').valueAsDate = new Date();
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('visitationTime').value = `${hours}:${minutes}`;
  }
}

// OTP Management
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOTP(phoneNumber) {
  const otp = generateOTP();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  otpData[phoneNumber] = {
    otp: otp,
    expiry: expiry,
    attempts: 0
  };
  
  localStorage.setItem('otpData', JSON.stringify(otpData));
  
  // In a real application, you would send this OTP via SMS
  // For demo purposes, we'll show it in an alert
  showNotification(`OTP sent to ${phoneNumber}. Demo OTP: ${otp}`, 'info');
  
  return true;
}

function verifyOTP(phoneNumber, enteredOtp) {
  const storedOtpData = otpData[phoneNumber];
  
  if (!storedOtpData) {
    showNotification('OTP not found. Please request a new OTP.', 'error');
    return false;
  }
  
  if (Date.now() > storedOtpData.expiry) {
    showNotification('OTP has expired. Please request a new OTP.', 'error');
    return false;
  }
  
  if (storedOtpData.attempts >= 3) {
    showNotification('Too many failed attempts. Please request a new OTP.', 'error');
    return false;
  }
  
  if (storedOtpData.otp === enteredOtp) {
    // OTP verified successfully
    delete otpData[phoneNumber];
    localStorage.setItem('otpData', JSON.stringify(otpData));
    return true;
  } else {
    // Increment failed attempts
    storedOtpData.attempts++;
    localStorage.setItem('otpData', JSON.stringify(otpData));
    showNotification(`Invalid OTP. ${3 - storedOtpData.attempts} attempts remaining.`, 'error');
    return false;
  }
}

// Login Form Handler
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const phoneNumber = document.getElementById('phoneNumber').value;
  const userRole = document.getElementById('userRole').value;
  
  // Validate Airtel number (Kenya format)
  if (!phoneNumber.startsWith('254')) {
    showNotification('Please enter a valid Airtel Kenya number starting with 254', 'error');
    return;
  }
  
  if (phoneNumber.length !== 12) {
    showNotification('Phone number must be 12 digits (254XXXXXXXXX)', 'error');
    return;
  }
  
  if (!userRole) {
    showNotification('Please select a user role', 'error');
    return;
  }
  
  // Send OTP
  if (sendOTP(phoneNumber)) {
    otpSection.style.display = 'block';
    document.getElementById('otp').focus();
  }
});

// Verify OTP Handler
verifyOtpBtn.addEventListener('click', function() {
  const phoneNumber = document.getElementById('phoneNumber').value;
  const userRole = document.getElementById('userRole').value;
  const enteredOtp = document.getElementById('otp').value;
  
  if (enteredOtp.length !== 6) {
    showNotification('Please enter a valid 6-digit OTP', 'error');
    return;
  }
  
  if (verifyOTP(phoneNumber, enteredOtp)) {
    // Login successful
    currentUser = {
      phoneNumber: phoneNumber,
      role: userRole,
      isAuthenticated: true,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showAppSection();
    showNotification(`Welcome ${userRole}! Login successful.`, 'success');
  }
});

// Resend OTP Handler
resendOtpBtn.addEventListener('click', function() {
  const phoneNumber = document.getElementById('phoneNumber').value;
  sendOTP(phoneNumber);
});

// Logout Handler
logoutBtn.addEventListener('click', function() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showLoginSection();
  showNotification('Logged out successfully', 'info');
});

// Data Management Functions
function updateEntryCount() {
  entryCount.textContent = data.length;
  if (data.length >= 2000) {
    entryCount.style.color = 'var(--danger-color)';
    entryCount.style.fontWeight = 'bold';
  } else if (data.length >= 1500) {
    entryCount.style.color = 'var(--warning-color)';
  } else {
    entryCount.style.color = 'var(--success-color)';
  }
}

function renderTable() {
  tableBody.innerHTML = '';
  
  if (data.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    const colSpan = currentUser?.role === 'TSM' ? 18 : 8;
    td.colSpan = colSpan;
    td.textContent = 'No retailer data available. Add some entries using the form above.';
    td.style.textAlign = 'center';
    td.style.padding = '2rem';
    td.style.color = '#666';
    tr.appendChild(td);
    tableBody.appendChild(tr);
    return;
  }

  data.forEach((row, index) => {
    const tr = document.createElement('tr');
    
    // Define fields based on user role
    let fields = [];
    if (currentUser?.role === 'TSM') {
      fields = [
        'msisdn', 'firstName', 'lastName', 'siteId', 
        'lm', 'mtd', 'amLm', 'amaMtd', 'lines', 'given', 'floatServiced',
        'qsso', 'qama', 'kcbAgents', 'newRecruitment', 'visitation',
        'visitationDate', 'visitationTime'
      ];
    } else {
      // DSR sees limited fields
      fields = [
        'msisdn', 'firstName', 'lastName', 'siteId', 
        'lines', 'given', 'floatServiced', 'newRecruitment'
      ];
    }
    
    fields.forEach(field => {
      const td = document.createElement('td');
      let value = row[field] || '-';
      
      // Format specific fields
      if (field === 'lines' && value !== '-') {
        value = parseInt(value).toLocaleString();
      }
      
      // Style boolean fields
      if (['qsso', 'qama', 'kcbAgents', 'newRecruitment', 'visitation'].includes(field)) {
        td.style.fontWeight = value === 'Yes' ? 'bold' : 'normal';
        td.style.color = value === 'Yes' ? 'var(--success-color)' : '#666';
      }
      
      // Format date and time
      if (field === 'visitationDate' && value !== '-') {
        const date = new Date(value);
        value = date.toLocaleDateString('en-GB');
      }
      
      td.textContent = value;
      tr.appendChild(td);
    });
    
    tableBody.appendChild(tr);
  });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Form submission handler
form.addEventListener('submit', e => {
  e.preventDefault();
  
  if (!currentUser || !currentUser.isAuthenticated) {
    showNotification('Please login to submit data', 'error');
    return;
  }
  
  const formData = new FormData(form);
  const newEntry = Object.fromEntries(formData.entries());
  
  // Validate data limit
  if (data.length >= 2000) {
    showNotification('Data limit reached (2000 entries). Please export and clear data.', 'error');
    return;
  }
  
  // Validate required fields based on user role
  let requiredFields = ['msisdn', 'firstName', 'lastName', 'siteId'];
  
  if (currentUser.role === 'TSM') {
    requiredFields.push('visitationDate', 'visitationTime');
  }
  
  const missingFields = requiredFields.filter(field => !newEntry[field].trim());
  
  if (missingFields.length > 0) {
    showNotification(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
    return;
  }
  
  // Validate MSISDN format
  const msisdnRegex = /^[0-9+\-\s()]+$/;
  if (!msisdnRegex.test(newEntry.msisdn)) {
    showNotification('Please enter a valid MSISDN number', 'error');
    return;
  }
  
  // For TSM users, validate date is not in the future
  if (currentUser.role === 'TSM') {
    const visitationDate = new Date(newEntry.visitationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (visitationDate > today) {
      showNotification('Visitation date cannot be in the future', 'error');
      return;
    }
  }
  
  // Add user info and timestamp
  newEntry.addedBy = currentUser.phoneNumber;
  newEntry.userRole = currentUser.role;
  newEntry.timestamp = new Date().toISOString();
  
  data.push(newEntry);
  localStorage.setItem('retailerData', JSON.stringify(data));
  renderTable();
  updateEntryCount();
  form.reset();
  
  // Reset TSM-specific fields if user is TSM
  if (currentUser.role === 'TSM') {
    document.getElementById('visitationDate').valueAsDate = new Date();
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('visitationTime').value = `${hours}:${minutes}`;
  }
  
  showNotification('Retailer data added successfully!', 'success');
});

// Clear form handler
clearBtn.addEventListener('click', () => {
  form.reset();
  
  // Reset TSM-specific fields if user is TSM
  if (currentUser?.role === 'TSM') {
    document.getElementById('visitationDate').valueAsDate = new Date();
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('visitationTime').value = `${hours}:${minutes}`;
  }
  
  showNotification('Form cleared.', 'info');
});

// Clear all data handler
clearAllBtn.addEventListener('click', () => {
  if (data.length === 0) {
    showNotification('No data to clear.', 'info');
    return;
  }
  
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    data = [];
    localStorage.setItem('retailerData', JSON.stringify(data));
    renderTable();
    updateEntryCount();
    showNotification('All data cleared successfully.', 'success');
  }
});

// Download CSV handler
downloadBtn.addEventListener('click', () => {
  if (data.length === 0) {
    showNotification('No data to export.', 'info');
    return;
  }
  
  try {
    // Define CSV headers based on user role
    let headers = [];
    if (currentUser?.role === 'TSM') {
      headers = [
        'MSISDN', 'First Name', 'Last Name', 'Site ID', 
        'GA LM', 'GA MTD', 'AM LM', 'AMA MTD', 'LINES', 'GIVEN', 'Float Serviced',
        'QSSO', 'QAMA', 'KCB Agents', 'New Recruitment', 'Visitation Status',
        'Visitation Date', 'Visitation Time', 'Added By', 'User Role'
      ];
    } else {
      headers = [
        'MSISDN', 'First Name', 'Last Name', 'Site ID', 
        'LINES', 'GIVEN', 'Float Serviced', 'New Recruitment', 'Added By'
      ];
    }
    
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(row => {
      let rowData = [];
      
      if (currentUser?.role === 'TSM') {
        rowData = [
          row.msisdn || '',
          row.firstName || '',
          row.lastName || '',
          row.siteId || '',
          row.lm || '',
          row.mtd || '',
          row.amLm || '',
          row.amaMtd || '',
          row.lines || '',
          row.given || '',
          row.floatServiced || '',
          row.qsso || 'No',
          row.qama || 'No',
          row.kcbAgents || 'No',
          row.newRecruitment || 'No',
          row.visitation || 'No',
          row.visitationDate || '',
          row.visitationTime || '',
          row.addedBy || '',
          row.userRole || ''
        ];
      } else {
        rowData = [
          row.msisdn || '',
          row.firstName || '',
          row.lastName || '',
          row.siteId || '',
          row.lines || '',
          row.given || '',
          row.floatServiced || '',
          row.newRecruitment || 'No',
          row.addedBy || ''
        ];
      }
      
      csv += rowData.map(value => `"${String(value).replace(/"/g, '""') }"`).join(',') + '\n';
    });
    
    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    
    a.href = url;
    a.download = `retailer_data_${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`CSV exported successfully! ${data.length} records downloaded.`, 'success');
  } catch (error) {
    showNotification('Error exporting CSV: ' + error.message, 'error');
    console.error('CSV Export Error:', error);
  }
});

// Site location statistics
function getSiteStatistics() {
  const siteCounts = {};
  data.forEach(entry => {
    const site = entry.siteId;
    siteCounts[site] = (siteCounts[site] || 0) + 1;
  });
  return siteCounts;
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('service-worker.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(function(error) {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Onboarding modal and Install button handling
let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
const onboardingModal = document.getElementById('onboardingModal');
const dismissOnboarding = document.getElementById('dismissOnboarding');
const learnMoreBtn = document.getElementById('learnMore');

// Show onboarding once per user
function showOnboardingIfNeeded() {
  try {
    const seen = localStorage.getItem('onboardingSeen');
    if (!seen) {
      onboardingModal.setAttribute('aria-hidden', 'false');
    }
  } catch (e) {
    console.warn('Onboarding check failed', e);
  }
}

// Hook onboarding dismissal
if (dismissOnboarding) {
  dismissOnboarding.addEventListener('click', () => {
    onboardingModal.setAttribute('aria-hidden', 'true');
    localStorage.setItem('onboardingSeen', '1');
  });
}

// If user wants to learn/install from modal
if (learnMoreBtn) {
  learnMoreBtn.addEventListener('click', async () => {
    onboardingModal.setAttribute('aria-hidden', 'true');
    localStorage.setItem('onboardingSeen', '1');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showNotification('App installed successfully', 'success');
      }
      deferredPrompt = null;
      if (installBtn) installBtn.style.display = 'none';
    }
  });
}

// beforeinstallprompt - show install CTA when fired
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.style.display = 'inline-block';
});

// Install button click handler
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      showNotification('Thanks — app installed', 'success');
    }
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}

// Show onboarding after app init
document.addEventListener('DOMContentLoaded', showOnboardingIfNeeded);