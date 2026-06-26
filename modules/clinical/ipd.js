/**
 * IPD Management JS - Clinical Module
 * Version: 4.0 - COMPLETE PROFESSIONAL UPGRADE WITH ALL FEATURES
 * 
 * Features:
 * ✅ Full CRUD operations
 * ✅ Ward/Bed Management
 * ✅ Patient Condition tracking (Stable, Critical, Improving)
 * ✅ Consultation Integration (Auto-create on admission)
 * ✅ OPD to IPD Transfer (FULL UI FLOW)
 * ✅ Billing Integration (Auto-invoice on discharge)
 * ✅ Treatment Plan Add/Edit/Delete
 * ✅ Doctor Rounds Add/Edit/Delete
 * ✅ Vitals Add/Edit/Delete
 * ✅ Discharge Certificate Print
 * ✅ IPD Reports
 * ✅ View IPD Details with all info
 * ✅ Edit IPD Record
 * ✅ Professional UI with stats
 */

let ipdPatients = [];
let patients = [];
let doctors = [];
let wards = [];
let consultations = [];
let opdVisits = [];
let invoices = [];
let dischargeId = null;
let currentDeleteId = null;
let currentViewId = null;
let searchTerm = '';
let statusFilter = '';
let wardFilter = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────────────

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
    return '₹' + (amount || 0).toFixed(2);
}

function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const count = invoices.length + 1;
    return 'INV-IPD-' + year + String(count).padStart(4, '0');
}

// ─── Toast Notification ──────────────────────────────────────

function showToast(message, type) {
    type = type || 'success';
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a', warning: '#d4a853' };
    toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300';
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = '<div class="flex items-center gap-2"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle') + '"></i><span>' + esc(message) + '</span></div>';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

// ─── Data Management ──────────────────────────────────────────

function loadAllData() {
    try {
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        consultations = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
        opdVisits = JSON.parse(localStorage.getItem('hms_opd') || '[]');
        invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
        
        // Load wards
        loadWards();
        
        const stored = localStorage.getItem('hms_ipd');
        if (stored) {
            ipdPatients = JSON.parse(stored);
            // Ensure new fields exist
            for (let i = 0; i < ipdPatients.length; i++) {
                ipdPatients[i].condition = ipdPatients[i].condition || 'Stable';
                ipdPatients[i].treatmentPlan = ipdPatients[i].treatmentPlan || [];
                ipdPatients[i].doctorRounds = ipdPatients[i].doctorRounds || [];
                ipdPatients[i].vitals = ipdPatients[i].vitals || [];
                ipdPatients[i].consultationId = ipdPatients[i].consultationId || null;
                ipdPatients[i].opdVisitId = ipdPatients[i].opdVisitId || null;
                ipdPatients[i].invoiceId = ipdPatients[i].invoiceId || null;
            }
            saveIpd();
        } else {
            createSampleData();
        }
        
        updateWardAvailability();
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading IPD data:', error);
        showToast('Error loading IPD data', 'error');
    }
}

function loadWards() {
    const storedWards = localStorage.getItem('hms_wards');
    if (storedWards) {
        wards = JSON.parse(storedWards);
    } else {
        wards = [
            {id: 1, name: 'ICU - Intensive Care', totalBeds: 10, available: 4},
            {id: 2, name: 'General Ward', totalBeds: 30, available: 12},
            {id: 3, name: 'Private Ward', totalBeds: 15, available: 5},
            {id: 4, name: 'Maternity Ward', totalBeds: 12, available: 6},
            {id: 5, name: 'Pediatric Ward', totalBeds: 10, available: 7}
        ];
        localStorage.setItem('hms_wards', JSON.stringify(wards));
    }
}

function createSampleData() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    ipdPatients = [
        {
            id: 1,
            patientId: 1,
            patientName: 'Ramesh Gupta',
            doctorId: 1,
            doctorName: 'Dr. Anjali Nair',
            wardId: 2,
            wardName: 'General Ward',
            bedNo: 1,
            admissionDate: today,
            diagnosis: 'Hypertension, Chest pain',
            condition: 'Stable',
            status: 'Admitted',
            consultationId: null,
            opdVisitId: null,
            invoiceId: null,
            treatmentPlan: [
                { date: today, notes: 'Initial assessment done', status: 'completed' },
                { date: yesterdayStr, notes: 'Blood tests conducted', status: 'completed' }
            ],
            doctorRounds: [
                { date: today, doctorName: 'Dr. Anjali Nair', notes: 'Patient stable, continuing medication' }
            ],
            vitals: [
                { date: today, bp: '120/80', pulse: '72', temp: '98.6', spo2: '98' }
            ]
        },
        {
            id: 2,
            patientId: 4,
            patientName: 'Kiran Yadav',
            doctorId: 3,
            doctorName: 'Dr. Sneha Joshi',
            wardId: 5,
            wardName: 'Pediatric Ward',
            bedNo: 2,
            admissionDate: today,
            diagnosis: 'Fever, Respiratory infection',
            condition: 'Critical',
            status: 'Admitted',
            consultationId: null,
            opdVisitId: null,
            invoiceId: null,
            treatmentPlan: [
                { date: today, notes: 'Emergency admission, started antibiotics', status: 'in-progress' }
            ],
            doctorRounds: [
                { date: today, doctorName: 'Dr. Sneha Joshi', notes: 'Monitoring closely, vital signs stable' }
            ],
            vitals: [
                { date: today, bp: '110/70', pulse: '88', temp: '101.2', spo2: '96' }
            ]
        }
    ];
    saveIpd();
}

function saveIpd() {
    try {
        localStorage.setItem('hms_ipd', JSON.stringify(ipdPatients));
    } catch (error) {
        console.error('Error saving IPD data:', error);
    }
}

function updateWardAvailability() {
    // Reset all ward availability to total beds
    wards.forEach(function(w) { w.available = w.totalBeds; });
    
    // Subtract admitted patients from ward availability
    ipdPatients.filter(function(p) { return p.status === 'Admitted'; }).forEach(function(p) {
        const ward = wards.find(function(w) { return w.id === p.wardId; });
        if (ward) ward.available--;
    });
    localStorage.setItem('hms_wards', JSON.stringify(wards));
}

// ─── Stats ─────────────────────────────────────────────────────────────

function calculateAvgStay() {
    const discharged = ipdPatients.filter(function(p) { return p.status === 'Discharged' && p.dischargeDate; });
    if (discharged.length === 0) return 0;
    
    let totalDays = 0;
    discharged.forEach(function(p) {
        const admit = new Date(p.admissionDate);
        const discharge = new Date(p.dischargeDate);
        const days = Math.ceil((discharge - admit) / (1000 * 60 * 60 * 24));
        totalDays += days;
    });
    return Math.round(totalDays / discharged.length);
}

function updateStats() {
    const current = ipdPatients.filter(function(p) { return p.status === 'Admitted'; }).length;
    const available = wards.reduce(function(sum, w) { return sum + w.available; }, 0);
    const today = new Date().toISOString().split('T')[0];
    const dischargedToday = ipdPatients.filter(function(p) { return p.status === 'Discharged' && p.dischargeDate === today; }).length;
    const avgStay = calculateAvgStay();
    
    document.getElementById('currentIpd').textContent = current;
    document.getElementById('availableBeds').textContent = available;
    document.getElementById('dischargedToday').textContent = dischargedToday;
    document.getElementById('avgStay').textContent = avgStay + ' days';
}

// ─── Populate Filters ───────────────────────────────────────────────

function populateFilters() {
    const wardSelect = document.getElementById('wardFilter');
    if (wardSelect) {
        let html = '<option value="">All Wards</option>';
        wards.forEach(function(w) {
            html += '<option value="' + w.id + '">' + esc(w.name) + ' (' + w.available + ' beds)</option>';
        });
        wardSelect.innerHTML = html;
    }
}

// ─── Filter ──────────────────────────────────────────────────────────────

function getFilteredPatients() {
    const result = [];
    for (let i = 0; i < ipdPatients.length; i++) {
        const p = ipdPatients[i];
        const matchesSearch = searchTerm === '' || 
            p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || p.status === statusFilter || p.condition === statusFilter;
        const matchesWard = wardFilter === '' || p.wardId === parseInt(wardFilter);
        if (matchesSearch && matchesStatus && matchesWard) {
            result.push(p);
        }
    }
    // Sort by admission date (newest first)
    result.sort(function(a, b) { return new Date(b.admissionDate) - new Date(a.admissionDate); });
    return result;
}

// ─── Render ──────────────────────────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('ipdTable');
    if (!tbody) return;
    
    const filtered = getFilteredPatients();
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-hospital-user"></i><p>No IPD patients found</p><p style="font-size:0.75rem; margin-top:0.25rem;">Admit a patient to get started.</p></td></tr>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < filtered.length; i++) {
        const p = filtered[i];
        const statusClass = p.status === 'Admitted' ? 'status-admitted' : 'status-discharged';
        const conditionClass = p.condition === 'Critical' ? 'status-critical' : 
                            p.condition === 'Stable' ? 'status-stable' : 'status-admitted';
        const isAdmitted = p.status === 'Admitted';
        const hasConsultation = p.consultationId !== null && p.consultationId !== undefined;
        const hasInvoice = p.invoiceId !== null && p.invoiceId !== undefined;
        
        html += '<tr class="ipd-row" data-id="' + p.id + '">';
        html += '<td><div class="ipd-patient">' + esc(p.patientName) + '</div></td>';
        html += '<td class="ipd-doctor">' + esc(p.doctorName) + '</td>';
        html += '<td class="ipd-ward">' + esc(p.wardName) + ' / Bed ' + p.bedNo + '</td>';
        html += '<td class="ipd-date">' + formatDate(p.admissionDate) + '</td>';
        html += '<td><span class="' + conditionClass + '">' + p.condition + '</span></td>';
        html += '<td style="text-align:center;"><div style="display:flex; gap:0.25rem; justify-content:center; flex-wrap:wrap;">';
        html += '<button class="action-btn view-btn" data-id="' + p.id + '" title="View Details"><i class="fas fa-eye"></i></button>';
        if (isAdmitted) {
            html += '<button class="action-btn edit-btn" data-id="' + p.id + '" title="Edit"><i class="fas fa-edit"></i></button>';
            html += '<button class="action-btn discharge-btn" data-id="' + p.id + '" title="Discharge"><i class="fas fa-download"></i></button>';
            if (!hasConsultation) {
                html += '<button class="action-btn consult-btn" data-id="' + p.id + '" title="Create Consultation" style="color:#8b5cf6;"><i class="fas fa-stethoscope"></i></button>';
            }
            html += '<button class="action-btn treatment-btn" data-id="' + p.id + '" title="Add Treatment" style="color:#f59e0b;"><i class="fas fa-notes-medical"></i></button>';
            html += '<button class="action-btn round-btn" data-id="' + p.id + '" title="Add Doctor Round" style="color:#10b981;"><i class="fas fa-user-md"></i></button>';
            html += '<button class="action-btn vitals-btn" data-id="' + p.id + '" title="Add Vitals" style="color:#8b5cf6;"><i class="fas fa-heartbeat"></i></button>';
        }
        if (!hasInvoice && p.status === 'Discharged') {
            html += '<button class="action-btn invoice-btn" data-id="' + p.id + '" title="Generate Invoice" style="color:#f59e0b;"><i class="fas fa-file-invoice"></i></button>';
        }
        if (p.status === 'Discharged') {
            html += '<button class="action-btn print-btn" data-id="' + p.id + '" title="Print Discharge Certificate" style="color:#6366f1;"><i class="fas fa-print"></i></button>';
        }
        html += '<button class="action-btn delete delete-btn" data-id="' + p.id + '" title="Delete"><i class="fas fa-trash-alt"></i></button>';
        html += '</div></td></tr>';
    }
    tbody.innerHTML = html;
    
    // Bind events
    tbody.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { viewIPDPatient(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openEditModal(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.discharge-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDischargeModal(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.consult-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { createConsultation(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.invoice-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { generateInvoice(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.treatment-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openTreatmentModal(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.round-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openRoundModal(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.vitals-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openVitalsModal(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.print-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { printDischargeCertificate(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(parseInt(this.dataset.id)); });
    });
}

function refreshUI() {
    updateWardAvailability();
    updateStats();
    renderTable();
}

// ─── Populate Selects ───────────────────────────────────────────────────

function populateSelects() {
    const patientSelect = document.getElementById('patientId');
    const doctorSelect = document.getElementById('doctorId');
    const wardSelect = document.getElementById('wardId');
    
    if (patientSelect) {
        const admittedIds = ipdPatients.filter(function(p) { return p.status === 'Admitted'; }).map(function(p) { return p.patientId; });
        const availablePatients = patients.filter(function(p) { return admittedIds.indexOf(p.id) === -1; });
        let html = '<option value="">-- Select Patient --</option>';
        for (let i = 0; i < availablePatients.length; i++) {
            html += '<option value="' + availablePatients[i].id + '">' + esc(availablePatients[i].fullName) + ' (' + availablePatients[i].phone + ')</option>';
        }
        patientSelect.innerHTML = html;
        if (availablePatients.length === 0) {
            patientSelect.innerHTML = '<option value="">-- No patients available for admission --</option>';
        }
    }
    
    if (doctorSelect) {
        let html2 = '<option value="">-- Select Doctor --</option>';
        for (let j = 0; j < doctors.length; j++) {
            html2 += '<option value="' + doctors[j].id + '">' + esc(doctors[j].name) + ' (' + doctors[j].specialization + ')</option>';
        }
        doctorSelect.innerHTML = html2;
    }
    
    if (wardSelect) {
        const availableWards = wards.filter(function(w) { return w.available > 0; });
        let html3 = '<option value="">-- Select Ward --</option>';
        for (let k = 0; k < availableWards.length; k++) {
            html3 += '<option value="' + availableWards[k].id + '">' + esc(availableWards[k].name) + ' (' + availableWards[k].available + ' beds available)</option>';
        }
        wardSelect.innerHTML = html3;
        if (availableWards.length === 0) {
            wardSelect.innerHTML = '<option value="">-- No beds available --</option>';
        }
    }
}

// ─── ─── Modals ──────────────────────────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}

function openAddModal() {
    populateSelects();
    document.getElementById('ipdForm').reset();
    document.getElementById('editIpdId').value = '';
    document.getElementById('transferFromOpd').value = 'false';
    document.getElementById('opdTransferSection').style.display = 'none';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-procedures" style="color:var(--color-sage);"></i> Admit Patient';
    document.getElementById('patientCondition').value = 'Stable';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-select').forEach(function(el) { el.classList.remove('error'); });
    openModal('ipdModal');
}

function openEditModal(id) {
    const patient = ipdPatients.find(function(p) { return p.id === id; });
    if (!patient) return;
    
    populateSelects();
    document.getElementById('editIpdId').value = patient.id;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit IPD Record';
    document.getElementById('patientId').value = patient.patientId;
    document.getElementById('doctorId').value = patient.doctorId;
    document.getElementById('wardId').value = patient.wardId;
    document.getElementById('patientCondition').value = patient.condition || 'Stable';
    document.getElementById('diagnosis').value = patient.diagnosis || '';
    document.getElementById('transferFromOpd').value = 'false';
    document.getElementById('opdTransferSection').style.display = 'none';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-select').forEach(function(el) { el.classList.remove('error'); });
    openModal('ipdModal');
}

function openDischargeModal(id) {
    dischargeId = id;
    const patient = ipdPatients.find(function(p) { return p.id === id; });
    if (patient) {
        document.getElementById('dischargePatientId').value = id;
        document.getElementById('dischargeModalTitle').innerHTML = '<i class="fas fa-download" style="color:#10b981;"></i> Discharge - ' + esc(patient.patientName);
    }
    document.getElementById('dischargeForm').reset();
    document.getElementById('generateInvoice').checked = true;
    const followUp = document.getElementById('followUp');
    if (followUp) {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        followUp.value = date.toISOString().split('T')[0];
    }
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    openModal('dischargeModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── ─── OPD Transfer Handler ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const patientSelect = document.getElementById('patientId');
    if (patientSelect) {
        patientSelect.addEventListener('change', function() {
            checkOPDTransfer(this.value);
        });
    }
});

function checkOPDTransfer(patientId) {
    if (!patientId) {
        document.getElementById('opdTransferSection').style.display = 'none';
        return;
    }
    
    // Find active OPD visits for this patient
    const activeOPD = opdVisits.filter(function(v) { 
        return v.patientId === parseInt(patientId) && v.status !== 'Completed'; 
    });
    
    const transferSection = document.getElementById('opdTransferSection');
    const tokenDisplay = document.getElementById('opdTokenDisplay');
    const visitIdInput = document.getElementById('opdVisitId');
    
    if (activeOPD.length > 0) {
        const visit = activeOPD[0];
        transferSection.style.display = 'block';
        tokenDisplay.textContent = '#' + visit.token + ' - ' + visit.complaint;
        visitIdInput.value = visit.id;
        document.getElementById('transferFromOpd').value = 'true';
    } else {
        transferSection.style.display = 'none';
        document.getElementById('transferFromOpd').value = 'false';
    }
}

// ─── ─── Admit Patient ──────────────────────────────────────────────────────

function admitPatient(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editIpdId').value;
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const wardId = parseInt(document.getElementById('wardId').value);
    const condition = document.getElementById('patientCondition').value;
    const diagnosis = document.getElementById('diagnosis').value.trim();
    const transferFromOpd = document.getElementById('transferFromOpd').value === 'true';
    const opdVisitId = document.getElementById('opdVisitId').value;
    
    let hasError = false;
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-select').forEach(function(el) { el.classList.remove('error'); });
    
    if (!patientId) {
        document.getElementById('patientIdError').classList.add('show');
        document.getElementById('patientId').classList.add('error');
        hasError = true;
    }
    if (!doctorId) {
        document.getElementById('doctorIdError').classList.add('show');
        document.getElementById('doctorId').classList.add('error');
        hasError = true;
    }
    if (!wardId) {
        document.getElementById('wardIdError').classList.add('show');
        document.getElementById('wardId').classList.add('error');
        hasError = true;
    }
    if (hasError) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    let patient = null;
    let doctor = null;
    let ward = null;
    for (let i = 0; i < patients.length; i++) {
        if (patients[i].id === patientId) { patient = patients[i]; break; }
    }
    for (let j = 0; j < doctors.length; j++) {
        if (doctors[j].id === doctorId) { doctor = doctors[j]; break; }
    }
    for (let k = 0; k < wards.length; k++) {
        if (wards[k].id === wardId) { ward = wards[k]; break; }
    }
    
    if (!patient || !doctor || !ward) {
        showToast('Invalid selection', 'error');
        return;
    }
    
    if (ward.available <= 0) {
        showToast('No beds available in ' + ward.name, 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const bedNo = ward.totalBeds - ward.available;
    
    const ipdData = {
        patientId: patientId,
        patientName: patient.fullName,
        doctorId: doctorId,
        doctorName: doctor.name,
        wardId: wardId,
        wardName: ward.name,
        bedNo: bedNo,
        admissionDate: today,
        diagnosis: diagnosis || 'Under observation',
        condition: condition || 'Stable',
        status: 'Admitted',
        consultationId: null,
        opdVisitId: null,
        invoiceId: null,
        treatmentPlan: [
            { date: today, notes: 'Admitted to ' + ward.name + ' - Bed ' + bedNo, status: 'completed' }
        ],
        doctorRounds: [
            { date: today, doctorName: doctor.name, notes: 'Initial assessment completed' }
        ],
        vitals: []
    };
    
    // Handle OPD transfer
    if (transferFromOpd && opdVisitId) {
        ipdData.opdVisitId = parseInt(opdVisitId);
        const opdVisit = opdVisits.find(function(v) { return v.id === parseInt(opdVisitId); });
        if (opdVisit) {
            opdVisit.status = 'Completed';
            opdVisit.transferredToIPD = true;
            localStorage.setItem('hms_opd', JSON.stringify(opdVisits));
            ipdData.diagnosis = ipdData.diagnosis || opdVisit.complaint || '';
        }
    }
    
    const newId = ipdPatients.length > 0 ? Math.max(...ipdPatients.map(function(p) { return p.id; })) + 1 : 1;
    ipdData.id = newId;
    
    if (editId) {
        const index = ipdPatients.findIndex(function(p) { return p.id === parseInt(editId); });
        if (index !== -1) {
            ipdData.treatmentPlan = ipdPatients[index].treatmentPlan || [];
            ipdData.doctorRounds = ipdPatients[index].doctorRounds || [];
            ipdData.vitals = ipdPatients[index].vitals || [];
            ipdData.consultationId = ipdPatients[index].consultationId || null;
            ipdData.invoiceId = ipdPatients[index].invoiceId || null;
            ipdPatients[index] = { ...ipdPatients[index], ...ipdData };
            showToast('✅ IPD record updated for ' + patient.fullName, 'success');
        }
    } else {
        ipdPatients.push(ipdData);
        ward.available--;
        localStorage.setItem('hms_wards', JSON.stringify(wards));
        
        // Auto-create consultation
        autoCreateConsultation(ipdData);
        
        showToast('✅ ' + patient.fullName + ' admitted to ' + ward.name + ' - Bed ' + bedNo, 'success');
    }
    
    saveIpd();
    refreshUI();
    closeModal('ipdModal');
}

// ─── ─── Auto Create Consultation ───────────────────────────────────────────

function autoCreateConsultation(ipdData) {
    const consults = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
    const newId = consults.length > 0 ? Math.max(...consults.map(function(c) { return c.id; })) + 1 : 1;
    
    const consultation = {
        id: newId,
        patientId: ipdData.patientId,
        patientName: ipdData.patientName,
        doctorId: ipdData.doctorId,
        doctorName: ipdData.doctorName,
        date: ipdData.admissionDate,
        type: 'ipd',
        fee: 1000,
        symptoms: ipdData.diagnosis || 'IPD Admission',
        diagnosis: ipdData.diagnosis || '',
        prescription: '',
        notes: 'IPD Admission - ' + ipdData.wardName + ' - Bed ' + ipdData.bedNo,
        createdAt: new Date().toISOString()
    };
    
    consults.push(consultation);
    localStorage.setItem('hms_consultations', JSON.stringify(consults));
    
    ipdData.consultationId = newId;
    saveIpd();
}

// ─── ─── Create Consultation Manually ──────────────────────────────────────

function createConsultation(id) {
    const patient = ipdPatients.find(function(p) { return p.id === id; });
    if (!patient) {
        showToast('Patient not found', 'error');
        return;
    }
    
    if (patient.consultationId) {
        showToast('Consultation already exists for this patient', 'info');
        return;
    }
    
    autoCreateConsultation(patient);
    refreshUI();
    showToast('✅ Consultation created for ' + patient.patientName, 'success');
}

// ─── ─── Treatment Plan Functions ──────────────────────────────────────────

function openTreatmentModal(id) {
    const patient = ipdPatients.find(function(p) { return p.id === id; });
    if (!patient) return;
    
    document.getElementById('treatmentPatientId').value = id;
    document.getElementById('treatmentEditIndex').value = '';
    document.getElementById('treatmentModalTitle').innerHTML = '<i class="fas fa-notes-medical" style="color:var(--color-sage);"></i> Add Treatment - ' + esc(patient.patientName);
    document.getElementById('treatmentDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('treatmentNotes').value = '';
    document.getElementById('treatmentStatus').value = 'pending';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    openModal('treatmentModal');
}

function saveTreatment(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('treatmentPatientId').value);
    const editIndex = document.getElementById('treatmentEditIndex').value;
    const date = document.getElementById('treatmentDate').value;
    const notes = document.getElementById('treatmentNotes').value.trim();
    const status = document.getElementById('treatmentStatus').value;
    
    if (!notes) {
        document.getElementById('treatmentNotesError').classList.add('show');
        showToast('Please enter treatment notes', 'error');
        return;
    }
    
    const patient = ipdPatients.find(function(p) { return p.id === patientId; });
    if (!patient) {
        showToast('Patient not found', 'error');
        return;
    }
    
    if (!patient.treatmentPlan) patient.treatmentPlan = [];
    
    const treatment = { date: date || new Date().toISOString().split('T')[0], notes: notes, status: status };
    
    if (editIndex !== '') {
        patient.treatmentPlan[parseInt(editIndex)] = treatment;
        showToast('✅ Treatment updated successfully', 'success');
    } else {
        patient.treatmentPlan.push(treatment);
        showToast('✅ Treatment added successfully', 'success');
    }
    
    saveIpd();
    refreshUI();
    closeModal('treatmentModal');
}

function deleteTreatment(patientId, index) {
    if (!confirm('Are you sure you want to delete this treatment?')) return;
    
    const patient = ipdPatients.find(function(p) { return p.id === patientId; });
    if (!patient) return;
    
    patient.treatmentPlan.splice(index, 1);
    saveIpd();
    refreshUI();
    showToast('🗑️ Treatment deleted', 'info');
    // Reopen view to show updated list
    viewIPDPatient(patientId);
}

// ─── ─── Doctor Rounds Functions ───────────────────────────────────────────

function openRoundModal(id) {
    const patient = ipdPatients.find(function(p) { return p.id === id; });
    if (!patient) return;
    
    document.getElementById('roundPatientId').value = id;
    document.getElementById('roundEditIndex').value = '';
    document.getElementById('roundModalTitle').innerHTML = '<i class="fas fa-user-md" style="color:var(--color-sage);"></i> Add Doctor Round - ' + esc(patient.patientName);
    document.getElementById('roundDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('roundDoctorName').value = patient.doctorName || '';
    document.getElementById('roundNotes').value = '';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    openModal('roundModal');
}

function saveRound(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('roundPatientId').value);
    const editIndex = document.getElementById('roundEditIndex').value;
    const date = document.getElementById('roundDate').value;
    const doctorName = document.getElementById('roundDoctorName').value.trim();
    const notes = document.getElementById('roundNotes').value.trim();
    
    if (!notes) {
        document.getElementById('roundNotesError').classList.add('show');
        showToast('Please enter round notes', 'error');
        return;
    }
    
    const patient = ipdPatients.find(function(p) { return p.id === patientId; });
    if (!patient) {
        showToast('Patient not found', 'error');
        return;
    }
    
    if (!patient.doctorRounds) patient.doctorRounds = [];
    
    const round = { 
        date: date || new Date().toISOString().split('T')[0], 
        doctorName: doctorName || patient.doctorName || 'Unknown', 
        notes: notes 
    };
    
    if (editIndex !== '') {
        patient.doctorRounds[parseInt(editIndex)] = round;
        showToast('✅ Doctor round updated successfully', 'success');
    } else {
        patient.doctorRounds.push(round);
        showToast('✅ Doctor round added successfully', 'success');
    }
    
    saveIpd();
    refreshUI();
    closeModal('roundModal');
}

function deleteRound(patientId, index) {
    if (!confirm('Are you sure you want to delete this doctor round?')) return;
    
    const patient = ipdPatients.find(function(p) { return p.id === patientId; });
    if (!patient) return;
    
    patient.doctorRounds.splice(index, 1);
    saveIpd();
    refreshUI();
    showToast('🗑️ Doctor round deleted', 'info');
    viewIPDPatient(patientId);
}

// ─── ─── Vitals Functions ──────────────────────────────────────────────────

function openVitalsModal(id) {
    const patient = ipdPatients.find(function(p) { return p.id === id; });
    if (!patient) return;
    
    document.getElementById('vitalsPatientId').value = id;
    document.getElementById('vitalsEditIndex').value = '';
    document.getElementById('vitalsModalTitle').innerHTML = '<i class="fas fa-heartbeat" style="color:var(--color-sage);"></i> Add Vitals - ' + esc(patient.patientName);
    document.getElementById('vitalsDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('vitalsBp').value = '';
    document.getElementById('vitalsPulse').value = '';
    document.getElementById('vitalsTemp').value = '';
    document.getElementById('vitalsSpo2').value = '';
    openModal('vitalsModal');
}

function saveVitals(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('vitalsPatientId').value);
    const editIndex = document.getElementById('vitalsEditIndex').value;
    const date = document.getElementById('vitalsDate').value;
    const bp = document.getElementById('vitalsBp').value.trim();
    const pulse = document.getElementById('vitalsPulse').value.trim();
    const temp = document.getElementById('vitalsTemp').value.trim();
    const spo2 = document.getElementById('vitalsSpo2').value.trim();
    
    const patient = ipdPatients.find(function(p) { return p.id === patientId; });
    if (!patient) {
        showToast('Patient not found', 'error');
        return;
    }
    
    if (!patient.vitals) patient.vitals = [];
    
    const vitals = { 
        date: date || new Date().toISOString().split('T')[0], 
        bp: bp || '-', 
        pulse: pulse || '-', 
        temp: temp || '-', 
        spo2: spo2 || '-' 
    };
    
    if (editIndex !== '') {
        patient.vitals[parseInt(editIndex)] = vitals;
        showToast('✅ Vitals updated successfully', 'success');
    } else {
        patient.vitals.push(vitals);
        showToast('✅ Vitals added successfully', 'success');
    }
    
    saveIpd();
    refreshUI();
    closeModal('vitalsModal');
}

function deleteVitals(patientId, index) {
    if (!confirm('Are you sure you want to delete these vitals?')) return;
    
    const patient = ipdPatients.find(function(p) { return p.id === patientId; });
    if (!patient) return;
    
    patient.vitals.splice(index, 1);
    saveIpd();
    refreshUI();
    showToast('🗑️ Vitals deleted', 'info');
    viewIPDPatient(patientId);
}

// ─── ─── Complete Discharge ─────────────────────────────────────────────────

function completeDischarge(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('dischargePatientId').value);
    const summary = document.getElementById('dischargeSummary').value.trim();
    const medications = document.getElementById('dischargeMedications').value.trim();
    const followUp = document.getElementById('followUp').value;
    const generateInvoice = document.getElementById('generateInvoice').checked;
    
    document.getElementById('dischargeSummaryError').classList.remove('show');
    
    if (!summary) {
        document.getElementById('dischargeSummaryError').classList.add('show');
        showToast('Please enter discharge summary', 'error');
        return;
    }
    
    const patient = ipdPatients.find(function(p) { return p.id === id; });
    if (!patient) {
        showToast('Patient not found', 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    patient.status = 'Discharged';
    patient.dischargeDate = today;
    patient.dischargeSummary = summary;
    patient.dischargeMedications = medications;
    patient.followUp = followUp;
    
    // Return bed to ward
    const ward = wards.find(function(w) { return w.id === patient.wardId; });
    if (ward) ward.available++;
    localStorage.setItem('hms_wards', JSON.stringify(wards));
    
    // Generate invoice if requested
    if (generateInvoice) {
        generateInvoiceForPatient(id);
    }
    
    saveIpd();
    refreshUI();
    closeModal('dischargeModal');
    showToast('✅ ' + patient.patientName + ' discharged successfully', 'success');
}

// ─── ─── Generate Invoice ───────────────────────────────────────────────────

function generateInvoiceForPatient(id) {
    const patient = ipdPatients.find(function(p) { return p.id === id; });
    if (!patient) return;
    
    if (patient.invoiceId) {
        showToast('Invoice already exists for this patient', 'info');
        return;
    }
    
    // Calculate stay duration
    const admit = new Date(patient.admissionDate);
    const discharge = new Date(patient.dischargeDate || new Date());
    const days = Math.ceil((discharge - admit) / (1000 * 60 * 60 * 24)) || 1;
    
    // Calculate charges
    const roomCharge = 1000 * days;
    const consultationCharge = 500;
    const medicationCharge = 200 * days;
    const total = roomCharge + consultationCharge + medicationCharge;
    const tax = total * 0.05;
    const grandTotal = total + tax;
    
    const inv = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
    const newId = inv.length > 0 ? Math.max(...inv.map(function(i) { return i.id; })) + 1 : 1;
    
    const invoice = {
        id: newId,
        invoiceNo: generateInvoiceNumber(),
        patientId: patient.patientId,
        patientName: patient.patientName,
        type: 'IPD',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'IPD Stay - ' + patient.wardName + ' (' + days + ' days)',
        amount: total,
        subtotal: total,
        taxRate: 5,
        taxAmount: tax,
        discount: 0,
        total: grandTotal,
        status: 'Pending',
        services: [
            { type: 'room', description: 'Room Charges (' + days + ' days)', amount: roomCharge },
            { type: 'consultation', description: 'Consultation Fee', amount: consultationCharge },
            { type: 'medication', description: 'Medication Charges (' + days + ' days)', amount: medicationCharge }
        ],
        source: { type: 'ipd', sourceId: patient.id },
        gst: { rate: 5, cgst: tax/2, sgst: tax/2, hsn: '999999' },
        payments: [],
        createdAt: new Date().toISOString()
    };
    
    inv.push(invoice);
    localStorage.setItem('hms_invoices', JSON.stringify(inv));
    patient.invoiceId = newId;
    saveIpd();
    showToast('✅ Invoice generated for ' + patient.patientName + ' (₹' + grandTotal.toFixed(2) + ')', 'success');
}

function generateInvoice(id) {
    generateInvoiceForPatient(id);
    refreshUI();
}

// ─── ─── Print Discharge Certificate ──────────────────────────────────────

function printDischargeCertificate(id) {
    const patient = ipdPatients.find(function(p) { return p.id === id; });
    if (!patient || patient.status !== 'Discharged') {
        showToast('Patient is not discharged yet', 'error');
        return;
    }
    
    const content = document.getElementById('certificateContent');
    content.innerHTML = `
        <div class="certificate-box">
            <div class="cert-header">
                <h4>🏥 MedFlow Multi-Speciality Hospital</h4>
                <p>123 Healthcare Ave, Medical District, Mumbai - 400001</p>
                <p style="font-size:0.65rem; margin-top:0.25rem;">Discharge Certificate</p>
            </div>
            <div class="cert-row">
                <span class="cert-label">Patient Name</span>
                <span class="cert-value">${esc(patient.patientName)}</span>
            </div>
            <div class="cert-row">
                <span class="cert-label">Admission Date</span>
                <span class="cert-value">${formatDate(patient.admissionDate)}</span>
            </div>
            <div class="cert-row">
                <span class="cert-label">Discharge Date</span>
                <span class="cert-value">${formatDate(patient.dischargeDate)}</span>
            </div>
            <div class="cert-row">
                <span class="cert-label">Doctor</span>
                <span class="cert-value">${esc(patient.doctorName)}</span>
            </div>
            <div class="cert-row">
                <span class="cert-label">Ward / Bed</span>
                <span class="cert-value">${esc(patient.wardName)} / Bed ${patient.bedNo}</span>
            </div>
            <div class="cert-row">
                <span class="cert-label">Diagnosis</span>
                <span class="cert-value">${esc(patient.diagnosis || 'N/A')}</span>
            </div>
            <div class="cert-row" style="flex-direction:column; align-items:stretch; padding:0.5rem 0;">
                <span class="cert-label">Discharge Summary</span>
                <span class="cert-value" style="margin-top:0.25rem; font-size:0.85rem; color:var(--color-brown-300);">${esc(patient.dischargeSummary || 'N/A')}</span>
            </div>
            ${patient.dischargeMedications ? `
                <div class="cert-row" style="flex-direction:column; align-items:stretch; padding:0.5rem 0;">
                    <span class="cert-label">Medications Prescribed</span>
                    <span class="cert-value" style="margin-top:0.25rem; font-size:0.85rem; color:var(--color-brown-300);">${esc(patient.dischargeMedications)}</span>
                </div>
            ` : ''}
            ${patient.followUp ? `
                <div class="cert-row">
                    <span class="cert-label">Follow-up Date</span>
                    <span class="cert-value">${formatDate(patient.followUp)}</span>
                </div>
            ` : ''}
            <div style="text-align:center; margin-top:1rem; font-size:0.65rem; color:var(--color-brown-100); border-top:1px solid var(--border-default); padding-top:0.75rem;">
                This is a computer-generated certificate. Valid without signature.<br>
                Generated on: ${formatDate(new Date().toISOString().split('T')[0])}
            </div>
        </div>
    `;
    
    document.getElementById('certificateModalTitle').innerHTML = '<i class="fas fa-file-pdf" style="color:#6366f1;"></i> Discharge Certificate - ' + esc(patient.patientName);
    openModal('certificateModal');
}

// ─── ─── Print Certificate Handler ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const printBtn = document.getElementById('printCertificateBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            const content = document.getElementById('certificateContent').innerHTML;
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Discharge Certificate</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 700px; margin: auto; }
                        .certificate-box { background: white; border: 2px solid #4a8c3a; border-radius: 12px; padding: 2rem; }
                        .cert-header { text-align: center; border-bottom: 2px solid #4a8c3a; padding-bottom: 1rem; margin-bottom: 1rem; }
                        .cert-header h4 { font-size: 1.3rem; font-weight: 600; color: #3a7a2a; margin: 0; }
                        .cert-header p { font-size: 0.8rem; color: #666; margin: 0; }
                        .cert-row { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid #eee; font-size: 0.9rem; }
                        .cert-row:last-child { border-bottom: none; }
                        .cert-label { color: #999; font-weight: 300; }
                        .cert-value { color: #333; font-weight: 500; }
                        .footer { text-align: center; margin-top: 1.5rem; font-size: 0.65rem; color: #999; border-top: 1px solid #ddd; padding-top: 1rem; }
                        @media print { body { padding: 20px; } .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    ${content}
                    <div class="footer">
                        This is a computer-generated certificate. Valid without signature.<br>
                        Generated on: ${formatDate(new Date().toISOString().split('T')[0])}
                    </div>
                    <div class="no-print" style="text-align:center; margin-top:20px;">
                        <button onclick="window.print()" style="padding:10px 30px; background:#4a8c3a; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px;">
                            🖨️ Print / Download PDF
                        </button>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }
});

// ─── ─── View IPD Patient ──────────────────────────────────────────────────

function viewIPDPatient(id) {
    const patient = ipdPatients.find(function(p) { return p.id === id; });
    if (!patient) return;
    
    currentViewId = id;
    
    let patientObj = null;
    let doctorObj = null;
    for (let i = 0; i < patients.length; i++) {
        if (patients[i].id === patient.patientId) { patientObj = patients[i]; break; }
    }
    for (let j = 0; j < doctors.length; j++) {
        if (doctors[j].id === patient.doctorId) { doctorObj = doctors[j]; break; }
    }
    
    const content = document.getElementById('viewContent');
    const statusClass = patient.status === 'Admitted' ? 'status-admitted' : 'status-discharged';
    const conditionClass = patient.condition === 'Critical' ? 'badge-critical' : 
                         patient.condition === 'Stable' ? 'badge-stable' : 'badge-improving';
    
    // Treatment Plan HTML with Edit/Delete
    let treatmentHtml = '';
    if (patient.treatmentPlan && patient.treatmentPlan.length > 0) {
        treatmentHtml = patient.treatmentPlan.map(function(t, idx) {
            const statusClass = t.status === 'completed' ? 'completed' : t.status === 'in-progress' ? 'in-progress' : 'pending';
            return `<div class="treatment-item">
                <span class="treatment-date">${formatDate(t.date)}</span>
                <span class="treatment-notes">${esc(t.notes)}</span>
                <span class="treatment-status ${statusClass}">${t.status}</span>
                <div style="display:flex; gap:0.25rem;">
                    <button class="action-btn" style="width:1.5rem;height:1.5rem;font-size:0.6rem;color:var(--color-sage);" onclick="editTreatment(${patient.id}, ${idx})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" style="width:1.5rem;height:1.5rem;font-size:0.6rem;color:#dc2626;" onclick="deleteTreatment(${patient.id}, ${idx})" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>`;
        }).join('');
    } else {
        treatmentHtml = '<p style="color:var(--color-brown-100); font-size:0.75rem;">No treatment plan recorded</p>';
    }
    
    // Doctor Rounds HTML with Edit/Delete
    let roundsHtml = '';
    if (patient.doctorRounds && patient.doctorRounds.length > 0) {
        roundsHtml = patient.doctorRounds.map(function(r, idx) {
            return `<div class="treatment-item">
                <span class="treatment-date">${formatDate(r.date)}</span>
                <span class="treatment-notes"><strong>${esc(r.doctorName)}</strong>: ${esc(r.notes)}</span>
                <div style="display:flex; gap:0.25rem;">
                    <button class="action-btn" style="width:1.5rem;height:1.5rem;font-size:0.6rem;color:var(--color-sage);" onclick="editRound(${patient.id}, ${idx})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" style="width:1.5rem;height:1.5rem;font-size:0.6rem;color:#dc2626;" onclick="deleteRound(${patient.id}, ${idx})" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>`;
        }).join('');
    } else {
        roundsHtml = '<p style="color:var(--color-brown-100); font-size:0.75rem;">No doctor rounds recorded</p>';
    }
    
    // Vitals HTML with Edit/Delete
    let vitalsHtml = '';
    if (patient.vitals && patient.vitals.length > 0) {
        const lastVitals = patient.vitals[patient.vitals.length - 1];
        vitalsHtml = '<div class="vitals-grid">';
        vitalsHtml += '<div class="vital-item"><div class="vital-value">' + (lastVitals.bp || '-') + '</div><div class="vital-label">BP</div></div>';
        vitalsHtml += '<div class="vital-item"><div class="vital-value">' + (lastVitals.pulse || '-') + '</div><div class="vital-label">Pulse</div></div>';
        vitalsHtml += '<div class="vital-item"><div class="vital-value">' + (lastVitals.temp || '-') + '°F</div><div class="vital-label">Temp</div></div>';
        vitalsHtml += '<div class="vital-item"><div class="vital-value">' + (lastVitals.spo2 || '-') + '%</div><div class="vital-label">SpO2</div></div>';
        vitalsHtml += '</div>';
        vitalsHtml += '<div style="margin-top:0.25rem; display:flex; gap:0.25rem; flex-wrap:wrap;">';
        patient.vitals.forEach(function(v, idx) {
            vitalsHtml += `<span style="font-size:0.6rem; background:var(--bg-muted); padding:0.1rem 0.3rem; border-radius:var(--radius-sm);">
                ${formatDate(v.date)}: ${v.bp} | ${v.pulse} bpm
                <button class="action-btn" style="width:1.2rem;height:1.2rem;font-size:0.5rem;color:var(--color-sage);" onclick="editVitals(${patient.id}, ${idx})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn" style="width:1.2rem;height:1.2rem;font-size:0.5rem;color:#dc2626;" onclick="deleteVitals(${patient.id}, ${idx})" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </span>`;
        });
        vitalsHtml += '</div>';
    } else {
        vitalsHtml = '<p style="color:var(--color-brown-100); font-size:0.75rem;">No vitals recorded</p>';
    }
    
    content.innerHTML = `
        <div style="display:grid; gap:0.25rem;">
            <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); margin-bottom:0.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                        <h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); margin:0;">${esc(patient.patientName)}</h3>
                        <p style="font-size:0.75rem; color:var(--color-brown-100); margin:0;">${patientObj ? '📞 ' + esc(patientObj.phone) : ''}</p>
                    </div>
                    <div style="display:flex; gap:0.5rem;">
                        <span class="${statusClass}">${patient.status}</span>
                        <span class="badge-ipd-status ${conditionClass}">${patient.condition}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-grid">
                <div><p class="detail-label">Admission Date</p><p class="detail-value">${formatDate(patient.admissionDate)}</p></div>
                <div><p class="detail-label">Doctor</p><p class="detail-value">${esc(patient.doctorName)}</p></div>
                <div><p class="detail-label">Ward / Bed</p><p class="detail-value">${esc(patient.wardName)} / Bed ${patient.bedNo}</p></div>
                ${patient.dischargeDate ? `<div><p class="detail-label">Discharge Date</p><p class="detail-value">${formatDate(patient.dischargeDate)}</p></div>` : ''}
                <div><p class="detail-label">Diagnosis</p><p class="detail-value" style="color:var(--color-brown-300);">${esc(patient.diagnosis || 'N/A')}</p></div>
                <div><p class="detail-label">Consultation ID</p><p class="detail-value">${patient.consultationId ? '#' + patient.consultationId : 'Not created'}</p></div>
                <div><p class="detail-label">Invoice ID</p><p class="detail-value">${patient.invoiceId ? '#' + patient.invoiceId : 'Not generated'}</p></div>
                ${patient.opdVisitId ? `<div><p class="detail-label">OPD Transfer</p><p class="detail-value">From OPD Visit #${patient.opdVisitId}</p></div>` : ''}
            </div>
            
            <div class="detail-section" style="margin-top:0.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                    <p class="detail-label" style="margin-bottom:0;">Treatment Plan</p>
                    ${patient.status === 'Admitted' ? `<button class="action-btn" style="width:auto;padding:0.15rem 0.5rem;font-size:0.6rem;color:var(--color-sage);border:1px solid var(--color-sage);" onclick="openTreatmentModal(${patient.id})"><i class="fas fa-plus"></i> Add</button>` : ''}
                </div>
                ${treatmentHtml}
            </div>
            
            <div class="detail-section">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                    <p class="detail-label" style="margin-bottom:0;">Doctor Rounds</p>
                    ${patient.status === 'Admitted' ? `<button class="action-btn" style="width:auto;padding:0.15rem 0.5rem;font-size:0.6rem;color:var(--color-sage);border:1px solid var(--color-sage);" onclick="openRoundModal(${patient.id})"><i class="fas fa-plus"></i> Add</button>` : ''}
                </div>
                ${roundsHtml}
            </div>
            
            <div class="detail-section">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                    <p class="detail-label" style="margin-bottom:0;">Vitals (Latest)</p>
                    ${patient.status === 'Admitted' ? `<button class="action-btn" style="width:auto;padding:0.15rem 0.5rem;font-size:0.6rem;color:var(--color-sage);border:1px solid var(--color-sage);" onclick="openVitalsModal(${patient.id})"><i class="fas fa-plus"></i> Add</button>` : ''}
                </div>
                ${vitalsHtml}
            </div>
            
            ${patient.dischargeSummary ? `
                <div class="detail-section">
                    <p class="detail-label">Discharge Summary</p>
                    <p class="detail-value" style="color:var(--color-brown-300); font-size:0.8rem;">${esc(patient.dischargeSummary)}</p>
                    ${patient.dischargeMedications ? `<p style="font-size:0.75rem; color:var(--color-brown-300); margin-top:0.25rem;"><strong>Medications:</strong> ${esc(patient.dischargeMedications)}</p>` : ''}
                    ${patient.followUp ? `<p style="font-size:0.75rem; color:var(--color-brown-300);"><strong>Follow-up:</strong> ${formatDate(patient.followUp)}</p>` : ''}
                </div>
            ` : ''}
            
            <div style="font-size:0.6rem; color:var(--color-brown-100); border-top:1px solid var(--border-default); padding-top:0.5rem;">
                Admitted: ${formatDate(patient.admissionDate)} ${patient.dischargeDate ? '| Discharged: ' + formatDate(patient.dischargeDate) : '| Currently Admitted'}
            </div>
        </div>
    `;
    
    document.getElementById('viewModalTitle').innerHTML = `<i class="fas fa-eye" style="color:var(--color-sage);"></i> ${esc(patient.patientName)} - IPD Details`;
    openModal('viewModal');
}

// ─── ─── Edit/Delete Helper Functions ─────────────────────────────────────

// These are called from the view modal
window.editTreatment = function(patientId, index) {
    const patient = ipdPatients.find(function(p) { return p.id === patientId; });
    if (!patient || !patient.treatmentPlan || !patient.treatmentPlan[index]) return;
    
    const t = patient.treatmentPlan[index];
    document.getElementById('treatmentPatientId').value = patientId;
    document.getElementById('treatmentEditIndex').value = index;
    document.getElementById('treatmentModalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Treatment - ' + esc(patient.patientName);
    document.getElementById('treatmentDate').value = t.date || '';
    document.getElementById('treatmentNotes').value = t.notes || '';
    document.getElementById('treatmentStatus').value = t.status || 'pending';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    openModal('treatmentModal');
};

window.editRound = function(patientId, index) {
    const patient = ipdPatients.find(function(p) { return p.id === patientId; });
    if (!patient || !patient.doctorRounds || !patient.doctorRounds[index]) return;
    
    const r = patient.doctorRounds[index];
    document.getElementById('roundPatientId').value = patientId;
    document.getElementById('roundEditIndex').value = index;
    document.getElementById('roundModalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Doctor Round - ' + esc(patient.patientName);
    document.getElementById('roundDate').value = r.date || '';
    document.getElementById('roundDoctorName').value = r.doctorName || '';
    document.getElementById('roundNotes').value = r.notes || '';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    openModal('roundModal');
};

window.editVitals = function(patientId, index) {
    const patient = ipdPatients.find(function(p) { return p.id === patientId; });
    if (!patient || !patient.vitals || !patient.vitals[index]) return;
    
    const v = patient.vitals[index];
    document.getElementById('vitalsPatientId').value = patientId;
    document.getElementById('vitalsEditIndex').value = index;
    document.getElementById('vitalsModalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Vitals - ' + esc(patient.patientName);
    document.getElementById('vitalsDate').value = v.date || '';
    document.getElementById('vitalsBp').value = v.bp || '';
    document.getElementById('vitalsPulse').value = v.pulse || '';
    document.getElementById('vitalsTemp').value = v.temp || '';
    document.getElementById('vitalsSpo2').value = v.spo2 || '';
    openModal('vitalsModal');
};

window.deleteTreatment = deleteTreatment;
window.deleteRound = deleteRound;
window.deleteVitals = deleteVitals;

// ─── ─── Reports ────────────────────────────────────────────────────────────

function openReportsModal() {
    const content = document.getElementById('reportsContent');
    
    const totalAdmitted = ipdPatients.filter(function(p) { return p.status === 'Admitted'; }).length;
    const totalDischarged = ipdPatients.filter(function(p) { return p.status === 'Discharged'; }).length;
    const criticalPatients = ipdPatients.filter(function(p) { return p.condition === 'Critical' && p.status === 'Admitted'; }).length;
    const stablePatients = ipdPatients.filter(function(p) { return p.condition === 'Stable' && p.status === 'Admitted'; }).length;
    const avgStay = calculateAvgStay();
    const totalBeds = wards.reduce(function(sum, w) { return sum + w.totalBeds; }, 0);
    const occupiedBeds = totalBeds - wards.reduce(function(sum, w) { return sum + w.available; }, 0);
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    
    content.innerHTML = `
        <div class="reports-grid">
            <div class="report-card">
                <div class="report-icon"><i class="fas fa-hospital-user"></i></div>
                <div class="report-value">${totalAdmitted}</div>
                <div class="report-label">Currently Admitted</div>
                <span class="report-trend up"><i class="fas fa-arrow-up"></i> Active</span>
            </div>
            <div class="report-card">
                <div class="report-icon"><i class="fas fa-download"></i></div>
                <div class="report-value">${totalDischarged}</div>
                <div class="report-label">Total Discharged</div>
                <span class="report-trend neutral"><i class="fas fa-minus"></i> Completed</span>
            </div>
            <div class="report-card">
                <div class="report-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="report-value">${criticalPatients}</div>
                <div class="report-label">Critical Patients</div>
                <span class="report-trend down"><i class="fas fa-arrow-down"></i> Need Care</span>
            </div>
            <div class="report-card">
                <div class="report-icon"><i class="fas fa-check-circle"></i></div>
                <div class="report-value">${stablePatients}</div>
                <div class="report-label">Stable Patients</div>
                <span class="report-trend up"><i class="fas fa-arrow-up"></i> Recovering</span>
            </div>
            <div class="report-card">
                <div class="report-icon"><i class="fas fa-clock"></i></div>
                <div class="report-value">${avgStay} days</div>
                <div class="report-label">Average Stay</div>
                <span class="report-trend neutral"><i class="fas fa-minus"></i> Normal</span>
            </div>
            <div class="report-card">
                <div class="report-icon"><i class="fas fa-bed"></i></div>
                <div class="report-value">${occupancyRate}%</div>
                <div class="report-label">Bed Occupancy</div>
                <span class="report-trend ${occupancyRate > 80 ? 'up' : 'neutral'}">${occupancyRate > 80 ? '🔴 High' : '🟢 Normal'}</span>
            </div>
        </div>
        <div style="margin-top:0.75rem; border-top:1px solid var(--border-default); padding-top:0.75rem;">
            <p style="font-size:0.75rem; color:var(--color-brown-100); text-align:center;">
                <strong>Total IPD Patients:</strong> ${ipdPatients.length} &nbsp;|&nbsp; 
                <strong>Wards:</strong> ${wards.length} &nbsp;|&nbsp; 
                <strong>Total Beds:</strong> ${totalBeds}
            </p>
        </div>
    `;
    
    document.getElementById('reportsModalTitle').innerHTML = '<i class="fas fa-chart-bar" style="color:var(--color-sage);"></i> IPD Reports & Analytics';
    openModal('reportsModal');
}

// ─── ─── Delete ─────────────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!currentDeleteId) return;
    
    const patient = ipdPatients.find(function(p) { return p.id === currentDeleteId; });
    
    if (patient && patient.status === 'Admitted') {
        const ward = wards.find(function(w) { return w.id === patient.wardId; });
        if (ward) ward.available++;
        localStorage.setItem('hms_wards', JSON.stringify(wards));
    }
    
    ipdPatients = ipdPatients.filter(function(p) { return p.id !== currentDeleteId; });
    saveIpd();
    refreshUI();
    closeModal('deleteModal');
    
    if (patient) {
        showToast('🗑️ IPD record removed for ' + patient.patientName, 'info');
    }
    currentDeleteId = null;
}

// ─── ─── Init ──────────────────────────────────────────────────────────────

function initIPDModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadAllData();
    
    // Event Listeners
    document.getElementById('admitBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeIpdModalBtn')?.addEventListener('click', function() { closeModal('ipdModal'); });
    document.getElementById('cancelIpdModalBtn')?.addEventListener('click', function() { closeModal('ipdModal'); });
    document.getElementById('closeDischargeModalBtn')?.addEventListener('click', function() { closeModal('dischargeModal'); });
    document.getElementById('cancelDischargeModalBtn')?.addEventListener('click', function() { closeModal('dischargeModal'); });
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('ipdForm')?.addEventListener('submit', admitPatient);
    document.getElementById('dischargeForm')?.addEventListener('submit', completeDischarge);
    document.getElementById('refreshBtn')?.addEventListener('click', function() { refreshUI(); showToast('Refreshed', 'info'); });
    document.getElementById('reportsBtn')?.addEventListener('click', openReportsModal);
    
    // Treatment Modal
    document.getElementById('closeTreatmentModalBtn')?.addEventListener('click', function() { closeModal('treatmentModal'); });
    document.getElementById('cancelTreatmentBtn')?.addEventListener('click', function() { closeModal('treatmentModal'); });
    document.getElementById('treatmentForm')?.addEventListener('submit', saveTreatment);
    
    // Round Modal
    document.getElementById('closeRoundModalBtn')?.addEventListener('click', function() { closeModal('roundModal'); });
    document.getElementById('cancelRoundBtn')?.addEventListener('click', function() { closeModal('roundModal'); });
    document.getElementById('roundForm')?.addEventListener('submit', saveRound);
    
    // Vitals Modal
    document.getElementById('closeVitalsModalBtn')?.addEventListener('click', function() { closeModal('vitalsModal'); });
    document.getElementById('cancelVitalsBtn')?.addEventListener('click', function() { closeModal('vitalsModal'); });
    document.getElementById('vitalsForm')?.addEventListener('submit', saveVitals);
    
    // Certificate Modal
    document.getElementById('closeCertificateModalBtn')?.addEventListener('click', function() { closeModal('certificateModal'); });
    document.getElementById('closeCertificateFooterBtn')?.addEventListener('click', function() { closeModal('certificateModal'); });
    document.getElementById('certificateModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('certificateModal');
    });
    
    // Reports Modal
    document.getElementById('closeReportsModalBtn')?.addEventListener('click', function() { closeModal('reportsModal'); });
    document.getElementById('closeReportsFooterBtn')?.addEventListener('click', function() { closeModal('reportsModal'); });
    document.getElementById('reportsModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('reportsModal');
    });
    
    // View modal
    document.getElementById('closeViewModalBtn')?.addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('viewModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewModal');
    });
    
    // Modals on overlay click
    document.getElementById('treatmentModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('treatmentModal');
    });
    document.getElementById('roundModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('roundModal');
    });
    document.getElementById('vitalsModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('vitalsModal');
    });
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', function() {
        searchTerm = '';
        statusFilter = '';
        wardFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('wardFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', function(e) {
        statusFilter = e.target.value;
        renderTable();
    });
    
    document.getElementById('wardFilter')?.addEventListener('change', function(e) {
        wardFilter = e.target.value;
        renderTable();
    });
    
    document.getElementById('ipdModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('ipdModal');
    });
    document.getElementById('dischargeModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('dischargeModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('ipdModal');
            closeModal('dischargeModal');
            closeModal('deleteModal');
            closeModal('viewModal');
            closeModal('treatmentModal');
            closeModal('roundModal');
            closeModal('vitalsModal');
            closeModal('certificateModal');
            closeModal('reportsModal');
        }
    });
}

// ─── ─── Wait ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(function() {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initIPDModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initIPDModule();
    }, 3000);
});

// ─── ─── Expose ─────────────────────────────────────────────────────────────

window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.viewIPDPatient = viewIPDPatient;
window.openDischargeModal = openDischargeModal;
window.completeDischarge = completeDischarge;
window.createConsultation = createConsultation;
window.generateInvoice = generateInvoice;
window.admitPatient = admitPatient;
window.openTreatmentModal = openTreatmentModal;
window.openRoundModal = openRoundModal;
window.openVitalsModal = openVitalsModal;
window.printDischargeCertificate = printDischargeCertificate;
window.openReportsModal = openReportsModal;