/**
 * IPD Management JS - Clinical Module
 * Uses theme.css for styling, clean event handling
 */

let ipdPatients = [];
let patients = [];
let doctors = [];
let wards = [];
let dischargeId = null;
let currentDeleteId = null;
let searchTerm = '';
let statusFilter = '';
let isInitialized = false;

// ─── 🔥 ADD THIS HERE - Auto-Open from Dashboard ───
document.addEventListener('DOMContentLoaded', function() {
    var action = sessionStorage.getItem('dashboard_action');
    if (action === 'openAdmitPatient') {
        sessionStorage.removeItem('dashboard_action');
        setTimeout(function() {
            if (typeof openAddModal === 'function') {
                openAddModal();
            } else if (typeof window.openAddModal === 'function') {
                window.openAddModal();
            } else {
                var addBtn = document.getElementById('admitBtn');
                if (addBtn) addBtn.click();
            }
        }, 600);
    }
});
// ─── 🔥 END OF AUTO-OPEN SECTION ────────────────────

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        
        const stored = localStorage.getItem('hms_ipd');
        if (stored) {
            ipdPatients = JSON.parse(stored);
        } else {
            // Demo IPD data
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
                    admissionDate: new Date().toISOString().split('T')[0],
                    diagnosis: 'Hypertension, Chest pain',
                    status: 'Admitted'
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
                    admissionDate: new Date().toISOString().split('T')[0],
                    diagnosis: 'Fever, Respiratory infection',
                    status: 'Admitted'
                }
            ];
            saveIpd();
        }
        
        // Indian Wards Data
        wards = [
            {id: 1, name: 'ICU - Intensive Care', totalBeds: 10, available: 4},
            {id: 2, name: 'General Ward', totalBeds: 30, available: 12},
            {id: 3, name: 'Private Ward', totalBeds: 15, available: 5},
            {id: 4, name: 'Maternity Ward', totalBeds: 12, available: 6},
            {id: 5, name: 'Pediatric Ward', totalBeds: 10, available: 7}
        ];
        
        // Update ward availability based on admitted patients
        updateWardAvailability();
        
        refreshUI();
    } catch (error) {
        console.error('Error loading IPD data:', error);
        if (window.showToast) {
            window.showToast('Error loading IPD data', 'error');
        }
    }
}

function updateWardAvailability() {
    // Reset all ward availability to total beds
    wards.forEach(w => w.available = w.totalBeds);
    
    // Subtract admitted patients from ward availability
    ipdPatients.filter(p => p.status === 'Admitted').forEach(p => {
        const ward = wards.find(w => w.id === p.wardId);
        if (ward) ward.available--;
    });
}

function saveIpd() {
    try {
        localStorage.setItem('hms_ipd', JSON.stringify(ipdPatients));
    } catch (error) {
        console.error('Error saving IPD data:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function calculateAvgStay() {
    const discharged = ipdPatients.filter(p => p.status === 'Discharged' && p.dischargeDate);
    if (discharged.length === 0) return 0;
    
    let totalDays = 0;
    discharged.forEach(p => {
        const admit = new Date(p.admissionDate);
        const discharge = new Date(p.dischargeDate);
        const days = Math.ceil((discharge - admit) / (1000 * 60 * 60 * 24));
        totalDays += days;
    });
    return Math.round(totalDays / discharged.length);
}

function updateStats() {
    const current = ipdPatients.filter(p => p.status === 'Admitted').length;
    const available = wards.reduce((sum, w) => sum + w.available, 0);
    const today = new Date().toISOString().split('T')[0];
    const dischargedToday = ipdPatients.filter(p => p.status === 'Discharged' && p.dischargeDate === today).length;
    const avgStay = calculateAvgStay();
    
    document.getElementById('currentIpd').textContent = current;
    document.getElementById('availableBeds').textContent = available;
    document.getElementById('dischargedToday').textContent = dischargedToday;
    document.getElementById('avgStay').textContent = avgStay + ' days';
}

// ─── Filter ──────────────────────────────────────────

function getFilteredPatients() {
    return ipdPatients.filter(p => {
        const matchesSearch = searchTerm === '' || 
            p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === '' || p.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('ipdTable');
    if (!tbody) return;
    
    const filtered = getFilteredPatients();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="ipd-empty">
                    <i class="fas fa-hospital-user"></i>
                    <p>No IPD patients found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Admit a patient to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by admission date (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.admissionDate) - new Date(a.admissionDate));
    
    tbody.innerHTML = sorted.map(p => {
        const statusClass = p.status === 'Admitted' ? 'status-admitted' : 'status-discharged';
        
        return `
            <tr class="ipd-row" data-id="${p.id}">
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(p.patientName)}</td>
                <td style="color:var(--color-brown-300);">${esc(p.doctorName)}</td>
                <td style="color:var(--color-brown-300);">${esc(p.wardName)} / Bed ${p.bedNo}</td>
                <td style="color:var(--color-brown-300);">${p.admissionDate}</td>
                <td><span class="${statusClass}">${p.status}</span></td>
                <td style="text-align:center;">
                    ${p.status === 'Admitted' ? `
                        <div style="display:flex; gap:0.25rem; justify-content:center;">
                            <button class="action-btn discharge-btn" data-id="${p.id}" title="Discharge Patient">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="action-btn delete delete-btn" data-id="${p.id}" title="Delete Record">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    ` : `
                        <span class="discharged-label">Discharged</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
    
    // Bind events
    tbody.querySelectorAll('.discharge-btn').forEach(btn => {
        btn.addEventListener('click', () => openDischarge(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateWardAvailability();
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
    const wardSelect = document.getElementById('wardId');
    
    if (patientSelect) {
        // Only show patients not already admitted
        const admittedIds = ipdPatients.filter(p => p.status === 'Admitted').map(p => p.patientId);
        const availablePatients = patients.filter(p => !admittedIds.includes(p.id));
        
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            availablePatients.map(p => `<option value="${p.id}">${esc(p.fullName)} (${p.phone})</option>`).join('');
    }
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${esc(d.name)} (${d.specialization})</option>`).join('');
    }
    
    if (wardSelect) {
        const availableWards = wards.filter(w => w.available > 0);
        wardSelect.innerHTML = '<option value="">-- Select Ward --</option>' + 
            availableWards.map(w => `<option value="${w.id}">${esc(w.name)} (${w.available} beds available)</option>`).join('');
    }
    
    document.getElementById('ipdForm').reset();
    openModal('ipdModal');
}

function openDischarge(id) {
    dischargeId = id;
    document.getElementById('dischargeForm').reset();
    openModal('dischargeModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── Form Submit - Admit ────────────────────────────

function admitPatient(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const wardId = parseInt(document.getElementById('wardId').value);
    const diagnosis = document.getElementById('diagnosis').value.trim();
    
    if (!patientId || !doctorId || !wardId) {
        if (window.showToast) {
            window.showToast('Please select patient, doctor, and ward', 'error');
        }
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    const ward = wards.find(w => w.id === wardId);
    
    if (!patient || !doctor || !ward) {
        if (window.showToast) {
            window.showToast('Invalid selection', 'error');
        }
        return;
    }
    
    if (ward.available <= 0) {
        if (window.showToast) {
            window.showToast(`No beds available in ${ward.name}`, 'error');
        }
        return;
    }
    
    // Check if patient is already admitted
    if (ipdPatients.some(p => p.patientId === patientId && p.status === 'Admitted')) {
        if (window.showToast) {
            window.showToast(`${patient.fullName} is already admitted`, 'error');
        }
        return;
    }
    
    ward.available--;
    const bedNo = ward.totalBeds - ward.available;
    const newId = ipdPatients.length > 0 ? Math.max(...ipdPatients.map(p => p.id)) + 1 : 1;
    
    ipdPatients.push({
        id: newId,
        patientId: patientId,
        patientName: patient.fullName,
        doctorId: doctorId,
        doctorName: doctor.name,
        wardId: wardId,
        wardName: ward.name,
        bedNo: bedNo,
        admissionDate: new Date().toISOString().split('T')[0],
        diagnosis: diagnosis,
        status: 'Admitted'
    });
    
    saveIpd();
    refreshUI();
    closeModal('ipdModal');
    
    if (window.showToast) {
        window.showToast(`✅ ${patient.fullName} admitted to ${ward.name} - Bed ${bedNo}`, 'success');
    }
}

// ─── Form Submit - Discharge ─────────────────────────

function completeDischarge(e) {
    e.preventDefault();
    
    const patient = ipdPatients.find(p => p.id === dischargeId);
    if (!patient) {
        if (window.showToast) {
            window.showToast('Patient not found', 'error');
        }
        return;
    }
    
    patient.status = 'Discharged';
    patient.dischargeDate = new Date().toISOString().split('T')[0];
    patient.dischargeSummary = document.getElementById('dischargeSummary').value.trim();
    patient.dischargeMedications = document.getElementById('medications').value.trim();
    patient.followUp = document.getElementById('followUp').value;
    
    // Return bed to ward
    const ward = wards.find(w => w.id === patient.wardId);
    if (ward) ward.available++;
    
    saveIpd();
    refreshUI();
    closeModal('dischargeModal');
    
    if (window.showToast) {
        window.showToast(`✅ ${patient.patientName} discharged successfully`, 'success');
    }
    dischargeId = null;
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!currentDeleteId) return;
    
    const patient = ipdPatients.find(p => p.id === currentDeleteId);
    
    // Return bed to ward if patient was admitted
    if (patient && patient.status === 'Admitted') {
        const ward = wards.find(w => w.id === patient.wardId);
        if (ward) ward.available++;
    }
    
    ipdPatients = ipdPatients.filter(p => p.id !== currentDeleteId);
    saveIpd();
    refreshUI();
    closeModal('deleteModal');
    
    if (patient && window.showToast) {
        window.showToast(`🗑️ IPD record removed for ${patient.patientName}`, 'info');
    }
    currentDeleteId = null;
}

// ─── Init ────────────────────────────────────────────

function initIPDModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('admitBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeIpdModalBtn')?.addEventListener('click', () => closeModal('ipdModal'));
    document.getElementById('cancelIpdModalBtn')?.addEventListener('click', () => closeModal('ipdModal'));
    document.getElementById('closeDischargeModalBtn')?.addEventListener('click', () => closeModal('dischargeModal'));
    document.getElementById('cancelDischargeModalBtn')?.addEventListener('click', () => closeModal('dischargeModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('ipdForm')?.addEventListener('submit', admitPatient);
    document.getElementById('dischargeForm')?.addEventListener('submit', completeDischarge);
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderTable();
    });
    
    // Close modals on overlay click
    document.getElementById('ipdModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('ipdModal');
    });
    document.getElementById('dischargeModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('dischargeModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('ipdModal');
            closeModal('dischargeModal');
            closeModal('deleteModal');
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
            setTimeout(initIPDModule, 100);
        }
    }, 50);
    
    // Fallback: if sidebar doesn't load in 3 seconds, init anyway
    setTimeout(() => {
        clearInterval(checkInterval);
        initIPDModule();
    }, 3000);
});