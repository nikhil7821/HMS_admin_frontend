/**
 * Shifts Management JS - Staff Module
 * Professional UI, Fully Working, Indian Names
 */

let shifts = [];
let staffMembers = [];
let deleteId = null;

function loadData() {
    staffMembers = JSON.parse(localStorage.getItem('staff_members') || '[]');
    const stored = localStorage.getItem('staff_shifts');
    if(stored) {
        shifts = JSON.parse(stored);
    } else {
        shifts = [
            {id: 1, staffId: 1, staffName: 'Priya Sharma', role: 'Nurse', shiftType: 'Morning', shiftTime: '7:00 AM - 3:00 PM', day: 'Monday'},
            {id: 2, staffId: 2, staffName: 'Rajesh Kumar', role: 'Receptionist', shiftType: 'General', shiftTime: '9:00 AM - 5:00 PM', day: 'Monday'},
            {id: 3, staffId: 3, staffName: 'Sneha Patel', role: 'Lab Technician', shiftType: 'Evening', shiftTime: '3:00 PM - 11:00 PM', day: 'Tuesday'},
            {id: 4, staffId: 4, staffName: 'Amit Singh', role: 'Radiology Technician', shiftType: 'Night', shiftTime: '11:00 PM - 7:00 AM', day: 'Wednesday'},
            {id: 5, staffId: 5, staffName: 'Neha Gupta', role: 'Pharmacist', shiftType: 'Morning', shiftTime: '7:00 AM - 3:00 PM', day: 'Thursday'}
        ];
        saveShifts();
    }
    updateStats();
    renderTable();
    populateStaffSelect();
}

function saveShifts() {
    localStorage.setItem('staff_shifts', JSON.stringify(shifts));
}

function updateStats() {
    const totalShifts = shifts.length;
    const staffAssigned = new Set(shifts.map(s => s.staffId)).size;
    const morningCount = shifts.filter(s => s.shiftType === 'Morning').length;
    const nightCount = shifts.filter(s => s.shiftType === 'Night').length;
    
    document.getElementById('totalShifts').innerText = totalShifts;
    document.getElementById('staffAssigned').innerText = staffAssigned;
    document.getElementById('morningCount').innerText = morningCount;
    document.getElementById('nightCount').innerText = nightCount;
}

function validateShiftForm() {
    let isValid = true;
    
    const staffId = document.getElementById('staffId').value;
    const shiftType = document.getElementById('shiftType').value;
    const day = document.getElementById('day').value;
    
    if (!staffId) {
        document.getElementById('staffIdError').classList.add('show');
        document.getElementById('staffId').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('staffIdError').classList.remove('show');
        document.getElementById('staffId').classList.remove('error');
    }
    
    if (!shiftType) {
        document.getElementById('shiftTypeError').classList.add('show');
        document.getElementById('shiftType').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('shiftTypeError').classList.remove('show');
        document.getElementById('shiftType').classList.remove('error');
    }
    
    if (!day) {
        document.getElementById('dayError').classList.add('show');
        document.getElementById('day').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('dayError').classList.remove('show');
        document.getElementById('day').classList.remove('error');
    }
    
    return isValid;
}

function renderTable() {
    const tbody = document.getElementById('shiftsTable');
    if(shifts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-clock text-3xl mb-2 block"></i><p class="font-normal">No shifts assigned</p> </td></tr>';
        return;
    }
    
    const shiftClass = {
        'Morning': 'shift-morning',
        'Evening': 'shift-evening',
        'Night': 'shift-night',
        'General': 'shift-general'
    };
    
    tbody.innerHTML = shifts.map(s => `
        <tr class="shift-row">
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(s.staffName)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${escapeHtml(s.role)}</td>
            <td class="px-5 py-3"><span class="${shiftClass[s.shiftType]}">${s.shiftType}</span></td>
            <td class="px-5 py-3 text-[#475569] text-sm">${s.shiftTime.split(' - ')[0]}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${s.shiftTime.split(' - ')[1]}</td>
            <td class="px-5 py-3"><span class="day-badge">${s.day}</span></td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    <button onclick="editShift(${s.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="Edit Shift">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteShift(${s.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Shift">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
         </table>
    `).join('');
}

function populateStaffSelect() {
    const select = document.getElementById('staffId');
    const activeStaff = staffMembers.filter(s => s.status === 'Active');
    select.innerHTML = '<option value="">-- Select Staff --</option>' + 
        activeStaff.map(s => `<option value="${s.id}">${escapeHtml(s.fullName)} (${escapeHtml(s.role)} - ${s.staffId})</option>`).join('');
}

function openModal() {
    document.getElementById('shiftForm').reset();
    document.getElementById('shiftId').value = '';
    document.getElementById('modalTitle').innerText = 'Assign Shift';
    document.getElementById('shiftModal').classList.add('active');
    populateStaffSelect();
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function editShift(id) {
    const shift = shifts.find(s => s.id === id);
    if(shift) {
        document.getElementById('shiftId').value = shift.id;
        document.getElementById('modalTitle').innerText = 'Edit Shift';
        populateStaffSelect();
        setTimeout(() => {
            document.getElementById('staffId').value = shift.staffId;
        }, 50);
        document.getElementById('shiftType').value = shift.shiftType;
        document.getElementById('day').value = shift.day;
        document.getElementById('shiftModal').classList.add('active');
        
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

function deleteShift(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        shifts = shifts.filter(s => s.id !== deleteId);
        saveShifts();
        updateStats();
        renderTable();
        showToast('Shift deleted successfully', 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function saveShift(e) {
    e.preventDefault();
    
    if(!validateShiftForm()) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const id = document.getElementById('shiftId').value;
    const staffId = parseInt(document.getElementById('staffId').value);
    const staff = staffMembers.find(s => s.id === staffId);
    const shiftType = document.getElementById('shiftType').value;
    const day = document.getElementById('day').value;
    
    const shiftTimes = {
        'Morning': '7:00 AM - 3:00 PM',
        'Evening': '3:00 PM - 11:00 PM',
        'Night': '11:00 PM - 7:00 AM',
        'General': '9:00 AM - 5:00 PM'
    };
    
    // Check for duplicate shift on same day for same staff
    if (!id) {
        const existingShift = shifts.find(s => s.staffId === staffId && s.day === day);
        if (existingShift) {
            showToast(`${staff?.fullName} already has a shift on ${day}`, 'error');
            return;
        }
    }
    
    const data = {
        staffId: staffId,
        staffName: staff?.fullName || '',
        role: staff?.role || '',
        shiftType: shiftType,
        shiftTime: shiftTimes[shiftType],
        day: day
    };
    
    if(id) {
        const index = shifts.findIndex(s => s.id === parseInt(id));
        if(index !== -1) {
            shifts[index] = { ...shifts[index], ...data };
            showToast('Shift updated successfully', 'success');
        }
    } else {
        const newId = shifts.length > 0 ? Math.max(...shifts.map(s => s.id)) + 1 : 1;
        shifts.push({ id: newId, ...data });
        showToast('Shift assigned successfully', 'success');
    }
    
    saveShifts();
    updateStats();
    renderTable();
    closeModal();
}

function closeModal() {
    document.getElementById('shiftModal').classList.remove('active');
    document.getElementById('shiftForm').reset();
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
    loadData();
    
    document.getElementById('addShiftBtn')?.addEventListener('click', openModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('shiftForm')?.addEventListener('submit', saveShift);
    
    // Real-time validation
    document.getElementById('staffId')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('staffIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('shiftType')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('shiftTypeError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('day')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('dayError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
});

window.editShift = editShift;
window.deleteShift = deleteShift;