/**
 * Units Management Module
 * MedFlow Pharmacy - Medicine Units CRUD
 * Uses theme.css for styling, clean event handling
 */

let units = [];
let searchTerm = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Toast Notification ──────────────────────────────

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const colors = { success: '#8aae7a', error: '#d8b48c', info: '#a8c49a' };
    
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 12px;
        background: ${colors[type]};
        color: white;
        font-weight: 500;
        font-size: 0.75rem;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        animation: slideInRight 0.25s ease-out;
        font-family: 'Poppins', system-ui, sans-serif;
    `;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${esc(message)}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

// ─── Data Management ──────────────────────────────

function loadUnits() {
    try {
        const stored = localStorage.getItem('pharmacy_units');
        if (stored) {
            units = JSON.parse(stored);
        } else {
            // Default Indian units
            units = [
                { id: 1, name: 'Milligram (मिलीग्राम)', symbol: 'mg', description: 'Milligram - used for small quantity medicines like Paracetamol 500mg' },
                { id: 2, name: 'Milliliter (मिलीलीटर)', symbol: 'ml', description: 'Milliliter - used for liquid medicines, syrups, suspensions' },
                { id: 3, name: 'Tablet (टैबलेट)', symbol: 'tab', description: 'Tablet - solid dosage form, e.g., Crocin, Dolo' },
                { id: 4, name: 'Capsule (कैप्सूल)', symbol: 'cap', description: 'Capsule - gelatin shell containing medicine, e.g., Amoxicillin' },
                { id: 5, name: 'Microgram (माइक्रोग्राम)', symbol: 'mcg', description: 'Microgram - used for high potency medicines like Thyroxine' },
                { id: 6, name: 'Gram (ग्राम)', symbol: 'g', description: 'Gram - used for creams, ointments, powders' },
                { id: 7, name: 'Unit (यूनिट)', symbol: 'U', description: 'International Unit - for vitamins, insulin, vaccines' },
                { id: 8, name: 'Drop (बूंद)', symbol: 'drop', description: 'Drop - for eye drops, ear drops, oral drops' },
                { id: 9, name: 'Vial (शीशी)', symbol: 'vial', description: 'Vial - for injections, liquid multi-dose containers' },
                { id: 10, name: 'Ampoule (शीशी)', symbol: 'amp', description: 'Ampoule - single-dose sealed glass container for injections' }
            ];
            saveUnits();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading units:', error);
        showToast('Error loading units', 'error');
    }
}

function saveUnits() {
    try {
        localStorage.setItem('pharmacy_units', JSON.stringify(units));
    } catch (error) {
        console.error('Error saving units:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = units.length;
    const active = units.filter(u => u.status !== 'Inactive').length;
    const withDesc = units.filter(u => u.description && u.description.trim()).length;
    
    document.getElementById('totalUnits').textContent = total;
    document.getElementById('activeUnits').textContent = active;
    document.getElementById('withDescCount').textContent = withDesc;
    document.getElementById('lastUpdated').textContent = 
        new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Filter ──────────────────────────────────────────

function getFilteredUnits() {
    return units.filter(unit => {
        const matchesSearch = searchTerm === '' || 
            unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (unit.description && unit.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('unitsTable');
    if (!tbody) return;
    
    const filtered = getFilteredUnits();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="units-empty">
                    <i class="fas fa-folder-open"></i>
                    <p>No units found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a unit to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map((unit, idx) => `
        <tr class="unit-row" data-id="${unit.id}">
            <td class="sno-cell">${idx + 1}</td>
            <td class="unit-name">${esc(unit.name)}</td>
            <td><span class="badge-unit">${esc(unit.symbol)}</span></td>
            <td class="desc-cell">${unit.description ? esc(unit.description) : '—'}</td>
            <td style="text-align:center;">
                <button class="action-btn edit edit-btn" data-id="${unit.id}" title="Edit Unit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete delete-btn" data-id="${unit.id}" title="Delete Unit">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Bind events
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteUnit(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Validation ──────────────────────────────────────

function validateUnitForm(name, symbol, isEditMode = false, currentId = null) {
    let isValid = true;
    
    // Clear previous errors
    const nameErrorEl = document.getElementById('unitNameError');
    const symbolErrorEl = document.getElementById('unitSymbolError');
    const nameInput = document.getElementById('unitName');
    const symbolInput = document.getElementById('unitSymbol');
    
    if (nameErrorEl) nameErrorEl.textContent = '';
    if (symbolErrorEl) symbolErrorEl.textContent = '';
    if (nameInput) nameInput.classList.remove('error');
    if (symbolInput) symbolInput.classList.remove('error');
    
    // Name validation
    if (!name || name.trim() === '') {
        if (nameErrorEl) nameErrorEl.textContent = 'Unit name is required';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length < 2) {
        if (nameErrorEl) nameErrorEl.textContent = 'Unit name must be at least 2 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length > 50) {
        if (nameErrorEl) nameErrorEl.textContent = 'Unit name cannot exceed 50 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else {
        // Check for duplicate name
        const duplicate = units.some(unit => {
            if (isEditMode && unit.id === currentId) return false;
            return unit.name.toLowerCase() === name.trim().toLowerCase();
        });
        if (duplicate) {
            if (nameErrorEl) nameErrorEl.textContent = 'Unit name already exists';
            if (nameInput) nameInput.classList.add('error');
            isValid = false;
        }
    }
    
    // Symbol validation
    if (!symbol || symbol.trim() === '') {
        if (symbolErrorEl) symbolErrorEl.textContent = 'Symbol is required';
        if (symbolInput) symbolInput.classList.add('error');
        isValid = false;
    } else if (symbol.trim().length < 1) {
        if (symbolErrorEl) symbolErrorEl.textContent = 'Symbol must be at least 1 character';
        if (symbolInput) symbolInput.classList.add('error');
        isValid = false;
    } else if (symbol.trim().length > 10) {
        if (symbolErrorEl) symbolErrorEl.textContent = 'Symbol cannot exceed 10 characters';
        if (symbolInput) symbolInput.classList.add('error');
        isValid = false;
    } else if (!/^[a-zA-Z0-9]+$/.test(symbol.trim())) {
        if (symbolErrorEl) symbolErrorEl.textContent = 'Symbol must contain only letters and numbers';
        if (symbolInput) symbolInput.classList.add('error');
        isValid = false;
    } else {
        // Check for duplicate symbol
        const duplicate = units.some(unit => {
            if (isEditMode && unit.id === currentId) return false;
            return unit.symbol.toLowerCase() === symbol.trim().toLowerCase();
        });
        if (duplicate) {
            if (symbolErrorEl) symbolErrorEl.textContent = 'Symbol already exists';
            if (symbolInput) symbolInput.classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
}

// ─── Modals ──────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('opacity-100', 'visible');
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('opacity-100', 'visible');
    }
}

function openAddModal() {
    document.getElementById('unitForm').reset();
    document.getElementById('unitId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-weight-hanging"></i> Add Unit';
    
    // Clear errors
    const nameErrorEl = document.getElementById('unitNameError');
    const symbolErrorEl = document.getElementById('unitSymbolError');
    const nameInput = document.getElementById('unitName');
    const symbolInput = document.getElementById('unitSymbol');
    
    if (nameErrorEl) nameErrorEl.textContent = '';
    if (symbolErrorEl) symbolErrorEl.textContent = '';
    if (nameInput) nameInput.classList.remove('error');
    if (symbolInput) symbolInput.classList.remove('error');
    
    openModal('unitModal');
}

function openEditModal(id) {
    const unit = units.find(u => u.id === id);
    if (!unit) {
        showToast('Unit not found', 'error');
        return;
    }
    
    document.getElementById('unitId').value = unit.id;
    document.getElementById('unitName').value = unit.name;
    document.getElementById('unitSymbol').value = unit.symbol;
    document.getElementById('unitDesc').value = unit.description || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Unit';
    
    // Clear errors
    const nameErrorEl = document.getElementById('unitNameError');
    const symbolErrorEl = document.getElementById('unitSymbolError');
    const nameInput = document.getElementById('unitName');
    const symbolInput = document.getElementById('unitSymbol');
    
    if (nameErrorEl) nameErrorEl.textContent = '';
    if (symbolErrorEl) symbolErrorEl.textContent = '';
    if (nameInput) nameInput.classList.remove('error');
    if (symbolInput) symbolInput.classList.remove('error');
    
    openModal('unitModal');
}

// ─── Form Submit ────────────────────────────────────

function saveUnit(e) {
    e.preventDefault();
    
    const id = document.getElementById('unitId').value;
    const name = document.getElementById('unitName').value.trim();
    const symbol = document.getElementById('unitSymbol').value.trim().toLowerCase();
    const description = document.getElementById('unitDesc').value.trim();
    
    const isEdit = !!id;
    const currentId = isEdit ? parseInt(id) : null;
    
    if (!validateUnitForm(name, symbol, isEdit, currentId)) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    if (isEdit) {
        const index = units.findIndex(u => u.id === currentId);
        if (index !== -1) {
            units[index] = { ...units[index], name, symbol, description };
            saveUnits();
            refreshUI();
            showToast(`✅ Unit "${esc(name)}" updated successfully`, 'success');
            closeModal('unitModal');
        } else {
            showToast('Unit not found', 'error');
        }
    } else {
        const newId = units.length > 0 ? Math.max(...units.map(u => u.id)) + 1 : 1;
        units.push({ id: newId, name, symbol, description });
        saveUnits();
        refreshUI();
        showToast(`✅ Unit "${esc(name)}" added successfully`, 'success');
        closeModal('unitModal');
    }
}

// ─── Delete ──────────────────────────────────────────

function deleteUnit(id) {
    const unit = units.find(u => u.id === id);
    if (!unit) return;
    
    if (confirm(`Are you sure you want to delete unit "${unit.name}" (${unit.symbol})? This action cannot be undone.`)) {
        units = units.filter(u => u.id !== id);
        saveUnits();
        refreshUI();
        showToast(`🗑️ Unit "${esc(unit.name)}" deleted successfully`, 'success');
    }
}

// ─── Init ────────────────────────────────────────────

function initUnitsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadUnits();
    
    // Event Listeners
    document.getElementById('addUnitBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('unitModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('unitModal'));
    document.getElementById('unitForm')?.addEventListener('submit', saveUnit);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        document.getElementById('searchInput').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    // Close modal on overlay click
    document.getElementById('unitModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('unitModal');
    });
    
    // Auto-lowercase symbol
    document.getElementById('unitSymbol')?.addEventListener('input', function() {
        const pos = this.selectionStart;
        this.value = this.value.toLowerCase();
        this.setSelectionRange(pos, pos);
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('unitModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initUnitsModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initUnitsModule();
    }, 3000);
});