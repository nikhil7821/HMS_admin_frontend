/**
 * Emergency Management JS - Emergency Module
 * Professional UI, Fully Working, PURE INDIAN NAMES
 */

let emergencyCases = [];
let doctors = [];
let patients = [];

function loadData() {
    doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
    patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
    
    const stored = localStorage.getItem('emergency_cases');
    if (stored) {
        emergencyCases = JSON.parse(stored);
        if (emergencyCases[0] && (emergencyCases[0].patientName === 'John Doe' || emergencyCases[0].patientName === 'Jane Smith')) {
            setIndianEmergencyCases();
        }
    } else {
        setIndianEmergencyCases();
    }
    updateStats();
    renderTable();
    populateDoctorSelects();
}

function setIndianEmergencyCases() {
    const today = new Date();
    emergencyCases = [
        {id: 1, caseNo: 'ER-20260001', patientId: 1, patientName: 'Rajesh Kumar', phone: '+91 98765 43210', age: 45, gender: 'Male', address: '123 Gandhi Nagar, Mumbai', priority: 'Critical', complaints: 'Severe chest pain, difficulty breathing', bp: '160/100', heartRate: '110', temperature: '99.2', oxygen: '92', status: 'In Treatment', doctorId: 1, doctorName: 'Dr. Anjali Nair', arrivalTime: today.toLocaleString(), treatmentNotes: 'Under observation, ECG done'},
        {id: 2, caseNo: 'ER-20260002', patientId: 2, patientName: 'Priya Sharma', phone: '+91 98765 43211', age: 32, gender: 'Female', address: '456 Green Park, Delhi', priority: 'High', complaints: 'Fractured arm from bike accident', bp: '130/85', heartRate: '95', temperature: '98.6', oxygen: '98', status: 'Waiting', doctorId: null, doctorName: '', arrivalTime: today.toLocaleString(), treatmentNotes: ''},
        {id: 3, caseNo: 'ER-20260003', patientId: 3, patientName: 'Amit Patel', phone: '+91 98765 43212', age: 28, gender: 'Male', address: '789 Lake View, Bangalore', priority: 'Medium', complaints: 'Severe abdominal pain, vomiting', bp: '120/80', heartRate: '88', temperature: '99.5', oxygen: '99', status: 'Admitted', doctorId: 2, doctorName: 'Dr. Vikram Singh', arrivalTime: today.toLocaleString(), treatmentNotes: 'Appendicitis suspected, admitted for surgery'},
        {id: 4, caseNo: 'ER-20260004', patientId: 4, patientName: 'Neha Gupta', phone: '+91 98765 43213', age: 25, gender: 'Female', address: '321 Rose Garden, Pune', priority: 'Low', complaints: 'High fever and cough since 3 days', bp: '118/78', heartRate: '76', temperature: '100.2', oxygen: '98', status: 'Discharged', doctorId: 3, doctorName: 'Dr. Sneha Joshi', arrivalTime: today.toLocaleString(), treatmentNotes: 'Prescribed antibiotics and rest'},
        {id: 5, caseNo: 'ER-20260005', patientId: 5, patientName: 'Sunil Reddy', phone: '+91 98765 43214', age: 55, gender: 'Male', address: '654 Jubilee Hills, Hyderabad', priority: 'Critical', complaints: 'Loss of consciousness, high BP', bp: '180/110', heartRate: '120', temperature: '98.8', oxygen: '89', status: 'In Treatment', doctorId: 4, doctorName: 'Dr. Rajiv Menon', arrivalTime: today.toLocaleString(), treatmentNotes: 'ICU admitted, on ventilator support'},
        {id: 6, caseNo: 'ER-20260006', patientId: 6, patientName: 'Meera Desai', phone: '+91 98765 43215', age: 38, gender: 'Female', address: '987 Lake Road, Chennai', priority: 'High', complaints: 'Severe headache, blurred vision', bp: '145/95', heartRate: '92', temperature: '98.4', oxygen: '97', status: 'Waiting', doctorId: null, doctorName: '', arrivalTime: today.toLocaleString(), treatmentNotes: ''}
    ];
    saveEmergencyCases();
}

function saveEmergencyCases() {
    localStorage.setItem('emergency_cases', JSON.stringify(emergencyCases));
}

function updateStats() {
    const critical = emergencyCases.filter(c => c.priority === 'Critical' && c.status !== 'Discharged').length;
    const high = emergencyCases.filter(c => c.priority === 'High' && c.status !== 'Discharged').length;
    const stable = emergencyCases.filter(c => (c.priority === 'Medium' || c.priority === 'Low') && c.status !== 'Discharged').length;
    const waiting = emergencyCases.filter(c => c.status === 'Waiting').length;
    
    document.getElementById('criticalCount').innerText = critical;
    document.getElementById('highCount').innerText = high;
    document.getElementById('stableCount').innerText = stable;
    document.getElementById('waitingCount').innerText = waiting;
}

function renderTable() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const priorityFilter = document.getElementById('priorityFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = emergencyCases.filter(c => {
        const matchesSearch = search === '' || 
            c.patientName.toLowerCase().includes(search) || 
            c.caseNo.toLowerCase().includes(search) ||
            c.phone.includes(search);
        const matchesPriority = priorityFilter === '' || c.priority === priorityFilter;
        const matchesStatus = statusFilter === '' || c.status === statusFilter;
        return matchesSearch && matchesPriority && matchesStatus;
    });
    
    const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    const tbody = document.getElementById('emergencyTable');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-ambulance text-3xl mb-2 block"></i><p class="font-normal">No emergency cases found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(c => `
        <tr class="emergency-row">
            <td class="px-5 py-3 text-sm font-mono font-medium text-[#1e293b]">${c.caseNo}</td>
            <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xs font-bold">
                        ${c.patientName.charAt(0)}
                    </div>
                    <div>
                        <p class="font-medium text-[#1e293b] text-sm">${escapeHtml(c.patientName)}</p>
                        <p class="text-xs text-[#94a3b8]">${c.phone}</p>
                    </div>
                </div>
            </td>
            <td class="px-5 py-3"><span class="priority-${c.priority.toLowerCase()}">${c.priority}</span></td>
            <td class="px-5 py-3 text-sm text-[#475569] max-w-[200px] truncate">${escapeHtml(c.complaints.substring(0, 40))}${c.complaints.length > 40 ? '...' : ''}</td>
            <td class="px-5 py-3 text-sm text-[#475569]">${formatTime(c.arrivalTime)}</td>
            <td class="px-5 py-3">
                <span class="status-badge status-${getStatusClass(c.status)}">
                    <i class="status-icon ${getStatusIcon(c.status)}"></i>
                    ${c.status}
                </span>
            </td>
            <td class="px-5 py-3 text-sm text-[#475569]">${c.doctorName || '<span class="text-[#94a3b8] italic">Not assigned</span>'}</td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    <button onclick="viewEmergencyCase(${c.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${!c.doctorId ? `<button onclick="openAssignModal(${c.id})" class="text-blue-500 hover:text-blue-700 transition" title="Assign Doctor">
                        <i class="fas fa-user-md"></i>
                    </button>` : ''}
                    <button onclick="openStatusModal(${c.id})" class="text-yellow-500 hover:text-yellow-700 transition" title="Update Status">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                    <button onclick="deleteEmergencyCase(${c.id})" class="text-red-400 hover:text-red-600 transition" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusClass(status) {
    const classes = {
        'Waiting': 'waiting',
        'In Treatment': 'treatment',
        'Admitted': 'admitted',
        'Discharged': 'discharged'
    };
    return classes[status] || 'waiting';
}

function getStatusIcon(status) {
    const icons = {
        'Waiting': 'fa-hourglass-half',
        'In Treatment': 'fa-stethoscope',
        'Admitted': 'fa-procedures',
        'Discharged': 'fa-check-circle'
    };
    return icons[status] || 'fa-clock';
}

function formatTime(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function populateDoctorSelects() {
    const doctorSelect = document.getElementById('doctorId');
    const assignDoctorSelect = document.getElementById('assignDoctorId');
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">Auto Assign</option>' + 
            doctors.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${d.specialization})</option>`).join('');
    }
    
    if (assignDoctorSelect) {
        assignDoctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${d.specialization})</option>`).join('');
    }
}

function openEmergencyModal() {
    document.getElementById('emergencyForm').reset();
    document.querySelector('input[name="ambulance"][value="no"]').checked = true;
    document.getElementById('emergencyModal').classList.add('active');
    populateDoctorSelects();
}

function saveEmergencyCase(e) {
    e.preventDefault();
    
    const patientData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value
    };
    
    if (!patientData.fullName || !patientData.phone) {
        showToast('Please enter patient name and phone number', 'error');
        return;
    }
    
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
            age: patientData.age,
            gender: patientData.gender,
            address: patientData.address,
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
    const caseNo = 'ER-' + new Date().getFullYear() + String(newId).padStart(5, '0');
    
    emergencyCases.push({
        id: newId,
        caseNo: caseNo,
        patientId: patientId,
        patientName: patientData.fullName,
        phone: patientData.phone,
        age: patientData.age,
        gender: patientData.gender,
        address: patientData.address,
        priority: document.getElementById('priority').value,
        complaints: document.getElementById('complaints').value,
        bp: document.getElementById('bp').value,
        heartRate: document.getElementById('heartRate').value,
        temperature: document.getElementById('temperature').value,
        oxygen: document.getElementById('oxygen').value,
        status: 'Waiting',
        doctorId: doctorId ? parseInt(doctorId) : null,
        doctorName: doctor?.name || '',
        arrivalTime: new Date().toLocaleString(),
        treatmentNotes: '',
        ambulance: ambulance === 'yes'
    });
    
    saveEmergencyCases();
    updateStats();
    renderTable();
    closeEmergencyModal();
    showToast(`Emergency case registered! Case ID: ${caseNo}`, 'success');
}

// VIEW EMERGENCY CASE - PROPER MODAL OVERLAY (FIXED)
function viewEmergencyCase(id) {
    const case_ = emergencyCases.find(c => c.id === id);
    if (!case_) return;
    
    const viewContent = document.getElementById('viewEmergencyContent');
    if (!viewContent) return;
    
    viewContent.innerHTML = `
        <div class="space-y-4">
            <div class="bg-red-50 p-3 rounded-lg">
                <p class="text-xs font-semibold text-red-600"><i class="fas fa-info-circle mr-1"></i> Case Information</p>
            </div>
            <div class="grid grid-cols-2 gap-4 pb-3 border-b border-[#f0e8e0]">
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Case ID</p>
                    <p class="text-sm text-[#1e293b] font-medium mt-1">${case_.caseNo}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Arrival Time</p>
                    <p class="text-sm text-[#1e293b] mt-1">${case_.arrivalTime}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Priority</p>
                    <p class="text-sm mt-1"><span class="priority-${case_.priority.toLowerCase()}">${case_.priority}</span></p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Status</p>
                    <p class="text-sm mt-1"><span class="status-badge status-${getStatusClass(case_.status)}"><i class="status-icon ${getStatusIcon(case_.status)} mr-1"></i>${case_.status}</span></p>
                </div>
            </div>
            
            <div class="bg-blue-50 p-3 rounded-lg">
                <p class="text-xs font-semibold text-blue-600"><i class="fas fa-user-injured mr-1"></i> Patient Information</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Full Name</p>
                    <p class="text-sm text-[#1e293b] font-medium mt-1">${escapeHtml(case_.patientName)}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Phone</p>
                    <p class="text-sm text-[#1e293b] mt-1">${case_.phone}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Age</p>
                    <p class="text-sm text-[#1e293b] mt-1">${case_.age || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Gender</p>
                    <p class="text-sm text-[#1e293b] mt-1">${case_.gender || 'N/A'}</p>
                </div>
                <div class="col-span-2">
                    <p class="text-xs text-[#64748b] font-medium">Address</p>
                    <p class="text-sm text-[#1e293b] mt-1">${case_.address || 'N/A'}</p>
                </div>
            </div>
            
            <div class="bg-green-50 p-3 rounded-lg">
                <p class="text-xs font-semibold text-green-600"><i class="fas fa-heartbeat mr-1"></i> Vitals & Medical Info</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Blood Pressure</p>
                    <p class="text-sm text-[#1e293b] mt-1">${case_.bp || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Heart Rate</p>
                    <p class="text-sm text-[#1e293b] mt-1">${case_.heartRate || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Temperature</p>
                    <p class="text-sm text-[#1e293b] mt-1">${case_.temperature || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">O2 Saturation</p>
                    <p class="text-sm text-[#1e293b] mt-1">${case_.oxygen || 'N/A'}</p>
                </div>
                <div class="col-span-2">
                    <p class="text-xs text-[#64748b] font-medium">Doctor Assigned</p>
                    <p class="text-sm text-[#1e293b] mt-1">${case_.doctorName || '<span class="text-[#94a3b8] italic">Not assigned</span>'}</p>
                </div>
                <div class="col-span-2">
                    <p class="text-xs text-[#64748b] font-medium">Chief Complaints</p>
                    <p class="text-sm text-[#475569] mt-1 bg-[#f8fafc] p-2 rounded-lg">${escapeHtml(case_.complaints)}</p>
                </div>
                ${case_.treatmentNotes ? `
                <div class="col-span-2">
                    <p class="text-xs text-[#64748b] font-medium">Treatment Notes</p>
                    <p class="text-sm text-[#475569] mt-1 bg-[#f8fafc] p-2 rounded-lg">${escapeHtml(case_.treatmentNotes)}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('viewEmergencyModal').classList.add('active');
}

function closeViewModal() {
    document.getElementById('viewEmergencyModal').classList.remove('active');
}

function openAssignModal(id) {
    const case_ = emergencyCases.find(c => c.id === id);
    if (case_) {
        document.getElementById('assignCaseId').value = id;
        document.getElementById('assignModal').classList.add('active');
        populateDoctorSelects();
    }
}

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
        updateStats();
        renderTable();
        closeAssignModal();
        showToast(`Doctor ${doctor.name} assigned successfully`, 'success');
    } else {
        showToast('Please select a doctor', 'error');
    }
}

function openStatusModal(id) {
    const case_ = emergencyCases.find(c => c.id === id);
    if (case_) {
        document.getElementById('statusCaseId').value = id;
        document.getElementById('newStatus').value = case_.status;
        document.getElementById('statusModal').classList.add('active');
    }
}

function saveStatus(e) {
    e.preventDefault();
    
    const caseId = parseInt(document.getElementById('statusCaseId').value);
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('statusNotes').value;
    
    const case_ = emergencyCases.find(c => c.id === caseId);
    if (case_) {
        case_.status = newStatus;
        if (notes) {
            case_.treatmentNotes = case_.treatmentNotes ? case_.treatmentNotes + '\n' + notes : notes;
        }
        saveEmergencyCases();
        updateStats();
        renderTable();
        closeStatusModal();
        showToast(`Status updated to ${newStatus}`, 'success');
    }
}

function deleteEmergencyCase(id) {
    if (confirm('Delete this emergency case? This action cannot be undone.')) {
        emergencyCases = emergencyCases.filter(c => c.id !== id);
        saveEmergencyCases();
        updateStats();
        renderTable();
        showToast('Emergency case deleted', 'success');
    }
}

function closeEmergencyModal() {
    document.getElementById('emergencyModal').classList.remove('active');
    document.getElementById('emergencyForm').reset();
}

function closeAssignModal() {
    document.getElementById('assignModal').classList.remove('active');
    document.getElementById('assignForm').reset();
}

function closeStatusModal() {
    document.getElementById('statusModal').classList.remove('active');
    document.getElementById('statusForm').reset();
}

function showToast(message, type) {
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a' };
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300`;
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.getElementById('newEmergencyBtn')?.addEventListener('click', openEmergencyModal);
    document.getElementById('closeEmergencyModalBtn')?.addEventListener('click', closeEmergencyModal);
    document.getElementById('cancelEmergencyModalBtn')?.addEventListener('click', closeEmergencyModal);
    document.getElementById('closeAssignModalBtn')?.addEventListener('click', closeAssignModal);
    document.getElementById('cancelAssignModalBtn')?.addEventListener('click', closeAssignModal);
    document.getElementById('closeStatusModalBtn')?.addEventListener('click', closeStatusModal);
    document.getElementById('cancelUpdateModalBtn')?.addEventListener('click', closeStatusModal);
    document.getElementById('closeViewModalBtn')?.addEventListener('click', closeViewModal);
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', closeViewModal);
    document.getElementById('emergencyForm')?.addEventListener('submit', saveEmergencyCase);
    document.getElementById('assignForm')?.addEventListener('submit', assignDoctor);
    document.getElementById('statusForm')?.addEventListener('submit', saveStatus);
    document.getElementById('searchInput')?.addEventListener('input', () => renderTable());
    document.getElementById('priorityFilter')?.addEventListener('change', () => renderTable());
    document.getElementById('statusFilter')?.addEventListener('change', () => renderTable());
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('priorityFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderTable();
    });
});

window.viewEmergencyCase = viewEmergencyCase;
window.openAssignModal = openAssignModal;
window.openStatusModal = openStatusModal;
window.deleteEmergencyCase = deleteEmergencyCase;