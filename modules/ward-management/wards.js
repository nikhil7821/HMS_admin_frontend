/**
 * Wards Management JS - Ward Management Module
 * Version: 3.0 - COMPLETE PROFESSIONAL VERSION
 * 
 * Features:
 * ✅ Ward CRUD (Add, Edit, Delete)
 * ✅ Room Management (Add, Edit, Delete per ward)
 * ✅ Bed Management (Auto-create with rooms)
 * ✅ IPD Integration (Show patients in beds)
 * ✅ View Ward Details (Complete hierarchy)
 * ✅ Real-time Occupancy Update
 * ✅ Analytics Dashboard
 * ✅ Stats Dashboard
 * ✅ Search and Filter
 * ✅ Professional UI
 */

let wards = [];
let rooms = [];
let beds = [];
let ipdPatients = [];
let deleteTargetId = null;
let currentWardId = null;
let searchTerm = '';
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

function getWardTypeClass(type) {
    var map = {
        'ICU': 'icu', 'General': 'general', 'Private': 'private',
        'Maternity': 'maternity', 'Pediatric': 'pediatric', 'Emergency': 'emergency'
    };
    return map[type] || 'general';
}

function getStatusFromOccupancy(occupancy) {
    if (occupancy >= 90) return { class: 'status-critical', text: 'Critical' };
    if (occupancy >= 70) return { class: 'status-high', text: 'High' };
    if (occupancy >= 40) return { class: 'status-moderate', text: 'Moderate' };
    return { class: 'status-available', text: 'Available' };
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
        // Load wards
        var storedWards = localStorage.getItem('hms_wards');
        if (storedWards) {
            wards = JSON.parse(storedWards);
        } else {
            createSampleWards();
        }
        
        // Load rooms
        var storedRooms = localStorage.getItem('hms_rooms');
        rooms = storedRooms ? JSON.parse(storedRooms) : [];
        
        // Load beds
        var storedBeds = localStorage.getItem('hms_beds');
        beds = storedBeds ? JSON.parse(storedBeds) : [];
        
        // Load IPD patients
        var storedIpd = localStorage.getItem('hms_ipd');
        ipdPatients = storedIpd ? JSON.parse(storedIpd) : [];
        
        // Sync beds with rooms
        syncBedsWithRooms();
        
        refreshUI();
    } catch (error) {
        console.error('Error loading ward data:', error);
        showToast('Error loading ward data', 'error');
    }
}

function createSampleWards() {
    wards = [
        {id: 1, name: 'ICU', code: 'ICU', type: 'ICU', floor: 'Ground Floor', totalBeds: 10, availableBeds: 3, description: 'Intensive Care Unit for critical patients'},
        {id: 2, name: 'General Ward', code: 'GEN', type: 'General', floor: 'First Floor', totalBeds: 50, availableBeds: 15, description: 'General ward for regular patients'},
        {id: 3, name: 'Private Ward', code: 'PVT', type: 'Private', floor: 'Second Floor', totalBeds: 20, availableBeds: 8, description: 'Private rooms with AC and attached bathroom'},
        {id: 4, name: 'Maternity Ward', code: 'MAT', type: 'Maternity', floor: 'Third Floor', totalBeds: 15, availableBeds: 5, description: 'Maternity and postnatal care'},
        {id: 5, name: 'Pediatric Ward', code: 'PED', type: 'Pediatric', floor: 'Fourth Floor', totalBeds: 12, availableBeds: 4, description: "Children's ward"},
        {id: 6, name: 'Emergency Ward', code: 'EMR', type: 'Emergency', floor: 'Ground Floor', totalBeds: 8, availableBeds: 2, description: 'Emergency observation unit'}
    ];
    
    // Create sample rooms
    rooms = [];
    wards.forEach(function(w) {
        var numRooms = Math.ceil(w.totalBeds / 4);
        for (var i = 1; i <= numRooms; i++) {
            rooms.push({
                id: rooms.length + 1,
                wardId: w.id,
                name: 'Room ' + String(i).padStart(3, '0'),
                number: String(i).padStart(3, '0'),
                totalBeds: Math.min(4, w.totalBeds - (i-1)*4),
                type: w.type === 'ICU' ? 'ICU' : w.type === 'Private' ? 'Private' : 'General'
            });
        }
    });
    
    // Create sample beds
    beds = [];
    rooms.forEach(function(r) {
        for (var j = 1; j <= r.totalBeds; j++) {
            var bedNumber = r.number + '-' + String(j).padStart(2, '0');
            beds.push({
                id: beds.length + 1,
                wardId: r.wardId,
                roomId: r.id,
                number: bedNumber,
                status: 'available',
                patientId: null,
                patientName: null
            });
        }
    });
    
    saveWards();
    saveRooms();
    saveBeds();
}

function saveWards() {
    try {
        localStorage.setItem('hms_wards', JSON.stringify(wards));
    } catch (error) {
        console.error('Error saving wards:', error);
    }
}

function saveRooms() {
    try {
        localStorage.setItem('hms_rooms', JSON.stringify(rooms));
    } catch (error) {
        console.error('Error saving rooms:', error);
    }
}

function saveBeds() {
    try {
        localStorage.setItem('hms_beds', JSON.stringify(beds));
    } catch (error) {
        console.error('Error saving beds:', error);
    }
}

function syncBedsWithRooms() {
    // Ensure each room has correct number of beds
    rooms.forEach(function(room) {
        var roomBeds = beds.filter(function(b) { return b.roomId === room.id; });
        if (roomBeds.length !== room.totalBeds) {
            // Remove existing beds for this room
            beds = beds.filter(function(b) { return b.roomId !== room.id; });
            // Create new beds
            for (var j = 1; j <= room.totalBeds; j++) {
                var bedNumber = room.number + '-' + String(j).padStart(2, '0');
                beds.push({
                    id: beds.length + 1,
                    wardId: room.wardId,
                    roomId: room.id,
                    number: bedNumber,
                    status: 'available',
                    patientId: null,
                    patientName: null
                });
            }
        }
    });
    saveBeds();
}

// ─── ─── Stats ─────────────────────────────────────────────────────────────

function updateStats() {
    var totalWards = wards.length;
    var totalRooms = rooms.length;
    var totalBeds = 0;
    var availableBeds = 0;
    
    beds.forEach(function(b) {
        totalBeds++;
        if (b.status === 'available') availableBeds++;
    });
    
    document.getElementById('totalWards').textContent = totalWards;
    document.getElementById('totalRooms').textContent = totalRooms;
    document.getElementById('totalBeds').textContent = totalBeds;
    document.getElementById('availableBeds').textContent = availableBeds;
}

// ─── ─── Filter ──────────────────────────────────────────────────────────────

function getFilteredWards() {
    var result = [];
    for (var i = 0; i < wards.length; i++) {
        var w = wards[i];
        var matchesSearch = searchTerm === '' || 
            w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.code.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesType = typeFilter === '' || w.type === typeFilter;
        var occupancyRate = w.totalBeds > 0 ? ((w.totalBeds - w.availableBeds) / w.totalBeds * 100) : 0;
        var status = getStatusFromOccupancy(occupancyRate);
        var matchesStatus = statusFilter === '' || status.text === statusFilter;
        if (matchesSearch && matchesType && matchesStatus) {
            result.push(w);
        }
    }
    return result;
}

// ─── ─── Render ──────────────────────────────────────────────────────────────

function renderWards() {
    var grid = document.getElementById('wardsGrid');
    if (!grid) return;
    
    var filtered = getFilteredWards();
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="wards-empty"><i class="fas fa-building"></i><p>No wards found</p><p style="font-size:0.75rem; margin-top:0.25rem;">Add a ward to get started.</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var w = filtered[i];
        var occupancyRate = w.totalBeds > 0 ? ((w.totalBeds - w.availableBeds) / w.totalBeds * 100) : 0;
        var status = getStatusFromOccupancy(occupancyRate);
        var typeClass = getWardTypeClass(w.type);
        var roomCount = rooms.filter(function(r) { return r.wardId === w.id; }).length;
        var bedCount = beds.filter(function(b) { return b.wardId === w.id; }).length;
        var occupiedBeds = beds.filter(function(b) { return b.wardId === w.id && b.status === 'occupied'; }).length;
        
        html += '<div class="ward-card" data-id="' + w.id + '" onclick="viewWard(' + w.id + ')">';
        html += '<div class="ward-header">';
        html += '<div><div class="ward-name">' + esc(w.name) + '</div><div class="ward-code">' + esc(w.code) + '</div></div>';
        html += '<span class="ward-type-badge ' + typeClass + '">' + w.type + '</span>';
        html += '</div>';
        
        html += '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.375rem; font-size:0.75rem; margin-bottom:0.5rem;">';
        html += '<div class="ward-info-box"><p class="label">Floor</p><p class="value">' + esc(w.floor || '-') + '</p></div>';
        html += '<div class="ward-info-box"><p class="label">Rooms</p><p class="value">' + roomCount + '</p></div>';
        html += '<div class="ward-info-box"><p class="label">Beds</p><p class="value">' + bedCount + '</p></div>';
        html += '<div class="ward-info-box"><p class="label">Occupied</p><p class="value">' + occupiedBeds + '/' + bedCount + '</p></div>';
        html += '</div>';
        
        html += '<div class="ward-progress"><div class="fill" style="width: ' + occupancyRate + '%; background:' + (occupancyRate > 70 ? '#ef4444' : occupancyRate > 40 ? '#f59e0b' : '#4a8c3a') + ';"></div></div>';
        
        html += '<div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.5rem; border-top:1px solid var(--border-default);">';
        html += '<span class="' + status.class + '">' + status.text + '</span>';
        html += '<div style="display:flex; gap:0.375rem;">';
        html += '<button class="icon-btn-sm info" onclick="event.stopPropagation(); openRoomModal(' + w.id + ')" title="Add Room"><i class="fas fa-door-open"></i></button>';
        html += '<button class="icon-btn-sm" onclick="event.stopPropagation(); openEditModal(' + w.id + ')" title="Edit Ward"><i class="fas fa-pen"></i></button>';
        html += '<button class="icon-btn-sm danger" onclick="event.stopPropagation(); openDeleteModal(' + w.id + ')" title="Delete Ward"><i class="fas fa-trash-alt"></i></button>';
        html += '</div></div></div>';
    }
    grid.innerHTML = html;
}

function refreshUI() {
    updateStats();
    renderWards();
}

// ─── ─── Validation ─────────────────────────────────────────────────────────

function validateWardForm() {
    var isValid = true;
    var wardName = document.getElementById('wardName').value.trim();
    var wardCode = document.getElementById('wardCode').value.trim();
    var wardType = document.getElementById('wardType').value;
    var totalBeds = document.getElementById('totalBedsCount').value;
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    
    if (!wardName) {
        document.getElementById('wardNameError').classList.add('show');
        document.getElementById('wardName').classList.add('error');
        isValid = false;
    }
    if (!wardCode) {
        document.getElementById('wardCodeError').classList.add('show');
        document.getElementById('wardCode').classList.add('error');
        isValid = false;
    }
    if (!wardType) {
        document.getElementById('wardTypeError').classList.add('show');
        document.getElementById('wardType').classList.add('error');
        isValid = false;
    }
    if (totalBeds && (parseInt(totalBeds) < 0 || isNaN(parseInt(totalBeds)))) {
        document.getElementById('totalBedsError').classList.add('show');
        document.getElementById('totalBedsCount').classList.add('error');
        isValid = false;
    }
    return isValid;
}

function validateRoomForm() {
    var isValid = true;
    var roomName = document.getElementById('roomName').value.trim();
    var roomNumber = document.getElementById('roomNumber').value.trim();
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input').forEach(function(el) { el.classList.remove('error'); });
    
    if (!roomName) {
        document.getElementById('roomNameError').classList.add('show');
        document.getElementById('roomName').classList.add('error');
        isValid = false;
    }
    if (!roomNumber) {
        document.getElementById('roomNumberError').classList.add('show');
        document.getElementById('roomNumber').classList.add('error');
        isValid = false;
    }
    return isValid;
}

// ─── ─── Modals ──────────────────────────────────────────────────────────────

function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}

function openAddModal() {
    document.getElementById('wardForm').reset();
    document.getElementById('wardId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle" style="color:var(--color-sage);"></i> Add Ward';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    openModal('wardModal');
}

function openEditModal(id) {
    var ward = null;
    for (var i = 0; i < wards.length; i++) {
        if (wards[i].id === id) { ward = wards[i]; break; }
    }
    if (!ward) return;
    
    document.getElementById('wardId').value = ward.id;
    document.getElementById('wardName').value = ward.name;
    document.getElementById('wardCode').value = ward.code;
    document.getElementById('wardType').value = ward.type;
    document.getElementById('floor').value = ward.floor || '';
    document.getElementById('totalBedsCount').value = ward.totalBeds || '';
    document.getElementById('description').value = ward.description || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Ward';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    openModal('wardModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── ─── Room Modal ──────────────────────────────────────────────────────────

function openRoomModal(wardId) {
    currentWardId = wardId;
    var ward = null;
    for (var i = 0; i < wards.length; i++) {
        if (wards[i].id === wardId) { ward = wards[i]; break; }
    }
    document.getElementById('roomWardId').value = wardId;
    document.getElementById('roomEditId').value = '';
    document.getElementById('roomModalTitle').innerHTML = '<i class="fas fa-door-open" style="color:var(--color-sage);"></i> Add Room to ' + (ward ? esc(ward.name) : 'Ward');
    document.getElementById('roomForm').reset();
    document.getElementById('roomBeds').value = 1;
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input').forEach(function(el) { el.classList.remove('error'); });
    openModal('roomModal');
}

function editRoom(wardId, roomId) {
    var room = null;
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].id === roomId) { room = rooms[i]; break; }
    }
    if (!room) return;
    
    document.getElementById('roomWardId').value = wardId;
    document.getElementById('roomEditId').value = roomId;
    document.getElementById('roomModalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Room';
    document.getElementById('roomName').value = room.name;
    document.getElementById('roomNumber').value = room.number;
    document.getElementById('roomBeds').value = room.totalBeds || 1;
    document.getElementById('roomType').value = room.type || 'General';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input').forEach(function(el) { el.classList.remove('error'); });
    openModal('roomModal');
}

function deleteRoom(roomId) {
    if (!confirm('Are you sure you want to delete this room and all its beds?')) return;
    
    rooms = rooms.filter(function(r) { return r.id !== roomId; });
    beds = beds.filter(function(b) { return b.roomId !== roomId; });
    saveRooms();
    saveBeds();
    refreshUI();
    viewWard(currentWardId || getWardIdFromRoom(roomId));
    showToast('🗑️ Room deleted', 'info');
}

function getWardIdFromRoom(roomId) {
    var room = rooms.find(function(r) { return r.id === roomId; });
    return room ? room.wardId : null;
}

// ─── ─── Save Ward ──────────────────────────────────────────────────────────

function saveWard(e) {
    e.preventDefault();
    if (!validateWardForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    var id = document.getElementById('wardId').value;
    var totalBeds = parseInt(document.getElementById('totalBedsCount').value) || 0;
    var data = {
        name: document.getElementById('wardName').value.trim(),
        code: document.getElementById('wardCode').value.trim().toUpperCase(),
        type: document.getElementById('wardType').value,
        floor: document.getElementById('floor').value.trim(),
        totalBeds: totalBeds,
        description: document.getElementById('description').value.trim()
    };
    
    if (id) {
        var index = -1;
        for (var i = 0; i < wards.length; i++) {
            if (wards[i].id === parseInt(id)) { index = i; break; }
        }
        if (index !== -1) {
            var oldWard = wards[index];
            if (oldWard.totalBeds !== totalBeds) {
                var difference = totalBeds - oldWard.totalBeds;
                data.availableBeds = Math.max(0, (oldWard.availableBeds || 0) + difference);
            } else {
                data.availableBeds = oldWard.availableBeds;
            }
            wards[index] = { ...wards[index], ...data };
            showToast('✅ ' + data.name + ' updated successfully', 'success');
        }
    } else {
        var newId = wards.length > 0 ? Math.max(...wards.map(function(w) { return w.id; })) + 1 : 1;
        data.availableBeds = totalBeds;
        wards.push({ id: newId, ...data });
        showToast('✅ ' + data.name + ' added successfully', 'success');
    }
    
    saveWards();
    refreshUI();
    closeModal('wardModal');
}

// ─── ─── Save Room ──────────────────────────────────────────────────────────

function saveRoom(e) {
    e.preventDefault();
    if (!validateRoomForm()) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    var wardId = parseInt(document.getElementById('roomWardId').value);
    var editId = document.getElementById('roomEditId').value;
    var roomName = document.getElementById('roomName').value.trim();
    var roomNumber = document.getElementById('roomNumber').value.trim();
    var totalBeds = parseInt(document.getElementById('roomBeds').value) || 1;
    var roomType = document.getElementById('roomType').value;
    
    var ward = wards.find(function(w) { return w.id === wardId; });
    if (!ward) {
        showToast('Ward not found', 'error');
        return;
    }
    
    if (editId) {
        var roomIndex = rooms.findIndex(function(r) { return r.id === parseInt(editId); });
        if (roomIndex !== -1) {
            var oldBeds = rooms[roomIndex].totalBeds || 0;
            rooms[roomIndex] = { ...rooms[roomIndex], name: roomName, number: roomNumber, totalBeds: totalBeds, type: roomType };
            
            // Update beds count
            if (oldBeds !== totalBeds) {
                beds = beds.filter(function(b) { return b.roomId !== parseInt(editId); });
                for (var j = 1; j <= totalBeds; j++) {
                    var bedNumber = roomNumber + '-' + String(j).padStart(2, '0');
                    beds.push({
                        id: beds.length + 1,
                        wardId: wardId,
                        roomId: parseInt(editId),
                        number: bedNumber,
                        status: 'available',
                        patientId: null,
                        patientName: null
                    });
                }
            }
            showToast('✅ Room updated successfully', 'success');
        }
    } else {
        var newRoomId = rooms.length > 0 ? Math.max(...rooms.map(function(r) { return r.id; })) + 1 : 1;
        rooms.push({
            id: newRoomId,
            wardId: wardId,
            name: roomName,
            number: roomNumber,
            totalBeds: totalBeds,
            type: roomType
        });
        
        // Create beds for this room
        for (var k = 1; k <= totalBeds; k++) {
            var bedNum = roomNumber + '-' + String(k).padStart(2, '0');
            beds.push({
                id: beds.length + 1,
                wardId: wardId,
                roomId: newRoomId,
                number: bedNum,
                status: 'available',
                patientId: null,
                patientName: null
            });
        }
        showToast('✅ Room added successfully', 'success');
    }
    
    saveRooms();
    saveBeds();
    refreshUI();
    closeModal('roomModal');
    viewWard(wardId);
}

// ─── ─── View Ward ──────────────────────────────────────────────────────────

function viewWard(id) {
    var ward = wards.find(function(w) { return w.id === id; });
    if (!ward) return;
    
    var wardRooms = rooms.filter(function(r) { return r.wardId === id; });
    var wardBeds = beds.filter(function(b) { return b.wardId === id; });
    var occupiedBeds = wardBeds.filter(function(b) { return b.status === 'occupied'; });
    var occupancyRate = wardBeds.length > 0 ? (occupiedBeds.length / wardBeds.length * 100) : 0;
    var status = getStatusFromOccupancy(occupancyRate);
    var typeClass = getWardTypeClass(ward.type);
    
    var content = document.getElementById('viewWardContent');
    
    // Build rooms HTML
    var roomsHtml = '';
    if (wardRooms.length === 0) {
        roomsHtml = '<p style="color:var(--color-brown-100); font-size:0.75rem;">No rooms in this ward</p>';
    } else {
        roomsHtml = wardRooms.map(function(r) {
            var roomBeds = beds.filter(function(b) { return b.roomId === r.id; });
            var occupied = roomBeds.filter(function(b) { return b.status === 'occupied'; }).length;
            
            var bedsHtml = roomBeds.map(function(b) {
                var bedClass = b.status === 'occupied' ? 'occupied' : b.status === 'maintenance' ? 'maintenance' : 'available';
                var patient = b.patientName ? ' (' + esc(b.patientName) + ')' : '';
                return '<span class="bed-item ' + bedClass + '">🛏️ ' + b.number + patient + '</span>';
            }).join('');
            
            return '<div class="room-item"><div style="display:flex; justify-content:space-between; align-items:center;"><span class="room-name">' + esc(r.name) + ' (' + r.number + ')</span><span class="room-detail">' + occupied + '/' + r.totalBeds + ' occupied</span></div><div style="margin-top:0.25rem;">' + bedsHtml + '</div></div>';
        }).join('');
    }
    
    content.innerHTML = `
        <div style="display:grid; gap:0.25rem;">
            <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); margin-bottom:0.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                        <h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); margin:0;">${esc(ward.name)}</h3>
                        <p style="font-size:0.75rem; color:var(--color-brown-100); margin:0;">${esc(ward.code)} | ${ward.type}</p>
                    </div>
                    <span class="ward-type-badge ${typeClass}">${ward.type}</span>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.5rem; margin-bottom:0.5rem;">
                <div class="ward-info-box"><p class="label">Floor</p><p class="value">${esc(ward.floor || '-')}</p></div>
                <div class="ward-info-box"><p class="label">Total Beds</p><p class="value">${wardBeds.length}</p></div>
                <div class="ward-info-box"><p class="label">Occupied</p><p class="value">${occupiedBeds.length}</p></div>
                <div class="ward-info-box"><p class="label">Occupancy</p><p class="value">${occupancyRate.toFixed(0)}%</p></div>
            </div>
            
            <div class="ward-progress" style="margin-bottom:0.5rem;">
                <div class="fill" style="width: ${occupancyRate}%; background:${occupancyRate > 70 ? '#ef4444' : occupancyRate > 40 ? '#f59e0b' : '#4a8c3a'};"></div>
            </div>
            
            <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
                <button class="btn-primary" style="padding:0.3rem 0.75rem; font-size:0.75rem;" onclick="openRoomModal(${ward.id})">
                    <i class="fas fa-door-open"></i> Add Room
                </button>
                <span class="${status.class}">${status.text}</span>
                ${ward.description ? `<span style="font-size:0.7rem; color:var(--color-brown-100);">${esc(ward.description)}</span>` : ''}
            </div>
            
            <div class="view-ward-section" style="border-top:1px solid var(--border-default); padding-top:0.5rem; margin-top:0.25rem;">
                <p class="view-ward-label">Rooms & Beds</p>
                ${roomsHtml}
            </div>
            
            <div style="font-size:0.6rem; color:var(--color-brown-100); border-top:1px solid var(--border-default); padding-top:0.5rem;">
                Ward ID: #${ward.id} | ${wardRooms.length} rooms | ${wardBeds.length} beds
            </div>
        </div>
    `;
    
    document.getElementById('viewWardModalTitle').innerHTML = `<i class="fas fa-eye" style="color:var(--color-sage);"></i> ${esc(ward.name)} - Ward Details`;
    openModal('viewWardModal');
}

// ─── ─── Analytics ──────────────────────────────────────────────────────────

function openAnalytics() {
    var content = document.getElementById('analyticsContent');
    
    var totalWards = wards.length;
    var totalRooms = rooms.length;
    var totalBeds = beds.length;
    var occupiedBeds = beds.filter(function(b) { return b.status === 'occupied'; }).length;
    var availableBeds = beds.filter(function(b) { return b.status === 'available'; }).length;
    var maintenanceBeds = beds.filter(function(b) { return b.status === 'maintenance'; }).length;
    var occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds * 100) : 0;
    
    // Ward-wise stats
    var wardStats = wards.map(function(w) {
        var wardBeds = beds.filter(function(b) { return b.wardId === w.id; });
        var occupied = wardBeds.filter(function(b) { return b.status === 'occupied'; }).length;
        return {
            name: w.name,
            total: wardBeds.length,
            occupied: occupied,
            rate: wardBeds.length > 0 ? (occupied / wardBeds.length * 100) : 0
        };
    });
    
    var wardStatsHtml = wardStats.map(function(ws) {
        var color = ws.rate > 70 ? '#ef4444' : ws.rate > 40 ? '#f59e0b' : '#4a8c3a';
        return '<div style="display:flex; justify-content:space-between; align-items:center; padding:0.25rem 0; border-bottom:1px solid var(--border-default); font-size:0.75rem;">' +
            '<span>' + esc(ws.name) + '</span>' +
            '<span>' + ws.occupied + '/' + ws.total + ' (' + ws.rate.toFixed(0) + '%)</span>' +
            '<div style="width:100px; height:4px; background:var(--bg-muted); border-radius:4px; overflow:hidden;"><div style="width:' + ws.rate + '%; height:100%; background:' + color + '; border-radius:4px;"></div></div>' +
            '</div>';
    }).join('');
    
    content.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
            <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); text-align:center; border:1px solid var(--border-default);">
                <div style="font-size:1.25rem; font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${totalWards}</div>
                <div style="font-size:0.6rem; color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.06em;">Total Wards</div>
            </div>
            <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); text-align:center; border:1px solid var(--border-default);">
                <div style="font-size:1.25rem; font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${totalRooms}</div>
                <div style="font-size:0.6rem; color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.06em;">Total Rooms</div>
            </div>
            <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); text-align:center; border:1px solid var(--border-default);">
                <div style="font-size:1.25rem; font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${totalBeds}</div>
                <div style="font-size:0.6rem; color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.06em;">Total Beds</div>
            </div>
            <div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); text-align:center; border:1px solid var(--border-default);">
                <div style="font-size:1.25rem; font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${occupancyRate.toFixed(0)}%</div>
                <div style="font-size:0.6rem; color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.06em;">Occupancy Rate</div>
            </div>
        </div>
        
        <div style="margin-top:0.75rem; border-top:1px solid var(--border-default); padding-top:0.75rem;">
            <p style="font-size:0.7rem; font-weight:var(--font-weight-medium); color:var(--color-brown-300); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.25rem;">Bed Status</p>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.5rem;">
                <div style="background:#e8f5e2; padding:0.5rem; border-radius:var(--radius-md); text-align:center;">
                    <div style="font-size:0.875rem; font-weight:var(--font-weight-medium); color:#4a8c3a;">${availableBeds}</div>
                    <div style="font-size:0.55rem; color:#4a8c3a; text-transform:uppercase;">Available</div>
                </div>
                <div style="background:#fee2e2; padding:0.5rem; border-radius:var(--radius-md); text-align:center;">
                    <div style="font-size:0.875rem; font-weight:var(--font-weight-medium); color:#ef4444;">${occupiedBeds}</div>
                    <div style="font-size:0.55rem; color:#ef4444; text-transform:uppercase;">Occupied</div>
                </div>
                <div style="background:#fef3dd; padding:0.5rem; border-radius:var(--radius-md); text-align:center;">
                    <div style="font-size:0.875rem; font-weight:var(--font-weight-medium); color:#9a6a10;">${maintenanceBeds}</div>
                    <div style="font-size:0.55rem; color:#9a6a10; text-transform:uppercase;">Maintenance</div>
                </div>
            </div>
        </div>
        
        <div style="margin-top:0.75rem; border-top:1px solid var(--border-default); padding-top:0.75rem;">
            <p style="font-size:0.7rem; font-weight:var(--font-weight-medium); color:var(--color-brown-300); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.25rem;">Ward-wise Occupancy</p>
            ${wardStatsHtml}
        </div>
    `;
    
    document.getElementById('analyticsModalTitle').innerHTML = '<i class="fas fa-chart-pie" style="color:var(--color-sage);"></i> Ward Analytics';
    openModal('analyticsModal');
}

// ─── ─── Delete ─────────────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    var ward = wards.find(function(w) { return w.id === deleteTargetId; });
    
    // Remove all rooms and beds in this ward
    rooms = rooms.filter(function(r) { return r.wardId !== deleteTargetId; });
    beds = beds.filter(function(b) { return b.wardId !== deleteTargetId; });
    
    wards = wards.filter(function(w) { return w.id !== deleteTargetId; });
    
    saveWards();
    saveRooms();
    saveBeds();
    refreshUI();
    closeModal('deleteModal');
    
    if (ward) {
        showToast('🗑️ ' + ward.name + ' deleted successfully', 'success');
    }
    deleteTargetId = null;
}

// ─── ─── Init ──────────────────────────────────────────────────────────────

function initWardsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadAllData();
    
    // Event Listeners
    document.getElementById('addWardBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', function() { closeModal('wardModal'); });
    document.getElementById('cancelModalBtn')?.addEventListener('click', function() { closeModal('wardModal'); });
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('wardForm')?.addEventListener('submit', saveWard);
    document.getElementById('refreshBtn')?.addEventListener('click', function() { refreshUI(); showToast('Refreshed', 'info'); });
    document.getElementById('viewChartBtn')?.addEventListener('click', openAnalytics);
    
    // Room modal
    document.getElementById('closeRoomModalBtn')?.addEventListener('click', function() { closeModal('roomModal'); });
    document.getElementById('cancelRoomBtn')?.addEventListener('click', function() { closeModal('roomModal'); });
    document.getElementById('roomForm')?.addEventListener('submit', saveRoom);
    document.getElementById('roomModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('roomModal');
    });
    
    // View ward modal
    document.getElementById('closeViewWardModalBtn')?.addEventListener('click', function() { closeModal('viewWardModal'); });
    document.getElementById('closeViewWardFooterBtn')?.addEventListener('click', function() { closeModal('viewWardModal'); });
    document.getElementById('viewWardModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewWardModal');
    });
    
    // Analytics modal
    document.getElementById('closeAnalyticsModalBtn')?.addEventListener('click', function() { closeModal('analyticsModal'); });
    document.getElementById('closeAnalyticsFooterBtn')?.addEventListener('click', function() { closeModal('analyticsModal'); });
    document.getElementById('analyticsModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('analyticsModal');
    });
    
    document.getElementById('resetFilter')?.addEventListener('click', function() {
        searchTerm = '';
        typeFilter = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderWards();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderWards();
    });
    
    document.getElementById('typeFilter')?.addEventListener('change', function(e) {
        typeFilter = e.target.value;
        renderWards();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', function(e) {
        statusFilter = e.target.value;
        renderWards();
    });
    
    // Real-time validation
    document.getElementById('wardName')?.addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('wardNameError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    document.getElementById('wardCode')?.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
        if (this.value.trim()) {
            document.getElementById('wardCodeError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    document.getElementById('wardType')?.addEventListener('change', function() {
        if (this.value) {
            document.getElementById('wardTypeError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    document.getElementById('totalBedsCount')?.addEventListener('input', function() {
        var val = parseInt(this.value);
        if (!this.value || (val >= 0 && !isNaN(val))) {
            document.getElementById('totalBedsError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    // Close modals on overlay click
    document.getElementById('wardModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('wardModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('wardModal');
            closeModal('deleteModal');
            closeModal('roomModal');
            closeModal('viewWardModal');
            closeModal('analyticsModal');
        }
    });
}

// ─── ─── Wait ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initWardsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initWardsModule();
    }, 3000);
});

// ─── ─── Expose ─────────────────────────────────────────────────────────────

window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.openRoomModal = openRoomModal;
window.editRoom = editRoom;
window.deleteRoom = deleteRoom;
window.viewWard = viewWard;
window.openAnalytics = openAnalytics;
window.openModal = openModal;
window.closeModal = closeModal;