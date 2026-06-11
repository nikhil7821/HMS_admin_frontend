/**
 * Appointments Management JS - Clinical Module
 * Professional UI, Fully Working, Indian Names
 */

let appointments = [];
let patients = [];
let doctors = [];
let currentDeleteId = null;

function loadData() {
    // Load patients
    const storedPatients = localStorage.getItem('hms_patients');
    if (storedPatients) {
        patients = JSON.parse(storedPatients);
    } else {
        patients = [];
    }
    
    // Load doctors
    const storedDoctors = localStorage.getItem('hms_doctors');
    if (storedDoctors) {
        doctors = JSON.parse(storedDoctors);
    } else {
        doctors = [];
    }
    
    // Load appointments
    const storedAppointments = localStorage.getItem('hms_appointments');
    if (storedAppointments) {
        appointments = JSON.parse(storedAppointments);
    } else {
        // Demo Indian appointments data
        appointments = [
            {id: 1, patientId: 1, patientName: 'Rajesh Kumar', doctorId: 1, doctorName: 'Dr. Anjali Nair', date: new Date().toISOString().split('T')[0], time: '10:00 AM', status: 'Scheduled'},
            {id: 2, patientId: 2, patientName: 'Priya Sharma', doctorId: 2, doctorName: 'Dr. Vikram Singh', date: new Date().toISOString().split('T')[0], time: '11:30 AM', status: 'Scheduled'},
            {id: 3, patientId: 3, patientName: 'Amit Patel', doctorId: 3, doctorName: 'Dr. Sneha Joshi', date: new Date().toISOString().split('T')[0], time: '02:00 PM', status: 'Completed'},
            {id: 4, patientId: 4, patientName: 'Neha Gupta', doctorId: 4, doctorName: 'Dr. Rajiv Menon', date: '2026-06-15', time: '09:30 AM', status: 'Scheduled'},
            {id: 5, patientId: 5, patientName: 'Sunil Reddy', doctorId: 5, doctorName: 'Dr. Neha Gupta', date: '2026-06-16', time: '03:45 PM', status: 'Scheduled'}
        ];
        saveAppointments();
    }
    renderStats();
    renderTable();
}

function saveAppointments() {
    localStorage.setItem('hms_appointments', JSON.stringify(appointments));
}

function renderStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayApps = appointments.filter(a => a.date === today).length;
    const upcoming = appointments.filter(a => a.date > today && a.status === 'Scheduled').length;
    const completed = appointments.filter(a => a.status === 'Completed').length;
    const cancelled = appointments.filter(a => a.status === 'Cancelled').length;
    
    document.getElementById('todayCount').innerText = todayApps;
    document.getElementById('upcomingCount').innerText = upcoming;
    document.getElementById('completedCount').innerText = completed;
    document.getElementById('cancelledCount').innerText = cancelled;
}

function renderTable() {
    const tbody = document.getElementById('appointmentsTable');
    if (!tbody) return;
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-calendar-times text-3xl mb-2 block"></i><p class="font-normal">No appointments found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = appointments.map(app => `
        <tr class="appointment-row">
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(app.patientName)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${escapeHtml(app.doctorName)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${app.date}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${app.time}</td>
            <td class="px-5 py-3">
                <span class="${app.status === 'Scheduled' ? 'status-scheduled' : app.status === 'Completed' ? 'status-completed' : 'status-cancelled'}">
                    ${app.status}
                </span>
             </td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    ${app.status !== 'Cancelled' ? `
                        <button onclick="cancelAppointment(${app.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Cancel Appointment">
                            <i class="fas fa-times-circle"></i>
                        </button>
                    ` : ''}
                    <button onclick="deleteAppointment(${app.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Appointment">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
             </td>
          </tr>
    `).join('');
}

function openModal() {
    const patientSelect = document.getElementById('patientId');
    const doctorSelect = document.getElementById('doctorId');
    
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${escapeHtml(p.fullName)} (${p.phone})</option>`).join('');
    }
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${d.specialization})</option>`).join('');
    }
    
    document.getElementById('appointmentModal').classList.add('active');
    document.getElementById('modalTitle').innerText = 'Book Appointment';
    document.getElementById('appointmentForm').reset();
}

function saveAppointment(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const status = document.getElementById('status').value;
    
    if (!patientId || !doctorId || !date || !time) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!patient || !doctor) {
        showToast('Invalid patient or doctor selection', 'error');
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
    renderStats();
    renderTable();
    closeModal();
    showToast(`Appointment booked for ${patient.fullName} with ${doctor.name} on ${date}`, 'success');
}

function cancelAppointment(id) {
    const appointment = appointments.find(a => a.id === id);
    if (appointment && appointment.status !== 'Cancelled') {
        appointment.status = 'Cancelled';
        saveAppointments();
        renderStats();
        renderTable();
        showToast(`Appointment cancelled for ${appointment.patientName}`, 'info');
    }
}

function deleteAppointment(id) {
    currentDeleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if (currentDeleteId) {
        const appointment = appointments.find(a => a.id === currentDeleteId);
        appointments = appointments.filter(a => a.id !== currentDeleteId);
        saveAppointments();
        renderStats();
        renderTable();
        showToast(`Appointment removed for ${appointment?.patientName || 'patient'}`, 'info');
        currentDeleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function closeModal() {
    document.getElementById('appointmentModal').classList.remove('active');
    document.getElementById('appointmentForm').reset();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    currentDeleteId = null;
}

function showToast(message, type) {
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a' };
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300`;
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.getElementById('addAppointmentBtn')?.addEventListener('click', openModal);
    document.getElementById('closeAppModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelAppModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('appointmentForm')?.addEventListener('submit', saveAppointment);
});

window.cancelAppointment = cancelAppointment;
window.deleteAppointment = deleteAppointment;