/**
 * Doctor Schedule Management JS - Clinical Module
 * Uses theme.css for styling, clean event handling
 */

let schedules = [];
let doctors = [];
let currentDeleteId = null;
let searchTerm = '';
let dayFilter = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatTime(time) {
    if (!time) return '-';
    try {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    } catch {
        return time;
    }
}

function getDayOrder(day) {
    const order = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
    return order[day] || 0;
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        
        const stored = localStorage.getItem('hms_schedules');
        if (stored) {
            schedules = JSON.parse(stored);
        } else {
            // Demo schedules
            schedules = [
                {id: 1, doctorId: 1, doctorName: 'Dr. Anjali Nair', day: 'Monday', startTime: '09:00', endTime: '17:00', room: 'Room 101 - Cardiology'},
                {id: 2, doctorId: 1, doctorName: 'Dr. Anjali Nair', day: 'Wednesday', startTime: '09:00', endTime: '17:00', room: 'Room 101 - Cardiology'},
                {id: 3, doctorId: 2, doctorName: 'Dr. Vikram Singh', day: 'Tuesday', startTime: '10:00', endTime: '18:00', room: 'Room 202 - Neurology'},
                {id: 4, doctorId: 3, doctorName: 'Dr. Sneha Joshi', day: 'Thursday', startTime: '08:30', endTime: '16:30', room: 'Room 303 - Pediatrics'},
                {id: 5, doctorId: 4, doctorName: 'Dr. Rajiv Menon', day: 'Friday', startTime: '09:00', endTime: '17:00', room: 'Room 404 - Orthopedics'},
                {id: 6, doctorId: 5, doctorName: 'Dr. Neha Gupta', day: 'Monday', startTime: '10:00', endTime: '18:00', room: 'Room 505 - Dermatology'},
                {id: 7, doctorId: 6, doctorName: 'Dr. Meera Desai', day: 'Tuesday', startTime: '09:30', endTime: '17:30', room: 'Room 606 - Gynecology'}
            ];
            saveSchedules();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading schedules:', error);
        if (window.showToast) {
            window.showToast('Error loading schedule data', 'error');
        }
    }
}

function saveSchedules() {
    try {
        localStorage.setItem('hms_schedules', JSON.stringify(schedules));
    } catch (error) {
        console.error('Error saving schedules:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = schedules.length;
    
    const uniqueDoctors = new Set(schedules.map(s => s.doctorId));
    const doctorsScheduled = uniqueDoctors.size;
    
    // Find busiest day
    const dayCount = {};
    schedules.forEach(s => {
        dayCount[s.day] = (dayCount[s.day] || 0) + 1;
    });
    let busiestDay = '-';
    let maxCount = 0;
    for (const [day, count] of Object.entries(dayCount)) {
        if (count > maxCount) {
            maxCount = count;
            busiestDay = day;
        }
    }
    
    // Count unique rooms
    const uniqueRooms = new Set(schedules.map(s => s.room).filter(r => r && r.trim()));
    const activeRooms = uniqueRooms.size;
    
    document.getElementById('totalSchedules').textContent = total;
    document.getElementById('doctorsScheduled').textContent = doctorsScheduled;
    document.getElementById('busiestDay').textContent = busiestDay;
    document.getElementById('activeRooms').textContent = activeRooms;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredSchedules() {
    return schedules.filter(s => {
        const matchesSearch = searchTerm === '' || 
            s.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.room && s.room.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesDay = dayFilter === '' || s.day === dayFilter;
        
        return matchesSearch && matchesDay;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('scheduleTable');
    if (!tbody) return;
    
    const filtered = getFilteredSchedules();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="schedule-empty">
                    <i class="fas fa-calendar-times"></i>
                    <p>No schedules found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a schedule to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by day order
    const sorted = [...filtered].sort((a, b) => {
        const dayCompare = getDayOrder(a.day) - getDayOrder(b.day);
        if (dayCompare !== 0) return dayCompare;
        return a.startTime.localeCompare(b.startTime);
    });
    
    tbody.innerHTML = sorted.map(s => `
        <tr class="schedule-row" data-id="${s.id}">
            <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(s.doctorName)}</td>
            <td><span class="day-badge">${s.day}</span></td>
            <td><span class="time-display">${formatTime(s.startTime)}</span></td>
            <td><span class="time-display">${formatTime(s.endTime)}</span></td>
            <td style="color:var(--color-brown-300);">${esc(s.room) || '-'}</td>
            <td style="text-align:center;">
                <button class="action-btn delete delete-btn" data-id="${s.id}" title="Delete Schedule">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Bind events
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
    const doctorSelect = document.getElementById('doctorId');
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${esc(d.name)} (${d.specialization})</option>`).join('');
    }
    
    document.getElementById('scheduleForm').reset();
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-calendar-plus"></i> Add Schedule';
    openModal('scheduleModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveSchedule(e) {
    e.preventDefault();
    
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const day = document.getElementById('day').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const room = document.getElementById('room').value.trim();
    
    if (!doctorId || !day || !startTime || !endTime) {
        if (window.showToast) {
            window.showToast('Please fill all required fields', 'error');
        }
        return;
    }
    
    // Validate time
    if (startTime >= endTime) {
        if (window.showToast) {
            window.showToast('Start time must be before end time', 'error');
        }
        return;
    }
    
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!doctor) {
        if (window.showToast) {
            window.showToast('Invalid doctor selection', 'error');
        }
        return;
    }
    
    // Check for duplicate schedule
    const existing = schedules.find(s => s.doctorId === doctorId && s.day === day);
    if (existing) {
        if (window.showToast) {
            window.showToast(`⚠️ ${doctor.name} already has a schedule on ${day}`, 'error');
        }
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
    refreshUI();
    closeModal('scheduleModal');
    
    if (window.showToast) {
        window.showToast(`✅ Schedule added for ${doctor.name} on ${day}`, 'success');
    }
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!currentDeleteId) return;
    
    const schedule = schedules.find(s => s.id === currentDeleteId);
    schedules = schedules.filter(s => s.id !== currentDeleteId);
    saveSchedules();
    refreshUI();
    closeModal('deleteModal');
    
    if (schedule && window.showToast) {
        window.showToast(`🗑️ Schedule deleted for ${schedule.doctorName} on ${schedule.day}`, 'info');
    }
    currentDeleteId = null;
}

// ─── Init ────────────────────────────────────────────

function initScheduleModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('addScheduleBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeScheduleModalBtn')?.addEventListener('click', () => closeModal('scheduleModal'));
    document.getElementById('cancelScheduleModalBtn')?.addEventListener('click', () => closeModal('scheduleModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('scheduleForm')?.addEventListener('submit', saveSchedule);
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = '';
        dayFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('dayFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('dayFilter')?.addEventListener('change', (e) => {
        dayFilter = e.target.value;
        renderTable();
    });
    
    // Close modals on overlay click
    document.getElementById('scheduleModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('scheduleModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('scheduleModal');
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
            setTimeout(initScheduleModule, 100);
        }
    }, 50);
    
    // Fallback: if sidebar doesn't load in 3 seconds, init anyway
    setTimeout(() => {
        clearInterval(checkInterval);
        initScheduleModule();
    }, 3000);
});