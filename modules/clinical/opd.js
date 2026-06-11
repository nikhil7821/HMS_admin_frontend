/**
 * OPD Management JS - Clinical Module
 * Professional UI, Fully Working, Indian Names
 */

let opdVisits = [];
let patients = [];
let doctors = [];
let currentDeleteId = null;

function loadData() {
    patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
    doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
    
    const stored = localStorage.getItem('hms_opd');
    if (stored) {
        opdVisits = JSON.parse(stored);
    } else {
        // Demo OPD visits data
        opdVisits = [];
        saveOpd();
    }
    renderStats();
    renderTable();
}

function saveOpd() {
    localStorage.setItem('hms_opd', JSON.stringify(opdVisits));
}

function renderStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayOpd = opdVisits.filter(v => v.date === today).length;
    const waiting = opdVisits.filter(v => v.status === 'Waiting').length;
    const completed = opdVisits.filter(v => v.status === 'Completed').length;
    
    document.getElementById('todayOpd').innerText = todayOpd;
    document.getElementById('waitingQueue').innerText = waiting;
    document.getElementById('completedOpd').innerText = completed;
}

function renderTable() {
    const tbody = document.getElementById('opdTable');
    if (!tbody) return;
    
    if (opdVisits.length === 0) {
        tbody.innerHTML = '<td><td colspan="6" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-clinic-medical text-3xl mb-2 block"></i><p class="font-normal">No OPD visits found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = opdVisits.map(visit => `
        <tr class="opd-row">
            <td class="px-5 py-3"><span class="token-badge">#${visit.token}</span></td>
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(visit.patientName)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${escapeHtml(visit.doctorName)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${visit.time}</td>
            <td class="px-5 py-3">
                <span class="${visit.status === 'Waiting' ? 'status-waiting' : 'status-completed'}">
                    ${visit.status}
                </span>
            </td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    ${visit.status !== 'Completed' ? `
                        <button onclick="completeVisit(${visit.id})" class="text-[#10b981] hover:text-[#059669] transition" title="Mark Complete">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    ` : ''}
                    <button onclick="deleteVisit(${visit.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Visit">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
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
    
    document.getElementById('opdModal').classList.add('active');
}

function saveVisit(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const complaint = document.getElementById('complaint').value;
    
    if (!patientId || !doctorId) {
        showToast('Please select both patient and doctor', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!patient || !doctor) {
        showToast('Invalid patient or doctor selection', 'error');
        return;
    }
    
    const newId = opdVisits.length > 0 ? Math.max(...opdVisits.map(v => v.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];
    const token = opdVisits.filter(v => v.date === today).length + 1;
    
    opdVisits.push({
        id: newId,
        token: token,
        patientId: patientId,
        patientName: patient.fullName,
        doctorId: doctorId,
        doctorName: doctor.name,
        complaint: complaint,
        date: today,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Waiting'
    });
    
    saveOpd();
    renderStats();
    renderTable();
    closeModal();
    showToast(`OPD visit created! Token #${token} for ${patient.fullName}`, 'success');
}

function completeVisit(id) {
    const visit = opdVisits.find(v => v.id === id);
    if (visit && visit.status !== 'Completed') {
        visit.status = 'Completed';
        saveOpd();
        renderStats();
        renderTable();
        showToast(`Visit completed for ${visit.patientName}`, 'success');
    }
}

function deleteVisit(id) {
    currentDeleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if (currentDeleteId) {
        const visit = opdVisits.find(v => v.id === currentDeleteId);
        opdVisits = opdVisits.filter(v => v.id !== currentDeleteId);
        saveOpd();
        renderStats();
        renderTable();
        showToast(`OPD visit removed for ${visit?.patientName || 'patient'}`, 'info');
        currentDeleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function closeModal() {
    document.getElementById('opdModal').classList.remove('active');
    document.getElementById('opdForm').reset();
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
    
    document.getElementById('newVisitBtn')?.addEventListener('click', openModal);
    document.getElementById('closeOpdModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelOpdModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('opdForm')?.addEventListener('submit', saveVisit);
});

window.completeVisit = completeVisit;
window.deleteVisit = deleteVisit;