/**
 * Consultation Management JS - Clinical Module
 * Version: 2.0 - Added OPD/IPD Tracking, Fee, and Salary Integration
 * 
 * Features:
 * ✅ OPD/IPD/Emergency/Follow-up tracking
 * ✅ Consultation fee management
 * ✅ Doctor salary integration support
 * ✅ Patient and doctor linking
 * ✅ Prescription management
 */

let consultations = [];
let patients = [];
let doctors = [];
let searchTerm = '';
let typeFilter = '';
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
        return d.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    } catch {
        return dateStr;
    }
}

function getConsultTypeBadge(type) {
    const map = {
        'opd': { label: 'OPD', class: 'badge-opd' },
        'ipd': { label: 'IPD', class: 'badge-ipd' },
        'emergency': { label: '🚨 Emergency', class: 'badge-emergency' },
        'followup': { label: 'Follow-up', class: 'badge-followup' }
    };
    return map[type] || { label: type || 'OPD', class: 'badge-opd' };
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        
        const stored = localStorage.getItem('hms_consultations');
        if (stored) {
            consultations = JSON.parse(stored);
            // Ensure new fields exist
            consultations = consultations.map(c => ({
                ...c,
                type: c.type || 'opd',
                fee: c.fee || 500,
                createdAt: c.createdAt || new Date().toISOString()
            }));
            saveConsultations();
        } else {
            // Demo consultations with types and fees
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
            
            consultations = [
                {
                    id: 1, 
                    patientId: 1, 
                    patientName: 'Rajesh Kumar', 
                    doctorId: 1, 
                    doctorName: 'Dr. Anjali Nair', 
                    date: today, 
                    type: 'opd',
                    fee: 500,
                    symptoms: 'Chest pain, shortness of breath, palpitations', 
                    diagnosis: 'Hypertension Stage 2', 
                    prescription: 'Amlodipine 5mg once daily\nAtenolol 25mg once daily', 
                    notes: 'Follow up in 2 weeks. Monitor BP daily.',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2, 
                    patientId: 2, 
                    patientName: 'Priya Sharma', 
                    doctorId: 2, 
                    doctorName: 'Dr. Vikram Singh', 
                    date: yesterday, 
                    type: 'ipd',
                    fee: 800,
                    symptoms: 'Severe headache, blurred vision, nausea', 
                    diagnosis: 'Migraine with Aura', 
                    prescription: 'Sumatriptan 50mg as needed\nPropranolol 40mg daily for prevention', 
                    notes: 'Avoid bright lights and stress. Keep a headache diary.',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3, 
                    patientId: 3, 
                    patientName: 'Amit Patel', 
                    doctorId: 3, 
                    doctorName: 'Dr. Sneha Joshi', 
                    date: twoDaysAgo, 
                    type: 'emergency',
                    fee: 1000,
                    symptoms: 'Fever 101°F, cough, body ache, fatigue', 
                    diagnosis: 'Viral Fever with Upper Respiratory Infection', 
                    prescription: 'Paracetamol 500mg SOS\nCough syrup 10ml TID\nRest and hydration', 
                    notes: 'Monitor temperature. Review if fever persists >3 days.',
                    createdAt: new Date().toISOString()
                }
            ];
            saveConsultations();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading consultations:', error);
        if (window.showToast) {
            window.showToast('Error loading consultation data', 'error');
        }
    }
}

function saveConsultations() {
    try {
        localStorage.setItem('hms_consultations', JSON.stringify(consultations));
    } catch (error) {
        console.error('Error saving consultations:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = consultations.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayConsults = consultations.filter(c => c.date === today).length;
    
    const opdCount = consultations.filter(c => c.type === 'opd').length;
    const ipdCount = consultations.filter(c => c.type === 'ipd').length;
    
    const withPrescription = consultations.filter(c => c.prescription && c.prescription.trim()).length;
    
    document.getElementById('totalConsults').textContent = total;
    document.getElementById('todayConsults').textContent = todayConsults;
    document.getElementById('opdIpdCount').textContent = `${opdCount}/${ipdCount}`;
    document.getElementById('prescriptionCount').textContent = withPrescription;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredConsultations() {
    return consultations.filter(c => {
        const matchesSearch = searchTerm === '' || 
            c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = typeFilter === '' || c.type === typeFilter;
        
        return matchesSearch && matchesType;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('consultTable');
    if (!tbody) return;
    
    const filtered = getFilteredConsultations();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="consult-empty">
                    <i class="fas fa-notes-medical"></i>
                    <p>No consultations found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Start a new consultation to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(c => {
        const typeBadge = getConsultTypeBadge(c.type);
        const diagnosisDisplay = c.diagnosis.length > 25 ? 
            c.diagnosis.substring(0, 25) + '...' : 
            c.diagnosis;
        
        return `
            <tr class="consult-row" data-id="${c.id}">
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(c.patientName)}</td>
                <td style="color:var(--color-brown-300);">${esc(c.doctorName)}</td>
                <td style="color:var(--color-brown-300); font-size:0.75rem;">${formatDate(c.date)}</td>
                <td><span class="badge-consult-type ${typeBadge.class}">${typeBadge.label}</span></td>
                <td style="color:var(--color-brown-300);">${esc(diagnosisDisplay)}</td>
                <td style="text-align:center;">
                    <button class="action-btn view-btn" data-id="${c.id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Bind events
    tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            viewConsultation(parseInt(this.dataset.id));
        });
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Modals ──────────────────────────────────────────

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
    const patientSelect = document.getElementById('patientId');
    const doctorSelect = document.getElementById('doctorId');
    
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${esc(p.fullName)} (${p.phone})</option>`).join('');
    }
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${esc(d.name)} (${d.specialization})</option>`).join('');
    }
    
    // Set default values
    const dateInput = document.getElementById('consultDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('editConsultId').value = '';
    document.getElementById('consultType').value = 'opd';
    document.getElementById('consultFee').value = 500;
    document.getElementById('symptoms').value = '';
    document.getElementById('diagnosis').value = '';
    document.getElementById('prescription').value = '';
    document.getElementById('notes').value = '';
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-stethoscope"></i> New Consultation';
    openModal('consultModal');
}

// ─── Form Submit ────────────────────────────────────

function saveConsultation(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editConsultId').value;
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const type = document.getElementById('consultType').value;
    const fee = parseInt(document.getElementById('consultFee').value) || 500;
    const symptoms = document.getElementById('symptoms').value.trim();
    const diagnosis = document.getElementById('diagnosis').value.trim();
    const prescription = document.getElementById('prescription').value.trim();
    const notes = document.getElementById('notes').value.trim();
    const date = document.getElementById('consultDate').value || new Date().toISOString().split('T')[0];
    
    if (!patientId || !doctorId) {
        if (window.showToast) {
            window.showToast('Please select both patient and doctor', 'error');
        }
        return;
    }
    
    if (!diagnosis) {
        if (window.showToast) {
            window.showToast('Please enter a diagnosis', 'error');
        }
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!patient || !doctor) {
        if (window.showToast) {
            window.showToast('Invalid patient or doctor selection', 'error');
        }
        return;
    }
    
    const consultData = {
        patientId: patientId,
        patientName: patient.fullName,
        doctorId: doctorId,
        doctorName: doctor.name,
        date: date,
        type: type,
        fee: fee,
        symptoms: symptoms,
        diagnosis: diagnosis,
        prescription: prescription,
        notes: notes,
        updatedAt: new Date().toISOString()
    };
    
    if (editId) {
        // Update existing
        const index = consultations.findIndex(c => c.id === parseInt(editId));
        if (index !== -1) {
            consultations[index] = { ...consultations[index], ...consultData };
            if (window.showToast) window.showToast(`✅ Consultation updated for ${patient.fullName}`, 'success');
        }
    } else {
        // Add new
        const newId = consultations.length > 0 ? Math.max(...consultations.map(c => c.id)) + 1 : 1;
        consultations.push({
            id: newId,
            ...consultData,
            createdAt: new Date().toISOString()
        });
        if (window.showToast) window.showToast(`✅ Consultation saved for ${patient.fullName}`, 'success');
    }
    
    saveConsultations();
    refreshUI();
    closeModal('consultModal');
}

// ─── View Consultation ────────────────────────────

function viewConsultation(id) {
    const c = consultations.find(c => c.id === id);
    if (!c) return;
    
    const typeBadge = getConsultTypeBadge(c.type);
    
    const viewContent = document.getElementById('viewContent');
    viewContent.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
            <div class="detail-grid">
                <div>
                    <p class="detail-label">Patient Name</p>
                    <p class="detail-value" style="font-weight:var(--font-weight-medium);">${esc(c.patientName)}</p>
                </div>
                <div>
                    <p class="detail-label">Doctor</p>
                    <p class="detail-value" style="font-weight:var(--font-weight-medium);">${esc(c.doctorName)}</p>
                </div>
                <div>
                    <p class="detail-label">Date</p>
                    <p class="detail-value">${formatDate(c.date)}</p>
                </div>
                <div>
                    <p class="detail-label">Type</p>
                    <p class="detail-value"><span class="badge-consult-type ${typeBadge.class}">${typeBadge.label}</span></p>
                </div>
                <div>
                    <p class="detail-label">Consultation Fee</p>
                    <p class="detail-value" style="font-weight:var(--font-weight-medium); color:var(--color-sage-dark);">₹${c.fee || 500}</p>
                </div>
                <div>
                    <p class="detail-label">Diagnosis</p>
                    <p class="detail-value" style="font-weight:var(--font-weight-medium);">${esc(c.diagnosis)}</p>
                </div>
            </div>
            
            ${c.symptoms ? `
            <div class="detail-section">
                <p class="detail-label">Symptoms / Chief Complaints</p>
                <p class="detail-value">${esc(c.symptoms)}</p>
            </div>
            ` : ''}
            
            ${c.prescription ? `
            <div class="detail-section">
                <p class="detail-label">Prescription</p>
                <div class="prescription-box">
                    <p>${esc(c.prescription)}</p>
                </div>
            </div>
            ` : ''}
            
            ${c.notes ? `
            <div class="detail-section" style="border-bottom:none; margin-bottom:0; padding-bottom:0;">
                <p class="detail-label">Additional Notes</p>
                <p class="detail-value" style="color:var(--color-brown-300);">${esc(c.notes)}</p>
            </div>
            ` : ''}
            
            <div style="font-size:0.6rem; color:var(--color-brown-100); border-top:1px solid var(--border-default); padding-top:0.5rem;">
                Created: ${formatDate(c.createdAt)}
            </div>
        </div>
    `;
    
    document.getElementById('viewModalTitle').innerHTML = 
        `<i class="fas fa-file-medical" style="color:var(--color-sage);"></i> Consultation - ${esc(c.patientName)}`;
    openModal('viewModal');
}

// ─── ─── Get Consultations for Salary Calculation ─────────────────────

// This function is used by the salary module to fetch consultations
function getConsultationsForSalary(doctorId, month, year) {
    return consultations.filter(c => {
        const consultDate = new Date(c.date);
        return c.doctorId === doctorId && 
               consultDate.getMonth() === month && 
               consultDate.getFullYear() === year;
    });
}

// Get consultation count by type
function getConsultationCount(doctorId, month, year, type) {
    const filtered = getConsultationsForSalary(doctorId, month, year);
    if (type) {
        return filtered.filter(c => c.type === type).length;
    }
    return filtered.length;
}

// Get total consultation fee
function getTotalConsultationFee(doctorId, month, year) {
    const filtered = getConsultationsForSalary(doctorId, month, year);
    return filtered.reduce((sum, c) => sum + (c.fee || 500), 0);
}

// ─── Init ────────────────────────────────────────────

function initConsultationModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('🚀 Initializing Consultation Module...');
    loadData();
    
    // Event Listeners
    document.getElementById('newConsultBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeConsultModalBtn')?.addEventListener('click', () => closeModal('consultModal'));
    document.getElementById('cancelConsultModalBtn')?.addEventListener('click', () => closeModal('consultModal'));
    document.getElementById('closeViewModalBtn')?.addEventListener('click', () => closeModal('viewModal'));
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', () => closeModal('viewModal'));
    document.getElementById('consultForm')?.addEventListener('submit', saveConsultation);
    
    // View modal close on overlay
    document.getElementById('viewModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewModal');
    });
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = '';
        typeFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
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
    
    // Close modals on overlay click
    document.getElementById('consultModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('consultModal');
    });
    document.getElementById('viewModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('consultModal');
            closeModal('viewModal');
        }
    });
    
    console.log('✅ Consultation Module initialized. Total consultations:', consultations.length);
}

// ─── Expose functions for Salary Module ────────────

window.getConsultationsForSalary = getConsultationsForSalary;
window.getConsultationCount = getConsultationCount;
window.getTotalConsultationFee = getTotalConsultationFee;
window.openAddModal = openAddModal;

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initConsultationModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initConsultationModule();
    }, 3000);
});