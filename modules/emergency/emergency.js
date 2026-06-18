/**
 * Emergency Management JS - Emergency Module
 * Uses theme.css for styling, clean event handling
 */

let emergencyCases = [];
let doctors = [];
let patients = [];
let searchTerm = '';
let priorityFilter = '';
let statusFilter = '';
let isInitialized = false;

// ─── 🔥 ADD THIS HERE - Auto-Open from Dashboard ───
document.addEventListener('DOMContentLoaded', function() {
    var action = sessionStorage.getItem('dashboard_action');
    if (action === 'openEmergency') {
        sessionStorage.removeItem('dashboard_action');
        setTimeout(function() {
            if (typeof openEmergencyModal === 'function') {
                openEmergencyModal();
            } else if (typeof window.openEmergencyModal === 'function') {
                window.openEmergencyModal();
            } else {
                var addBtn = document.getElementById('newEmergencyBtn');
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

function formatTime(timestamp) {
    if (!timestamp) return '-';
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return timestamp;
    }
}

function getPriorityClass(priority) {
    const map = {
        'Critical': 'critical',
        'High': 'high',
        'Medium': 'medium',
        'Low': 'low'
    };
    return map[priority] || 'low';
}

function getStatusClass(status) {
    const map = {
        'Waiting': 'waiting',
        'In Treatment': 'treatment',
        'Admitted': 'admitted',
        'Discharged': 'discharged'
    };
    return map[status] || 'waiting';
}

function getStatusIcon(status) {
    const map = {
        'Waiting': 'fa-hourglass-half',
        'In Treatment': 'fa-stethoscope',
        'Admitted': 'fa-procedures',
        'Discharged': 'fa-check-circle'
    };
    return map[status] || 'fa-clock';
}

function getInitials(name) {
    if (!name) return 'P';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function generateCaseNo(id) {
    const year = new Date().getFullYear();
    return 'ER-' + year + String(id).padStart(5, '0');
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        
        const stored = localStorage.getItem('emergency_cases');
        if (stored) {
            emergencyCases = JSON.parse(stored);
        } else {
            setIndianEmergencyCases();
        }
        refreshUI();
        populateDoctorSelects();
    } catch (error) {
        console.error('Error loading emergency data:', error);
        if (window.showToast) {
            window.showToast('Error loading emergency data', 'error');
        }
    }
}

function setIndianEmergencyCases() {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleString();
    
    emergencyCases = [
        {
            id: 1, 
            caseNo: 'ER-20260001', 
            patientId: 1, 
            patientName: 'Rajesh Kumar', 
            phone: '+91 98765 43210', 
            age: 45, 
            gender: 'Male', 
            address: '123 Gandhi Nagar, Mumbai', 
            priority: 'Critical', 
            complaints: 'Severe chest pain, difficulty breathing, sweating', 
            bp: '160/100', 
            heartRate: '110', 
            temperature: '99.2', 
            oxygen: '92', 
            status: 'In Treatment', 
            doctorId: 1, 
            doctorName: 'Dr. Anjali Nair', 
            arrivalTime: now, 
            treatmentNotes: 'Under observation, ECG done, suspected MI',
            ambulance: true
        },
        {
            id: 2, 
            caseNo: 'ER-20260002', 
            patientId: 2, 
            patientName: 'Priya Sharma', 
            phone: '+91 98765 43211', 
            age: 32, 
            gender: 'Female', 
            address: '456 Green Park, Delhi', 
            priority: 'High', 
            complaints: 'Fractured arm from bike accident, severe pain', 
            bp: '130/85', 
            heartRate: '95', 
            temperature: '98.6', 
            oxygen: '98', 
            status: 'Waiting', 
            doctorId: null, 
            doctorName: '', 
            arrivalTime: now, 
            treatmentNotes: '',
            ambulance: true
        },
        {
            id: 3, 
            caseNo: 'ER-20260003', 
            patientId: 3, 
            patientName: 'Amit Patel', 
            phone: '+91 98765 43212', 
            age: 28, 
            gender: 'Male', 
            address: '789 Lake View, Bangalore', 
            priority: 'Medium', 
            complaints: 'Severe abdominal pain, vomiting, fever', 
            bp: '120/80', 
            heartRate: '88', 
            temperature: '99.5', 
            oxygen: '99', 
            status: 'Admitted', 
            doctorId: 2, 
            doctorName: 'Dr. Vikram Singh', 
            arrivalTime: now, 
            treatmentNotes: 'Appendicitis suspected, admitted for surgery',
            ambulance: false
        },
        {
            id: 4, 
            caseNo: 'ER-20260004', 
            patientId: 4, 
            patientName: 'Neha Gupta', 
            phone: '+91 98765 43213', 
            age: 25, 
            gender: 'Female', 
            address: '321 Rose Garden, Pune', 
            priority: 'Low', 
            complaints: 'High fever and cough since 3 days', 
            bp: '118/78', 
            heartRate: '76', 
            temperature: '100.2', 
            oxygen: '98', 
            status: 'Discharged', 
            doctorId: 3, 
            doctorName: 'Dr. Sneha Joshi', 
            arrivalTime: now, 
            treatmentNotes: 'Prescribed antibiotics and rest. Condition improved.',
            ambulance: false
        },
        {
            id: 5, 
            caseNo: 'ER-20260005', 
            patientId: 5, 
            patientName: 'Sunil Reddy', 
            phone: '+91 98765 43214', 
            age: 55, 
            gender: 'Male', 
            address: '654 Jubilee Hills, Hyderabad', 
            priority: 'Critical', 
            complaints: 'Loss of consciousness, high BP, stroke symptoms', 
            bp: '180/110', 
            heartRate: '120', 
            temperature: '98.8', 
            oxygen: '89', 
            status: 'In Treatment', 
            doctorId: 4, 
            doctorName: 'Dr. Rajiv Menon', 
            arrivalTime: now, 
            treatmentNotes: 'ICU admitted, on ventilator support, CT scan pending',
            ambulance: true
        },
        {
            id: 6, 
            caseNo: 'ER-20260006', 
            patientId: 6, 
            patientName: 'Meera Desai', 
            phone: '+91 98765 43215', 
            age: 38, 
            gender: 'Female', 
            address: '987 Lake Road, Chennai', 
            priority: 'High', 
            complaints: 'Severe headache, blurred vision, nausea', 
            bp: '145/95', 
            heartRate: '92', 
            temperature: '98.4', 
            oxygen: '97', 
            status: 'Waiting', 
            doctorId: null, 
            doctorName: '', 
            arrivalTime: now, 
            treatmentNotes: '',
            ambulance: false
        }
    ];
    saveEmergencyCases();
}

function saveEmergencyCases() {
    try {
        localStorage.setItem('emergency_cases', JSON.stringify(emergencyCases));
    } catch (error) {
        console.error('Error saving emergency cases:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const critical = emergencyCases.filter(c => c.priority === 'Critical' && c.status !== 'Discharged').length;
    const high = emergencyCases.filter(c => c.priority === 'High' && c.status !== 'Discharged').length;
    const stable = emergencyCases.filter(c => (c.priority === 'Medium' || c.priority === 'Low') && c.status !== 'Discharged').length;
    const waiting = emergencyCases.filter(c => c.status === 'Waiting').length;
    
    document.getElementById('criticalCount').textContent = critical;
    document.getElementById('highCount').textContent = high;
    document.getElementById('stableCount').textContent = stable;
    document.getElementById('waitingCount').textContent = waiting;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredCases() {
    return emergencyCases.filter(c => {
        const matchesSearch = searchTerm === '' || 
            c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.caseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm);
        
        const matchesPriority = priorityFilter === '' || c.priority === priorityFilter;
        const matchesStatus = statusFilter === '' || c.status === statusFilter;
        
        return matchesSearch && matchesPriority && matchesStatus;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('emergencyTable');
    if (!tbody) return;
    
    const filtered = getFilteredCases();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="emergency-empty">
                    <i class="fas fa-ambulance"></i>
                    <p>No emergency cases found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Register a new emergency case to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by priority order
    const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    const sorted = [...filtered].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    tbody.innerHTML = sorted.map(c => {
        const priorityClass = getPriorityClass(c.priority);
        const statusClass = getStatusClass(c.status);
        const statusIcon = getStatusIcon(c.status);
        const complaintsDisplay = c.complaints.length > 35 ? 
            c.complaints.substring(0, 35) + '...' : 
            c.complaints;
        
        return `
            <tr class="emergency-row" data-id="${c.id}">
                <td style="font-family:monospace; font-size:0.75rem; font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${c.caseNo}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <div class="patient-avatar-sm ${priorityClass}">${getInitials(c.patientName)}</div>
                        <div>
                            <p style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.8125rem; margin:0;">${esc(c.patientName)}</p>
                            <p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">${c.phone}</p>
                        </div>
                    </div>
                </td>
                <td><span class="priority-${priorityClass}">${c.priority}</span></td>
                <td style="color:var(--color-brown-300); font-size:0.8125rem;">${esc(complaintsDisplay)}</td>
                <td style="color:var(--color-brown-300); font-size:0.8125rem;">${formatTime(c.arrivalTime)}</td>
                <td>
                    <span class="status-badge status-${statusClass}">
                        <i class="status-icon fas ${statusIcon}"></i>
                        ${c.status}
                    </span>
                </td>
                <td style="color:var(--color-brown-300); font-size:0.8125rem;">
                    ${c.doctorName ? esc(c.doctorName) : '<span class="not-assigned">Not assigned</span>'}
                </td>
                <td style="text-align:center;">
                    <div style="display:flex; gap:0.25rem; justify-content:center;">
                        <button class="action-btn view-btn" data-id="${c.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!c.doctorId ? `
                            <button class="action-btn assign-btn" data-id="${c.id}" title="Assign Doctor">
                                <i class="fas fa-user-md"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn status-btn" data-id="${c.id}" title="Update Status">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                        <button class="action-btn delete delete-btn" data-id="${c.id}" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Bind events
    tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewEmergencyCase(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.assign-btn').forEach(btn => {
        btn.addEventListener('click', () => openAssignModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', () => openStatusModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteEmergencyCase(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Doctor Selects ──────────────────────────────────

function populateDoctorSelects() {
    const doctorSelect = document.getElementById('doctorId');
    const assignDoctorSelect = document.getElementById('assignDoctorId');
    
    const options = doctors.map(d => 
        `<option value="${d.id}">${esc(d.name)} (${d.specialization})</option>`
    ).join('');
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">Auto Assign</option>' + options;
    }
    
    if (assignDoctorSelect) {
        assignDoctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + options;
    }
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

function openEmergencyModal() {
    document.getElementById('emergencyForm').reset();
    document.querySelector('input[name="ambulance"][value="no"]').checked = true;
    populateDoctorSelects();
    openModal('emergencyModal');
}

function openAssignModal(id) {
    const case_ = emergencyCases.find(c => c.id === id);
    if (case_) {
        document.getElementById('assignCaseId').value = id;
        populateDoctorSelects();
        openModal('assignModal');
    }
}

function openStatusModal(id) {
    const case_ = emergencyCases.find(c => c.id === id);
    if (case_) {
        document.getElementById('statusCaseId').value = id;
        document.getElementById('newStatus').value = case_.status;
        document.getElementById('statusNotes').value = '';
        openModal('statusModal');
    }
}

// ─── Form Submit - Emergency ─────────────────────────

function saveEmergencyCase(e) {
    e.preventDefault();
    
    const patientData = {
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value.trim()
    };
    
    if (!patientData.fullName || !patientData.phone) {
        if (window.showToast) {
            window.showToast('Please enter patient name and phone number', 'error');
        }
        return;
    }
    
    // Find or create patient
    let patientId = null;
    let existingPatient = patients.find(p => p.phone === patientData.phone);
    
    if (existingPatient) {
        patientId = existingPatient.id;
    } else {
        const newPatientId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
        patients.push({
            id: newPatientId,
            fullName: patientData.fullName,
            phone: patientData.phone,
            age: patientData.age || '',
            gender: patientData.gender || '',
            address: patientData.address || '',
            dob: '',
            bloodGroup: '',
            email: '',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('hms_patients', JSON.stringify(patients));
        patientId = newPatientId;
    }
    
    const doctorId = document.getElementById('doctorId').value;
    const doctor = doctors.find(d => d.id === parseInt(doctorId));
    const ambulance = document.querySelector('input[name="ambulance"]:checked').value;
    
    const newId = emergencyCases.length > 0 ? Math.max(...emergencyCases.map(c => c.id)) + 1 : 1;
    const caseNo = generateCaseNo(newId);
    
    emergencyCases.push({
        id: newId,
        caseNo: caseNo,
        patientId: patientId,
        patientName: patientData.fullName,
        phone: patientData.phone,
        age: patientData.age || '',
        gender: patientData.gender || '',
        address: patientData.address || '',
        priority: document.getElementById('priority').value,
        complaints: document.getElementById('complaints').value.trim(),
        bp: document.getElementById('bp').value.trim(),
        heartRate: document.getElementById('heartRate').value.trim(),
        temperature: document.getElementById('temperature').value.trim(),
        oxygen: document.getElementById('oxygen').value.trim(),
        status: 'Waiting',
        doctorId: doctorId ? parseInt(doctorId) : null,
        doctorName: doctor?.name || '',
        arrivalTime: new Date().toLocaleString(),
        treatmentNotes: '',
        ambulance: ambulance === 'yes'
    });
    
    saveEmergencyCases();
    refreshUI();
    closeModal('emergencyModal');
    
    if (window.showToast) {
        window.showToast(`✅ Emergency case registered! Case ID: ${caseNo}`, 'success');
    }
}

// ─── Form Submit - Assign Doctor ─────────────────────

function assignDoctor(e) {
    e.preventDefault();
    
    const caseId = parseInt(document.getElementById('assignCaseId').value);
    const doctorId = parseInt(document.getElementById('assignDoctorId').value);
    const doctor = doctors.find(d => d.id === doctorId);
    
    const case_ = emergencyCases.find(c => c.id === caseId);
    if (case_ && doctor) {
        case_.doctorId = doctorId;
        case_.doctorName = doctor.name;
        saveEmergencyCases();
        refreshUI();
        closeModal('assignModal');
        if (window.showToast) {
            window.showToast(`✅ ${doctor.name} assigned successfully`, 'success');
        }
    } else {
        if (window.showToast) {
            window.showToast('Please select a doctor', 'error');
        }
    }
}

// ─── Form Submit - Update Status ─────────────────────

function saveStatus(e) {
    e.preventDefault();
    
    const caseId = parseInt(document.getElementById('statusCaseId').value);
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('statusNotes').value.trim();
    
    const case_ = emergencyCases.find(c => c.id === caseId);
    if (case_) {
        case_.status = newStatus;
        if (notes) {
            case_.treatmentNotes = case_.treatmentNotes ? 
                case_.treatmentNotes + '\n' + notes : 
                notes;
        }
        saveEmergencyCases();
        refreshUI();
        closeModal('statusModal');
        if (window.showToast) {
            window.showToast(`✅ Status updated to ${newStatus}`, 'success');
        }
    }
}

// ─── View ────────────────────────────────────────────

function viewEmergencyCase(id) {
    const case_ = emergencyCases.find(c => c.id === id);
    if (!case_) return;
    
    const viewContent = document.getElementById('viewEmergencyContent');
    const priorityClass = getPriorityClass(case_.priority);
    const statusClass = getStatusClass(case_.status);
    const statusIcon = getStatusIcon(case_.status);
    
    viewContent.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
            <!-- Case Info -->
            <div style="background:var(--color-error-bg); padding:0.5rem 0.75rem; border-radius:var(--radius-md);">
                <p style="font-size:0.6875rem; font-weight:var(--font-weight-medium); color:var(--color-error-text); margin:0;">
                    <i class="fas fa-info-circle"></i> Case Information
                </p>
            </div>
            <div class="detail-grid">
                <div>
                    <p class="detail-label">Case ID</p>
                    <p class="detail-value" style="font-weight:var(--font-weight-medium);">${case_.caseNo}</p>
                </div>
                <div>
                    <p class="detail-label">Arrival Time</p>
                    <p class="detail-value">${case_.arrivalTime}</p>
                </div>
                <div>
                    <p class="detail-label">Priority</p>
                    <p class="detail-value"><span class="priority-${priorityClass}">${case_.priority}</span></p>
                </div>
                <div>
                    <p class="detail-label">Status</p>
                    <p class="detail-value">
                        <span class="status-badge status-${statusClass}">
                            <i class="status-icon fas ${statusIcon}"></i>
                            ${case_.status}
                        </span>
                    </p>
                </div>
            </div>
            
            <!-- Patient Info -->
            <div style="background:var(--color-info-bg); padding:0.5rem 0.75rem; border-radius:var(--radius-md);">
                <p style="font-size:0.6875rem; font-weight:var(--font-weight-medium); color:var(--color-info-text); margin:0;">
                    <i class="fas fa-user-injured"></i> Patient Information
                </p>
            </div>
            <div class="detail-grid">
                <div>
                    <p class="detail-label">Full Name</p>
                    <p class="detail-value" style="font-weight:var(--font-weight-medium);">${esc(case_.patientName)}</p>
                </div>
                <div>
                    <p class="detail-label">Phone</p>
                    <p class="detail-value">${case_.phone}</p>
                </div>
                <div>
                    <p class="detail-label">Age</p>
                    <p class="detail-value">${case_.age || 'N/A'}</p>
                </div>
                <div>
                    <p class="detail-label">Gender</p>
                    <p class="detail-value">${case_.gender || 'N/A'}</p>
                </div>
                <div style="grid-column:1 / -1;">
                    <p class="detail-label">Address</p>
                    <p class="detail-value">${case_.address || 'N/A'}</p>
                </div>
            </div>
            
            <!-- Vitals & Medical Info -->
            <div style="background:var(--color-success-bg); padding:0.5rem 0.75rem; border-radius:var(--radius-md);">
                <p style="font-size:0.6875rem; font-weight:var(--font-weight-medium); color:var(--color-success-text); margin:0;">
                    <i class="fas fa-heartbeat"></i> Vitals & Medical Info
                </p>
            </div>
            <div class="detail-grid">
                <div>
                    <p class="detail-label">Blood Pressure</p>
                    <p class="detail-value">${case_.bp || 'N/A'}</p>
                </div>
                <div>
                    <p class="detail-label">Heart Rate</p>
                    <p class="detail-value">${case_.heartRate || 'N/A'}</p>
                </div>
                <div>
                    <p class="detail-label">Temperature</p>
                    <p class="detail-value">${case_.temperature || 'N/A'}</p>
                </div>
                <div>
                    <p class="detail-label">O2 Saturation</p>
                    <p class="detail-value">${case_.oxygen || 'N/A'}</p>
                </div>
                <div style="grid-column:1 / -1;">
                    <p class="detail-label">Doctor Assigned</p>
                    <p class="detail-value">${case_.doctorName ? esc(case_.doctorName) : '<span class="not-assigned">Not assigned</span>'}</p>
                </div>
                <div style="grid-column:1 / -1;">
                    <p class="detail-label">Chief Complaints</p>
                    <p class="detail-value" style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md);">${esc(case_.complaints)}</p>
                </div>
                ${case_.treatmentNotes ? `
                <div style="grid-column:1 / -1;">
                    <p class="detail-label">Treatment Notes</p>
                    <p class="detail-value" style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); white-space:pre-wrap;">${esc(case_.treatmentNotes)}</p>
                </div>
                ` : ''}
                ${case_.ambulance ? `
                <div style="grid-column:1 / -1;">
                    <p class="detail-label">Ambulance</p>
                    <p class="detail-value"><i class="fas fa-ambulance" style="color:var(--color-warm-tan);"></i> Required</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    openModal('viewEmergencyModal');
}

// ─── Delete ──────────────────────────────────────────

function deleteEmergencyCase(id) {
    if (confirm('Delete this emergency case? This action cannot be undone.')) {
        const case_ = emergencyCases.find(c => c.id === id);
        emergencyCases = emergencyCases.filter(c => c.id !== id);
        saveEmergencyCases();
        refreshUI();
        if (window.showToast) {
            window.showToast(`🗑️ Emergency case deleted for ${case_?.patientName || 'patient'}`, 'info');
        }
    }
}

// ─── Init ────────────────────────────────────────────

function initEmergencyModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('newEmergencyBtn')?.addEventListener('click', openEmergencyModal);
    document.getElementById('closeEmergencyModalBtn')?.addEventListener('click', () => closeModal('emergencyModal'));
    document.getElementById('cancelEmergencyModalBtn')?.addEventListener('click', () => closeModal('emergencyModal'));
    document.getElementById('closeAssignModalBtn')?.addEventListener('click', () => closeModal('assignModal'));
    document.getElementById('cancelAssignModalBtn')?.addEventListener('click', () => closeModal('assignModal'));
    document.getElementById('closeStatusModalBtn')?.addEventListener('click', () => closeModal('statusModal'));
    document.getElementById('cancelUpdateModalBtn')?.addEventListener('click', () => closeModal('statusModal'));
    document.getElementById('closeViewModalBtn')?.addEventListener('click', () => closeModal('viewEmergencyModal'));
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', () => closeModal('viewEmergencyModal'));
    document.getElementById('emergencyForm')?.addEventListener('submit', saveEmergencyCase);
    document.getElementById('assignForm')?.addEventListener('submit', assignDoctor);
    document.getElementById('statusForm')?.addEventListener('submit', saveStatus);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        priorityFilter = '';
        statusFilter = '';
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
    
    // Close modals on overlay click
    document.getElementById('emergencyModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('emergencyModal');
    });
    document.getElementById('assignModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('assignModal');
    });
    document.getElementById('statusModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('statusModal');
    });
    document.getElementById('viewEmergencyModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewEmergencyModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('emergencyModal');
            closeModal('assignModal');
            closeModal('statusModal');
            closeModal('viewEmergencyModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initEmergencyModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initEmergencyModule();
    }, 3000);
});