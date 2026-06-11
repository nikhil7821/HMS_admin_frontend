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
            {id: 1, name: 'Cardiology', code: 'CARD', hod: 'Dr. Anjali Nair', description: 'Heart care and cardiovascular treatments', createdAt: '2024-01-01'},
            {id: 2, name: 'Neurology', code: 'NEURO', hod: 'Dr. Vikram Singh', description: 'Brain, spine and nervous system disorders', createdAt: '2024-01-01'},
            {id: 3, name: 'Pediatrics', code: 'PEDS', hod: 'Dr. Sneha Joshi', description: 'Child healthcare and adolescent medicine', createdAt: '2024-01-01'},
            {id: 4, name: 'Orthopedics', code: 'ORTHO', hod: 'Dr. Rajiv Menon', description: 'Bone, joint and muscle treatments', createdAt: '2024-01-01'},
            {id: 5, name: 'Gynecology', code: 'GYN', hod: 'Dr. Meera Desai', description: 'Women\'s health and reproductive care', createdAt: '2024-01-01'},
            {id: 6, name: 'Dermatology', code: 'DERMA', hod: 'Dr. Neha Gupta', description: 'Skin, hair and nail treatments', createdAt: '2024-01-01'}
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
    const active = departments.length;
    
    document.getElementById('totalDepts').innerText = total;
    document.getElementById('hodCount').innerText = withHod;
    document.getElementById('activeDepts').innerText = active;
    document.getElementById('lastUpdated').innerText = new Date().toLocaleDateString('en-IN');
}

// ==================== RENDER DEPARTMENTS GRID ====================
function renderDepts() {
    const grid = document.getElementById('departmentsGrid');
    if(!grid) return;
    
    if(departments.length === 0) {
        grid.innerHTML = '<div class="col-span-3 text-center py-12 text-[#94a3b8]"><i class="fas fa-building text-3xl mb-2 block"></i><p>No departments found. Click "Add Department" to create one.</p></div>';
        return;
    }
    
    grid.innerHTML = departments.map(dept => `
        <div class="dept-card p-5">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="font-semibold text-[#1e293b] text-lg">${escapeHtml(dept.name)}</h3>
                    <span class="dept-code text-xs mt-1 inline-block">${escapeHtml(dept.code)}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="editDept(${dept.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition p-1" title="Edit Department">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteDept(${dept.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition p-1" title="Delete Department">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="mt-3 space-y-2">
                <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-user-tie w-4 text-[#94a3b8]"></i>
                    <span class="text-[#475569]">HOD:</span>
                    <span class="text-[#1e293b] font-medium">${dept.hod ? escapeHtml(dept.hod) : '<span class="text-[#94a3b8] italic">Not assigned</span>'}</span>
                </div>
                ${dept.description ? `
                <div class="flex items-start gap-2 text-sm">
                    <i class="fas fa-align-left w-4 text-[#94a3b8] mt-0.5"></i>
                    <span class="text-[#475569]">${escapeHtml(dept.description)}</span>
                </div>
                ` : ''}
                <div class="flex items-center gap-2 text-xs text-[#94a3b8] pt-2 border-t border-[#f0e8e0] mt-2">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Created: ${dept.createdAt || '2024-01-01'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== MODAL CONTROLS ====================
function openModal() {
    document.getElementById('deptForm').reset();
    document.getElementById('deptId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Department';
    document.getElementById('deptModal').classList.add('active');
}

function editDept(id) {
    const dept = departments.find(d => d.id === id);
    if(dept) {
        document.getElementById('deptId').value = dept.id;
        document.getElementById('deptName').value = dept.name;
        document.getElementById('deptCode').value = dept.code;
        document.getElementById('hod').value = dept.hod || '';
        document.getElementById('deptDesc').value = dept.description || '';
        document.getElementById('modalTitle').innerText = 'Edit Department';
        document.getElementById('deptModal').classList.add('active');
    }
}

function deleteDept(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        departments = departments.filter(d => d.id !== deleteId);
        saveDepts();
        updateStats();
        renderDepts();
        showToast('Department deleted successfully', 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

// ==================== SAVE DEPARTMENT ====================
function saveDept(e) {
    e.preventDefault();
    
    const id = document.getElementById('deptId').value;
    const data = {
        name: document.getElementById('deptName').value,
        code: document.getElementById('deptCode').value,
        hod: document.getElementById('hod').value,
        description: document.getElementById('deptDesc').value
    };
    
    if(id) {
        const index = departments.findIndex(d => d.id === parseInt(id));
        if(index !== -1) {
            departments[index] = { ...departments[index], ...data };
            showToast('Department updated successfully', 'success');
        }
    } else {
        const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1;
        departments.push({
            id: newId,
            ...data,
            createdAt: new Date().toISOString().split('T')[0]
        });
        showToast('Department added successfully', 'success');
    }
    
    saveDepts();
    updateStats();
    renderDepts();
    closeModal();
}

// ==================== MODAL CLOSE FUNCTIONS ====================
function closeModal() {
    document.getElementById('deptModal').classList.remove('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteId = null;
}

// ==================== UTILITIES ====================
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
    loadDepts();
    
    document.getElementById('addDeptBtn')?.addEventListener('click', openModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('deptForm')?.addEventListener('submit', saveDept);
});

// Make functions global for onclick
window.editDept = editDept;
window.deleteDept = deleteDept;