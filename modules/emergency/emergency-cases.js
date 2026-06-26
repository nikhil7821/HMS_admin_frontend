/**
 * Emergency Cases Management - Emergency Module
 * Version: 1.0 - Complete Emergency Case Tracking for Salary Integration
 */

let emergencyCases = [];
let patients = [];
let doctors = [];
let currentDeleteId = null;
let searchTerm = '';
let priorityFilter = '';
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

function getPriorityBadge(priority) {
    const map = {
        'critical': { label: '🔴 Critical', class: 'badge-critical' },
        'high': { label: '🟡 High', class: 'badge-high' },
        'medium': { label: '🔵 Medium', class: 'badge-medium' },
        'low': { label: '🟢 Low', class: 'badge-low' }
    };
    return map[priority] || { label: priority || 'Medium', class: 'badge-medium' };
}

function getStatusBadge(status) {
    const map = {
        'active': { label: 'Active', class: 'badge-active', dot: 'green' },
        'stabilized': { label: 'Stabilized', class: 'badge-stabilized', dot: 'blue' },
        'referred': { label: 'Referred', class: 'badge-referred', dot: 'yellow' },
        'discharged': { label: 'Discharged', class: 'badge-discharged', dot: 'gray' }
    };
    return map[status] || { label: status || 'Active', class: 'badge-active', dot: 'green' };
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        
        const stored = localStorage.getItem('hms_emergency_cases');
        if (stored) {
            emergencyCases = JSON.parse(stored);
            emergencyCases = emergencyCases.map(c => ({
                ...c,
                priority: c.priority || 'medium',
                status: c.status || 'active',
                createdAt: c.createdAt || new Date().toISOString()
            }));
            saveCases();
        } else {
            const today = new Date().toISOString().split('T')[0];
            emergencyCases = [
                { id: 1, patientId: 3, patientName: 'Manish Verma', doctorId: 2, doctorName: 'Dr. Vikram Singh', condition: 'Stroke Symptoms', priority: 'critical', status: 'active', date: today, treatment: 'CT Scan, Thrombolysis', notes: 'Under observation in ICU', createdAt: new Date().toISOString() },
                { id: 2, patientId: 9, patientName: 'Harsh Vardhan', doctorId: 2, doctorName: 'Dr. Vikram Singh', condition: 'Migraine with Aura', priority: 'high', status: 'stabilized', date: '2026-06-20', treatment: 'Pain management, Observation', notes: 'Stabilized and shifted to ward', createdAt: new Date().toISOString() },
                { id: 3, patientId: 6, patientName: 'Deepika Joshi', doctorId: 1, doctorName: 'Dr. Anjali Nair', condition: 'Heart Failure', priority: 'critical', status: 'active', date: '2026-06-15', treatment: 'ICU monitoring, Medications', notes: 'Critical condition, monitoring closely', createdAt: new Date().toISOString() }
            ];
            saveCases();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading emergency cases:', error);
        if (window.showToast) window.showToast('Error loading emergency data', 'error');
    }
}

function saveCases() {
    try {
        localStorage.setItem('hms_emergency_cases', JSON.stringify(emergencyCases));
    } catch (error) {
        console.error('Error saving emergency cases:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = emergencyCases.length;
    const active = emergencyCases.filter(c => c.status === 'active').length;
    const critical = emergencyCases.filter(c => c.priority === 'critical').length;
    const stabilized = emergencyCases.filter(c => c.status === 'stabilized').length;
    
    document.getElementById('totalCases').textContent = total;
    document.getElementById('activeCases').textContent = active;
    document.getElementById('criticalCases').textContent = critical;
    document.getElementById('stabilizedCases').textContent = stabilized;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredCases() {
    return emergencyCases.filter(c => {
        const matchesSearch = searchTerm === '' || 
            c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.condition.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = priorityFilter === '' || c.priority === priorityFilter;
        const matchesStatus = statusFilter === '' || c.status === statusFilter;
        return matchesSearch && matchesPriority && matchesStatus;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('caseTable');
    if (!tbody) return;
    
    const filtered = getFilteredCases();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-ambulance"></i>
                    <p>No emergency cases found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a case to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(c => {
        const priorityBadge = getPriorityBadge(c.priority);
        const statusBadge = getStatusBadge(c.status);
        
        return `
            <tr class="case-row" data-id="${c.id}">
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(c.patientName)}</td>
                <td style="color:var(--color-brown-300);">${esc(c.doctorName)}</td>
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(c.condition)}</td>
                <td><span class="badge-priority ${priorityBadge.class}">${priorityBadge.label}</span></td>
                <td><span class="badge-status ${statusBadge.class}"><span class="status-dot ${statusBadge.dot}"></span>${statusBadge.label}</span></td>
                <td style="text-align:center;">
                    <button class="action-btn view-btn" data-id="${c.id}" title="View"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit-btn" data-id="${c.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete delete-btn" data-id="${c.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewCase(parseInt(btn.dataset.id)));
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

// ─── Modal Functions ──────────────────────────────────

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
    document.getElementById('caseForm').reset();
    document.getElementById('editCaseId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-ambulance"></i> Add Emergency Case';
    document.getElementById('caseDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('priority').value = 'medium';
    document.getElementById('caseStatus').value = 'active';
    openModal('caseModal');
}

function openEditModal(id) {
    const c = emergencyCases.find(c => c.id === id);
    if (!c) return;
    
    populateSelects();
    document.getElementById('editCaseId').value = c.id;
    document.getElementById('patientId').value = c.patientId;
    document.getElementById('doctorId').value = c.doctorId;
    document.getElementById('condition').value = c.condition;
    document.getElementById('priority').value = c.priority;
    document.getElementById('caseStatus').value = c.status;
    document.getElementById('caseDate').value = c.date;
    document.getElementById('treatment').value = c.treatment || '';
    document.getElementById('notes').value = c.notes || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Case';
    openModal('caseModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveCase(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editCaseId').value;
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const condition = document.getElementById('condition').value.trim();
    const priority = document.getElementById('priority').value;
    const status = document.getElementById('caseStatus').value;
    const date = document.getElementById('caseDate').value || new Date().toISOString().split('T')[0];
    const treatment = document.getElementById('treatment').value.trim();
    const notes = document.getElementById('notes').value.trim();
    
    if (!patientId || !doctorId || !condition) {
        if (window.showToast) window.showToast('Please fill all required fields', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!patient || !doctor) {
        if (window.showToast) window.showToast('Invalid selection', 'error');
        return;
    }
    
    const data = {
        patientId, patientName: patient.fullName,
        doctorId, doctorName: doctor.name,
        condition, priority, status, date, treatment, notes,
        updatedAt: new Date().toISOString()
    };
    
    if (editId) {
        const index = emergencyCases.findIndex(c => c.id === parseInt(editId));
        if (index !== -1) {
            emergencyCases[index] = { ...emergencyCases[index], ...data };
            if (window.showToast) window.showToast(`✅ Case updated`, 'success');
        }
    } else {
        const newId = emergencyCases.length > 0 ? Math.max(...emergencyCases.map(c => c.id)) + 1 : 1;
        emergencyCases.push({ id: newId, ...data, createdAt: new Date().toISOString() });
        if (window.showToast) window.showToast(`✅ Case added`, 'success');
    }
    
    saveCases();
    refreshUI();
    closeModal('caseModal');
}

// ─── View Case ──────────────────────────────────────

function viewCase(id) {
    const c = emergencyCases.find(c => c.id === id);
    if (!c) return;
    
    const priorityBadge = getPriorityBadge(c.priority);
    const statusBadge = getStatusBadge(c.status);
    
    const content = document.getElementById('viewContent');
    content.innerHTML = `
        <div class="detail-grid">
            <div><p class="detail-label">Patient</p><p class="detail-value" style="font-weight:var(--font-weight-medium);">${esc(c.patientName)}</p></div>
            <div><p class="detail-label">Doctor</p><p class="detail-value" style="font-weight:var(--font-weight-medium);">${esc(c.doctorName)}</p></div>
            <div><p class="detail-label">Condition</p><p class="detail-value" style="font-weight:var(--font-weight-medium);">${esc(c.condition)}</p></div>
            <div><p class="detail-label">Priority</p><p class="detail-value"><span class="badge-priority ${priorityBadge.class}">${priorityBadge.label}</span></p></div>
            <div><p class="detail-label">Status</p><p class="detail-value"><span class="badge-status ${statusBadge.class}">${statusBadge.label}</span></p></div>
            <div><p class="detail-label">Date</p><p class="detail-value">${formatDate(c.date)}</p></div>
        </div>
        ${c.treatment ? `
            <div class="detail-section" style="margin-top:0.75rem;">
                <p class="detail-label">Treatment Given</p>
                <p class="detail-value" style="color:var(--color-brown-300);">${esc(c.treatment)}</p>
            </div>
        ` : ''}
        ${c.notes ? `
            <div class="detail-section" style="margin-top:0.75rem;">
                <p class="detail-label">Notes</p>
                <p class="detail-value" style="color:var(--color-brown-300);">${esc(c.notes)}</p>
            </div>
        ` : ''}
        <div style="font-size:0.6rem; color:var(--color-brown-100); border-top:1px solid var(--border-default); padding-top:0.5rem;">
            Created: ${formatDate(c.createdAt)}
        </div>
    `;
    
    document.getElementById('viewModalTitle').innerHTML = `<i class="fas fa-eye" style="color:var(--color-sage);"></i> ${esc(c.patientName)} - Emergency Case`;
    openModal('viewModal');
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!currentDeleteId) return;
    const c = emergencyCases.find(c => c.id === currentDeleteId);
    emergencyCases = emergencyCases.filter(c => c.id !== currentDeleteId);
    saveCases();
    refreshUI();
    closeModal('deleteModal');
    if (c && window.showToast) window.showToast(`🗑️ Case deleted for ${c.patientName}`, 'info');
    currentDeleteId = null;
}

// ─── Salary Integration ──────────────────────────────

function getEmergencyCasesForSalary(doctorId, month, year) {
    return emergencyCases.filter(c => {
        const caseDate = new Date(c.date);
        return c.doctorId === doctorId && 
               caseDate.getMonth() === month && 
               caseDate.getFullYear() === year;
    });
}

function getEmergencyCount(doctorId, month, year) {
    return getEmergencyCasesForSalary(doctorId, month, year).length;
}

// ─── Init ────────────────────────────────────────────

function initEmergencyCasesModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('🚀 Initializing Emergency Cases Module...');
    loadData();
    
    document.getElementById('addCaseBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('caseModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('caseModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('caseForm')?.addEventListener('submit', saveCase);
    document.getElementById('closeViewModalBtn')?.addEventListener('click', () => closeModal('viewModal'));
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', () => closeModal('viewModal'));
    document.getElementById('viewModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewModal');
    });
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = ''; priorityFilter = ''; statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('priorityFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    document.getElementById('priorityFilter')?.addEventListener('change', (e) => {
        priorityFilter = e.target.value;
        renderTable();
    });
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderTable();
    });
    
    document.getElementById('caseModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('caseModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('caseModal');
            closeModal('deleteModal');
            closeModal('viewModal');
        }
    });
    
    console.log('✅ Emergency Cases Module initialized. Total cases:', emergencyCases.length);
}

// ─── Expose ──────────────────────────────────────────

window.getEmergencyCasesForSalary = getEmergencyCasesForSalary;
window.getEmergencyCount = getEmergencyCount;

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        if (document.getElementById('mainSidebar')) {
            clearInterval(checkInterval);
            setTimeout(initEmergencyCasesModule, 100);
        }
    }, 50);
    setTimeout(() => { clearInterval(checkInterval); initEmergencyCasesModule(); }, 3000);
});