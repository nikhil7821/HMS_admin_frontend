/**
 * Dashboard JS - MedFlow HMS
 * Complete dashboard functionality with centralized theme
 */

// ========================
// DATA STORE
// ========================
const DashboardData = {
    stats: {
        opd: 217,
        ipd: 53,
        revenue: 19420,
        bedOccupancy: 71,
        totalBeds: 118,
        availableBeds: 34,
        opdTrend: '+8.2%',
        revenueTrend: '+12.5%'
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

// ========================
// TOAST NOTIFICATION SYSTEM
// ========================
window.showToast = function(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type]} text-sm"></i><span>${escapeHtml(message)}</span>`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 2800);
};

// ========================
// UTILITY FUNCTIONS
// ========================
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function animateNumber(elementId, endValue, isCurrency = false, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 500;
    const startTime = performance.now();
    const startValue = 0;
    
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

// ========================
// LOAD DASHBOARD COMPONENTS
// ========================
function loadDashboardStats() {
    const s = DashboardData.stats;
    animateNumber('opdCount', s.opd, false, '');
    animateNumber('ipdCount', s.ipd, false, '');
    animateNumber('revenueCount', s.revenue, true, '');
    animateNumber('bedOccupancy', s.bedOccupancy, false, '%');
    
    const availableEl = document.getElementById('availableBeds');
    if (availableEl) availableEl.innerText = s.availableBeds;
    
    const opdTrendEl = document.getElementById('opdTrend');
    const revenueTrendEl = document.getElementById('revenueTrend');
    if (opdTrendEl) opdTrendEl.innerText = s.opdTrend;
    if (revenueTrendEl) revenueTrendEl.innerText = s.revenueTrend;
}

function loadRecentAppointments() {
    const tbody = document.getElementById('recentAppointments');
    if (!tbody) return;
    
    const statusClassMap = {
        completed: 'badge-completed',
        progress: 'badge-progress',
        scheduled: 'badge-scheduled'
    };
    
    const rows = DashboardData.appointments.map(app => `
        <tr class="dashboard-table-row">
            <td class="py-2.5 text-sm font-normal text-[#6a5a4a]">${escapeHtml(app.patient)}</td>
            <td class="py-2.5 text-sm font-normal text-[#9a8e82]">${escapeHtml(app.doctor)}</td>
            <td class="py-2.5 text-sm font-normal text-[#9a8e82]">${app.time}</td>
            <td class="py-2.5"><span class="${statusClassMap[app.statusType]}">${app.status}</span></td>
        </tr>
    `).join('');
    
    tbody.innerHTML = rows;
}

function loadTodaySchedule() {
    const container = document.getElementById('todaySchedule');
    if (!container) return;
    
    const scheduleHtml = DashboardData.schedule.map(s => `
        <div class="schedule-item flex items-center justify-between p-2.5 bg-white rounded-xl hover:bg-[#fefcf9] transition-all border border-[#f0e8e0]">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-[#faf7f2] flex items-center justify-center">
                    <i class="fas fa-user-md text-[#a8c49a] text-sm"></i>
                </div>
                <div>
                    <p class="font-medium text-[#5a4a3a] text-sm">${escapeHtml(s.doctor)}</p>
                    <p class="text-xs text-[#d4c9bc] font-light">${escapeHtml(s.dept)}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm font-medium text-[#6a5a4a]">${s.time}</p>
                <p class="text-[11px] text-[#a8c49a] font-medium">${s.patients} pts</p>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = scheduleHtml;
}

function loadPendingTasks() {
    const container = document.getElementById('pendingTasks');
    if (!container) return;
    
    const tasksHtml = DashboardData.tasks.map(task => `
        <div class="task-card p-3.5 transition-all border border-[#f0e8e0] rounded-xl" style="background: ${task.bg};">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <i class="fas ${task.icon}" style="color: ${task.iconColor}; font-size: 0.75rem;"></i>
                    </div>
                    <span class="font-medium text-[#5a4a3a] text-sm">${task.title}</span>
                </div>
                <span class="text-xl font-medium" style="color: ${task.textColor};">${task.count}</span>
            </div>
            <button class="task-action-btn w-full mt-2 text-xs font-medium rounded-lg py-1.5 transition-all flex items-center justify-center gap-1.5 hover:opacity-80" 
                    style="color: ${task.textColor}; background: white; border: 1px solid #f0e8e0;" 
                    data-action-type="${task.action}">
                ${task.action} <i class="fas fa-arrow-right text-[10px]"></i>
            </button>
        </div>
    `).join('');
    
    container.innerHTML = tasksHtml;
    
    document.querySelectorAll('.task-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.actionType;
            showToast(`⚡ ${action} module - Coming soon`, 'info');
        });
    });
}

function updateAlertCount() {
    const alertEl = document.getElementById('alertCount');
    if (alertEl) {
        const total = DashboardData.tasks.reduce((sum, t) => sum + t.count, 0);
        alertEl.innerText = total;
    }
}

// ========================
// WELCOME & TIME FUNCTIONS
// ========================
function loadWelcomeMessage() {
    // Try to get user from localStorage (set by login page)
    let userName = 'Dr. Arjun';
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{"name":"Dr. Arjun"}');
        userName = user.name || 'Dr. Arjun';
    } catch(e) {
        userName = 'Dr. Arjun';
    }
    
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';
    
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) {
        welcomeEl.innerHTML = `${greeting}, ${escapeHtml(userName)} <span class="font-light">🌿</span>`;
    }
}

function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    const dateStr = now.toLocaleDateString('en-IN', dateOptions);
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const dateTimeEl = document.getElementById('currentDateTime');
    if (dateTimeEl) {
        dateTimeEl.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dateStr} | <i class="far fa-clock mr-1"></i> ${timeStr}`;
    }
    
    const todayDateEl = document.getElementById('todayDate');
    if (todayDateEl) {
        todayDateEl.innerText = now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
    
    const liveEl = document.getElementById('liveTimestamp');
    if (liveEl) {
        liveEl.innerText = `Updated ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
}

// ========================
// MODAL MANAGER
// ========================
const ModalManager = {
    overlay: null,
    
    init() {
        this.overlay = document.getElementById('modalOverlay');
        if (!this.overlay) return;
        
        const closeBtn = document.getElementById('closeModalBtn');
        const cancelBtn = document.getElementById('cancelModalBtn');
        const confirmBtn = document.getElementById('confirmModalBtn');
        
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
        if (confirmBtn) confirmBtn.addEventListener('click', () => this.handleConfirm());
        
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });
    },
    
    open() {
        if (!this.overlay) return;
        this.overlay.classList.remove('opacity-0', 'invisible');
        this.overlay.classList.add('opacity-100', 'visible');
        const formCard = this.overlay.querySelector('.form-card');
        if (formCard) {
            formCard.classList.remove('scale-95');
            formCard.classList.add('scale-100');
        }
    },
    
    close() {
        if (!this.overlay) return;
        this.overlay.classList.add('opacity-0', 'invisible');
        this.overlay.classList.remove('opacity-100', 'visible');
        const formCard = this.overlay.querySelector('.form-card');
        if (formCard) {
            formCard.classList.add('scale-95');
            formCard.classList.remove('scale-100');
        }
        
        // Clear form fields
        const nameInput = document.getElementById('patientName');
        const phoneInput = document.getElementById('patientPhone');
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
    },
    
    isOpen() {
        return this.overlay && !this.overlay.classList.contains('invisible');
    },
    
    handleConfirm() {
        const nameInput = document.getElementById('patientName');
        const patientName = nameInput?.value.trim();
        
        if (!patientName) {
            showToast('Please enter patient name', 'error');
            nameInput?.focus();
            return;
        }
        
        const phoneInput = document.getElementById('patientPhone');
        const phone = phoneInput?.value.trim() || '';
        const deptSelect = document.getElementById('patientDept');
        const department = deptSelect?.value || 'General Medicine';
        
        // Get existing patients from localStorage
        let existingPatients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        
        // Calculate next ID
        const newId = existingPatients.length > 0 ? Math.max(...existingPatients.map(p => p.id)) + 1 : 1001;
        
        // Create new patient object
        const newPatient = {
            id: newId,
            fullName: patientName,
            phone: phone,
            department: department,
            dob: '',
            gender: '',
            bloodGroup: '',
            email: '',
            address: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        existingPatients.push(newPatient);
        localStorage.setItem('hms_patients', JSON.stringify(existingPatients));
        
        // Update OPD count in UI
        const currentOpd = DashboardData.stats.opd;
        DashboardData.stats.opd = currentOpd + 1;
        animateNumber('opdCount', DashboardData.stats.opd, false, '');
        
        showToast(`✅ ${escapeHtml(patientName)} registered successfully`, 'success');
        this.close();
    }
};

// ========================
// QUICK ACTIONS
// ========================
function initQuickActions() {
    const buttons = document.querySelectorAll('[data-action]');
    
    const actions = {
        'add-patient': () => ModalManager.open(),
        'book-appointment': () => showToast('📅 Appointment booking - Demo mode', 'info'),
        'admit-patient': () => showToast('🏥 Admission form - Coming soon', 'info'),
        'create-bill': () => showToast('💰 Billing system - Preview', 'info'),
        'emergency': () => showToast('🚨 Emergency protocol activated', 'error')
    };
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            const handler = actions[action];
            if (handler) handler();
            else showToast(`Action: ${action}`, 'info');
        });
    });
}

// ========================
// AUTO REFRESH
// ========================
function startAutoRefresh() {
    setInterval(() => {
        const now = new Date();
        const liveEl = document.getElementById('liveTimestamp');
        if (liveEl) {
            liveEl.innerHTML = `Updated ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
        }
    }, 30000);
}

// ========================
// SIDEBAR TOGGLE (Mobile)
// ========================
function initMobileSidebar() {
    // Check if sidebar toggle button exists in header
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
}

// ========================
// INITIALIZE DASHBOARD
// ========================
function initDashboard() {
    loadWelcomeMessage();
    updateDateTime();
    loadDashboardStats();
    loadRecentAppointments();
    loadTodaySchedule();
    loadPendingTasks();
    updateAlertCount();
    ModalManager.init();
    initQuickActions();
    initMobileSidebar();
    
    // Update time every second
    setInterval(updateDateTime, 1000);
    startAutoRefresh();
}

// Start everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}