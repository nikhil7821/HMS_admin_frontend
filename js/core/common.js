/**
 * MedFlow HMS - Common JS
 * Loads sidebar, header, and handles layout
 */

// ─── Page Title Data ─────────────────────────────────────────

function getPageTitleData() {
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop();
    const pageName = fileName.replace('.html', '');
    
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

function getCorrectPath(filePath) {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/modules/')) {
        return '../../' + filePath;
    } else {
        return filePath;
    }
}

// ─── Load Components ──────────────────────────────────────

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!token && !isLoginPage) {
        window.location.href = '../../login.html';
        return;
    }
    
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
    initSidebar();
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
        
        if (pageTitleData) {
            const displayTitle = `${pageTitleData.main} / ${pageTitleData.sub}`;
            html = html.replace('id="pageTitle">Loading...</h1>', `id="pageTitle">${displayTitle}</h1>`);
            html = html.replace('id="breadcrumbCurrent">Loading...</span>', `id="breadcrumbCurrent">${pageTitleData.sub}</span>`);
            html = html.replace('id="mobilePageTitle">Loading...</div>', `id="mobilePageTitle">${pageTitleData.sub}</div>`);
            
            if (pageTitleData.main !== 'Home') {
                let parentLink = getParentLink(pageTitleData.main);
                const breadcrumbHtml = `<a href="${parentLink}" class="breadcrumb-link">${pageTitleData.main}</a><span class="breadcrumb-separator">/</span><span class="breadcrumb-current">${pageTitleData.sub}</span>`;
                html = html.replace('<span>Home</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-current" id="breadcrumbCurrent">Loading...</span>', breadcrumbHtml);
            }
        }
        
        document.body.insertAdjacentHTML('afterbegin', html);
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// ─── Layout Adjustment ─────────────────────────────────────

function adjustLayout() {
    const mainContent = document.querySelector('main, .main-content');
    const sidebar = document.getElementById('mainSidebar');
    const header = document.getElementById('mainHeader');
    
    if (mainContent) {
        const isCollapsed = sidebar && sidebar.getAttribute('data-collapsed') === 'true';
        const sidebarWidth = isCollapsed ? '72px' : '260px';
        
        mainContent.style.marginLeft = sidebarWidth;
        mainContent.style.marginTop = '70px';
        mainContent.style.padding = '1.5rem';
        mainContent.style.transition = 'margin-left 0.3s ease';
        mainContent.style.maxWidth = `calc(100% - ${sidebarWidth})`;
    }
    
    if (header) {
        const isCollapsed = sidebar && sidebar.getAttribute('data-collapsed') === 'true';
        header.style.left = isCollapsed ? '72px' : '260px';
        header.style.transition = 'left 0.3s ease';
        header.style.width = `calc(100% - ${isCollapsed ? '72px' : '260px'})`;
    }
}

// ─── Sidebar Initialization ─────────────────────────────────

function initSidebar() {
    setTimeout(() => {
        const sidebar = document.getElementById('mainSidebar');
        const collapseBtn = document.getElementById('collapseBtn');
        const mainContent = document.querySelector('main, .main-content');
        
        if (!sidebar || !collapseBtn) {
            console.error('❌ Sidebar or collapse button not found!');
            return;
        }
        
        // Add classes for CSS
        if (mainContent) {
            mainContent.classList.add('main-content');
        }
        
        // Load saved state
        const savedState = localStorage.getItem('sidebarCollapsed');
        
        if (savedState === 'true') {
            sidebar.setAttribute('data-collapsed', 'true');
            if (mainContent) {
                mainContent.classList.add('sidebar-collapsed');
                mainContent.classList.remove('sidebar-expanded');
            }
            const icon = collapseBtn.querySelector('i');
            if (icon) {
                icon.style.transform = 'rotate(180deg)';
            }
            updateLayout(true);
        } else {
            sidebar.setAttribute('data-collapsed', 'false');
            if (mainContent) {
                mainContent.classList.add('sidebar-expanded');
                mainContent.classList.remove('sidebar-collapsed');
            }
            updateLayout(false);
        }
        
        // Toggle sidebar
        collapseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const isCollapsed = sidebar.getAttribute('data-collapsed') === 'true';
            
            if (isCollapsed) {
                // Expand
                sidebar.setAttribute('data-collapsed', 'false');
                localStorage.setItem('sidebarCollapsed', 'false');
                if (mainContent) {
                    mainContent.classList.remove('sidebar-collapsed');
                    mainContent.classList.add('sidebar-expanded');
                }
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                }
                sidebar.style.width = '';
                updateLayout(false);
            } else {
                // Collapse
                sidebar.setAttribute('data-collapsed', 'true');
                localStorage.setItem('sidebarCollapsed', 'true');
                if (mainContent) {
                    mainContent.classList.remove('sidebar-expanded');
                    mainContent.classList.add('sidebar-collapsed');
                }
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                }
                sidebar.style.width = '';
                updateLayout(true);
            }
        });
        
        console.log('✅ Sidebar initialized successfully!');
    }, 200);
}

// ─── Update Layout ────────────────────────────────────────

function updateLayout(isCollapsed) {
    const sidebar = document.getElementById('mainSidebar');
    const mainContent = document.querySelector('main, .main-content');
    const header = document.getElementById('mainHeader');
    const sidebarWidth = isCollapsed ? '72px' : '260px';
    
    if (sidebar) {
        sidebar.style.width = sidebarWidth;
    }
    
    if (mainContent) {
        mainContent.style.marginLeft = sidebarWidth;
        mainContent.style.transition = 'margin-left 0.3s ease';
        mainContent.style.maxWidth = `calc(100% - ${sidebarWidth})`;
        mainContent.style.width = 'auto';
    }
    
    if (header) {
        header.style.left = sidebarWidth;
        header.style.transition = 'left 0.3s ease';
        header.style.width = `calc(100% - ${sidebarWidth})`;
    }
    
    const collapseBtn = document.getElementById('collapseBtn');
    if (collapseBtn && sidebar) {
        if (isCollapsed) {
            collapseBtn.style.left = '72px';
            collapseBtn.style.right = 'auto';
        } else {
            collapseBtn.style.left = 'auto';
            collapseBtn.style.right = '12px';
        }
    }
    
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
        detail: { collapsed: isCollapsed }
    }));
}

// ─── Update Layout on Hover ───────────────────────────────

function updateLayoutOnHover(isExpanded) {
    const sidebar = document.getElementById('mainSidebar');
    const sidebarWidth = isExpanded ? '260px' : '72px';
    const mainContent = document.querySelector('main, .main-content');
    const header = document.getElementById('mainHeader');
    
    if (mainContent) {
        mainContent.style.marginLeft = sidebarWidth;
        mainContent.style.transition = 'margin-left 0.3s ease';
        mainContent.style.maxWidth = `calc(100% - ${sidebarWidth})`;
    }
    
    if (header) {
        header.style.left = sidebarWidth;
        header.style.transition = 'left 0.3s ease';
        header.style.width = `calc(100% - ${sidebarWidth})`;
    }
    
    const collapseBtn = document.getElementById('collapseBtn');
    if (collapseBtn && sidebar) {
        if (isExpanded) {
            collapseBtn.style.left = '260px';
            collapseBtn.style.right = 'auto';
        } else {
            collapseBtn.style.left = '72px';
            collapseBtn.style.right = 'auto';
        }
    }
    
    window.dispatchEvent(new CustomEvent('sidebarHoverToggle', {
        detail: { expanded: isExpanded }
    }));
}

// ─── Mobile Menu ───────────────────────────────────────────

function setupMobileMenu() {
    setTimeout(() => {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('mainSidebar');
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', function() {
                sidebar.classList.toggle('mobile-open');
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
                link.classList.add('active');
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

// ─── Global Functions ─────────────────────────────────────

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