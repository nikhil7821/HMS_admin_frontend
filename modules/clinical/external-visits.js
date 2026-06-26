/**
 * External Doctor Visits Management - Clinical Module
 * Version: 1.0 - Complete External Visit Tracking
 * 
 * Features:
 * ✅ Track doctor visits to external hospitals
 * ✅ Link with Doctors and Patients modules
 * ✅ Payment tracking (Pending/Paid/Partial)
 * ✅ Settlement tracking (Pending/Settled/Overdue)
 * ✅ Amount tracking and reporting
 * ✅ Integration with Billing module
 */

let visits = [];
let doctors = [];
let patients = [];
let currentDeleteId = null;
let searchTerm = '';
let paymentFilter = '';
let settlementFilter = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────────────────

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

function formatCurrency(amount) {
    return '$' + (amount || 0).toFixed(2);
}

// ─── Data Management ────────────────────────────────────────────

function loadData() {
    try {
        // Load doctors
        const doctorsData = localStorage.getItem('hms_doctors');
        if (doctorsData) {
            doctors = JSON.parse(doctorsData);
        } else {
            doctors = [];
        }
        
        // Load patients
        const patientsData = localStorage.getItem('hms_patients');
        if (patientsData) {
            patients = JSON.parse(patientsData);
        } else {
            patients = [];
        }
        
        // Load visits
        const stored = localStorage.getItem('hms_external_visits');
        if (stored) {
            visits = JSON.parse(stored);
            visits = visits.map(v => ({
                ...v,
                paymentStatus: v.paymentStatus || 'pending',
                settlementStatus: v.settlementStatus || 'pending',
                purpose: v.purpose || '',
                notes: v.notes || '',
                createdAt: v.createdAt || new Date().toISOString(),
                updatedAt: v.updatedAt || new Date().toISOString()
            }));
            saveVisits();
        } else {
            // Seed data
            visits = [
                {
                    id: 1,
                    doctorId: 1,
                    doctorName: 'Dr. Anjali Nair',
                    patientId: 1,
                    patientName: 'Ramesh Gupta',
                    hospitalName: 'City Heart Hospital',
                    visitDate: '2026-06-20',
                    amount: 500,
                    paymentStatus: 'pending',
                    settlementStatus: 'pending',
                    purpose: 'Cardiac consultation for bypass surgery',
                    notes: 'Patient referred from City Heart Hospital',
                    createdAt: '2026-06-19T10:30:00',
                    updatedAt: '2026-06-19T10:30:00'
                },
                {
                    id: 2,
                    doctorId: 2,
                    doctorName: 'Dr. Vikram Singh',
                    patientId: 3,
                    patientName: 'Manish Verma',
                    hospitalName: 'Neuro Specialists Clinic',
                    visitDate: '2026-06-18',
                    amount: 750,
                    paymentStatus: 'paid',
                    settlementStatus: 'settled',
                    purpose: 'Neurology evaluation for stroke patient',
                    notes: 'Payment received via bank transfer',
                    createdAt: '2026-06-17T14:20:00',
                    updatedAt: '2026-06-18T09:15:00'
                },
                {
                    id: 3,
                    doctorId: 3,
                    doctorName: 'Dr. Sneha Joshi',
                    patientId: 2,
                    patientName: 'Sneha Patil',
                    hospitalName: 'Ortho Care Hospital',
                    visitDate: '2026-06-16',
                    amount: 300,
                    paymentStatus: 'partial',
                    settlementStatus: 'pending',
                    purpose: 'Post-surgery follow-up for fracture',
                    notes: 'Partial payment of $150 received',
                    createdAt: '2026-06-15T11:00:00',
                    updatedAt: '2026-06-16T16:30:00'
                },
                {
                    id: 4,
                    doctorId: 1,
                    doctorName: 'Dr. Anjali Nair',
                    patientId: 6,
                    patientName: 'Deepika Joshi',
                    hospitalName: 'Apollo Heart Institute',
                    visitDate: '2026-06-22',
                    amount: 1200,
                    paymentStatus: 'pending',
                    settlementStatus: 'overdue',
                    purpose: 'Emergency cardiac evaluation',
                    notes: 'Payment overdue by 5 days',
                    createdAt: '2026-06-21T09:00:00',
                    updatedAt: '2026-06-21T09:00:00'
                }
            ];
            saveVisits();
        }
        
        refreshUI();
        populateDoctorSelects();
        populatePatientSelects();
    } catch (error) {
        console.error('Error loading visits:', error);
        if (window.showToast) {
            window.showToast('Error loading visit data', 'error');
        }
    }
}

function saveVisits() {
    try {
        localStorage.setItem('hms_external_visits', JSON.stringify(visits));
    } catch (error) {
        console.error('Error saving visits:', error);
    }
}

function populateDoctorSelects() {
    const select = document.getElementById('doctorId');
    if (!select) return;
    
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Select Doctor --</option>' + 
        doctors.map(d => `<option value="${d.id}">${esc(d.name)} (${d.specialization})</option>`).join('');
    
    if (currentVal) select.value = currentVal;
}

function populatePatientSelects() {
    const select = document.getElementById('patientId');
    if (!select) return;
    
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Select Patient --</option>' + 
        patients.map(p => `<option value="${p.id}">${esc(p.fullName)} (P-${p.id.toString().padStart(5, '0')})</option>`).join('');
    
    if (currentVal) select.value = currentVal;
}

// ─── Stats ──────────────────────────────────────────────────────

function updateStats() {
    const total = visits.length;
    const totalAmount = visits.reduce((sum, v) => sum + (v.amount || 0), 0);
    const pendingAmount = visits
        .filter(v => v.paymentStatus === 'pending' || v.paymentStatus === 'partial')
        .reduce((sum, v) => sum + (v.amount || 0), 0);
    const settledCount = visits.filter(v => v.settlementStatus === 'settled').length;
    
    document.getElementById('totalVisits').textContent = total;
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('pendingAmount').textContent = formatCurrency(pendingAmount);
    document.getElementById('settledCount').textContent = settledCount;
}

// ─── Filter ──────────────────────────────────────────────────────

function getFilteredVisits() {
    return visits.filter(v => {
        const matchesSearch = searchTerm === '' || 
            v.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesPayment = paymentFilter === '' || v.paymentStatus === paymentFilter;
        const matchesSettlement = settlementFilter === '' || v.settlementStatus === settlementFilter;
        
        return matchesSearch && matchesPayment && matchesSettlement;
    });
}

// ─── Render ──────────────────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('visitsTableBody');
    if (!tbody) return;
    
    const filtered = getFilteredVisits();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-ambulance"></i>
                    <p>No external visits found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a visit to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
    
    tbody.innerHTML = sorted.map(v => {
        const paymentBadge = getPaymentBadge(v.paymentStatus);
        const settlementBadge = getSettlementBadge(v.settlementStatus);
        
        return `
            <tr class="visit-row" data-id="${v.id}">
                <td class="col-doctor" style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">
                    ${esc(v.doctorName)}
                </td>
                <td class="col-patient">${esc(v.patientName)}</td>
                <td class="col-hospital" style="color:var(--color-brown-300);">${esc(v.hospitalName)}</td>
                <td class="col-date" style="font-size:0.8rem;">${formatDate(v.visitDate)}</td>
                <td class="col-amount" style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">
                    ${formatCurrency(v.amount)}
                </td>
                <td class="col-status"><span class="badge-status ${paymentBadge.class}"><span class="status-dot ${paymentBadge.dot}"></span>${paymentBadge.label}</span></td>
                <td class="col-status"><span class="badge-status ${settlementBadge.class}"><span class="status-dot ${settlementBadge.dot}"></span>${settlementBadge.label}</span></td>
                <td class="col-actions">
                    <div style="display:flex; gap:0.25rem; justify-content:center;">
                        <button class="action-btn view-btn" data-id="${v.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" data-id="${v.id}" title="Edit Visit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete delete-btn" data-id="${v.id}" title="Delete Visit">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Bind events
    tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            viewVisit(parseInt(this.dataset.id));
        });
    });
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            openEditModal(parseInt(this.dataset.id));
        });
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            openDeleteModal(parseInt(this.dataset.id));
        });
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Badge Helpers ──────────────────────────────────────────────

function getPaymentBadge(status) {
    const map = {
        'pending': { label: 'Pending', class: 'badge-pending', dot: 'yellow' },
        'paid': { label: 'Paid', class: 'badge-paid', dot: 'green' },
        'partial': { label: 'Partial', class: 'badge-partial', dot: 'blue' }
    };
    return map[status] || map['pending'];
}

function getSettlementBadge(status) {
    const map = {
        'pending': { label: 'Pending', class: 'badge-pending', dot: 'yellow' },
        'settled': { label: 'Settled', class: 'badge-settled', dot: 'green' },
        'overdue': { label: 'Overdue', class: 'badge-overdue', dot: 'red' }
    };
    return map[status] || map['pending'];
}

// ─── View Visit ──────────────────────────────────────────────────

function viewVisit(id) {
    const visit = visits.find(v => v.id === id);
    if (!visit) return;
    
    const paymentBadge = getPaymentBadge(visit.paymentStatus);
    const settlementBadge = getSettlementBadge(visit.settlementStatus);
    
    const content = document.getElementById('viewVisitContent');
    content.innerHTML = `
        <div style="display:grid; gap:0.25rem;">
            <div class="detail-row">
                <span class="detail-label">Doctor</span>
                <span class="detail-value"><strong>${esc(visit.doctorName)}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Patient</span>
                <span class="detail-value"><strong>${esc(visit.patientName)}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">External Hospital</span>
                <span class="detail-value">${esc(visit.hospitalName)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Visit Date</span>
                <span class="detail-value">${formatDate(visit.visitDate)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value" style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">
                    ${formatCurrency(visit.amount)}
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Status</span>
                <span class="detail-value"><span class="badge-status ${paymentBadge.class}"><span class="status-dot ${paymentBadge.dot}"></span>${paymentBadge.label}</span></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Settlement Status</span>
                <span class="detail-value"><span class="badge-status ${settlementBadge.class}"><span class="status-dot ${settlementBadge.dot}"></span>${settlementBadge.label}</span></span>
            </div>
            ${visit.purpose ? `
                <div class="detail-row" style="flex-direction:column; align-items:stretch; gap:0.25rem;">
                    <span class="detail-label">Purpose</span>
                    <span class="detail-value" style="font-size:0.8rem; color:var(--color-brown-300);">${esc(visit.purpose)}</span>
                </div>
            ` : ''}
            ${visit.notes ? `
                <div class="detail-row" style="flex-direction:column; align-items:stretch; gap:0.25rem;">
                    <span class="detail-label">Notes</span>
                    <span class="detail-value" style="font-size:0.8rem; color:var(--color-brown-300);">${esc(visit.notes)}</span>
                </div>
            ` : ''}
            <div class="detail-row">
                <span class="detail-label">Created</span>
                <span class="detail-value" style="font-size:0.7rem; color:var(--color-brown-100);">${formatDate(visit.createdAt)}</span>
            </div>
            ${visit.updatedAt ? `
                <div class="detail-row">
                    <span class="detail-label">Updated</span>
                    <span class="detail-value" style="font-size:0.7rem; color:var(--color-brown-100);">${formatDate(visit.updatedAt)}</span>
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('viewModalTitle').innerHTML = `<i class="fas fa-eye" style="color:var(--color-sage);"></i> ${esc(visit.doctorName)} - External Visit`;
    openModal('viewVisitModal');
}

// ─── Modals ──────────────────────────────────────────────────────

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
    populateDoctorSelects();
    populatePatientSelects();
    document.getElementById('visitForm').reset();
    document.getElementById('visitId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-ambulance"></i> Add External Visit';
    document.getElementById('visitDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('paymentStatus').value = 'pending';
    document.getElementById('settlementStatus').value = 'pending';
    openModal('visitModal');
}

function openEditModal(id) {
    const visit = visits.find(v => v.id === id);
    if (!visit) return;
    
    populateDoctorSelects();
    populatePatientSelects();
    
    document.getElementById('visitId').value = visit.id;
    document.getElementById('doctorId').value = visit.doctorId;
    document.getElementById('patientId').value = visit.patientId;
    document.getElementById('hospitalName').value = visit.hospitalName;
    document.getElementById('visitDate').value = visit.visitDate;
    document.getElementById('amount').value = visit.amount;
    document.getElementById('paymentStatus').value = visit.paymentStatus || 'pending';
    document.getElementById('settlementStatus').value = visit.settlementStatus || 'pending';
    document.getElementById('purpose').value = visit.purpose || '';
    document.getElementById('notes').value = visit.notes || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit External Visit';
    openModal('visitModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── Form Submit ──────────────────────────────────────────────────

function saveVisit(e) {
    e.preventDefault();
    
    const id = document.getElementById('visitId').value;
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const patientId = parseInt(document.getElementById('patientId').value);
    const hospitalName = document.getElementById('hospitalName').value.trim();
    const visitDate = document.getElementById('visitDate').value;
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const paymentStatus = document.getElementById('paymentStatus').value;
    const settlementStatus = document.getElementById('settlementStatus').value;
    const purpose = document.getElementById('purpose').value.trim();
    const notes = document.getElementById('notes').value.trim();
    
    if (!doctorId || !patientId || !hospitalName || !visitDate || !amount) {
        if (window.showToast) {
            window.showToast('Please fill in all required fields', 'error');
        }
        return;
    }
    
    // Get doctor and patient names
    const doctor = doctors.find(d => d.id === doctorId);
    const patient = patients.find(p => p.id === patientId);
    
    if (!doctor || !patient) {
        if (window.showToast) {
            window.showToast('Invalid doctor or patient selection', 'error');
        }
        return;
    }
    
    const visitData = {
        doctorId: doctorId,
        doctorName: doctor.name,
        patientId: patientId,
        patientName: patient.fullName,
        hospitalName: hospitalName,
        visitDate: visitDate,
        amount: amount,
        paymentStatus: paymentStatus,
        settlementStatus: settlementStatus,
        purpose: purpose,
        notes: notes,
        updatedAt: new Date().toISOString()
    };
    
    if (id) {
        // Edit existing
        const index = visits.findIndex(v => v.id === parseInt(id));
        if (index !== -1) {
            visits[index] = { ...visits[index], ...visitData };
            if (window.showToast) window.showToast(`✅ Visit updated for ${doctor.name}`, 'success');
        }
    } else {
        // Add new
        const newId = visits.length > 0 ? Math.max(...visits.map(v => v.id)) + 1 : 1;
        visits.push({
            id: newId,
            ...visitData,
            createdAt: new Date().toISOString()
        });
        if (window.showToast) window.showToast(`✅ Visit added for ${doctor.name}`, 'success');
    }
    
    saveVisits();
    refreshUI();
    closeModal('visitModal');
}

// ─── Delete ──────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!currentDeleteId) return;
    
    const visit = visits.find(v => v.id === currentDeleteId);
    visits = visits.filter(v => v.id !== currentDeleteId);
    saveVisits();
    refreshUI();
    closeModal('deleteModal');
    
    if (visit && window.showToast) {
        window.showToast(`🗑️ Visit deleted for ${visit.doctorName}`, 'info');
    }
    currentDeleteId = null;
}

// ─── Init ───────────────────────────────────────────────────────

function initExternalVisits() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('🚀 Initializing External Visits Module...');
    loadData();
    
    // Event Listeners
    document.getElementById('addVisitBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('visitModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('visitModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('visitForm')?.addEventListener('submit', saveVisit);
    
    // View Modal close
    document.getElementById('closeViewModalBtn')?.addEventListener('click', () => closeModal('viewVisitModal'));
    document.getElementById('closeViewModalFooterBtn')?.addEventListener('click', () => closeModal('viewVisitModal'));
    document.getElementById('viewVisitModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewVisitModal');
    });
    
    // Filters
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = '';
        paymentFilter = '';
        settlementFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('paymentFilter').value = '';
        document.getElementById('settlementFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('paymentFilter')?.addEventListener('change', (e) => {
        paymentFilter = e.target.value;
        renderTable();
    });
    
    document.getElementById('settlementFilter')?.addEventListener('change', (e) => {
        settlementFilter = e.target.value;
        renderTable();
    });
    
    // Close modals on overlay click
    document.getElementById('visitModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('visitModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('visitModal');
            closeModal('deleteModal');
            closeModal('viewVisitModal');
        }
    });
    
    console.log('✅ External Visits Module initialized. Total visits:', visits.length);
}

// ─── Wait for DOM ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initExternalVisits, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initExternalVisits();
    }, 3000);
});

// ─── Expose Functions ────────────────────────────────────────────

window.openAddModal = openAddModal;
window.openModal = openModal;
window.closeModal = closeModal;