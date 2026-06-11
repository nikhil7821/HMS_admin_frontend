/**
 * Staff Management JS - Staff Module
 * Professional UI, Fully Working, Indian Names, Rupee Symbol
 */

let staffMembers = [];
let deleteId = null;

function loadStaff() {
    const stored = localStorage.getItem('staff_members');
    if(stored) {
        staffMembers = JSON.parse(stored);
    } else {
        staffMembers = [
            {id: 1, staffId: 'NUR001', fullName: 'Priya Sharma', role: 'Nurse', department: 'ICU', phone: '+91 98765 43210', email: 'priya.sharma@medflow.com', joiningDate: '2023-01-15', salary: 35000, status: 'Active', address: 'Mumbai', qualifications: 'B.Sc Nursing, Critical Care Certified'},
            {id: 2, staffId: 'REC001', fullName: 'Rajesh Kumar', role: 'Receptionist', department: 'Front Office', phone: '+91 98765 43211', email: 'rajesh.kumar@medflow.com', joiningDate: '2023-03-20', salary: 25000, status: 'Active', address: 'Delhi', qualifications: 'B.Com, Computer Proficiency'},
            {id: 3, staffId: 'LAB001', fullName: 'Sneha Patel', role: 'Lab Technician', department: 'Laboratory', phone: '+91 98765 43212', email: 'sneha.patel@medflow.com', joiningDate: '2023-06-10', salary: 30000, status: 'Active', address: 'Ahmedabad', qualifications: 'DMLT, B.Sc MLT'},
            {id: 4, staffId: 'RAD001', fullName: 'Amit Singh', role: 'Radiology Technician', department: 'Radiology', phone: '+91 98765 43213', email: 'amit.singh@medflow.com', joiningDate: '2023-08-05', salary: 32000, status: 'On Leave', address: 'Pune', qualifications: 'B.Sc Radiology'},
            {id: 5, staffId: 'PHA001', fullName: 'Neha Gupta', role: 'Pharmacist', department: 'Pharmacy', phone: '+91 98765 43214', email: 'neha.gupta@medflow.com', joiningDate: '2023-02-28', salary: 38000, status: 'Active', address: 'Bangalore', qualifications: 'B.Pharm, D.Pharm'},
            {id: 6, staffId: 'ADM001', fullName: 'Dr. Arjun Mehta', role: 'Admin', department: 'Administration', phone: '+91 98765 43215', email: 'arjun.mehta@medflow.com', joiningDate: '2022-01-10', salary: 75000, status: 'Active', address: 'Mumbai', qualifications: 'MBA, Healthcare Management'},
            {id: 7, staffId: 'ACC001', fullName: 'Kavya Nair', role: 'Accountant', department: 'Finance', phone: '+91 98765 43216', email: 'kavya.nair@medflow.com', joiningDate: '2023-04-15', salary: 40000, status: 'Active', address: 'Kochi', qualifications: 'CA Inter, B.Com'},
            {id: 8, staffId: 'HSE001', fullName: 'Ramesh Yadav', role: 'Housekeeping', department: 'Housekeeping', phone: '+91 98765 43217', email: 'ramesh.yadav@medflow.com', joiningDate: '2023-07-01', salary: 18000, status: 'Active', address: 'Mumbai', qualifications: 'High School'}
        ];
        saveStaff();
    }
    updateStats();
    renderStaff();
}

function saveStaff() {
    localStorage.setItem('staff_members', JSON.stringify(staffMembers));
}

function updateStats() {
    const total = staffMembers.length;
    const active = staffMembers.filter(s => s.status === 'Active').length;
    const onLeave = staffMembers.filter(s => s.status === 'On Leave').length;
    const depts = [...new Set(staffMembers.map(s => s.department).filter(d => d))];
    
    document.getElementById('totalStaff').innerText = total;
    document.getElementById('activeStaff').innerText = active;
    document.getElementById('totalDepts').innerText = depts.length;
    document.getElementById('onLeave').innerText = onLeave;
}

function validateStaffForm() {
    let isValid = true;
    
    const fullName = document.getElementById('fullName').value.trim();
    const staffId = document.getElementById('staffIdNumber').value.trim();
    const role = document.getElementById('role').value;
    const phone = document.getElementById('phone').value.trim();
    const status = document.getElementById('status').value;
    
    if (!fullName) {
        document.getElementById('fullNameError').classList.add('show');
        document.getElementById('fullName').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('fullNameError').classList.remove('show');
        document.getElementById('fullName').classList.remove('error');
    }
    
    if (!staffId) {
        document.getElementById('staffIdError').classList.add('show');
        document.getElementById('staffIdNumber').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('staffIdError').classList.remove('show');
        document.getElementById('staffIdNumber').classList.remove('error');
    }
    
    if (!role) {
        document.getElementById('roleError').classList.add('show');
        document.getElementById('role').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('roleError').classList.remove('show');
        document.getElementById('role').classList.remove('error');
    }
    
    if (!phone) {
        document.getElementById('phoneError').classList.add('show');
        document.getElementById('phone').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('phoneError').classList.remove('show');
        document.getElementById('phone').classList.remove('error');
    }
    
    if (!status) {
        document.getElementById('statusError').classList.add('show');
        document.getElementById('status').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('statusError').classList.remove('show');
        document.getElementById('status').classList.remove('error');
    }
    
    return isValid;
}

function renderStaff() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('roleFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = staffMembers.filter(s => {
        const matchesSearch = search === '' || 
            s.fullName.toLowerCase().includes(search) || 
            s.staffId.toLowerCase().includes(search) ||
            (s.department && s.department.toLowerCase().includes(search));
        const matchesRole = roleFilter === '' || s.role === roleFilter;
        const matchesStatus = statusFilter === '' || s.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    const grid = document.getElementById('staffGrid');
    if(filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-[#94a3b8]"><i class="fas fa-users text-3xl mb-2 block"></i><p class="font-normal">No staff members found</p></div>';
        return;
    }
    
    const roleColors = {
        'Nurse': 'bg-green-100 text-green-700',
        'Receptionist': 'bg-blue-100 text-blue-700',
        'Lab Technician': 'bg-purple-100 text-purple-700',
        'Radiology Technician': 'bg-indigo-100 text-indigo-700',
        'Pharmacist': 'bg-pink-100 text-pink-700',
        'Admin': 'bg-red-100 text-red-700',
        'Accountant': 'bg-yellow-100 text-yellow-700',
        'Housekeeping': 'bg-gray-100 text-gray-700'
    };
    
    const statusClass = {
        'Active': 'status-badge-active',
        'Inactive': 'status-badge-inactive',
        'On Leave': 'status-badge-leave'
    };
    
    grid.innerHTML = filtered.map(staff => `
        <div class="staff-card p-3">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gradient-to-r from-[#a8c49a] to-[#8aae7a] rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm flex-shrink-0">
                    ${staff.fullName.charAt(0)}
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-[#1e293b] text-sm truncate">${escapeHtml(staff.fullName)}</h3>
                    <p class="text-xs text-[#94a3b8]">${escapeHtml(staff.staffId)}</p>
                    <span class="role-badge text-xs mt-1 inline-block">${escapeHtml(staff.role)}</span>
                </div>
            </div>
            
            <div class="space-y-1.5 text-xs mb-3">
                <div class="flex justify-between">
                    <span class="text-[#64748b]"><i class="fas fa-building w-4"></i> Dept:</span>
                    <span class="font-medium text-[#1e293b]">${staff.department || '-'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-[#64748b]"><i class="fas fa-phone w-4"></i> Phone:</span>
                    <span class="text-[#475569]">${escapeHtml(staff.phone)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-[#64748b]"><i class="fas fa-calendar w-4"></i> Joined:</span>
                    <span class="text-[#475569]">${staff.joiningDate || '-'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-[#64748b]"><i class="fas fa-rupee-sign w-4"></i> Salary:</span>
                    <span class="font-semibold text-[#1e293b]">₹${(staff.salary || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-[#64748b]"><i class="fas fa-circle w-4"></i> Status:</span>
                    <span class="${statusClass[staff.status]}">${staff.status}</span>
                </div>
            </div>
            
            ${staff.qualifications ? `<div class="text-[#64748b] text-[10px] pt-1 border-t border-[#f0e8e0] mt-1">${escapeHtml(staff.qualifications.substring(0, 60))}${staff.qualifications.length > 60 ? '...' : ''}</div>` : ''}
            
            <div class="mt-3 flex gap-2">
                <button onclick="editStaff(${staff.id})" class="flex-1 bg-[#a8c49a] hover:bg-[#8aae7a] text-white py-1.5 rounded-lg text-xs font-medium transition">
                    <i class="fas fa-edit mr-1"></i> Edit
                </button>
                <button onclick="deleteStaff(${staff.id})" class="flex-1 bg-[#d8b48c] hover:bg-[#c49a6c] text-white py-1.5 rounded-lg text-xs font-medium transition">
                    <i class="fas fa-trash-alt mr-1"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function openAddModal() {
    document.getElementById('staffForm').reset();
    document.getElementById('staffId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Staff Member';
    document.getElementById('staffModal').classList.add('active');
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function editStaff(id) {
    const staff = staffMembers.find(s => s.id === id);
    if(staff) {
        document.getElementById('staffId').value = staff.id;
        document.getElementById('fullName').value = staff.fullName;
        document.getElementById('staffIdNumber').value = staff.staffId;
        document.getElementById('role').value = staff.role;
        document.getElementById('department').value = staff.department || '';
        document.getElementById('phone').value = staff.phone;
        document.getElementById('email').value = staff.email || '';
        document.getElementById('joiningDate').value = staff.joiningDate || '';
        document.getElementById('salary').value = staff.salary || '';
        document.getElementById('status').value = staff.status;
        document.getElementById('address').value = staff.address || '';
        document.getElementById('qualifications').value = staff.qualifications || '';
        document.getElementById('modalTitle').innerText = 'Edit Staff Member';
        document.getElementById('staffModal').classList.add('active');
        
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

function deleteStaff(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        staffMembers = staffMembers.filter(s => s.id !== deleteId);
        saveStaff();
        updateStats();
        renderStaff();
        showToast('Staff member deleted successfully', 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function saveStaffMember(e) {
    e.preventDefault();
    
    if(!validateStaffForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    const id = document.getElementById('staffId').value;
    const data = {
        fullName: document.getElementById('fullName').value.trim(),
        staffId: document.getElementById('staffIdNumber').value.trim(),
        role: document.getElementById('role').value,
        department: document.getElementById('department').value,
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value,
        joiningDate: document.getElementById('joiningDate').value,
        salary: parseInt(document.getElementById('salary').value) || 0,
        status: document.getElementById('status').value,
        address: document.getElementById('address').value,
        qualifications: document.getElementById('qualifications').value
    };
    
    if(id) {
        const index = staffMembers.findIndex(s => s.id === parseInt(id));
        if(index !== -1) {
            staffMembers[index] = { ...staffMembers[index], ...data };
            showToast('Staff member updated successfully', 'success');
        }
    } else {
        const newId = staffMembers.length > 0 ? Math.max(...staffMembers.map(s => s.id)) + 1 : 1;
        staffMembers.push({ id: newId, ...data });
        showToast('Staff member added successfully', 'success');
    }
    
    saveStaff();
    updateStats();
    renderStaff();
    closeModal();
}

function closeModal() {
    document.getElementById('staffModal').classList.remove('active');
    document.getElementById('staffForm').reset();
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
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
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${message}</span></div>`;
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
    loadStaff();
    
    document.getElementById('addStaffBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('staffForm')?.addEventListener('submit', saveStaffMember);
    document.getElementById('searchInput')?.addEventListener('input', () => renderStaff());
    document.getElementById('roleFilter')?.addEventListener('change', () => renderStaff());
    document.getElementById('statusFilter')?.addEventListener('change', () => renderStaff());
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('roleFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderStaff();
    });
    
    // Real-time validation
    document.getElementById('fullName')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('fullNameError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('staffIdNumber')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('staffIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('role')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('roleError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('phone')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('phoneError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('status')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('statusError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
});

window.editStaff = editStaff;
window.deleteStaff = deleteStaff;