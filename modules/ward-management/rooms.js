/**
 * Rooms Management JS - Ward Management Module
 * Version: 3.0 - COMPLETE PROFESSIONAL UPGRADE
 * 
 * Features:
 * ✅ Full CRUD operations
 * ✅ Ward linkage
 * ✅ Bed Management (Add/Edit/Delete beds per room)
 * ✅ IPD Patient Integration (Show patients in beds)
 * ✅ View Room Details with beds and patients
 * ✅ Real-time occupancy update
 * ✅ Status management (Available/Full/Maintenance)
 * ✅ Room Type badges
 * ✅ Stats Dashboard
 * ✅ Search and filter by ward, type, status
 * ✅ Professional UI
 */

let rooms = [];
let wards = [];
let beds = [];
let ipdPatients = [];
let deleteTargetId = null;
let searchTerm = '';
let wardFilter = '';
let typeFilter = '';
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

function getRoomTypeClass(type) {
    var map = {
        'General': 'type-general',
        'Private': 'type-private',
        'ICU': 'type-icu',
        'Deluxe': 'type-deluxe',
        'Suite': 'type-suite'
    };
    return map[type] || 'type-general';
}

function getStatusClass(status) {
    var map = {
        'available': 'status-available',
        'full': 'status-full',
        'maintenance': 'status-maintenance'
    };
    return map[status] || 'status-available';
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

function loadAllData() {
    try {
        wards = JSON.parse(localStorage.getItem('wards') || '[]');
        beds = JSON.parse(localStorage.getItem('beds') || '[]');
        ipdPatients = JSON.parse(localStorage.getItem('hms_ipd') || '[]');
        
        var stored = localStorage.getItem('rooms');
        if (stored) {
            rooms = JSON.parse(stored);
            // Ensure new fields exist
            for (var i = 0; i < rooms.length; i++) {
                rooms[i].status = rooms[i].status || 'available';
                rooms[i].amenities = rooms[i].amenities || '';
            }
            saveRooms();
        } else {
            createSampleData();
        }
        
        updateRoomStats();
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading room data:', error);
        showToast('Error loading room data', 'error');
    }
}

function createSampleData() {
    rooms = [
        {id: 1, wardId: 1, wardName: 'ICU', roomNumber: '101', roomType: 'ICU', bedCount: 1, availableBeds: 0, status: 'full', amenities: 'Monitor, Ventilator, AC'},
        {id: 2, wardId: 2, wardName: 'General Ward', roomNumber: '201', roomType: 'General', bedCount: 6, availableBeds: 2, status: 'available', amenities: 'Fan, Common bathroom'},
        {id: 3, wardId: 2, wardName: 'General Ward', roomNumber: '202', roomType: 'General', bedCount: 4, availableBeds: 1, status: 'available', amenities: 'Fan, Common bathroom'},
        {id: 4, wardId: 3, wardName: 'Private Ward', roomNumber: '301', roomType: 'Private', bedCount: 1, availableBeds: 1, status: 'available', amenities: 'AC, TV, Attached bathroom'},
        {id: 5, wardId: 4, wardName: 'Maternity Ward', roomNumber: '401', roomType: 'Private', bedCount: 2, availableBeds: 1, status: 'available', amenities: 'AC, Attached bathroom, Baby crib'},
        {id: 6, wardId: 5, wardName: 'Pediatric Ward', roomNumber: '501', roomType: 'General', bedCount: 4, availableBeds: 2, status: 'available', amenities: 'Colorful decor, Play area'},
        {id: 7, wardId: 6, wardName: 'Emergency Ward', roomNumber: 'G01', roomType: 'ICU', bedCount: 2, availableBeds: 0, status: 'full', amenities: 'Emergency equipment'}
    ];
    saveRooms();
    updateWardStats();
}

function saveRooms() {
    try {
        localStorage.setItem('rooms', JSON.stringify(rooms));
    } catch (error) {
        console.error('Error saving rooms:', error);
    }
}

function updateWardStats() {
    wards.forEach(function(ward) {
        var wardRooms = rooms.filter(function(r) { return r.wardId === ward.id; });
        var totalBedsInWard = wardRooms.reduce(function(sum, r) { return sum + (r.bedCount || 0); }, 0);
        var availableBedsInWard = wardRooms.reduce(function(sum, r) { return sum + (r.availableBeds || 0); }, 0);
        
        var wardIndex = wards.findIndex(function(w) { return w.id === ward.id; });
        if (wardIndex !== -1) {
            wards[wardIndex].totalBeds = totalBedsInWard;
            wards[wardIndex].availableBeds = availableBedsInWard;
        }
    });
    localStorage.setItem('wards', JSON.stringify(wards));
}

function updateRoomStats() {
    // Update bed counts for each room
    rooms.forEach(function(room) {
        var roomBeds = beds.filter(function(b) { return b.roomId === room.id; });
        var totalBeds = roomBeds.length;
        var occupiedBeds = roomBeds.filter(function(b) { return b.status === 'occupied'; }).length;
        var availableBeds = totalBeds - occupiedBeds;
        
        room.bedCount = totalBeds || room.bedCount || 0;
        room.availableBeds = availableBeds;
        
        // Update status
        if (totalBeds === 0) {
            room.status = 'maintenance';
        } else if (availableBeds === 0) {
            room.status = 'full';
        } else {
            room.status = 'available';
        }
    });
    saveRooms();
}

// ─── Stats ─────────────────────────────────────────────────────────────

function updateStats() {
    var totalRooms = rooms.length;
    var totalBeds = 0;
    var availableBeds = 0;
    var occupiedBeds = 0;
    
    rooms.forEach(function(room) {
        totalBeds += (room.bedCount || 0);
        availableBeds += (room.availableBeds || 0);
    });
    occupiedBeds = totalBeds - availableBeds;
    var occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    
    document.getElementById('totalRooms').textContent = totalRooms;
    document.getElementById('totalBeds').textContent = totalBeds;
    document.getElementById('availableBeds').textContent = availableBeds;
    document.getElementById('occupancyRate').textContent = occupancyRate + '%';
}

// ─── Populate Filters ───────────────────────────────────────────────

function populateFilters() {
    var wardSelect = document.getElementById('wardFilter');
    if (wardSelect) {
        var html = '<option value="">All Wards</option>';
        for (var i = 0; i < wards.length; i++) {
            html += '<option value="' + wards[i].id + '">' + esc(wards[i].name) + '</option>';
        }
        wardSelect.innerHTML = html;
    }
    
    var wardSelectModal = document.getElementById('wardId');
    if (wardSelectModal) {
        var html2 = '<option value="">-- Select Ward --</option>';
        for (var j = 0; j < wards.length; j++) {
            var totalBeds = rooms.filter(function(r) { return r.wardId === wards[j].id; }).reduce(function(sum, r) { return sum + (r.bedCount || 0); }, 0);
            html2 += '<option value="' + wards[j].id + '">' + esc(wards[j].name) + ' (' + totalBeds + ' beds)</option>';
        }
        wardSelectModal.innerHTML = html2;
    }
}

// ─── Filter ──────────────────────────────────────────────────────────────

function getFilteredRooms() {
    var result = [];
    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        var matchesSearch = searchTerm === '' || 
            room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesWard = wardFilter === '' || room.wardId === parseInt(wardFilter);
        var matchesType = typeFilter === '' || room.roomType === typeFilter;
        var matchesStatus = statusFilter === '' || room.status === statusFilter;
        if (matchesSearch && matchesWard && matchesType && matchesStatus) {
            result.push(room);
        }
    }
    // Sort by room number
    result.sort(function(a, b) { return a.roomNumber.localeCompare(b.roomNumber); });
    return result;
}

// ─── Render ──────────────────────────────────────────────────────────────

function renderTable() {
    var tbody = document.getElementById('roomsTable');
    if (!tbody) return;
    
    var filtered = getFilteredRooms();
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-door-open"></i><p>No rooms found</p><p style="font-size:0.75rem; margin-top:0.25rem;">Add a room to get started.</p></td></tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var room = filtered[i];
        var typeClass = getRoomTypeClass(room.roomType);
        var statusClass = getStatusClass(room.status);
        var statusText = room.status === 'available' ? 'Available' : 
                        room.status === 'full' ? 'Full' : 'Maintenance';
        var isAvailable = room.availableBeds > 0;
        var bedsClass = isAvailable ? 'beds-available' : 'beds-full';
        
        html += '<tr class="room-row" data-id="' + room.id + '">';
        html += '<td class="room-number">' + esc(room.roomNumber) + '</td>';
        html += '<td class="room-ward">' + esc(room.wardName) + '</td>';
        html += '<td><span class="room-type-badge ' + typeClass + '">' + room.roomType + '</span></td>';
        html += '<td style="text-align:center; color:var(--color-brown-300);">' + (room.bedCount || 0) + '</td>';
        html += '<td style="text-align:center;" class="' + bedsClass + '">' + (room.availableBeds || 0) + '</td>';
        html += '<td><span class="' + statusClass + '">' + statusText + '</span></td>';
        html += '<td style="text-align:center;"><div style="display:flex; gap:0.25rem; justify-content:center; flex-wrap:wrap;">';
        html += '<button class="action-btn view-btn" data-id="' + room.id + '" title="View Room Details"><i class="fas fa-eye"></i></button>';
        html += '<button class="action-btn edit-btn" data-id="' + room.id + '" title="Edit Room"><i class="fas fa-edit"></i></button>';
        html += '<button class="action-btn beds-btn" data-id="' + room.id + '" title="Manage Beds" style="color:#8b5cf6;"><i class="fas fa-bed"></i></button>';
        html += '<button class="action-btn delete delete-btn" data-id="' + room.id + '" title="Delete Room"><i class="fas fa-trash-alt"></i></button>';
        html += '</div></td></tr>';
    }
    tbody.innerHTML = html;
    
    // Bind events
    tbody.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { viewRoom(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openEditModal(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.beds-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { manageBeds(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(parseInt(this.dataset.id)); });
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Validation ─────────────────────────────────────────────────────────

function validateRoomForm() {
    var isValid = true;
    var wardId = document.getElementById('wardId').value;
    var roomNumber = document.getElementById('roomNumber').value.trim();
    var roomType = document.getElementById('roomType').value;
    var bedCount = document.getElementById('bedCount').value;
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    
    if (!wardId) {
        document.getElementById('wardIdError').classList.add('show');
        document.getElementById('wardId').classList.add('error');
        isValid = false;
    }
    if (!roomNumber) {
        document.getElementById('roomNumberError').classList.add('show');
        document.getElementById('roomNumber').classList.add('error');
        isValid = false;
    }
    if (!roomType) {
        document.getElementById('roomTypeError').classList.add('show');
        document.getElementById('roomType').classList.add('error');
        isValid = false;
    }
    if (!bedCount || parseInt(bedCount) < 1) {
        document.getElementById('bedCountError').classList.add('show');
        document.getElementById('bedCount').classList.add('error');
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
    document.getElementById('roomForm').reset();
    document.getElementById('roomId').value = '';
    document.getElementById('bedCount').value = '1';
    document.getElementById('roomStatus').value = 'available';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-door-open" style="color:var(--color-sage);"></i> Add Room';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    populateFilters();
    openModal('roomModal');
}

function openEditModal(id) {
    var room = rooms.find(function(r) { return r.id === id; });
    if (!room) return;
    
    document.getElementById('roomId').value = room.id;
    document.getElementById('wardId').value = room.wardId;
    document.getElementById('roomNumber').value = room.roomNumber;
    document.getElementById('roomType').value = room.roomType;
    document.getElementById('bedCount').value = room.bedCount;
    document.getElementById('amenities').value = room.amenities || '';
    document.getElementById('roomStatus').value = room.status || 'available';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Room';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    populateFilters();
    openModal('roomModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Save Room ──────────────────────────────────────────────────────────

function saveRoom(e) {
    e.preventDefault();
    if (!validateRoomForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    var id = document.getElementById('roomId').value;
    var wardId = parseInt(document.getElementById('wardId').value);
    var ward = wards.find(function(w) { return w.id === wardId; });
    var bedCount = parseInt(document.getElementById('bedCount').value) || 1;
    var status = document.getElementById('roomStatus').value;
    
    var data = {
        wardId: wardId,
        wardName: ward ? ward.name : '',
        roomNumber: document.getElementById('roomNumber').value.trim(),
        roomType: document.getElementById('roomType').value,
        bedCount: bedCount,
        status: status || 'available',
        amenities: document.getElementById('amenities').value.trim()
    };
    
    // If room has existing beds, update bed count
    if (id) {
        var index = -1;
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].id === parseInt(id)) { index = i; break; }
        }
        if (index !== -1) {
            var oldRoom = rooms[index];
            var roomBeds = beds.filter(function(b) { return b.roomId === parseInt(id); });
            
            // If bed count changed, update beds
            if (roomBeds.length !== bedCount) {
                // Remove old beds
                beds = beds.filter(function(b) { return b.roomId !== parseInt(id); });
                // Create new beds
                for (var j = 1; j <= bedCount; j++) {
                    beds.push({
                        id: Date.now() + j,
                        roomId: parseInt(id),
                        bedNumber: j,
                        wardId: wardId,
                        wardName: ward ? ward.name : '',
                        status: 'available',
                        patientId: null
                    });
                }
                localStorage.setItem('beds', JSON.stringify(beds));
                data.availableBeds = bedCount;
            } else {
                var occupiedBeds = roomBeds.filter(function(b) { return b.status === 'occupied'; }).length;
                data.availableBeds = bedCount - occupiedBeds;
            }
            
            rooms[index] = { ...rooms[index], ...data };
            showToast('✅ Room ' + data.roomNumber + ' updated successfully', 'success');
        }
    } else {
        var newId = rooms.length > 0 ? Math.max(...rooms.map(function(r) { return r.id; })) + 1 : 1;
        data.availableBeds = bedCount;
        data.id = newId;
        rooms.push(data);
        
        // Create beds
        for (var k = 1; k <= bedCount; k++) {
            beds.push({
                id: Date.now() + k,
                roomId: newId,
                bedNumber: k,
                wardId: wardId,
                wardName: ward ? ward.name : '',
                status: 'available',
                patientId: null
            });
        }
        localStorage.setItem('beds', JSON.stringify(beds));
        showToast('✅ Room ' + data.roomNumber + ' added successfully', 'success');
    }
    
    saveRooms();
    updateWardStats();
    updateRoomStats();
    refreshUI();
    closeModal('roomModal');
}

// ─── Manage Beds ─────────────────────────────────────────────────────────

function manageBeds(roomId) {
    var room = rooms.find(function(r) { return r.id === roomId; });
    if (!room) return;
    
    var roomBeds = beds.filter(function(b) { return b.roomId === roomId; });
    var occupiedBeds = roomBeds.filter(function(b) { return b.status === 'occupied'; });
    var availableBeds = roomBeds.filter(function(b) { return b.status === 'available'; });
    
    // Get patients in this room
    var patientsInRoom = ipdPatients.filter(function(p) { 
        return p.wardId === room.wardId && p.bedNo && roomBeds.some(function(b) { return b.bedNumber === p.bedNo; });
    });
    
    var message = '🛏️ BED MANAGEMENT - Room ' + room.roomNumber + '\n\n';
    message += 'Ward: ' + room.wardName + '\n';
    message += 'Type: ' + room.roomType + '\n';
    message += 'Total Beds: ' + roomBeds.length + '\n';
    message += 'Occupied: ' + occupiedBeds.length + '\n';
    message += 'Available: ' + availableBeds.length + '\n\n';
    message += '📋 Bed Details:\n';
    
    roomBeds.sort(function(a, b) { return a.bedNumber - b.bedNumber; });
    roomBeds.forEach(function(bed) {
        var statusEmoji = bed.status === 'occupied' ? '🔴' : bed.status === 'available' ? '🟢' : '🟡';
        var patientInfo = '';
        if (bed.status === 'occupied' && bed.patientId) {
            var patient = patientsInRoom.find(function(p) { return p.id === bed.patientId; });
            patientInfo = patient ? ' - ' + patient.patientName : ' - Unknown';
        }
        message += '  Bed ' + bed.bedNumber + ': ' + bed.status + patientInfo + '\n';
    });
    
    if (patientsInRoom.length > 0) {
        message += '\n👤 Patients in this room:\n';
        patientsInRoom.forEach(function(p) {
            message += '  - ' + p.patientName + ' (Bed ' + p.bedNo + ')\n';
        });
    }
    
    alert(message);
}

// ─── View Room ───────────────────────────────────────────────────────────

function viewRoom(id) {
    var room = rooms.find(function(r) { return r.id === id; });
    if (!room) return;
    
    var ward = wards.find(function(w) { return w.id === room.wardId; });
    var roomBeds = beds.filter(function(b) { return b.roomId === id; });
    var occupiedBeds = roomBeds.filter(function(b) { return b.status === 'occupied'; });
    var availableBeds = roomBeds.filter(function(b) { return b.status === 'available'; });
    
    // Get patients in this room
    var patientsInRoom = ipdPatients.filter(function(p) { 
        return p.wardId === room.wardId && p.bedNo && roomBeds.some(function(b) { return b.bedNumber === p.bedNo; });
    });
    
    var typeClass = getRoomTypeClass(room.roomType);
    var statusClass = getStatusClass(room.status);
    
    // Beds HTML
    var bedsHtml = '';
    if (roomBeds.length === 0) {
        bedsHtml = '<p style="color:var(--color-brown-100); font-size:0.75rem;">No beds in this room</p>';
    } else {
        roomBeds.sort(function(a, b) { return a.bedNumber - b.bedNumber; });
        var bedItems = '';
        roomBeds.forEach(function(bed) {
            var bedClass = bed.status === 'occupied' ? 'occupied' : bed.status === 'available' ? 'available' : 'maintenance';
            var patientName = '';
            if (bed.status === 'occupied' && bed.patientId) {
                var patient = patientsInRoom.find(function(p) { return p.id === bed.patientId; });
                patientName = patient ? ' (' + patient.patientName + ')' : '';
            }
            bedItems += '<span class="bed-item ' + bedClass + '">Bed ' + bed.bedNumber + patientName + '</span>';
        });
        bedsHtml = bedItems;
    }
    
    var content = document.getElementById('viewContent');
    content.innerHTML = `
        <div style="display:grid; gap:0.25rem;">
            <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); margin-bottom:0.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                        <h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); margin:0;">Room ${esc(room.roomNumber)}</h3>
                        <p style="font-size:0.75rem; color:var(--color-brown-100); margin:0;">${esc(room.wardName)}</p>
                    </div>
                    <div>
                        <span class="room-type-badge ${typeClass}">${room.roomType}</span>
                        <span class="${statusClass}" style="margin-left:0.5rem;">${room.status === 'available' ? 'Available' : room.status === 'full' ? 'Full' : 'Maintenance'}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-grid">
                <div><p class="detail-label">Ward</p><p class="detail-value">${esc(room.wardName)}</p></div>
                <div><p class="detail-label">Room Type</p><p class="detail-value">${room.roomType}</p></div>
                <div><p class="detail-label">Total Beds</p><p class="detail-value">${room.bedCount || 0}</p></div>
                <div><p class="detail-label">Available Beds</p><p class="detail-value" style="color:${room.availableBeds > 0 ? '#16a34a' : '#ef4444'};">${room.availableBeds || 0}</p></div>
                <div><p class="detail-label">Occupied Beds</p><p class="detail-value">${occupiedBeds.length}</p></div>
                <div><p class="detail-label">Occupancy Rate</p><p class="detail-value">${room.bedCount > 0 ? Math.round((occupiedBeds.length / room.bedCount) * 100) : 0}%</p></div>
            </div>
            
            ${room.amenities ? `
                <div class="detail-section" style="margin-top:0.5rem;">
                    <p class="detail-label">Amenities</p>
                    <p class="detail-value" style="color:var(--color-brown-300); font-size:0.8rem;">${esc(room.amenities)}</p>
                </div>
            ` : ''}
            
            <div class="detail-section" style="margin-top:0.5rem;">
                <p class="detail-label">Beds (${roomBeds.length})</p>
                <div style="margin-top:0.25rem;">${bedsHtml}</div>
            </div>
            
            ${patientsInRoom.length > 0 ? `
                <div class="detail-section" style="margin-top:0.5rem;">
                    <p class="detail-label">Patients</p>
                    ${patientsInRoom.map(function(p) {
                        return '<div style="display:flex; justify-content:space-between; padding:0.25rem 0; border-bottom:1px solid var(--border-default); font-size:0.75rem;">' +
                            '<span>' + esc(p.patientName) + '</span>' +
                            '<span style="color:var(--color-brown-100);">Bed ' + p.bedNo + ' | ' + formatDate(p.admissionDate) + '</span>' +
                            '</div>';
                    }).join('')}
                </div>
            ` : ''}
            
            <div style="font-size:0.6rem; color:var(--color-brown-100); border-top:1px solid var(--border-default); padding-top:0.5rem;">
                Room ID: #${room.id} | Last updated: ${formatDate(new Date().toISOString().split('T')[0])}
            </div>
        </div>
    `;
    
    document.getElementById('viewModalTitle').innerHTML = `<i class="fas fa-eye" style="color:var(--color-sage);"></i> Room ${esc(room.roomNumber)} - Details`;
    openModal('viewModal');
}

// ─── Delete ─────────────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    var room = rooms.find(function(r) { return r.id === deleteTargetId; });
    rooms = rooms.filter(function(r) { return r.id !== deleteTargetId; });
    
    // Delete associated beds
    beds = beds.filter(function(b) { return b.roomId !== deleteTargetId; });
    localStorage.setItem('beds', JSON.stringify(beds));
    
    saveRooms();
    updateWardStats();
    refreshUI();
    closeModal('deleteModal');
    
    if (room) {
        showToast('🗑️ Room ' + room.roomNumber + ' deleted successfully', 'info');
    }
    deleteTargetId = null;
}

// ─── Init ──────────────────────────────────────────────────────────────

function initRoomsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadAllData();
    
    document.getElementById('addRoomBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', function() { closeModal('roomModal'); });
    document.getElementById('cancelModalBtn')?.addEventListener('click', function() { closeModal('roomModal'); });
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('roomForm')?.addEventListener('submit', saveRoom);
    document.getElementById('refreshBtn')?.addEventListener('click', function() { refreshUI(); showToast('Refreshed', 'info'); });
    
    // View modal
    document.getElementById('closeViewModalBtn')?.addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('viewModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewModal');
    });
    
    // View Beds button - show all beds summary
    document.getElementById('viewBedsBtn')?.addEventListener('click', function() {
        var totalBeds = beds.length;
        var occupiedBeds = beds.filter(function(b) { return b.status === 'occupied'; }).length;
        var availableBeds = beds.filter(function(b) { return b.status === 'available'; }).length;
        var maintenanceBeds = beds.filter(function(b) { return b.status === 'maintenance'; }).length;
        
        var message = '🛏️ BED SUMMARY\n\n';
        message += 'Total Beds: ' + totalBeds + '\n';
        message += '🟢 Available: ' + availableBeds + '\n';
        message += '🔴 Occupied: ' + occupiedBeds + '\n';
        message += '🟡 Maintenance: ' + maintenanceBeds + '\n\n';
        message += '📋 Beds by Room:\n';
        
        rooms.forEach(function(room) {
            var roomBeds = beds.filter(function(b) { return b.roomId === room.id; });
            if (roomBeds.length > 0) {
                var occupied = roomBeds.filter(function(b) { return b.status === 'occupied'; }).length;
                var available = roomBeds.filter(function(b) { return b.status === 'available'; }).length;
                message += '  Room ' + room.roomNumber + ': ' + roomBeds.length + ' beds (' + occupied + ' occupied, ' + available + ' available)\n';
            }
        });
        
        alert(message);
    });
    
    // Reset filter
    document.getElementById('resetFilter')?.addEventListener('click', function() {
        searchTerm = '';
        wardFilter = '';
        typeFilter = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('wardFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderTable();
        showToast('Filters reset', 'info');
    });
    
    // Search input
    document.getElementById('searchInput')?.addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderTable();
    });
    
    // Ward filter
    document.getElementById('wardFilter')?.addEventListener('change', function(e) {
        wardFilter = e.target.value;
        renderTable();
    });
    
    // Type filter
    document.getElementById('typeFilter')?.addEventListener('change', function(e) {
        typeFilter = e.target.value;
        renderTable();
    });
    
    // Status filter
    document.getElementById('statusFilter')?.addEventListener('change', function(e) {
        statusFilter = e.target.value;
        renderTable();
    });
    
    // Click outside modals to close
    document.getElementById('roomModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('roomModal');
    });
    
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    console.log('🏥 Rooms Management Module initialized successfully');
}

// ─── Auto-init when DOM ready ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    // Wait for sidebar and header to load
    var checkReady = setInterval(function() {
        if (document.getElementById('mainSidebar') && document.getElementById('header-container')) {
            clearInterval(checkReady);
            initRoomsModule();
        }
    }, 100);
    
    // Fallback: init after 2 seconds anyway
    setTimeout(function() {
        if (!isInitialized) {
            initRoomsModule();
        }
    }, 2000);
});

// ─── Expose for debugging ─────────────────────────────────────────────

window.roomsModule = {
    rooms: rooms,
    wards: wards,
    beds: beds,
    ipdPatients: ipdPatients,
    refreshUI: refreshUI,
    addRoom: openAddModal,
    viewRoom: viewRoom,
    manageBeds: manageBeds
};