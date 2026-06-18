/**
 * Consultation Management JS - Clinical Module
 * Uses theme.css for styling, clean event handling
 */

let consultations = [];
let patients = [];
let doctors = [];
let searchTerm = '';
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

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        
        const stored = localStorage.getItem('hms_consultations');
        if (stored) {
            consultations = JSON.parse(stored);
        } else {
            // Demo consultations data
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
                    symptoms: 'Chest pain, shortness of breath, palpitations', 
                    diagnosis: 'Hypertension Stage 2', 
                    prescription: 'Amlodipine 5mg once daily\nAtenolol 25mg once daily', 
                    notes: 'Follow up in 2 weeks. Monitor BP daily.'
                },
                {
                    id: 2, 
                    patientId: 2, 
                    patientName: 'Priya Sharma', 
                    doctorId: 2, 
                    doctorName: 'Dr. Vikram Singh', 
                    date: yesterday, 
                    symptoms: 'Severe headache, blurred vision, nausea', 
                    diagnosis: 'Migraine with Aura', 
                    prescription: 'Sumatriptan 50mg as needed\nPropranolol 40mg daily for prevention', 
                    notes: 'Avoid bright lights and stress. Keep a headache diary.'
                },
                {
                    id: 3, 
                    patientId: 3, 
                    patientName: 'Amit Patel', 
                    doctorId: 3, 
                    doctorName: 'Dr. Sneha Joshi', 
                    date: twoDaysAgo, 
                    symptoms: 'Fever 101°F, cough, body ache, fatigue', 
                    diagnosis: 'Viral Fever with Upper Respiratory Infection', 
                    prescription: 'Paracetamol 500mg SOS\nCough syrup 10ml TID\nRest and hydration', 
                    notes: 'Monitor temperature. Review if fever persists >3 days.'
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
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthConsults = consultations.filter(c => {
        const consultDate = new Date(c.date);
        return consultDate.getMonth() === currentMonth && 
               consultDate.getFullYear() === currentYear;
    }).length;
    
    const withPrescription = consultations.filter(c => c.prescription && c.prescription.trim()).length;
    
    document.getElementById('totalConsults').textContent = total;
    document.getElementById('todayConsults').textContent = todayConsults;
    document.getElementById('monthConsults').textContent = monthConsults;
    document.getElementById('prescriptionCount').textContent = withPrescription;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredConsultations() {
    return consultations.filter(c => {
        const matchesSearch = searchTerm === '' || 
            c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
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
                <td colspan="5" class="consult-empty">
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
        const diagnosisDisplay = c.diagnosis.length > 30 ? 
            c.diagnosis.substring(0, 30) + '...' : 
            c.diagnosis;
        
        return `
            <tr class="consult-row" data-id="${c.id}">
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(c.patientName)}</td>
                <td style="color:var(--color-brown-300);">${esc(c.doctorName)}</td>
                <td style="color:var(--color-brown-300);">${formatDate(c.date)}</td>
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
        btn.addEventListener('click', () => viewConsultation(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
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
    
    // Set default date to today
    const dateInput = document.getElementById('consultDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('consultForm').reset();
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-stethoscope"></i> New Consultation';
    openModal('consultModal');
}

// ─── Form Submit ────────────────────────────────────

function saveConsultation(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
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
    
    const newId = consultations.length > 0 ? Math.max(...consultations.map(c => c.id)) + 1 : 1;
    
    consultations.push({
        id: newId,
        patientId: patientId,
        patientName: patient.fullName,
        doctorId: doctorId,
        doctorName: doctor.name,
        date: date,
        symptoms: symptoms,
        diagnosis: diagnosis,
        prescription: prescription,
        notes: notes
    });
    
    saveConsultations();
    refreshUI();
    closeModal('consultModal');
    
    if (window.showToast) {
        window.showToast(`✅ Consultation saved for ${patient.fullName}`, 'success');
    }
}

// ─── View ────────────────────────────────────────────

function viewConsultation(id) {
    const c = consultations.find(c => c.id === id);
    if (!c) return;
    
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
        </div>
    `;
    
    openModal('viewModal');
}

// ─── Init ────────────────────────────────────────────

function initConsultationModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('newConsultBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeConsultModalBtn')?.addEventListener('click', () => closeModal('consultModal'));
    document.getElementById('cancelConsultModalBtn')?.addEventListener('click', () => closeModal('consultModal'));
    document.getElementById('closeViewModalBtn')?.addEventListener('click', () => closeModal('viewModal'));
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', () => closeModal('viewModal'));
    document.getElementById('consultForm')?.addEventListener('submit', saveConsultation);
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = '';
        document.getElementById('searchInput').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
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
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    // Check if common.js has loaded sidebar
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initConsultationModule, 100);
        }
    }, 50);
    
    // Fallback: if sidebar doesn't load in 3 seconds, init anyway
    setTimeout(() => {
        clearInterval(checkInterval);
        initConsultationModule();
    }, 3000);
});