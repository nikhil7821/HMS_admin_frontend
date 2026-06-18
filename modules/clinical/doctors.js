/**
 * Doctors Management - Clinical Module
 * Uses theme.css for styling, no inline HTML event handlers
 */

let doctors = [];
let deleteTargetId = null;
let isInitialized = false;

// ─── 🔥 ADD THIS HERE - Auto-Open from Dashboard ───
document.addEventListener('DOMContentLoaded', function() {
    var action = sessionStorage.getItem('dashboard_action');
    if (action === 'openAddDoctor') {
        sessionStorage.removeItem('dashboard_action');
        setTimeout(function() {
            if (typeof openAddModal === 'function') {
                openAddModal();
            } else if (typeof window.openAddModal === 'function') {
                window.openAddModal();
            } else {
                var addBtn = document.getElementById('addDoctorBtn');
                if (addBtn) addBtn.click();
            }
        }, 600);
    }
});
// ─── 🔥 END OF AUTO-OPEN SECTION ────────────────────


// ─── Data Management ──────────────────────────────

function loadDoctors() {
    try {
        const stored = localStorage.getItem('hms_doctors');
        if (stored) {
            doctors = JSON.parse(stored);
        } else {
            // Seed data
            doctors = [
                {id: 1, name: 'Dr. Anjali Nair', specialization: 'Cardiologist', qualification: 'MD, DM', fee: 1500, phone: '+91 98765 43210', email: 'anjali.nair@medflow.com', experience: 12, status: 'Active'},
                {id: 2, name: 'Dr. Vikram Singh', specialization: 'Neurologist', qualification: 'MD, DM', fee: 1800, phone: '+91 98765 43211', email: 'vikram.singh@medflow.com', experience: 10, status: 'Active'},
                {id: 3, name: 'Dr. Sneha Joshi', specialization: 'Pediatrician', qualification: 'MD', fee: 1200, phone: '+91 98765 43212', email: 'sneha.joshi@medflow.com', experience: 8, status: 'Active'},
                {id: 4, name: 'Dr. Rajiv Menon', specialization: 'Orthopedic', qualification: 'MS', fee: 1400, phone: '+91 98765 43213', email: 'rajiv.menon@medflow.com', experience: 15, status: 'Active'},
                {id: 5, name: 'Dr. Neha Gupta', specialization: 'Dermatologist', qualification: 'MD', fee: 1300, phone: '+91 98765 43214', email: 'neha.gupta@medflow.com', experience: 7, status: 'Inactive'},
                {id: 6, name: 'Dr. Meera Desai', specialization: 'Gynecologist', qualification: 'MD, DGO', fee: 1600, phone: '+91 98765 43215', email: 'meera.desai@medflow.com', experience: 11, status: 'Active'},
                {id: 7, name: 'Dr. Sanjay Kulkarni', specialization: 'General Physician', qualification: 'MD', fee: 1000, phone: '+91 98765 43216', email: 'sanjay.kulkarni@medflow.com', experience: 9, status: 'Active'},
                {id: 8, name: 'Dr. Pooja Verma', specialization: 'Ophthalmologist', qualification: 'MS', fee: 1200, phone: '+91 98765 43217', email: 'pooja.verma@medflow.com', experience: 6, status: 'Active'}
            ];
            saveDoctors();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading doctors:', error);
        if (window.showToast) {
            window.showToast('Error loading doctors data', 'error');
        }
    }
}

function saveDoctors() {
    try {
        localStorage.setItem('hms_doctors', JSON.stringify(doctors));
    } catch (error) {
        console.error('Error saving doctors:', error);
    }
}

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getInitials(name) {
    if (!name) return 'D';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = doctors.length;
    const specs = [...new Set(doctors.map(d => d.specialization))];
    const active = doctors.filter(d => d.status === 'Active').length;
    const avg = doctors.length > 0 ? Math.round(doctors.reduce((sum, d) => sum + d.fee, 0) / doctors.length) : 0;
    
    document.getElementById('totalDoctors').textContent = total;
    document.getElementById('totalSpecs').textContent = specs.length;
    document.getElementById('activeDoctors').textContent = active;
    document.getElementById('avgFees').textContent = '₹' + avg.toLocaleString('en-IN');
}

// ─── Filter ──────────────────────────────────────────

function populateSpecializationFilter() {
    const specFilter = document.getElementById('specFilter');
    if (!specFilter) return;
    
    const specs = [...new Set(doctors.map(d => d.specialization))].sort();
    specFilter.innerHTML = '<option value="">All Specializations</option>' + 
        specs.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
}

function getFilteredDoctors() {
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const spec = document.getElementById('specFilter')?.value || '';
    
    return doctors.filter(d => {
        const matchSearch = !search || 
            d.name.toLowerCase().includes(search) || 
            d.specialization.toLowerCase().includes(search);
        const matchSpec = !spec || d.specialization === spec;
        return matchSearch && matchSpec;
    });
}

// ─── Render ──────────────────────────────────────────

function renderDoctors() {
    const grid = document.getElementById('doctorsGrid');
    if (!grid) return;
    
    const filtered = getFilteredDoctors();
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="doctors-empty">
                <i class="fas fa-user-md"></i>
                <p style="font-size:0.875rem;">No doctors found</p>
                <p style="font-size:0.75rem; margin-top:0.25rem;">Try adjusting your search or add a new doctor.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(doc => `
        <div class="doctor-card" data-id="${doc.id}">
            <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">
                <div class="doctor-avatar">${getInitials(doc.name)}</div>
                <div style="flex:1; min-width:0;">
                    <h3 class="doctor-name truncate">${esc(doc.name)}</h3>
                    <p class="doctor-spec truncate">${esc(doc.specialization)}</p>
                </div>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:0.375rem; margin-bottom:0.75rem;">
                <div class="doctor-meta">
                    <i class="fas fa-graduation-cap"></i>
                    <span>${esc(doc.qualification)}</span>
                </div>
                <div class="doctor-meta">
                    <i class="fas fa-rupee-sign"></i>
                    <span>₹${doc.fee.toLocaleString('en-IN')}</span>
                </div>
                <div class="doctor-meta">
                    <i class="fas fa-briefcase"></i>
                    <span>${doc.experience} yrs exp</span>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.625rem; border-top:1px solid var(--border-default);">
                <span class="${doc.status === 'Active' ? 'status-badge-active' : 'status-badge-inactive'}">
                    ${doc.status}
                </span>
                <div style="display:flex; gap:0.375rem;">
                    <button class="edit-doctor-btn icon-btn" data-id="${doc.id}" title="Edit Doctor">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="delete-doctor-btn icon-btn delete" data-id="${doc.id}" title="Delete Doctor">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Bind events using delegation
    grid.querySelectorAll('.edit-doctor-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });
    grid.querySelectorAll('.delete-doctor-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    populateSpecializationFilter();
    renderDoctors();
}

// ─── Modals ──────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('opacity-100', 'visible');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('opacity-100', 'visible');
}

function openAddModal() {
    document.getElementById('doctorForm').reset();
    document.getElementById('doctorId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-md"></i> Add Doctor';
    document.getElementById('doctorModal').classList.add('opacity-100', 'visible');
}

function openEditModal(id) {
    const doc = doctors.find(d => d.id === id);
    if (!doc) return;
    
    document.getElementById('doctorId').value = doc.id;
    document.getElementById('name').value = doc.name;
    document.getElementById('specialization').value = doc.specialization;
    document.getElementById('qualification').value = doc.qualification;
    document.getElementById('fee').value = doc.fee;
    document.getElementById('phone').value = doc.phone;
    document.getElementById('email').value = doc.email;
    document.getElementById('experience').value = doc.experience;
    document.getElementById('status').value = doc.status;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-pen"></i> Edit Doctor';
    document.getElementById('doctorModal').classList.add('opacity-100', 'visible');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    document.getElementById('deleteModal').classList.add('opacity-100', 'visible');
}

// ─── Form Submit ────────────────────────────────────

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('doctorId').value;
    const data = {
        name: document.getElementById('name').value.trim(),
        specialization: document.getElementById('specialization').value.trim(),
        qualification: document.getElementById('qualification').value.trim(),
        fee: parseInt(document.getElementById('fee').value) || 0,
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        experience: parseInt(document.getElementById('experience').value) || 0,
        status: document.getElementById('status').value
    };
    
    // Basic validation
    if (!data.name || !data.specialization || !data.qualification || !data.fee || !data.phone || !data.email) {
        if (window.showToast) {
            window.showToast('Please fill in all required fields', 'error');
        }
        return;
    }
    
    if (id) {
        const index = doctors.findIndex(d => d.id === parseInt(id));
        if (index !== -1) {
            doctors[index] = { ...doctors[index], ...data };
            if (window.showToast) window.showToast(`✅ ${data.name} updated successfully`, 'success');
        }
    } else {
        const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
        doctors.push({ id: newId, ...data });
        if (window.showToast) window.showToast(`✅ ${data.name} added successfully`, 'success');
    }
    
    saveDoctors();
    refreshUI();
    closeModal('doctorModal');
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    const doc = doctors.find(d => d.id === deleteTargetId);
    doctors = doctors.filter(d => d.id !== deleteTargetId);
    saveDoctors();
    refreshUI();
    closeModal('deleteModal');
    
    if (doc && window.showToast) {
        window.showToast(`🗑️ ${doc.name} deleted`, 'error');
    }
    deleteTargetId = null;
}

// ─── Init ────────────────────────────────────────────

function initDoctorsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadDoctors();
    
    // Event Listeners
    document.getElementById('addDoctorBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('doctorModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('doctorModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('doctorForm')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('searchInput')?.addEventListener('input', renderDoctors);
    document.getElementById('specFilter')?.addEventListener('change', renderDoctors);
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('specFilter').value = '';
        renderDoctors();
    });
    
    // Close modals on overlay click
    document.getElementById('doctorModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('doctorModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('doctorModal');
            closeModal('deleteModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────

document.addEventListener('DOMContentLoaded', function() {
    // Check if common.js has loaded sidebar
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            // Small delay to ensure sidebar is fully rendered
            setTimeout(initDoctorsModule, 100);
        }
    }, 50);
    
    // Fallback: if sidebar doesn't load in 3 seconds, init anyway
    setTimeout(() => {
        clearInterval(checkInterval);
        initDoctorsModule();
    }, 3000);
});