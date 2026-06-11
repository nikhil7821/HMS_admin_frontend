/**
 * Beds Management JS - Ward Management Module
 * Professional UI, Fully Working, Indian Names - BUTTONS ALIGNED
 */

let beds = [];
let wards = [];
let rooms = [];
let patients = [];
let deleteId = null;

function loadData() {
    wards = JSON.parse(localStorage.getItem('wards') || '[]');
    rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
    
    const stored = localStorage.getItem('beds');
    if(stored) {
        beds = JSON.parse(stored);
        if (beds[0] && (beds[0].allocatedTo === 'John Doe' || beds[0].allocatedTo === 'Jane Smith')) {
            setIndianBeds();
        }
    } else {
        setIndianBeds();
    }
    updateStats();
    renderBeds();
    populateFilters();
}

function setIndianBeds() {
    const today = new Date().toISOString().split('T')[0];
    beds = [
        {id: 1, wardId: 1, wardName: 'ICU', roomId: 1, roomNumber: '101', bedNumber: '101A', bedType: 'ICU', status: 'Occupied', allocatedTo: 'Rajesh Kumar', allocatedPatientId: 1, admissionDate: today, features: 'Monitor, Ventilator, Oxygen supply'},
        {id: 2, wardId: 1, wardName: 'ICU', roomId: 1, roomNumber: '101', bedNumber: '101B', bedType: 'ICU', status: 'Available', features: 'Monitor, Ventilator'},
        {id: 3, wardId: 2, wardName: 'General Ward', roomId: 2, roomNumber: '201', bedNumber: '201A', bedType: 'Standard', status: 'Occupied', allocatedTo: 'Priya Sharma', allocatedPatientId: 2, admissionDate: today, features: 'Side rails, Call bell'},
        {id: 4, wardId: 2, wardName: 'General Ward', roomId: 2, roomNumber: '201', bedNumber: '201B', bedType: 'Standard', status: 'Available', features: 'Side rails'},
        {id: 5, wardId: 2, wardName: 'General Ward', roomId: 3, roomNumber: '202', bedNumber: '202A', bedType: 'Standard', status: 'Available', features: 'Side rails, Call bell'},
        {id: 6, wardId: 3, wardName: 'Private Ward', roomId: 4, roomNumber: '301', bedNumber: '301', bedType: 'Electric', status: 'Available', features: 'AC, TV, Attached bathroom, Electric bed'},
        {id: 7, wardId: 4, wardName: 'Maternity Ward', roomId: 5, roomNumber: '401', bedNumber: '401A', bedType: 'Maternity', status: 'Occupied', allocatedTo: 'Neha Gupta', allocatedPatientId: 4, admissionDate: today, features: 'Baby crib, Breastfeeding support'},
        {id: 8, wardId: 5, wardName: 'Pediatric Ward', roomId: 6, roomNumber: '501', bedNumber: '501A', bedType: 'Pediatric', status: 'Maintenance', features: 'Colorful theme, Safety rails'}
    ];
    saveBeds();
    updateRoomStats();
    updateWardStats();
}

function saveBeds() {
    localStorage.setItem('beds', JSON.stringify(beds));
}

function updateRoomStats() {
    rooms.forEach(room => {
        const roomBeds = beds.filter(b => b.roomId === room.id);
        const availableBeds = roomBeds.filter(b => b.status === 'Available').length;
        const roomIndex = rooms.findIndex(r => r.id === room.id);
        if(roomIndex !== -1) {
            rooms[roomIndex].availableBeds = availableBeds;
        }
    });
    localStorage.setItem('rooms', JSON.stringify(rooms));
}

function updateWardStats() {
    wards.forEach(ward => {
        const wardBeds = beds.filter(b => b.wardId === ward.id);
        const totalBeds = wardBeds.length;
        const availableBeds = wardBeds.filter(b => b.status === 'Available').length;
        const wardIndex = wards.findIndex(w => w.id === ward.id);
        if(wardIndex !== -1) {
            wards[wardIndex].totalBeds = totalBeds;
            wards[wardIndex].availableBeds = availableBeds;
        }
    });
    localStorage.setItem('wards', JSON.stringify(wards));
}

function updateStats() {
    const totalBeds = beds.length;
    const availableBeds = beds.filter(b => b.status === 'Available').length;
    
    document.getElementById('totalWards').innerText = wards.length;
    document.getElementById('totalRooms').innerText = rooms.length;
    document.getElementById('totalBeds').innerText = totalBeds;
    document.getElementById('availableBeds').innerText = availableBeds;
}

function validateBedForm() {
    let isValid = true;
    
    const wardId = document.getElementById('wardId').value;
    const roomId = document.getElementById('roomId').value;
    const bedNumber = document.getElementById('bedNumber').value.trim();
    const status = document.getElementById('status').value;
    
    if (!wardId) {
        document.getElementById('wardIdError').classList.add('show');
        document.getElementById('wardId').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('wardIdError').classList.remove('show');
        document.getElementById('wardId').classList.remove('error');
    }
    
    if (!roomId) {
        document.getElementById('roomIdError').classList.add('show');
        document.getElementById('roomId').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('roomIdError').classList.remove('show');
        document.getElementById('roomId').classList.remove('error');
    }
    
    if (!bedNumber) {
        document.getElementById('bedNumberError').classList.add('show');
        document.getElementById('bedNumber').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('bedNumberError').classList.remove('show');
        document.getElementById('bedNumber').classList.remove('error');
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

function renderBeds() {
    const wardFilter = document.getElementById('wardFilter')?.value || '';
    const roomFilter = document.getElementById('roomFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = beds.filter(bed => {
        const matchesWard = wardFilter === '' || bed.wardId.toString() === wardFilter;
        const matchesRoom = roomFilter === '' || bed.roomId.toString() === roomFilter;
        const matchesStatus = statusFilter === '' || bed.status === statusFilter;
        return matchesWard && matchesRoom && matchesStatus;
    });
    
    const grid = document.getElementById('bedsGrid');
    if(filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-[#94a3b8]"><i class="fas fa-bed text-3xl mb-2 block"></i><p class="font-normal">No beds found</p></div>';
        return;
    }
    
    // Calculate max height for consistent card size - using flex column layout
    grid.innerHTML = filtered.map(bed => `
        <div class="bed-card p-3 border-l-4 ${bed.status === 'Available' ? 'border-l-green-500' : bed.status === 'Occupied' ? 'border-l-red-500' : 'border-l-yellow-500'} flex flex-col h-full">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-semibold text-[#1e293b] text-sm">Bed ${escapeHtml(bed.bedNumber)}</h3>
                    <p class="text-xs text-[#94a3b8]">${escapeHtml(bed.wardName)} - Room ${escapeHtml(bed.roomNumber)}</p>
                </div>
                <div class="flex gap-1">
                    <button onclick="editBed(${bed.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition p-1 rounded" title="Edit Bed">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteBed(${bed.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition p-1 rounded" title="Delete Bed">
                        <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                </div>
            </div>
            
            <div class="space-y-1.5 text-xs mb-3 flex-grow">
                <div class="flex justify-between items-center">
                    <span class="text-[#64748b]">Bed Type:</span>
                    <span class="font-medium text-[#1e293b]">${bed.bedType || 'Standard'}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-[#64748b]">Status:</span>
                    <span class="status-${bed.status.toLowerCase()}">
                        <i class="fas ${bed.status === 'Available' ? 'fa-check-circle' : bed.status === 'Occupied' ? 'fa-user-circle' : 'fa-tools'} text-xs"></i>
                        ${bed.status}
                    </span>
                </div>
                ${bed.status === 'Occupied' ? `
                    <div class="flex justify-between items-center">
                        <span class="text-[#64748b]">Patient:</span>
                        <span class="font-medium text-[#1e293b]">${escapeHtml(bed.allocatedTo || 'Unknown')}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-[#64748b]">Admitted:</span>
                        <span class="text-[#475569]">${bed.admissionDate || '-'}</span>
                    </div>
                ` : ''}
                ${bed.features ? `<div class="text-[#64748b] text-[10px] mt-1 pt-1 border-t border-[#f0e8e0]">${escapeHtml(bed.features)}</div>` : ''}
            </div>
            
            <!-- ALL BUTTONS - SAME HEIGHT, SAME WIDTH, SAME STYLE, ALWAYS AT BOTTOM -->
            <div class="mt-auto pt-2">
                ${bed.status === 'Available' ? `
                    <button onclick="openAllocateModal(${bed.id})" class="btn-success w-full py-1.5 rounded-lg text-xs font-medium">
                        <i class="fas fa-user-plus mr-1"></i> Allocate to Patient
                    </button>
                ` : bed.status === 'Occupied' ? `
                    <button onclick="dischargePatient(${bed.id})" class="btn-primary w-full py-1.5 rounded-lg text-xs font-medium">
                        <i class="fas fa-download mr-1"></i> Discharge / Vacate
                    </button>
                ` : `
                    <button onclick="markAvailable(${bed.id})" class="bg-gray-500 hover:bg-gray-600 text-white w-full py-1.5 rounded-lg text-xs font-medium transition">
                        <i class="fas fa-check mr-1"></i> Mark Available
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

function populateFilters() {
    const wardSelect = document.getElementById('wardFilter');
    if(wardSelect) {
        wardSelect.innerHTML = '<option value="">All Wards</option>' + 
            wards.map(w => `<option value="${w.id}">${escapeHtml(w.name)}</option>`).join('');
    }
    
    const wardSelectModal = document.getElementById('wardId');
    if(wardSelectModal) {
        wardSelectModal.innerHTML = '<option value="">-- Select Ward --</option>' + 
            wards.map(w => `<option value="${w.id}">${escapeHtml(w.name)}</option>`).join('');
        wardSelectModal.addEventListener('change', function() {
            const roomSelect = document.getElementById('roomId');
            const filteredRooms = rooms.filter(r => r.wardId === parseInt(this.value));
            roomSelect.innerHTML = '<option value="">-- Select Room --</option>' + 
                filteredRooms.map(r => `<option value="${r.id}">${escapeHtml(r.roomNumber)}</option>`).join('');
        });
    }
    
    const roomFilter = document.getElementById('roomFilter');
    if(roomFilter) {
        const updateRoomFilter = () => {
            const selectedWard = document.getElementById('wardFilter').value;
            const filteredRooms = selectedWard ? rooms.filter(r => r.wardId === parseInt(selectedWard)) : rooms;
            roomFilter.innerHTML = '<option value="">All Rooms</option>' + 
                filteredRooms.map(r => `<option value="${r.id}">${escapeHtml(r.roomNumber)}</option>`).join('');
        };
        document.getElementById('wardFilter')?.addEventListener('change', updateRoomFilter);
        updateRoomFilter();
    }
    
    const patientSelect = document.getElementById('patientId');
    if(patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${escapeHtml(p.fullName)} (${p.phone})</option>`).join('');
    }
}

function openModal() {
    document.getElementById('bedForm').reset();
    document.getElementById('bedId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Bed';
    document.getElementById('bedModal').classList.add('active');
    populateFilters();
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function editBed(id) {
    const bed = beds.find(b => b.id === id);
    if(bed) {
        document.getElementById('bedId').value = bed.id;
        document.getElementById('wardId').value = bed.wardId;
        const event = new Event('change');
        document.getElementById('wardId').dispatchEvent(event);
        setTimeout(() => {
            document.getElementById('roomId').value = bed.roomId;
        }, 100);
        document.getElementById('bedNumber').value = bed.bedNumber;
        document.getElementById('bedType').value = bed.bedType || 'Standard';
        document.getElementById('status').value = bed.status;
        document.getElementById('features').value = bed.features || '';
        document.getElementById('modalTitle').innerText = 'Edit Bed';
        document.getElementById('bedModal').classList.add('active');
        
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

function deleteBed(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        beds = beds.filter(b => b.id !== deleteId);
        saveBeds();
        updateRoomStats();
        updateWardStats();
        updateStats();
        renderBeds();
        showToast('Bed deleted successfully', 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function saveBed(e) {
    e.preventDefault();
    
    if(!validateBedForm()) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const id = document.getElementById('bedId').value;
    const wardId = parseInt(document.getElementById('wardId').value);
    const roomId = parseInt(document.getElementById('roomId').value);
    const ward = wards.find(w => w.id === wardId);
    const room = rooms.find(r => r.id === roomId);
    
    if (!ward || !room) {
        showToast('Invalid ward or room selection', 'error');
        return;
    }
    
    const data = {
        wardId: wardId,
        wardName: ward.name,
        roomId: roomId,
        roomNumber: room.roomNumber,
        bedNumber: document.getElementById('bedNumber').value.trim(),
        bedType: document.getElementById('bedType').value,
        status: document.getElementById('status').value,
        features: document.getElementById('features').value
    };
    
    if(id) {
        const index = beds.findIndex(b => b.id === parseInt(id));
        if(index !== -1) {
            beds[index] = { ...beds[index], ...data };
            showToast('Bed updated successfully', 'success');
        }
    } else {
        const newId = beds.length > 0 ? Math.max(...beds.map(b => b.id)) + 1 : 1;
        beds.push({ id: newId, ...data });
        showToast('Bed added successfully', 'success');
    }
    
    saveBeds();
    updateRoomStats();
    updateWardStats();
    updateStats();
    renderBeds();
    closeModal();
}

function openAllocateModal(bedId) {
    const bed = beds.find(b => b.id === bedId);
    if(bed) {
        document.getElementById('allocateBedId').value = bedId;
        document.getElementById('allocateModal').classList.add('active');
        populateFilters();
    }
}

function allocateBed(e) {
    e.preventDefault();
    
    const bedId = parseInt(document.getElementById('allocateBedId').value);
    const patientId = parseInt(document.getElementById('patientId').value);
    const admissionType = document.getElementById('admissionType').value;
    
    if (!patientId) {
        showToast('Please select a patient', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const bed = beds.find(b => b.id === bedId);
    
    if(bed && patient) {
        if (bed.status !== 'Available') {
            showToast('This bed is not available for allocation', 'error');
            return;
        }
        
        bed.status = 'Occupied';
        bed.allocatedTo = patient.fullName;
        bed.allocatedPatientId = patientId;
        bed.admissionDate = new Date().toISOString().split('T')[0];
        bed.admissionType = admissionType;
        
        saveBeds();
        updateRoomStats();
        updateWardStats();
        updateStats();
        renderBeds();
        closeAllocateModal();
        showToast(`Bed ${bed.bedNumber} allocated to ${patient.fullName}`, 'success');
        
        createIPDRecord(bed, patient);
    }
}

function createIPDRecord(bed, patient) {
    let ipdPatients = JSON.parse(localStorage.getItem('hms_ipd') || '[]');
    const newId = ipdPatients.length > 0 ? Math.max(...ipdPatients.map(p => p.id)) + 1 : 1;
    
    ipdPatients.push({
        id: newId,
        patientId: patient?.id,
        patientName: patient?.fullName || '',
        doctorName: '',
        wardName: bed.wardName,
        bedNo: bed.bedNumber,
        admissionDate: new Date().toISOString().split('T')[0],
        diagnosis: '',
        status: 'Admitted',
        admissionType: bed.admissionType || 'General'
    });
    
    localStorage.setItem('hms_ipd', JSON.stringify(ipdPatients));
}

function dischargePatient(bedId) {
    if(confirm('Discharge this patient and vacate the bed?')) {
        const bed = beds.find(b => b.id === bedId);
        if(bed) {
            bed.status = 'Available';
            const patientName = bed.allocatedTo;
            bed.allocatedTo = '';
            bed.allocatedPatientId = null;
            bed.admissionDate = '';
            bed.admissionType = '';
            
            let ipdPatients = JSON.parse(localStorage.getItem('hms_ipd') || '[]');
            const ipdIndex = ipdPatients.findIndex(p => p.patientId === bed.allocatedPatientId && p.status === 'Admitted');
            if(ipdIndex !== -1) {
                ipdPatients[ipdIndex].status = 'Discharged';
                ipdPatients[ipdIndex].dischargeDate = new Date().toISOString().split('T')[0];
                localStorage.setItem('hms_ipd', JSON.stringify(ipdPatients));
            }
            
            saveBeds();
            updateRoomStats();
            updateWardStats();
            updateStats();
            renderBeds();
            showToast(`${patientName} discharged, bed vacated successfully`, 'success');
        }
    }
}

function markAvailable(bedId) {
    const bed = beds.find(b => b.id === bedId);
    if(bed) {
        bed.status = 'Available';
        saveBeds();
        updateRoomStats();
        updateWardStats();
        renderBeds();
        showToast('Bed marked as available', 'success');
    }
}

function closeModal() {
    document.getElementById('bedModal').classList.remove('active');
    document.getElementById('bedForm').reset();
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function closeAllocateModal() {
    document.getElementById('allocateModal').classList.remove('active');
    document.getElementById('allocateForm').reset();
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
    
    document.getElementById('addBedBtn')?.addEventListener('click', openModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeAllocateModalBtn')?.addEventListener('click', closeAllocateModal);
    document.getElementById('cancelAllocateModalBtn')?.addEventListener('click', closeAllocateModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('bedForm')?.addEventListener('submit', saveBed);
    document.getElementById('allocateForm')?.addEventListener('submit', allocateBed);
    document.getElementById('wardFilter')?.addEventListener('change', () => renderBeds());
    document.getElementById('roomFilter')?.addEventListener('change', () => renderBeds());
    document.getElementById('statusFilter')?.addEventListener('change', () => renderBeds());
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        document.getElementById('wardFilter').value = '';
        document.getElementById('roomFilter').innerHTML = '<option value="">All Rooms</option>';
        document.getElementById('statusFilter').value = '';
        renderBeds();
    });
    
    document.getElementById('wardId')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('wardIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('roomId')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('roomIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('bedNumber')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('bedNumberError')?.classList.remove('show');
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

window.editBed = editBed;
window.deleteBed = deleteBed;
window.openAllocateModal = openAllocateModal;
window.dischargePatient = dischargePatient;
window.markAvailable = markAvailable;