/**
 * Doctor Schedule Management JS - Clinical Module
 * Professional UI, Fully Working, Indian Names
 */

let schedules = [];
let doctors = [];
let currentDeleteId = null;

function loadData() {
    doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
    
    const stored = localStorage.getItem('hms_schedules');
    if (stored) {
        schedules = JSON.parse(stored);
    } else {
        // Demo schedules with Indian doctors
        schedules = [
            {id: 1, doctorId: 1, doctorName: 'Dr. Anjali Nair', day: 'Monday', startTime: '09:00', endTime: '17:00', room: 'Room 101 - Cardiology'},
            {id: 2, doctorId: 1, doctorName: 'Dr. Anjali Nair', day: 'Wednesday', startTime: '09:00', endTime: '17:00', room: 'Room 101 - Cardiology'},
            {id: 3, doctorId: 2, doctorName: 'Dr. Vikram Singh', day: 'Tuesday', startTime: '10:00', endTime: '18:00', room: 'Room 202 - Neurology'},
            {id: 4, doctorId: 3, doctorName: 'Dr. Sneha Joshi', day: 'Thursday', startTime: '08:30', endTime: '16:30', room: 'Room 303 - Pediatrics'},
            {id: 5, doctorId: 4, doctorName: 'Dr. Rajiv Menon', day: 'Friday', startTime: '09:00', endTime: '17:00', room: 'Room 404 - Orthopedics'}
        ];
        saveSchedules();
    }
    renderTable();
}

function saveSchedules() {
    localStorage.setItem('hms_schedules', JSON.stringify(schedules));
}

function renderTable() {
    const tbody = document.getElementById('scheduleTable');
    if (!tbody) return;
    
    if (schedules.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-calendar-times text-3xl mb-2 block"></i><p class="font-normal">No schedules found</p> </td></tr>';
        return;
    }
    
    // Sort by day order
    const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
    const sortedSchedules = [...schedules].sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
    
    tbody.innerHTML = sortedSchedules.map(s => `
        <tr class="schedule-row">
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(s.doctorName)}</td>
            <td class="px-5 py-3"><span class="day-badge">${s.day}</span></td>
            <td class="px-5 py-3 text-[#475569] text-sm">${formatTime(s.startTime)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${formatTime(s.endTime)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${escapeHtml(s.room) || '-'}</td>
            <td class="px-5 py-3 text-center">
                <button onclick="deleteSchedule(${s.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Schedule">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </table>
    `).join('');
}

function formatTime(time) {
    if (!time) return '-';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function openModal() {
    const doctorSelect = document.getElementById('doctorId');
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${d.specialization})</option>`).join('');
    }
    
    document.getElementById('scheduleModal').classList.add('active');
    document.getElementById('scheduleForm').reset();
}

function saveSchedule(e) {
    e.preventDefault();
    
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const day = document.getElementById('day').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const room = document.getElementById('room').value;
    
    if (!doctorId || !day || !startTime || !endTime) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!doctor) {
        showToast('Invalid doctor selection', 'error');
        return;
    }
    
    // Check for duplicate schedule
    const existing = schedules.find(s => s.doctorId === doctorId && s.day === day);
    if (existing) {
        showToast(`${doctor.name} already has a schedule on ${day}`, 'error');
        return;
    }
    
    const newId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1;
    
    schedules.push({
        id: newId,
        doctorId: doctorId,
        doctorName: doctor.name,
        day: day,
        startTime: startTime,
        endTime: endTime,
        room: room
    });
    
    saveSchedules();
    renderTable();
    closeModal();
    showToast(`Schedule added for ${doctor.name} on ${day}`, 'success');
}

function deleteSchedule(id) {
    currentDeleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if (currentDeleteId) {
        const schedule = schedules.find(s => s.id === currentDeleteId);
        schedules = schedules.filter(s => s.id !== currentDeleteId);
        saveSchedules();
        renderTable();
        showToast(`Schedule deleted for ${schedule?.doctorName || 'doctor'} on ${schedule?.day || ''}`, 'info');
        currentDeleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function closeModal() {
    document.getElementById('scheduleModal').classList.remove('active');
    document.getElementById('scheduleForm').reset();
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
    
    document.getElementById('addScheduleBtn')?.addEventListener('click', openModal);
    document.getElementById('closeScheduleModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelScheduleModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('scheduleForm')?.addEventListener('submit', saveSchedule);
});

window.deleteSchedule = deleteSchedule;