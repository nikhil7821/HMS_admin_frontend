/**
 * IPD Management JS - Clinical Module
 * Professional UI, Fully Working, Indian Names
 */

let ipdPatients = [];
let patients = [];
let doctors = [];
let wards = [];
let dischargeId = null;
let currentDeleteId = null;

function loadData() {
    patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
    doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
    
    const stored = localStorage.getItem('hms_ipd');
    if (stored) {
        ipdPatients = JSON.parse(stored);
    } else {
        ipdPatients = [];
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
    
    renderStats();
    renderTable();
}

function saveIpd() {
    localStorage.setItem('hms_ipd', JSON.stringify(ipdPatients));
}

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

function renderStats() {
    const current = ipdPatients.filter(p => p.status === 'Admitted').length;
    const available = wards.reduce((sum, w) => sum + w.available, 0);
    const today = new Date().toISOString().split('T')[0];
    const dischargedToday = ipdPatients.filter(p => p.status === 'Discharged' && p.dischargeDate === today).length;
    const avgStay = calculateAvgStay();
    
    document.getElementById('currentIpd').innerText = current;
    document.getElementById('availableBeds').innerText = available;
    document.getElementById('dischargedToday').innerText = dischargedToday;
    document.getElementById('avgStay').innerText = avgStay + ' days';
}

function renderTable() {
    const tbody = document.getElementById('ipdTable');
    if (!tbody) return;
    
    if (ipdPatients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-hospital-user text-3xl mb-2 block"></i><p class="font-normal">No IPD patients found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = ipdPatients.map(p => `
        <tr class="ipd-row">
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(p.patientName)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${escapeHtml(p.doctorName)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${escapeHtml(p.wardName)} / Bed ${p.bedNo}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${p.admissionDate}</td>
            <td class="px-5 py-3">
                <span class="${p.status === 'Admitted' ? 'status-admitted' : 'status-discharged'}">
                    ${p.status}
                </span>
            </td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    ${p.status === 'Admitted' ? `
                        <button onclick="openDischarge(${p.id})" class="text-[#10b981] hover:text-[#059669] transition" title="Discharge Patient">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="deleteIpd(${p.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Record">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    ` : `
                        <span class="text-[#94a3b8] text-xs">Discharged</span>
                    `}
                </div>
            </td>
        </tr>
    `).join('');
}

function openModal() {
    const patientSelect = document.getElementById('patientId');
    const doctorSelect = document.getElementById('doctorId');
    const wardSelect = document.getElementById('wardId');
    
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${escapeHtml(p.fullName)} (${p.phone})</option>`).join('');
    }
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${d.specialization})</option>`).join('');
    }
    
    if (wardSelect) {
        wardSelect.innerHTML = '<option value="">-- Select Ward --</option>' + 
            wards.map(w => `<option value="${w.id}">${escapeHtml(w.name)} (${w.available} beds available)</option>`).join('');
    }
    
    document.getElementById('ipdModal').classList.add('active');
}

function admitPatient(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const wardId = parseInt(document.getElementById('wardId').value);
    const diagnosis = document.getElementById('diagnosis').value;
    
    if (!patientId || !doctorId || !wardId) {
        showToast('Please select patient, doctor, and ward', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    const ward = wards.find(w => w.id === wardId);
    
    if (!patient || !doctor || !ward) {
        showToast('Invalid selection', 'error');
        return;
    }
    
    if (ward.available <= 0) {
        showToast(`No beds available in ${ward.name}`, 'error');
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
    renderStats();
    renderTable();
    closeModal();
    showToast(`${patient.fullName} admitted successfully to ${ward.name} - Bed ${bedNo}`, 'success');
}

function openDischarge(id) {
    dischargeId = id;
    document.getElementById('dischargeModal').classList.add('active');
}

function completeDischarge(e) {
    e.preventDefault();
    
    const patient = ipdPatients.find(p => p.id === dischargeId);
    if (patient) {
        patient.status = 'Discharged';
        patient.dischargeDate = new Date().toISOString().split('T')[0];
        patient.dischargeSummary = document.getElementById('dischargeSummary').value;
        patient.dischargeMedications = document.getElementById('medications').value;
        patient.followUp = document.getElementById('followUp').value;
        
        const ward = wards.find(w => w.id === patient.wardId);
        if (ward) ward.available++;
        
        saveIpd();
        renderStats();
        renderTable();
        closeDischargeModal();
        showToast(`${patient.patientName} discharged successfully`, 'success');
    }
}

function deleteIpd(id) {
    currentDeleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if (currentDeleteId) {
        const patient = ipdPatients.find(p => p.id === currentDeleteId);
        
        // Return bed to ward if patient was admitted
        if (patient && patient.status === 'Admitted') {
            const ward = wards.find(w => w.id === patient.wardId);
            if (ward) ward.available++;
        }
        
        ipdPatients = ipdPatients.filter(p => p.id !== currentDeleteId);
        saveIpd();
        renderStats();
        renderTable();
        showToast(`IPD record removed for ${patient?.patientName || 'patient'}`, 'info');
        currentDeleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function closeModal() {
    document.getElementById('ipdModal').classList.remove('active');
    document.getElementById('ipdForm').reset();
}

function closeDischargeModal() {
    document.getElementById('dischargeModal').classList.remove('active');
    document.getElementById('dischargeForm').reset();
    dischargeId = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    currentDeleteId = null;
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
    
    document.getElementById('admitBtn')?.addEventListener('click', openModal);
    document.getElementById('closeIpdModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelIpdModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDischargeModalBtn')?.addEventListener('click', closeDischargeModal);
    document.getElementById('cancelDischargeModalBtn')?.addEventListener('click', closeDischargeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('ipdForm')?.addEventListener('submit', admitPatient);
    document.getElementById('dischargeForm')?.addEventListener('submit', completeDischarge);
});

window.openDischarge = openDischarge;
window.deleteIpd = deleteIpd;