/**
 * Roles & Permissions JS - User Management Module
 * Professional UI, Fully Working
 */

let roles = [];
let selectedRoleId = null;

const defaultPermissions = {
    dashboard: ['view'],
    patients: ['view', 'create', 'edit', 'delete'],
    doctors: ['view', 'create', 'edit', 'delete'],
    appointments: ['view', 'create', 'edit', 'delete'],
    opd: ['view', 'create', 'edit'],
    ipd: ['view', 'create', 'edit', 'discharge'],
    pharmacy: ['view', 'create', 'edit', 'delete', 'issue'],
    laboratory: ['view', 'create', 'edit', 'upload'],
    radiology: ['view', 'create', 'edit', 'upload'],
    billing: ['view', 'create', 'edit', 'payment'],
    reports: ['view'],
    settings: ['view', 'edit'],
    users: ['view', 'create', 'edit', 'delete']
};

// ==================== LOAD ROLES ====================
function loadRoles() {
    const stored = localStorage.getItem('system_roles');
    if(stored) {
        roles = JSON.parse(stored);
    } else {
        // Default roles with Indian names
        roles = [
            {id: 1, name: 'Administrator', description: 'Full system access - complete control over all modules', permissions: defaultPermissions},
            {id: 2, name: 'Doctor', description: 'Access to clinical modules - patients, appointments, prescriptions', permissions: { dashboard:['view'], patients:['view','create','edit'], doctors:['view'], appointments:['view','create','edit'], opd:['view','create','edit'], ipd:['view','create','edit','discharge'], pharmacy:['view','issue'], laboratory:['view','create'], radiology:['view','create'], billing:['view'], reports:['view'], settings:[], users:[] }},
            {id: 3, name: 'Nurse', description: 'IPD and OPD patient care - daily updates', permissions: { dashboard:['view'], patients:['view','edit'], doctors:[], appointments:['view'], opd:['view','edit'], ipd:['view','create','edit'], pharmacy:[], laboratory:[], radiology:[], billing:[], reports:['view'], settings:[], users:[] }},
            {id: 4, name: 'Receptionist', description: 'Front desk operations - appointments, patient registration', permissions: { dashboard:['view'], patients:['view','create','edit'], doctors:['view'], appointments:['view','create','edit','delete'], opd:['view','create'], ipd:[], pharmacy:[], laboratory:[], radiology:[], billing:['view','create'], reports:['view'], settings:[], users:[] }},
            {id: 5, name: 'Accountant', description: 'Billing and finance management', permissions: { dashboard:['view'], patients:['view'], doctors:[], appointments:[], opd:[], ipd:[], pharmacy:[], laboratory:[], radiology:[], billing:['view','create','edit','payment'], reports:['view'], settings:[], users:[] }}
        ];
        saveRoles();
    }
    renderRolesList();
}

function saveRoles() {
    localStorage.setItem('system_roles', JSON.stringify(roles));
}

// ==================== RENDER ROLES LIST ====================
function renderRolesList() {
    const container = document.getElementById('rolesList');
    if(!container) return;
    
    if(roles.length === 0) {
        container.innerHTML = '<div class="text-center py-4 text-[#94a3b8]">No roles found. Click "Add Role" to create one.</div>';
        return;
    }
    
    container.innerHTML = roles.map(role => `
        <div class="role-item flex justify-between items-center p-3 rounded-lg transition ${selectedRoleId === role.id ? 'active bg-[#f0fdf4] border-l-[3px] border-l-[#a8c49a]' : 'hover:bg-[#f8fafc]'}" onclick="selectRole(${role.id})">
            <div class="flex-1">
                <p class="font-medium text-[#1e293b] text-sm">${escapeHtml(role.name)}</p>
                <p class="text-xs text-[#64748b]">${escapeHtml(role.description || 'No description')}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="event.stopPropagation(); editRole(${role.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition p-1" title="Edit Role">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="event.stopPropagation(); deleteRole(${role.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition p-1" title="Delete Role">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ==================== SELECT ROLE ====================
function selectRole(id) {
    selectedRoleId = id;
    renderRolesList();
    renderPermissionsEditor();
}

// ==================== RENDER PERMISSIONS EDITOR ====================
function renderPermissionsEditor() {
    const role = roles.find(r => r.id === selectedRoleId);
    const editor = document.getElementById('permissionsEditor');
    const saveBtn = document.getElementById('savePermissionsBtn');
    
    if(!role || !editor) return;
    
    document.getElementById('selectedRoleTitle').innerHTML = `<i class="fas fa-key text-[#a8c49a] mr-2"></i>Editing: ${escapeHtml(role.name)}`;
    
    editor.innerHTML = Object.keys(defaultPermissions).map(module => `
        <div class="permission-group">
            <div class="permission-group-title">
                <i class="fas ${getModuleIcon(module)} mr-2 text-[#a8c49a]"></i>
                ${module.charAt(0).toUpperCase() + module.slice(1)}
            </div>
            <div>
                ${defaultPermissions[module].map(perm => `
                    <label class="permission-checkbox">
                        <input type="checkbox" class="perm-checkbox" data-module="${module}" data-perm="${perm}" ${role.permissions?.[module]?.includes(perm) ? 'checked' : ''}>
                        <span>${perm.charAt(0).toUpperCase() + perm.slice(1)}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    saveBtn.classList.remove('hidden');
}

function getModuleIcon(module) {
    const icons = {
        dashboard: 'fa-chart-pie',
        patients: 'fa-users',
        doctors: 'fa-user-md',
        appointments: 'fa-calendar-check',
        opd: 'fa-walking',
        ipd: 'fa-procedures',
        pharmacy: 'fa-capsules',
        laboratory: 'fa-microscope',
        radiology: 'fa-x-ray',
        billing: 'fa-file-invoice-dollar',
        reports: 'fa-chart-line',
        settings: 'fa-cog',
        users: 'fa-users-cog'
    };
    return icons[module] || 'fa-circle';
}

// ==================== SAVE PERMISSIONS ====================
function savePermissions() {
    const role = roles.find(r => r.id === selectedRoleId);
    if(role) {
        const newPermissions = {};
        document.querySelectorAll('.perm-checkbox').forEach(cb => {
            const module = cb.dataset.module;
            const perm = cb.dataset.perm;
            if(!newPermissions[module]) newPermissions[module] = [];
            if(cb.checked) newPermissions[module].push(perm);
        });
        role.permissions = newPermissions;
        saveRoles();
        logAudit('UPDATE_ROLE', `Permissions updated for role ${role.name}`);
        showToast('Permissions saved successfully!', 'success');
    }
}

// ==================== ROLE CRUD OPERATIONS ====================
function openRoleModal() {
    document.getElementById('roleForm').reset();
    document.getElementById('roleId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Role';
    document.getElementById('roleModal').classList.add('active');
}

function editRole(id) {
    const role = roles.find(r => r.id === id);
    if(role) {
        document.getElementById('roleId').value = role.id;
        document.getElementById('roleName').value = role.name;
        document.getElementById('roleDesc').value = role.description || '';
        document.getElementById('modalTitle').innerText = 'Edit Role';
        document.getElementById('roleModal').classList.add('active');
    }
}

function deleteRole(id) {
    if(confirm('⚠️ Delete this role? This action cannot be undone.')) {
        roles = roles.filter(r => r.id !== id);
        saveRoles();
        renderRolesList();
        if(selectedRoleId === id) {
            selectedRoleId = null;
            document.getElementById('permissionsEditor').innerHTML = `
                <div class="text-center py-8 text-[#94a3b8]">
                    <i class="fas fa-hand-pointer text-3xl mb-2 block"></i>
                    <p>Click on a role from the left panel to edit its permissions</p>
                </div>
            `;
            document.getElementById('savePermissionsBtn').classList.add('hidden');
            document.getElementById('selectedRoleTitle').innerHTML = `<i class="fas fa-key text-[#a8c49a] mr-2"></i>Select a role to edit permissions`;
        }
        showToast('Role deleted successfully', 'success');
    }
}

function saveRole(e) {
    e.preventDefault();
    
    const id = document.getElementById('roleId').value;
    const data = {
        name: document.getElementById('roleName').value,
        description: document.getElementById('roleDesc').value,
        permissions: {}
    };
    
    if(id) {
        const index = roles.findIndex(r => r.id === parseInt(id));
        if(index !== -1) {
            roles[index] = { ...roles[index], ...data };
            showToast('Role updated successfully', 'success');
        }
    } else {
        const newId = roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
        roles.push({ id: newId, ...data });
        showToast('Role added successfully', 'success');
    }
    
    saveRoles();
    renderRolesList();
    closeRoleModal();
}

// ==================== MODAL CONTROL ====================
function closeRoleModal() {
    document.getElementById('roleModal').classList.remove('active');
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

function showToast(message, type) {
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a' };
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300`;
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
    loadRoles();
    
    document.getElementById('addRoleBtn')?.addEventListener('click', openRoleModal);
    document.getElementById('closeRoleModalBtn')?.addEventListener('click', closeRoleModal);
    document.getElementById('cancelRoleModalBtn')?.addEventListener('click', closeRoleModal);
    document.getElementById('roleForm')?.addEventListener('submit', saveRole);
    document.getElementById('savePermissionsBtn')?.addEventListener('click', savePermissions);
});

// Make functions global for onclick
window.selectRole = selectRole;
window.editRole = editRole;
window.deleteRole = deleteRole;