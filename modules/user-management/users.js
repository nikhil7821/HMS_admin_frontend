/**
 * Users Management JS - User Management Module
 * Indian Names, Rupee Symbol, Professional UI
 */

let users = [];
let roles = [];
let departments = [];
let deleteId = null;
let resetUserId = null;

// ==================== LOAD DATA ====================
function loadData() {
    roles = JSON.parse(localStorage.getItem('system_roles') || '[]');
    departments = JSON.parse(localStorage.getItem('system_departments') || '[]');
    
    const stored = localStorage.getItem('system_users');
    if(stored) {
        users = JSON.parse(stored);
    } else {
        // Default Indian users data
        users = [
            {id: 1, fullName: 'Dr. Arjun Mehta', email: 'arjun.mehta@medflow.com', roleId: 1, roleName: 'Admin', departmentId: 1, departmentName: 'Administration', phone: '+91 98765 43210', status: 'Active', lastLogin: '2026-06-10 09:30:00', createdAt: '2024-01-01'},
            {id: 2, fullName: 'Dr. Anjali Nair', email: 'anjali.nair@medflow.com', roleId: 2, roleName: 'Doctor', departmentId: 2, departmentName: 'Cardiology', phone: '+91 98765 43211', status: 'Active', lastLogin: '2026-06-10 10:00:00', createdAt: '2024-01-15'},
            {id: 3, fullName: 'Priya Sharma', email: 'priya.sharma@medflow.com', roleId: 3, roleName: 'Nurse', departmentId: 3, departmentName: 'ICU', phone: '+91 98765 43212', status: 'Active', lastLogin: '2026-06-09 08:00:00', createdAt: '2024-02-01'},
            {id: 4, fullName: 'Rajesh Kumar', email: 'rajesh.kumar@medflow.com', roleId: 4, roleName: 'Receptionist', departmentId: 4, departmentName: 'Front Office', phone: '+91 98765 43213', status: 'Inactive', lastLogin: '2026-06-05 17:00:00', createdAt: '2024-03-01'},
            {id: 5, fullName: 'Dr. Sneha Joshi', email: 'sneha.joshi@medflow.com', roleId: 2, roleName: 'Doctor', departmentId: 5, departmentName: 'Pediatrics', phone: '+91 98765 43214', status: 'Active', lastLogin: '2026-06-10 11:30:00', createdAt: '2024-04-01'}
        ];
        saveUsers();
    }
    updateStats();
    populateFilters();
    renderUsers();
}

function saveUsers() {
    localStorage.setItem('system_users', JSON.stringify(users));
}

// ==================== STATISTICS ====================
function updateStats() {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const today = new Date().toISOString().split('T')[0];
    const todayLogin = users.filter(u => u.lastLogin && u.lastLogin.startsWith(today)).length;
    
    document.getElementById('totalUsers').innerText = total;
    document.getElementById('activeUsers').innerText = active;
    document.getElementById('totalRoles').innerText = roles.length;
    document.getElementById('todayLogin').innerText = todayLogin;
}

// ==================== FILTERS ====================
function populateFilters() {
    const roleFilter = document.getElementById('roleFilter');
    if(roleFilter) {
        roleFilter.innerHTML = '<option value="">All Roles</option>' + roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    }
    
    const roleSelect = document.getElementById('roleId');
    if(roleSelect) {
        roleSelect.innerHTML = '<option value="">-- Select Role --</option>' + roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    }
    
    const deptSelect = document.getElementById('departmentId');
    if(deptSelect) {
        deptSelect.innerHTML = '<option value="">-- Select Department --</option>' + departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
}

// ==================== RENDER USERS TABLE ====================
function renderUsers() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('roleFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = users.filter(user => {
        const matchesSearch = search === '' || 
            user.fullName.toLowerCase().includes(search) || 
            user.email.toLowerCase().includes(search);
        const matchesRole = roleFilter === '' || user.roleId.toString() === roleFilter;
        const matchesStatus = statusFilter === '' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    const tbody = document.getElementById('usersTableBody');
    if(!tbody) return;
    
    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:3rem 0; color:var(--color-brown-100);"><i class="fas fa-users" style="font-size:2rem; display:block; margin-bottom:0.75rem; opacity:0.4;"></i><p style="font-weight:var(--font-weight-light);">No users found</p></td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(user => `
        <tr>
            <td style="text-align: center !important; font-weight: 500; color: #5a4a3a;">${user.id}</td>
            <td style="text-align: left !important;">
                <div>
                    <p class="user-name">${escapeHtml(user.fullName)}</p>
                    <p class="user-phone">${user.phone || '-'}</p>
                </div>
            </td>
            <td style="text-align: center !important;">${escapeHtml(user.email)}</td>
            <td style="text-align: center !important;"><span class="badge-neutral">${user.roleName}</span></td>
            <td style="text-align: center !important;">${user.departmentName || '-'}</td>
            <td style="text-align: center !important;">
                <span class="${user.status === 'Active' ? 'badge-success' : 'badge-error'}">
                    ${user.status}
                </span>
            </td>
            <td style="text-align: center !important;">${user.lastLogin || 'Never'}</td>
            <td style="text-align: center !important;">
                <div class="action-group">
                    <button onclick="editUser(${user.id})" class="action-icon edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="resetUserPassword(${user.id})" class="action-icon key" title="Reset Password">
                        <i class="fas fa-key"></i>
                    </button>
                    <button onclick="deleteUser(${user.id})" class="action-icon delete" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ==================== MODAL CONTROLS - FIXED ====================
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
    const form = document.getElementById('userForm');
    if(form) form.reset();
    document.getElementById('userId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add New User';
    document.getElementById('password').required = true;
    document.getElementById('password').placeholder = 'Enter password *';
    document.querySelectorAll('.error-text').forEach(e => e.classList.remove('show'));
    openModal('userModal');
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if(user) {
        document.getElementById('userId').value = user.id;
        document.getElementById('fullName').value = user.fullName;
        document.getElementById('email').value = user.email;
        document.getElementById('roleId').value = user.roleId;
        document.getElementById('departmentId').value = user.departmentId || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('status').value = user.status;
        document.getElementById('password').required = false;
        document.getElementById('password').placeholder = 'Leave blank to keep unchanged';
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Edit User';
        document.querySelectorAll('.error-text').forEach(e => e.classList.remove('show'));
        openModal('userModal');
    }
}

function deleteUser(id) {
    deleteId = id;
    openModal('deleteModal');
}

function confirmDelete() {
    if(deleteId) {
        const user = users.find(u => u.id === deleteId);
        users = users.filter(u => u.id !== deleteId);
        saveUsers();
        updateStats();
        renderUsers();
        logAudit('DELETE_USER', `User ${user?.email || 'ID ' + deleteId} deleted`);
        showToast(`🗑️ ${user?.fullName || 'User'} deleted successfully`, 'success');
        deleteId = null;
        closeModal('deleteModal');
    }
}

// ==================== PASSWORD RESET ====================
function resetUserPassword(id) {
    const user = users.find(u => u.id === id);
    if(user) {
        resetUserId = id;
        document.getElementById('resetUserEmail').innerHTML = `Reset password for: <strong style="color:var(--color-brown-700);">${escapeHtml(user.email)}</strong>`;
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        openModal('resetPasswordModal');
    }
}

function confirmResetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if(newPassword !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    if(newPassword.length < 6) {
        showToast('Password must be at least 6 characters!', 'error');
        return;
    }
    
    const user = users.find(u => u.id === resetUserId);
    if(user) {
        user.password = btoa(newPassword);
        saveUsers();
        logAudit('RESET_PASSWORD', `Password reset for user ${user.email}`);
        showToast('Password reset successfully!', 'success');
        closeModal('resetPasswordModal');
        resetUserId = null;
    }
}

// ==================== SAVE USER ====================
function saveUser(e) {
    e.preventDefault();
    
    const id = document.getElementById('userId').value;
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const roleId = parseInt(document.getElementById('roleId').value);
    const departmentId = document.getElementById('departmentId').value ? parseInt(document.getElementById('departmentId').value) : null;
    const phone = document.getElementById('phone').value.trim();
    const status = document.getElementById('status').value;
    const password = document.getElementById('password').value;
    
    const role = roles.find(r => r.id === roleId);
    const department = departments.find(d => d.id === departmentId);
    
    // Validation
    if(!fullName) {
        showToast('Please enter full name', 'error');
        return;
    }
    if(!email) {
        showToast('Please enter email', 'error');
        return;
    }
    if(!roleId) {
        showToast('Please select a role', 'error');
        return;
    }
    if(!id && !password) {
        showToast('Please enter a password', 'error');
        return;
    }
    
    const userData = {
        fullName: fullName,
        email: email,
        roleId: roleId,
        roleName: role?.name || '',
        departmentId: departmentId,
        departmentName: department?.name || '',
        phone: phone,
        status: status,
        updatedAt: new Date().toISOString()
    };
    
    if(id) {
        const index = users.findIndex(u => u.id === parseInt(id));
        if(index !== -1) {
            if(password) {
                userData.password = btoa(password);
            }
            users[index] = { ...users[index], ...userData };
            logAudit('UPDATE_USER', `User ${users[index].email} updated`);
            showToast(`✅ ${fullName} updated successfully`, 'success');
        }
    } else {
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push({
            id: newId,
            ...userData,
            password: btoa(password),
            createdAt: new Date().toISOString(),
            lastLogin: null
        });
        logAudit('CREATE_USER', `New user created: ${email}`);
        showToast(`✅ ${fullName} created successfully`, 'success');
    }
    
    saveUsers();
    updateStats();
    renderUsers();
    closeModal('userModal');
}

// ==================== UTILITIES ====================
function logAudit(action, details) {
    let auditLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    auditLogs.unshift({
        id: Date.now(),
        action: action,
        details: details,
        user: currentUser.email || 'system',
        timestamp: new Date().toLocaleString(),
        ip: '127.0.0.1'
    });
    if(auditLogs.length > 500) auditLogs = auditLogs.slice(0, 500);
    localStorage.setItem('audit_logs', JSON.stringify(auditLogs));
}

function showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}" style="font-size:0.875rem;"></i> <span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if(!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    // Add button
    document.getElementById('addUserBtn')?.addEventListener('click', openAddModal);
    
    // Modal close buttons
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('userModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('userModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('cancelResetBtn')?.addEventListener('click', () => closeModal('resetPasswordModal'));
    document.getElementById('cancelResetModalBtn')?.addEventListener('click', () => closeModal('resetPasswordModal'));
    document.getElementById('confirmResetBtn')?.addEventListener('click', confirmResetPassword);
    document.getElementById('userForm')?.addEventListener('submit', saveUser);
    
    // Search & Filter
    document.getElementById('searchInput')?.addEventListener('input', renderUsers);
    document.getElementById('roleFilter')?.addEventListener('change', renderUsers);
    document.getElementById('statusFilter')?.addEventListener('change', renderUsers);
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('roleFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderUsers();
    });
    
    // Close modals on overlay click
    document.getElementById('userModal')?.addEventListener('click', function(e) {
        if(e.target === this) closeModal('userModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if(e.target === this) closeModal('deleteModal');
    });
    document.getElementById('resetPasswordModal')?.addEventListener('click', function(e) {
        if(e.target === this) closeModal('resetPasswordModal');
    });
    
    // ESC key
    document.addEventListener('keydown', function(e) {
        if(e.key === 'Escape') {
            closeModal('userModal');
            closeModal('deleteModal');
            closeModal('resetPasswordModal');
        }
    });
});

// Make functions global for onclick
window.editUser = editUser;
window.deleteUser = deleteUser;
window.resetUserPassword = resetUserPassword;
window.openAddModal = openAddModal;
window.openModal = openModal;
window.closeModal = closeModal;