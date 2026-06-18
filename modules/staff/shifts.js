/**
 * Shifts Management JS - Staff Module
 * Uses theme.css for styling, clean event handling
 */

var shifts = [];
var staffMembers = [];
var deleteTargetId = null;
var searchTerm = '';
var shiftFilter = '';
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
        var stored = localStorage.getItem('staff_shifts');
        if (stored) {
            shifts = JSON.parse(stored);
        } else {
            shifts = [
                {id: 1, staffId: 1, staffName: 'Priya Sharma', role: 'Nurse', shiftType: 'Morning', shiftTime: '7:00 AM - 3:00 PM', day: 'Monday'},
                {id: 2, staffId: 2, staffName: 'Rajesh Kumar', role: 'Receptionist', shiftType: 'General', shiftTime: '9:00 AM - 5:00 PM', day: 'Monday'},
                {id: 3, staffId: 3, staffName: 'Sneha Patel', role: 'Lab Technician', shiftType: 'Evening', shiftTime: '3:00 PM - 11:00 PM', day: 'Tuesday'},
                {id: 4, staffId: 4, staffName: 'Amit Singh', role: 'Radiology Technician', shiftType: 'Night', shiftTime: '11:00 PM - 7:00 AM', day: 'Wednesday'},
                {id: 5, staffId: 5, staffName: 'Neha Gupta', role: 'Pharmacist', shiftType: 'Morning', shiftTime: '7:00 AM - 3:00 PM', day: 'Thursday'}
            ];
            saveShifts();
        }
        refreshUI();
        populateStaffSelect();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading shift data', 'error');
    }
}

function saveShifts() {
    try {
        localStorage.setItem('staff_shifts', JSON.stringify(shifts));
    } catch (error) {
        console.error('Error saving shifts:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    var totalShifts = shifts.length;
    var staffIds = {};
    for (var i = 0; i < shifts.length; i++) {
        staffIds[shifts[i].staffId] = true;
    }
    var staffAssigned = Object.keys(staffIds).length;
    var morningCount = 0, nightCount = 0;
    for (var j = 0; j < shifts.length; j++) {
        if (shifts[j].shiftType === 'Morning') morningCount++;
        if (shifts[j].shiftType === 'Night') nightCount++;
    }
    
    document.getElementById('totalShifts').textContent = totalShifts;
    document.getElementById('staffAssigned').textContent = staffAssigned;
    document.getElementById('morningCount').textContent = morningCount;
    document.getElementById('nightCount').textContent = nightCount;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredShifts() {
    return shifts.filter(function(s) {
        var matchesSearch = searchTerm === '' || 
            s.staffName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.role.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesShift = shiftFilter === '' || s.shiftType === shiftFilter;
        return matchesSearch && matchesShift;
    });
}

// ─── Render ──────────────────────────────────────────

function getShiftClass(type) {
    var map = {
        'Morning': 'shift-morning',
        'Evening': 'shift-evening',
        'Night': 'shift-night',
        'General': 'shift-general'
    };
    return map[type] || 'shift-general';
}

function renderTable() {
    var tbody = document.getElementById('shiftsTable');
    if (!tbody) return;
    
    var filtered = getFilteredShifts();
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:3rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-clock" style="font-size:2rem; margin-bottom:0.75rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No shifts assigned</p></td></tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var s = filtered[i];
        var shiftClass = getShiftClass(s.shiftType);
        var timeParts = s.shiftTime ? s.shiftTime.split(' - ') : ['-', '-'];
        var startTime = timeParts[0] || '-';
        var endTime = timeParts[1] || '-';
        
        html += '<tr class="shift-row" data-id="' + s.id + '">';
        html += '<td class="staff-name">' + esc(s.staffName) + '</td>';
        html += '<td class="staff-role">' + esc(s.role) + '</td>';
        html += '<td><span class="' + shiftClass + '">' + s.shiftType + '</span></td>';
        html += '<td class="shift-time">' + startTime + '</td>';
        html += '<td class="shift-time">' + endTime + '</td>';
        html += '<td><span class="day-badge">' + s.day + '</span></td>';
        html += '<td style="text-align:center;"><div style="display:flex; gap:0.375rem; justify-content:center;">';
        html += '<button class="action-btn edit edit-btn" data-id="' + s.id + '" title="Edit Shift"><i class="fas fa-edit"></i></button>';
        html += '<button class="action-btn delete delete-btn" data-id="' + s.id + '" title="Delete Shift"><i class="fas fa-trash-alt"></i></button>';
        html += '</div></td></tr>';
    }
    tbody.innerHTML = html;
    
    // Bind events
    tbody.querySelectorAll('.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openEditModal(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(parseInt(this.dataset.id)); });
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Populate Staff Select ──────────────────────────

function populateStaffSelect() {
    var select = document.getElementById('staffId');
    if (select) {
        var activeStaff = staffMembers.filter(function(s) { return s.status === 'Active'; });
        var html = '<option value="">-- Select Staff --</option>';
        for (var i = 0; i < activeStaff.length; i++) {
            html += '<option value="' + activeStaff[i].id + '">' + esc(activeStaff[i].fullName) + ' (' + esc(activeStaff[i].role) + ' - ' + activeStaff[i].staffId + ')</option>';
        }
        select.innerHTML = html;
    }
}

// ─── Validation ──────────────────────────────────────

function validateShiftForm() {
    var isValid = true;
    
    var staffId = document.getElementById('staffId').value;
    var shiftType = document.getElementById('shiftType').value;
    var day = document.getElementById('day').value;
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-select').forEach(function(el) { el.classList.remove('error'); });
    
    if (!staffId) {
        document.getElementById('staffIdError').classList.add('show');
        document.getElementById('staffId').classList.add('error');
        isValid = false;
    }
    if (!shiftType) {
        document.getElementById('shiftTypeError').classList.add('show');
        document.getElementById('shiftType').classList.add('error');
        isValid = false;
    }
    if (!day) {
        document.getElementById('dayError').classList.add('show');
        document.getElementById('day').classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// ─── Modals ──────────────────────────────────────────

function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('active'); }
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('active'); }
}

function openAddModal() {
    document.getElementById('shiftForm').reset();
    document.getElementById('shiftId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-clock"></i> Assign Shift';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-select').forEach(function(el) { el.classList.remove('error'); });
    populateStaffSelect();
    openModal('shiftModal');
}

function openEditModal(id) {
    var shift = null;
    for (var i = 0; i < shifts.length; i++) {
        if (shifts[i].id === id) { shift = shifts[i]; break; }
    }
    if (shift) {
        document.getElementById('shiftId').value = shift.id;
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Shift';
        populateStaffSelect();
        setTimeout(function() {
            document.getElementById('staffId').value = shift.staffId;
        }, 50);
        document.getElementById('shiftType').value = shift.shiftType;
        document.getElementById('day').value = shift.day;
        document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
        document.querySelectorAll('.form-select').forEach(function(el) { el.classList.remove('error'); });
        openModal('shiftModal');
    }
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveShift(e) {
    e.preventDefault();
    
    if (!validateShiftForm()) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    var id = document.getElementById('shiftId').value;
    var staffId = parseInt(document.getElementById('staffId').value);
    var staff = null;
    for (var i = 0; i < staffMembers.length; i++) {
        if (staffMembers[i].id === staffId) { staff = staffMembers[i]; break; }
    }
    var shiftType = document.getElementById('shiftType').value;
    var day = document.getElementById('day').value;
    
    var shiftTimes = {
        'Morning': '7:00 AM - 3:00 PM',
        'Evening': '3:00 PM - 11:00 PM',
        'Night': '11:00 PM - 7:00 AM',
        'General': '9:00 AM - 5:00 PM'
    };
    
    // Check for duplicate shift
    if (!id) {
        var existingShift = null;
        for (var j = 0; j < shifts.length; j++) {
            if (shifts[j].staffId === staffId && shifts[j].day === day) {
                existingShift = shifts[j];
                break;
            }
        }
        if (existingShift) {
            showToast((staff ? staff.fullName : 'Staff') + ' already has a shift on ' + day, 'error');
            return;
        }
    }
    
    var data = {
        staffId: staffId,
        staffName: staff ? staff.fullName : '',
        role: staff ? staff.role : '',
        shiftType: shiftType,
        shiftTime: shiftTimes[shiftType] || '',
        day: day
    };
    
    if (id) {
        var index = -1;
        for (var k = 0; k < shifts.length; k++) {
            if (shifts[k].id === parseInt(id)) { index = k; break; }
        }
        if (index !== -1) {
            shifts[index] = { id: shifts[index].id, staffId: staffId, staffName: staff ? staff.fullName : '', role: staff ? staff.role : '', shiftType: shiftType, shiftTime: shiftTimes[shiftType] || '', day: day };
            showToast('✅ Shift updated successfully', 'success');
        }
    } else {
        var newId = 1;
        for (var m = 0; m < shifts.length; m++) {
            if (shifts[m].id >= newId) newId = shifts[m].id + 1;
        }
        shifts.push({ id: newId, staffId: staffId, staffName: staff ? staff.fullName : '', role: staff ? staff.role : '', shiftType: shiftType, shiftTime: shiftTimes[shiftType] || '', day: day });
        showToast('✅ Shift assigned successfully', 'success');
    }
    
    saveShifts();
    refreshUI();
    closeModal('shiftModal');
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    shifts = shifts.filter(function(s) { return s.id !== deleteTargetId; });
    saveShifts();
    refreshUI();
    closeModal('deleteModal');
    showToast('🗑️ Shift deleted successfully', 'success');
    deleteTargetId = null;
}

// ─── Init ────────────────────────────────────────────

function initShiftsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    
    document.getElementById('addShiftBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn').addEventListener('click', function() { closeModal('shiftModal'); });
    document.getElementById('cancelModalBtn').addEventListener('click', function() { closeModal('shiftModal'); });
    document.getElementById('closeDeleteModalBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('shiftForm').addEventListener('submit', saveShift);
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        shiftFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('shiftFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('shiftFilter').addEventListener('change', function(e) {
        shiftFilter = e.target.value;
        renderTable();
    });
    
    document.getElementById('staffId').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('staffIdError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    document.getElementById('shiftType').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('shiftTypeError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    document.getElementById('day').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('dayError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('shiftModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('shiftModal');
    });
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('shiftModal');
            closeModal('deleteModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initShiftsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initShiftsModule();
    }, 3000);
});

// ─── Expose ────────────────────────────────────────────

window.editShift = openEditModal;
window.deleteShift = openDeleteModal;