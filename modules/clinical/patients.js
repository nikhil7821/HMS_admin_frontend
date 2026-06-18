/**
 * Patients Management JS - Clinical Module
 * Uses theme.css for styling, no inline HTML event handlers
 */

let patients = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentDeleteId = null;
let searchTerm = '';
let genderFilter = '';
let isInitialized = false;

// ─── 🔥 ADD THIS HERE - Auto-Open from Dashboard ───
document.addEventListener('DOMContentLoaded', function() {
    var action = sessionStorage.getItem('dashboard_action');
    if (action === 'openAddPatient') {
        sessionStorage.removeItem('dashboard_action');
        setTimeout(function() {
            // Try to call the function directly
            if (typeof openAddModal === 'function') {
                openAddModal();
            } else if (typeof window.openAddModal === 'function') {
                window.openAddModal();
            } else {
                // Fallback: click the button
                var addBtn = document.getElementById('addPatientBtn');
                if (addBtn) addBtn.click();
            }
        }, 600);
    }
});
// ─── 🔥 END OF AUTO-OPEN SECTION ────────────────────

// ─── Data Management ──────────────────────────────

function loadPatients() {
    try {
        const stored = localStorage.getItem('hms_patients');
        if (stored) {
            patients = JSON.parse(stored);
        } else {
            // Seed data - Indian patients
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
        refreshUI();
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

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = patients.length;
    
    const today = new Date().toISOString().split('T')[0];
    const activeToday = patients.filter(p => p.lastVisit === today).length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = patients.filter(p => {
        const joinDate = new Date(p.createdAt || new Date());
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;
    
    const maleCount = patients.filter(p => p.gender === 'Male').length;
    const femaleCount = patients.filter(p => p.gender === 'Female').length;
    
    document.getElementById('totalPatients').textContent = total;
    document.getElementById('activeToday').textContent = activeToday;
    document.getElementById('thisMonth').textContent = thisMonth;
    document.getElementById('genderRatio').textContent = `${maleCount}/${femaleCount}`;
}

// ─── Filter ──────────────────────────────────────────

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
                <td colspan="6" class="patients-empty">
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
    
    tbody.innerHTML = pagePatients.map(patient => `
        <tr class="patient-row" data-id="${patient.id}">
            <td>
                <span class="patient-id">P-${patient.id.toString().padStart(5, '0')}</span>
            </td>
            <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span class="patient-avatar">${getInitials(patient.fullName)}</span>
                    <span style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(patient.fullName)}</span>
                </div>
            </td>
            <td class="hidden md:table-cell" style="color:var(--color-brown-300);">
                ${calculateAge(patient.dob)} yrs / ${patient.gender}
            </td>
            <td class="hidden lg:table-cell" style="color:var(--color-brown-300);">${esc(patient.phone)}</td>
            <td class="hidden lg:table-cell" style="color:var(--color-brown-300);">${esc(patient.email) || '-'}</td>
            <td style="text-align:center;">
                <div style="display:flex; gap:0.25rem; justify-content:center;">
                    <button class="action-btn view-btn" data-id="${patient.id}" title="View Patient">
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
    `).join('');
    
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
    
    // Bind events using delegation for table buttons
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewPatient(parseInt(btn.dataset.id)));
    });
    
    // Bind pagination events
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderTable();
        });
    });
}

function refreshUI() {
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
    document.getElementById('patientForm').reset();
    document.getElementById('patientId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add New Patient';
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
    openModal('patientModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

function viewPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (patient && window.showToast) {
        const age = calculateAge(patient.dob);
        window.showToast(`📋 ${patient.fullName} - ${age} yrs, Blood: ${patient.bloodGroup || 'N/A'}`, 'info');
    }
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
        updatedAt: new Date().toISOString()
    };
    
    // Basic validation
    if (!patientData.fullName || !patientData.dob || !patientData.gender || !patientData.phone) {
        if (window.showToast) {
            window.showToast('Please fill in all required fields', 'error');
        }
        return;
    }
    
    if (id) {
        const index = patients.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            patients[index] = { ...patients[index], ...patientData };
            if (window.showToast) window.showToast(`✅ ${patientData.fullName} updated successfully`, 'success');
        }
    } else {
        const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
        patients.push({
            id: newId,
            ...patientData,
            createdAt: new Date().toISOString()
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
    
    loadPatients();
    
    // Event Listeners
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
    
    // Close modals on overlay click
    document.getElementById('patientModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('patientModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('patientModal');
            closeModal('deleteModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────

document.addEventListener('DOMContentLoaded', function() {
    // Check if common.js has loaded sidebar
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initPatientsModule, 100);
        }
    }, 50);
    
    // Fallback: if sidebar doesn't load in 3 seconds, init anyway
    setTimeout(() => {
        clearInterval(checkInterval);
        initPatientsModule();
    }, 3000);
});