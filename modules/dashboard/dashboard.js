/**
 * Dashboard JS - Main Dashboard
 * Professional UI, Fully Working, Indian Names, Rupee Symbol
 */

// Data Store
const DashboardData = {
    stats: {
        opd: 0,
        ipd: 0,
        revenue: 0,
        bedOccupancy: 0,
        totalBeds: 0,
        availableBeds: 0
    },
    
    appointments: []
};

// Global Toast System
window.showToast = function(message, type = 'success') {
    const toast = document.createElement('div');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a' };
    
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 50;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 12px;
        background: ${colors[type]};
        color: white;
        font-weight: 500;
        font-size: 0.75rem;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        animation: slideInRight 0.25s ease-out;
    `;
    toast.innerHTML = `<i class="fas ${icons[type]} text-sm"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
    }, 2800);
};

// Number animation
function animateNumber(elementId, endValue, isCurrency = false, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 500;
    const startTime = performance.now();
    
    function easeOutQuad(t) { return t * (2 - t); }
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        let progress = Math.min(1, elapsed / duration);
        progress = easeOutQuad(progress);
        const currentValue = Math.floor(progress * endValue);
        
        if (isCurrency) {
            element.innerText = '₹' + currentValue.toLocaleString('en-IN');
        } else {
            element.innerText = currentValue + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.innerText = isCurrency ? '₹' + endValue.toLocaleString('en-IN') : endValue + suffix;
        }
    }
    
    requestAnimationFrame(update);
}

// Load Statistics from localStorage
function loadDashboardStats() {
    // Get OPD visits for today
    const opdVisits = JSON.parse(localStorage.getItem('hms_opd') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayOpd = opdVisits.filter(v => v.date === today).length;
    
    // Get IPD admitted patients
    const ipdPatients = JSON.parse(localStorage.getItem('hms_ipd') || '[]');
    const currentIpd = ipdPatients.filter(p => p.status === 'Admitted').length;
    
    // Get today's revenue
    const invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
    const todayRevenue = invoices.filter(i => i.date === today && i.status === 'Paid')
        .reduce((sum, i) => sum + (i.total || i.amount || 0), 0);
    
    // Get bed occupancy
    const beds = JSON.parse(localStorage.getItem('beds') || '[]');
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    
    DashboardData.stats.opd = todayOpd;
    DashboardData.stats.ipd = currentIpd;
    DashboardData.stats.revenue = todayRevenue;
    DashboardData.stats.bedOccupancy = occupancyRate;
    DashboardData.stats.totalBeds = totalBeds;
    DashboardData.stats.availableBeds = totalBeds - occupiedBeds;
    
    animateNumber('opdCount', todayOpd, false, '');
    animateNumber('ipdCount', currentIpd, false, '');
    animateNumber('revenueCount', todayRevenue, true, '');
    animateNumber('bedOccupancy', occupancyRate, false, '%');
    
    const totalBedsEl = document.getElementById('totalBeds');
    if (totalBedsEl) totalBedsEl.innerText = totalBeds;
}

// Load Recent Appointments
function loadRecentAppointments() {
    const appointments = JSON.parse(localStorage.getItem('hms_appointments') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    // Get recent appointments (today and upcoming, limit to 5)
    let recent = appointments.filter(a => a.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
    
    if (recent.length === 0) {
        recent = appointments.slice(0, 5);
    }
    
    const tbody = document.getElementById('appointmentsTable');
    if (!tbody) return;
    
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-[#94a3b8]">No appointments found</td></td>';
        return;
    }
    
    const statusClassMap = {
        'Completed': 'status-badge-completed',
        'Scheduled': 'status-badge-scheduled',
        'Cancelled': 'status-badge-progress',
        'In Progress': 'status-badge-progress'
    };
    
    tbody.innerHTML = recent.map(app => `
        <tr class="appointment-row">
            <td class="px-5 py-3 text-sm font-medium text-[#1e293b]">${escapeHtml(app.patientName || 'Unknown')}</td>
            <td class="px-5 py-3 text-sm text-[#475569]">${escapeHtml(app.doctorName || 'Unknown')}</td>
            <td class="px-5 py-3 text-sm text-[#475569]">${app.date}</td>
            <td class="px-5 py-3 text-sm text-[#475569]">${app.time}</td>
            <td class="px-5 py-3">
                <span class="${statusClassMap[app.status] || 'status-badge-scheduled'}">
                    ${app.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// Welcome Message
function loadWelcomeMessage() {
    const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin"}');
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    if (hour >= 17) greeting = 'Good Evening';
    
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) {
        welcomeEl.innerHTML = `${greeting}, ${escapeHtml(user.name || 'Admin')}! 👋`;
    }
}

// Update DateTime
function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    
    const dateStr = now.toLocaleDateString('en-IN', dateOptions);
    const timeStr = now.toLocaleTimeString('en-IN', timeOptions);
    
    const dateTimeEl = document.getElementById('currentDateTime');
    if (dateTimeEl) {
        dateTimeEl.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dateStr} | <i class="far fa-clock mr-1"></i> ${timeStr}`;
    }
    
    const liveEl = document.getElementById('liveTimestamp');
    if (liveEl) {
        liveEl.innerText = `Updated ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Auto Refresh
function startAutoRefresh() {
    setInterval(() => {
        const now = new Date();
        const liveEl = document.getElementById('liveTimestamp');
        if (liveEl) {
            liveEl.innerHTML = `Updated ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
        }
    }, 30000);
    
    // Refresh stats every 60 seconds
    setInterval(() => {
        loadDashboardStats();
        loadRecentAppointments();
    }, 60000);
}

// Initialize Dashboard
function initDashboard() {
    loadWelcomeMessage();
    updateDateTime();
    loadDashboardStats();
    loadRecentAppointments();
    
    setInterval(updateDateTime, 1000);
    startAutoRefresh();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}