/**
 * Roles & Permissions JS - User Management Module
 * Complete RBAC (Role-Based Access Control) System
 */

// ─── Module Configuration ──────────────────────────────

const MODULES = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'patients', label: 'Patients', icon: 'fa-users' },
    { id: 'appointments', label: 'Appointments', icon: 'fa-calendar-check' },
    { id: 'opd', label: 'OPD', icon: 'fa-walking' },
    { id: 'ipd', label: 'IPD', icon: 'fa-procedures' },
    { id: 'pharmacy', label: 'Pharmacy', icon: 'fa-capsules' },
    { id: 'laboratory', label: 'Laboratory', icon: 'fa-microscope' },
    { id: 'radiology', label: 'Radiology', icon: 'fa-x-ray' },
    { id: 'billing', label: 'Billing', icon: 'fa-file-invoice-dollar' },
    { id: 'reports', label: 'Reports', icon: 'fa-chart-line' },
    { id: 'users', label: 'User Management', icon: 'fa-users-cog' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'fa-shield-alt' },
    { id: 'settings', label: 'Settings', icon: 'fa-cog' }
];

const PERMISSIONS = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

// ─── State ──────────────────────────────────────────────

let roles = [];
let selectedRoleId = null;
let currentUserRole = null;

// ─── Load Data ──────────────────────────────────────────

function loadRoles() {
    const stored = localStorage.getItem('system_roles');
    if (stored) {
        roles = JSON.parse(stored);
    } else {
        // Default roles with permissions
        roles = [
            {
                id: 1,
                name: 'Administrator',
                description: 'Full system access - complete control over all modules',
                status: 'active',
                permissions: {
                    dashboard: ['view', 'create', 'edit', 'delete'],
                    patients: ['view', 'create', 'edit', 'delete', 'approve'],
                    appointments: ['view', 'create', 'edit', 'delete', 'approve'],
                    opd: ['view', 'create', 'edit', 'delete'],
                    ipd: ['view', 'create', 'edit', 'delete', 'approve'],
                    pharmacy: ['view', 'create', 'edit', 'delete', 'approve'],
                    laboratory: ['view', 'create', 'edit', 'delete', 'approve'],
                    radiology: ['view', 'create', 'edit', 'delete', 'approve'],
                    billing: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
                    reports: ['view', 'create', 'edit', 'delete', 'export'],
                    users: ['view', 'create', 'edit', 'delete'],
                    roles: ['view', 'create', 'edit', 'delete'],
                    settings: ['view', 'create', 'edit', 'delete']
                }
            },
            {
                id: 2,
                name: 'Doctor',
                description: 'Clinical access - patients, appointments, prescriptions',
                status: 'active',
                permissions: {
                    dashboard: ['view'],
                    patients: ['view', 'create', 'edit'],
                    appointments: ['view', 'create', 'edit'],
                    opd: ['view', 'create', 'edit'],
                    ipd: ['view', 'create', 'edit'],
                    pharmacy: ['view', 'create', 'edit'],
                    laboratory: ['view', 'create'],
                    radiology: ['view', 'create'],
                    billing: ['view'],
                    reports: ['view'],
                    users: [],
                    roles: [],
                    settings: []
                }
            },
            {
                id: 3,
                name: 'Nurse',
                description: 'Patient care - IPD and OPD daily updates',
                status: 'active',
                permissions: {
                    dashboard: ['view'],
                    patients: ['view', 'edit'],
                    appointments: ['view'],
                    opd: ['view', 'edit'],
                    ipd: ['view', 'create', 'edit'],
                    pharmacy: ['view'],
                    laboratory: ['view'],
                    radiology: ['view'],
                    billing: [],
                    reports: ['view'],
                    users: [],
                    roles: [],
                    settings: []
                }
            },
            {
                id: 4,
                name: 'Receptionist',
                description: 'Front desk - appointments, patient registration',
                status: 'active',
                permissions: {
                    dashboard: ['view'],
                    patients: ['view', 'create', 'edit'],
                    appointments: ['view', 'create', 'edit', 'delete'],
                    opd: ['view', 'create'],
                    ipd: [],
                    pharmacy: [],
                    laboratory: [],
                    radiology: [],
                    billing: ['view', 'create'],
                    reports: ['view'],
                    users: [],
                    roles: [],
                    settings: []
                }
            },
            {
                id: 5,
                name: 'Accountant',
                description: 'Billing and finance management',
                status: 'active',
                permissions: {
                    dashboard: ['view'],
                    patients: ['view'],
                    appointments: ['view'],
                    opd: [],
                    ipd: [],
                    pharmacy: [],
                    laboratory: [],
                    radiology: [],
                    billing: ['view', 'create', 'edit', 'approve', 'export'],
                    reports: ['view', 'export'],
                    users: [],
                    roles: [],
                    settings: []
                }
            }
        ];
        saveRoles();
    }
    updateStats();
    renderRolesList();
}

function saveRoles() {
    localStorage.setItem('system_roles', JSON.stringify(roles));
}

// ─── Statistics ─────────────────────────────────────────

function updateStats() {
    const total = roles.length;
    const active = roles.filter(r => r.status === 'active').length;
    const totalPerms = roles.reduce((sum, r) => {
        let count = 0;
        Object.values(r.permissions || {}).forEach(p => count += p.length);
        return sum + count;
    }, 0);
    
    document.getElementById('totalRoles').textContent = total;
    document.getElementById('activeRoles').textContent = active;
    document.getElementById('totalPermissions').textContent = totalPerms;
    document.getElementById('lastUpdated').textContent = 
        new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// ─── Render Roles List ──────────────────────────────────

function renderRolesList() {
    const container = document.getElementById('rolesList');
    if (!container) return;
    
    const search = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    
    let filtered = roles;
    if (search) {
        filtered = filtered.filter(r => r.name.toLowerCase().includes(search));
    }
    if (statusFilter) {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 2rem 1.25rem;">
                <i class="fas fa-shield-alt"></i>
                <p style="font-size:0.8125rem;">No roles found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(role => `
        <div class="role-item ${selectedRoleId === role.id ? 'active' : ''}" data-id="${role.id}" onclick="selectRole(${role.id})">
            <div>
                <div class="role-name">${escapeHtml(role.name)} 
                    <span class="role-badge">${role.status || 'active'}</span>
                </div>
                <div style="font-size:0.6875rem; color:var(--color-brown-100); margin-top:0.125rem;">
                    ${role.description || 'No description'}
                </div>
            </div>
            <div class="role-actions">
                <button class="icon-btn-sm edit-role" data-id="${role.id}" title="Edit Role" onclick="event.stopPropagation(); editRole(${role.id})">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="icon-btn-sm delete delete-role" data-id="${role.id}" title="Delete Role" onclick="event.stopPropagation(); deleteRole(${role.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Auto-select first role if none selected
    if (!selectedRoleId && filtered.length > 0) {
        selectRole(filtered[0].id);
    }
}

// ─── Select Role ────────────────────────────────────────

function selectRole(id) {
    selectedRoleId = id;
    renderRolesList();
    renderPermissionsEditor();
}

// ─── Render Permissions Editor ──────────────────────────

function renderPermissionsEditor() {
    const role = roles.find(r => r.id === selectedRoleId);
    const editor = document.getElementById('permissionsEditor');
    const saveBtn = document.getElementById('savePermissionsBtn');
    
    if (!role || !editor) return;
    
    document.getElementById('selectedRoleTitle').innerHTML = `
        <i class="fas fa-key" style="color:var(--color-sage);"></i>
        ${escapeHtml(role.name)} - Permissions
        <span class="user-count">${getUserCount(role.id)} users</span>
    `;
    
    let html = '';
    MODULES.forEach(module => {
        const perms = role.permissions?.[module.id] || [];
        const hasAnyPerm = perms.length > 0;
        
        html += `
            <div class="permission-group">
                <div class="permission-group-title">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas ${module.icon}" style="color:var(--color-sage);"></i>
                        ${module.label}
                        <span class="module-visibility">
                            <span class="toggle-indicator ${hasAnyPerm ? 'visible' : 'hidden'}"></span>
                            ${hasAnyPerm ? 'Visible' : 'Hidden'}
                        </span>
                    </div>
                    <button class="select-all-btn" onclick="toggleModulePermissions(${role.id}, '${module.id}')">
                        ${hasAnyPerm ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                <div>
                    ${PERMISSIONS.map(perm => `
                        <label class="permission-checkbox">
                            <input type="checkbox" 
                                class="perm-checkbox" 
                                data-module="${module.id}" 
                                data-perm="${perm}"
                                ${perms.includes(perm) ? 'checked' : ''}
                                onchange="onPermissionChange(${role.id}, '${module.id}', '${perm}')">
                            <span>${perm.charAt(0).toUpperCase() + perm.slice(1)}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    editor.innerHTML = html;
    saveBtn.style.display = 'block';
}

// ─── Permission Change Handler ──────────────────────────

function onPermissionChange(roleId, moduleId, permission) {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    if (!role.permissions) role.permissions = {};
    if (!role.permissions[moduleId]) role.permissions[moduleId] = [];
    
    const checkbox = document.querySelector(`.perm-checkbox[data-module="${moduleId}"][data-perm="${permission}"]`);
    if (!checkbox) return;
    
    if (checkbox.checked) {
        if (!role.permissions[moduleId].includes(permission)) {
            role.permissions[moduleId].push(permission);
        }
    } else {
        role.permissions[moduleId] = role.permissions[moduleId].filter(p => p !== permission);
    }
    
    // Auto-save on change
    saveRoles();
    updateStats();
}

// ─── Toggle Module Permissions ──────────────────────────

function toggleModulePermissions(roleId, moduleId) {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    if (!role.permissions) role.permissions = {};
    if (!role.permissions[moduleId]) role.permissions[moduleId] = [];
    
    const currentPerms = role.permissions[moduleId];
    const hasAll = PERMISSIONS.every(p => currentPerms.includes(p));
    
    if (hasAll) {
        role.permissions[moduleId] = [];
    } else {
        role.permissions[moduleId] = [...PERMISSIONS];
    }
    
    saveRoles();
    renderPermissionsEditor();
    updateStats();
}

// ─── Save Permissions ────────────────────────────────────

function savePermissions() {
    // Permissions are auto-saved on change
    showToast('✅ Permissions saved successfully', 'success');
}

// ─── Get User Count for Role ────────────────────────────

function getUserCount(roleId) {
    const users = JSON.parse(localStorage.getItem('system_users') || '[]');
    return users.filter(u => u.roleId === roleId).length;
}

// ─── Role CRUD Operations ──────────────────────────────

function openAddModal() {
    document.getElementById('roleForm').reset();
    document.getElementById('roleId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add Role';
    document.querySelectorAll('.error-text').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('.form-input.error').forEach(e => e.classList.remove('error'));
    openModal('roleModal');
}

function editRole(id) {
    const role = roles.find(r => r.id === id);
    if (!role) return;
    
    document.getElementById('roleId').value = role.id;
    document.getElementById('roleName').value = role.name;
    document.getElementById('roleDesc').value = role.description || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-pen"></i> Edit Role';
    document.querySelectorAll('.error-text').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('.form-input.error').forEach(e => e.classList.remove('error'));
    openModal('roleModal');
}

function deleteRole(id) {
    if (confirm('⚠️ Delete this role? This action cannot be undone.')) {
        const role = roles.find(r => r.id === id);
        roles = roles.filter(r => r.id !== id);
        saveRoles();
        if (selectedRoleId === id) {
            selectedRoleId = null;
            document.getElementById('permissionsEditor').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hand-pointer"></i>
                    <p>Click on a role from the left panel to edit its permissions</p>
                </div>
            `;
            document.getElementById('savePermissionsBtn').style.display = 'none';
            document.getElementById('selectedRoleTitle').innerHTML = `
                <i class="fas fa-key" style="color:var(--color-sage);"></i>
                Select a role to edit permissions
            `;
        }
        updateStats();
        renderRolesList();
        showToast(`🗑️ ${role?.name || 'Role'} deleted`, 'error');
    }
}

// ─── Save Role Form ──────────────────────────────────────

function saveRole(e) {
    e.preventDefault();
    
    const name = document.getElementById('roleName').value.trim();
    const description = document.getElementById('roleDesc').value.trim();
    const id = document.getElementById('roleId').value;
    
    if (!name) {
        document.getElementById('roleNameError').classList.add('show');
        document.getElementById('roleName').classList.add('error');
        return;
    }
    document.getElementById('roleNameError').classList.remove('show');
    document.getElementById('roleName').classList.remove('error');
    
    // Check for duplicate name
    const duplicate = roles.some(r => r.name.toLowerCase() === name.toLowerCase() && r.id !== parseInt(id));
    if (duplicate) {
        showToast('A role with this name already exists!', 'error');
        return;
    }
    
    if (id) {
        const index = roles.findIndex(r => r.id === parseInt(id));
        if (index !== -1) {
            roles[index] = { ...roles[index], name, description };
            showToast(`✅ ${name} updated successfully`, 'success');
        }
    } else {
        const newId = roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
        roles.push({
            id: newId,
            name,
            description,
            status: 'active',
            permissions: {}
        });
        showToast(`✅ ${name} added successfully`, 'success');
    }
    
    saveRoles();
    closeModal('roleModal');
    updateStats();
    renderRolesList();
    // Select the newly created/updated role
    const role = roles.find(r => r.name === name);
    if (role) selectRole(role.id);
}

// ─── Modal Functions ────────────────────────────────────

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

function closeRoleModal() {
    closeModal('roleModal');
}

function closeDeleteModal() {
    closeModal('deleteModal');
}

// ─── Toast Notification ──────────────────────────────────

function showToast(message, type = 'success') {
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}" style="font-size:0.875rem;"></i> ${escapeHtml(message)}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ─── Utilities ───────────────────────────────────────────

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Event Listeners ─────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    loadRoles();
    
    // Add Role button
    document.getElementById('addRoleBtn')?.addEventListener('click', openAddModal);
    
    // Modal close buttons
    document.getElementById('closeRoleModalBtn')?.addEventListener('click', closeRoleModal);
    document.getElementById('cancelRoleModalBtn')?.addEventListener('click', closeRoleModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        if (id) deleteRole(id);
        closeDeleteModal();
    });
    
    // Form submit
    document.getElementById('roleForm')?.addEventListener('submit', saveRole);
    
    // Save Permissions button
    document.getElementById('savePermissionsBtn')?.addEventListener('click', savePermissions);
    
    // Search & Filter
    document.getElementById('searchInput')?.addEventListener('input', renderRolesList);
    document.getElementById('filterStatus')?.addEventListener('change', renderRolesList);
    document.getElementById('resetFiltersBtn')?.addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        document.getElementById('filterStatus').value = '';
        renderRolesList();
    });
    
    // Close modals on overlay click
    document.getElementById('roleModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('roleModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('roleModal');
            closeModal('deleteModal');
        }
    });
});

// ─── Make functions global for onclick ──────────────────

window.selectRole = selectRole;
window.editRole = editRole;
window.deleteRole = deleteRole;
window.openAddModal = openAddModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleModulePermissions = toggleModulePermissions;
window.onPermissionChange = onPermissionChange;
window.savePermissions = savePermissions;