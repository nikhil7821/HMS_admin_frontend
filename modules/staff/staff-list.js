/**
 * Staff Management Module
 * Version: 3.0 - COMPLETE PROFESSIONAL UPGRADE
 * 
 * Features:
 * ✅ Full CRUD operations
 * ✅ Role-based filtering
 * ✅ Status management (Active/Inactive/On Leave)
 * ✅ Department tracking
 * ✅ Salary and joining date
 * ✅ Search functionality
 * ✅ Real-time stats
 * ✅ Professional UI with avatars
 */

let staffMembers = [];
let deleteTargetId = null;
let searchTerm = '';
let roleFilter = '';
let statusFilter = '';
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
    return 'STF' + Date.now() + Math.floor(Math.random() * 1000);
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

function loadStaff() {
    try {
        var stored = localStorage.getItem('staff_members');
        if (stored) {
            staffMembers = JSON.parse(stored);
        } else {
            createSampleData();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading staff:', error);
        showToast('Error loading staff data', 'error');
    }
}

function createSampleData() {
    var today = new Date().toISOString().split('T')[0];
    var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    var lastMonthStr = lastMonth.toISOString().split('T')[0];
    
    staffMembers = [
        {
            id: 1,
            staffId: 'NUR001',
            fullName: 'Priya Sharma',
            role: 'Nurse',
            department: 'ICU',
            phone: '+91 98765 43210',
            email: 'priya.sharma@medflow.com',
            joiningDate: '2023-01-15',
            salary: 35000,
            status: 'Active',
            address: 'Mumbai, Maharashtra',
            qualifications: 'B.Sc Nursing, Critical Care Certified'
        },
        {
            id: 2,
            staffId: 'REC001',
            fullName: 'Rajesh Kumar',
            role: 'Receptionist',
            department: 'Front Office',
            phone: '+91 98765 43211',
            email: 'rajesh.kumar@medflow.com',
            joiningDate: '2023-03-20',
            salary: 25000,
            status: 'Active',
            address: 'Delhi',
            qualifications: 'B.Com, Computer Proficiency'
        },
        {
            id: 3,
            staffId: 'LAB001',
            fullName: 'Sneha Patel',
            role: 'Lab Technician',
            department: 'Laboratory',
            phone: '+91 98765 43212',
            email: 'sneha.patel@medflow.com',
            joiningDate: '2023-06-10',
            salary: 30000,
            status: 'Active',
            address: 'Ahmedabad, Gujarat',
            qualifications: 'DMLT, B.Sc MLT'
        },
        {
            id: 4,
            staffId: 'RAD001',
            fullName: 'Amit Singh',
            role: 'Radiology Technician',
            department: 'Radiology',
            phone: '+91 98765 43213',
            email: 'amit.singh@medflow.com',
            joiningDate: '2023-08-05',
            salary: 32000,
            status: 'On Leave',
            address: 'Pune, Maharashtra',
            qualifications: 'B.Sc Radiology, CT Certified'
        },
        {
            id: 5,
            staffId: 'PHA001',
            fullName: 'Neha Gupta',
            role: 'Pharmacist',
            department: 'Pharmacy',
            phone: '+91 98765 43214',
            email: 'neha.gupta@medflow.com',
            joiningDate: '2023-02-28',
            salary: 38000,
            status: 'Active',
            address: 'Bangalore, Karnataka',
            qualifications: 'B.Pharm, D.Pharm'
        },
        {
            id: 6,
            staffId: 'ADM001',
            fullName: 'Dr. Arjun Mehta',
            role: 'Admin',
            department: 'Administration',
            phone: '+91 98765 43215',
            email: 'arjun.mehta@medflow.com',
            joiningDate: '2022-01-10',
            salary: 75000,
            status: 'Active',
            address: 'Mumbai, Maharashtra',
            qualifications: 'MBA, Healthcare Management'
        },
        {
            id: 7,
            staffId: 'ACC001',
            fullName: 'Kavya Nair',
            role: 'Accountant',
            department: 'Finance',
            phone: '+91 98765 43216',
            email: 'kavya.nair@medflow.com',
            joiningDate: '2023-04-15',
            salary: 40000,
            status: 'Active',
            address: 'Kochi, Kerala',
            qualifications: 'CA Inter, B.Com'
        },
        {
            id: 8,
            staffId: 'HSE001',
            fullName: 'Ramesh Yadav',
            role: 'Housekeeping',
            department: 'Housekeeping',
            phone: '+91 98765 43217',
            email: 'ramesh.yadav@medflow.com',
            joiningDate: '2023-07-01',
            salary: 18000,
            status: 'Active',
            address: 'Mumbai, Maharashtra',
            qualifications: 'High School'
        },
        {
            id: 9,
            staffId: 'NUR002',
            fullName: 'Deepa Reddy',
            role: 'Nurse',
            department: 'General Ward',
            phone: '+91 98765 43218',
            email: 'deepa.reddy@medflow.com',
            joiningDate: '2023-05-15',
            salary: 32000,
            status: 'Active',
            address: 'Hyderabad, Telangana',
            qualifications: 'B.Sc Nursing, NICU Certified'
        },
        {
            id: 10,
            staffId: 'LAB002',
            fullName: 'Vikram Patel',
            role: 'Lab Technician',
            department: 'Laboratory',
            phone: '+91 98765 43219',
            email: 'vikram.patel@medflow.com',
            joiningDate: '2023-09-01',
            salary: 28000,
            status: 'Inactive',
            address: 'Surat, Gujarat',
            qualifications: 'DMLT'
        }
    ];
    saveStaff();
}

function saveStaff() {
    try {
        localStorage.setItem('staff_members', JSON.stringify(staffMembers));
    } catch (error) {
        console.error('Error saving staff:', error);
    }
}

// ─── Stats ─────────────────────────────────────────────────────────────

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

// ─── Filter ──────────────────────────────────────────────────────────────

function getFilteredStaff() {
    var result = [];
    for (var i = 0; i < staffMembers.length; i++) {
        var s = staffMembers[i];
        var matchesSearch = searchTerm === '' || 
            s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.department && s.department.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesRole = roleFilter === '' || s.role === roleFilter;
        var matchesStatus = statusFilter === '' || s.status === statusFilter;
        if (matchesSearch && matchesRole && matchesStatus) {
            result.push(s);
        }
    }
    return result;
}

// ─── Render ──────────────────────────────────────────────────────────────

function getStatusClass(status) {
    var map = {
        'Active': 'status-badge-active',
        'Inactive': 'status-badge-inactive',
        'On Leave': 'status-badge-leave'
    };
    return map[status] || 'status-badge-active';
}

function getStatusIcon(status) {
    var map = {
        'Active': 'fa-check-circle',
        'Inactive': 'fa-times-circle',
        'On Leave': 'fa-clock'
    };
    return map[status] || 'fa-circle';
}

function renderStaff() {
    var grid = document.getElementById('staffGrid');
    if (!grid) return;
    
    var filtered = getFilteredStaff();
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No staff members found</p><p style="font-size:0.75rem; margin-top:0.25rem;">Add a staff member to get started.</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var s = filtered[i];
        var statusClass = getStatusClass(s.status);
        var statusIcon = getStatusIcon(s.status);
        var initials = s.fullName ? s.fullName.charAt(0) : 'S';
        var isActive = s.status === 'Active';
        var isLeave = s.status === 'On Leave';
        var isInactive = s.status === 'Inactive';
        
        html += '<div class="staff-card" data-id="' + s.id + '">';
        html += '<div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">';
        html += '<div class="staff-avatar">' + esc(initials) + '</div>';
        html += '<div style="flex:1; min-width:0;">';
        html += '<h3 class="staff-name">' + esc(s.fullName) + '</h3>';
        html += '<p class="staff-id">' + esc(s.staffId) + '</p>';
        html += '<span class="role-badge">' + esc(s.role) + '</span>';
        if (s.department) {
            html += '<span class="role-badge" style="background:var(--color-info-bg); color:var(--color-info-text);">' + esc(s.department) + '</span>';
        }
        html += '</div></div>';
        
        html += '<div style="display:flex; flex-direction:column; gap:0.25rem; font-size:0.6875rem; margin-bottom:0.75rem;">';
        html += '<div class="staff-info-row"><span class="label"><i class="fas fa-phone"></i> Phone:</span><span class="value">' + esc(s.phone) + '</span></div>';
        if (s.email) {
            html += '<div class="staff-info-row"><span class="label"><i class="fas fa-envelope"></i> Email:</span><span class="value" style="font-weight:var(--font-weight-light);">' + esc(s.email) + '</span></div>';
        }
        html += '<div class="staff-info-row"><span class="label"><i class="fas fa-calendar"></i> Joined:</span><span class="value">' + formatDate(s.joiningDate) + '</span></div>';
        html += '<div class="staff-info-row"><span class="label"><i class="fas fa-rupee-sign"></i> Salary:</span><span class="value">₹' + (s.salary ? s.salary.toLocaleString('en-IN') : '0') + '</span></div>';
        html += '<div class="staff-info-row"><span class="label"><i class="fas fa-circle"></i> Status:</span><span class="' + statusClass + '"><i class="fas ' + statusIcon + '" style="font-size:0.5rem;"></i> ' + s.status + '</span></div>';
        html += '</div>';
        
        if (s.qualifications) {
            html += '<div class="staff-qualifications"><i class="fas fa-graduation-cap" style="margin-right:0.25rem;"></i> ' + esc(s.qualifications) + '</div>';
        }
        
        html += '<div style="display:flex; gap:0.5rem; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">';
        html += '<button class="card-btn card-btn-primary edit-btn" data-id="' + s.id + '"><i class="fas fa-edit"></i> Edit</button>';
        html += '<button class="card-btn card-btn-danger delete-btn" data-id="' + s.id + '"><i class="fas fa-trash-alt"></i></button>';
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

// ─── Validation ─────────────────────────────────────────────────────────

function validateStaffForm() {
    var isValid = true;
    var fullName = document.getElementById('fullName').value.trim();
    var staffId = document.getElementById('staffIdNumber').value.trim();
    var role = document.getElementById('role').value;
    var phone = document.getElementById('phone').value.trim();
    var status = document.getElementById('status').value;
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function(el) { el.classList.remove('error'); });
    
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
    document.getElementById('staffForm').reset();
    document.getElementById('staffId').value = '';
    document.getElementById('status').value = 'Active';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus" style="color:var(--color-sage);"></i> Add Staff Member';
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function(el) { el.classList.remove('error'); });
    
    openModal('staffModal');
}

function openEditModal(id) {
    var staff = null;
    for (var i = 0; i < staffMembers.length; i++) {
        if (staffMembers[i].id === id) { staff = staffMembers[i]; break; }
    }
    if (!staff) return;
    
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
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Staff Member';
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function(el) { el.classList.remove('error'); });
    
    openModal('staffModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Save Staff ──────────────────────────────────────────────────────

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
            staffMembers[index] = { id: staffMembers[index].id, ...data };
            showToast('✅ Staff member updated successfully', 'success');
        }
    } else {
        var newId = staffMembers.length > 0 ? Math.max(...staffMembers.map(function(s) { return s.id; })) + 1 : 1;
        staffMembers.push({ id: newId, ...data });
        showToast('✅ Staff member added successfully', 'success');
    }
    
    saveStaff();
    refreshUI();
    closeModal('staffModal');
}

// ─── Delete ─────────────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    var staff = null;
    for (var i = 0; i < staffMembers.length; i++) {
        if (staffMembers[i].id === deleteTargetId) { staff = staffMembers[i]; break; }
    }
    
    staffMembers = staffMembers.filter(function(s) { return s.id !== deleteTargetId; });
    saveStaff();
    refreshUI();
    closeModal('deleteModal');
    
    if (staff) {
        showToast('🗑️ ' + esc(staff.fullName) + ' deleted successfully', 'success');
    }
    deleteTargetId = null;
}

// ─── Init ──────────────────────────────────────────────────────────────

function initStaffModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadStaff();
    
    // Event Listeners
    document.getElementById('addStaffBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn').addEventListener('click', function() { closeModal('staffModal'); });
    document.getElementById('cancelModalBtn').addEventListener('click', function() { closeModal('staffModal'); });
    document.getElementById('closeDeleteModalBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('staffForm').addEventListener('submit', saveStaffMember);
    document.getElementById('refreshBtn').addEventListener('click', function() { refreshUI(); showToast('Refreshed', 'info'); });
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        roleFilter = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('roleFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderStaff();
        showToast('Filters reset', 'info');
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
    
    // Real-time validation
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
    
    // Close modals on overlay click
    document.getElementById('staffModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('staffModal');
    });
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('staffModal');
            closeModal('deleteModal');
        }
    });
    
    console.log('👥 Staff Management Module initialized successfully');
}

// ─── Auto-init ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkReady = setInterval(function() {
        if (document.getElementById('mainSidebar') && document.getElementById('header-container')) {
            clearInterval(checkReady);
            initStaffModule();
        }
    }, 100);
    
    setTimeout(function() {
        if (!isInitialized) {
            initStaffModule();
        }
    }, 2000);
});

// ─── Expose for debugging ─────────────────────────────────────────────

window.staffModule = {
    staffMembers: staffMembers,
    refreshUI: refreshUI,
    addStaff: openAddModal,
    editStaff: openEditModal,
    deleteStaff: openDeleteModal
};