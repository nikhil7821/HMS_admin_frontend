/**
 * Doctor Schedule Management JS - Clinical Module
 * Version: 8.0 - COMPLETE PROFESSIONAL SYSTEM with Replacement Dropdown
 * 
 * ✅ Time Slot Booking (15/30/45/60 min slots)
 * ✅ Real-time Availability Check
 * ✅ Recurring Schedules (Weekly/Bi-weekly)
 * ✅ Holiday Management
 * ✅ Break/Lunch Times
 * ✅ Max Patients Per Day
 * ✅ Multi-View (Table/Calendar/Day)
 * ✅ Slot Booking with Patient Details
 * ✅ DOCTOR UNAVAILABILITY HANDLING with Modal Confirmation
 * ✅ Replacement Doctor Dropdown (Manual Selection)
 * ✅ Auto-Reassign Patients
 * ✅ Unavailability Reasons
 * ✅ Conflict Prevention
 * ✅ STATUS TOGGLE (Unavailable ↔ Available)
 */

let schedules = [];
let doctors = [];
let holidays = [];
let bookings = [];
let currentDeleteId = null;
let currentEditId = null;
let currentUnavailableScheduleId = null;
let searchTerm = '';
let dayFilter = '';
let statusFilter = '';
let isInitialized = false;
let currentView = 'table';
let currentWeekStart = new Date();
let currentDay = new Date();

// ─── Utility Functions ──────────────────────────────────────────

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

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function getDayOrder(day) {
    const order = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
    return order[day] || 0;
}

function getDayName(index) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[index] || '';
}

function getStatusBadge(status) {
    const map = {
        'active': { label: 'Active', class: 'badge-active', dot: 'green' },
        'cancelled': { label: 'Cancelled', class: 'badge-cancelled', dot: 'red' },
        'replaced': { label: 'Replaced', class: 'badge-replaced', dot: 'yellow' },
        'completed': { label: 'Completed', class: 'badge-completed', dot: 'gray' },
        'booked': { label: 'Booked', class: 'badge-booked', dot: 'red' },
        'available': { label: 'Available', class: 'badge-available', dot: 'green' },
        'blocked': { label: 'Blocked', class: 'badge-blocked', dot: 'gray' },
        'unavailable': { label: 'Unavailable', class: 'badge-cancelled', dot: 'red' },
        'oncall': { label: 'On Call', class: 'badge-replaced', dot: 'yellow' }
    };
    return map[status] || { label: status || 'Active', class: 'badge-active', dot: 'green' };
}

function getAvailabilityBadge(availability) {
    const map = {
        'available': { label: '✅ Available', class: 'availability-available', dot: 'available' },
        'unavailable': { label: '❌ Unavailable', class: 'availability-unavailable', dot: 'unavailable' },
        'oncall': { label: '📞 On Call', class: 'availability-oncall', dot: 'oncall' }
    };
    return map[availability] || { label: '✅ Available', class: 'availability-available', dot: 'available' };
}

function generateTimeSlots(startTime, endTime, duration) {
    const slots = [];
    let current = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    while (current < end) {
        const slotStart = current.toTimeString().slice(0, 5);
        current = new Date(current.getTime() + duration * 60000);
        const slotEnd = current.toTimeString().slice(0, 5);
        slots.push({ start: slotStart, end: slotEnd });
    }
    return slots;
}

// ─── Data Management ────────────────────────────────────────────

function loadData() {
    try {
        const storedDoctors = localStorage.getItem('hms_doctors');
        if (storedDoctors) {
            doctors = JSON.parse(storedDoctors);
        } else {
            doctors = [];
        }
        
        const stored = localStorage.getItem('hms_schedules');
        if (stored) {
            schedules = JSON.parse(stored);
            schedules = schedules.map(s => ({
                ...s,
                status: s.status || 'active',
                replacementDoctorId: s.replacementDoctorId || null,
                replacementReason: s.replacementReason || '',
                notes: s.notes || '',
                slotDuration: s.slotDuration || 30,
                maxPatients: s.maxPatients || 20,
                recurringPattern: s.recurringPattern || 'none',
                recurringEnd: s.recurringEnd || null,
                breakStart: s.breakStart || null,
                breakEnd: s.breakEnd || null,
                slots: s.slots || [],
                bookings: s.bookings || [],
                unavailabilityReason: s.unavailabilityReason || '',
                isUnavailable: s.isUnavailable || false,
                unavailableDate: s.unavailableDate || null,
                availabilityStatus: s.availabilityStatus || 'available'
            }));
            saveSchedules();
        } else {
            schedules = [
                {
                    id: 1, doctorId: 1, doctorName: 'Dr. Anjali Nair', 
                    day: 'Monday', startTime: '09:00', endTime: '17:00', 
                    room: 'Room 101 - Cardiology', status: 'active',
                    slotDuration: 30, maxPatients: 20,
                    recurringPattern: 'weekly', recurringEnd: '2026-12-31',
                    breakStart: '13:00', breakEnd: '14:00',
                    replacementDoctorId: null, replacementReason: '', notes: '',
                    slots: [], bookings: [], isUnavailable: false,
                    unavailabilityReason: '', unavailableDate: null,
                    availabilityStatus: 'available'
                },
                {
                    id: 2, doctorId: 1, doctorName: 'Dr. Anjali Nair', 
                    day: 'Wednesday', startTime: '09:00', endTime: '17:00', 
                    room: 'Room 101 - Cardiology', status: 'active',
                    slotDuration: 30, maxPatients: 20,
                    recurringPattern: 'weekly', recurringEnd: '2026-12-31',
                    breakStart: '13:00', breakEnd: '14:00',
                    replacementDoctorId: null, replacementReason: '', notes: '',
                    slots: [], bookings: [], isUnavailable: false,
                    unavailabilityReason: '', unavailableDate: null,
                    availabilityStatus: 'available'
                },
                {
                    id: 3, doctorId: 2, doctorName: 'Dr. Vikram Singh', 
                    day: 'Tuesday', startTime: '10:00', endTime: '18:00', 
                    room: 'Room 202 - Neurology', status: 'active',
                    slotDuration: 30, maxPatients: 16,
                    recurringPattern: 'weekly', recurringEnd: '2026-12-31',
                    breakStart: '13:30', breakEnd: '14:30',
                    replacementDoctorId: null, replacementReason: '', notes: '',
                    slots: [], bookings: [], isUnavailable: false,
                    unavailabilityReason: '', unavailableDate: null,
                    availabilityStatus: 'available'
                },
                {
                    id: 4, doctorId: 3, doctorName: 'Dr. Sneha Joshi', 
                    day: 'Thursday', startTime: '08:30', endTime: '16:30', 
                    room: 'Room 303 - Pediatrics', status: 'replaced',
                    slotDuration: 30, maxPatients: 18,
                    recurringPattern: 'none', recurringEnd: null,
                    breakStart: '12:30', breakEnd: '13:30',
                    replacementDoctorId: 4, replacementReason: 'Emergency leave', 
                    notes: 'Dr. Rajiv Menon covering',
                    slots: [], bookings: [], isUnavailable: true,
                    unavailabilityReason: 'Emergency leave', 
                    unavailableDate: new Date().toISOString().split('T')[0],
                    availabilityStatus: 'unavailable'
                }
            ];
            saveSchedules();
        }
        
        const storedHolidays = localStorage.getItem('hms_holidays');
        if (storedHolidays) {
            holidays = JSON.parse(storedHolidays);
        } else {
            holidays = [];
            saveHolidays();
        }
        
        const storedBookings = localStorage.getItem('hms_bookings');
        if (storedBookings) {
            bookings = JSON.parse(storedBookings);
        } else {
            bookings = [];
            saveBookings();
        }
        
        refreshUI();
        populateDoctorSelects();
        populateReplacementDropdown();
        updateDoctorAvailabilityInfo();
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

function saveHolidays() {
    try {
        localStorage.setItem('hms_holidays', JSON.stringify(holidays));
    } catch (error) {
        console.error('Error saving holidays:', error);
    }
}

function saveBookings() {
    try {
        localStorage.setItem('hms_bookings', JSON.stringify(bookings));
    } catch (error) {
        console.error('Error saving bookings:', error);
    }
}

function populateDoctorSelects() {
    const doctorSelect = document.getElementById('doctorId');
    const replacementSelect = document.getElementById('replacementDoctorId');
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => {
                const avail = d.availability || 'available';
                const statusIcon = avail === 'available' ? '🟢' : avail === 'oncall' ? '🟡' : '🔴';
                return `<option value="${d.id}">${statusIcon} ${esc(d.name)} (${d.specialization})</option>`;
            }).join('');
        
        doctorSelect.addEventListener('change', function() {
            updateDoctorAvailabilityInfo();
            checkForConflicts();
            showDoctorStatus();
        });
    }
    
    if (replacementSelect) {
        const availableDoctors = doctors.filter(d => d.availability === 'available' || d.availability === 'oncall');
        replacementSelect.innerHTML = '<option value="">-- Select Replacement --</option>' + 
            availableDoctors.map(d => `<option value="${d.id}">🟢 ${esc(d.name)} (${d.specialization})</option>`).join('');
    }
}

// 🆕 Populate Replacement Dropdown in Unavailable Modal
function populateReplacementDropdown() {
    const dropdown = document.getElementById('unavailableReplacementDoctor');
    if (!dropdown) return;
    
    // Get current schedule's doctor to exclude them
    let currentDoctorId = null;
    if (currentUnavailableScheduleId) {
        const schedule = schedules.find(s => s.id === currentUnavailableScheduleId);
        if (schedule) currentDoctorId = schedule.doctorId;
    }
    
    // Get available doctors (excluding the current doctor)
    const availableDoctors = doctors.filter(d => 
        d.id !== currentDoctorId && 
        (d.availability === 'available' || d.availability === 'oncall')
    );
    
    dropdown.innerHTML = '<option value="">-- Select Replacement (Optional) --</option>' + 
        availableDoctors.map(d => {
            const status = d.availability === 'available' ? '🟢 Available' : '🟡 On Call';
            return `<option value="${d.id}">${esc(d.name)} (${d.specialization}) - ${status}</option>`;
        }).join('');
    
    // If no doctors available, show message
    if (availableDoctors.length === 0) {
        dropdown.innerHTML = '<option value="">-- No doctors available for replacement --</option>';
        dropdown.disabled = true;
    } else {
        dropdown.disabled = false;
    }
}

// ─── DOCTOR AVAILABILITY CHECK ──────────────────────────────

function showDoctorStatus() {
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const statusDiv = document.getElementById('doctorAvailabilityInfo');
    const statusText = document.getElementById('doctorAvailText');
    
    if (!doctorId || !statusDiv || !statusText) return;
    
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
        statusDiv.style.display = 'none';
        return;
    }
    
    const avail = getAvailabilityBadge(doctor.availability || 'available');
    statusDiv.style.display = 'block';
    statusText.textContent = `Status: ${avail.label}`;
    statusText.style.color = doctor.availability === 'available' ? '#4a8c3a' : 
                             doctor.availability === 'oncall' ? '#d4a853' : '#ef4444';
    
    const today = new Date().toISOString().split('T')[0];
    const holiday = holidays.find(h => h.doctorId === doctorId && h.date === today);
    if (holiday) {
        statusText.textContent = `🚫 On Holiday: ${holiday.reason || 'Leave'}`;
        statusText.style.color = '#ef4444';
    }
}

function isDoctorAvailable(doctorId, date, time) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return { available: false, reason: 'Doctor not found' };
    
    if (doctor.availability === 'unavailable') {
        return { available: false, reason: 'Doctor is marked as Unavailable', status: doctor.availability };
    }
    
    if (doctor.availability === 'oncall') {
        return { available: false, reason: 'Doctor is On Call today', status: doctor.availability };
    }
    
    const isHoliday = holidays.some(h => h.date === date && h.doctorId === doctorId);
    if (isHoliday) {
        const holiday = holidays.find(h => h.date === date && h.doctorId === doctorId);
        return { available: false, reason: `🚫 Holiday: ${holiday?.reason || 'Doctor on leave'}`, isHoliday: true };
    }
    
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const schedule = schedules.find(s => 
        s.doctorId === doctorId && s.day === dayName && s.status === 'active'
    );
    
    if (!schedule) {
        return { available: false, reason: `No schedule on ${dayName}`, schedule: null };
    }
    
    if (schedule.availabilityStatus === 'unavailable' || schedule.isUnavailable) {
        return {
            available: false,
            reason: `Doctor unavailable: ${schedule.unavailabilityReason || 'No reason provided'}`,
            schedule: schedule
        };
    }
    
    if (time) {
        if (time < schedule.startTime || time > schedule.endTime) {
            return {
                available: false,
                reason: `Outside working hours (${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)})`,
                schedule: schedule
            };
        }
        
        if (schedule.breakStart && schedule.breakEnd) {
            if (time >= schedule.breakStart && time <= schedule.breakEnd) {
                return {
                    available: false,
                    reason: `Doctor is on break (${formatTime(schedule.breakStart)} - ${formatTime(schedule.breakEnd)})`,
                    schedule: schedule
                };
            }
        }
    }
    
    const dayBookings = (schedule.bookings || []).filter(b => b.date === date);
    if (dayBookings.length >= (schedule.maxPatients || 20)) {
        return {
            available: false,
            reason: `Max patients limit reached (${schedule.maxPatients})`,
            schedule: schedule,
            bookings: dayBookings
        };
    }
    
    return { 
        available: true, 
        reason: 'Doctor is available',
        schedule: schedule,
        doctor: doctor
    };
}

function findReplacementDoctor(doctorId, date, time) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return null;
    
    const availableDoctors = doctors.filter(d => 
        d.id !== doctorId && 
        d.specialty === doctor.specialty &&
        (d.availability === 'available' || d.availability === 'oncall')
    );
    
    for (const candidate of availableDoctors) {
        const availability = isDoctorAvailable(candidate.id, date, time);
        if (availability.available) {
            return { doctor: candidate, availability: availability };
        }
    }
    
    const anyAvailable = doctors.filter(d => 
        d.id !== doctorId && 
        (d.availability === 'available' || d.availability === 'oncall')
    );
    
    for (const candidate of anyAvailable) {
        const availability = isDoctorAvailable(candidate.id, date, time);
        if (availability.available) {
            return { doctor: candidate, availability: availability, isDifferentSpecialty: true };
        }
    }
    
    return null;
}

function autoReassignPatients(scheduleId, replacementDoctorId, date) {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return { success: false, message: 'Schedule not found' };
    
    const replacement = doctors.find(d => d.id === replacementDoctorId);
    if (!replacement) return { success: false, message: 'Replacement doctor not found' };
    
    const dayBookings = (schedule.bookings || []).filter(b => b.date === date);
    
    if (dayBookings.length === 0) {
        return { success: true, message: 'No patients to reassign', reassigned: 0 };
    }
    
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const replacementSchedule = schedules.find(s => 
        s.doctorId === replacementDoctorId && s.day === dayName && s.status === 'active'
    );
    
    if (!replacementSchedule) {
        return { success: false, message: 'Replacement doctor has no schedule on this day', reassigned: 0 };
    }
    
    let reassigned = 0;
    dayBookings.forEach(booking => {
        const repBookings = (replacementSchedule.bookings || []).filter(b => b.date === date);
        if (repBookings.length < (replacementSchedule.maxPatients || 20)) {
            const bookingIndex = schedule.bookings.indexOf(booking);
            if (bookingIndex !== -1) {
                schedule.bookings.splice(bookingIndex, 1);
                replacementSchedule.bookings.push({
                    ...booking,
                    reassignedFrom: schedule.doctorName,
                    reassignedDate: new Date().toISOString().split('T')[0]
                });
                reassigned++;
            }
        }
    });
    
    saveSchedules();
    return { 
        success: true, 
        message: `${reassigned} patients reassigned to ${replacement.name}`,
        reassigned: reassigned
    };
}

// ─── MARK DOCTOR UNAVAILABLE / AVAILABLE ────────────────────────

function markDoctorUnavailable(scheduleId, date, reason, replacementDoctorId) {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return { success: false, message: 'Schedule not found' };
    
    const doctor = doctors.find(d => d.id === schedule.doctorId);
    if (!doctor) return { success: false, message: 'Doctor not found' };
    
    // Update schedule status
    schedule.isUnavailable = true;
    schedule.unavailabilityReason = reason;
    schedule.unavailableDate = date;
    schedule.availabilityStatus = 'unavailable';
    schedule.status = 'replaced';
    
    // If replacement doctor is selected, use it
    let result = null;
    if (replacementDoctorId) {
        const replacement = doctors.find(d => d.id === replacementDoctorId);
        if (replacement) {
            schedule.replacementDoctorId = replacementDoctorId;
            schedule.replacementReason = reason;
            result = autoReassignPatients(scheduleId, replacementDoctorId, date);
        } else {
            result = { message: 'Selected replacement not found', reassigned: 0 };
        }
    } else {
        // Try to find automatic replacement
        const autoReplacement = findReplacementDoctor(schedule.doctorId, date, '');
        if (autoReplacement) {
            schedule.replacementDoctorId = autoReplacement.doctor.id;
            schedule.replacementReason = reason;
            result = autoReassignPatients(scheduleId, autoReplacement.doctor.id, date);
        } else {
            result = { message: 'No replacement found', reassigned: 0 };
        }
    }
    
    saveSchedules();
    return {
        success: true,
        message: `Doctor marked unavailable. ${result?.message || 'No replacement assigned'}`,
        replacement: replacementDoctorId ? doctors.find(d => d.id === replacementDoctorId) : null,
        reassigned: result?.reassigned || 0,
        availabilityStatus: 'unavailable'
    };
}

// ─── MARK DOCTOR AVAILABLE ─────────────────────────────────────

function markDoctorAvailable(scheduleId) {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return { success: false, message: 'Schedule not found' };
    
    // Reset availability status
    schedule.isUnavailable = false;
    schedule.unavailabilityReason = '';
    schedule.unavailableDate = null;
    schedule.availabilityStatus = 'available';
    schedule.status = 'active';
    schedule.replacementDoctorId = null;
    schedule.replacementReason = '';
    
    saveSchedules();
    return {
        success: true,
        message: 'Doctor marked as Available',
        availabilityStatus: 'available'
    };
}

// ─── Stats ──────────────────────────────────────────────────────

function updateStats() {
    const total = schedules.length;
    const unavailableDoctors = schedules.filter(s => s.availabilityStatus === 'unavailable' || s.isUnavailable).length;
    
    let availableSlots = 0;
    let bookedSlots = 0;
    schedules.forEach(s => {
        if (s.status === 'active' && s.availabilityStatus !== 'unavailable' && !s.isUnavailable) {
            const slots = generateTimeSlots(s.startTime, s.endTime, s.slotDuration || 30);
            const bookedCount = (s.bookings || []).length;
            availableSlots += slots.length - bookedCount;
            bookedSlots += bookedCount;
        }
    });
    
    document.getElementById('totalSchedules').textContent = total;
    document.getElementById('availableSlots').textContent = availableSlots;
    document.getElementById('bookedSlots').textContent = bookedSlots;
    document.getElementById('holidayCount').textContent = holidays.length + unavailableDoctors;
}

// ─── Filter ──────────────────────────────────────────────────────

function getFilteredSchedules() {
    return schedules.filter(s => {
        const matchesSearch = searchTerm === '' || 
            s.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.room && s.room.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesDay = dayFilter === '' || s.day === dayFilter;
        const matchesStatus = statusFilter === '' || s.status === statusFilter;
        
        return matchesSearch && matchesDay && matchesStatus;
    });
}

// ─── Render Table ──────────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('scheduleTable');
    if (!tbody) return;
    
    const filtered = getFilteredSchedules();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="schedule-empty">
                    <i class="fas fa-calendar-times"></i>
                    <p>No schedules found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a schedule to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const sorted = [...filtered].sort((a, b) => {
        const dayCompare = getDayOrder(a.day) - getDayOrder(b.day);
        if (dayCompare !== 0) return dayCompare;
        return a.startTime.localeCompare(b.startTime);
    });
    
    tbody.innerHTML = sorted.map(s => {
        const status = getStatusBadge(s.status);
        const isReplaced = s.status === 'replaced';
        const isUnavailable = s.availabilityStatus === 'unavailable' || s.isUnavailable;
        const replacementDoctor = isReplaced ? doctors.find(d => d.id === s.replacementDoctorId) : null;
        const slotCount = generateTimeSlots(s.startTime, s.endTime, s.slotDuration || 30).length;
        const bookedCount = (s.bookings || []).length;
        const doctor = doctors.find(d => d.id === s.doctorId);
        const avail = doctor ? getAvailabilityBadge(doctor.availability || 'available') : getAvailabilityBadge('available');
        
        const isAvail = s.availabilityStatus === 'available' && !s.isUnavailable;
        const statusBtnText = isAvail ? 'Mark Unavailable' : 'Mark Available';
        const statusBtnClass = isAvail ? 'unavailable-btn' : 'available-btn';
        const statusBtnColor = isAvail ? '#ef4444' : '#4a8c3a';
        const statusBtnIcon = isAvail ? 'fa-ban' : 'fa-check-circle';
        
        return `
            <tr class="schedule-row" data-id="${s.id}" style="${isUnavailable ? 'opacity:0.7; background:#fef2f2;' : ''}">
                <td class="col-doctor" style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">
                    ${esc(s.doctorName)}
                    ${isUnavailable ? ' 🚫' : ' ✅'}
                    ${s.recurringPattern !== 'none' ? ` <span class="badge-recurring"><i class="fas fa-sync-alt"></i> ${s.recurringPattern}</span>` : ''}
                    ${isReplaced && isUnavailable ? `<div style="font-size:0.6rem; color:var(--color-gold);"><i class="fas fa-exchange-alt"></i> Replaced by ${replacementDoctor ? esc(replacementDoctor.name) : 'Unknown'}</div>` : ''}
                    ${isUnavailable ? `<div style="font-size:0.6rem; color:#ef4444;">🚫 ${esc(s.unavailabilityReason || 'Unavailable')}</div>` : ''}
                    ${!isUnavailable ? `<div style="font-size:0.6rem; color:#4a8c3a;">✅ Available</div>` : ''}
                </td>
                <td class="col-day"><span class="day-badge">${s.day}</span></td>
                <td class="col-time"><span class="time-display">${formatTime(s.startTime)} - ${formatTime(s.endTime)}</span></td>
                <td class="col-room" style="color:var(--color-brown-300);">${esc(s.room) || '-'}</td>
                <td class="col-status">
                    <span class="badge-status ${isUnavailable ? 'badge-cancelled' : status.class}">
                        <span class="status-dot ${isUnavailable ? 'red' : status.dot}"></span>
                        ${isUnavailable ? 'Unavailable' : status.label}
                    </span>
                </td>
                <td class="col-availability">
                    <span class="doc-availability">
                        <span class="avail-dot ${isUnavailable ? 'unavailable' : avail.dot}"></span>
                        <span style="color:${isUnavailable ? '#ef4444' : doctor?.availability === 'available' ? '#4a8c3a' : doctor?.availability === 'oncall' ? '#d4a853' : '#ef4444'};">
                            ${isUnavailable ? '❌ Unavailable' : avail.label}
                        </span>
                    </span>
                </td>
                <td class="col-slots" style="font-size:0.7rem;">
                    <span style="color:var(--color-brown-100);">${bookedCount}/${slotCount}</span>
                    ${s.maxPatients ? `<span style="color:var(--color-brown-100); margin-left:0.25rem;">| Max: ${s.maxPatients}</span>` : ''}
                </td>
                <td class="col-actions">
                    <div style="display:flex; gap:0.25rem; justify-content:center; flex-wrap:wrap;">
                        <button class="action-btn view-btn" data-id="${s.id}" title="View Schedule Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" data-id="${s.id}" title="Edit Schedule">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn ${statusBtnClass}" data-id="${s.id}" title="${statusBtnText}" style="color:${statusBtnColor}; font-weight:500;">
                            <i class="fas ${statusBtnIcon}"></i>
                        </button>
                        <button class="action-btn delete delete-btn" data-id="${s.id}" title="Delete Schedule">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            viewSchedule(parseInt(this.dataset.id));
        });
    });
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            openEditModal(parseInt(this.dataset.id));
        });
    });
    tbody.querySelectorAll('.unavailable-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            openUnavailableModal(parseInt(this.dataset.id));
        });
    });
    tbody.querySelectorAll('.available-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const scheduleId = parseInt(this.dataset.id);
            const result = markDoctorAvailable(scheduleId);
            if (result.success) {
                refreshUI();
                if (window.showToast) {
                    window.showToast(`✅ ${result.message}`, 'success');
                }
            }
        });
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            openDeleteModal(parseInt(this.dataset.id));
        });
    });
}

// ─── Render Calendar ────────────────────────────────────────────

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - start.getDay() + 1);
    
    const weekLabel = document.getElementById('weekLabel');
    if (weekLabel) {
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        weekLabel.textContent = `${formatDate(start.toISOString().split('T')[0])} - ${formatDate(end.toISOString().split('T')[0])}`;
    }
    
    grid.innerHTML = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dayName = getDayName(i);
        const dateStr = date.toISOString().split('T')[0];
        const isHoliday = holidays.some(h => h.date === dateStr);
        const daySchedules = schedules.filter(s => s.day === dayName && s.status === 'active' && s.availabilityStatus !== 'unavailable' && !s.isUnavailable);
        const unavailableSchedules = schedules.filter(s => s.day === dayName && (s.availabilityStatus === 'unavailable' || s.isUnavailable));
        
        return `
            <div class="calendar-day">
                <div class="day-name">
                    ${dayName}
                    ${isHoliday ? ' 🎯' : ''}
                    <div style="font-size:0.55rem; color:var(--color-brown-100);">${formatDate(dateStr)}</div>
                </div>
                ${isHoliday ? `
                    <div style="font-size:0.6rem; color:#ef4444; text-align:center; padding:0.25rem 0;">
                        🏖️ Holiday
                    </div>
                ` : unavailableSchedules.length > 0 ? `
                    <div style="font-size:0.6rem; color:#ef4444; text-align:center; padding:0.25rem 0;">
                        🚫 ${unavailableSchedules[0].doctorName} unavailable
                    </div>
                ` : daySchedules.length === 0 ? `
                    <div style="font-size:0.55rem; color:var(--color-brown-100); text-align:center; padding:0.5rem 0;">
                        No schedules
                    </div>
                ` : daySchedules.map(s => {
                    const slots = generateTimeSlots(s.startTime, s.endTime, s.slotDuration || 30);
                    const bookedCount = (s.bookings || []).filter(b => b.date === dateStr).length;
                    const isFullyBooked = bookedCount >= slots.length || bookedCount >= (s.maxPatients || 20);
                    
                    return `
                        <div class="day-schedule ${isFullyBooked ? 'booked' : 'active'}" 
                             onclick="showDaySlots(${s.id}, '${dateStr}')" 
                             style="cursor:pointer;">
                            <strong>${esc(s.doctorName)}</strong>
                            <div class="slot-detail">${formatTime(s.startTime)} - ${formatTime(s.endTime)}</div>
                            <div class="slot-detail">${bookedCount}/${slots.length} slots</div>
                            ${isFullyBooked ? '<span style="color:#ef4444;">🔴 Full</span>' : '<span style="color:#4a8c3a;">🟢 Available</span>'}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');
}

// ─── Render Day View ────────────────────────────────────────────

function renderDayView() {
    const container = document.getElementById('dayViewContent');
    if (!container) return;
    
    const dateStr = currentDay.toISOString().split('T')[0];
    const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'long' });
    
    document.getElementById('dayLabel').textContent = `${dayName}, ${formatDate(dateStr)}`;
    
    const daySchedules = schedules.filter(s => s.day === dayName && s.status === 'active');
    
    if (daySchedules.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:2rem; color:var(--color-brown-100);">
                <i class="fas fa-calendar-day" style="font-size:2rem; display:block; margin-bottom:0.5rem; opacity:0.4;"></i>
                <p>No schedules for ${dayName}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = daySchedules.map(s => {
        const slots = generateTimeSlots(s.startTime, s.endTime, s.slotDuration || 30);
        const dayBookings = (s.bookings || []).filter(b => b.date === dateStr);
        const isUnavailable = s.availabilityStatus === 'unavailable' || s.isUnavailable;
        
        return `
            <div class="card-white" style="padding:1rem; margin-bottom:0.75rem; ${isUnavailable ? 'opacity:0.6; background:#fef2f2;' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <div>
                        <strong style="font-size:0.9rem; color:var(--color-brown-700);">${esc(s.doctorName)}</strong>
                        ${isUnavailable ? '<span style="color:#ef4444; font-size:0.7rem; margin-left:0.5rem;">🚫 Unavailable</span>' : '<span style="color:#4a8c3a; font-size:0.7rem; margin-left:0.5rem;">✅ Available</span>'}
                        <span style="font-size:0.7rem; color:var(--color-brown-100); margin-left:0.5rem;">${formatTime(s.startTime)} - ${formatTime(s.endTime)}</span>
                    </div>
                    <span style="font-size:0.7rem; color:var(--color-brown-100);">${dayBookings.length}/${slots.length} booked</span>
                </div>
                ${isUnavailable ? `
                    <div style="background:#fee2e2; color:#ef4444; padding:0.25rem 0.5rem; border-radius:var(--radius-sm); font-size:0.7rem; margin-bottom:0.5rem;">
                        🚫 ${esc(s.unavailabilityReason || 'Doctor unavailable')}
                        ${s.replacementDoctorId ? ` | Replacement: ${esc(doctors.find(d => d.id === s.replacementDoctorId)?.name || 'Unknown')}` : ''}
                    </div>
                ` : ''}
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(80px, 1fr)); gap:0.25rem;">
                    ${slots.map((slot, index) => {
                        const isBooked = dayBookings.some(b => b.slotIndex === index);
                        const isBreak = s.breakStart && s.breakEnd && slot.start >= s.breakStart && slot.end <= s.breakEnd;
                        
                        return `
                            <div style="padding:0.2rem 0.3rem; border-radius:var(--radius-sm); border:1px solid var(--border-default); text-align:center; font-size:0.6rem; 
                                ${isBooked ? 'background:#fee2e2; border-color:#ef4444;' : 
                                  isBreak ? 'background:#f0e8e0; border-color:#b8aa9a; opacity:0.6;' : 
                                  isUnavailable ? 'background:#f0e8e0; border-color:#b8aa9a; opacity:0.5;' :
                                  'background:#e8f5e2; border-color:#4a8c3a; cursor:pointer;'}"
                                ${!isBooked && !isBreak && !isUnavailable ? `onclick="openBookSlot(${s.id}, ${index}, '${dateStr}', '${slot.start}', '${slot.end}')"` : ''}>
                                <div style="font-weight:var(--font-weight-medium);">${formatTime(slot.start)}</div>
                                <div style="font-size:0.5rem; color:var(--color-brown-100);">
                                    ${isBooked ? '📋 Booked' : isBreak ? '☕ Break' : isUnavailable ? '🚫 Unavailable' : '✅ Free'}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// ─── Show Day Slots ─────────────────────────────────────────────

function showDaySlots(scheduleId, dateStr) {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    const slots = generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDuration || 30);
    const dayBookings = (schedule.bookings || []).filter(b => b.date === dateStr);
    
    const content = document.getElementById('viewScheduleContent');
    content.innerHTML = `
        <div style="display:grid; gap:0.25rem;">
            <div class="detail-row">
                <span class="detail-label">Doctor</span>
                <span class="detail-value"><strong>${esc(schedule.doctorName)}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${formatDate(dateStr)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}</span>
            </div>
            ${schedule.availabilityStatus === 'unavailable' || schedule.isUnavailable ? `
                <div class="detail-row" style="background:#fee2e2; color:#ef4444; padding:0.5rem; border-radius:var(--radius-sm);">
                    <span class="detail-label">🚫 Status</span>
                    <span class="detail-value" style="color:#ef4444;">${esc(schedule.unavailabilityReason || 'Doctor unavailable')}</span>
                </div>
            ` : ''}
            <div class="detail-row" style="flex-direction:column; align-items:stretch; gap:0.5rem;">
                <span class="detail-label">Slots (${slots.length})</span>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(80px, 1fr)); gap:0.25rem;">
                    ${slots.map((slot, index) => {
                        const isBooked = dayBookings.some(b => b.slotIndex === index);
                        const booking = dayBookings.find(b => b.slotIndex === index);
                        const isBreak = schedule.breakStart && schedule.breakEnd && slot.start >= schedule.breakStart && slot.end <= schedule.breakEnd;
                        const isUnavailable = schedule.availabilityStatus === 'unavailable' || schedule.isUnavailable;
                        
                        return `
                            <div style="padding:0.2rem 0.3rem; border-radius:var(--radius-sm); border:1px solid var(--border-default); text-align:center; font-size:0.6rem; 
                                ${isBooked ? 'background:#fee2e2; border-color:#ef4444;' : 
                                  isBreak ? 'background:#f0e8e0; border-color:#b8aa9a; opacity:0.6;' : 
                                  isUnavailable ? 'background:#f0e8e0; border-color:#b8aa9a; opacity:0.5;' :
                                  'background:#e8f5e2; border-color:#4a8c3a;'}"
                                title="${isBooked ? `Booked by ${booking?.patientName || 'Unknown'}` : isBreak ? 'Break' : isUnavailable ? 'Unavailable' : 'Available'}">
                                <div style="font-weight:var(--font-weight-medium);">${formatTime(slot.start)}</div>
                                <div style="font-size:0.5rem; color:var(--color-brown-100);">
                                    ${isBooked ? `👤 ${booking?.patientName || 'Booked'}` : isBreak ? '☕ Break' : isUnavailable ? '🚫 Unavailable' : '✅ Free'}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ${dayBookings.length > 0 ? `
                <div class="detail-row" style="flex-direction:column; align-items:stretch; gap:0.25rem;">
                    <span class="detail-label">Bookings</span>
                    ${dayBookings.map(b => `
                        <div style="background:var(--bg-subtle); padding:0.25rem 0.5rem; border-radius:var(--radius-sm); font-size:0.7rem;">
                            ${formatTime(b.slotStart)} - ${b.patientName} (${b.phone})
                            ${b.reason ? `- ${b.reason}` : ''}
                            ${b.reassignedFrom ? `<span style="color:var(--color-gold);"> (Reassigned from ${b.reassignedFrom})</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('viewModalTitle').innerHTML = `<i class="fas fa-eye" style="color:var(--color-sage);"></i> ${esc(schedule.doctorName)} - ${formatDate(dateStr)}`;
    openModal('viewScheduleModal');
}

// ─── Open Book Slot ─────────────────────────────────────────────

function openBookSlot(scheduleId, slotIndex, dateStr, slotStart, slotEnd) {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    const availability = isDoctorAvailable(schedule.doctorId, dateStr, slotStart);
    if (!availability.available) {
        if (window.showToast) {
            window.showToast(`🚫 ${availability.reason}`, 'error');
        }
        const replacement = findReplacementDoctor(schedule.doctorId, dateStr, slotStart);
        if (replacement) {
            if (window.showToast) {
                window.showToast(`💡 Replacement available: ${replacement.doctor.name}`, 'info');
            }
        }
        return;
    }
    
    document.getElementById('bookScheduleId').value = scheduleId;
    document.getElementById('bookSlotIndex').value = slotIndex;
    document.getElementById('bookDoctorName').textContent = schedule.doctorName;
    document.getElementById('bookDateDisplay').textContent = formatDate(dateStr);
    document.getElementById('bookTimeDisplay').textContent = `${formatTime(slotStart)} - ${formatTime(slotEnd)}`;
    document.getElementById('bookDate').value = dateStr;
    document.getElementById('bookStartTime').value = slotStart;
    document.getElementById('bookEndTime').value = slotEnd;
    document.getElementById('bookSlotForm').reset();
    openModal('bookSlotModal');
}

function confirmBookSlot() {
    const scheduleId = parseInt(document.getElementById('bookScheduleId').value);
    const slotIndex = parseInt(document.getElementById('bookSlotIndex').value);
    const patientName = document.getElementById('bookPatientName').value.trim();
    const patientPhone = document.getElementById('bookPatientPhone').value.trim();
    const reason = document.getElementById('bookReason').value.trim();
    const date = document.getElementById('bookDate').value;
    const startTime = document.getElementById('bookStartTime').value;
    const endTime = document.getElementById('bookEndTime').value;
    
    if (!patientName || !patientPhone) {
        if (window.showToast) {
            window.showToast('Please enter patient name and phone', 'error');
        }
        return;
    }
    
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    const availability = isDoctorAvailable(schedule.doctorId, date, startTime);
    if (!availability.available) {
        if (window.showToast) {
            window.showToast(`🚫 ${availability.reason}`, 'error');
        }
        return;
    }
    
    if (!schedule.bookings) schedule.bookings = [];
    
    if (schedule.bookings.some(b => b.date === date && b.slotIndex === slotIndex)) {
        if (window.showToast) {
            window.showToast('⚠️ This slot is already booked!', 'error');
        }
        return;
    }
    
    schedule.bookings.push({
        date: date,
        slotIndex: slotIndex,
        slotStart: startTime,
        slotEnd: endTime,
        patientName: patientName,
        phone: patientPhone,
        reason: reason,
        bookedAt: new Date().toISOString()
    });
    
    saveSchedules();
    refreshUI();
    closeModal('bookSlotModal');
    
    if (window.showToast) {
        window.showToast(`✅ Slot booked for ${patientName}`, 'success');
    }
}

// ─── UNAVAILABLE MODAL FUNCTIONS ──────────────────────────────

function openUnavailableModal(scheduleId) {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    if (schedule.availabilityStatus === 'unavailable' || schedule.isUnavailable) {
        if (window.showToast) {
            window.showToast('ℹ️ This doctor is already marked as unavailable', 'info');
        }
        return;
    }
    
    currentUnavailableScheduleId = scheduleId;
    
    document.getElementById('unavailableDoctorName').textContent = schedule.doctorName;
    document.getElementById('unavailableReason').value = '';
    
    // Populate replacement dropdown
    populateReplacementDropdown();
    
    openModal('unavailableModal');
}

function confirmUnavailable() {
    const reason = document.getElementById('unavailableReason').value.trim();
    const replacementDoctorId = parseInt(document.getElementById('unavailableReplacementDoctor').value) || null;
    
    if (!reason) {
        if (window.showToast) {
            window.showToast('Please enter a reason for unavailability', 'error');
        }
        return;
    }
    
    const date = new Date().toISOString().split('T')[0];
    const result = markDoctorUnavailable(currentUnavailableScheduleId, date, reason, replacementDoctorId);
    
    if (result.success) {
        refreshUI();
        closeModal('unavailableModal');
        if (window.showToast) {
            window.showToast(`✅ ${result.message}`, 'success');
        }
    } else {
        if (window.showToast) {
            window.showToast(`❌ ${result.message}`, 'error');
        }
    }
}

// ─── View Schedule ─────────────────────────────────────────────

function viewSchedule(id) {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;
    
    const status = getStatusBadge(schedule.status);
    const replacementDoctor = schedule.replacementDoctorId ? doctors.find(d => d.id === schedule.replacementDoctorId) : null;
    const doctor = doctors.find(d => d.id === schedule.doctorId);
    const avail = doctor ? getAvailabilityBadge(doctor.availability || 'available') : getAvailabilityBadge('available');
    const isUnavailable = schedule.availabilityStatus === 'unavailable' || schedule.isUnavailable;
    
    const content = document.getElementById('viewScheduleContent');
    content.innerHTML = `
        <div style="display:grid; gap:0.25rem;">
            <div class="detail-row">
                <span class="detail-label">Doctor</span>
                <span class="detail-value"><strong>${esc(schedule.doctorName)}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Day</span>
                <span class="detail-value">${schedule.day}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Room</span>
                <span class="detail-value">${esc(schedule.room) || 'Not assigned'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Slot Duration</span>
                <span class="detail-value">${schedule.slotDuration || 30} mins</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Max Patients</span>
                <span class="detail-value">${schedule.maxPatients || 20}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Availability Status</span>
                <span class="detail-value">
                    ${isUnavailable ? 
                        '<span style="color:#ef4444; font-weight:500;">🚫 Unavailable</span>' : 
                        '<span style="color:#4a8c3a; font-weight:500;">✅ Available</span>'
                    }
                </span>
            </div>
            ${schedule.breakStart && schedule.breakEnd ? `
                <div class="detail-row">
                    <span class="detail-label">Break</span>
                    <span class="detail-value">${formatTime(schedule.breakStart)} - ${formatTime(schedule.breakEnd)}</span>
                </div>
            ` : ''}
            ${schedule.recurringPattern !== 'none' ? `
                <div class="detail-row">
                    <span class="detail-label">Recurring</span>
                    <span class="detail-value">${schedule.recurringPattern} ${schedule.recurringEnd ? `until ${formatDate(schedule.recurringEnd)}` : ''}</span>
                </div>
            ` : ''}
            <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value"><span class="badge-status ${isUnavailable ? 'badge-cancelled' : status.class}"><span class="status-dot ${isUnavailable ? 'red' : status.dot}"></span>${isUnavailable ? 'Unavailable' : status.label}</span></span>
            </div>
            ${isUnavailable ? `
                <div class="detail-row" style="background:#fee2e2; color:#ef4444; padding:0.5rem; border-radius:var(--radius-sm);">
                    <span class="detail-label">🚫 Unavailable</span>
                    <span class="detail-value" style="color:#ef4444;">${esc(schedule.unavailabilityReason || 'No reason provided')}</span>
                </div>
            ` : ''}
            ${schedule.status === 'replaced' && replacementDoctor ? `
                <div class="detail-row" style="flex-direction:column; align-items:stretch; gap:0.25rem;">
                    <span class="detail-label">Replacement</span>
                    <div class="replacement-info">
                        <div><strong>${esc(replacementDoctor.name)}</strong> (${replacementDoctor.specialization})</div>
                        ${schedule.replacementReason ? `<div style="font-size:0.75rem; color:var(--color-brown-300); margin-top:0.25rem;">Reason: ${esc(schedule.replacementReason)}</div>` : ''}
                    </div>
                </div>
            ` : ''}
            ${schedule.notes ? `
                <div class="detail-row" style="flex-direction:column; align-items:stretch; gap:0.25rem;">
                    <span class="detail-label">Notes</span>
                    <span class="detail-value" style="font-size:0.8rem; color:var(--color-brown-300);">${esc(schedule.notes)}</span>
                </div>
            ` : ''}
            ${schedule.bookings && schedule.bookings.length > 0 ? `
                <div class="detail-row" style="flex-direction:column; align-items:stretch; gap:0.25rem;">
                    <span class="detail-label">Bookings (${schedule.bookings.length})</span>
                    ${schedule.bookings.map(b => `
                        <div style="background:var(--bg-subtle); padding:0.25rem 0.5rem; border-radius:var(--radius-sm); font-size:0.7rem;">
                            ${formatDate(b.date)} ${formatTime(b.slotStart)} - ${b.patientName} (${b.phone})
                            ${b.reason ? `- ${b.reason}` : ''}
                            ${b.reassignedFrom ? `<span style="color:var(--color-gold);"> (Reassigned from ${b.reassignedFrom})</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('viewModalTitle').innerHTML = `<i class="fas fa-eye" style="color:var(--color-sage);"></i> ${esc(schedule.doctorName)} - Schedule`;
    openModal('viewScheduleModal');
}

// ─── Toggle View ──────────────────────────────────────────────────

function toggleView(view) {
    currentView = view;
    const tableView = document.getElementById('tableView');
    const calendarView = document.getElementById('calendarView');
    const dayViewContainer = document.getElementById('dayViewContainer');
    const tableBtn = document.getElementById('tableViewBtn');
    const calendarBtn = document.getElementById('calendarViewBtn');
    const dayBtn = document.getElementById('dayViewBtn');
    
    tableView.style.display = 'none';
    calendarView.style.display = 'none';
    dayViewContainer.style.display = 'none';
    [tableBtn, calendarBtn, dayBtn].forEach(btn => btn?.classList.remove('active'));
    
    if (view === 'table') {
        tableView.style.display = 'block';
        tableBtn?.classList.add('active');
        renderTable();
    } else if (view === 'calendar') {
        calendarView.style.display = 'block';
        calendarBtn?.classList.add('active');
        renderCalendar();
    } else if (view === 'day') {
        dayViewContainer.style.display = 'block';
        dayBtn?.classList.add('active');
        renderDayView();
    }
}

function refreshUI() {
    updateStats();
    if (currentView === 'table') {
        renderTable();
    } else if (currentView === 'calendar') {
        renderCalendar();
    } else if (currentView === 'day') {
        renderDayView();
    }
}

// ─── Modals ──────────────────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function openAddModal() {
    populateDoctorSelects();
    document.getElementById('scheduleForm').reset();
    document.getElementById('editScheduleId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-calendar-plus"></i> Add Schedule';
    document.getElementById('scheduleStatus').value = 'active';
    document.getElementById('recurringPattern').value = 'none';
    document.getElementById('recurringEndGroup').style.display = 'none';
    document.getElementById('replacementGroup').style.display = 'none';
    document.getElementById('conflictWarning').style.display = 'none';
    document.getElementById('doctorAvailabilityInfo').style.display = 'none';
    document.getElementById('slotDuration').value = '30';
    document.getElementById('maxPatients').value = '20';
    openModal('scheduleModal');
}

function openEditModal(id) {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;
    
    populateDoctorSelects();
    currentEditId = id;
    
    document.getElementById('editScheduleId').value = id;
    document.getElementById('doctorId').value = schedule.doctorId;
    document.getElementById('day').value = schedule.day;
    document.getElementById('startTime').value = schedule.startTime;
    document.getElementById('endTime').value = schedule.endTime;
    document.getElementById('room').value = schedule.room || '';
    document.getElementById('scheduleStatus').value = schedule.status || 'active';
    document.getElementById('replacementDoctorId').value = schedule.replacementDoctorId || '';
    document.getElementById('scheduleNotes').value = schedule.notes || '';
    document.getElementById('slotDuration').value = schedule.slotDuration || 30;
    document.getElementById('maxPatients').value = schedule.maxPatients || 20;
    document.getElementById('recurringPattern').value = schedule.recurringPattern || 'none';
    document.getElementById('recurringEnd').value = schedule.recurringEnd || '';
    document.getElementById('breakStart').value = schedule.breakStart || '';
    document.getElementById('breakEnd').value = schedule.breakEnd || '';
    
    if (schedule.recurringPattern !== 'none') {
        document.getElementById('recurringEndGroup').style.display = 'block';
    } else {
        document.getElementById('recurringEndGroup').style.display = 'none';
    }
    
    if (schedule.status === 'replaced') {
        document.getElementById('replacementGroup').style.display = 'block';
    } else {
        document.getElementById('replacementGroup').style.display = 'none';
    }
    
    updateDoctorAvailabilityInfo();
    checkForConflicts();
    showDoctorStatus();
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Schedule';
    openModal('scheduleModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── Form Submit ──────────────────────────────────────────────────

function saveSchedule(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editScheduleId').value;
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const day = document.getElementById('day').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const room = document.getElementById('room').value.trim();
    const status = document.getElementById('scheduleStatus').value;
    const replacementDoctorId = parseInt(document.getElementById('replacementDoctorId').value) || null;
    const notes = document.getElementById('scheduleNotes').value.trim();
    const slotDuration = parseInt(document.getElementById('slotDuration').value) || 30;
    const maxPatients = parseInt(document.getElementById('maxPatients').value) || 20;
    const recurringPattern = document.getElementById('recurringPattern').value;
    const recurringEnd = document.getElementById('recurringEnd').value || null;
    const breakStart = document.getElementById('breakStart').value || null;
    const breakEnd = document.getElementById('breakEnd').value || null;
    
    if (!doctorId || !day || !startTime || !endTime) {
        if (window.showToast) {
            window.showToast('Please fill all required fields', 'error');
        }
        return;
    }
    
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
    
    if (!editId) {
        const existing = schedules.find(s => 
            s.doctorId === doctorId && s.day === day && 
            s.status !== 'cancelled' && s.status !== 'completed'
        );
        if (existing) {
            if (window.showToast) {
                window.showToast(`⚠️ ${doctor.name} already has an active schedule on ${day}`, 'error');
            }
            return;
        }
    } else {
        const existing = schedules.find(s => 
            s.doctorId === doctorId && s.day === day && 
            s.status !== 'cancelled' && s.status !== 'completed' &&
            s.id !== parseInt(editId)
        );
        if (existing) {
            if (window.showToast) {
                window.showToast(`⚠️ ${doctor.name} already has an active schedule on ${day}`, 'error');
            }
            return;
        }
    }
    
    const scheduleData = {
        doctorId: doctorId,
        doctorName: doctor.name,
        day: day,
        startTime: startTime,
        endTime: endTime,
        room: room,
        status: status,
        replacementDoctorId: status === 'replaced' ? replacementDoctorId : null,
        replacementReason: status === 'replaced' ? 'Doctor replaced' : '',
        notes: notes,
        slotDuration: slotDuration,
        maxPatients: maxPatients,
        recurringPattern: recurringPattern,
        recurringEnd: recurringEnd,
        breakStart: breakStart,
        breakEnd: breakEnd,
        bookings: [],
        isUnavailable: false,
        unavailabilityReason: '',
        unavailableDate: null,
        availabilityStatus: 'available'
    };
    
    if (editId) {
        const index = schedules.findIndex(s => s.id === parseInt(editId));
        if (index !== -1) {
            scheduleData.bookings = schedules[index].bookings || [];
            scheduleData.isUnavailable = schedules[index].isUnavailable || false;
            scheduleData.unavailabilityReason = schedules[index].unavailabilityReason || '';
            scheduleData.unavailableDate = schedules[index].unavailableDate || null;
            scheduleData.availabilityStatus = schedules[index].availabilityStatus || 'available';
            schedules[index] = { ...schedules[index], ...scheduleData };
            if (window.showToast) window.showToast(`✅ Schedule updated for ${doctor.name} on ${day}`, 'success');
        }
    } else {
        const newId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1;
        schedules.push({ id: newId, ...scheduleData });
        if (window.showToast) window.showToast(`✅ Schedule added for ${doctor.name} on ${day}`, 'success');
    }
    
    saveSchedules();
    refreshUI();
    closeModal('scheduleModal');
}

// ─── Delete ──────────────────────────────────────────────────────

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

// ─── Init ───────────────────────────────────────────────────────

function initScheduleModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    document.getElementById('addScheduleBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeScheduleModalBtn')?.addEventListener('click', () => closeModal('scheduleModal'));
    document.getElementById('cancelScheduleModalBtn')?.addEventListener('click', () => closeModal('scheduleModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('scheduleForm')?.addEventListener('submit', saveSchedule);
    
    // Unavailable Modal
    document.getElementById('closeUnavailableModalBtn')?.addEventListener('click', () => closeModal('unavailableModal'));
    document.getElementById('cancelUnavailableBtn')?.addEventListener('click', () => closeModal('unavailableModal'));
    document.getElementById('confirmUnavailableBtn')?.addEventListener('click', confirmUnavailable);
    document.getElementById('unavailableModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('unavailableModal');
    });
    
    // Book Slot Modal
    document.getElementById('closeBookSlotBtn')?.addEventListener('click', () => closeModal('bookSlotModal'));
    document.getElementById('cancelBookSlotBtn')?.addEventListener('click', () => closeModal('bookSlotModal'));
    document.getElementById('confirmBookSlotBtn')?.addEventListener('click', confirmBookSlot);
    document.getElementById('bookSlotModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('bookSlotModal');
    });
    
    document.getElementById('closeViewModalBtn')?.addEventListener('click', () => closeModal('viewScheduleModal'));
    document.getElementById('closeViewModalFooterBtn')?.addEventListener('click', () => closeModal('viewScheduleModal'));
    document.getElementById('viewScheduleModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewScheduleModal');
    });
    
    document.getElementById('tableViewBtn')?.addEventListener('click', () => toggleView('table'));
    document.getElementById('calendarViewBtn')?.addEventListener('click', () => toggleView('calendar'));
    document.getElementById('dayViewBtn')?.addEventListener('click', () => toggleView('day'));
    
    document.getElementById('prevWeekBtn')?.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderCalendar();
    });
    document.getElementById('nextWeekBtn')?.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderCalendar();
    });
    
    document.getElementById('prevDayBtn')?.addEventListener('click', () => {
        currentDay.setDate(currentDay.getDate() - 1);
        renderDayView();
    });
    document.getElementById('nextDayBtn')?.addEventListener('click', () => {
        currentDay.setDate(currentDay.getDate() + 1);
        renderDayView();
    });
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = '';
        dayFilter = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('dayFilter').value = '';
        document.getElementById('statusFilter').value = '';
        refreshUI();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        refreshUI();
    });
    
    document.getElementById('dayFilter')?.addEventListener('change', (e) => {
        dayFilter = e.target.value;
        refreshUI();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        refreshUI();
    });
    
    document.getElementById('scheduleModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('scheduleModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('scheduleModal');
            closeModal('deleteModal');
            closeModal('viewScheduleModal');
            closeModal('bookSlotModal');
            closeModal('unavailableModal');
        }
    });
    
    toggleView('table');
}

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initScheduleModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initScheduleModule();
    }, 3000);
});

// ─── Expose Functions for HTML ───────────────────────────────────

window.openBookSlot = openBookSlot;
window.showDaySlots = showDaySlots;
window.openModal = openModal;
window.closeModal = closeModal;
window.confirmUnavailable = confirmUnavailable;
window.openUnavailableModal = openUnavailableModal;
window.markDoctorAvailable = markDoctorAvailable;
window.populateReplacementDropdown = populateReplacementDropdown;   