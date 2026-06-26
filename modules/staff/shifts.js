/**
 * Shifts Management Module
 * Version: 3.0 - COMPLETE PROFESSIONAL UPGRADE
 * 
 * Features:
 * ✅ Full CRUD operations
 * ✅ Staff linkage with active status filter
 * ✅ Shift type management (Morning/Evening/Night/General)
 * ✅ Day of week assignment
 * ✅ Duplicate shift prevention
 * ✅ Search and filter
 * ✅ Real-time stats
 * ✅ Professional UI with table
 */

let shifts = [];
let staffMembers = [];
let deleteTargetId = null;
let searchTerm = '';
let shiftFilter = '';
let dayFilter = '';
let isInitialized = false;

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

function generateId() {
    return 'SHF' + Date.now() + Math.floor(Math.random() * 1000);
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

function loadData() {
    try {
        // Load staff members
        var storedStaff = localStorage.getItem('staff_members');
        if (storedStaff) {
            staffMembers = JSON.parse(storedStaff);
        } else {
            staffMembers = [];
        }
        
        // Load shifts
        var stored = localStorage.getItem('staff_shifts');
        if (stored) {
            shifts = JSON.parse(stored);
        } else {
            createSampleData();
        }
        
        refreshUI();
        populateStaffSelect();
    } catch (error) {
        console.error('Error loading shift data:', error);
        showToast('Error loading shift data', 'error');
    }
}

function createSampleData() {
    shifts = [
        { id: 1, staffId: 1, staffName: 'Priya Sharma', role: 'Nurse', shiftType: 'Morning', shiftTime: '7:00 AM - 3:00 PM', day: 'Monday' },
        { id: 2, staffId: 2, staffName: 'Rajesh Kumar', role: 'Receptionist', shiftType: 'General', shiftTime: '9:00 AM - 5:00 PM', day: 'Monday' },
        { id: 3, staffId: 3, staffName: 'Sneha Patel', role: 'Lab Technician', shiftType: 'Evening', shiftTime: '3:00 PM - 11:00 PM', day: 'Tuesday' },
        { id: 4, staffId: 4, staffName: 'Amit Singh', role: 'Radiology Technician', shiftType: 'Night', shiftTime: '11:00 PM - 7:00 AM', day: 'Wednesday' },
        { id: 5, staffId: 5, staffName: 'Neha Gupta', role: 'Pharmacist', shiftType: 'Morning', shiftTime: '7:00 AM - 3:00 PM', day: 'Thursday' },
        { id: 6, staffId: 1, staffName: 'Priya Sharma', role: 'Nurse', shiftType: 'Evening', shiftTime: '3:00 PM - 11:00 PM', day: 'Friday' },
        { id: 7, staffId: 6, staffName: 'Dr. Arjun Mehta', role: 'Admin', shiftType: 'General', shiftTime: '9:00 AM - 5:00 PM', day: 'Monday' },
        { id: 8, staffId: 7, staffName: 'Kavya Nair', role: 'Accountant', shiftType: 'Morning', shiftTime: '7:00 AM - 3:00 PM', day: 'Tuesday' }
    ];
    saveShifts();
}

function saveShifts() {
    try {
        localStorage.setItem('staff_shifts', JSON.stringify(shifts));
    } catch (error) {
        console.error('Error saving shifts:', error);
    }
}

// ─── Stats ─────────────────────────────────────────────────────────────

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

// ─── Populate Staff Select ─────────────────────────────────────────────

function populateStaffSelect() {
    var select = document.getElementById('staffId');
    if (!select) return;
    
    // Only show active staff members
    var activeStaff = staffMembers.filter(function(s) { return s.status === 'Active'; });
    var html = '<option value="">-- Select Staff --</option>';
    for (var i = 0; i < activeStaff.length; i++) {
        html += '<option value="' + activeStaff[i].id + '">' + esc(activeStaff[i].fullName) + ' (' + esc(activeStaff[i].role) + ' - ' + activeStaff[i].staffId + ')</option>';
    }
    select.innerHTML = html;
}

// ─── Filter ──────────────────────────────────────────────────────────────

function getFilteredShifts() {
    var result = [];
    for (var i = 0; i < shifts.length; i++) {
        var s = shifts[i];
        var matchesSearch = searchTerm === '' || 
            s.staffName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.role.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesShift = shiftFilter === '' || s.shiftType === shiftFilter;
        var matchesDay = dayFilter === '' || s.day === dayFilter;
        if (matchesSearch && matchesShift && matchesDay) {
            result.push(s);
        }
    }
    return result;
}

// ─── Render ──────────────────────────────────────────────────────────────

function getShiftClass(type) {
    var map = {
        'Morning': 'shift-morning',
        'Evening': 'shift-evening',
        'Night': 'shift-night',
        'General': 'shift-general'
    };
    return map[type] || 'shift-general';
}

function getShiftIcon(type) {
    var map = {
        'Morning': 'fa-sun',
        'Evening': 'fa-cloud',
        'Night': 'fa-moon',
        'General': 'fa-building'
    };
    return map[type] || 'fa-clock';
}

function renderTable() {
    var tbody = document.getElementById('shiftsTable');
    if (!tbody) return;
    
    var filtered = getFilteredShifts();
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-clock"></i><p>No shifts assigned</p><p style="font-size:0.75rem; margin-top:0.25rem;">Assign a shift to get started.</p></td></tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var s = filtered[i];
        var shiftClass = getShiftClass(s.shiftType);
        var shiftIcon = getShiftIcon(s.shiftType);
        var timeParts = s.shiftTime ? s.shiftTime.split(' - ') : ['-', '-'];
        var startTime = timeParts[0] || '-';
        var endTime = timeParts[1] || '-';
        
        html += '<tr class="shift-row" data-id="' + s.id + '">';
        html += '<td class="staff-name">' + esc(s.staffName) + '</td>';
        html += '<td class="staff-role">' + esc(s.role) + '</td>';
        html += '<td><span class="' + shiftClass + '"><i class="fas ' + shiftIcon + '" style="margin-right:0.25rem;"></i>' + s.shiftType + '</span></td>';
        html += '<td class="shift-time">' + startTime + ' → ' + endTime + '</td>';
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

// ─── Validation ─────────────────────────────────────────────────────────

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

// ─── Modals ──────────────────────────────────────────────────────────────

function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}

function openAddModal() {
    document.getElementById('shiftForm').reset();
    document.getElementById('shiftId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-clock" style="color:var(--color-sage);"></i> Assign Shift';
    
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
    if (!shift) return;
    
    document.getElementById('shiftId').value = shift.id;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Shift';
    
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

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Save Shift ──────────────────────────────────────────────────────

function saveShift(e) {
    e.preventDefault();
    if (!validateShiftForm()) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    var id = document.getElementById('shiftId').value;
    var staffId = parseInt(document.getElementById('staffId').value);
    var shiftType = document.getElementById('shiftType').value;
    var day = document.getElementById('day').value;
    
    // Find staff member
    var staff = null;
    for (var i = 0; i < staffMembers.length; i++) {
        if (staffMembers[i].id === staffId) { staff = staffMembers[i]; break; }
    }
    if (!staff) {
        showToast('Staff member not found', 'error');
        return;
    }
    
    var shiftTimes = {
        'Morning': '7:00 AM - 3:00 PM',
        'Evening': '3:00 PM - 11:00 PM',
        'Night': '11:00 PM - 7:00 AM',
        'General': '9:00 AM - 5:00 PM'
    };
    
    // Check for duplicate shift (only for new shifts)
    if (!id) {
        var existingShift = null;
        for (var j = 0; j < shifts.length; j++) {
            if (shifts[j].staffId === staffId && shifts[j].day === day) {
                existingShift = shifts[j];
                break;
            }
        }
        if (existingShift) {
            showToast(staff.fullName + ' already has a shift on ' + day, 'error');
            return;
        }
    }
    
    var data = {
        staffId: staffId,
        staffName: staff.fullName,
        role: staff.role,
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
            shifts[index] = { id: shifts[index].id, ...data };
            showToast('✅ Shift updated successfully', 'success');
        }
    } else {
        var newId = shifts.length > 0 ? Math.max(...shifts.map(function(s) { return s.id; })) + 1 : 1;
        shifts.push({ id: newId, ...data });
        showToast('✅ Shift assigned successfully', 'success');
    }
    
    saveShifts();
    refreshUI();
    closeModal('shiftModal');
}

// ─── Delete ─────────────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    var shift = null;
    for (var i = 0; i < shifts.length; i++) {
        if (shifts[i].id === deleteTargetId) { shift = shifts[i]; break; }
    }
    
    shifts = shifts.filter(function(s) { return s.id !== deleteTargetId; });
    saveShifts();
    refreshUI();
    closeModal('deleteModal');
    
    if (shift) {
        showToast('🗑️ Shift for ' + esc(shift.staffName) + ' deleted successfully', 'success');
    }
    deleteTargetId = null;
}

// ─── Init ──────────────────────────────────────────────────────────────

function initShiftsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    
    // Event Listeners
    document.getElementById('addShiftBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn').addEventListener('click', function() { closeModal('shiftModal'); });
    document.getElementById('cancelModalBtn').addEventListener('click', function() { closeModal('shiftModal'); });
    document.getElementById('closeDeleteModalBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('shiftForm').addEventListener('submit', saveShift);
    document.getElementById('refreshBtn').addEventListener('click', function() { refreshUI(); showToast('Refreshed', 'info'); });
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        shiftFilter = '';
        dayFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('shiftFilter').value = '';
        document.getElementById('dayFilter').value = '';
        renderTable();
        showToast('Filters reset', 'info');
    });
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('shiftFilter').addEventListener('change', function(e) {
        shiftFilter = e.target.value;
        renderTable();
    });
    
    document.getElementById('dayFilter').addEventListener('change', function(e) {
        dayFilter = e.target.value;
        renderTable();
    });
    
    // Real-time validation
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
    
    // Close modals on overlay click
    document.getElementById('shiftModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('shiftModal');
    });
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('shiftModal');
            closeModal('deleteModal');
        }
    });
    
    console.log('🕐 Shifts Management Module initialized successfully');
}

// ─── Auto-init ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkReady = setInterval(function() {
        if (document.getElementById('mainSidebar') && document.getElementById('header-container')) {
            clearInterval(checkReady);
            initShiftsModule();
        }
    }, 100);
    
    setTimeout(function() {
        if (!isInitialized) {
            initShiftsModule();
        }
    }, 2000);
});

// ─── Expose for debugging ─────────────────────────────────────────────

window.shiftsModule = {
    shifts: shifts,
    staffMembers: staffMembers,
    refreshUI: refreshUI,
    addShift: openAddModal,
    editShift: openEditModal,
    deleteShift: openDeleteModal
};