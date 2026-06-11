/**
 * Attendance Management JS - Staff Module
 * Professional UI, Fully Working, Indian Names
 */

let staffMembers = [];
let attendanceRecords = [];
let currentDate = new Date().toISOString().split('T')[0];

function loadData() {
    staffMembers = JSON.parse(localStorage.getItem('staff_members') || '[]');
    const stored = localStorage.getItem('staff_attendance');
    if(stored) {
        attendanceRecords = JSON.parse(stored);
    } else {
        attendanceRecords = [];
        // Add some demo attendance for today
        const today = new Date().toISOString().split('T')[0];
        const activeStaff = staffMembers.filter(s => s.status === 'Active');
        activeStaff.forEach((staff, index) => {
            let status = index % 3 === 0 ? 'Present' : (index % 3 === 1 ? 'Present' : 'Late');
            attendanceRecords.push({
                staffId: staff.id,
                date: today,
                status: status,
                checkIn: status === 'Late' ? '09:30' : '09:00',
                checkOut: '17:00',
                notes: ''
            });
        });
        localStorage.setItem('staff_attendance', JSON.stringify(attendanceRecords));
    }
    updateStats();
    document.getElementById('attendanceDate').value = currentDate;
    loadAttendance();
}

function updateStats() {
    const totalActiveStaff = staffMembers.filter(s => s.status === 'Active').length;
    const presentCount = attendanceRecords.filter(a => a.date === currentDate && a.status === 'Present').length;
    const absentCount = attendanceRecords.filter(a => a.date === currentDate && a.status === 'Absent').length;
    const lateCount = attendanceRecords.filter(a => a.date === currentDate && a.status === 'Late').length;
    
    document.getElementById('totalStaff').innerText = totalActiveStaff;
    document.getElementById('presentCount').innerText = presentCount;
    document.getElementById('absentCount').innerText = absentCount;
    document.getElementById('lateCount').innerText = lateCount;
}

function loadAttendance() {
    currentDate = document.getElementById('attendanceDate').value;
    const tbody = document.getElementById('attendanceTable');
    const activeStaff = staffMembers.filter(s => s.status === 'Active');
    
    if(activeStaff.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-users text-3xl mb-2 block"></i><p class="font-normal">No active staff members found</p> </td><tr>';
        return;
    }
    
    tbody.innerHTML = activeStaff.map(staff => {
        let existing = attendanceRecords.find(a => a.staffId === staff.id && a.date === currentDate);
        
        const statusOptions = ['Present', 'Absent', 'Late', 'Half Day', 'Holiday'];
        const statusHtml = statusOptions.map(status => {
            const selected = existing?.status === status ? 'selected' : '';
            return `<option value="${status}" ${selected}>${status}</option>`;
        }).join('');
        
        const checkInValue = existing?.checkIn || '09:00';
        const checkOutValue = existing?.checkOut || '17:00';
        const notesValue = existing?.notes || '';
        
        return `
            <tr class="attendance-row">
                <td class="px-5 py-3">
                    <div>
                        <p class="font-medium text-[#1e293b] text-sm">${escapeHtml(staff.fullName)}</p>
                        <p class="text-xs text-[#94a3b8]">${escapeHtml(staff.staffId)}</p>
                    </div>
                </td>
                <td class="px-5 py-3 text-sm text-[#475569]">${escapeHtml(staff.role)}</td>
                <td class="px-5 py-3">
                    <select class="status-select" data-staff="${staff.id}">
                        ${statusHtml}
                    </select>
                </td>
                <td class="px-5 py-3">
                    <input type="time" class="time-input" data-staff="${staff.id}" data-type="checkin" value="${checkInValue}">
                </td>
                <td class="px-5 py-3">
                    <input type="time" class="time-input" data-staff="${staff.id}" data-type="checkout" value="${checkOutValue}">
                </td>
                <td class="px-5 py-3">
                    <input type="text" class="notes-input" data-staff="${staff.id}" data-type="notes" value="${escapeHtml(notesValue)}" placeholder="Notes...">
                </td>
            </tr>
        `;
    }).join('');
    
    updateStats();
}

function saveAttendance() {
    let newRecords = [];
    let hasChanges = false;
    
    // Collect all status selections
    document.querySelectorAll('.status-select').forEach(select => {
        const staffId = parseInt(select.dataset.staff);
        const status = select.value;
        
        // Find corresponding check-in, check-out, and notes
        const checkInInput = document.querySelector(`.time-input[data-staff="${staffId}"][data-type="checkin"]`);
        const checkOutInput = document.querySelector(`.time-input[data-staff="${staffId}"][data-type="checkout"]`);
        const notesInput = document.querySelector(`.notes-input[data-staff="${staffId}"][data-type="notes"]`);
        
        const checkIn = checkInInput?.value || '09:00';
        const checkOut = checkOutInput?.value || '17:00';
        const notes = notesInput?.value || '';
        
        newRecords.push({
            staffId: staffId,
            date: currentDate,
            status: status,
            checkIn: checkIn,
            checkOut: checkOut,
            notes: notes
        });
        
        // Check if there are changes
        const existing = attendanceRecords.find(a => a.staffId === staffId && a.date === currentDate);
        if (!existing || 
            existing.status !== status || 
            existing.checkIn !== checkIn || 
            existing.checkOut !== checkOut || 
            existing.notes !== notes) {
            hasChanges = true;
        }
    });
    
    if (!hasChanges) {
        showToast('No changes to save', 'info');
        return;
    }
    
    // Remove old records for this date and add new ones
    attendanceRecords = attendanceRecords.filter(a => a.date !== currentDate);
    attendanceRecords.push(...newRecords);
    localStorage.setItem('staff_attendance', JSON.stringify(attendanceRecords));
    
    updateStats();
    showToast('Attendance saved successfully!', 'success');
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
    if(!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.getElementById('loadAttendanceBtn')?.addEventListener('click', () => {
        loadAttendance();
        showToast('Attendance loaded', 'info');
    });
    
    document.getElementById('saveAttendanceBtn')?.addEventListener('click', saveAttendance);
});