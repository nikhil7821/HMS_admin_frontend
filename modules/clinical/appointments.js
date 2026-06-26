/**
 * Appointments Management JS - Clinical Module
 * Version: 3.0 - COMPLETE PROFESSIONAL UPGRADE
 * 
 * Features:
 * ✅ Full CRUD operations
 * ✅ Doctor Schedule Integration (Availability Check)
 * ✅ Time Slot Validation (No double booking)
 * ✅ View Appointment Details Modal
 * ✅ Edit Appointment
 * ✅ Patient History
 * ✅ Duration Tracking (15/30/45/60 mins)
 * ✅ Status management (Scheduled, Confirmed, Completed, Cancelled)
 * ✅ Stats Dashboard
 * ✅ Search and filter
 * ✅ RBAC Integration
 * ✅ Auto-open from Dashboard
 * ✅ Conflict detection
 * ✅ Professional UI
 */

let appointments = [];
let patients = [];
let doctors = [];
let doctorSchedules = [];
let currentDeleteId = null;
let currentEditId = null;
let searchTerm = '';
let statusFilter = '';
let isInitialized = false;
let isCheckingAvailability = false;

// ─── 🔥 AUTO-OPEN FROM DASHBOARD ────────────────────
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

// ─── Utility Functions ──────────────────────────────────────

function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        var d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function formatTime(timeStr) {
    if (!timeStr) return 'N/A';
    try {
        var d = new Date('2000-01-01T' + timeStr);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return timeStr;
    }
}

function getDayName(dateStr) {
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
}

// ─── Toast Notification ──────────────────────────────────────

function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    var colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a', warning: '#d4a853' };
    toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300';
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = '<div class="flex items-center gap-2"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle') + '"></i><span>' + esc(message) + '</span></div>';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

// ─── Data Management ──────────────────────────────────────────

function loadAllData() {
    try {
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        doctorSchedules = JSON.parse(localStorage.getItem('hms_doctor_schedules') || '[]');
        
        var stored = localStorage.getItem('hms_appointments');
        if (stored) {
            appointments = JSON.parse(stored);
            // Ensure new fields exist
            for (var i = 0; i < appointments.length; i++) {
                appointments[i].duration = appointments[i].duration || 30;
                appointments[i].notes = appointments[i].notes || '';
            }
            saveAppointments();
        } else {
            createSampleData();
        }
        refreshUI();
        populateSelects();
    } catch (error) {
        console.error('Error loading appointments:', error);
        showToast('Error loading appointment data', 'error');
    }
}

function createSampleData() {
    var today = new Date().toISOString().split('T')[0];
    var tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    var dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];
    
    appointments = [
        {id: 1, patientId: 1, patientName: 'Rajesh Kumar', doctorId: 1, doctorName: 'Dr. Anjali Nair', date: today, time: '10:00', duration: 30, status: 'Scheduled', notes: 'First consultation'},
        {id: 2, patientId: 2, patientName: 'Priya Sharma', doctorId: 2, doctorName: 'Dr. Vikram Singh', date: today, time: '11:30', duration: 30, status: 'Confirmed', notes: ''},
        {id: 3, patientId: 3, patientName: 'Amit Patel', doctorId: 3, doctorName: 'Dr. Sneha Joshi', date: today, time: '14:00', duration: 30, status: 'Completed', notes: 'Follow-up'},
        {id: 4, patientId: 4, patientName: 'Neha Gupta', doctorId: 4, doctorName: 'Dr. Rajiv Menon', date: tomorrow, time: '09:30', duration: 45, status: 'Scheduled', notes: ''},
        {id: 5, patientId: 5, patientName: 'Sunil Reddy', doctorId: 5, doctorName: 'Dr. Neha Gupta', date: dayAfter, time: '15:45', duration: 30, status: 'Scheduled', notes: ''}
    ];
    saveAppointments();
}

function saveAppointments() {
    try {
        localStorage.setItem('hms_appointments', JSON.stringify(appointments));
    } catch (error) {
        console.error('Error saving appointments:', error);
    }
}

// ─── ─── Doctor Availability Check ────────────────────────────────────────

function checkDoctorAvailability(doctorId, date, time, duration) {
    duration = duration || 30;
    
    // Get doctor's schedule for this day
    var dayName = getDayName(date);
    var schedule = doctorSchedules.find(function(s) {
        return s.doctorId === doctorId && s.day === dayName && s.status === 'active';
    });
    
    if (!schedule) {
        return { available: false, reason: 'Doctor not available on this day' };
    }
    
    // Check if time is within working hours
    if (time < schedule.startTime || time > schedule.endTime) {
        return { 
            available: false, 
            reason: 'Outside working hours (' + formatTime(schedule.startTime) + ' - ' + formatTime(schedule.endTime) + ')' 
        };
    }
    
    // Check break time
    if (schedule.breakStart && schedule.breakEnd) {
        if (time >= schedule.breakStart && time <= schedule.breakEnd) {
            return { available: false, reason: 'Doctor is on break' };
        }
    }
    
    // Check if doctor is marked unavailable
    if (schedule.isUnavailable) {
        return { available: false, reason: 'Doctor is unavailable on this day' };
    }
    
    // Check for conflicting appointments (excluding current edit)
    var conflict = appointments.find(function(a) {
        if (a.id === parseInt(document.getElementById('editAppId').value)) return false;
        if (a.doctorId !== doctorId) return false;
        if (a.date !== date) return false;
        if (a.status === 'Cancelled' || a.status === 'Completed') return false;
        
        // Check time overlap
        var aStart = a.time;
        var aEnd = addMinutes(a.time, a.duration || 30);
        var bStart = time;
        var bEnd = addMinutes(time, duration);
        
        return (bStart < aEnd && bEnd > aStart);
    });
    
    if (conflict) {
        return { 
            available: false, 
            reason: 'Time slot conflict with ' + conflict.patientName + ' (' + formatTime(conflict.time) + ')' 
        };
    }
    
    // Check max patients limit
    var dayBookings = appointments.filter(function(a) {
        return a.doctorId === doctorId && a.date === date && a.status !== 'Cancelled';
    });
    
    if (dayBookings.length >= (schedule.maxPatients || 20)) {
        return { available: false, reason: 'Max patients limit reached for this day' };
    }
    
    return { available: true, reason: 'Available' };
}

function addMinutes(time, minutes) {
    var parts = time.split(':');
    var hours = parseInt(parts[0]);
    var mins = parseInt(parts[1]) + minutes;
    while (mins >= 60) {
        hours++;
        mins -= 60;
    }
    return String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
}

// ─── ─── Check Availability in Real-time ──────────────────────────────────

function checkAvailabilityRealTime() {
    if (isCheckingAvailability) return;
    isCheckingAvailability = true;
    
    var doctorId = parseInt(document.getElementById('doctorId').value);
    var date = document.getElementById('date').value;
    var time = document.getElementById('time').value;
    var duration = parseInt(document.getElementById('duration').value) || 30;
    
    var warningDiv = document.getElementById('conflictWarning');
    var infoDiv = document.getElementById('availabilityInfo');
    var infoMsg = document.getElementById('availabilityMessage');
    
    if (!doctorId || !date || !time) {
        warningDiv.style.display = 'none';
        infoDiv.style.display = 'none';
        isCheckingAvailability = false;
        return;
    }
    
    var result = checkDoctorAvailability(doctorId, date, time, duration);
    
    if (!result.available) {
        warningDiv.style.display = 'block';
        document.getElementById('conflictMessage').textContent = '⚠️ ' + result.reason;
        infoDiv.style.display = 'none';
    } else {
        warningDiv.style.display = 'none';
        infoDiv.style.display = 'block';
        infoMsg.textContent = '✅ Doctor is available at this time';
        infoMsg.style.color = '#4a8c3a';
    }
    
    isCheckingAvailability = false;
}

// ─── ─── Stats ─────────────────────────────────────────────────────────────

function updateStats() {
    var today = new Date().toISOString().split('T')[0];
    var todayApps = 0;
    var upcoming = 0;
    var completed = 0;
    var cancelled = 0;
    
    for (var i = 0; i < appointments.length; i++) {
        var a = appointments[i];
        if (a.date === today) todayApps++;
        if (a.date > today && a.status === 'Scheduled' || a.status === 'Confirmed') upcoming++;
        if (a.status === 'Completed') completed++;
        if (a.status === 'Cancelled') cancelled++;
    }
    
    document.getElementById('todayCount').textContent = todayApps;
    document.getElementById('upcomingCount').textContent = upcoming;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('cancelledCount').textContent = cancelled;
}

// ─── ─── Filter ──────────────────────────────────────────────────────────────

function getFilteredAppointments() {
    var result = [];
    for (var i = 0; i < appointments.length; i++) {
        var a = appointments[i];
        var matchesSearch = searchTerm === '' || 
            a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesStatus = statusFilter === '' || a.status === statusFilter;
        if (matchesSearch && matchesStatus) {
            result.push(a);
        }
    }
    // Sort by date (newest first)
    result.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    return result;
}

// ─── ─── Render ──────────────────────────────────────────────────────────────

function renderTable() {
    var tbody = document.getElementById('appointmentsTable');
    if (!tbody) return;
    
    var filtered = getFilteredAppointments();
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-calendar-times"></i><p>No appointments found</p><p style="font-size:0.75rem; margin-top:0.25rem;">Book an appointment to get started.</p></td></tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var a = filtered[i];
        var statusClass = a.status === 'Scheduled' ? 'status-scheduled' : 
                         a.status === 'Confirmed' ? 'status-confirmed' :
                         a.status === 'Completed' ? 'status-completed' : 'status-cancelled';
        var isActive = a.status !== 'Cancelled' && a.status !== 'Completed';
        var canComplete = a.status === 'Scheduled' || a.status === 'Confirmed';
        
        html += '<tr class="appointment-row" data-id="' + a.id + '">';
        html += '<td class="appt-patient">' + esc(a.patientName) + '</td>';
        html += '<td class="appt-doctor">' + esc(a.doctorName) + '</td>';
        html += '<td class="appt-date">' + formatDate(a.date) + '</td>';
        html += '<td class="appt-time">' + formatTime(a.time) + ' (' + (a.duration || 30) + 'm)</td>';
        html += '<td><span class="' + statusClass + '">' + a.status + '</span></td>';
        html += '<td style="text-align:center;"><div style="display:flex; gap:0.25rem; justify-content:center; flex-wrap:wrap;">';
        html += '<button class="action-btn view-btn" data-id="' + a.id + '" title="View Details"><i class="fas fa-eye"></i></button>';
        if (isActive) {
            html += '<button class="action-btn edit-btn" data-id="' + a.id + '" title="Edit"><i class="fas fa-edit"></i></button>';
            if (canComplete) {
                html += '<button class="action-btn complete-btn" data-id="' + a.id + '" title="Mark Complete" style="color:#10b981;"><i class="fas fa-check-circle"></i></button>';
            }
            html += '<button class="action-btn cancel-btn" data-id="' + a.id + '" title="Cancel" style="color:#f59e0b;"><i class="fas fa-times-circle"></i></button>';
        }
        html += '<button class="action-btn delete delete-btn" data-id="' + a.id + '" title="Delete"><i class="fas fa-trash-alt"></i></button>';
        html += '</div></td></tr>';
    }
    tbody.innerHTML = html;
    
    // Bind events
    tbody.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { viewAppointment(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openEditModal(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.complete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { completeAppointment(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.cancel-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { cancelAppointment(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(parseInt(this.dataset.id)); });
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── ─── Populate Selects ───────────────────────────────────────────────────

function populateSelects() {
    var patientSelect = document.getElementById('patientId');
    var doctorSelect = document.getElementById('doctorId');
    
    if (patientSelect) {
        var html = '<option value="">-- Select Patient --</option>';
        for (var i = 0; i < patients.length; i++) {
            html += '<option value="' + patients[i].id + '">' + esc(patients[i].fullName) + ' (' + patients[i].phone + ')</option>';
        }
        patientSelect.innerHTML = html;
    }
    
    if (doctorSelect) {
        var html2 = '<option value="">-- Select Doctor --</option>';
        for (var j = 0; j < doctors.length; j++) {
            html2 += '<option value="' + doctors[j].id + '">' + esc(doctors[j].name) + ' (' + doctors[j].specialization + ')</option>';
        }
        doctorSelect.innerHTML = html2;
    }
}

// ─── ─── Modals ──────────────────────────────────────────────────────────────

function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}

function openAddModal() {
    populateSelects();
    document.getElementById('appointmentForm').reset();
    document.getElementById('editAppId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-calendar-plus" style="color:var(--color-sage);"></i> Book Appointment';
    document.getElementById('status').value = 'Scheduled';
    document.getElementById('duration').value = '30';
    document.getElementById('date').min = new Date().toISOString().split('T')[0];
    document.getElementById('conflictWarning').style.display = 'none';
    document.getElementById('availabilityInfo').style.display = 'none';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-select, .form-input').forEach(function(el) { el.classList.remove('error'); });
    openModal('appointmentModal');
}

function openEditModal(id) {
    var appointment = appointments.find(function(a) { return a.id === id; });
    if (!appointment) return;
    
    populateSelects();
    document.getElementById('editAppId').value = appointment.id;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Appointment';
    document.getElementById('patientId').value = appointment.patientId;
    document.getElementById('doctorId').value = appointment.doctorId;
    document.getElementById('date').value = appointment.date;
    document.getElementById('time').value = appointment.time;
    document.getElementById('duration').value = appointment.duration || 30;
    document.getElementById('status').value = appointment.status || 'Scheduled';
    document.getElementById('notes').value = appointment.notes || '';
    document.getElementById('date').min = new Date().toISOString().split('T')[0];
    document.getElementById('conflictWarning').style.display = 'none';
    document.getElementById('availabilityInfo').style.display = 'none';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-select, .form-input').forEach(function(el) { el.classList.remove('error'); });
    openModal('appointmentModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── ─── Validation ─────────────────────────────────────────────────────────

function validateAppointmentForm() {
    var isValid = true;
    var patientId = document.getElementById('patientId').value;
    var doctorId = document.getElementById('doctorId').value;
    var date = document.getElementById('date').value;
    var time = document.getElementById('time').value;
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-select, .form-input').forEach(function(el) { el.classList.remove('error'); });
    
    if (!patientId) {
        document.getElementById('patientIdError').classList.add('show');
        document.getElementById('patientId').classList.add('error');
        isValid = false;
    }
    if (!doctorId) {
        document.getElementById('doctorIdError').classList.add('show');
        document.getElementById('doctorId').classList.add('error');
        isValid = false;
    }
    if (!date) {
        document.getElementById('dateError').classList.add('show');
        document.getElementById('date').classList.add('error');
        isValid = false;
    }
    if (!time) {
        document.getElementById('timeError').classList.add('show');
        document.getElementById('time').classList.add('error');
        isValid = false;
    }
    return isValid;
}

// ─── ─── Save Appointment ──────────────────────────────────────────────────

function saveAppointment(e) {
    e.preventDefault();
    if (!validateAppointmentForm()) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    var editId = document.getElementById('editAppId').value;
    var patientId = parseInt(document.getElementById('patientId').value);
    var doctorId = parseInt(document.getElementById('doctorId').value);
    var date = document.getElementById('date').value;
    var time = document.getElementById('time').value;
    var duration = parseInt(document.getElementById('duration').value) || 30;
    var status = document.getElementById('status').value;
    var notes = document.getElementById('notes').value.trim();
    
    var patient = null;
    var doctor = null;
    for (var i = 0; i < patients.length; i++) {
        if (patients[i].id === patientId) { patient = patients[i]; break; }
    }
    for (var j = 0; j < doctors.length; j++) {
        if (doctors[j].id === doctorId) { doctor = doctors[j]; break; }
    }
    
    if (!patient || !doctor) {
        showToast('Invalid selection', 'error');
        return;
    }
    
    // Check availability
    var availability = checkDoctorAvailability(doctorId, date, time, duration);
    if (!availability.available) {
        showToast('⚠️ ' + availability.reason, 'error');
        return;
    }
    
    var appointmentData = {
        patientId: patientId,
        patientName: patient.fullName,
        doctorId: doctorId,
        doctorName: doctor.name,
        date: date,
        time: time,
        duration: duration,
        status: status,
        notes: notes
    };
    
    if (editId) {
        var index = -1;
        for (var k = 0; k < appointments.length; k++) {
            if (appointments[k].id === parseInt(editId)) { index = k; break; }
        }
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...appointmentData };
            showToast('✅ Appointment updated successfully', 'success');
        }
    } else {
        var newId = appointments.length > 0 ? Math.max(...appointments.map(function(a) { return a.id; })) + 1 : 1;
        appointments.push({ id: newId, ...appointmentData });
        showToast('✅ Appointment booked for ' + patient.fullName, 'success');
    }
    
    saveAppointments();
    refreshUI();
    closeModal('appointmentModal');
}

// ─── ─── Actions ────────────────────────────────────────────────────────────

function completeAppointment(id) {
    var appointment = appointments.find(function(a) { return a.id === id; });
    if (!appointment || appointment.status === 'Completed') return;
    
    appointment.status = 'Completed';
    saveAppointments();
    refreshUI();
    showToast('✅ Appointment completed for ' + appointment.patientName, 'success');
}

function cancelAppointment(id) {
    var appointment = appointments.find(function(a) { return a.id === id; });
    if (!appointment || appointment.status === 'Cancelled') return;
    
    appointment.status = 'Cancelled';
    saveAppointments();
    refreshUI();
    showToast('❌ Appointment cancelled for ' + appointment.patientName, 'info');
}

// ─── ─── View Appointment ──────────────────────────────────────────────────

function viewAppointment(id) {
    var appointment = appointments.find(function(a) { return a.id === id; });
    if (!appointment) return;
    
    var patient = null;
    var doctor = null;
    for (var i = 0; i < patients.length; i++) {
        if (patients[i].id === appointment.patientId) { patient = patients[i]; break; }
    }
    for (var j = 0; j < doctors.length; j++) {
        if (doctors[j].id === appointment.doctorId) { doctor = doctors[j]; break; }
    }
    
    // Get patient history
    var patientHistory = appointments.filter(function(a) {
        return a.patientId === appointment.patientId && a.id !== appointment.id;
    });
    patientHistory.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    
    var historyHtml = '';
    if (patientHistory.length > 0) {
        historyHtml = patientHistory.map(function(h) {
            var statusClass = h.status === 'Completed' ? 'completed' : 
                             h.status === 'Cancelled' ? 'cancelled' : 'scheduled';
            return '<div class="history-item"><span class="history-date">' + formatDate(h.date) + '</span><span class="history-details">' + esc(h.doctorName) + ' - ' + formatTime(h.time) + '</span><span class="history-status ' + statusClass + '">' + h.status + '</span></div>';
        }).join('');
    } else {
        historyHtml = '<p style="color:var(--color-brown-100); font-size:0.75rem;">No previous appointments</p>';
    }
    
    var content = document.getElementById('viewContent');
    var statusClass = appointment.status === 'Scheduled' ? 'status-scheduled' : 
                     appointment.status === 'Confirmed' ? 'status-confirmed' :
                     appointment.status === 'Completed' ? 'status-completed' : 'status-cancelled';
    
    content.innerHTML = `
        <div style="display:grid; gap:0.25rem;">
            <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); margin-bottom:0.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                        <h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); margin:0;">${esc(appointment.patientName)}</h3>
                        <p style="font-size:0.75rem; color:var(--color-brown-100); margin:0;">${patient ? '📞 ' + esc(patient.phone) : ''}</p>
                    </div>
                    <div>
                        <span class="${statusClass}">${appointment.status}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-grid">
                <div><p class="detail-label">Date</p><p class="detail-value">${formatDate(appointment.date)}</p></div>
                <div><p class="detail-label">Time</p><p class="detail-value">${formatTime(appointment.time)}</p></div>
                <div><p class="detail-label">Duration</p><p class="detail-value">${appointment.duration || 30} mins</p></div>
                <div><p class="detail-label">Doctor</p><p class="detail-value">${esc(appointment.doctorName)}</p></div>
                <div><p class="detail-label">Specialization</p><p class="detail-value">${doctor ? esc(doctor.specialization) : 'N/A'}</p></div>
            </div>
            
            ${appointment.notes ? `
                <div class="detail-section" style="margin-top:0.5rem;">
                    <p class="detail-label">Notes</p>
                    <p class="detail-value" style="color:var(--color-brown-300); font-size:0.8rem;">${esc(appointment.notes)}</p>
                </div>
            ` : ''}
            
            <div class="detail-section" style="margin-top:0.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                    <p class="detail-label" style="margin-bottom:0;">Patient History (${patientHistory.length})</p>
                </div>
                ${historyHtml}
            </div>
            
            <div style="font-size:0.6rem; color:var(--color-brown-100); border-top:1px solid var(--border-default); padding-top:0.5rem;">
                Appointment ID: #${appointment.id} | Booked on: ${formatDate(new Date().toISOString().split('T')[0])}
            </div>
        </div>
    `;
    
    document.getElementById('viewModalTitle').innerHTML = `<i class="fas fa-eye" style="color:var(--color-sage);"></i> ${esc(appointment.patientName)} - Appointment`;
    openModal('viewModal');
}

// ─── ─── Delete ─────────────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!currentDeleteId) return;
    var appointment = appointments.find(function(a) { return a.id === currentDeleteId; });
    appointments = appointments.filter(function(a) { return a.id !== currentDeleteId; });
    saveAppointments();
    refreshUI();
    closeModal('deleteModal');
    if (appointment) {
        showToast('🗑️ Appointment removed for ' + appointment.patientName, 'info');
    }
    currentDeleteId = null;
}

// ─── ─── Real-time Availability Check Listeners ────────────────────────────

function setupAvailabilityListeners() {
    var doctorSelect = document.getElementById('doctorId');
    var dateInput = document.getElementById('date');
    var timeInput = document.getElementById('time');
    var durationSelect = document.getElementById('duration');
    
    if (doctorSelect) {
        doctorSelect.addEventListener('change', checkAvailabilityRealTime);
    }
    if (dateInput) {
        dateInput.addEventListener('change', checkAvailabilityRealTime);
    }
    if (timeInput) {
        timeInput.addEventListener('input', checkAvailabilityRealTime);
    }
    if (durationSelect) {
        durationSelect.addEventListener('change', checkAvailabilityRealTime);
    }
}

// ─── ─── Init ──────────────────────────────────────────────────────────────

function initAppointmentsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadAllData();
    setupAvailabilityListeners();
    
    // Event Listeners
    document.getElementById('addAppointmentBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeAppModalBtn')?.addEventListener('click', function() { closeModal('appointmentModal'); });
    document.getElementById('cancelAppModalBtn')?.addEventListener('click', function() { closeModal('appointmentModal'); });
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('appointmentForm')?.addEventListener('submit', saveAppointment);
    document.getElementById('refreshBtn')?.addEventListener('click', function() { refreshUI(); showToast('Refreshed', 'info'); });
    
    // View modal
    document.getElementById('closeViewModalBtn')?.addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('viewModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewModal');
    });
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', function() {
        searchTerm = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', function(e) {
        statusFilter = e.target.value;
        renderTable();
    });
    
    document.getElementById('appointmentModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('appointmentModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('appointmentModal');
            closeModal('deleteModal');
            closeModal('viewModal');
        }
    });
    
    // 🔥 Apply permissions
    if (typeof applyPermissions === 'function') {
        setTimeout(applyPermissions, 100);
    }
}

// ─── ─── Wait ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initAppointmentsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initAppointmentsModule();
    }, 3000);
});

// ─── ─── Expose ─────────────────────────────────────────────────────────────

window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.viewAppointment = viewAppointment;
window.completeAppointment = completeAppointment;
window.cancelAppointment = cancelAppointment;
window.checkAvailabilityRealTime = checkAvailabilityRealTime;