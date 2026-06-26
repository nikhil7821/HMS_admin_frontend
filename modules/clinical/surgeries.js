/**
 * Surgeries Management - Clinical Module
 * Version: 1.0 - Complete Surgery Tracking for Salary Integration
 */

let surgeries = [];
let patients = [];
let doctors = [];
let currentDeleteId = null;
let searchTerm = '';
let typeFilter = '';
let statusFilter = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function getTypeBadge(type) {
    const map = {
        'minor': { label: 'Minor', class: 'badge-minor' },
        'major': { label: 'Major', class: 'badge-major' },
        'complex': { label: 'Complex', class: 'badge-complex' },
        'specialist': { label: 'Specialist', class: 'badge-specialist' }
    };
    return map[type] || { label: type || 'Minor', class: 'badge-minor' };
}

function getStatusBadge(status) {
    const map = {
        'scheduled': { label: 'Scheduled', class: 'badge-scheduled' },
        'in-progress': { label: 'In Progress', class: 'badge-in-progress' },
        'completed': { label: 'Completed', class: 'badge-completed' },
        'cancelled': { label: 'Cancelled', class: 'badge-cancelled' }
    };
    return map[status] || { label: status || 'Scheduled', class: 'badge-scheduled' };
}

function getSurgeryFee(type) {
    const fees = {
        'minor': 5000,
        'major': 15000,
        'complex': 30000,
        'specialist': 25000
    };
    return fees[type] || 5000;
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        
        const stored = localStorage.getItem('hms_surgeries');
        if (stored) {
            surgeries = JSON.parse(stored);
            surgeries = surgeries.map(s => ({
                ...s,
                type: s.type || 'minor',
                status: s.status || 'scheduled',
                fee: s.fee || getSurgeryFee(s.type),
                createdAt: s.createdAt || new Date().toISOString()
            }));
            saveSurgeries();
        } else {
            const today = new Date().toISOString().split('T')[0];
            surgeries = [
                { id: 1, patientId: 1, patientName: 'Ramesh Gupta', doctorId: 1, doctorName: 'Dr. Anjali Nair', surgeryName: 'Bypass Surgery', type: 'complex', status: 'in-progress', date: today, room: 'OT-1', duration: 240, notes: 'Emergency bypass surgery', fee: 30000, createdAt: new Date().toISOString() },
                { id: 2, patientId: 4, patientName: 'Kiran Yadav', doctorId: 4, doctorName: 'Dr. Rajiv Menon', surgeryName: 'Appendectomy', type: 'major', status: 'completed', date: '2026-06-09', room: 'OT-3', duration: 90, notes: 'Routine appendectomy', fee: 15000, createdAt: new Date().toISOString() },
                { id: 3, patientId: 10, patientName: 'Shweta Sinha', doctorId: 4, doctorName: 'Dr. Rajiv Menon', surgeryName: 'Gallbladder Removal', type: 'major', status: 'completed', date: '2026-06-26', room: 'OT-2', duration: 120, notes: 'Laparoscopic cholecystectomy', fee: 15000, createdAt: new Date().toISOString() }
            ];
            saveSurgeries();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading surgeries:', error);
        if (window.showToast) window.showToast('Error loading surgery data', 'error');
    }
}

function saveSurgeries() {
    try {
        localStorage.setItem('hms_surgeries', JSON.stringify(surgeries));
    } catch (error) {
        console.error('Error saving surgeries:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = surgeries.length;
    const completed = surgeries.filter(s => s.status === 'completed').length;
    const inProgress = surgeries.filter(s => s.status === 'in-progress').length;
    const complex = surgeries.filter(s => s.type === 'complex').length;
    
    document.getElementById('totalSurgeries').textContent = total;
    document.getElementById('completedSurgeries').textContent = completed;
    document.getElementById('inProgressSurgeries').textContent = inProgress;
    document.getElementById('complexSurgeries').textContent = complex;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredSurgeries() {
    return surgeries.filter(s => {
        const matchesSearch = searchTerm === '' || 
            s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.surgeryName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === '' || s.type === typeFilter;
        const matchesStatus = statusFilter === '' || s.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('surgeryTable');
    if (!tbody) return;
    
    const filtered = getFilteredSurgeries();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-scalpel"></i>
                    <p>No surgeries found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a surgery to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(s => {
        const typeBadge = getTypeBadge(s.type);
        const statusBadge = getStatusBadge(s.status);
        
        return `
            <tr class="surgery-row" data-id="${s.id}">
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(s.patientName)}</td>
                <td style="color:var(--color-brown-300);">${esc(s.doctorName)}</td>
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(s.surgeryName)}</td>
                <td><span class="badge-surgery-type ${typeBadge.class}">${typeBadge.label}</span></td>
                <td style="font-size:0.75rem; color:var(--color-brown-300);">${formatDate(s.date)}</td>
                <td><span class="badge-status ${statusBadge.class}"><span class="status-dot ${statusBadge.dot || 'gray'}"></span>${statusBadge.label}</span></td>
                <td style="text-align:center;">
                    <button class="action-btn view-btn" data-id="${s.id}" title="View"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit-btn" data-id="${s.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete delete-btn" data-id="${s.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewSurgery(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── ─── Modal Functions ──────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}

function populateSelects() {
    const patientSelect = document.getElementById('patientId');
    const doctorSelect = document.getElementById('doctorId');
    
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select --</option>' + 
            patients.map(p => `<option value="${p.id}">${esc(p.fullName)}</option>`).join('');
    }
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select --</option>' + 
            doctors.map(d => `<option value="${d.id}">${esc(d.name)} (${d.specialization})</option>`).join('');
    }
}

function openAddModal() {
    populateSelects();
    document.getElementById('surgeryForm').reset();
    document.getElementById('editSurgeryId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-scalpel"></i> Add Surgery';
    document.getElementById('surgeryDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('surgeryType').value = 'minor';
    document.getElementById('surgeryStatus').value = 'scheduled';
    document.getElementById('duration').value = 60;
    openModal('surgeryModal');
}

function openEditModal(id) {
    const surgery = surgeries.find(s => s.id === id);
    if (!surgery) return;
    
    populateSelects();
    document.getElementById('editSurgeryId').value = surgery.id;
    document.getElementById('patientId').value = surgery.patientId;
    document.getElementById('doctorId').value = surgery.doctorId;
    document.getElementById('surgeryName').value = surgery.surgeryName;
    document.getElementById('surgeryType').value = surgery.type;
    document.getElementById('surgeryDate').value = surgery.date;
    document.getElementById('surgeryStatus').value = surgery.status;
    document.getElementById('room').value = surgery.room || '';
    document.getElementById('duration').value = surgery.duration || 60;
    document.getElementById('notes').value = surgery.notes || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Surgery';
    openModal('surgeryModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveSurgery(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editSurgeryId').value;
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const surgeryName = document.getElementById('surgeryName').value.trim();
    const type = document.getElementById('surgeryType').value;
    const date = document.getElementById('surgeryDate').value || new Date().toISOString().split('T')[0];
    const status = document.getElementById('surgeryStatus').value;
    const room = document.getElementById('room').value.trim();
    const duration = parseInt(document.getElementById('duration').value) || 60;
    const notes = document.getElementById('notes').value.trim();
    
    if (!patientId || !doctorId || !surgeryName) {
        if (window.showToast) window.showToast('Please fill all required fields', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!patient || !doctor) {
        if (window.showToast) window.showToast('Invalid selection', 'error');
        return;
    }
    
    const fee = getSurgeryFee(type);
    const data = {
        patientId, patientName: patient.fullName,
        doctorId, doctorName: doctor.name,
        surgeryName, type, date, status, room, duration, notes, fee,
        updatedAt: new Date().toISOString()
    };
    
    if (editId) {
        const index = surgeries.findIndex(s => s.id === parseInt(editId));
        if (index !== -1) {
            surgeries[index] = { ...surgeries[index], ...data };
            if (window.showToast) window.showToast(`✅ Surgery updated`, 'success');
        }
    } else {
        const newId = surgeries.length > 0 ? Math.max(...surgeries.map(s => s.id)) + 1 : 1;
        surgeries.push({ id: newId, ...data, createdAt: new Date().toISOString() });
        if (window.showToast) window.showToast(`✅ Surgery added`, 'success');
    }
    
    saveSurgeries();
    refreshUI();
    closeModal('surgeryModal');
}

// ─── View Surgery ────────────────────────────────────

function viewSurgery(id) {
    const s = surgeries.find(s => s.id === id);
    if (!s) return;
    
    const typeBadge = getTypeBadge(s.type);
    const statusBadge = getStatusBadge(s.status);
    
    const content = document.getElementById('viewContent');
    content.innerHTML = `
        <div class="detail-grid">
            <div><p class="detail-label">Patient</p><p class="detail-value" style="font-weight:var(--font-weight-medium);">${esc(s.patientName)}</p></div>
            <div><p class="detail-label">Surgeon</p><p class="detail-value" style="font-weight:var(--font-weight-medium);">${esc(s.doctorName)}</p></div>
            <div><p class="detail-label">Surgery</p><p class="detail-value" style="font-weight:var(--font-weight-medium);">${esc(s.surgeryName)}</p></div>
            <div><p class="detail-label">Type</p><p class="detail-value"><span class="badge-surgery-type ${typeBadge.class}">${typeBadge.label}</span></p></div>
            <div><p class="detail-label">Date</p><p class="detail-value">${formatDate(s.date)}</p></div>
            <div><p class="detail-label">Status</p><p class="detail-value"><span class="badge-status ${statusBadge.class}">${statusBadge.label}</span></p></div>
            <div><p class="detail-label">Room / OT</p><p class="detail-value">${esc(s.room) || 'N/A'}</p></div>
            <div><p class="detail-label">Duration</p><p class="detail-value">${s.duration || 0} mins</p></div>
            <div><p class="detail-label">Fee</p><p class="detail-value" style="font-weight:var(--font-weight-medium); color:var(--color-sage-dark);">₹${s.fee || 0}</p></div>
        </div>
        ${s.notes ? `
            <div class="detail-section" style="margin-top:0.75rem;">
                <p class="detail-label">Notes</p>
                <p class="detail-value" style="color:var(--color-brown-300);">${esc(s.notes)}</p>
            </div>
        ` : ''}
        <div style="font-size:0.6rem; color:var(--color-brown-100); border-top:1px solid var(--border-default); padding-top:0.5rem;">
            Created: ${formatDate(s.createdAt)}
        </div>
    `;
    
    document.getElementById('viewModalTitle').innerHTML = `<i class="fas fa-eye" style="color:var(--color-sage);"></i> ${esc(s.surgeryName)} - Details`;
    openModal('viewModal');
}

// ─── ─── Delete ─────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!currentDeleteId) return;
    const surgery = surgeries.find(s => s.id === currentDeleteId);
    surgeries = surgeries.filter(s => s.id !== currentDeleteId);
    saveSurgeries();
    refreshUI();
    closeModal('deleteModal');
    if (surgery && window.showToast) window.showToast(`🗑️ ${surgery.surgeryName} deleted`, 'info');
    currentDeleteId = null;
}

// ─── ─── Salary Integration Functions ───────────────────────────────

function getSurgeriesForSalary(doctorId, month, year) {
    return surgeries.filter(s => {
        const surgeryDate = new Date(s.date);
        return s.doctorId === doctorId && 
               surgeryDate.getMonth() === month && 
               surgeryDate.getFullYear() === year &&
               s.status === 'completed';
    });
}

function getSurgeryCount(doctorId, month, year) {
    return getSurgeriesForSalary(doctorId, month, year).length;
}

function getTotalSurgeryFee(doctorId, month, year) {
    const filtered = getSurgeriesForSalary(doctorId, month, year);
    return filtered.reduce((sum, s) => sum + (s.fee || 0), 0);
}

// ─── ─── Init ─────────────────────────────────────────────────────

function initSurgeriesModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('🚀 Initializing Surgeries Module...');
    loadData();
    
    document.getElementById('addSurgeryBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('surgeryModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('surgeryModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('surgeryForm')?.addEventListener('submit', saveSurgery);
    document.getElementById('closeViewModalBtn')?.addEventListener('click', () => closeModal('viewModal'));
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', () => closeModal('viewModal'));
    document.getElementById('viewModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewModal');
    });
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = ''; typeFilter = ''; statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    document.getElementById('typeFilter')?.addEventListener('change', (e) => {
        typeFilter = e.target.value;
        renderTable();
    });
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderTable();
    });
    
    document.getElementById('surgeryModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('surgeryModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('surgeryModal');
            closeModal('deleteModal');
            closeModal('viewModal');
        }
    });
    
    console.log('✅ Surgeries Module initialized. Total surgeries:', surgeries.length);
}

// ─── ─── Expose ────────────────────────────────────────────────────

window.getSurgeriesForSalary = getSurgeriesForSalary;
window.getSurgeryCount = getSurgeryCount;
window.getTotalSurgeryFee = getTotalSurgeryFee;

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        if (document.getElementById('mainSidebar')) {
            clearInterval(checkInterval);
            setTimeout(initSurgeriesModule, 100);
        }
    }, 50);
    setTimeout(() => { clearInterval(checkInterval); initSurgeriesModule(); }, 3000);
});