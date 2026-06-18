/**
 * Dashboard JS - MedFlow HMS
 * Redirects to pages and auto-opens forms
 * Uses theme.css for styling
 */

// ─── Data Store ──────────────────────────────────────

const DashboardData = {
    stats: {
        opd: 217,
        ipd: 53,
        revenue: 19420,
        bedOccupancy: 71,
        totalBeds: 118,
        availableBeds: 34
    },
    
    appointments: [
        { patient: 'Priya Sharma', doctor: 'Dr. Anjali Nair', time: '09:00 AM', status: 'Completed', statusType: 'completed' },
        { patient: 'Rajesh Kumar', doctor: 'Dr. Vikram Singh', time: '10:30 AM', status: 'In Progress', statusType: 'progress' },
        { patient: 'Meera Desai', doctor: 'Dr. Sneha Joshi', time: '01:15 PM', status: 'Scheduled', statusType: 'scheduled' },
        { patient: 'Amit Patel', doctor: 'Dr. Rajiv Menon', time: '03:45 PM', status: 'Scheduled', statusType: 'scheduled' },
        { patient: 'Kavya Reddy', doctor: 'Dr. Neha Gupta', time: '05:00 PM', status: 'Scheduled', statusType: 'scheduled' }
    ],
    
    schedule: [
        { time: '08:30 AM', doctor: 'Dr. Anjali Nair', dept: 'Cardiology', patients: 5 },
        { time: '10:00 AM', doctor: 'Dr. Vikram Singh', dept: 'Neurology', patients: 4 },
        { time: '11:30 AM', doctor: 'Dr. Sneha Joshi', dept: 'Pediatrics', patients: 6 },
        { time: '01:45 PM', doctor: 'Dr. Rajiv Menon', dept: 'Orthopedics', patients: 3 },
        { time: '03:15 PM', doctor: 'Dr. Neha Gupta', dept: 'Dermatology', patients: 2 },
        { time: '04:30 PM', doctor: 'Dr. Sanjay Kulkarni', dept: 'General Medicine', patients: 4 }
    ],
    
    tasks: [
        { icon: 'fa-file-invoice', title: 'Pending Bills', count: 24, action: 'Review Now', bg: '#faf7f2', iconColor: '#a8c49a', textColor: '#8aae7a' },
        { icon: 'fa-flask', title: 'Lab Reports', count: 16, action: 'Upload', bg: '#f8f4ef', iconColor: '#d4a853', textColor: '#c49a40' },
        { icon: 'fa-pills', title: 'Stock Alert', count: 9, action: 'Reorder', bg: '#fef8f0', iconColor: '#d8b48c', textColor: '#c9a47c' },
        { icon: 'fa-clock', title: 'Discharges', count: 11, action: 'Approve', bg: '#f5f2ed', iconColor: '#b8aa9a', textColor: '#9a8e82' }
    ]
};

// ─── Page URL Mappings ──────────────────────────────

const PAGE_CONFIG = {
    'add-patient': {
        url: '../../modules/clinical/patients.html',
        action: 'openAddPatient'
    },
    'book-appointment': {
        url: '../../modules/clinical/appointments.html',
        action: 'openBookAppointment'
    },
    'admit-patient': {
        url: '../../modules/clinical/ipd.html',
        action: 'openAdmitPatient'
    },
    'create-bill': {
        url: '../../modules/billing/invoices.html',
        action: 'openCreateInvoice'
    },
    'emergency': {
        url: '../../modules/emergency/emergency.html',
        action: null
    },
    'appointments': {
        url: '../../modules/clinical/appointments.html',
        action: null
    },
    'invoices': {
        url: '../../modules/billing/invoices.html',
        action: null
    },
    'patients': {
        url: '../../modules/clinical/patients.html',
        action: null
    }
};

// ─── Get Correct Path ───────────────────────────────

function getPageUrl(pageKey) {
    var config = PAGE_CONFIG[pageKey];
    if (!config) return '#';
    var url = config.url;
    var currentPath = window.location.pathname;
    if (currentPath.includes('/modules/')) {
        url = url.replace('../../modules/', '../');
    }
    return url;
}

function getPageAction(pageKey) {
    var config = PAGE_CONFIG[pageKey];
    return config ? config.action : null;
}

// ─── Redirect with Auto-Open Form ───────────────────

function redirectWithAction(pageKey) {
    var url = getPageUrl(pageKey);
    var action = getPageAction(pageKey);
    
    if (url && url !== '#') {
        // Store the action in sessionStorage before redirect
        if (action) {
            sessionStorage.setItem('dashboard_action', action);
        }
        window.location.href = url;
    } else {
        showToast('Page not found', 'error');
    }
}

// ─── Check and Execute Auto-Open Action ────────────

function checkAndExecuteAction() {
    var action = sessionStorage.getItem('dashboard_action');
    if (action) {
        // Clear it immediately to prevent re-triggering
        sessionStorage.removeItem('dashboard_action');
        
        // Wait for page to fully load
        setTimeout(function() {
            executeAction(action);
        }, 500);
    }
}

function executeAction(action) {
    switch(action) {
        case 'openAddPatient':
            openModal('patientModal', 'openAddModal');
            break;
        case 'openBookAppointment':
            openModal('appointmentModal', 'openAddModal');
            break;
        case 'openAdmitPatient':
            openModal('ipdModal', 'openAddModal');
            break;
        case 'openCreateInvoice':
            openModal('invoiceModal', 'openCreateModal');
            break;
        default:
            console.log('Unknown action:', action);
    }
}

// ─── Generic Modal Opener ───────────────────────────

function openModal(modalId, openFunction) {
    // Check if modal exists
    var modal = document.getElementById(modalId);
    if (modal) {
        // Try to call the open function
        if (typeof window[openFunction] === 'function') {
            window[openFunction]();
        } else {
            // Fallback: just open the modal
            modal.classList.add('active');
        }
    } else {
        console.log('Modal not found:', modalId);
    }
}

// ─── Escape HTML ──────────────────────────────────────

function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Toast Notification ──────────────────────────────

function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    var icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    var colors = { success: '#8aae7a', error: '#d8b48c', info: '#a8c49a' };
    
    toast.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; align-items:center; gap:8px; padding:10px 20px; border-radius:12px; background:' + colors[type] + '; color:white; font-weight:500; font-size:0.75rem; backdrop-filter:blur(8px); box-shadow:0 4px 12px rgba(0,0,0,0.08); animation:slideInRight 0.25s ease-out; font-family:Poppins, sans-serif;';
    toast.innerHTML = '<i class="fas ' + icons[type] + '"></i><span>' + esc(message) + '</span>';
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 250);
    }, 3000);
}

// ─── Number Animation ──────────────────────────────

function animateNumber(elementId, endValue, isCurrency, suffix) {
    isCurrency = isCurrency || false;
    suffix = suffix || '';
    var element = document.getElementById(elementId);
    if (!element) return;
    
    var duration = 500;
    var startTime = performance.now();
    
    function easeOutQuad(t) { return t * (2 - t); }
    
    function update(currentTime) {
        var elapsed = currentTime - startTime;
        var progress = Math.min(1, elapsed / duration);
        progress = easeOutQuad(progress);
        var currentValue = Math.floor(progress * endValue);
        
        if (isCurrency) {
            element.textContent = '₹' + currentValue.toLocaleString('en-IN');
        } else {
            element.textContent = currentValue + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = isCurrency ? '₹' + endValue.toLocaleString('en-IN') : endValue + suffix;
        }
    }
    
    requestAnimationFrame(update);
}

// ─── Load Stats ──────────────────────────────────────

function loadDashboardStats() {
    var s = DashboardData.stats;
    animateNumber('opdCount', s.opd, false, '');
    animateNumber('ipdCount', s.ipd, false, '');
    animateNumber('revenueCount', s.revenue, true, '');
    animateNumber('bedOccupancy', s.bedOccupancy, false, '%');
    
    var availableEl = document.getElementById('availableBeds');
    if (availableEl) availableEl.textContent = s.availableBeds;
}

// ─── Load Appointments ──────────────────────────────

function loadRecentAppointments() {
    var tbody = document.getElementById('recentAppointments');
    if (!tbody) return;
    
    var statusClassMap = {
        completed: 'badge-completed',
        progress: 'badge-progress',
        scheduled: 'badge-scheduled'
    };
    
    var rows = '';
    for (var i = 0; i < DashboardData.appointments.length; i++) {
        var app = DashboardData.appointments[i];
        var badgeClass = statusClassMap[app.statusType] || 'badge-scheduled';
        rows += '<tr class="dashboard-table-row">';
        rows += '<td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem;">' + esc(app.patient) + '</td>';
        rows += '<td style="color:var(--color-brown-300); font-size:0.8125rem;">' + esc(app.doctor) + '</td>';
        rows += '<td style="color:var(--color-brown-300); font-size:0.8125rem;">' + app.time + '</td>';
        rows += '<td><span class="' + badgeClass + '">' + app.status + '</span></td>';
        rows += '</tr>';
    }
    
    tbody.innerHTML = rows;
}

// ─── Load Schedule ──────────────────────────────────

function loadTodaySchedule() {
    var container = document.getElementById('todaySchedule');
    if (!container) return;
    
    var html = '';
    for (var i = 0; i < DashboardData.schedule.length; i++) {
        var s = DashboardData.schedule[i];
        html += '<div class="schedule-item">';
        html += '<div class="doc-info">';
        html += '<div class="doc-avatar"><i class="fas fa-user-md"></i></div>';
        html += '<div><p class="doc-name">' + esc(s.doctor) + '</p><p class="doc-dept">' + esc(s.dept) + '</p></div>';
        html += '</div>';
        html += '<div style="text-align:right;"><p class="schedule-time">' + s.time + '</p><p class="schedule-patients">' + s.patients + ' pts</p></div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// ─── Load Tasks ──────────────────────────────────────

function loadPendingTasks() {
    var container = document.getElementById('pendingTasks');
    if (!container) return;
    
    var html = '';
    for (var i = 0; i < DashboardData.tasks.length; i++) {
        var task = DashboardData.tasks[i];
        html += '<div class="task-card" style="background:' + task.bg + ';">';
        html += '<div class="task-header">';
        html += '<div style="display:flex; align-items:center; gap:0.5rem;">';
        html += '<div class="task-icon"><i class="fas ' + task.icon + '" style="color:' + task.iconColor + ';"></i></div>';
        html += '<span class="task-title">' + task.title + '</span>';
        html += '</div>';
        html += '<span class="task-count" style="color:' + task.textColor + ';">' + task.count + '</span>';
        html += '</div>';
        html += '<button class="task-action-btn" data-action="' + task.action + '" style="color:' + task.textColor + ';">';
        html += task.action + ' <i class="fas fa-arrow-right" style="font-size:0.625rem;"></i>';
        html += '</button>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// ─── Update Alert Count ─────────────────────────────

function updateAlertCount() {
    var alertEl = document.getElementById('alertCount');
    if (alertEl) {
        var total = 0;
        for (var i = 0; i < DashboardData.tasks.length; i++) {
            total += DashboardData.tasks[i].count;
        }
        alertEl.textContent = total;
    }
}

// ─── Welcome Message ────────────────────────────────

function loadWelcomeMessage() {
    var user = JSON.parse(localStorage.getItem('user') || '{"name":"Dr. Arjun"}');
    var hour = new Date().getHours();
    var greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';
    
    var welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) {
        welcomeEl.innerHTML = greeting + ', <span style="font-weight:var(--font-weight-medium);">' + esc(user.name || 'Dr. Arjun') + '</span> <span style="font-weight:var(--font-weight-light);">🌿</span>';
    }
}

// ─── Update DateTime ─────────────────────────────────

function updateDateTime() {
    var now = new Date();
    var dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var timeOptions = { hour: '2-digit', minute: '2-digit' };
    
    var dateStr = now.toLocaleDateString('en-IN', dateOptions);
    var timeStr = now.toLocaleTimeString('en-IN', timeOptions);
    
    var dateTimeEl = document.getElementById('currentDateTime');
    if (dateTimeEl) {
        dateTimeEl.innerHTML = '<i class="far fa-calendar-alt" style="margin-right:0.25rem;"></i> ' + dateStr + ' | <i class="far fa-clock" style="margin-right:0.25rem;"></i> ' + timeStr;
    }
    
    var todayDateEl = document.getElementById('todayDate');
    if (todayDateEl) {
        todayDateEl.textContent = now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
    
    var liveEl = document.getElementById('liveTimestamp');
    if (liveEl) {
        liveEl.textContent = 'Updated ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
}

// ─── Quick Actions ──────────────────────────────────

function initQuickActions() {
    var buttons = document.querySelectorAll('[data-action]');
    
    buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var action = this.getAttribute('data-action');
            redirectWithAction(action);
        });
    });
}

// ─── View All Links ─────────────────────────────────

function initViewAllLinks() {
    var links = document.querySelectorAll('.view-all');
    
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var target = this.getAttribute('data-target');
            if (target) {
                redirectWithAction(target);
            }
        });
    });
}

// ─── Task Actions ───────────────────────────────────

function initTaskActions() {
    document.addEventListener('click', function(e) {
        var target = e.target.closest('.task-action-btn');
        if (target) {
            var action = target.getAttribute('data-action');
            showToast('⚡ ' + action + ' module - Preview', 'info');
        }
    });
}

// ─── Auto Refresh ───────────────────────────────────

function startAutoRefresh() {
    setInterval(function() {
        var now = new Date();
        var liveEl = document.getElementById('liveTimestamp');
        if (liveEl) {
            liveEl.textContent = 'Updated ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        }
    }, 30000);
}

// ─── Init Dashboard ─────────────────────────────────

function initDashboard() {
    loadWelcomeMessage();
    updateDateTime();
    loadDashboardStats();
    loadRecentAppointments();
    loadTodaySchedule();
    loadPendingTasks();
    updateAlertCount();
    initQuickActions();
    initViewAllLinks();
    initTaskActions();
    
    setInterval(updateDateTime, 1000);
    startAutoRefresh();
}

// ─── Expose for inline usage ───────────────────────

window.showToast = showToast;
window.redirectWithAction = redirectWithAction;
window.checkAndExecuteAction = checkAndExecuteAction;
window.executeAction = executeAction;
window.openModal = openModal;

// ─── Check for auto-open action on page load ───────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initDashboard();
        checkAndExecuteAction();
    });
} else {
    initDashboard();
    checkAndExecuteAction();
}