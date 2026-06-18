/**
 * Rooms Management JS - Ward Management Module
 * Uses theme.css for styling, clean event handling
 */

let rooms = [];
let wards = [];
let deleteTargetId = null;
let searchTerm = '';
let wardFilter = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        wards = JSON.parse(localStorage.getItem('wards') || '[]');
        
        const stored = localStorage.getItem('rooms');
        if (stored) {
            rooms = JSON.parse(stored);
        } else {
            rooms = [
                {id: 1, wardId: 1, wardName: 'ICU', roomNumber: '101', roomType: 'ICU', bedCount: 1, availableBeds: 0, amenities: 'Monitor, Ventilator, AC'},
                {id: 2, wardId: 2, wardName: 'General Ward', roomNumber: '201', roomType: 'General', bedCount: 6, availableBeds: 2, amenities: 'Fan, Common bathroom'},
                {id: 3, wardId: 2, wardName: 'General Ward', roomNumber: '202', roomType: 'General', bedCount: 4, availableBeds: 1, amenities: 'Fan, Common bathroom'},
                {id: 4, wardId: 3, wardName: 'Private Ward', roomNumber: '301', roomType: 'Private', bedCount: 1, availableBeds: 1, amenities: 'AC, TV, Attached bathroom'},
                {id: 5, wardId: 4, wardName: 'Maternity Ward', roomNumber: '401', roomType: 'Private', bedCount: 2, availableBeds: 1, amenities: 'AC, Attached bathroom, Baby crib'},
                {id: 6, wardId: 5, wardName: 'Pediatric Ward', roomNumber: '501', roomType: 'General', bedCount: 4, availableBeds: 2, amenities: 'Colorful decor, Play area'},
                {id: 7, wardId: 6, wardName: 'Emergency Ward', roomNumber: 'G01', roomType: 'ICU', bedCount: 2, availableBeds: 0, amenities: 'Emergency equipment'}
            ];
            saveRooms();
            updateWardStats();
        }
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading room data:', error);
        if (window.showToast) {
            window.showToast('Error loading room data', 'error');
        }
    }
}

function saveRooms() {
    try {
        localStorage.setItem('rooms', JSON.stringify(rooms));
    } catch (error) {
        console.error('Error saving rooms:', error);
    }
}

function updateWardStats() {
    wards.forEach(ward => {
        const wardRooms = rooms.filter(r => r.wardId === ward.id);
        const totalBedsInWard = wardRooms.reduce((sum, r) => sum + (r.bedCount || 0), 0);
        const availableBedsInWard = wardRooms.reduce((sum, r) => sum + (r.availableBeds || 0), 0);
        
        const wardIndex = wards.findIndex(w => w.id === ward.id);
        if (wardIndex !== -1) {
            wards[wardIndex].totalBeds = totalBedsInWard;
            wards[wardIndex].availableBeds = availableBedsInWard;
        }
    });
    localStorage.setItem('wards', JSON.stringify(wards));
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((sum, r) => sum + (r.bedCount || 0), 0);
    const availableBeds = rooms.reduce((sum, r) => sum + (r.availableBeds || 0), 0);
    
    document.getElementById('totalWards').textContent = wards.length;
    document.getElementById('totalRooms').textContent = totalRooms;
    document.getElementById('totalBeds').textContent = totalBeds;
    document.getElementById('availableBeds').textContent = availableBeds;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredRooms() {
    return rooms.filter(room => {
        const matchesSearch = searchTerm === '' || 
            room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesWard = wardFilter === '' || room.wardId.toString() === wardFilter;
        
        return matchesSearch && matchesWard;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('roomsTable');
    if (!tbody) return;
    
    const filtered = getFilteredRooms();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="rooms-empty">
                    <i class="fas fa-door-open"></i>
                    <p>No rooms found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a room to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by room number
    const sorted = [...filtered].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
    
    tbody.innerHTML = sorted.map(room => {
        const isAvailable = room.availableBeds > 0;
        const statusClass = isAvailable ? 'status-available' : 'status-full';
        const statusText = isAvailable ? 'Available' : 'Full';
        const bedsClass = isAvailable ? 'beds-available' : 'beds-full';
        
        return `
            <tr class="room-row" data-id="${room.id}">
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem;">${esc(room.roomNumber)}</td>
                <td style="color:var(--color-brown-300);">${esc(room.wardName)}</td>
                <td><span class="room-type-badge">${esc(room.roomType)}</span></td>
                <td style="text-align:center; color:var(--color-brown-300);">${room.bedCount || 0}</td>
                <td style="text-align:center;" class="${bedsClass}">${room.availableBeds || 0}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td style="text-align:center;">
                    <div style="display:flex; gap:0.25rem; justify-content:center;">
                        <button class="action-btn edit-btn" data-id="${room.id}" title="Edit Room">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete delete-btn" data-id="${room.id}" title="Delete Room">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Bind events
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

function populateFilters() {
    const wardSelect = document.getElementById('wardFilter');
    if (wardSelect) {
        wardSelect.innerHTML = '<option value="">All Wards</option>' + 
            wards.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('');
    }
    
    const wardSelectModal = document.getElementById('wardId');
    if (wardSelectModal) {
        wardSelectModal.innerHTML = '<option value="">-- Select Ward --</option>' + 
            wards.map(w => `<option value="${w.id}">${esc(w.name)} (${w.totalBeds || 0} beds)</option>`).join('');
    }
}

// ─── Validation ──────────────────────────────────────

function validateRoomForm() {
    let isValid = true;
    
    const wardId = document.getElementById('wardId').value;
    const roomNumber = document.getElementById('roomNumber').value.trim();
    const roomType = document.getElementById('roomType').value;
    const bedCount = document.getElementById('bedCount').value;
    
    // Reset errors
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    
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
    
    if (bedCount && (parseInt(bedCount) < 1 || isNaN(parseInt(bedCount)))) {
        document.getElementById('bedCountError').classList.add('show');
        document.getElementById('bedCount').classList.add('error');
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
    document.getElementById('roomForm').reset();
    document.getElementById('roomId').value = '';
    document.getElementById('bedCount').value = '1';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-door-open"></i> Add Room';
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    populateFilters();
    openModal('roomModal');
}

function openEditModal(id) {
    const room = rooms.find(r => r.id === id);
    if (room) {
        document.getElementById('roomId').value = room.id;
        document.getElementById('wardId').value = room.wardId;
        document.getElementById('roomNumber').value = room.roomNumber;
        document.getElementById('roomType').value = room.roomType;
        document.getElementById('bedCount').value = room.bedCount;
        document.getElementById('amenities').value = room.amenities || '';
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Room';
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
        populateFilters();
        openModal('roomModal');
    }
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveRoom(e) {
    e.preventDefault();
    
    if (!validateRoomForm()) {
        if (window.showToast) {
            window.showToast('Please fill all required fields correctly', 'error');
        }
        return;
    }
    
    const id = document.getElementById('roomId').value;
    const wardId = parseInt(document.getElementById('wardId').value);
    const ward = wards.find(w => w.id === wardId);
    const bedCount = parseInt(document.getElementById('bedCount').value) || 1;
    
    const data = {
        wardId: wardId,
        wardName: ward?.name || '',
        roomNumber: document.getElementById('roomNumber').value.trim(),
        roomType: document.getElementById('roomType').value,
        bedCount: bedCount,
        amenities: document.getElementById('amenities').value.trim()
    };
    
    if (id) {
        const index = rooms.findIndex(r => r.id === parseInt(id));
        if (index !== -1) {
            const oldRoom = rooms[index];
            if (oldRoom.bedCount !== bedCount) {
                const difference = bedCount - oldRoom.bedCount;
                data.availableBeds = Math.max(0, (oldRoom.availableBeds || 0) + difference);
            } else {
                data.availableBeds = oldRoom.availableBeds;
            }
            rooms[index] = { ...rooms[index], ...data };
            if (window.showToast) {
                window.showToast(`✅ Room ${data.roomNumber} updated successfully`, 'success');
            }
        }
    } else {
        const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
        data.availableBeds = bedCount;
        rooms.push({ id: newId, ...data });
        if (window.showToast) {
            window.showToast(`✅ Room ${data.roomNumber} added successfully`, 'success');
        }
    }
    
    saveRooms();
    updateWardStats();
    refreshUI();
    closeModal('roomModal');
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    const room = rooms.find(r => r.id === deleteTargetId);
    rooms = rooms.filter(r => r.id !== deleteTargetId);
    saveRooms();
    
    // Delete associated beds
    let beds = JSON.parse(localStorage.getItem('beds') || '[]');
    beds = beds.filter(b => b.roomId !== deleteTargetId);
    localStorage.setItem('beds', JSON.stringify(beds));
    
    updateWardStats();
    refreshUI();
    closeModal('deleteModal');
    
    if (room && window.showToast) {
        window.showToast(`🗑️ Room ${room.roomNumber} deleted successfully`, 'success');
    }
    deleteTargetId = null;
}

// ─── Init ────────────────────────────────────────────

function initRoomsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('addRoomBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('roomModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('roomModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('roomForm')?.addEventListener('submit', saveRoom);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        wardFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('wardFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('wardFilter')?.addEventListener('change', (e) => {
        wardFilter = e.target.value;
        renderTable();
    });
    
    // Real-time validation
    document.getElementById('wardId')?.addEventListener('change', function() {
        if (this.value) {
            document.getElementById('wardIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('roomNumber')?.addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('roomNumberError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('roomType')?.addEventListener('change', function() {
        if (this.value) {
            document.getElementById('roomTypeError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('bedCount')?.addEventListener('input', function() {
        const val = parseInt(this.value);
        if (!this.value || (val >= 1 && !isNaN(val))) {
            document.getElementById('bedCountError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    // Close modals on overlay click
    document.getElementById('roomModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('roomModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('roomModal');
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
            setTimeout(initRoomsModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initRoomsModule();
    }, 3000);
});