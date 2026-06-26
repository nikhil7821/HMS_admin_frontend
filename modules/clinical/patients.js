/**
 * Patients Management JS - Clinical Module
 * Version: 3.1 - Added External Visits Integration
 */

let patients = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentDeleteId = null;
let searchTerm = '';
let genderFilter = '';
let conditionFilter = '';
let statusFilter = '';
let isInitialized = false;

// ─── 🔥 AUTO-OPEN FROM DASHBOARD ────────────────────
document.addEventListener('DOMContentLoaded', function() {
    var action = sessionStorage.getItem('dashboard_action');
    if (action === 'openAddPatient') {
        sessionStorage.removeItem('dashboard_action');
        setTimeout(function() {
            if (typeof openAddModal === 'function') {
                openAddModal();
            } else if (typeof window.openAddModal === 'function') {
                window.openAddModal();
            } else {
                var addBtn = document.getElementById('addPatientBtn');
                if (addBtn) addBtn.click();
            }
        }, 800);
    }
});

// ─── Data Management ──────────────────────────────

function loadPatients() {
    try {
        const stored = localStorage.getItem('hms_patients');
        if (stored) {
            patients = JSON.parse(stored);
            patients = patients.map(p => ({
                ...p,
                category: p.category || 'inpatient',
                condition: p.condition || 'stable',
                status: p.status || 'admitted',
                department: p.department || 'general',
                doctorId: p.doctorId || null,
                packageId: p.packageId || null,
                medicalNotes: p.medicalNotes || '',
                dischargeDate: p.dischargeDate || null,
                externalConsults: p.externalConsults || [],
                treatmentProgress: p.treatmentProgress || 0,
                treatmentMilestones: p.treatmentMilestones || [],
                packageStatus: p.packageStatus || 'not_started',
                treatmentStartDate: p.treatmentStartDate || p.createdAt || new Date().toISOString().split('T')[0],
                treatmentEndDate: p.treatmentEndDate || null
            }));
            savePatients();
        } else {
            // Seed data with treatment progress
            patients = [
                { 
                    id: 1, fullName: 'Ramesh Gupta', dob: '1985-03-15', gender: 'Male', 
                    bloodGroup: 'O+', phone: '+91 98765 43210', email: 'ramesh.gupta@medflow.com', 
                    address: '123 Lajpat Nagar, Delhi', createdAt: '2024-01-15', lastVisit: '2026-06-18',
                    category: 'inpatient', condition: 'critical', status: 'admitted',
                    department: 'cardiology', doctorId: 1, packageId: 1,
                    medicalNotes: 'Emergency admission with chest pain. Awaiting bypass surgery.',
                    dischargeDate: null, externalConsults: [],
                    treatmentProgress: 25,
                    treatmentMilestones: [
                        { date: '2026-06-10', milestone: 'Admitted to ICU', status: 'completed' },
                        { date: '2026-06-12', milestone: 'ECG and Blood Tests', status: 'completed' },
                        { date: '2026-06-15', milestone: 'Consultation with Cardiologist', status: 'in-progress' },
                        { date: '2026-06-20', milestone: 'Bypass Surgery', status: 'pending' }
                    ],
                    packageStatus: 'in_progress',
                    treatmentStartDate: '2026-06-10',
                    treatmentEndDate: null
                },
                { 
                    id: 2, fullName: 'Sneha Patil', dob: '1990-07-22', gender: 'Female', 
                    bloodGroup: 'A+', phone: '+91 98765 43211', email: 'sneha.patil@medflow.com', 
                    address: '456 Koregaon Park, Pune', createdAt: '2024-02-10', lastVisit: '2026-06-19',
                    category: 'outpatient', condition: 'stable', status: 'treatment',
                    department: 'orthopedics', doctorId: 3, packageId: null,
                    medicalNotes: 'Fractured right arm. Cast applied. Follow-up in 2 weeks.',
                    dischargeDate: null, externalConsults: [],
                    treatmentProgress: 60,
                    treatmentMilestones: [
                        { date: '2026-06-12', milestone: 'X-Ray done', status: 'completed' },
                        { date: '2026-06-12', milestone: 'Cast applied', status: 'completed' },
                        { date: '2026-06-19', milestone: 'Follow-up Checkup', status: 'in-progress' },
                        { date: '2026-06-26', milestone: 'Cast removal', status: 'pending' }
                    ],
                    packageStatus: 'not_started',
                    treatmentStartDate: '2026-06-12',
                    treatmentEndDate: null
                },
                { 
                    id: 3, fullName: 'Manish Verma', dob: '1978-11-05', gender: 'Male', 
                    bloodGroup: 'B+', phone: '+91 98765 43212', email: 'manish.verma@medflow.com', 
                    address: '789 Indira Nagar, Lucknow', createdAt: '2024-03-05', lastVisit: '2026-06-17',
                    category: 'emergency', condition: 'serious', status: 'admitted',
                    department: 'neurology', doctorId: 2, packageId: 2,
                    medicalNotes: 'Stroke symptoms. Under observation in ICU.',
                    dischargeDate: null, externalConsults: [],
                    treatmentProgress: 35,
                    treatmentMilestones: [
                        { date: '2026-06-14', milestone: 'Emergency Admission', status: 'completed' },
                        { date: '2026-06-14', milestone: 'CT Scan', status: 'completed' },
                        { date: '2026-06-16', milestone: 'Neurology Consultation', status: 'in-progress' },
                        { date: '2026-06-22', milestone: 'Rehabilitation Start', status: 'pending' }
                    ],
                    packageStatus: 'in_progress',
                    treatmentStartDate: '2026-06-14',
                    treatmentEndDate: null
                },
                { 
                    id: 4, fullName: 'Kiran Yadav', dob: '1995-02-18', gender: 'Female', 
                    bloodGroup: 'AB+', phone: '+91 98765 43213', email: 'kiran.yadav@medflow.com', 
                    address: '321 Vaishali Nagar, Jaipur', createdAt: '2024-04-20', lastVisit: '2026-06-19',
                    category: 'surgery', condition: 'recovering', status: 'treatment',
                    department: 'general', doctorId: 4, packageId: 3,
                    medicalNotes: 'Appendectomy performed. Recovery in progress.',
                    dischargeDate: null, externalConsults: [],
                    treatmentProgress: 80,
                    treatmentMilestones: [
                        { date: '2026-06-08', milestone: 'Pre-surgery checkup', status: 'completed' },
                        { date: '2026-06-09', milestone: 'Appendectomy Surgery', status: 'completed' },
                        { date: '2026-06-10', milestone: 'Post-surgery recovery', status: 'completed' },
                        { date: '2026-06-12', milestone: 'Discharge from Hospital', status: 'completed' },
                        { date: '2026-06-19', milestone: 'Follow-up Checkup', status: 'in-progress' }
                    ],
                    packageStatus: 'completed',
                    treatmentStartDate: '2026-06-08',
                    treatmentEndDate: null
                },
                { 
                    id: 5, fullName: 'Suresh Nair', dob: '1982-09-30', gender: 'Male', 
                    bloodGroup: 'O-', phone: '+91 98765 43214', email: 'suresh.nair@medflow.com', 
                    address: '654 Marine Drive, Kochi', createdAt: '2024-05-12', lastVisit: '2026-06-16',
                    category: 'consultation', condition: 'stable', status: 'discharged',
                    department: 'pediatrics', doctorId: 5, packageId: null,
                    medicalNotes: 'Routine checkup. Vaccination completed.',
                    dischargeDate: '2024-06-06', externalConsults: [],
                    treatmentProgress: 100,
                    treatmentMilestones: [
                        { date: '2026-06-05', milestone: 'Routine Checkup', status: 'completed' },
                        { date: '2026-06-05', milestone: 'Vaccination', status: 'completed' },
                        { date: '2026-06-06', milestone: 'Health Certificate Issued', status: 'completed' }
                    ],
                    packageStatus: 'completed',
                    treatmentStartDate: '2026-06-05',
                    treatmentEndDate: '2026-06-06'
                },
                { 
                    id: 6, fullName: 'Deepika Joshi', dob: '1988-12-12', gender: 'Female', 
                    bloodGroup: 'A-', phone: '+91 98765 43215', email: 'deepika.joshi@medflow.com', 
                    address: '987 Civil Lines, Allahabad', createdAt: '2024-06-01', lastVisit: '2026-06-19',
                    category: 'inpatient', condition: 'critical', status: 'admitted',
                    department: 'cardiology', doctorId: 1, packageId: 4,
                    medicalNotes: 'Heart failure. Monitoring closely.',
                    dischargeDate: null, externalConsults: [
                        { id: 1, externalDoctor: 'Dr. James Wilson (City Hospital)', consultDate: '2026-06-11', amount: 350, paymentStatus: 'pending', notes: 'Cardiac specialist consultation' }
                    ],
                    treatmentProgress: 45,
                    treatmentMilestones: [
                        { date: '2026-06-15', milestone: 'Admitted to ICU', status: 'completed' },
                        { date: '2026-06-16', milestone: 'Echocardiogram', status: 'completed' },
                        { date: '2026-06-17', milestone: 'Cardiology Consultation', status: 'in-progress' },
                        { date: '2026-06-20', milestone: 'Treatment Plan Review', status: 'pending' }
                    ],
                    packageStatus: 'in_progress',
                    treatmentStartDate: '2026-06-15',
                    treatmentEndDate: null
                },
                { 
                    id: 7, fullName: 'Pankaj Tiwari', dob: '1975-06-20', gender: 'Male', 
                    bloodGroup: 'B-', phone: '+91 98765 43216', email: 'pankaj.tiwari@medflow.com', 
                    address: '123 Sadar Bazaar, Agra', createdAt: '2024-06-10', lastVisit: '2026-06-18',
                    category: 'outpatient', condition: 'recovering', status: 'treatment',
                    department: 'orthopedics', doctorId: 3, packageId: null,
                    medicalNotes: 'Physical therapy for knee injury.',
                    dischargeDate: null, externalConsults: [],
                    treatmentProgress: 50,
                    treatmentMilestones: [
                        { date: '2026-06-13', milestone: 'Initial Assessment', status: 'completed' },
                        { date: '2026-06-14', milestone: 'Physical Therapy Session 1', status: 'completed' },
                        { date: '2026-06-16', milestone: 'Physical Therapy Session 2', status: 'in-progress' },
                        { date: '2026-06-20', milestone: 'Physical Therapy Session 3', status: 'pending' }
                    ],
                    packageStatus: 'not_started',
                    treatmentStartDate: '2026-06-13',
                    treatmentEndDate: null
                },
                { 
                    id: 8, fullName: 'Rekha Menon', dob: '1998-04-25', gender: 'Female', 
                    bloodGroup: 'O+', phone: '+91 98765 43217', email: 'rekha.menon@medflow.com', 
                    address: '456 Churchgate, Mumbai', createdAt: '2024-06-15', lastVisit: '2026-06-19',
                    category: 'consultation', condition: 'stable', status: 'consultation',
                    department: 'general', doctorId: 4, packageId: null,
                    medicalNotes: 'Annual health checkup.',
                    dischargeDate: null, externalConsults: [],
                    treatmentProgress: 0,
                    treatmentMilestones: [
                        { date: '2026-06-19', milestone: 'Health Checkup Scheduled', status: 'in-progress' }
                    ],
                    packageStatus: 'not_started',
                    treatmentStartDate: '2026-06-19',
                    treatmentEndDate: null
                },
                { 
                    id: 9, fullName: 'Harsh Vardhan', dob: '1992-11-08', gender: 'Male', 
                    bloodGroup: 'AB-', phone: '+91 98765 43218', email: 'harsh.vardhan@medflow.com', 
                    address: '789 MG Road, Indore', createdAt: '2024-06-20', lastVisit: '2026-06-17',
                    category: 'emergency', condition: 'serious', status: 'admitted',
                    department: 'neurology', doctorId: 2, packageId: 2,
                    medicalNotes: 'Migraine with aura. Under observation.',
                    dischargeDate: null, externalConsults: [],
                    treatmentProgress: 20,
                    treatmentMilestones: [
                        { date: '2026-06-20', milestone: 'Emergency Admission', status: 'completed' },
                        { date: '2026-06-20', milestone: 'Neurology Evaluation', status: 'in-progress' },
                        { date: '2026-06-22', milestone: 'MRI Scan', status: 'pending' }
                    ],
                    packageStatus: 'in_progress',
                    treatmentStartDate: '2026-06-20',
                    treatmentEndDate: null
                },
                { 
                    id: 10, fullName: 'Shweta Sinha', dob: '1987-08-14', gender: 'Female', 
                    bloodGroup: 'A+', phone: '+91 98765 43219', email: 'shweta.sinha@medflow.com', 
                    address: '321 Boring Road, Patna', createdAt: '2024-06-25', lastVisit: '2026-06-16',
                    category: 'surgery', condition: 'recovering', status: 'discharged',
                    department: 'general', doctorId: 4, packageId: 3,
                    medicalNotes: 'Gallbladder surgery. Recovery complete.',
                    dischargeDate: '2024-07-10', externalConsults: [],
                    treatmentProgress: 100,
                    treatmentMilestones: [
                        { date: '2026-06-25', milestone: 'Pre-surgery Tests', status: 'completed' },
                        { date: '2026-06-26', milestone: 'Gallbladder Surgery', status: 'completed' },
                        { date: '2026-06-28', milestone: 'Post-surgery Recovery', status: 'completed' },
                        { date: '2026-07-01', milestone: 'Discharge', status: 'completed' }
                    ],
                    packageStatus: 'completed',
                    treatmentStartDate: '2026-06-25',
                    treatmentEndDate: '2026-07-10'
                }
            ];
            savePatients();
        }
        refreshUI();
        populateDoctorAndPackageSelects();
    } catch (error) {
        console.error('Error loading patients:', error);
        if (window.showToast) {
            window.showToast('Error loading patient data', 'error');
        }
    }
}

function savePatients() {
    try {
        localStorage.setItem('hms_patients', JSON.stringify(patients));
    } catch (error) {
        console.error('Error saving patients:', error);
    }
}

// ─── 🆕 External Visits Helper ──────────────────────────────────

function getExternalVisitsForPatient(patientId) {
    try {
        const visits = JSON.parse(localStorage.getItem('hms_external_visits') || '[]');
        return visits.filter(v => v.patientId === patientId);
    } catch {
        return [];
    }
}

function getExternalVisitsCount(patientId) {
    return getExternalVisitsForPatient(patientId).length;
}

function getExternalVisitsTotal(patientId) {
    const visits = getExternalVisitsForPatient(patientId);
    return visits.reduce((sum, v) => sum + (v.amount || 0), 0);
}

// ─── Doctor and Package Helpers ──────────────────────

function getDoctors() {
    try {
        const stored = localStorage.getItem('hms_doctors');
        if (stored) {
            return JSON.parse(stored);
        }
        return [
            { id: 1, name: 'Dr. Robert Williams', specialty: 'cardiology', type: 'inhouse' },
            { id: 2, name: 'Dr. Emily Chen', specialty: 'neurology', type: 'inhouse' },
            { id: 3, name: 'Dr. Michael Rodriguez', specialty: 'orthopedics', type: 'inhouse' },
            { id: 4, name: 'Dr. Lisa Patel', specialty: 'general', type: 'inhouse' },
            { id: 5, name: 'Dr. Thomas Kim', specialty: 'pediatrics', type: 'inhouse' }
        ];
    } catch {
        return [];
    }
}

function getPackages() {
    try {
        const stored = localStorage.getItem('medflow_packages');
        if (stored) {
            return JSON.parse(stored);
        }
        return [
            { id: 1, name: 'Heart Care Premium', price: 5000, duration: 7 },
            { id: 2, name: 'Neurology Recovery', price: 4500, duration: 10 },
            { id: 3, name: 'Surgery Complete', price: 3500, duration: 5 },
            { id: 4, name: 'Cardiac Observation', price: 2800, duration: 3 }
        ];
    } catch {
        return [];
    }
}

function getDoctorName(doctorId) {
    if (!doctorId) return 'Not Assigned';
    const doctors = getDoctors();
    const doc = doctors.find(d => d.id === doctorId);
    return doc ? doc.name : 'Not Assigned';
}

function getPackageName(packageId) {
    if (!packageId) return 'None';
    const packages = getPackages();
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.name : 'None';
}

function populateDoctorAndPackageSelects() {
    const doctorSelect = document.getElementById('patientDoctor');
    const packageSelect = document.getElementById('patientPackage');
    
    if (doctorSelect) {
        const currentVal = doctorSelect.value;
        doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
        getDoctors().forEach(d => {
            const option = document.createElement('option');
            option.value = d.id;
            option.textContent = `${d.name} (${d.specialty})${d.type === 'external' ? ' - External' : ''}`;
            doctorSelect.appendChild(option);
        });
        if (currentVal) doctorSelect.value = currentVal;
    }
    
    if (packageSelect) {
        const currentVal = packageSelect.value;
        packageSelect.innerHTML = '<option value="">Select Package</option>';
        getPackages().forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.name} ($${p.price})`;
            packageSelect.appendChild(option);
        });
        if (currentVal) packageSelect.value = currentVal;
    }
}

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function calculateAge(dob) {
    if (!dob) return '?';
    try {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch {
        return '?';
    }
}

function getInitials(name) {
    if (!name) return 'P';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// ─── Badge Helpers ──────────────────────────────────

function getCategoryBadge(category) {
    const map = {
        'inpatient': { label: 'IPD', class: 'badge-ipd' },
        'outpatient': { label: 'OPD', class: 'badge-opd' },
        'emergency': { label: '🚨 Emergency', class: 'badge-emergency' },
        'consultation': { label: 'Consult', class: 'badge-consultation' },
        'surgery': { label: '🔬 Surgery', class: 'badge-surgery' }
    };
    return map[category] || { label: category, class: '' };
}

function getConditionBadge(condition) {
    const map = {
        'critical': { label: 'Critical', class: 'badge-critical' },
        'stable': { label: 'Stable', class: 'badge-stable' },
        'serious': { label: 'Serious', class: 'badge-serious' },
        'recovering': { label: 'Recovering', class: 'badge-recovering' }
    };
    return map[condition] || { label: condition, class: '' };
}

function getStatusBadge(status) {
    const map = {
        'admitted': { label: 'Admitted', class: 'badge-admitted', dot: 'green' },
        'treatment': { label: 'Under Treatment', class: 'badge-treatment', dot: 'blue' },
        'discharged': { label: 'Discharged', class: 'badge-discharged', dot: 'gray' },
        'consultation': { label: 'Consultation', class: 'badge-consultation', dot: 'yellow' }
    };
    return map[status] || { label: status, class: '', dot: 'gray' };
}

function getPackageStatusBadge(status) {
    const map = {
        'not_started': { label: 'Not Started', class: 'badge-secondary' },
        'in_progress': { label: 'In Progress', class: 'badge-progress' },
        'completed': { label: 'Completed', class: 'badge-completed' },
        'expired': { label: 'Expired', class: 'badge-error' }
    };
    return map[status] || { label: 'Not Started', class: 'badge-secondary' };
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = patients.length;
    
    const today = new Date().toISOString().split('T')[0];
    const activeToday = patients.filter(p => {
        const visitDate = p.lastVisit || p.createdAt?.split('T')[0];
        return visitDate === today;
    }).length;
    
    const treatmentCount = patients.filter(p => p.status === 'treatment').length;
    const admittedCount = patients.filter(p => p.status === 'admitted').length;
    const dischargedCount = patients.filter(p => p.status === 'discharged').length;
    
    document.getElementById('totalPatients').textContent = total;
    document.getElementById('activeToday').textContent = activeToday;
    document.getElementById('treatmentCount').textContent = treatmentCount;
    document.getElementById('admitDischargeRatio').textContent = `${admittedCount}/${dischargedCount}`;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredPatients() {
    return patients.filter(patient => {
        const matchesSearch = searchTerm === '' || 
            patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm) ||
            patient.id.toString().includes(searchTerm);
        
        const matchesGender = genderFilter === '' || patient.gender === genderFilter;
        const matchesCondition = conditionFilter === '' || patient.condition === conditionFilter;
        const matchesStatus = statusFilter === '' || patient.status === statusFilter;
        
        return matchesSearch && matchesGender && matchesCondition && matchesStatus;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const filtered = getFilteredPatients();
    const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
    
    if (currentPage > totalPages) currentPage = totalPages;
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, filtered.length);
    const pagePatients = filtered.slice(start, end);
    
    const tbody = document.getElementById('patientsTableBody');
    
    if (pagePatients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="patients-empty">
                    <i class="fas fa-folder-open"></i>
                    <p style="font-size:0.875rem;">No patients found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Try adjusting your search or add a new patient.</p>
                </td>
            </tr>
        `;
        document.getElementById('paginationInfo').textContent = 'Showing 0 of 0 patients';
        document.getElementById('paginationButtons').innerHTML = '';
        return;
    }
    
    tbody.innerHTML = pagePatients.map(patient => {
        const category = getCategoryBadge(patient.category);
        const condition = getConditionBadge(patient.condition);
        const status = getStatusBadge(patient.status);
        const doctorName = getDoctorName(patient.doctorId);
        const pkgStatus = getPackageStatusBadge(patient.packageStatus);
        const externalVisits = getExternalVisitsForPatient(patient.id);
        const externalTotal = externalVisits.reduce((sum, v) => sum + (v.amount || 0), 0);
        
        return `
            <tr class="patient-row" data-id="${patient.id}">
                <td>
                    <span class="patient-id">P-${patient.id.toString().padStart(5, '0')}</span>
                </td>
                <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span class="patient-avatar">${getInitials(patient.fullName)}</span>
                        <span style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(patient.fullName)}</span>
                        <div style="font-size:0.6rem; color:var(--color-brown-100);">${calculateAge(patient.dob)}y</div>
                    </div>
                </td>
                <td class="hide-mobile"><span class="badge-category ${category.class}">${category.label}</span></td>
                <td class="hide-mobile"><span class="badge-condition ${condition.class}">${condition.label}</span></td>
                <td class="hide-mobile">
                    <span class="badge-status ${status.class}">
                        <span class="status-dot ${status.dot}"></span>
                        ${status.label}
                    </span>
                </td>
                <td class="hide-mobile" style="font-size:0.75rem; color:var(--color-brown-300);">${doctorName}</td>
                <td class="hide-mobile">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <div style="width:60px; height:4px; background:#f0e8e0; border-radius:4px; overflow:hidden;">
                            <div style="width:${patient.treatmentProgress || 0}%; height:100%; background:linear-gradient(90deg, #9bb88b, #7d9b6e); border-radius:4px;"></div>
                        </div>
                        <span style="font-size:0.6rem; color:var(--color-brown-100);">${patient.treatmentProgress || 0}%</span>
                    </div>
                </td>
                <td style="text-align:center;">
                    <div style="display:flex; gap:0.25rem; justify-content:center;">
                        <button class="action-btn view-btn" data-id="${patient.id}" title="View Patient Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" data-id="${patient.id}" title="Edit Patient">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete delete-btn" data-id="${patient.id}" title="Delete Patient">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Update pagination info
    document.getElementById('paginationInfo').textContent = 
        `Showing ${start + 1} to ${end} of ${filtered.length} patients`;
    
    // Update pagination buttons
    let paginationHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }
    document.getElementById('paginationButtons').innerHTML = paginationHtml;
    
    // ─── FIXED: View button redirects to profile page ───
    tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            const id = this.getAttribute('data-id');
            console.log('👁️ View clicked for patient ID:', id);
            if (id) {
                window.location.href = 'patient-profile.html?id=' + id;
            } else {
                console.error('❌ No ID found on button');
            }
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
    
    // Bind pagination events using delegation
    document.getElementById('paginationButtons').addEventListener('click', function(e) {
        const btn = e.target.closest('.pagination-btn');
        if (btn) {
            currentPage = parseInt(btn.dataset.page);
            renderTable();
        }
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── View Patient ──────────────────────────────────

function viewPatient(id) {
    console.log('🔍 viewPatient called with ID:', id);
    if (!id) {
        if (window.showToast) {
            window.showToast('Invalid patient ID', 'error');
        }
        return;
    }
    window.location.href = 'patient-profile.html?id=' + id;
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
    document.getElementById('patientForm').reset();
    document.getElementById('patientId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add New Patient';
    document.getElementById('patientStatus').value = 'admitted';
    document.getElementById('patientCondition').value = 'stable';
    document.getElementById('patientCategory').value = 'inpatient';
    document.getElementById('patientAdmittedDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('treatmentProgress').value = 0;
    document.getElementById('packageStatus').value = 'not_started';
    populateDoctorAndPackageSelects();
    openModal('patientModal');
}

function openEditModal(id) {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Edit Patient';
    document.getElementById('patientId').value = patient.id;
    document.getElementById('fullName').value = patient.fullName;
    document.getElementById('dob').value = patient.dob;
    document.getElementById('gender').value = patient.gender;
    document.getElementById('bloodGroup').value = patient.bloodGroup || '';
    document.getElementById('phone').value = patient.phone;
    document.getElementById('email').value = patient.email || '';
    document.getElementById('address').value = patient.address || '';
    
    document.getElementById('patientCategory').value = patient.category || 'inpatient';
    document.getElementById('patientCondition').value = patient.condition || 'stable';
    document.getElementById('patientStatus').value = patient.status || 'admitted';
    document.getElementById('patientDepartment').value = patient.department || 'general';
    document.getElementById('patientDoctor').value = patient.doctorId || '';
    document.getElementById('patientPackage').value = patient.packageId || '';
    document.getElementById('medicalNotes').value = patient.medicalNotes || '';
    
    // NEW: Treatment Progress Fields
    document.getElementById('treatmentProgress').value = patient.treatmentProgress || 0;
    document.getElementById('packageStatus').value = patient.packageStatus || 'not_started';
    document.getElementById('treatmentStartDate').value = patient.treatmentStartDate || '';
    document.getElementById('treatmentEndDate').value = patient.treatmentEndDate || '';
    
    populateDoctorAndPackageSelects();
    openModal('patientModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('patientId').value;
    const patientData = {
        fullName: document.getElementById('fullName').value.trim(),
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        category: document.getElementById('patientCategory').value,
        condition: document.getElementById('patientCondition').value,
        status: document.getElementById('patientStatus').value,
        department: document.getElementById('patientDepartment').value || 'general',
        doctorId: parseInt(document.getElementById('patientDoctor').value) || null,
        packageId: parseInt(document.getElementById('patientPackage').value) || null,
        medicalNotes: document.getElementById('medicalNotes').value.trim(),
        // NEW: Treatment Progress Fields
        treatmentProgress: parseInt(document.getElementById('treatmentProgress').value) || 0,
        packageStatus: document.getElementById('packageStatus').value || 'not_started',
        treatmentStartDate: document.getElementById('treatmentStartDate').value || new Date().toISOString().split('T')[0],
        treatmentEndDate: document.getElementById('treatmentEndDate').value || null,
        updatedAt: new Date().toISOString()
    };
    
    if (!patientData.fullName || !patientData.dob || !patientData.gender || !patientData.phone) {
        if (window.showToast) {
            window.showToast('Please fill in all required fields', 'error');
        }
        return;
    }
    
    if (id) {
        const index = patients.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            // Preserve existing external consults and milestones
            patientData.externalConsults = patients[index].externalConsults || [];
            patientData.treatmentMilestones = patients[index].treatmentMilestones || [];
            if (patientData.status === 'discharged' && patients[index].status !== 'discharged') {
                patientData.dischargeDate = new Date().toISOString().split('T')[0];
                patientData.treatmentEndDate = new Date().toISOString().split('T')[0];
                patientData.packageStatus = 'completed';
                patientData.treatmentProgress = 100;
            }
            patients[index] = { ...patients[index], ...patientData };
            if (window.showToast) window.showToast(`✅ ${patientData.fullName} updated successfully`, 'success');
        }
    } else {
        const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
        patients.push({
            id: newId,
            ...patientData,
            createdAt: new Date().toISOString(),
            lastVisit: new Date().toISOString().split('T')[0],
            dischargeDate: patientData.status === 'discharged' ? new Date().toISOString().split('T')[0] : null,
            externalConsults: [],
            treatmentMilestones: []
        });
        if (window.showToast) window.showToast(`✅ ${patientData.fullName} added successfully`, 'success');
    }
    
    savePatients();
    refreshUI();
    closeModal('patientModal');
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!currentDeleteId) return;
    
    const patient = patients.find(p => p.id === currentDeleteId);
    patients = patients.filter(p => p.id !== currentDeleteId);
    savePatients();
    refreshUI();
    closeModal('deleteModal');
    
    if (patient && window.showToast) {
        window.showToast(`🗑️ ${patient.fullName} deleted`, 'error');
    }
    currentDeleteId = null;
}

// ─── Init ────────────────────────────────────────────

function initPatientsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('🚀 Initializing Patients Module...');
    loadPatients();
    
    document.getElementById('addPatientBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('patientModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('patientModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('patientForm')?.addEventListener('submit', handleFormSubmit);
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = '';
        genderFilter = '';
        conditionFilter = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('genderFilter').value = '';
        document.getElementById('conditionFilter').value = '';
        document.getElementById('statusFilter').value = '';
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('genderFilter')?.addEventListener('change', (e) => {
        genderFilter = e.target.value;
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('conditionFilter')?.addEventListener('change', (e) => {
        conditionFilter = e.target.value;
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('patientModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('patientModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('patientModal');
            closeModal('deleteModal');
        }
    });
    
    console.log('✅ Patients Module initialized. Total patients:', patients.length);
}

// ─── Expose for Auto-Open ──────────────────────────

window.openAddModal = openAddModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.viewPatient = viewPatient;
window.getExternalVisitsForPatient = getExternalVisitsForPatient;
window.getExternalVisitsCount = getExternalVisitsCount;
window.getExternalVisitsTotal = getExternalVisitsTotal;

// ─── Wait for DOM ──────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded');
    setTimeout(initPatientsModule, 500);
});