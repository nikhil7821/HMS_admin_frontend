/**
 * Consultation Management JS - Clinical Module
 * Professional UI, Fully Working, Indian Names
 */

let consultations = [];
let patients = [];
let doctors = [];

function loadData() {
    patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
    doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
    
    const stored = localStorage.getItem('hms_consultations');
    if (stored) {
        consultations = JSON.parse(stored);
    } else {
        // Demo consultations data
        consultations = [
            {id: 1, patientId: 1, patientName: 'Rajesh Kumar', doctorId: 1, doctorName: 'Dr. Anjali Nair', date: '2026-06-10', symptoms: 'Chest pain, shortness of breath', diagnosis: 'Hypertension', prescription: 'Amlodipine 5mg once daily', notes: 'Follow up in 2 weeks'},
            {id: 2, patientId: 2, patientName: 'Priya Sharma', doctorId: 2, doctorName: 'Dr. Vikram Singh', date: '2026-06-09', symptoms: 'Severe headache, blurred vision', diagnosis: 'Migraine', prescription: 'Sumatriptan 50mg as needed', notes: 'Avoid bright lights'},
            {id: 3, patientId: 3, patientName: 'Amit Patel', doctorId: 3, doctorName: 'Dr. Sneha Joshi', date: '2026-06-08', symptoms: 'Fever, cough, body ache', diagnosis: 'Viral Fever', prescription: 'Paracetamol 500mg, rest', notes: 'Monitor temperature'}
        ];
        saveConsultations();
    }
    renderTable();
}

function saveConsultations() {
    localStorage.setItem('hms_consultations', JSON.stringify(consultations));
}

function renderTable() {
    const tbody = document.getElementById('consultTable');
    if (!tbody) return;
    
    if (consultations.length === 0) {
        tbody.innerHTML = '<td><td colspan="5" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-notes-medical text-3xl mb-2 block"></i><p class="font-normal">No consultations found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = consultations.map(c => `
        <tr class="consult-row">
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(c.patientName)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${escapeHtml(c.doctorName)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${c.date}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${c.diagnosis.length > 30 ? c.diagnosis.substring(0, 30) + '...' : c.diagnosis}</td>
            <td class="px-5 py-3 text-center">
                <button onclick="viewConsultation(${c.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openModal() {
    const patientSelect = document.getElementById('patientId');
    const doctorSelect = document.getElementById('doctorId');
    
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${escapeHtml(p.fullName)} (${p.phone})</option>`).join('');
    }
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${d.specialization})</option>`).join('');
    }
    
    document.getElementById('consultModal').classList.add('active');
    document.getElementById('consultForm').reset();
}

function saveConsultation(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const symptoms = document.getElementById('symptoms').value;
    const diagnosis = document.getElementById('diagnosis').value;
    const prescription = document.getElementById('prescription').value;
    const notes = document.getElementById('notes').value;
    
    if (!patientId || !doctorId) {
        showToast('Please select both patient and doctor', 'error');
        return;
    }
    
    if (!diagnosis) {
        showToast('Please enter diagnosis', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!patient || !doctor) {
        showToast('Invalid patient or doctor selection', 'error');
        return;
    }
    
    const newId = consultations.length > 0 ? Math.max(...consultations.map(c => c.id)) + 1 : 1;
    
    consultations.push({
        id: newId,
        patientId: patientId,
        patientName: patient.fullName,
        doctorId: doctorId,
        doctorName: doctor.name,
        date: new Date().toISOString().split('T')[0],
        symptoms: symptoms,
        diagnosis: diagnosis,
        prescription: prescription,
        notes: notes
    });
    
    saveConsultations();
    renderTable();
    closeModal();
    showToast(`Consultation saved for ${patient.fullName}`, 'success');
}

function viewConsultation(id) {
    const c = consultations.find(c => c.id === id);
    if (!c) return;
    
    const viewContent = document.getElementById('viewContent');
    viewContent.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4 pb-3 border-b border-[#f0e8e0]">
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Patient Name</p>
                    <p class="text-sm text-[#1e293b] font-medium mt-1">${escapeHtml(c.patientName)}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Doctor</p>
                    <p class="text-sm text-[#1e293b] font-medium mt-1">${escapeHtml(c.doctorName)}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Date</p>
                    <p class="text-sm text-[#1e293b] mt-1">${c.date}</p>
                </div>
                <div>
                    <p class="text-xs text-[#64748b] font-medium">Diagnosis</p>
                    <p class="text-sm text-[#1e293b] mt-1">${escapeHtml(c.diagnosis)}</p>
                </div>
            </div>
            ${c.symptoms ? `
            <div>
                <p class="text-xs text-[#64748b] font-medium">Symptoms / Chief Complaints</p>
                <p class="text-sm text-[#475569] mt-1">${escapeHtml(c.symptoms)}</p>
            </div>
            ` : ''}
            ${c.prescription ? `
            <div>
                <p class="text-xs text-[#64748b] font-medium">Prescription</p>
                <div class="bg-[#f8fafc] rounded-lg p-3 mt-1">
                    <p class="text-sm text-[#475569] whitespace-pre-wrap">${escapeHtml(c.prescription)}</p>
                </div>
            </div>
            ` : ''}
            ${c.notes ? `
            <div>
                <p class="text-xs text-[#64748b] font-medium">Additional Notes</p>
                <p class="text-sm text-[#475569] mt-1">${escapeHtml(c.notes)}</p>
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('viewModal').classList.add('active');
}

function closeModal() {
    document.getElementById('consultModal').classList.remove('active');
    document.getElementById('consultForm').reset();
}

function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
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
    
    document.getElementById('newConsultBtn')?.addEventListener('click', openModal);
    document.getElementById('closeConsultModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelConsultModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeViewModalBtn')?.addEventListener('click', closeViewModal);
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', closeViewModal);
    document.getElementById('consultForm')?.addEventListener('submit', saveConsultation);
});

window.viewConsultation = viewConsultation;