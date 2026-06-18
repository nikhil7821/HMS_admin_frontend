/**
 * Wards Management JS - Ward Management Module
 * Uses theme.css for styling, clean event handling
 */

let wards = [];
let deleteTargetId = null;
let searchTerm = '';
let typeFilter = '';
let statusFilter = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getWardTypeClass(type) {
    const map = {
        'ICU': 'icu',
        'General': 'general',
        'Private': 'private',
        'Maternity': 'maternity',
        'Pediatric': 'pediatric',
        'Emergency': 'emergency'
    };
    return map[type] || 'general';
}

function getStatusFromOccupancy(occupancy) {
    if (occupancy >= 90) return { class: 'status-critical', text: 'Critical' };
    if (occupancy >= 70) return { class: 'status-high', text: 'High' };
    if (occupancy >= 40) return { class: 'status-moderate', text: 'Moderate' };
    return { class: 'status-available', text: 'Available' };
}

// ─── Data Management ──────────────────────────────

function loadWards() {
    try {
        const stored = localStorage.getItem('wards');
        if (stored) {
            wards = JSON.parse(stored);
        } else {
            wards = [
                {id: 1, name: 'ICU', code: 'ICU', type: 'ICU', floor: 'Ground Floor', totalBeds: 10, availableBeds: 3, description: 'Intensive Care Unit for critical patients'},
                {id: 2, name: 'General Ward', code: 'GEN', type: 'General', floor: 'First Floor', totalBeds: 50, availableBeds: 15, description: 'General ward for regular patients'},
                {id: 3, name: 'Private Ward', code: 'PVT', type: 'Private', floor: 'Second Floor', totalBeds: 20, availableBeds: 8, description: 'Private rooms with AC and attached bathroom'},
                {id: 4, name: 'Maternity Ward', code: 'MAT', type: 'Maternity', floor: 'Third Floor', totalBeds: 15, availableBeds: 5, description: 'Maternity and postnatal care'},
                {id: 5, name: 'Pediatric Ward', code: 'PED', type: 'Pediatric', floor: 'Fourth Floor', totalBeds: 12, availableBeds: 4, description: "Children's ward"},
                {id: 6, name: 'Emergency Ward', code: 'EMR', type: 'Emergency', floor: 'Ground Floor', totalBeds: 8, availableBeds: 2, description: 'Emergency observation unit'}
            ];
            saveWards();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading wards:', error);
        if (window.showToast) {
            window.showToast('Error loading ward data', 'error');
        }
    }
}

function saveWards() {
    try {
        localStorage.setItem('wards', JSON.stringify(wards));
    } catch (error) {
        console.error('Error saving wards:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const totalWards = wards.length;
    const totalBeds = wards.reduce((sum, w) => sum + (w.totalBeds || 0), 0);
    const availableBeds = wards.reduce((sum, w) => sum + (w.availableBeds || 0), 0);
    
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const totalRooms = rooms.length;
    
    document.getElementById('totalWards').textContent = totalWards;
    document.getElementById('totalRooms').textContent = totalRooms;
    document.getElementById('totalBeds').textContent = totalBeds;
    document.getElementById('availableBeds').textContent = availableBeds;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredWards() {
    return wards.filter(w => {
        const matchesSearch = searchTerm === '' || 
            w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.code.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = typeFilter === '' || w.type === typeFilter;
        
        const occupancyRate = w.totalBeds > 0 ? ((w.totalBeds - w.availableBeds) / w.totalBeds * 100) : 0;
        const status = getStatusFromOccupancy(occupancyRate);
        const matchesStatus = statusFilter === '' || status.text === statusFilter;
        
        return matchesSearch && matchesType && matchesStatus;
    });
}

// ─── Render ──────────────────────────────────────────

function renderWards() {
    const grid = document.getElementById('wardsGrid');
    if (!grid) return;
    
    const filtered = getFilteredWards();
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="wards-empty">
                <i class="fas fa-building"></i>
                <p>No wards found</p>
                <p style="font-size:0.75rem; margin-top:0.25rem;">Add a ward to get started.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(ward => {
        const occupancyRate = ward.totalBeds > 0 ? ((ward.totalBeds - ward.availableBeds) / ward.totalBeds * 100) : 0;
        const status = getStatusFromOccupancy(occupancyRate);
        const typeClass = getWardTypeClass(ward.type);
        
        return `
            <div class="ward-card" data-id="${ward.id}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                    <div>
                        <h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem; margin:0;">${esc(ward.name)}</h3>
                        <p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">${esc(ward.code)}</p>
                    </div>
                    <span class="ward-type-badge ${typeClass}">${ward.type}</span>
                </div>
                
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.375rem; font-size:0.75rem; margin-bottom:0.5rem;">
                    <div class="ward-info-box">
                        <p class="label">Floor</p>
                        <p class="value">${esc(ward.floor) || '-'}</p>
                    </div>
                    <div class="ward-info-box">
                        <p class="label">Total Beds</p>
                        <p class="value">${ward.totalBeds || 0}</p>
                    </div>
                    <div class="ward-info-box">
                        <p class="label">Available</p>
                        <p class="value available">${ward.availableBeds || 0}</p>
                    </div>
                    <div class="ward-info-box">
                        <p class="label">Occupancy</p>
                        <p class="value">${occupancyRate.toFixed(0)}%</p>
                    </div>
                </div>
                
                <div class="ward-progress">
                    <div class="fill" style="width: ${occupancyRate}%;"></div>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.5rem; border-top:1px solid var(--border-default);">
                    <span class="${status.class}">${status.text}</span>
                    <div style="display:flex; gap:0.375rem;">
                        <button class="edit-btn icon-btn-sm" data-id="${ward.id}" title="Edit Ward">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="delete-btn icon-btn-sm danger" data-id="${ward.id}" title="Delete Ward">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                
                ${ward.description ? `
                    <p style="font-size:0.625rem; color:var(--color-brown-100); margin-top:0.5rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        ${esc(ward.description)}
                    </p>
                ` : ''}
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
}

function refreshUI() {
    updateStats();
    renderWards();
}

// ─── Validation ──────────────────────────────────────

function validateWardForm() {
    let isValid = true;
    
    const wardName = document.getElementById('wardName').value.trim();
    const wardCode = document.getElementById('wardCode').value.trim();
    const wardType = document.getElementById('wardType').value;
    const totalBeds = document.getElementById('totalBedsCount').value;
    
    // Reset errors
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    
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
    document.getElementById('wardForm').reset();
    document.getElementById('wardId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add Ward';
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    openModal('wardModal');
}

function openEditModal(id) {
    const ward = wards.find(w => w.id === id);
    if (ward) {
        document.getElementById('wardId').value = ward.id;
        document.getElementById('wardName').value = ward.name;
        document.getElementById('wardCode').value = ward.code;
        document.getElementById('wardType').value = ward.type;
        document.getElementById('floor').value = ward.floor || '';
        document.getElementById('totalBedsCount').value = ward.totalBeds || '';
        document.getElementById('description').value = ward.description || '';
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Ward';
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
        openModal('wardModal');
    }
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveWard(e) {
    e.preventDefault();
    
    if (!validateWardForm()) {
        if (window.showToast) {
            window.showToast('Please fill all required fields correctly', 'error');
        }
        return;
    }
    
    const id = document.getElementById('wardId').value;
    const totalBeds = parseInt(document.getElementById('totalBedsCount').value) || 0;
    const data = {
        name: document.getElementById('wardName').value.trim(),
        code: document.getElementById('wardCode').value.trim().toUpperCase(),
        type: document.getElementById('wardType').value,
        floor: document.getElementById('floor').value.trim(),
        totalBeds: totalBeds,
        description: document.getElementById('description').value.trim()
    };
    
    if (id) {
        const index = wards.findIndex(w => w.id === parseInt(id));
        if (index !== -1) {
            const oldWard = wards[index];
            // Calculate available beds
            if (oldWard.totalBeds !== totalBeds) {
                const difference = totalBeds - oldWard.totalBeds;
                data.availableBeds = Math.max(0, (oldWard.availableBeds || 0) + difference);
            } else {
                data.availableBeds = oldWard.availableBeds;
            }
            wards[index] = { ...wards[index], ...data };
            if (window.showToast) {
                window.showToast(`✅ ${data.name} updated successfully`, 'success');
            }
        }
    } else {
        const newId = wards.length > 0 ? Math.max(...wards.map(w => w.id)) + 1 : 1;
        data.availableBeds = totalBeds;
        wards.push({ id: newId, ...data });
        if (window.showToast) {
            window.showToast(`✅ ${data.name} added successfully`, 'success');
        }
    }
    
    saveWards();
    refreshUI();
    closeModal('wardModal');
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    const ward = wards.find(w => w.id === deleteTargetId);
    wards = wards.filter(w => w.id !== deleteTargetId);
    saveWards();
    
    // Clean up rooms and beds
    let rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    rooms = rooms.filter(r => r.wardId !== deleteTargetId);
    localStorage.setItem('rooms', JSON.stringify(rooms));
    
    let beds = JSON.parse(localStorage.getItem('beds') || '[]');
    beds = beds.filter(b => b.wardId !== deleteTargetId);
    localStorage.setItem('beds', JSON.stringify(beds));
    
    refreshUI();
    closeModal('deleteModal');
    
    if (ward && window.showToast) {
        window.showToast(`🗑️ ${ward.name} deleted successfully`, 'success');
    }
    deleteTargetId = null;
}

// ─── Init ────────────────────────────────────────────

function initWardsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadWards();
    
    // Event Listeners
    document.getElementById('addWardBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('wardModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('wardModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('wardForm')?.addEventListener('submit', saveWard);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        typeFilter = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('statusFilter').value = '';
        renderWards();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderWards();
    });
    
    document.getElementById('typeFilter')?.addEventListener('change', (e) => {
        typeFilter = e.target.value;
        renderWards();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
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
        const val = parseInt(this.value);
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
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('wardModal');
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
            setTimeout(initWardsModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initWardsModule();
    }, 3000);
});