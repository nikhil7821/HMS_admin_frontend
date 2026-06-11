/**
 * Rooms Management JS - Ward Management Module
 * Professional UI, Fully Working, Indian Names, Form Validation
 */

let rooms = [];
let wards = [];
let deleteId = null;

function loadData() {
    wards = JSON.parse(localStorage.getItem('wards') || '[]');
    const stored = localStorage.getItem('rooms');
    if(stored) {
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
    updateStats();
    renderTable();
    populateFilters();
}

function saveRooms() {
    localStorage.setItem('rooms', JSON.stringify(rooms));
}

function updateWardStats() {
    wards.forEach(ward => {
        const wardRooms = rooms.filter(r => r.wardId === ward.id);
        const totalBedsInWard = wardRooms.reduce((sum, r) => sum + (r.bedCount || 0), 0);
        const availableBedsInWard = wardRooms.reduce((sum, r) => sum + (r.availableBeds || 0), 0);
        
        const wardIndex = wards.findIndex(w => w.id === ward.id);
        if(wardIndex !== -1) {
            wards[wardIndex].totalBeds = totalBedsInWard;
            wards[wardIndex].availableBeds = availableBedsInWard;
        }
    });
    localStorage.setItem('wards', JSON.stringify(wards));
}

function updateStats() {
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((sum, r) => sum + (r.bedCount || 0), 0);
    const availableBeds = rooms.reduce((sum, r) => sum + (r.availableBeds || 0), 0);
    
    document.getElementById('totalWards').innerText = wards.length;
    document.getElementById('totalRooms').innerText = totalRooms;
    document.getElementById('totalBeds').innerText = totalBeds;
    document.getElementById('availableBeds').innerText = availableBeds;
}

function validateRoomForm() {
    let isValid = true;
    
    const wardId = document.getElementById('wardId').value;
    const roomNumber = document.getElementById('roomNumber').value.trim();
    const roomType = document.getElementById('roomType').value;
    const bedCount = document.getElementById('bedCount').value;
    
    if (!wardId) {
        document.getElementById('wardIdError').classList.add('show');
        document.getElementById('wardId').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('wardIdError').classList.remove('show');
        document.getElementById('wardId').classList.remove('error');
    }
    
    if (!roomNumber) {
        document.getElementById('roomNumberError').classList.add('show');
        document.getElementById('roomNumber').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('roomNumberError').classList.remove('show');
        document.getElementById('roomNumber').classList.remove('error');
    }
    
    if (!roomType) {
        document.getElementById('roomTypeError').classList.add('show');
        document.getElementById('roomType').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('roomTypeError').classList.remove('show');
        document.getElementById('roomType').classList.remove('error');
    }
    
    if (bedCount && (parseInt(bedCount) < 1 || isNaN(parseInt(bedCount)))) {
        document.getElementById('bedCountError').classList.add('show');
        document.getElementById('bedCount').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('bedCountError').classList.remove('show');
        document.getElementById('bedCount').classList.remove('error');
    }
    
    return isValid;
}

function renderTable() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const wardFilter = document.getElementById('wardFilter')?.value || '';
    
    let filtered = rooms.filter(room => {
        const matchesSearch = room.roomNumber.toLowerCase().includes(search);
        const matchesWard = wardFilter === '' || room.wardId.toString() === wardFilter;
        return matchesSearch && matchesWard;
    });
    
    const tbody = document.getElementById('roomsTable');
    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-door-open text-3xl mb-2 block"></i><p class="font-normal">No rooms found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(room => `
        <tr class="room-row">
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(room.roomNumber)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${escapeHtml(room.wardName)}</td>
            <td class="px-5 py-3"><span class="px-2 py-1 bg-[#f1f5f9] text-[#475569] rounded-full text-xs font-medium">${escapeHtml(room.roomType)}</span></td>
            <td class="px-5 py-3 text-center text-[#475569] text-sm">${room.bedCount || 0}</td>
            <td class="px-5 py-3 text-center ${room.availableBeds > 0 ? 'text-[#16a34a] font-medium' : 'text-[#ef4444] font-medium'} text-sm">${room.availableBeds || 0}</td>
            <td class="px-5 py-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${room.availableBeds > 0 ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fee2e2] text-[#ef4444]'}">
                    ${room.availableBeds > 0 ? 'Available' : 'Full'}
                </span>
            </td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    <button onclick="editRoom(${room.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="Edit Room">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteRoom(${room.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Room">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
             </td>
         </tr>
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
            wards.map(w => `<option value="${w.id}">${escapeHtml(w.name)} (${w.totalBeds || 0} beds)</option>`).join('');
    }
}

function openModal() {
    document.getElementById('roomForm').reset();
    document.getElementById('roomId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Room';
    document.getElementById('bedCount').value = '1';
    document.getElementById('roomModal').classList.add('active');
    populateFilters();
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function editRoom(id) {
    const room = rooms.find(r => r.id === id);
    if(room) {
        document.getElementById('roomId').value = room.id;
        document.getElementById('wardId').value = room.wardId;
        document.getElementById('roomNumber').value = room.roomNumber;
        document.getElementById('roomType').value = room.roomType;
        document.getElementById('bedCount').value = room.bedCount;
        document.getElementById('amenities').value = room.amenities || '';
        document.getElementById('modalTitle').innerText = 'Edit Room';
        document.getElementById('roomModal').classList.add('active');
        populateFilters();
        
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

function deleteRoom(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        const room = rooms.find(r => r.id === deleteId);
        rooms = rooms.filter(r => r.id !== deleteId);
        saveRooms();
        
        // Delete associated beds
        let beds = JSON.parse(localStorage.getItem('beds') || '[]');
        beds = beds.filter(b => b.roomId !== deleteId);
        localStorage.setItem('beds', JSON.stringify(beds));
        
        updateWardStats();
        updateStats();
        renderTable();
        showToast(`Room ${room?.roomNumber} deleted successfully`, 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function saveRoom(e) {
    e.preventDefault();
    
    if(!validateRoomForm()) {
        showToast('Please fill all required fields correctly', 'error');
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
        availableBeds: bedCount,
        amenities: document.getElementById('amenities').value
    };
    
    if(id) {
        const index = rooms.findIndex(r => r.id === parseInt(id));
        if(index !== -1) {
            const oldRoom = rooms[index];
            if(oldRoom.bedCount !== bedCount) {
                const difference = bedCount - oldRoom.bedCount;
                data.availableBeds = (oldRoom.availableBeds || 0) + difference;
            } else {
                data.availableBeds = oldRoom.availableBeds;
            }
            rooms[index] = { ...rooms[index], ...data };
            showToast('Room updated successfully', 'success');
        }
    } else {
        const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
        rooms.push({ id: newId, ...data });
        showToast('Room added successfully', 'success');
    }
    
    saveRooms();
    updateWardStats();
    updateStats();
    renderTable();
    closeModal();
}

function closeModal() {
    document.getElementById('roomModal').classList.remove('active');
    document.getElementById('roomForm').reset();
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
    
    document.getElementById('addRoomBtn')?.addEventListener('click', openModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('roomForm')?.addEventListener('submit', saveRoom);
    document.getElementById('wardFilter')?.addEventListener('change', () => renderTable());
    document.getElementById('searchInput')?.addEventListener('input', () => renderTable());
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('wardFilter').value = '';
        renderTable();
    });
    
    // Real-time validation
    document.getElementById('wardId')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('wardIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('roomNumber')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('roomNumberError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('roomType')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('roomTypeError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('bedCount')?.addEventListener('input', function() {
        const val = parseInt(this.value);
        if(!this.value || (val >= 1 && !isNaN(val))) {
            document.getElementById('bedCountError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
});

window.editRoom = editRoom;
window.deleteRoom = deleteRoom;