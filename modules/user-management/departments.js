/**
 * Departments Management JS - User Management Module
 * Professional UI, Fully Working, Indian Names
 */

let departments = [];
let deleteId = null;

// ==================== LOAD DEPARTMENTS ====================
function loadDepts() {
    const stored = localStorage.getItem('system_departments');
    if(stored) {
        departments = JSON.parse(stored);
    } else {
        // Default departments with Indian names
        departments = [
            {id: 1, name: 'Cardiology', code: 'CARD', hod: 'Dr. Anjali Nair', description: 'Heart care and cardiovascular treatments', createdAt: '2024-01-01', status: 'active'},
            {id: 2, name: 'Neurology', code: 'NEURO', hod: 'Dr. Vikram Singh', description: 'Brain, spine and nervous system disorders', createdAt: '2024-01-01', status: 'active'},
            {id: 3, name: 'Pediatrics', code: 'PEDS', hod: 'Dr. Sneha Joshi', description: 'Child healthcare and adolescent medicine', createdAt: '2024-01-01', status: 'active'},
            {id: 4, name: 'Orthopedics', code: 'ORTHO', hod: 'Dr. Rajiv Menon', description: 'Bone, joint and muscle treatments', createdAt: '2024-01-01', status: 'active'},
            {id: 5, name: 'Gynecology', code: 'GYN', hod: 'Dr. Meera Desai', description: 'Women\'s health and reproductive care', createdAt: '2024-01-01', status: 'active'},
            {id: 6, name: 'Dermatology', code: 'DERMA', hod: 'Dr. Neha Gupta', description: 'Skin, hair and nail treatments', createdAt: '2024-01-01', status: 'active'}
        ];
        saveDepts();
    }
    updateStats();
    renderDepts();
}

function saveDepts() {
    localStorage.setItem('system_departments', JSON.stringify(departments));
}

// ==================== STATISTICS ====================
function updateStats() {
    const total = departments.length;
    const withHod = departments.filter(d => d.hod && d.hod.trim() !== '').length;
    const active = departments.filter(d => d.status === 'active').length;
    
    document.getElementById('totalDepts').innerText = total;
    document.getElementById('hodCount').innerText = withHod;
    document.getElementById('activeDepts').innerText = active;
    document.getElementById('lastUpdated').innerText = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// ==================== MODAL CONTROLS (FIXED) ====================
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
    document.getElementById('deptForm').reset();
    document.getElementById('deptId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-building"></i> Add Department';
    document.querySelectorAll('.error-text').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('.form-input.error, .form-select.error').forEach(e => e.classList.remove('error'));
    openModal('deptModal');
}

function openEditModal(id) {
    const dept = departments.find(d => d.id === id);
    if(dept) {
        document.getElementById('deptId').value = dept.id;
        document.getElementById('deptName').value = dept.name;
        document.getElementById('deptCode').value = dept.code;
        document.getElementById('hod').value = dept.hod || '';
        document.getElementById('deptLocation').value = dept.location || '';
        document.getElementById('deptDesc').value = dept.description || '';
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-pen"></i> Edit Department';
        document.querySelectorAll('.error-text').forEach(e => e.classList.remove('show'));
        openModal('deptModal');
    }
}

function openDeleteModal(id) {
    deleteId = id;
    openModal('deleteModal');
}

// ==================== RENDER DEPARTMENTS GRID ====================
function renderDepts() {
    const grid = document.getElementById('departmentsGrid');
    if(!grid) return;
    
    // Get filtered departments
    const searchTerm = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    
    let filtered = departments;
    if (searchTerm) {
        filtered = filtered.filter(d => 
            d.name.toLowerCase().includes(searchTerm) || 
            d.code.toLowerCase().includes(searchTerm) ||
            (d.hod || '').toLowerCase().includes(searchTerm)
        );
    }
    if (statusFilter) {
        filtered = filtered.filter(d => d.status === statusFilter);
    }
    
    if(filtered.length === 0) {
        grid.innerHTML = `
            <div class="dept-empty" style="grid-column:1/-1;">
                <i class="fas fa-building"></i>
                <p style="font-size:0.875rem;">No departments found</p>
                <p style="font-size:0.75rem; margin-top:0.25rem;">Add your first department to get started.</p>
            </div>
        `;
        return;
    }
    
    const ACCENT_VARIANTS = ['', 'tan', 'gold'];
    const DEPT_ICONS = {
        cardiology: 'fa-heart-pulse', neurology: 'fa-brain',
        orthopedics: 'fa-bone', pediatrics: 'fa-baby',
        dermatology: 'fa-hand-sparkles', general: 'fa-stethoscope',
        radiology: 'fa-x-ray', surgery: 'fa-scalpel',
        gynecology: 'fa-venus', default: 'fa-building'
    };
    
    function getIcon(name) {
        const key = (name || '').toLowerCase().split(' ')[0];
        return DEPT_ICONS[key] || DEPT_ICONS.default;
    }
    
    grid.innerHTML = filtered.map((dept, idx) => {
        const accent = ACCENT_VARIANTS[idx % ACCENT_VARIANTS.length];
        const icon = getIcon(dept.name);
        const active = dept.status === 'active';
        return `
        <div class="dept-card" data-id="${dept.id}">
            <div class="dept-card-accent ${accent}"></div>
            <div class="dept-card-body">
                <div style="display:flex; align-items:flex-start; gap:0.75rem; margin-bottom:0.625rem;">
                    <div class="dept-icon"><i class="fas ${icon}"></i></div>
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                            <span style="font-size:0.9375rem; font-weight:var(--font-weight-medium); color:var(--color-brown-700); line-height:1.3;">${escapeHtml(dept.name)}</span>
                            <span class="dept-code">${escapeHtml(dept.code)}</span>
                            <span class="dept-id">ID: ${dept.id}</span>
                        </div>
                        ${dept.description ? `<p style="font-size:0.6875rem; color:var(--color-brown-100); font-weight:var(--font-weight-light); margin-top:0.2rem; line-height:1.5;">${escapeHtml(dept.description)}</p>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:0.375rem; flex-shrink:0;">
                        <span class="status-dot ${active ? '' : 'inactive'}"></span>
                        <span style="font-size:0.625rem; font-weight:var(--font-weight-medium); color:${active ? 'var(--color-sage-dark)' : 'var(--color-brown-100)'};">${active ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
                <div class="dept-meta">
                    <div class="dept-meta-row">
                        <i class="fas fa-user-tie"></i>
                        <span>${dept.hod ? escapeHtml(dept.hod) : '<span style="color:var(--color-brown-100);font-style:italic;">No HOD assigned</span>'}</span>
                    </div>
                    ${dept.location ? `
                    <div class="dept-meta-row">
                        <i class="fas fa-location-dot"></i>
                        <span>${escapeHtml(dept.location)}</span>
                    </div>` : ''}
                </div>
            </div>
            <div class="dept-card-footer">
                <button class="icon-btn edit-btn" data-id="${dept.id}" title="Edit">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="icon-btn delete delete-btn" data-id="${dept.id}" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>`;
    }).join('');
    
    // Bind card buttons
    grid.querySelectorAll('.edit-btn').forEach(b => {
        b.addEventListener('click', function(e) {
            e.stopPropagation();
            openEditModal(+this.dataset.id);
        });
    });
    grid.querySelectorAll('.delete-btn').forEach(b => {
        b.addEventListener('click', function(e) {
            e.stopPropagation();
            openDeleteModal(+this.dataset.id);
        });
    });
}

// ==================== SAVE DEPARTMENT ====================
function saveDept(e) {
    e.preventDefault();
    
    const name = document.getElementById('deptName').value.trim();
    const code = document.getElementById('deptCode').value.trim().toUpperCase();
    let valid = true;
    
    if (!name) {
        document.getElementById('deptNameError').classList.add('show');
        document.getElementById('deptName').classList.add('error');
        valid = false;
    } else {
        document.getElementById('deptNameError').classList.remove('show');
        document.getElementById('deptName').classList.remove('error');
    }
    if (!code) {
        document.getElementById('deptCodeError').classList.add('show');
        document.getElementById('deptCode').classList.add('error');
        valid = false;
    } else {
        document.getElementById('deptCodeError').classList.remove('show');
        document.getElementById('deptCode').classList.remove('error');
    }
    if (!valid) return;
    
    const id = document.getElementById('deptId').value;
    const data = {
        name: name,
        code: code,
        hod: document.getElementById('hod').value.trim(),
        location: document.getElementById('deptLocation').value.trim(),
        description: document.getElementById('deptDesc').value.trim(),
        status: 'active'
    };
    
    if(id) {
        const index = departments.findIndex(d => d.id === parseInt(id));
        if(index !== -1) {
            departments[index] = { ...departments[index], ...data };
            showToast(`✅ ${name} updated successfully`, 'success');
        }
    } else {
        const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1;
        departments.push({
            id: newId,
            ...data,
            createdAt: new Date().toISOString().split('T')[0]
        });
        showToast(`✅ ${name} added successfully`, 'success');
    }
    
    saveDepts();
    updateStats();
    renderDepts();
    closeModal('deptModal');
}

// ==================== DELETE ====================
function confirmDelete() {
    if(!deleteId) return;
    const dept = departments.find(d => d.id === deleteId);
    departments = departments.filter(d => d.id !== deleteId);
    saveDepts();
    updateStats();
    renderDepts();
    closeModal('deleteModal');
    if(dept) showToast(`🗑️ ${dept.name} deleted`, 'error');
    deleteId = null;
}

// ==================== UTILITIES ====================
function showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}" style="font-size:0.875rem;"></i> ${escapeHtml(message)}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function escapeHtml(str) {
    if(!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    loadDepts();
    
    // Add button
    document.getElementById('addDeptBtn')?.addEventListener('click', openAddModal);
    
    // Modal close buttons
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('deptModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('deptModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('deptForm')?.addEventListener('submit', saveDept);
    
    // Search & Filter
    document.getElementById('searchInput')?.addEventListener('input', renderDepts);
    document.getElementById('filterStatus')?.addEventListener('change', renderDepts);
    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('filterStatus').value = '';
        renderDepts();
    });
    
    // Auto-uppercase dept code
    document.getElementById('deptCode')?.addEventListener('input', function() {
        const pos = this.selectionStart;
        this.value = this.value.toUpperCase();
        this.setSelectionRange(pos, pos);
    });
    
    // Close modals on overlay click
    document.getElementById('deptModal')?.addEventListener('click', function(e) {
        if(e.target === this) closeModal('deptModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if(e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') {
            closeModal('deptModal');
            closeModal('deleteModal');
        }
    });
});

// Make functions global for onclick
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.confirmDelete = confirmDelete;
window.renderDepts = renderDepts;