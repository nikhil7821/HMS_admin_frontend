/**
 * Beds Management JS - Ward Management Module
 * Uses theme.css for styling, clean event handling
 */

let beds = [];
let wards = [];
let rooms = [];
let patients = [];
let deleteTargetId = null;
let searchTerm = '';
let wardFilter = '';
let roomFilter = '';
let statusFilter = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getBorderClass(status) {
    const map = {
        'Available': 'border-available',
        'Occupied': 'border-occupied',
        'Maintenance': 'border-maintenance'
    };
    return map[status] || 'border-available';
}

function getStatusIcon(status) {
    const map = {
        'Available': 'fa-check-circle',
        'Occupied': 'fa-user-circle',
        'Maintenance': 'fa-tools'
    };
    return map[status] || 'fa-circle';
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        wards = JSON.parse(localStorage.getItem('wards') || '[]');
        rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        
        const stored = localStorage.getItem('beds');
        if (stored) {
            beds = JSON.parse(stored);
        } else {
            setIndianBeds();
        }
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading bed data:', error);
        if (window.showToast) {
            window.showToast('Error loading bed data', 'error');
        }
    }
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
    try {
        localStorage.setItem('beds', JSON.stringify(beds));
    } catch (error) {
        console.error('Error saving beds:', error);
    }
}

function updateRoomStats() {
    rooms.forEach(room => {
        const roomBeds = beds.filter(b => b.roomId === room.id);
        const availableBeds = roomBeds.filter(b => b.status === 'Available').length;
        const roomIndex = rooms.findIndex(r => r.id === room.id);
        if (roomIndex !== -1) {
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
        if (wardIndex !== -1) {
            wards[wardIndex].totalBeds = totalBeds;
            wards[wardIndex].availableBeds = availableBeds;
        }
    });
    localStorage.setItem('wards', JSON.stringify(wards));
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const totalBeds = beds.length;
    const availableBeds = beds.filter(b => b.status === 'Available').length;
    
    document.getElementById('totalWards').textContent = wards.length;
    document.getElementById('totalRooms').textContent = rooms.length;
    document.getElementById('totalBeds').textContent = totalBeds;
    document.getElementById('availableBeds').textContent = availableBeds;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredBeds() {
    return beds.filter(bed => {
        const matchesSearch = searchTerm === '' || 
            bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bed.allocatedTo && bed.allocatedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
            bed.wardName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesWard = wardFilter === '' || bed.wardId.toString() === wardFilter;
        const matchesRoom = roomFilter === '' || bed.roomId.toString() === roomFilter;
        const matchesStatus = statusFilter === '' || bed.status === statusFilter;
        
        return matchesSearch && matchesWard && matchesRoom && matchesStatus;
    });
}

// ─── Render ──────────────────────────────────────────

function renderBeds() {
    const grid = document.getElementById('bedsGrid');
    if (!grid) return;
    
    const filtered = getFilteredBeds();
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="beds-empty">
                <i class="fas fa-bed"></i>
                <p>No beds found</p>
                <p style="font-size:0.75rem; margin-top:0.25rem;">Try adjusting your search or filters.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(bed => {
        const borderClass = getBorderClass(bed.status);
        const statusIcon = getStatusIcon(bed.status);
        const statusClass = bed.status.toLowerCase();
        const isAvailable = bed.status === 'Available';
        const isOccupied = bed.status === 'Occupied';
        const isMaintenance = bed.status === 'Maintenance';
        
        return `
            <div class="bed-card ${borderClass}" data-id="${bed.id}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                    <div>
                        <h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem; margin:0;">Bed ${esc(bed.bedNumber)}</h3>
                        <p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">${esc(bed.wardName)} - Room ${esc(bed.roomNumber)}</p>
                    </div>
                    <div style="display:flex; gap:0.25rem;">
                        <button class="icon-btn-sm edit-btn" data-id="${bed.id}" title="Edit Bed">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="icon-btn-sm danger delete-btn" data-id="${bed.id}" title="Delete Bed">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:0.25rem; font-size:0.6875rem; flex:1;">
                    <div class="bed-info-row">
                        <span class="label">Bed Type:</span>
                        <span class="value">${bed.bedType || 'Standard'}</span>
                    </div>
                    <div class="bed-info-row">
                        <span class="label">Status:</span>
                        <span class="status-${statusClass}">
                            <i class="fas ${statusIcon}" style="font-size:0.5rem;"></i>
                            ${bed.status}
                        </span>
                    </div>
                    ${isOccupied ? `
                        <div class="bed-info-row">
                            <span class="label">Patient:</span>
                            <span class="value">${esc(bed.allocatedTo || 'Unknown')}</span>
                        </div>
                        <div class="bed-info-row">
                            <span class="label">Admitted:</span>
                            <span class="value" style="font-weight:var(--font-weight-light);">${bed.admissionDate || '-'}</span>
                        </div>
                    ` : ''}
                    ${bed.features ? `<div class="bed-features">${esc(bed.features)}</div>` : ''}
                </div>
                
                <!-- Action Button - Always at bottom -->
                <div style="margin-top:0.75rem; padding-top:0.5rem; border-top:1px solid var(--border-default);">
                    ${isAvailable ? `
                        <button class="bed-action-btn allocate allocate-btn" data-id="${bed.id}">
                            <i class="fas fa-user-plus"></i> Allocate to Patient
                        </button>
                    ` : isOccupied ? `
                        <button class="bed-action-btn discharge discharge-btn" data-id="${bed.id}">
                            <i class="fas fa-download"></i> Discharge / Vacate
                        </button>
                    ` : `
                        <button class="bed-action-btn mark-available mark-btn" data-id="${bed.id}">
                            <i class="fas fa-check"></i> Mark Available
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
    
    // Bind events
    grid.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });
    grid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
    grid.querySelectorAll('.allocate-btn').forEach(btn => {
        btn.addEventListener('click', () => openAllocateModal(parseInt(btn.dataset.id)));
    });
    grid.querySelectorAll('.discharge-btn').forEach(btn => {
        btn.addEventListener('click', () => dischargePatient(parseInt(btn.dataset.id)));
    });
    grid.querySelectorAll('.mark-btn').forEach(btn => {
        btn.addEventListener('click', () => markAvailable(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderBeds();
}

// ─── Filters Population ─────────────────────────────function populateFilters() {
    // Ward filter
    const wardSelect = document.getElementById('wardFilter');
    if (wardSelect) {
        wardSelect.innerHTML = '<option value="">All Wards</option>' + 
            wards.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('');
    }
    
    // Ward select in modal
    const wardSelectModal = document.getElementById('wardId');
    if (wardSelectModal) {
        wardSelectModal.innerHTML = '<option value="">-- Select Ward --</option>' + 
            wards.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('');
        wardSelectModal.addEventListener('change', function() {
            const roomSelect = document.getElementById('roomId');
            const filteredRooms = rooms.filter(r => r.wardId === parseInt(this.value));
            roomSelect.innerHTML = '<option value="">-- Select Room --</option>' + 
                filteredRooms.map(r => `<option value="${r.id}">${esc(r.roomNumber)}</option>`).join('');
        });
    }
    
    // Room filter
    const roomFilterSelect = document.getElementById('roomFilter');
    if (roomFilterSelect) {
        const updateRoomFilter = () => {
            const selectedWard = document.getElementById('wardFilter').value;
            const filteredRooms = selectedWard ? rooms.filter(r => r.wardId === parseInt(selectedWard)) : rooms;
            roomFilterSelect.innerHTML = '<option value="">All Rooms</option>' + 
                filteredRooms.map(r => `<option value="${r.id}">${esc(r.roomNumber)}</option>`).join('');
        };
        document.getElementById('wardFilter')?.addEventListener('change', updateRoomFilter);
        updateRoomFilter();
    }
    
    // Patient select in allocate modal
    const patientSelect = document.getElementById('patientId');
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${esc(p.fullName)} (${p.phone})</option>`).join('');
    }


// ─── Validation ──────────────────────────────────────

function validateBedForm() {
    let isValid = true;
    
    const wardId = document.getElementById('wardId').value;
    const roomId = document.getElementById('roomId').value;
    const bedNumber = document.getElementById('bedNumber').value.trim();
    const status = document.getElementById('status').value;
    
    // Reset errors
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    
    if (!wardId) {
        document.getElementById('wardIdError').classList.add('show');
        document.getElementById('wardId').classList.add('error');
        isValid = false;
    }
    
    if (!roomId) {
        document.getElementById('roomIdError').classList.add('show');
        document.getElementById('roomId').classList.add('error');
        isValid = false;
    }
    
    if (!bedNumber) {
        document.getElementById('bedNumberError').classList.add('show');
        document.getElementById('bedNumber').classList.add('error');
        isValid = false;
    }
    
    if (!status) {
        document.getElementById('statusError').classList.add('show');
        document.getElementById('status').classList.add('error');
        isValid = false;
    }
    
    return isValid;
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
    document.getElementById('bedForm').reset();
    document.getElementById('bedId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-bed"></i> Add Bed';
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    populateFilters();
    openModal('bedModal');
}

function openEditModal(id) {
    const bed = beds.find(b => b.id === id);
    if (bed) {
        document.getElementById('bedId').value = bed.id;
        document.getElementById('wardId').value = bed.wardId;
        // Trigger change event to populate rooms
        const event = new Event('change');
        document.getElementById('wardId').dispatchEvent(event);
        setTimeout(() => {
            document.getElementById('roomId').value = bed.roomId;
        }, 100);
        document.getElementById('bedNumber').value = bed.bedNumber;
        document.getElementById('bedType').value = bed.bedType || 'Standard';
        document.getElementById('status').value = bed.status;
        document.getElementById('features').value = bed.features || '';
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Bed';
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
        openModal('bedModal');
    }
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

function openAllocateModal(bedId) {
    const bed = beds.find(b => b.id === bedId);
    if (bed) {
        document.getElementById('allocateBedId').value = bedId;
        populateFilters();
        document.getElementById('allocateForm').reset();
        openModal('allocateModal');
    }
}

// ─── Form Submit - Bed ──────────────────────────────

function saveBed(e) {
    e.preventDefault();
    
    if (!validateBedForm()) {
        if (window.showToast) {
            window.showToast('Please fill all required fields', 'error');
        }
        return;
    }
    
    const id = document.getElementById('bedId').value;
    const wardId = parseInt(document.getElementById('wardId').value);
    const roomId = parseInt(document.getElementById('roomId').value);
    const ward = wards.find(w => w.id === wardId);
    const room = rooms.find(r => r.id === roomId);
    
    if (!ward || !room) {
        if (window.showToast) {
            window.showToast('Invalid ward or room selection', 'error');
        }
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
        features: document.getElementById('features').value.trim()
    };
    
    if (id) {
        const index = beds.findIndex(b => b.id === parseInt(id));
        if (index !== -1) {
            beds[index] = { ...beds[index], ...data };
            if (window.showToast) {
                window.showToast(`✅ Bed ${data.bedNumber} updated successfully`, 'success');
            }
        }
    } else {
        const newId = beds.length > 0 ? Math.max(...beds.map(b => b.id)) + 1 : 1;
        beds.push({ id: newId, ...data });
        if (window.showToast) {
            window.showToast(`✅ Bed ${data.bedNumber} added successfully`, 'success');
        }
    }
    
    saveBeds();
    updateRoomStats();
    updateWardStats();
    refreshUI();
    closeModal('bedModal');
}

// ─── Form Submit - Allocate ──────────────────────────

function allocateBed(e) {
    e.preventDefault();
    
    const bedId = parseInt(document.getElementById('allocateBedId').value);
    const patientId = parseInt(document.getElementById('patientId').value);
    const admissionType = document.getElementById('admissionType').value;
    
    if (!patientId) {
        if (window.showToast) {
            window.showToast('Please select a patient', 'error');
        }
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const bed = beds.find(b => b.id === bedId);
    
    if (bed && patient) {
        if (bed.status !== 'Available') {
            if (window.showToast) {
                window.showToast('This bed is not available for allocation', 'error');
            }
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
        refreshUI();
        closeModal('allocateModal');
        
        if (window.showToast) {
            window.showToast(`✅ Bed ${bed.bedNumber} allocated to ${patient.fullName}`, 'success');
        }
        
        createIPDRecord(bed, patient);
    }
}

function createIPDRecord(bed, patient) {
    try {
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
    } catch (error) {
        console.error('Error creating IPD record:', error);
    }
}

// ─── Actions ──────────────────────────────────────────

function dischargePatient(bedId) {
    if (confirm('Discharge this patient and vacate the bed?')) {
        const bed = beds.find(b => b.id === bedId);
        if (bed) {
            const patientName = bed.allocatedTo;
            bed.status = 'Available';
            bed.allocatedTo = '';
            bed.allocatedPatientId = null;
            bed.admissionDate = '';
            bed.admissionType = '';
            
            // Update IPD record
            try {
                let ipdPatients = JSON.parse(localStorage.getItem('hms_ipd') || '[]');
                const ipdIndex = ipdPatients.findIndex(p => p.patientId === bed.allocatedPatientId && p.status === 'Admitted');
                if (ipdIndex !== -1) {
                    ipdPatients[ipdIndex].status = 'Discharged';
                    ipdPatients[ipdIndex].dischargeDate = new Date().toISOString().split('T')[0];
                    localStorage.setItem('hms_ipd', JSON.stringify(ipdPatients));
                }
            } catch (error) {
                console.error('Error updating IPD record:', error);
            }
            
            saveBeds();
            updateRoomStats();
            updateWardStats();
            refreshUI();
            
            if (window.showToast) {
                window.showToast(`✅ ${patientName} discharged, bed vacated`, 'success');
            }
        }
    }
}

function markAvailable(bedId) {
    const bed = beds.find(b => b.id === bedId);
    if (bed) {
        bed.status = 'Available';
        bed.allocatedTo = '';
        bed.allocatedPatientId = null;
        bed.admissionDate = '';
        bed.admissionType = '';
        
        saveBeds();
        updateRoomStats();
        updateWardStats();
        refreshUI();
        
        if (window.showToast) {
            window.showToast(`✅ Bed ${bed.bedNumber} marked as available`, 'success');
        }
    }
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    const bed = beds.find(b => b.id === deleteTargetId);
    beds = beds.filter(b => b.id !== deleteTargetId);
    saveBeds();
    updateRoomStats();
    updateWardStats();
    refreshUI();
    closeModal('deleteModal');
    
    if (bed && window.showToast) {
        window.showToast(`🗑️ Bed ${bed.bedNumber} deleted successfully`, 'success');
    }
    deleteTargetId = null;
}

// ─── Init ────────────────────────────────────────────

function initBedsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('addBedBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('bedModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('bedModal'));
    document.getElementById('closeAllocateModalBtn')?.addEventListener('click', () => closeModal('allocateModal'));
    document.getElementById('cancelAllocateModalBtn')?.addEventListener('click', () => closeModal('allocateModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('bedForm')?.addEventListener('submit', saveBed);
    document.getElementById('allocateForm')?.addEventListener('submit', allocateBed);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        wardFilter = '';
        roomFilter = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('wardFilter').value = '';
        document.getElementById('roomFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderBeds();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderBeds();
    });
    
    document.getElementById('wardFilter')?.addEventListener('change', (e) => {
        wardFilter = e.target.value;
        renderBeds();
    });
    
    document.getElementById('roomFilter')?.addEventListener('change', (e) => {
        roomFilter = e.target.value;
        renderBeds();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderBeds();
    });
    
    // Real-time validation
    document.getElementById('wardId')?.addEventListener('change', function() {
        if (this.value) {
            document.getElementById('wardIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('roomId')?.addEventListener('change', function() {
        if (this.value) {
            document.getElementById('roomIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('bedNumber')?.addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('bedNumberError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('status')?.addEventListener('change', function() {
        if (this.value) {
            document.getElementById('statusError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    // Close modals on overlay click
    document.getElementById('bedModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('bedModal');
    });
    document.getElementById('allocateModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('allocateModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('bedModal');
            closeModal('allocateModal');
            closeModal('deleteModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initBedsModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initBedsModule();
    }, 3000);
});