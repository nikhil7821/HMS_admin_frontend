/**
 * Staff Management JS - Staff Module
 * Uses theme.css for styling, clean event handling
 */

var staffMembers = [];
var deleteTargetId = null;
var searchTerm = '';
var roleFilter = '';
var statusFilter = '';
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

function loadStaff() {
    try {
        var stored = localStorage.getItem('staff_members');
        if (stored) {
            staffMembers = JSON.parse(stored);
        } else {
            staffMembers = [
                {id: 1, staffId: 'NUR001', fullName: 'Priya Sharma', role: 'Nurse', department: 'ICU', phone: '+91 98765 43210', email: 'priya.sharma@medflow.com', joiningDate: '2023-01-15', salary: 35000, status: 'Active', address: 'Mumbai', qualifications: 'B.Sc Nursing, Critical Care Certified'},
                {id: 2, staffId: 'REC001', fullName: 'Rajesh Kumar', role: 'Receptionist', department: 'Front Office', phone: '+91 98765 43211', email: 'rajesh.kumar@medflow.com', joiningDate: '2023-03-20', salary: 25000, status: 'Active', address: 'Delhi', qualifications: 'B.Com, Computer Proficiency'},
                {id: 3, staffId: 'LAB001', fullName: 'Sneha Patel', role: 'Lab Technician', department: 'Laboratory', phone: '+91 98765 43212', email: 'sneha.patel@medflow.com', joiningDate: '2023-06-10', salary: 30000, status: 'Active', address: 'Ahmedabad', qualifications: 'DMLT, B.Sc MLT'},
                {id: 4, staffId: 'RAD001', fullName: 'Amit Singh', role: 'Radiology Technician', department: 'Radiology', phone: '+91 98765 43213', email: 'amit.singh@medflow.com', joiningDate: '2023-08-05', salary: 32000, status: 'On Leave', address: 'Pune', qualifications: 'B.Sc Radiology'},
                {id: 5, staffId: 'PHA001', fullName: 'Neha Gupta', role: 'Pharmacist', department: 'Pharmacy', phone: '+91 98765 43214', email: 'neha.gupta@medflow.com', joiningDate: '2023-02-28', salary: 38000, status: 'Active', address: 'Bangalore', qualifications: 'B.Pharm, D.Pharm'},
                {id: 6, staffId: 'ADM001', fullName: 'Dr. Arjun Mehta', role: 'Admin', department: 'Administration', phone: '+91 98765 43215', email: 'arjun.mehta@medflow.com', joiningDate: '2022-01-10', salary: 75000, status: 'Active', address: 'Mumbai', qualifications: 'MBA, Healthcare Management'},
                {id: 7, staffId: 'ACC001', fullName: 'Kavya Nair', role: 'Accountant', department: 'Finance', phone: '+91 98765 43216', email: 'kavya.nair@medflow.com', joiningDate: '2023-04-15', salary: 40000, status: 'Active', address: 'Kochi', qualifications: 'CA Inter, B.Com'},
                {id: 8, staffId: 'HSE001', fullName: 'Ramesh Yadav', role: 'Housekeeping', department: 'Housekeeping', phone: '+91 98765 43217', email: 'ramesh.yadav@medflow.com', joiningDate: '2023-07-01', salary: 18000, status: 'Active', address: 'Mumbai', qualifications: 'High School'}
            ];
            saveStaff();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading staff:', error);
        showToast('Error loading staff data', 'error');
    }
}

function saveStaff() {
    try {
        localStorage.setItem('staff_members', JSON.stringify(staffMembers));
    } catch (error) {
        console.error('Error saving staff:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    var total = staffMembers.length;
    var active = 0, onLeave = 0;
    var depts = {};
    for (var i = 0; i < staffMembers.length; i++) {
        if (staffMembers[i].status === 'Active') active++;
        if (staffMembers[i].status === 'On Leave') onLeave++;
        if (staffMembers[i].department) {
            depts[staffMembers[i].department] = true;
        }
    }
    var deptCount = Object.keys(depts).length;
    
    document.getElementById('totalStaff').textContent = total;
    document.getElementById('activeStaff').textContent = active;
    document.getElementById('totalDepts').textContent = deptCount;
    document.getElementById('onLeave').textContent = onLeave;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredStaff() {
    return staffMembers.filter(function(s) {
        var matchesSearch = searchTerm === '' || 
            s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.department && s.department.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesRole = roleFilter === '' || s.role === roleFilter;
        var matchesStatus = statusFilter === '' || s.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });
}

// ─── Render ──────────────────────────────────────────

function getStatusClass(status) {
    var map = {
        'Active': 'status-badge-active',
        'Inactive': 'status-badge-inactive',
        'On Leave': 'status-badge-leave'
    };
    return map[status] || 'status-badge-active';
}

function renderStaff() {
    var grid = document.getElementById('staffGrid');
    if (!grid) return;
    
    var filtered = getFilteredStaff();
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-users" style="font-size:2rem; margin-bottom:0.75rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No staff members found</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var s = filtered[i];
        var statusClass = getStatusClass(s.status);
        var initials = s.fullName ? s.fullName.charAt(0) : 'S';
        
        html += '<div class="staff-card">';
        html += '<div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">';
        html += '<div class="staff-avatar">' + initials + '</div>';
        html += '<div style="flex:1; min-width:0;"><h3 class="staff-name">' + esc(s.fullName) + '</h3>';
        html += '<p class="staff-id">' + esc(s.staffId) + '</p>';
        html += '<span class="role-badge">' + esc(s.role) + '</span></div></div>';
        
        html += '<div style="display:flex; flex-direction:column; gap:0.25rem; font-size:0.6875rem; margin-bottom:0.75rem;">';
        html += '<div class="staff-info-row"><span class="label"><i class="fas fa-building"></i> Dept:</span><span class="value">' + (s.department ? esc(s.department) : '-') + '</span></div>';
        html += '<div class="staff-info-row"><span class="label"><i class="fas fa-phone"></i> Phone:</span><span class="value">' + esc(s.phone) + '</span></div>';
        html += '<div class="staff-info-row"><span class="label"><i class="fas fa-calendar"></i> Joined:</span><span class="value">' + (s.joiningDate || '-') + '</span></div>';
        html += '<div class="staff-info-row"><span class="label"><i class="fas fa-rupee-sign"></i> Salary:</span><span class="value">₹' + (s.salary ? s.salary.toLocaleString('en-IN') : '0') + '</span></div>';
        html += '<div class="staff-info-row"><span class="label"><i class="fas fa-circle"></i> Status:</span><span class="' + statusClass + '">' + s.status + '</span></div>';
        html += '</div>';
        
        if (s.qualifications) {
            html += '<div class="staff-qualifications">' + esc(s.qualifications) + '</div>';
        }
        
        html += '<div style="display:flex; gap:0.5rem; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">';
        html += '<button class="card-btn card-btn-primary edit-btn" data-id="' + s.id + '"><i class="fas fa-edit"></i> Edit</button>';
        html += '<button class="card-btn card-btn-danger delete-btn" data-id="' + s.id + '"><i class="fas fa-trash-alt"></i> Delete</button>';
        html += '</div></div>';
    }
    grid.innerHTML = html;
    
    // Bind events
    grid.querySelectorAll('.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openEditModal(parseInt(this.dataset.id)); });
    });
    grid.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(parseInt(this.dataset.id)); });
    });
}

function refreshUI() {
    updateStats();
    renderStaff();
}

// ─── Validation ──────────────────────────────────────

function validateStaffForm() {
    var isValid = true;
    
    var fullName = document.getElementById('fullName').value.trim();
    var staffId = document.getElementById('staffIdNumber').value.trim();
    var role = document.getElementById('role').value;
    var phone = document.getElementById('phone').value.trim();
    var status = document.getElementById('status').value;
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    
    if (!fullName) {
        document.getElementById('fullNameError').classList.add('show');
        document.getElementById('fullName').classList.add('error');
        isValid = false;
    }
    if (!staffId) {
        document.getElementById('staffIdError').classList.add('show');
        document.getElementById('staffIdNumber').classList.add('error');
        isValid = false;
    }
    if (!role) {
        document.getElementById('roleError').classList.add('show');
        document.getElementById('role').classList.add('error');
        isValid = false;
    }
    if (!phone) {
        document.getElementById('phoneError').classList.add('show');
        document.getElementById('phone').classList.add('error');
        isValid = false;
    }
    if (!status) {
        document.getElementById('statusError').classList.add('show');
        document.getElementById('status').classList.add('error');
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
    document.getElementById('staffForm').reset();
    document.getElementById('staffId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add Staff Member';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    openModal('staffModal');
}

function openEditModal(id) {
    var staff = null;
    for (var i = 0; i < staffMembers.length; i++) {
        if (staffMembers[i].id === id) { staff = staffMembers[i]; break; }
    }
    if (staff) {
        document.getElementById('staffId').value = staff.id;
        document.getElementById('fullName').value = staff.fullName;
        document.getElementById('staffIdNumber').value = staff.staffId;
        document.getElementById('role').value = staff.role;
        document.getElementById('department').value = staff.department || '';
        document.getElementById('phone').value = staff.phone;
        document.getElementById('email').value = staff.email || '';
        document.getElementById('joiningDate').value = staff.joiningDate || '';
        document.getElementById('salary').value = staff.salary || '';
        document.getElementById('status').value = staff.status;
        document.getElementById('address').value = staff.address || '';
        document.getElementById('qualifications').value = staff.qualifications || '';
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Staff Member';
        document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
        document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
        openModal('staffModal');
    }
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveStaffMember(e) {
    e.preventDefault();
    
    if (!validateStaffForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    var id = document.getElementById('staffId').value;
    var data = {
        fullName: document.getElementById('fullName').value.trim(),
        staffId: document.getElementById('staffIdNumber').value.trim(),
        role: document.getElementById('role').value,
        department: document.getElementById('department').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        joiningDate: document.getElementById('joiningDate').value,
        salary: parseInt(document.getElementById('salary').value) || 0,
        status: document.getElementById('status').value,
        address: document.getElementById('address').value.trim(),
        qualifications: document.getElementById('qualifications').value.trim()
    };
    
    if (id) {
        var index = -1;
        for (var i = 0; i < staffMembers.length; i++) {
            if (staffMembers[i].id === parseInt(id)) { index = i; break; }
        }
        if (index !== -1) {
            staffMembers[index] = { id: staffMembers[index].id, staffId: data.staffId, fullName: data.fullName, role: data.role, department: data.department, phone: data.phone, email: data.email, joiningDate: data.joiningDate, salary: data.salary, status: data.status, address: data.address, qualifications: data.qualifications };
            showToast('✅ Staff member updated successfully', 'success');
        }
    } else {
        var newId = 1;
        for (var j = 0; j < staffMembers.length; j++) {
            if (staffMembers[j].id >= newId) newId = staffMembers[j].id + 1;
        }
        staffMembers.push({ id: newId, staffId: data.staffId, fullName: data.fullName, role: data.role, department: data.department, phone: data.phone, email: data.email, joiningDate: data.joiningDate, salary: data.salary, status: data.status, address: data.address, qualifications: data.qualifications });
        showToast('✅ Staff member added successfully', 'success');
    }
    
    saveStaff();
    refreshUI();
    closeModal('staffModal');
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    staffMembers = staffMembers.filter(function(s) { return s.id !== deleteTargetId; });
    saveStaff();
    refreshUI();
    closeModal('deleteModal');
    showToast('🗑️ Staff member deleted successfully', 'success');
    deleteTargetId = null;
}

// ─── Init ────────────────────────────────────────────

function initStaffModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadStaff();
    
    document.getElementById('addStaffBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn').addEventListener('click', function() { closeModal('staffModal'); });
    document.getElementById('cancelModalBtn').addEventListener('click', function() { closeModal('staffModal'); });
    document.getElementById('closeDeleteModalBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('staffForm').addEventListener('submit', saveStaffMember);
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        roleFilter = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('roleFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderStaff();
    });
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderStaff();
    });
    
    document.getElementById('roleFilter').addEventListener('change', function(e) {
        roleFilter = e.target.value;
        renderStaff();
    });
    
    document.getElementById('statusFilter').addEventListener('change', function(e) {
        statusFilter = e.target.value;
        renderStaff();
    });
    
    document.getElementById('fullName').addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('fullNameError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    document.getElementById('staffIdNumber').addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('staffIdError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    document.getElementById('role').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('roleError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    document.getElementById('phone').addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('phoneError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    document.getElementById('status').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('statusError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('staffModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('staffModal');
    });
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('staffModal');
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
            setTimeout(initStaffModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initStaffModule();
    }, 3000);
});

// ─── Expose ────────────────────────────────────────────

window.editStaff = openEditModal;
window.deleteStaff = openDeleteModal;