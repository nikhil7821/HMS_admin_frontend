// Common JS - Loads sidebar and header on all pages

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!token && !isLoginPage) {
        window.location.href = '../../login.html';
        return;
    }
    
    await loadComponents();
    setupMobileMenu();
    setActiveMenu();
    reinitDropdowns();
});

async function loadComponents() {
    await loadSidebar();
    await loadHeader();
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
        document.body.insertAdjacentHTML('afterbegin', '<div style="display:none;" id="sidebar-error"></div>');
    }
}

async function loadHeader() {
    try {
        const headerPath = getCorrectPath('components/header.html');
        const response = await fetch(headerPath);
        const html = await response.text();
        document.body.insertAdjacentHTML('afterbegin', html);
    } catch (error) {
        console.error('Error loading header:', error);
        document.body.insertAdjacentHTML('afterbegin', '<div style="display:none;" id="header-error"></div>');
    }
}

// Universal path resolver - works for ALL modules and root level
function getCorrectPath(filePath) {
    const currentPath = window.location.pathname;
    
    // If we're in any modules folder (modules/billing/, modules/clinical/, etc.)
    // All module files are at: modules/modulename/filename.html
    // So we need to go up 2 levels: ../../components/sidebar.html
    if (currentPath.includes('/modules/')) {
        return '../../' + filePath;
    }
    // Root level files (index.html, login.html)
    else {
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
                // Expand parent dropdown if any
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

// Reinitialize dropdowns after sidebar is loaded
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

// Global logout function
window.logout = function() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '../../login.html';
};

// Global showToast function (for pages that don't have it)
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