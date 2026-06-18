/**
 * Appointments Management JS - Clinical Module
 * Uses theme.css for styling, clean event handling
 */

let appointments = [];
let patients = [];
let doctors = [];
let currentDeleteId = null;
let searchTerm = '';
let statusFilter = '';
let isInitialized = false;

// ─── 🔥 ADD THIS HERE - Auto-Open from Dashboard ───
document.addEventListener('DOMContentLoaded', function() {
    var action = sessionStorage.getItem('dashboard_action');
    if (action === 'openBookAppointment') {
        sessionStorage.removeItem('dashboard_action');
        setTimeout(function() {
            if (typeof openAddModal === 'function') {
                openAddModal();
            } else if (typeof window.openAddModal === 'function') {
                window.openAddModal();
            } else {
                var addBtn = document.getElementById('addAppointmentBtn');
                if (addBtn) addBtn.click();
            }
        }, 600);
    }
});
// ─── 🔥 END OF AUTO-OPEN SECTION ──────────────────── 

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        // Load patients
        const storedPatients = localStorage.getItem('hms_patients');
        patients = storedPatients ? JSON.parse(storedPatients) : [];
        
        // Load doctors
        const storedDoctors = localStorage.getItem('hms_doctors');
        doctors = storedDoctors ? JSON.parse(storedDoctors) : [];
        
        // Load appointments
        const storedAppointments = localStorage.getItem('hms_appointments');
        if (storedAppointments) {
            appointments = JSON.parse(storedAppointments);
        } else {
            // Demo Indian appointments data
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];
            
            appointments = [
                {id: 1, patientId: 1, patientName: 'Rajesh Kumar', doctorId: 1, doctorName: 'Dr. Anjali Nair', date: today, time: '10:00 AM', status: 'Scheduled'},
                {id: 2, patientId: 2, patientName: 'Priya Sharma', doctorId: 2, doctorName: 'Dr. Vikram Singh', date: today, time: '11:30 AM', status: 'Scheduled'},
                {id: 3, patientId: 3, patientName: 'Amit Patel', doctorId: 3, doctorName: 'Dr. Sneha Joshi', date: today, time: '02:00 PM', status: 'Completed'},
                {id: 4, patientId: 4, patientName: 'Neha Gupta', doctorId: 4, doctorName: 'Dr. Rajiv Menon', date: tomorrow, time: '09:30 AM', status: 'Scheduled'},
                {id: 5, patientId: 5, patientName: 'Sunil Reddy', doctorId: 5, doctorName: 'Dr. Neha Gupta', date: dayAfter, time: '03:45 PM', status: 'Scheduled'}
            ];
            saveAppointments();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading appointments data:', error);
        if (window.showToast) {
            window.showToast('Error loading appointments data', 'error');
        }
    }
}

function saveAppointments() {
    try {
        localStorage.setItem('hms_appointments', JSON.stringify(appointments));
    } catch (error) {
        console.error('Error saving appointments:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayApps = appointments.filter(a => a.date === today).length;
    const upcoming = appointments.filter(a => a.date > today && a.status === 'Scheduled').length;
    const completed = appointments.filter(a => a.status === 'Completed').length;
    const cancelled = appointments.filter(a => a.status === 'Cancelled').length;
    
    document.getElementById('todayCount').textContent = todayApps;
    document.getElementById('upcomingCount').textContent = upcoming;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('cancelledCount').textContent = cancelled;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredAppointments() {
    return appointments.filter(app => {
        const matchesSearch = searchTerm === '' || 
            app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === '' || app.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('appointmentsTable');
    if (!tbody) return;
    
    const filtered = getFilteredAppointments();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="appointments-empty">
                    <i class="fas fa-calendar-times"></i>
                    <p>No appointments found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Book an appointment to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(app => {
        const statusClass = app.status === 'Scheduled' ? 'status-scheduled' : 
                           app.status === 'Completed' ? 'status-completed' : 
                           'status-cancelled';
        
        return `
            <tr class="appointment-row" data-id="${app.id}">
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(app.patientName)}</td>
                <td style="color:var(--color-brown-300);">${esc(app.doctorName)}</td>
                <td style="color:var(--color-brown-300);">${app.date}</td>
                <td style="color:var(--color-brown-300);">${app.time}</td>
                <td><span class="${statusClass}">${app.status}</span></td>
                <td style="text-align:center;">
                    ${app.status !== 'Cancelled' ? `
                        <div style="display:flex; gap:0.25rem; justify-content:center;">
                            <button class="action-btn cancel-btn" data-id="${app.id}" title="Cancel Appointment">
                                <i class="fas fa-times-circle"></i>
                            </button>
                            <button class="action-btn delete delete-btn" data-id="${app.id}" title="Delete Appointment">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    ` : `
                        <span class="cancelled-label">Cancelled</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
    
    // Bind events
    tbody.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => cancelAppointment(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Modals ──────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('opacity-100', 'visible');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('opacity-100', 'visible');
}

function openAddModal() {
    const patientSelect = document.getElementById('patientId');
    const doctorSelect = document.getElementById('doctorId');
    
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${esc(p.fullName)} (${p.phone})</option>`).join('');
    }
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${esc(d.name)} (${d.specialization})</option>`).join('');
    }
    
    // Set min date to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('appointmentForm').reset();
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-calendar-plus"></i> Book Appointment';
    openModal('appointmentModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveAppointment(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const status = document.getElementById('status').value;
    
    if (!patientId || !doctorId || !date || !time) {
        if (window.showToast) {
            window.showToast('Please fill all required fields', 'error');
        }
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!patient || !doctor) {
        if (window.showToast) {
            window.showToast('Invalid patient or doctor selection', 'error');
        }
        return;
    }
    
    const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    
    appointments.push({
        id: newId,
        patientId: patientId,
        patientName: patient.fullName,
        doctorId: doctorId,
        doctorName: doctor.name,
        date: date,
        time: time,
        status: status
    });
    
    saveAppointments();
    refreshUI();
    closeModal('appointmentModal');
    
    if (window.showToast) {
        window.showToast(`✅ Appointment booked for ${patient.fullName} with ${doctor.name} on ${date}`, 'success');
    }
}

// ─── Actions ─────────────────────────────────────────

function cancelAppointment(id) {
    const appointment = appointments.find(a => a.id === id);
    if (appointment && appointment.status !== 'Cancelled') {
        appointment.status = 'Cancelled';
        saveAppointments();
        refreshUI();
        if (window.showToast) {
            window.showToast(`❌ Appointment cancelled for ${appointment.patientName}`, 'info');
        }
    }
}

function handleConfirmDelete() {
    if (!currentDeleteId) return;
    
    const appointment = appointments.find(a => a.id === currentDeleteId);
    appointments = appointments.filter(a => a.id !== currentDeleteId);
    saveAppointments();
    refreshUI();
    closeModal('deleteModal');
    
    if (appointment && window.showToast) {
        window.showToast(`🗑️ Appointment removed for ${appointment.patientName}`, 'info');
    }
    currentDeleteId = null;
}

// ─── Init ────────────────────────────────────────────

function initAppointmentsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('addAppointmentBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeAppModalBtn')?.addEventListener('click', () => closeModal('appointmentModal'));
    document.getElementById('cancelAppModalBtn')?.addEventListener('click', () => closeModal('appointmentModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('appointmentForm')?.addEventListener('submit', saveAppointment);
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderTable();
    });
    
    // Close modals on overlay click
    document.getElementById('appointmentModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('appointmentModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('appointmentModal');
            closeModal('deleteModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    // Check if common.js has loaded sidebar
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initAppointmentsModule, 100);
        }
    }, 50);
    
    // Fallback: if sidebar doesn't load in 3 seconds, init anyway
    setTimeout(() => {
        clearInterval(checkInterval);
        initAppointmentsModule();
    }, 3000);
});