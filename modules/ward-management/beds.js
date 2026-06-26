/**
 * Beds Management JS - Ward Management Module
 * Version: 3.0 - COMPLETE PROFESSIONAL UPGRADE
 * 
 * Features:
 * ✅ Full CRUD operations
 * ✅ Bed Allocation to patients
 * ✅ Discharge patients from beds
 * ✅ IPD record creation
 * ✅ Real-time occupancy updates
 * ✅ Ward/Room/Status filtering
 * ✅ Search functionality
 * ✅ Professional UI with stats
 */

let beds = [];
let wards = [];
let rooms = [];
let patients = [];
let ipdPatients = [];
let deleteTargetId = null;
let searchTerm = '';
let wardFilter = '';
let roomFilter = '';
let statusFilter = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────────────

function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        var d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function getBorderClass(status) {
    var map = {
        'Available': 'border-available',
        'Occupied': 'border-occupied',
        'Maintenance': 'border-maintenance'
    };
    return map[status] || 'border-available';
}

function getStatusIcon(status) {
    var map = {
        'Available': 'fa-check-circle',
        'Occupied': 'fa-user-circle',
        'Maintenance': 'fa-tools'
    };
    return map[status] || 'fa-circle';
}

// ─── Toast Notification ──────────────────────────────────────

function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    var colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a', warning: '#d4a853' };
    toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300';
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = '<div class="flex items-center gap-2"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle') + '"></i><span>' + esc(message) + '</span></div>';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

// ─── Data Management ──────────────────────────────────────────

function loadData() {
    try {
        wards = JSON.parse(localStorage.getItem('wards') || '[]');
        rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        ipdPatients = JSON.parse(localStorage.getItem('hms_ipd') || '[]');
        
        var stored = localStorage.getItem('beds');
        if (stored) {
            beds = JSON.parse(stored);
        } else {
            createSampleData();
        }
        
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading bed data:', error);
        showToast('Error loading bed data', 'error');
    }
}

function createSampleData() {
    var today = new Date().toISOString().split('T')[0];
    beds = [
        {id: 1, wardId: 1, wardName: 'ICU', roomId: 1, roomNumber: '101', bedNumber: '101A', bedType: 'ICU', status: 'Occupied', allocatedTo: 'Rajesh Kumar', allocatedPatientId: 1, admissionDate: today, admissionType: 'Emergency', features: 'Monitor, Ventilator, Oxygen supply'},
        {id: 2, wardId: 1, wardName: 'ICU', roomId: 1, roomNumber: '101', bedNumber: '101B', bedType: 'ICU', status: 'Available', features: 'Monitor, Ventilator'},
        {id: 3, wardId: 2, wardName: 'General Ward', roomId: 2, roomNumber: '201', bedNumber: '201A', bedType: 'Standard', status: 'Occupied', allocatedTo: 'Priya Sharma', allocatedPatientId: 2, admissionDate: today, admissionType: 'Elective', features: 'Side rails, Call bell'},
        {id: 4, wardId: 2, wardName: 'General Ward', roomId: 2, roomNumber: '201', bedNumber: '201B', bedType: 'Standard', status: 'Available', features: 'Side rails'},
        {id: 5, wardId: 2, wardName: 'General Ward', roomId: 3, roomNumber: '202', bedNumber: '202A', bedType: 'Standard', status: 'Available', features: 'Side rails, Call bell'},
        {id: 6, wardId: 3, wardName: 'Private Ward', roomId: 4, roomNumber: '301', bedNumber: '301', bedType: 'Electric', status: 'Available', features: 'AC, TV, Attached bathroom, Electric bed'},
        {id: 7, wardId: 4, wardName: 'Maternity Ward', roomId: 5, roomNumber: '401', bedNumber: '401A', bedType: 'Maternity', status: 'Occupied', allocatedTo: 'Neha Gupta', allocatedPatientId: 4, admissionDate: today, admissionType: 'Emergency', features: 'Baby crib, Breastfeeding support'},
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
    rooms.forEach(function(room) {
        var roomBeds = beds.filter(function(b) { return b.roomId === room.id; });
        var occupiedBeds = roomBeds.filter(function(b) { return b.status === 'Occupied'; }).length;
        var availableBeds = roomBeds.filter(function(b) { return b.status === 'Available'; }).length;
        
        var roomIndex = -1;
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].id === room.id) { roomIndex = i; break; }
        }
        if (roomIndex !== -1) {
            rooms[roomIndex].bedCount = roomBeds.length;
            rooms[roomIndex].availableBeds = availableBeds;
            rooms[roomIndex].occupiedBeds = occupiedBeds;
        }
    });
    localStorage.setItem('rooms', JSON.stringify(rooms));
}

function updateWardStats() {
    wards.forEach(function(ward) {
        var wardBeds = beds.filter(function(b) { return b.wardId === ward.id; });
        var totalBeds = wardBeds.length;
        var availableBeds = wardBeds.filter(function(b) { return b.status === 'Available'; }).length;
        var occupiedBeds = wardBeds.filter(function(b) { return b.status === 'Occupied'; }).length;
        
        var wardIndex = -1;
        for (var i = 0; i < wards.length; i++) {
            if (wards[i].id === ward.id) { wardIndex = i; break; }
        }
        if (wardIndex !== -1) {
            wards[wardIndex].totalBeds = totalBeds;
            wards[wardIndex].availableBeds = availableBeds;
            wards[wardIndex].occupiedBeds = occupiedBeds;
        }
    });
    localStorage.setItem('wards', JSON.stringify(wards));
}

// ─── Stats ─────────────────────────────────────────────────────────────

function updateStats() {
    var totalBeds = beds.length;
    var availableBeds = beds.filter(function(b) { return b.status === 'Available'; }).length;
    var occupiedBeds = beds.filter(function(b) { return b.status === 'Occupied'; }).length;
    
    document.getElementById('totalWards').textContent = wards.length;
    document.getElementById('totalRooms').textContent = rooms.length;
    document.getElementById('totalBeds').textContent = totalBeds;
    document.getElementById('availableBeds').textContent = availableBeds;
}

// ─── Populate Filters ───────────────────────────────────────────────

function populateFilters() {
    // Ward filter
    var wardSelect = document.getElementById('wardFilter');
    if (wardSelect) {
        var html = '<option value="">All Wards</option>';
        for (var i = 0; i < wards.length; i++) {
            html += '<option value="' + wards[i].id + '">' + esc(wards[i].name) + '</option>';
        }
        wardSelect.innerHTML = html;
    }
    
    // Ward select in modal
    var wardSelectModal = document.getElementById('wardId');
    if (wardSelectModal) {
        var html2 = '<option value="">-- Select Ward --</option>';
        for (var j = 0; j < wards.length; j++) {
            html2 += '<option value="' + wards[j].id + '">' + esc(wards[j].name) + '</option>';
        }
        wardSelectModal.innerHTML = html2;
        
        // Change event to populate rooms
        wardSelectModal.addEventListener('change', function() {
            var roomSelect = document.getElementById('roomId');
            var filteredRooms = rooms.filter(function(r) { return r.wardId === parseInt(this.value); });
            var html3 = '<option value="">-- Select Room --</option>';
            for (var k = 0; k < filteredRooms.length; k++) {
                html3 += '<option value="' + filteredRooms[k].id + '">' + esc(filteredRooms[k].roomNumber) + '</option>';
            }
            roomSelect.innerHTML = html3;
        });
    }
    
    // Room filter
    var roomFilterSelect = document.getElementById('roomFilter');
    if (roomFilterSelect) {
        var updateRoomFilter = function() {
            var selectedWard = document.getElementById('wardFilter').value;
            var filteredRooms = selectedWard ? rooms.filter(function(r) { return r.wardId === parseInt(selectedWard); }) : rooms;
            var html4 = '<option value="">All Rooms</option>';
            for (var l = 0; l < filteredRooms.length; l++) {
                html4 += '<option value="' + filteredRooms[l].id + '">' + esc(filteredRooms[l].roomNumber) + '</option>';
            }
            roomFilterSelect.innerHTML = html4;
        };
        document.getElementById('wardFilter').addEventListener('change', updateRoomFilter);
        updateRoomFilter();
    }
    
    // Patient select in allocate modal
    var patientSelect = document.getElementById('patientId');
    if (patientSelect) {
        // Get only patients not already admitted
        var admittedPatientIds = ipdPatients.filter(function(p) { return p.status === 'Admitted'; }).map(function(p) { return p.patientId; });
        var availablePatients = patients.filter(function(p) { return admittedPatientIds.indexOf(p.id) === -1; });
        
        var html5 = '<option value="">-- Select Patient --</option>';
        for (var m = 0; m < availablePatients.length; m++) {
            html5 += '<option value="' + availablePatients[m].id + '">' + esc(availablePatients[m].fullName) + ' (' + esc(availablePatients[m].phone) + ')</option>';
        }
        patientSelect.innerHTML = html5;
    }
}

// ─── Filter ──────────────────────────────────────────────────────────────

function getFilteredBeds() {
    var result = [];
    for (var i = 0; i < beds.length; i++) {
        var bed = beds[i];
        var matchesSearch = searchTerm === '' || 
            bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bed.allocatedTo && bed.allocatedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
            bed.wardName.toLowerCase().includes(searchTerm.toLowerCase());
        
        var matchesWard = wardFilter === '' || bed.wardId === parseInt(wardFilter);
        var matchesRoom = roomFilter === '' || bed.roomId === parseInt(roomFilter);
        var matchesStatus = statusFilter === '' || bed.status === statusFilter;
        
        if (matchesSearch && matchesWard && matchesRoom && matchesStatus) {
            result.push(bed);
        }
    }
    // Sort by bed number
    result.sort(function(a, b) { return a.bedNumber.localeCompare(b.bedNumber); });
    return result;
}

// ─── Render ──────────────────────────────────────────────────────────────

function renderBeds() {
    var grid = document.getElementById('bedsGrid');
    if (!grid) return;
    
    var filtered = getFilteredBeds();
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="beds-empty"><i class="fas fa-bed"></i><p>No beds found</p><p style="font-size:0.75rem; margin-top:0.25rem;">Try adjusting your search or filters.</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var bed = filtered[i];
        var borderClass = getBorderClass(bed.status);
        var statusIcon = getStatusIcon(bed.status);
        var statusClass = bed.status.toLowerCase();
        var isAvailable = bed.status === 'Available';
        var isOccupied = bed.status === 'Occupied';
        var isMaintenance = bed.status === 'Maintenance';
        
        html += '<div class="bed-card ' + borderClass + '" data-id="' + bed.id + '">';
        html += '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">';
        html += '<div><h3 class="bed-number">Bed ' + esc(bed.bedNumber) + '</h3>';
        html += '<p class="bed-location">' + esc(bed.wardName) + ' - Room ' + esc(bed.roomNumber) + '</p></div>';
        html += '<div style="display:flex; gap:0.25rem;">';
        html += '<button class="icon-btn-sm edit-btn" data-id="' + bed.id + '" title="Edit Bed"><i class="fas fa-pen"></i></button>';
        html += '<button class="icon-btn-sm danger delete-btn" data-id="' + bed.id + '" title="Delete Bed"><i class="fas fa-trash-alt"></i></button>';
        html += '</div></div>';
        
        html += '<div style="display:flex; flex-direction:column; gap:0.25rem; font-size:0.6875rem; flex:1;">';
        html += '<div class="bed-info-row"><span class="label">Bed Type:</span><span class="value">' + (bed.bedType || 'Standard') + '</span></div>';
        html += '<div class="bed-info-row"><span class="label">Status:</span><span class="status-' + statusClass + '"><i class="fas ' + statusIcon + '" style="font-size:0.5rem;"></i> ' + bed.status + '</span></div>';
        
        if (isOccupied) {
            html += '<div class="bed-info-row"><span class="label">Patient:</span><span class="value">' + esc(bed.allocatedTo || 'Unknown') + '</span></div>';
            html += '<div class="bed-info-row"><span class="label">Admitted:</span><span class="value" style="font-weight:var(--font-weight-light);">' + formatDate(bed.admissionDate) + '</span></div>';
            if (bed.admissionType) {
                html += '<div class="bed-info-row"><span class="label">Admission Type:</span><span class="value" style="font-weight:var(--font-weight-light);">' + bed.admissionType + '</span></div>';
            }
        }
        
        if (bed.features) {
            html += '<div class="bed-features">' + esc(bed.features) + '</div>';
        }
        html += '</div>';
        
        // Action Button
        html += '<div style="margin-top:0.75rem; padding-top:0.5rem; border-top:1px solid var(--border-default);">';
        if (isAvailable) {
            html += '<button class="bed-action-btn allocate allocate-btn" data-id="' + bed.id + '"><i class="fas fa-user-plus"></i> Allocate to Patient</button>';
        } else if (isOccupied) {
            html += '<button class="bed-action-btn discharge discharge-btn" data-id="' + bed.id + '"><i class="fas fa-download"></i> Discharge / Vacate</button>';
        } else {
            html += '<button class="bed-action-btn mark-available mark-btn" data-id="' + bed.id + '"><i class="fas fa-check"></i> Mark Available</button>';
        }
        html += '</div></div>';
    }
    grid.innerHTML = html;
    
    // Bind events
    grid.querySelectorAll('.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openEditModal(parseInt(this.dataset.id)); });
    });
    grid.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(parseInt(this.dataset.id)); });
    });
    grid.querySelectorAll('.allocate-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openAllocateModal(parseInt(this.dataset.id)); });
    });
    grid.querySelectorAll('.discharge-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { dischargePatient(parseInt(this.dataset.id)); });
    });
    grid.querySelectorAll('.mark-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { markAvailable(parseInt(this.dataset.id)); });
    });
}

function refreshUI() {
    updateStats();
    renderBeds();
}

// ─── Validation ─────────────────────────────────────────────────────────

function validateBedForm() {
    var isValid = true;
    var wardId = document.getElementById('wardId').value;
    var roomId = document.getElementById('roomId').value;
    var bedNumber = document.getElementById('bedNumber').value.trim();
    var status = document.getElementById('status').value;
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    
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

// ─── Modals ──────────────────────────────────────────────────────────────

function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}

function openAddModal() {
    document.getElementById('bedForm').reset();
    document.getElementById('bedId').value = '';
    document.getElementById('status').value = 'Available';
    document.getElementById('bedType').value = 'Standard';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-bed" style="color:var(--color-sage);"></i> Add Bed';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    populateFilters();
    openModal('bedModal');
}

function openEditModal(id) {
    var bed = null;
    for (var i = 0; i < beds.length; i++) {
        if (beds[i].id === id) { bed = beds[i]; break; }
    }
    if (!bed) return;
    
    document.getElementById('bedId').value = bed.id;
    document.getElementById('wardId').value = bed.wardId;
    
    // Trigger change event to populate rooms
    var event = new Event('change');
    document.getElementById('wardId').dispatchEvent(event);
    setTimeout(function() {
        document.getElementById('roomId').value = bed.roomId;
    }, 100);
    
    document.getElementById('bedNumber').value = bed.bedNumber;
    document.getElementById('bedType').value = bed.bedType || 'Standard';
    document.getElementById('status').value = bed.status;
    document.getElementById('features').value = bed.features || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Bed';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    openModal('bedModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

function openAllocateModal(bedId) {
    var bed = null;
    for (var i = 0; i < beds.length; i++) {
        if (beds[i].id === bedId) { bed = beds[i]; break; }
    }
    if (!bed) return;
    
    document.getElementById('allocateBedId').value = bedId;
    document.getElementById('allocateModalTitle').innerHTML = '<i class="fas fa-user-plus" style="color:var(--color-sage);"></i> Allocate Bed ' + bed.bedNumber + ' to Patient';
    document.getElementById('allocateForm').reset();
    populateFilters();
    openModal('allocateModal');
}

// ─── Save Bed ──────────────────────────────────────────────────────────

function saveBed(e) {
    e.preventDefault();
    if (!validateBedForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    var id = document.getElementById('bedId').value;
    var wardId = parseInt(document.getElementById('wardId').value);
    var roomId = parseInt(document.getElementById('roomId').value);
    var ward = null;
    for (var i = 0; i < wards.length; i++) {
        if (wards[i].id === wardId) { ward = wards[i]; break; }
    }
    var room = null;
    for (var j = 0; j < rooms.length; j++) {
        if (rooms[j].id === roomId) { room = rooms[j]; break; }
    }
    
    if (!ward || !room) {
        showToast('Invalid ward or room selection', 'error');
        return;
    }
    
    var data = {
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
        var index = -1;
        for (var k = 0; k < beds.length; k++) {
            if (beds[k].id === parseInt(id)) { index = k; break; }
        }
        if (index !== -1) {
            beds[index] = { ...beds[index], ...data };
            showToast('✅ Bed ' + data.bedNumber + ' updated successfully', 'success');
        }
    } else {
        var newId = beds.length > 0 ? Math.max(...beds.map(function(b) { return b.id; })) + 1 : 1;
        beds.push({ id: newId, ...data });
        showToast('✅ Bed ' + data.bedNumber + ' added successfully', 'success');
    }
    
    saveBeds();
    updateRoomStats();
    updateWardStats();
    refreshUI();
    closeModal('bedModal');
}

// ─── Allocate Bed ──────────────────────────────────────────────────────

function allocateBed(e) {
    e.preventDefault();
    
    var bedId = parseInt(document.getElementById('allocateBedId').value);
    var patientId = parseInt(document.getElementById('patientId').value);
    var admissionType = document.getElementById('admissionType').value;
    
    if (!patientId) {
        document.getElementById('patientIdError').classList.add('show');
        document.getElementById('patientId').classList.add('error');
        showToast('Please select a patient', 'error');
        return;
    }
    
    var patient = null;
    for (var i = 0; i < patients.length; i++) {
        if (patients[i].id === patientId) { patient = patients[i]; break; }
    }
    var bed = null;
    for (var j = 0; j < beds.length; j++) {
        if (beds[j].id === bedId) { bed = beds[j]; break; }
    }
    
    if (bed && patient) {
        if (bed.status !== 'Available') {
            showToast('This bed is not available for allocation', 'error');
            return;
        }
        
        // Check if patient already admitted
        var alreadyAdmitted = false;
        for (var k = 0; k < ipdPatients.length; k++) {
            if (ipdPatients[k].patientId === patientId && ipdPatients[k].status === 'Admitted') {
                alreadyAdmitted = true;
                break;
            }
        }
        if (alreadyAdmitted) {
            showToast('Patient ' + patient.fullName + ' is already admitted', 'error');
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
        
        showToast('✅ Bed ' + bed.bedNumber + ' allocated to ' + patient.fullName, 'success');
        createIPDRecord(bed, patient);
    }
}

function createIPDRecord(bed, patient) {
    try {
        var newId = ipdPatients.length > 0 ? Math.max(...ipdPatients.map(function(p) { return p.id; })) + 1 : 1;
        
        ipdPatients.push({
            id: newId,
            patientId: patient.id,
            patientName: patient.fullName,
            doctorName: '',
            wardId: bed.wardId,
            wardName: bed.wardName,
            roomId: bed.roomId,
            roomNumber: bed.roomNumber,
            bedId: bed.id,
            bedNumber: bed.bedNumber,
            admissionDate: bed.admissionDate,
            admissionType: bed.admissionType || 'General',
            diagnosis: '',
            status: 'Admitted',
            createdBy: 'System'
        });
        
        localStorage.setItem('hms_ipd', JSON.stringify(ipdPatients));
    } catch (error) {
        console.error('Error creating IPD record:', error);
    }
}

// ─── Discharge Patient ──────────────────────────────────────────────

function dischargePatient(bedId) {
    if (!confirm('Discharge this patient and vacate the bed?')) return;
    
    var bed = null;
    for (var i = 0; i < beds.length; i++) {
        if (beds[i].id === bedId) { bed = beds[i]; break; }
    }
    if (!bed) return;
    
    var patientName = bed.allocatedTo;
    var patientId = bed.allocatedPatientId;
    
    bed.status = 'Available';
    bed.allocatedTo = '';
    bed.allocatedPatientId = null;
    bed.admissionDate = '';
    bed.admissionType = '';
    
    // Update IPD record
    try {
        for (var j = 0; j < ipdPatients.length; j++) {
            if (ipdPatients[j].patientId === patientId && ipdPatients[j].status === 'Admitted') {
                ipdPatients[j].status = 'Discharged';
                ipdPatients[j].dischargeDate = new Date().toISOString().split('T')[0];
                break;
            }
        }
        localStorage.setItem('hms_ipd', JSON.stringify(ipdPatients));
    } catch (error) {
        console.error('Error updating IPD record:', error);
    }
    
    saveBeds();
    updateRoomStats();
    updateWardStats();
    refreshUI();
    
    showToast('✅ ' + patientName + ' discharged, bed vacated', 'success');
}

// ─── Mark Available ──────────────────────────────────────────────────

function markAvailable(bedId) {
    var bed = null;
    for (var i = 0; i < beds.length; i++) {
        if (beds[i].id === bedId) { bed = beds[i]; break; }
    }
    if (!bed) return;
    
    bed.status = 'Available';
    bed.allocatedTo = '';
    bed.allocatedPatientId = null;
    bed.admissionDate = '';
    bed.admissionType = '';
    
    saveBeds();
    updateRoomStats();
    updateWardStats();
    refreshUI();
    
    showToast('✅ Bed ' + bed.bedNumber + ' marked as available', 'success');
}

// ─── Delete ──────────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    var bed = null;
    for (var i = 0; i < beds.length; i++) {
        if (beds[i].id === deleteTargetId) { bed = beds[i]; break; }
    }
    
    beds = beds.filter(function(b) { return b.id !== deleteTargetId; });
    saveBeds();
    updateRoomStats();
    updateWardStats();
    refreshUI();
    closeModal('deleteModal');
    
    if (bed) {
        showToast('🗑️ Bed ' + bed.bedNumber + ' deleted successfully', 'success');
    }
    deleteTargetId = null;
}

// ─── Init ──────────────────────────────────────────────────────────────

function initBedsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    
    // Event Listeners
    document.getElementById('addBedBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn').addEventListener('click', function() { closeModal('bedModal'); });
    document.getElementById('cancelModalBtn').addEventListener('click', function() { closeModal('bedModal'); });
    document.getElementById('closeAllocateModalBtn').addEventListener('click', function() { closeModal('allocateModal'); });
    document.getElementById('cancelAllocateModalBtn').addEventListener('click', function() { closeModal('allocateModal'); });
    document.getElementById('closeDeleteModalBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('bedForm').addEventListener('submit', saveBed);
    document.getElementById('allocateForm').addEventListener('submit', allocateBed);
    
    document.getElementById('refreshBtn').addEventListener('click', function() { refreshUI(); showToast('Refreshed', 'info'); });
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        wardFilter = '';
        roomFilter = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('wardFilter').value = '';
        document.getElementById('roomFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderBeds();
        showToast('Filters reset', 'info');
    });
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderBeds();
    });
    
    document.getElementById('wardFilter').addEventListener('change', function(e) {
        wardFilter = e.target.value;
        renderBeds();
    });
    
    document.getElementById('roomFilter').addEventListener('change', function(e) {
        roomFilter = e.target.value;
        renderBeds();
    });
    
    document.getElementById('statusFilter').addEventListener('change', function(e) {
        statusFilter = e.target.value;
        renderBeds();
    });
    
    // Real-time validation
    document.getElementById('wardId').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('wardIdError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('roomId').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('roomIdError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('bedNumber').addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('bedNumberError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('status').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('statusError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('patientId').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('patientIdError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    // Close modals on overlay click
    document.getElementById('bedModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('bedModal');
    });
    document.getElementById('allocateModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('allocateModal');
    });
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('bedModal');
            closeModal('allocateModal');
            closeModal('deleteModal');
        }
    });
    
    console.log('🛏️ Beds Management Module initialized successfully');
}

// ─── Auto-init ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkReady = setInterval(function() {
        if (document.getElementById('mainSidebar') && document.getElementById('header-container')) {
            clearInterval(checkReady);
            initBedsModule();
        }
    }, 100);
    
    setTimeout(function() {
        if (!isInitialized) {
            initBedsModule();
        }
    }, 2000);
});

// ─── Expose for debugging ─────────────────────────────────────────────

window.bedsModule = {
    beds: beds,
    wards: wards,
    rooms: rooms,
    patients: patients,
    ipdPatients: ipdPatients,
    refreshUI: refreshUI,
    addBed: openAddModal,
    allocateBed: openAllocateModal,
    dischargePatient: dischargePatient
};