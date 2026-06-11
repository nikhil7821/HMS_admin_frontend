/**
 * Doctors Management JS - Clinical Module
 * Professional UI, Fully Working, Indian Names, Rupee Symbol
 * SMALLER CARD LAYOUT
 */

let doctors = [];
let deleteId = null;

function loadDoctors() {
    const stored = localStorage.getItem('hms_doctors');
    if(stored) {
        doctors = JSON.parse(stored);
    } else {
        doctors = [
            {id: 1, name: 'Dr. Anjali Nair', specialization: 'Cardiologist', qualification: 'MD, DM', fee: 1500, phone: '+91 98765 43210', email: 'anjali.nair@medflow.com', experience: 12, status: 'Active'},
            {id: 2, name: 'Dr. Vikram Singh', specialization: 'Neurologist', qualification: 'MD, DM', fee: 1800, phone: '+91 98765 43211', email: 'vikram.singh@medflow.com', experience: 10, status: 'Active'},
            {id: 3, name: 'Dr. Sneha Joshi', specialization: 'Pediatrician', qualification: 'MD', fee: 1200, phone: '+91 98765 43212', email: 'sneha.joshi@medflow.com', experience: 8, status: 'Active'},
            {id: 4, name: 'Dr. Rajiv Menon', specialization: 'Orthopedic', qualification: 'MS', fee: 1400, phone: '+91 98765 43213', email: 'rajiv.menon@medflow.com', experience: 15, status: 'Active'},
            {id: 5, name: 'Dr. Neha Gupta', specialization: 'Dermatologist', qualification: 'MD', fee: 1300, phone: '+91 98765 43214', email: 'neha.gupta@medflow.com', experience: 7, status: 'Inactive'},
            {id: 6, name: 'Dr. Meera Desai', specialization: 'Gynecologist', qualification: 'MD, DGO', fee: 1600, phone: '+91 98765 43215', email: 'meera.desai@medflow.com', experience: 11, status: 'Active'},
            {id: 7, name: 'Dr. Sanjay Kulkarni', specialization: 'General Physician', qualification: 'MD', fee: 1000, phone: '+91 98765 43216', email: 'sanjay.kulkarni@medflow.com', experience: 9, status: 'Active'},
            {id: 8, name: 'Dr. Pooja Verma', specialization: 'Ophthalmologist', qualification: 'MS', fee: 1200, phone: '+91 98765 43217', email: 'pooja.verma@medflow.com', experience: 6, status: 'Active'}
        ];
        saveDoctors();
    }
    updateStats();
    populateSpecializationFilter();
    renderDoctors();
}

function saveDoctors() {
    localStorage.setItem('hms_doctors', JSON.stringify(doctors));
}

function updateStats() {
    const total = doctors.length;
    const specs = [...new Set(doctors.map(d => d.specialization))];
    const active = doctors.filter(d => d.status === 'Active').length;
    const avg = doctors.length > 0 ? doctors.reduce((sum, d) => sum + d.fee, 0) / doctors.length : 0;
    
    document.getElementById('totalDoctors').innerText = total;
    document.getElementById('totalSpecs').innerText = specs.length;
    document.getElementById('activeDoctors').innerText = active;
    document.getElementById('avgFees').innerText = '₹' + Math.round(avg).toLocaleString('en-IN');
}

function populateSpecializationFilter() {
    const specFilter = document.getElementById('specFilter');
    if(!specFilter) return;
    
    const specs = [...new Set(doctors.map(d => d.specialization))];
    specFilter.innerHTML = '<option value="">All Specializations</option>' + 
        specs.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
}

function renderDoctors() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const spec = document.getElementById('specFilter')?.value || '';
    
    let filtered = doctors.filter(d => 
        (d.name.toLowerCase().includes(search) || d.specialization.toLowerCase().includes(search)) && 
        (spec === '' || d.specialization === spec)
    );
    
    const grid = document.getElementById('doctorsGrid');
    if(!grid) return;
    
    if(filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-[#94a3b8]"><i class="fas fa-user-md text-3xl mb-2 block"></i><p class="font-normal">No doctors found</p></div>';
        return;
    }
    
    grid.innerHTML = filtered.map(doc => `
        <div class="doctor-card p-3">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gradient-to-r from-[#a8c49a] to-[#8aae7a] rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm flex-shrink-0">
                    ${doc.name.charAt(4) || doc.name.charAt(3)}
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-[#1e293b] text-sm truncate">${escapeHtml(doc.name)}</h3>
                    <p class="text-[#a8c49a] text-xs font-normal truncate">${escapeHtml(doc.specialization)}</p>
                </div>
            </div>
            
            <div class="space-y-1.5 text-xs mb-3">
                <div class="flex items-center gap-2">
                    <i class="fas fa-graduation-cap w-3 text-[#94a3b8] text-xs"></i>
                    <span class="text-[#475569] font-normal truncate">${escapeHtml(doc.qualification)}</span>
                </div>
                <div class="flex items-center gap-2">
                    <i class="fas fa-rupee-sign w-3 text-[#94a3b8] text-xs"></i>
                    <span class="text-[#475569] font-normal">₹${doc.fee.toLocaleString('en-IN')}</span>
                </div>
                <div class="flex items-center gap-2">
                    <i class="fas fa-briefcase w-3 text-[#94a3b8] text-xs"></i>
                    <span class="text-[#475569] font-normal">${doc.experience} yrs exp</span>
                </div>
            </div>
            
            <div class="flex justify-between items-center pt-2 border-t border-[#f0e8e0]">
                <span class="${doc.status === 'Active' ? 'status-badge-active' : 'status-badge-inactive'} text-xs">
                    ${doc.status}
                </span>
                <div class="flex gap-1.5">
                    <button onclick="editDoctor(${doc.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition p-1.5 rounded" title="Edit Doctor">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteDoctor(${doc.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition p-1.5 rounded" title="Delete Doctor">
                        <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openAddModal() {
    document.getElementById('doctorForm').reset();
    document.getElementById('doctorId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Doctor';
    document.getElementById('doctorModal').classList.add('active');
}

function editDoctor(id) {
    const doc = doctors.find(d => d.id === id);
    if(doc) {
        document.getElementById('doctorId').value = doc.id;
        document.getElementById('name').value = doc.name;
        document.getElementById('specialization').value = doc.specialization;
        document.getElementById('qualification').value = doc.qualification;
        document.getElementById('fee').value = doc.fee;
        document.getElementById('phone').value = doc.phone;
        document.getElementById('email').value = doc.email;
        document.getElementById('experience').value = doc.experience;
        document.getElementById('status').value = doc.status;
        document.getElementById('modalTitle').innerText = 'Edit Doctor';
        document.getElementById('doctorModal').classList.add('active');
    }
}

function deleteDoctor(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        doctors = doctors.filter(d => d.id !== deleteId);
        saveDoctors();
        updateStats();
        populateSpecializationFilter();
        renderDoctors();
        showToast('Doctor deleted successfully', 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function saveDoctor(e) {
    e.preventDefault();
    
    const id = document.getElementById('doctorId').value;
    const data = {
        name: document.getElementById('name').value,
        specialization: document.getElementById('specialization').value,
        qualification: document.getElementById('qualification').value,
        fee: parseInt(document.getElementById('fee').value),
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        experience: parseInt(document.getElementById('experience').value) || 0,
        status: document.getElementById('status').value
    };
    
    if(id) {
        const index = doctors.findIndex(d => d.id === parseInt(id));
        if(index !== -1) {
            doctors[index] = { ...doctors[index], ...data };
            showToast('Doctor updated successfully', 'success');
        }
    } else {
        const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
        doctors.push({ id: newId, ...data });
        showToast('Doctor added successfully', 'success');
    }
    
    saveDoctors();
    updateStats();
    populateSpecializationFilter();
    renderDoctors();
    closeModal();
}

function closeModal() {
    document.getElementById('doctorModal').classList.remove('active');
    document.getElementById('deleteModal').classList.remove('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteId = null;
}

function showToast(message, type) {
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a' };
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300`;
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if(!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    loadDoctors();
    
    document.getElementById('addDoctorBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('doctorForm')?.addEventListener('submit', saveDoctor);
    document.getElementById('searchInput')?.addEventListener('input', () => renderDoctors());
    document.getElementById('specFilter')?.addEventListener('change', () => renderDoctors());
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('specFilter').value = '';
        renderDoctors();
    });
});

window.editDoctor = editDoctor;
window.deleteDoctor = deleteDoctor;