/**
 * Patients Management JS - Clinical Module
 * Professional UI, Fully Working, INDIAN NAMES
 */

let patients = [];
let currentPage = 1;
let rowsPerPage = 10;
let currentDeleteId = null;
let searchTerm = '';
let genderFilter = '';

function loadPatients() {
    const stored = localStorage.getItem('hms_patients');
    if (stored) {
        patients = JSON.parse(stored);
    } else {
        // INDIAN PATIENTS DATA
patients = [
    { id: 1, fullName: 'Ramesh Gupta', dob: '1985-03-15', gender: 'Male', bloodGroup: 'O+', phone: '+91 98765 43210', email: 'ramesh.gupta@medflow.com', address: '123 Lajpat Nagar, Delhi', createdAt: '2024-01-15' },
    { id: 2, fullName: 'Sneha Patil', dob: '1990-07-22', gender: 'Female', bloodGroup: 'A+', phone: '+91 98765 43211', email: 'sneha.patil@medflow.com', address: '456 Koregaon Park, Pune', createdAt: '2024-02-10' },
    { id: 3, fullName: 'Manish Verma', dob: '1978-11-05', gender: 'Male', bloodGroup: 'B+', phone: '+91 98765 43212', email: 'manish.verma@medflow.com', address: '789 Indira Nagar, Lucknow', createdAt: '2024-03-05' },
    { id: 4, fullName: 'Kiran Yadav', dob: '1995-02-18', gender: 'Female', bloodGroup: 'AB+', phone: '+91 98765 43213', email: 'kiran.yadav@medflow.com', address: '321 Vaishali Nagar, Jaipur', createdAt: '2024-04-20' },
    { id: 5, fullName: 'Suresh Nair', dob: '1982-09-30', gender: 'Male', bloodGroup: 'O-', phone: '+91 98765 43214', email: 'suresh.nair@medflow.com', address: '654 Marine Drive, Kochi', createdAt: '2024-05-12' },
    { id: 6, fullName: 'Deepika Joshi', dob: '1988-12-12', gender: 'Female', bloodGroup: 'A-', phone: '+91 98765 43215', email: 'deepika.joshi@medflow.com', address: '987 Civil Lines, Allahabad', createdAt: '2024-06-01' },
    { id: 7, fullName: 'Pankaj Tiwari', dob: '1975-06-20', gender: 'Male', bloodGroup: 'B-', phone: '+91 98765 43216', email: 'pankaj.tiwari@medflow.com', address: '123 Sadar Bazaar, Agra', createdAt: '2024-06-10' },
    { id: 8, fullName: 'Rekha Menon', dob: '1998-04-25', gender: 'Female', bloodGroup: 'O+', phone: '+91 98765 43217', email: 'rekha.menon@medflow.com', address: '456 Churchgate, Mumbai', createdAt: '2024-06-15' },
    { id: 9, fullName: 'Harsh Vardhan', dob: '1992-11-08', gender: 'Male', bloodGroup: 'AB-', phone: '+91 98765 43218', email: 'harsh.vardhan@medflow.com', address: '789 MG Road, Indore', createdAt: '2024-06-20' },
    { id: 10, fullName: 'Shweta Sinha', dob: '1987-08-14', gender: 'Female', bloodGroup: 'A+', phone: '+91 98765 43219', email: 'shweta.sinha@medflow.com', address: '321 Boring Road, Patna', createdAt: '2024-06-25' },
    { id: 11, fullName: 'Alok Nath', dob: '1980-01-10', gender: 'Male', bloodGroup: 'O+', phone: '+91 98765 43220', email: 'alok.nath@medflow.com', address: '456 Civil Court, Nagpur', createdAt: '2024-07-01' },
    { id: 12, fullName: 'Pooja Thakur', dob: '1993-03-28', gender: 'Female', bloodGroup: 'B+', phone: '+91 98765 43221', email: 'pooja.thakur@medflow.com', address: '789 Mall Road, Shimla', createdAt: '2024-07-05' },
    { id: 13, fullName: 'Rohit Khanna', dob: '1986-07-19', gender: 'Male', bloodGroup: 'AB+', phone: '+91 98765 43222', email: 'rohit.khanna@medflow.com', address: '321 Lake View, Chandigarh', createdAt: '2024-07-10' },
    { id: 14, fullName: 'Anita Deshmukh', dob: '1991-09-04', gender: 'Female', bloodGroup: 'A-', phone: '+91 98765 43223', email: 'anita.deshmukh@medflow.com', address: '654 IT Park, Pune', createdAt: '2024-07-15' },
    { id: 15, fullName: 'Vijay Shetty', dob: '1979-12-01', gender: 'Male', bloodGroup: 'O-', phone: '+91 98765 43224', email: 'vijay.shetty@medflow.com', address: '987 Beach Road, Mangalore', createdAt: '2024-07-20' }
];
        savePatients();
    }
    updateStats();
    renderTable();
}

function savePatients() {
    localStorage.setItem('hms_patients', JSON.stringify(patients));
}

function updateStats() {
    document.getElementById('totalPatients').innerText = patients.length;
    
    const today = new Date().toISOString().split('T')[0];
    const active = patients.filter(p => p.lastVisit === today).length;
    document.getElementById('activeToday').innerText = active;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = patients.filter(p => {
        const joinDate = new Date(p.createdAt || new Date());
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;
    document.getElementById('thisMonth').innerText = thisMonth;
    
    const maleCount = patients.filter(p => p.gender === 'Male').length;
    const femaleCount = patients.filter(p => p.gender === 'Female').length;
    document.getElementById('genderRatio').innerHTML = `${maleCount}/${femaleCount}`;
}

function calculateAge(dob) {
    if (!dob) return '?';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function getFilteredPatients() {
    return patients.filter(patient => {
        const matchesSearch = searchTerm === '' || 
            patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm) ||
            patient.id.toString().includes(searchTerm);
        
        const matchesGender = genderFilter === '' || patient.gender === genderFilter;
        
        return matchesSearch && matchesGender;
    });
}

function renderTable() {
    const filtered = getFilteredPatients();
    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pagePatients = filtered.slice(start, end);
    
    const tbody = document.getElementById('patientsTableBody');
    
    if (pagePatients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-folder-open text-3xl mb-2 block"></i><p class="font-normal">No patients found</p></td></tr>';
        document.getElementById('paginationInfo').innerHTML = 'Showing 0 of 0';
        document.getElementById('paginationButtons').innerHTML = '';
        return;
    }
    
    tbody.innerHTML = pagePatients.map(patient => `
        <tr class="patient-row">
            <td class="px-5 py-3 text-sm font-medium text-[#1e293b]">P-${patient.id.toString().padStart(5, '0')}</td>
            <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-r from-[#a8c49a] to-[#8aae7a] rounded-full flex items-center justify-center text-white text-xs font-medium">
                        ${patient.fullName.charAt(0)}
                    </div>
                    <span class="font-medium text-[#1e293b] text-sm">${escapeHtml(patient.fullName)}</span>
                </div>
            </td>
            <td class="px-5 py-3 text-sm text-[#475569] hidden md:table-cell">${calculateAge(patient.dob)} yrs / ${patient.gender}</td>
            <td class="px-5 py-3 text-sm text-[#475569] hidden lg:table-cell">${escapeHtml(patient.phone)}</td>
            <td class="px-5 py-3 text-sm text-[#475569] hidden lg:table-cell">${escapeHtml(patient.email) || '-'}</td>
            <td class="px-5 py-3">
                <div class="flex gap-2 justify-center">
                    <button onclick="editPatient(${patient.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="Edit Patient">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deletePatient(${patient.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Patient">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button onclick="viewPatient(${patient.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="View Patient">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('paginationInfo').innerHTML = `Showing ${start + 1} to ${Math.min(end, filtered.length)} of ${filtered.length} patients`;
    
    let paginationHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button onclick="goToPage(${i})" class="pagination-btn px-3 py-1 rounded-lg text-sm ${i === currentPage ? 'bg-[#a8c49a] text-white' : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'} transition">${i}</button>`;
    }
    document.getElementById('paginationButtons').innerHTML = paginationHtml;
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

function openAddModal() {
    document.getElementById('modalTitle').innerText = 'Add New Patient';
    document.getElementById('patientForm').reset();
    document.getElementById('patientId').value = '';
    document.getElementById('patientModal').classList.add('active');
}

function editPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (patient) {
        document.getElementById('modalTitle').innerText = 'Edit Patient';
        document.getElementById('patientId').value = patient.id;
        document.getElementById('fullName').value = patient.fullName;
        document.getElementById('dob').value = patient.dob;
        document.getElementById('gender').value = patient.gender;
        document.getElementById('bloodGroup').value = patient.bloodGroup || '';
        document.getElementById('phone').value = patient.phone;
        document.getElementById('email').value = patient.email || '';
        document.getElementById('address').value = patient.address || '';
        document.getElementById('patientModal').classList.add('active');
    }
}

function deletePatient(id) {
    currentDeleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if (currentDeleteId) {
        patients = patients.filter(p => p.id !== currentDeleteId);
        savePatients();
        updateStats();
        renderTable();
        showToast('Patient deleted successfully!', 'success');
        currentDeleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function viewPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (patient) {
        showToast(`📋 ${patient.fullName} - Age: ${calculateAge(patient.dob)} yrs, Blood: ${patient.bloodGroup || 'N/A'}`, 'info');
    }
}

function savePatient(event) {
    event.preventDefault();
    
    const id = document.getElementById('patientId').value;
    const patientData = {
        fullName: document.getElementById('fullName').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        updatedAt: new Date().toISOString()
    };
    
    if (id) {
        const index = patients.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            patients[index] = { ...patients[index], ...patientData };
            showToast('Patient updated successfully!', 'success');
        }
    } else {
        const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
        patients.push({
            id: newId,
            ...patientData,
            createdAt: new Date().toISOString()
        });
        showToast('Patient added successfully!', 'success');
    }
    
    savePatients();
    updateStats();
    renderTable();
    closeModal();
}

function closeModal() {
    document.getElementById('patientModal').classList.remove('active');
    document.getElementById('deleteModal').classList.remove('active');
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
    loadPatients();
    
    document.getElementById('addPatientBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('patientForm')?.addEventListener('submit', savePatient);
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = '';
        genderFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('genderFilter').value = '';
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
});

window.editPatient = editPatient;
window.deletePatient = deletePatient;
window.viewPatient = viewPatient;
window.goToPage = goToPage;