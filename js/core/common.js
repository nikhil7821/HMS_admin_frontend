// Common JS - Loads sidebar and header on all pages

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!token && !isLoginPage) {
        window.location.href = '../../login.html';
        return;
    }
    
    // Get page title FIRST before loading components
    const pageTitleData = getPageTitleData();
    
    await loadComponents(pageTitleData);
    setupMobileMenu();
    setActiveMenu();
    reinitDropdowns();
});

async function loadComponents(pageTitleData) {
    await loadSidebar();
    await loadHeader(pageTitleData);
    adjustLayout();
}

async function loadSidebar() {
    try {
        const sidebarPath = getCorrectPath('components/sidebar.html');
        const response = await fetch(sidebarPath);
        const html = await response.text();
        document.body.insertAdjacentHTML('afterbegin', html);
    } catch (error) {
        console.error('Error loading sidebar:', error);
    }
}

async function loadHeader(pageTitleData) {
    try {
        const headerPath = getCorrectPath('components/header.html');
        const response = await fetch(headerPath);
        let html = await response.text();
        
        // Inject page title data directly into header HTML before inserting
        if (pageTitleData) {
            const displayTitle = `${pageTitleData.main} / ${pageTitleData.sub}`;
            // Replace placeholder or add script to set title immediately
            html = html.replace('id="pageTitle">Loading...</h1>', `id="pageTitle">${displayTitle}</h1>`);
            html = html.replace('id="breadcrumbCurrent">Loading...</span>', `id="breadcrumbCurrent">${pageTitleData.sub}</span>`);
            html = html.replace('id="mobilePageTitle">Loading...</div>', `id="mobilePageTitle">${pageTitleData.sub}</div>`);
            
            // Also update breadcrumb if needed
            if (pageTitleData.main !== 'Home') {
                let parentLink = getParentLink(pageTitleData.main);
                html = html.replace('id="pageBreadcrumb"', `id="pageBreadcrumb"`);
                const breadcrumbHtml = `<a href="${parentLink}" class="breadcrumb-link">${pageTitleData.main}</a><span class="breadcrumb-separator">/</span><span class="breadcrumb-current">${pageTitleData.sub}</span>`;
                html = html.replace('<span>Home</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-current" id="breadcrumbCurrent">Loading...</span>', breadcrumbHtml);
            }
        }
        
        document.body.insertAdjacentHTML('afterbegin', html);
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

function getParentLink(mainModule) {
    const parentLinks = {
        'User Management': '../../modules/user-management/users.html',
        'Clinical': '../../modules/clinical/patients.html',
        'Emergency': '../../modules/emergency/emergency.html',
        'Ward Management': '../../modules/ward-management/wards.html',
        'Pharmacy': '../../modules/pharmacy/medicines.html',
        'Laboratory': '../../modules/laboratory/lab-requests.html',
        'Radiology': '../../modules/radiology/radio-requests.html',
        'Billing & Finance': '../../modules/billing/invoices.html',
        'Staff Management': '../../modules/staff/staff-list.html',
        'Reports & Analytics': '../../modules/reports/patient-reports.html',
        'Documents': '../../modules/documents/documents.html',
        'Settings': '../../modules/settings/hospital-profile.html'
    };
    return parentLinks[mainModule] || '#';
}

// Get page title data synchronously before header loads
function getPageTitleData() {
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop();
    const pageName = fileName.replace('.html', '');
    
    console.log('Pre-loading title for page:', pageName);
    
    const pageTitles = {
        'dashboard': { main: 'Home', sub: 'Dashboard' },
        'index': { main: 'Home', sub: 'Dashboard' },
        
        'users': { main: 'User Management', sub: 'Users' },
        'roles': { main: 'User Management', sub: 'Roles & Permissions' },
        'departments': { main: 'User Management', sub: 'Departments' },
        'audit-logs': { main: 'User Management', sub: 'Audit Logs' },
        
        'doctors': { main: 'Clinical', sub: 'Doctors' },
        'patients': { main: 'Clinical', sub: 'Patients' },
        'patient-profile': { main: 'Clinical', sub: 'Patient Profile' },
        'opd': { main: 'Clinical', sub: 'OPD' },
        'ipd': { main: 'Clinical', sub: 'IPD' },
        'appointments': { main: 'Clinical', sub: 'Appointments' },
        'consultation': { main: 'Clinical', sub: 'Consultation' },
        'doctor-schedule': { main: 'Clinical', sub: 'Doctor Schedule' },
        
        'emergency': { main: 'Emergency', sub: 'Emergency Register' },
        'emergency-queue': { main: 'Emergency', sub: 'Emergency Queue' },
        'ambulance': { main: 'Emergency', sub: 'Ambulance Request' },
        
        'wards': { main: 'Ward Management', sub: 'Wards' },
        'rooms': { main: 'Ward Management', sub: 'Rooms' },
        'beds': { main: 'Ward Management', sub: 'Beds' },
        
        'categories': { main: 'Pharmacy', sub: 'Categories' },
        'units': { main: 'Pharmacy', sub: 'Units' },
        'medicines': { main: 'Pharmacy', sub: 'Medicines' },
        'suppliers': { main: 'Pharmacy', sub: 'Suppliers' },
        'purchases': { main: 'Pharmacy', sub: 'Purchases' },
        'issue-medicines': { main: 'Pharmacy', sub: 'Issue Medicines' },
        'stock-adjustments': { main: 'Pharmacy', sub: 'Stock Adjustments' },
        
        'lab-categories': { main: 'Laboratory', sub: 'Test Categories' },
        'lab-tests': { main: 'Laboratory', sub: 'Lab Tests' },
        'lab-requests': { main: 'Laboratory', sub: 'Test Requests' },
        
        'radio-categories': { main: 'Radiology', sub: 'Scan Categories' },
        'radio-tests': { main: 'Radiology', sub: 'Radiology Tests' },
        'radio-requests': { main: 'Radiology', sub: 'Scan Requests' },
        
        'invoices': { main: 'Billing & Finance', sub: 'Invoices' },
        'payments': { main: 'Billing & Finance', sub: 'Payments' },
        'financial-reports': { main: 'Billing & Finance', sub: 'Financial Reports' },
        
        'staff-list': { main: 'Staff Management', sub: 'Staff List' },
        'shifts': { main: 'Staff Management', sub: 'Shift Scheduling' },
        'attendance': { main: 'Staff Management', sub: 'Attendance' },
        
        'patient-reports': { main: 'Reports & Analytics', sub: 'Patient Reports' },
        'doctor-performance': { main: 'Reports & Analytics', sub: 'Doctor Performance' },
        'revenue-reports': { main: 'Reports & Analytics', sub: 'Revenue Reports' },
        'bed-occupancy': { main: 'Reports & Analytics', sub: 'Bed Occupancy' },
        'lab-reports': { main: 'Reports & Analytics', sub: 'Lab Activity' },
        
        'documents': { main: 'Documents', sub: 'Patient Documents' },
        'reports-storage': { main: 'Documents', sub: 'Reports Storage' },
        'prescriptions': { main: 'Documents', sub: 'Prescriptions' },
        
        'hospital-profile': { main: 'Settings', sub: 'Hospital Profile' },
        'system-config': { main: 'Settings', sub: 'System Configuration' },
        'notification-settings': { main: 'Settings', sub: 'Notification Settings' }
    };
    
    return pageTitles[pageName] || { main: 'Home', sub: 'Dashboard' };
}

// Universal path resolver
function getCorrectPath(filePath) {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/modules/')) {
        return '../../' + filePath;
    } else {
        return filePath;
    }
}

function adjustLayout() {
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.style.marginLeft = '16rem';
        mainContent.style.marginTop = '4rem';
        mainContent.style.padding = '1.5rem';
    }
}

function setupMobileMenu() {
    setTimeout(() => {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', function() {
                sidebar.classList.toggle('-translate-x-full');
            });
        }
    }, 100);
}

function setActiveMenu() {
    setTimeout(() => {
        const currentPage = window.location.pathname.split('/').pop();
        const allLinks = document.querySelectorAll('.nav-item, .nav-dropdown-content a');
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href === currentPage) {
                link.classList.add('bg-gray-700', 'text-white');
                const parentDropdown = link.closest('.nav-dropdown-content');
                if (parentDropdown) {
                    parentDropdown.classList.remove('hidden');
                    const parentBtn = parentDropdown.previousElementSibling;
                    if (parentBtn) {
                        const icon = parentBtn.querySelector('.fa-chevron-down');
                        if (icon) icon.style.transform = 'rotate(180deg)';
                    }
                }
            }
        });
    }, 200);
}

function reinitDropdowns() {
    setTimeout(() => {
        document.querySelectorAll('.nav-dropdown-btn').forEach(btn => {
            btn.removeEventListener('click', handleManualDropdown);
            btn.addEventListener('click', handleManualDropdown);
        });
    }, 150);
}

function handleManualDropdown(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const content = btn.nextElementSibling;
    const icon = btn.querySelector('.fa-chevron-down');
    if (content) {
        content.classList.toggle('hidden');
        if (icon) {
            icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }
}

window.logout = function() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '../../login.html';
};

window.showToast = function(message, type) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } transition-all duration-300`;
    toast.innerHTML = `<div class="flex items-center gap-2">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    </div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};