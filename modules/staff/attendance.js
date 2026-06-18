/**
 * Attendance Management JS - Staff Module
 * Uses theme.css for styling, clean event handling
 */

var staffMembers = [];
var attendanceRecords = [];
var currentDate = '';
var isInitialized = false;

// ─── Utility Functions ──────────────────────────────

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
    var colors = { success: '#8aae7a', error: '#d8b48c', info: '#a8c49a' };
    toast.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; align-items:center; gap:8px; padding:10px 20px; border-radius:12px; background:' + colors[type] + '; color:white; font-weight:500; font-size:0.75rem; backdrop-filter:blur(8px); box-shadow:0 4px 12px rgba(0,0,0,0.08); animation:slideInRight 0.25s ease-out; font-family:Poppins, sans-serif;';
    toast.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle') + '"></i><span>' + esc(message) + '</span>';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 250);
    }, 3000);
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        staffMembers = JSON.parse(localStorage.getItem('staff_members') || '[]');
        var stored = localStorage.getItem('staff_attendance');
        if (stored) {
            attendanceRecords = JSON.parse(stored);
        } else {
            attendanceRecords = [];
            var today = new Date().toISOString().split('T')[0];
            var activeStaff = staffMembers.filter(function(s) { return s.status === 'Active'; });
            for (var i = 0; i < activeStaff.length; i++) {
                var status = i % 3 === 0 ? 'Present' : (i % 3 === 1 ? 'Present' : 'Late');
                attendanceRecords.push({
                    staffId: activeStaff[i].id,
                    date: today,
                    status: status,
                    checkIn: status === 'Late' ? '09:30' : '09:00',
                    checkOut: '17:00',
                    notes: ''
                });
            }
            localStorage.setItem('staff_attendance', JSON.stringify(attendanceRecords));
        }
        currentDate = new Date().toISOString().split('T')[0];
        document.getElementById('attendanceDate').value = currentDate;
        refreshUI();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading attendance data', 'error');
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    var totalActiveStaff = 0;
    for (var i = 0; i < staffMembers.length; i++) {
        if (staffMembers[i].status === 'Active') totalActiveStaff++;
    }
    
    var presentCount = 0, absentCount = 0, lateCount = 0;
    for (var j = 0; j < attendanceRecords.length; j++) {
        if (attendanceRecords[j].date === currentDate) {
            if (attendanceRecords[j].status === 'Present') presentCount++;
            else if (attendanceRecords[j].status === 'Absent') absentCount++;
            else if (attendanceRecords[j].status === 'Late') lateCount++;
        }
    }
    
    document.getElementById('totalStaff').textContent = totalActiveStaff;
    document.getElementById('presentCount').textContent = presentCount;
    document.getElementById('absentCount').textContent = absentCount;
    document.getElementById('lateCount').textContent = lateCount;
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    var tbody = document.getElementById('attendanceTable');
    if (!tbody) return;
    
    var activeStaff = staffMembers.filter(function(s) { return s.status === 'Active'; });
    
    if (activeStaff.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:3rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-users" style="font-size:2rem; margin-bottom:0.75rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No active staff members found</p></td></tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < activeStaff.length; i++) {
        var staff = activeStaff[i];
        var existing = null;
        for (var j = 0; j < attendanceRecords.length; j++) {
            if (attendanceRecords[j].staffId === staff.id && attendanceRecords[j].date === currentDate) {
                existing = attendanceRecords[j];
                break;
            }
        }
        
        var statusOptions = ['Present', 'Absent', 'Late', 'Half Day', 'Holiday'];
        var statusHtml = '';
        for (var k = 0; k < statusOptions.length; k++) {
            var selected = (existing && existing.status === statusOptions[k]) ? 'selected' : '';
            statusHtml += '<option value="' + statusOptions[k] + '" ' + selected + '>' + statusOptions[k] + '</option>';
        }
        
        var checkInValue = (existing && existing.checkIn) ? existing.checkIn : '09:00';
        var checkOutValue = (existing && existing.checkOut) ? existing.checkOut : '17:00';
        var notesValue = (existing && existing.notes) ? existing.notes : '';
        
        html += '<tr class="attendance-row">';
        html += '<td><div><p class="staff-name">' + esc(staff.fullName) + '</p><p class="staff-id">' + esc(staff.staffId) + '</p></div></td>';
        html += '<td class="staff-role">' + esc(staff.role) + '</td>';
        html += '<td><select class="status-select" data-staff="' + staff.id + '">' + statusHtml + '</select></td>';
        html += '<td><input type="time" class="time-input" data-staff="' + staff.id + '" data-type="checkin" value="' + checkInValue + '"></td>';
        html += '<td><input type="time" class="time-input" data-staff="' + staff.id + '" data-type="checkout" value="' + checkOutValue + '"></td>';
        html += '<td><input type="text" class="notes-input" data-staff="' + staff.id + '" data-type="notes" value="' + esc(notesValue) + '" placeholder="Notes..."></td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Load Attendance ──────────────────────────────────

function loadAttendance() {
    var dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        currentDate = dateInput.value;
        refreshUI();
        showToast('Attendance loaded for ' + currentDate, 'info');
    }
}

// ─── Save Attendance ──────────────────────────────────

function saveAttendance() {
    var newRecords = [];
    var hasChanges = false;
    
    var statusSelects = document.querySelectorAll('.status-select');
    for (var i = 0; i < statusSelects.length; i++) {
        var select = statusSelects[i];
        var staffId = parseInt(select.dataset.staff);
        var status = select.value;
        
        var checkInInput = document.querySelector('.time-input[data-staff="' + staffId + '"][data-type="checkin"]');
        var checkOutInput = document.querySelector('.time-input[data-staff="' + staffId + '"][data-type="checkout"]');
        var notesInput = document.querySelector('.notes-input[data-staff="' + staffId + '"][data-type="notes"]');
        
        var checkIn = (checkInInput && checkInInput.value) ? checkInInput.value : '09:00';
        var checkOut = (checkOutInput && checkOutInput.value) ? checkOutInput.value : '17:00';
        var notes = (notesInput && notesInput.value) ? notesInput.value : '';
        
        newRecords.push({
            staffId: staffId,
            date: currentDate,
            status: status,
            checkIn: checkIn,
            checkOut: checkOut,
            notes: notes
        });
        
        // Check if there are changes
        var existing = null;
        for (var j = 0; j < attendanceRecords.length; j++) {
            if (attendanceRecords[j].staffId === staffId && attendanceRecords[j].date === currentDate) {
                existing = attendanceRecords[j];
                break;
            }
        }
        if (!existing || existing.status !== status || existing.checkIn !== checkIn || existing.checkOut !== checkOut || existing.notes !== notes) {
            hasChanges = true;
        }
    }
    
    if (!hasChanges) {
        showToast('No changes to save', 'info');
        return;
    }
    
    // Remove old records for this date and add new ones
    attendanceRecords = attendanceRecords.filter(function(a) { return a.date !== currentDate; });
    for (var k = 0; k < newRecords.length; k++) {
        attendanceRecords.push(newRecords[k]);
    }
    localStorage.setItem('staff_attendance', JSON.stringify(attendanceRecords));
    
    refreshUI();
    showToast('✅ Attendance saved successfully!', 'success');
}

// ─── Init ────────────────────────────────────────────

function initAttendanceModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    
    document.getElementById('loadAttendanceBtn').addEventListener('click', loadAttendance);
    document.getElementById('saveAttendanceBtn').addEventListener('click', saveAttendance);
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initAttendanceModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initAttendanceModule();
    }, 3000);
});