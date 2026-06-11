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
    
    const tbody = document.getElementById('usersTable');
    if(!tbody) return;
    
    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-12 text-[#d4c9bc]">No users found</td\(\)            </tbody>';
        return;
    }
    
    tbody.innerHTML = filtered.map(user => `
        <tr class="user-row">
            <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-gradient-to-r from-[#a8c49a] to-[#8aae7a] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        ${user.fullName.charAt(0)}
                    </div>
                    <div>
                        <p class="font-medium text-[#5a4a3a] text-sm">${escapeHtml(user.fullName)}</p>
                        <p class="text-xs text-[#b8aa9a]">${user.phone || '-'}</p>
                    </div>
                </div>
              </td>
            <td class="px-5 py-4 text-sm text-[#6b5b4e]">${escapeHtml(user.email)}</td>
            <td class="px-5 py-4"><span class="role-badge text-xs">${user.roleName}</span></td>
            <td class="px-5 py-4 text-sm text-[#6b5b4e]">${user.departmentName || '-'}</td>
            <td class="px-5 py-4">
                <span class="${user.status === 'Active' ? 'status-badge-active' : 'status-badge-inactive'} text-xs">
                    ${user.status}
                </span>
             </td>
            <td class="px-5 py-4 text-sm text-[#b8aa9a]">${user.lastLogin || 'Never'}</td>
            <td class="px-5 py-4 text-center">
                <div class="flex gap-2 justify-center">
                    <button onclick="editUser(${user.id})" class="btn-icon text-[#a8c49a] hover:text-[#7a9a68] transition" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="resetUserPassword(${user.id})" class="btn-icon text-[#d4a853] hover:text-[#b8893a] transition" title="Reset Password">
                        <i class="fas fa-key"></i>
                    </button>
                    <button onclick="deleteUser(${user.id})" class="btn-icon text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
             </td>
          </tr>
    `).join('');
}

// ==================== MODAL CONTROLS - FIXED ====================
function openAddModal() {
    const form = document.getElementById('userForm');
    if(form) form.reset();
    document.getElementById('userId').value = '';
    document.getElementById('modalTitle').innerText = 'Add New User';
    document.getElementById('password').required = true;
    // FIXED: Use classList.add('active') instead of remove('hidden')
    document.getElementById('userModal').classList.add('active');
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
        document.getElementById('modalTitle').innerText = 'Edit User';
        // FIXED: Use classList.add('active') instead of remove('hidden')
        document.getElementById('userModal').classList.add('active');
    }
}

function deleteUser(id) {
    deleteId = id;
    // FIXED: Use classList.add('active') instead of remove('hidden')
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        users = users.filter(u => u.id !== deleteId);
        saveUsers();
        updateStats();
        renderUsers();
        logAudit('DELETE_USER', `User ID ${deleteId} deleted`);
        showToast('User deleted successfully', 'success');
        deleteId = null;
        // FIXED: Use classList.remove('active')
        document.getElementById('deleteModal').classList.remove('active');
    }
}

// ==================== PASSWORD RESET ====================
function resetUserPassword(id) {
    const user = users.find(u => u.id === id);
    if(user) {
        resetUserId = id;
        document.getElementById('resetUserEmail').innerHTML = `Reset password for: <strong class="text-[#5a4a3a]">${user.email}</strong>`;
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        // FIXED: Use classList.add('active') instead of remove('hidden')
        document.getElementById('resetPasswordModal').classList.add('active');
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
        // FIXED: Use classList.remove('active')
        document.getElementById('resetPasswordModal').classList.remove('active');
        resetUserId = null;
    }
}

// ==================== SAVE USER ====================
function saveUser(e) {
    e.preventDefault();
    
    const id = document.getElementById('userId').value;
    const roleId = parseInt(document.getElementById('roleId').value);
    const role = roles.find(r => r.id === roleId);
    const departmentId = document.getElementById('departmentId').value ? parseInt(document.getElementById('departmentId').value) : null;
    const department = departments.find(d => d.id === departmentId);
    const password = document.getElementById('password').value;
    
    const userData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        roleId: roleId,
        roleName: role?.name || '',
        departmentId: departmentId,
        departmentName: department?.name || '',
        phone: document.getElementById('phone').value,
        status: document.getElementById('status').value,
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
            showToast('User updated successfully', 'success');
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
        logAudit('CREATE_USER', `New user created: ${userData.email}`);
        showToast('User created successfully', 'success');
    }
    
    saveUsers();
    updateStats();
    renderUsers();
    closeModal();
}

// ==================== UTILITIES - FIXED ====================
function closeModal() {
    // FIXED: Use classList.remove('active') instead of add('hidden')
    document.getElementById('userModal')?.classList.remove('active');
    document.getElementById('deleteModal')?.classList.remove('active');
    document.getElementById('resetPasswordModal')?.classList.remove('active');
}

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

function showToast(message, type) {
    const toast = document.createElement('div');
    const colors = { success: '#8aae7a', error: '#d8b48c', info: '#a8c49a' };
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all duration-300`;
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${message}</span></div>`;
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

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.getElementById('addUserBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('cancelResetBtn')?.addEventListener('click', closeModal);
    document.getElementById('confirmResetBtn')?.addEventListener('click', confirmResetPassword);
    document.getElementById('userForm')?.addEventListener('submit', saveUser);
    document.getElementById('searchInput')?.addEventListener('input', () => renderUsers());
    document.getElementById('roleFilter')?.addEventListener('change', () => renderUsers());
    document.getElementById('statusFilter')?.addEventListener('change', () => renderUsers());
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('roleFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderUsers();
    });
});

// Make functions global for onclick
window.editUser = editUser;
window.deleteUser = deleteUser;
window.resetUserPassword = resetUserPassword;