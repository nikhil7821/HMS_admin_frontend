/**
 * MedFlow HMS - Common JS
 * Loads sidebar, header, and handles layout
 * Version: 2.0 - Production Ready with RBAC
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
        'emergency-queue': { main: 'Emergency', sub: 'Emergency Queue' },
        'ambulance-request': { main: 'Emergency', sub: 'Ambulance Request' },
        
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
    
    // 🔥 Apply permissions after everything loads
    setTimeout(applyPermissions, 300);
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
        let html = await response.text();
        
        // ─── 🔥 RBAC: Filter sidebar items based on permissions ───
        html = filterSidebarByPermissions(html);
        
        document.body.insertAdjacentHTML('afterbegin', html);
    } catch (error) {
        console.error('Error loading sidebar:', error);
    }
}

// ─── 🔥 RBAC: Filter Sidebar Items ─────────────────────────

function filterSidebarByPermissions(html) {
    const visibleModules = getVisibleModules();
    const visibleModuleIds = visibleModules.map(m => m.id);
    
    console.log('🔍 Filtering sidebar. Visible modules:', visibleModuleIds);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // ─── Handle main nav items ──────────────────────────────
    const navItems = tempDiv.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const moduleId = item.getAttribute('data-module');
        if (moduleId && !visibleModuleIds.includes(moduleId)) {
            item.style.display = 'none';
            item.classList.add('hidden-permission');
        }
    });
    
    // ─── Handle dropdown containers ──────────────────────────
    const dropdowns = tempDiv.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        const moduleId = dropdown.getAttribute('data-module');
        if (moduleId && !visibleModuleIds.includes(moduleId)) {
            dropdown.style.display = 'none';
            dropdown.classList.add('hidden-permission');
        }
    });
    
    // ─── Handle dropdown links ──────────────────────────────
    const dropdownLinks = tempDiv.querySelectorAll('.dropdown-link');
    dropdownLinks.forEach(link => {
        const moduleId = link.getAttribute('data-module');
        if (moduleId && !visibleModuleIds.includes(moduleId)) {
            link.style.display = 'none';
            link.classList.add('hidden-permission');
        }
    });
    
    // ─── Unhide parent dropdowns if any child is visible ──
    dropdowns.forEach(dropdown => {
        const hiddenLinks = dropdown.querySelectorAll('.dropdown-link.hidden-permission');
        const allLinks = dropdown.querySelectorAll('.dropdown-link');
        
        if (allLinks.length > 0 && allLinks.length === hiddenLinks.length) {
            dropdown.style.display = 'none';
            dropdown.classList.add('hidden-permission');
        } else if (dropdown.style.display === 'none') {
            const visibleLinks = dropdown.querySelectorAll('.dropdown-link:not(.hidden-permission)');
            if (visibleLinks.length > 0) {
                dropdown.style.display = '';
                dropdown.classList.remove('hidden-permission');
            }
        }
    });
    
    console.log('✅ Sidebar filtering complete');
    return tempDiv.innerHTML;
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
                const breadcrumbHtml = `<a href="${parentLink}" class="breadcrumb-link">${pageTitleData.main}</a><span class="breadcrumb-separator">/</span><span class="breadcrumb-current" id="breadcrumbCurrent">${pageTitleData.sub}</span>`;
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
        
        if (mainContent) {
            mainContent.classList.add('main-content');
        }
        
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
        
        collapseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const isCollapsed = sidebar.getAttribute('data-collapsed') === 'true';
            
            if (isCollapsed) {
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
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    const icons = { 
        success: 'fa-check-circle', 
        error: 'fa-exclamation-triangle', 
        info: 'fa-info-circle' 
    };
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        padding: 0.75rem 1.25rem;
        border-radius: 12px;
        background: ${colors[type] || colors.info};
        color: white;
        font-family: 'Poppins', sans-serif;
        font-size: 0.8125rem;
        font-weight: 400;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        display: flex;
        align-items: center;
        gap: 0.625rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}" style="font-size:0.875rem;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// ─── 🔥 RBAC - Role Based Access Control Functions ────────

/**
 * ALL MODULES - Complete list of all modules in the system
 */
const ALL_MODULES = [
    // Dashboard
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    
    // User Management
    { id: 'users', label: 'User Management', icon: 'fa-users-cog' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'fa-shield-alt' },
    { id: 'departments', label: 'Departments', icon: 'fa-building' },
    { id: 'audit-logs', label: 'Audit Logs', icon: 'fa-history' },
    
    // Clinical
    { id: 'doctors', label: 'Doctors', icon: 'fa-user-md' },
    { id: 'patients', label: 'Patients', icon: 'fa-users' },
    { id: 'patient-profile', label: 'Patient Profile', icon: 'fa-id-card' },
    { id: 'opd', label: 'OPD', icon: 'fa-walking' },
    { id: 'ipd', label: 'IPD', icon: 'fa-procedures' },
    { id: 'appointments', label: 'Appointments', icon: 'fa-calendar-check' },
    { id: 'consultation', label: 'Consultation', icon: 'fa-prescription-bottle' },
    { id: 'doctor-schedule', label: 'Doctor Schedule', icon: 'fa-clock' },
    
    // Emergency
    { id: 'emergency', label: 'Emergency Register', icon: 'fa-ambulance' },
    { id: 'emergency-queue', label: 'Emergency Queue', icon: 'fa-hourglass-half' },
    { id: 'ambulance-request', label: 'Ambulance Request', icon: 'fa-truck' },
    
    // Ward Management
    { id: 'wards', label: 'Wards', icon: 'fa-bed' },
    { id: 'rooms', label: 'Rooms', icon: 'fa-door-open' },
    { id: 'beds', label: 'Beds', icon: 'fa-bed' },
    
    // Pharmacy
    { id: 'categories', label: 'Categories', icon: 'fa-tags' },
    { id: 'units', label: 'Units', icon: 'fa-ruler' },
    { id: 'medicines', label: 'Medicines', icon: 'fa-pills' },
    { id: 'suppliers', label: 'Suppliers', icon: 'fa-truck' },
    { id: 'purchases', label: 'Purchases', icon: 'fa-shopping-cart' },
    { id: 'issue-medicines', label: 'Issue Medicines', icon: 'fa-hand-holding-heart' },
    { id: 'stock-adjustments', label: 'Stock Adjustments', icon: 'fa-balance-scale' },
    
    // Laboratory
    { id: 'lab-categories', label: 'Test Categories', icon: 'fa-tag' },
    { id: 'lab-tests', label: 'Lab Tests', icon: 'fa-flask' },
    { id: 'lab-requests', label: 'Test Requests', icon: 'fa-file-medical' },
    
    // Radiology
    { id: 'radio-categories', label: 'Scan Categories', icon: 'fa-tag' },
    { id: 'radio-tests', label: 'Radiology Tests', icon: 'fa-scan' },
    { id: 'radio-requests', label: 'Scan Requests', icon: 'fa-file-medical' },
    
    // Billing & Finance
    { id: 'invoices', label: 'Invoices', icon: 'fa-file-invoice' },
    { id: 'payments', label: 'Payments', icon: 'fa-credit-card' },
    { id: 'financial-reports', label: 'Financial Reports', icon: 'fa-chart-bar' },
    
    // Staff Management
    { id: 'staff-list', label: 'Staff List', icon: 'fa-id-badge' },
    { id: 'shifts', label: 'Shift Scheduling', icon: 'fa-clock' },
    { id: 'attendance', label: 'Attendance', icon: 'fa-clipboard-list' },
    
    // Reports & Analytics
    { id: 'patient-reports', label: 'Patient Reports', icon: 'fa-user-chart' },
    { id: 'doctor-performance', label: 'Doctor Performance', icon: 'fa-user-md-chart' },
    { id: 'revenue-reports', label: 'Revenue Reports', icon: 'fa-rupee-sign' },
    { id: 'bed-occupancy', label: 'Bed Occupancy', icon: 'fa-bed' },
    { id: 'lab-reports', label: 'Lab Activity', icon: 'fa-microscope' },
    
    // Documents
    { id: 'documents', label: 'Patient Documents', icon: 'fa-folder-open' },
    { id: 'reports-storage', label: 'Reports Storage', icon: 'fa-archive' },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'fa-prescription' },
    
    // Settings
    { id: 'hospital-profile', label: 'Hospital Profile', icon: 'fa-hospital' },
    { id: 'system-config', label: 'System Configuration', icon: 'fa-sliders-h' },
    { id: 'notification-settings', label: 'Notification Settings', icon: 'fa-bell' }
];

/**
 * Check if current user has a specific permission
 */
function hasPermission(module, action) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Super Admin → ALLOW EVERYTHING
        if (user.isSuperAdmin === true) return true;
        if (!user || !user.roleId) return true;
        
        const roles = JSON.parse(localStorage.getItem('system_roles') || '[]');
        if (!roles || roles.length === 0) return true;
        
        const role = roles.find(r => r.id === user.roleId);
        if (!role) return true;
        if (role.name === 'Super Administrator' || role.id === 999) return true;
        
        return role.permissions?.[module]?.includes(action) || false;
    } catch (error) {
        console.error('Error checking permission:', error);
        return true;
    }
}

/**
 * Get all modules visible to current user
 */
function getVisibleModules() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // 🔥 SUPER ADMIN - SAB KUCH DIKHAO
        if (user.isSuperAdmin === true) {
            console.log('⭐ Super Admin - ALL modules visible');
            return ALL_MODULES;
        }
        
        if (!user || !user.roleId) {
            console.log('⚠️ No user - showing all modules');
            return ALL_MODULES;
        }
        
        const roles = JSON.parse(localStorage.getItem('system_roles') || '[]');
        if (!roles || roles.length === 0) {
            console.log('⚠️ No roles - showing all modules');
            return ALL_MODULES;
        }
        
        const role = roles.find(r => r.id === user.roleId);
        if (!role) {
            console.log('⚠️ Role not found - showing all modules');
            return ALL_MODULES;
        }
        
        if (role.name === 'Super Administrator' || role.id === 999) {
            console.log('⭐ Super Admin role - ALL modules visible');
            return ALL_MODULES;
        }
        
        // Filter modules based on permissions
        const visible = ALL_MODULES.filter(m => {
            const perms = role.permissions?.[m.id] || [];
            return perms.length > 0;
        });
        
        if (visible.length === 0) {
            console.log('⚠️ No visible modules - showing all');
            return ALL_MODULES;
        }
        
        console.log('🔐 Visible modules:', visible.length);
        return visible;
    } catch (error) {
        console.error('Error getting visible modules:', error);
        return ALL_MODULES;
    }
}

/**
 * Check if user has ANY permission for a module
 */
function hasModuleAccess(module) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.isSuperAdmin === true) return true;
        if (!user || !user.roleId) return true;
        
        const roles = JSON.parse(localStorage.getItem('system_roles') || '[]');
        if (!roles || roles.length === 0) return true;
        
        const role = roles.find(r => r.id === user.roleId);
        if (!role) return true;
        if (role.name === 'Super Administrator' || role.id === 999) return true;
        
        const perms = role.permissions?.[module] || [];
        return perms.length > 0;
    } catch (error) {
        console.error('Error checking module access:', error);
        return true;
    }
}

/**
 * Get current user's role
 */
function getCurrentUserRole() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user || !user.roleId) return null;
        
        const roles = JSON.parse(localStorage.getItem('system_roles') || '[]');
        return roles.find(r => r.id === user.roleId) || null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

/**
 * Check if current user is Admin
 */
function isAdmin() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.isSuperAdmin === true) return true;
        
        const role = getCurrentUserRole();
        return role && (role.name === 'Administrator' || role.name === 'Super Administrator' || role.id === 999);
    } catch (error) {
        return false;
    }
}

// ─── 🔥 Apply Permissions to All Elements ────────────────────

function applyPermissions() {
    try {
        const elements = document.querySelectorAll('[data-perm]');
        let hiddenCount = 0;
        let visibleCount = 0;
        
        elements.forEach(el => {
            const perm = el.getAttribute('data-perm').split(':');
            if (perm.length !== 2) {
                console.warn('Invalid data-perm format:', el.getAttribute('data-perm'));
                return;
            }
            
            const module = perm[0].trim();
            const action = perm[1].trim();
            
            const hasPerm = hasPermission(module, action);
            
            if (!hasPerm) {
                el.style.display = 'none';
                el.classList.add('permission-hidden');
                hiddenCount++;
            } else {
                el.style.display = '';
                el.classList.remove('permission-hidden');
                visibleCount++;
            }
        });
        
        if (elements.length > 0) {
            console.log(`🔐 Permissions applied: ${visibleCount} visible, ${hiddenCount} hidden`);
        }
    } catch (error) {
        console.error('Error applying permissions:', error);
    }
}

// ─── 🔥 Auto-apply permissions on DOM changes ──────────────────

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(applyPermissions, 200);
});

document.addEventListener('permissionsUpdated', function() {
    setTimeout(applyPermissions, 100);
});

if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.querySelector && node.querySelector('[data-perm]')) {
                            shouldUpdate = true;
                        }
                        if (node.hasAttribute && node.hasAttribute('data-perm')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        if (shouldUpdate) {
            setTimeout(applyPermissions, 50);
        }
    });
    
    document.addEventListener('DOMContentLoaded', function() {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// ─── 🔥 Expose RBAC functions globally ────────────────────

window.ALL_MODULES = ALL_MODULES;
window.hasPermission = hasPermission;
window.getVisibleModules = getVisibleModules;
window.hasModuleAccess = hasModuleAccess;
window.getCurrentUserRole = getCurrentUserRole;
window.isAdmin = isAdmin;
window.applyPermissions = applyPermissions;
window.filterSidebarByPermissions = filterSidebarByPermissions;

// ─── 🔥 Inject CSS for toast animations ─────────────────────

(function injectToastStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .toast-notification {
            animation: slideInRight 0.3s ease-out;
        }
        .permission-hidden {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
})();

console.log('✅ MedFlow HMS Common JS loaded successfully!');
console.log('🔐 RBAC System ready with', ALL_MODULES.length, 'modules');