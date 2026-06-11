/**
 * Wards Management JS - Ward Management Module
 * Professional UI, Fully Working, SMALLER CARDS (like doctors)
 */

let wards = [];
let deleteId = null;

function loadWards() {
    const stored = localStorage.getItem('wards');
    if(stored) {
        wards = JSON.parse(stored);
    } else {
        wards = [
            {id: 1, name: 'ICU', code: 'ICU', type: 'ICU', floor: 'Ground Floor', totalBeds: 10, availableBeds: 3, description: 'Intensive Care Unit for critical patients'},
            {id: 2, name: 'General Ward', code: 'GEN', type: 'General', floor: 'First Floor', totalBeds: 50, availableBeds: 15, description: 'General ward for regular patients'},
            {id: 3, name: 'Private Ward', code: 'PVT', type: 'Private', floor: 'Second Floor', totalBeds: 20, availableBeds: 8, description: 'Private rooms with AC and attached bathroom'},
            {id: 4, name: 'Maternity Ward', code: 'MAT', type: 'Maternity', floor: 'Third Floor', totalBeds: 15, availableBeds: 5, description: 'Maternity and postnatal care'},
            {id: 5, name: 'Pediatric Ward', code: 'PED', type: 'Pediatric', floor: 'Fourth Floor', totalBeds: 12, availableBeds: 4, description: 'Children\'s ward'},
            {id: 6, name: 'Emergency Ward', code: 'EMR', type: 'Emergency', floor: 'Ground Floor', totalBeds: 8, availableBeds: 2, description: 'Emergency observation unit'}
        ];
        saveWards();
    }
    updateStats();
    renderWards();
}

function saveWards() {
    localStorage.setItem('wards', JSON.stringify(wards));
}

function updateStats() {
    const totalWards = wards.length;
    const totalBeds = wards.reduce((sum, w) => sum + (w.totalBeds || 0), 0);
    const availableBeds = wards.reduce((sum, w) => sum + (w.availableBeds || 0), 0);
    
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const totalRooms = rooms.length;
    
    document.getElementById('totalWards').innerText = totalWards;
    document.getElementById('totalRooms').innerText = totalRooms;
    document.getElementById('totalBeds').innerText = totalBeds;
    document.getElementById('availableBeds').innerText = availableBeds;
}

function validateWardForm() {
    let isValid = true;
    
    const wardName = document.getElementById('wardName').value.trim();
    const wardCode = document.getElementById('wardCode').value.trim();
    const wardType = document.getElementById('wardType').value;
    const totalBeds = document.getElementById('totalBedsCount').value;
    
    if (!wardName) {
        document.getElementById('wardNameError').classList.add('show');
        document.getElementById('wardName').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('wardNameError').classList.remove('show');
        document.getElementById('wardName').classList.remove('error');
    }
    
    if (!wardCode) {
        document.getElementById('wardCodeError').classList.add('show');
        document.getElementById('wardCode').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('wardCodeError').classList.remove('show');
        document.getElementById('wardCode').classList.remove('error');
    }
    
    if (!wardType) {
        document.getElementById('wardTypeError').classList.add('show');
        document.getElementById('wardType').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('wardTypeError').classList.remove('show');
        document.getElementById('wardType').classList.remove('error');
    }
    
    if (totalBeds && (parseInt(totalBeds) < 0 || isNaN(parseInt(totalBeds)))) {
        document.getElementById('totalBedsError').classList.add('show');
        document.getElementById('totalBedsCount').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('totalBedsError').classList.remove('show');
        document.getElementById('totalBedsCount').classList.remove('error');
    }
    
    return isValid;
}

function renderWards() {
    const grid = document.getElementById('wardsGrid');
    if(wards.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-[#94a3b8]"><i class="fas fa-building text-3xl mb-2 block"></i><p class="font-normal">No wards found</p></div>';
        return;
    }
    
    grid.innerHTML = wards.map(ward => {
        const occupancyRate = ward.totalBeds > 0 ? ((ward.totalBeds - ward.availableBeds) / ward.totalBeds * 100).toFixed(1) : 0;
        
        let statusClass = '';
        let statusText = '';
        
        if(occupancyRate >= 90) {
            statusClass = 'status-critical';
            statusText = 'Critical';
        } else if(occupancyRate >= 70) {
            statusClass = 'status-high';
            statusText = 'High';
        } else if(occupancyRate >= 40) {
            statusClass = 'status-moderate';
            statusText = 'Moderate';
        } else {
            statusClass = 'status-available';
            statusText = 'Available';
        }
        
        let typeColors = {
            'ICU': 'bg-red-100 text-red-700',
            'General': 'bg-blue-100 text-blue-700',
            'Private': 'bg-purple-100 text-purple-700',
            'Maternity': 'bg-pink-100 text-pink-700',
            'Pediatric': 'bg-green-100 text-green-700',
            'Emergency': 'bg-orange-100 text-orange-700'
        };
        
        return `
            <div class="ward-card p-3">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-semibold text-[#1e293b] text-sm">${escapeHtml(ward.name)}</h3>
                        <p class="text-xs text-[#94a3b8]">${escapeHtml(ward.code)}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[ward.type] || 'bg-gray-100 text-gray-700'}">${ward.type}</span>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div class="bg-[#f8fafc] rounded-lg p-1.5 text-center">
                        <p class="text-[#64748b] text-[10px]">Floor</p>
                        <p class="font-medium text-[#1e293b] text-xs">${ward.floor || '-'}</p>
                    </div>
                    <div class="bg-[#f8fafc] rounded-lg p-1.5 text-center">
                        <p class="text-[#64748b] text-[10px]">Total Beds</p>
                        <p class="font-medium text-[#1e293b] text-xs">${ward.totalBeds || 0}</p>
                    </div>
                    <div class="bg-[#f8fafc] rounded-lg p-1.5 text-center">
                        <p class="text-[#64748b] text-[10px]">Available</p>
                        <p class="font-medium text-[#16a34a] text-xs">${ward.availableBeds || 0}</p>
                    </div>
                    <div class="bg-[#f8fafc] rounded-lg p-1.5 text-center">
                        <p class="text-[#64748b] text-[10px]">Occupancy</p>
                        <p class="font-medium text-[#1e293b] text-xs">${occupancyRate}%</p>
                    </div>
                </div>
                
                <div class="mb-3">
                    <div class="w-full bg-[#e2e8f0] rounded-full h-1.5">
                        <div class="bg-gradient-to-r from-[#a8c49a] to-[#8aae7a] h-1.5 rounded-full" style="width: ${occupancyRate}%"></div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center pt-1">
                    <span class="${statusClass}">${statusText}</span>
                    <div class="flex gap-1.5">
                        <button onclick="editWard(${ward.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition p-1 rounded" title="Edit Ward">
                            <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button onclick="deleteWard(${ward.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition p-1 rounded" title="Delete Ward">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </div>
                
                ${ward.description ? `<p class="mt-2 text-[10px] text-[#64748b] truncate">${escapeHtml(ward.description)}</p>` : ''}
            </div>
        `;
    }).join('');
}

function openModal() {
    document.getElementById('wardForm').reset();
    document.getElementById('wardId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Ward';
    document.getElementById('wardModal').classList.add('active');
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function editWard(id) {
    const ward = wards.find(w => w.id === id);
    if(ward) {
        document.getElementById('wardId').value = ward.id;
        document.getElementById('wardName').value = ward.name;
        document.getElementById('wardCode').value = ward.code;
        document.getElementById('wardType').value = ward.type;
        document.getElementById('floor').value = ward.floor || '';
        document.getElementById('totalBedsCount').value = ward.totalBeds || '';
        document.getElementById('description').value = ward.description || '';
        document.getElementById('modalTitle').innerText = 'Edit Ward';
        document.getElementById('wardModal').classList.add('active');
        
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

function deleteWard(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        wards = wards.filter(w => w.id !== deleteId);
        saveWards();
        
        let rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
        rooms = rooms.filter(r => r.wardId !== deleteId);
        localStorage.setItem('rooms', JSON.stringify(rooms));
        
        let beds = JSON.parse(localStorage.getItem('beds') || '[]');
        beds = beds.filter(b => b.wardId !== deleteId);
        localStorage.setItem('beds', JSON.stringify(beds));
        
        updateStats();
        renderWards();
        showToast('Ward deleted successfully', 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function saveWard(e) {
    e.preventDefault();
    
    if(!validateWardForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    const id = document.getElementById('wardId').value;
    const totalBeds = parseInt(document.getElementById('totalBedsCount').value) || 0;
    const data = {
        name: document.getElementById('wardName').value.trim(),
        code: document.getElementById('wardCode').value.trim().toUpperCase(),
        type: document.getElementById('wardType').value,
        floor: document.getElementById('floor').value,
        totalBeds: totalBeds,
        availableBeds: totalBeds,
        description: document.getElementById('description').value
    };
    
    if(id) {
        const index = wards.findIndex(w => w.id === parseInt(id));
        if(index !== -1) {
            const oldWard = wards[index];
            if(oldWard.totalBeds !== totalBeds) {
                const difference = totalBeds - oldWard.totalBeds;
                data.availableBeds = (oldWard.availableBeds || 0) + difference;
            } else {
                data.availableBeds = oldWard.availableBeds;
            }
            wards[index] = { ...wards[index], ...data };
            showToast('Ward updated successfully', 'success');
        }
    } else {
        const newId = wards.length > 0 ? Math.max(...wards.map(w => w.id)) + 1 : 1;
        wards.push({ id: newId, ...data });
        showToast('Ward added successfully', 'success');
    }
    
    saveWards();
    updateStats();
    renderWards();
    closeModal();
}

function closeModal() {
    document.getElementById('wardModal').classList.remove('active');
    document.getElementById('wardForm').reset();
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
    loadWards();
    
    document.getElementById('addWardBtn')?.addEventListener('click', openModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('wardForm')?.addEventListener('submit', saveWard);
    
    // Real-time validation
    document.getElementById('wardName')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('wardNameError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('wardCode')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('wardCodeError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('wardType')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('wardTypeError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('totalBedsCount')?.addEventListener('input', function() {
        const val = parseInt(this.value);
        if(!this.value || (val >= 0 && !isNaN(val))) {
            document.getElementById('totalBedsError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
});

window.editWard = editWard;
window.deleteWard = deleteWard;