/**
 * Stock Adjustments Management Module
 * MedFlow Pharmacy - Stock Corrections, Damages, Expiry CRUD
 * Uses theme.css for styling, clean event handling
 */

let adjustments = [];
let medicines = [];
let searchTerm = '';
let typeFilter = '';
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

function loadData() {
    try {
        // Load medicines from pharmacy
        const storedMedicines = localStorage.getItem('pharmacy_medicines');
        medicines = storedMedicines ? JSON.parse(storedMedicines) : [];
        
        // Load adjustments
        const storedAdjustments = localStorage.getItem('pharmacy_adjustments');
        if (storedAdjustments) {
            adjustments = JSON.parse(storedAdjustments);
        } else {
            adjustments = [];
        }
        refreshUI();
        populateSelects();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data', 'error');
    }
}

function saveAdjustments() {
    try {
        localStorage.setItem('pharmacy_adjustments', JSON.stringify(adjustments));
    } catch (error) {
        console.error('Error saving adjustments:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = adjustments.length;
    const added = adjustments.filter(a => a.type === 'Add').reduce((sum, a) => sum + a.quantity, 0);
    const removed = adjustments.filter(a => a.type === 'Remove').reduce((sum, a) => sum + a.quantity, 0);
    const loss = adjustments.filter(a => a.type === 'Damage' || a.type === 'Expiry').reduce((sum, a) => sum + a.quantity, 0);
    
    document.getElementById('totalAdjustments').textContent = total;
    document.getElementById('totalAdded').textContent = added;
    document.getElementById('totalRemoved').textContent = removed;
    document.getElementById('totalLoss').textContent = loss;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredAdjustments() {
    return adjustments.filter(adj => {
        const matchesSearch = searchTerm === '' || 
            adj.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            adj.reason.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = typeFilter === '' || adj.type === typeFilter;
        
        return matchesSearch && matchesType;
    });
}

// ─── Render ──────────────────────────────────────────

function getBadgeClass(type) {
    const map = {
        'Add': 'badge-add',
        'Remove': 'badge-remove',
        'Damage': 'badge-damage',
        'Expiry': 'badge-expiry'
    };
    return map[type] || 'badge-add';
}

function getTypeDisplay(type) {
    const map = {
        'Add': 'Add Stock',
        'Remove': 'Remove Stock',
        'Damage': 'Damage',
        'Expiry': 'Expiry'
    };
    return map[type] || type;
}

function renderTable() {
    const tbody = document.getElementById('adjustmentsTable');
    if (!tbody) return;
    
    const filtered = getFilteredAdjustments();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="adjustments-empty">
                    <i class="fas fa-folder-open"></i>
                    <p>No adjustments recorded</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Create a new adjustment to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date descending (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(adj => {
        const badgeClass = getBadgeClass(adj.type);
        const typeDisplay = getTypeDisplay(adj.type);
        
        return `
            <tr class="adjustment-row" data-id="${adj.id}">
                <td style="color:var(--color-brown-600); font-size:0.8125rem;">${adj.date}</td>
                <td class="med-name">${esc(adj.medicineName)}</td>
                <td><span class="${badgeClass}">${typeDisplay}</span></td>
                <td style="text-align:center; font-weight:var(--font-weight-semibold); color:var(--color-brown-600);">${adj.quantity}</td>
                <td class="reason-cell">${esc(adj.reason)}</td>
                <td style="text-align:center;">
                    <button class="action-btn delete delete-btn" data-id="${adj.id}" title="Delete Adjustment">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Bind events
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteAdjustment(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Populate Selects ──────────────────────────────

function populateSelects() {
    const medicineSelect = document.getElementById('medicineId');
    if (medicineSelect) {
        medicineSelect.innerHTML = '<option value="">Select Medicine</option>' + 
            medicines.map(m => 
                `<option value="${m.id}">${esc(m.name)} ${m.brand ? '(' + esc(m.brand) + ')' : ''} - Stock: ${m.stock || 0} ${m.unit || ''}</option>`
            ).join('');
    }
}

// ─── Stock Warning ──────────────────────────────────

function updateStockWarning() {
    const medicineId = parseInt(document.getElementById('medicineId')?.value) || null;
    const adjustType = document.getElementById('adjustType')?.value || '';
    const medicine = medicines.find(m => m.id === medicineId);
    const stockWarning = document.getElementById('stockWarning');
    const quantityInput = document.getElementById('quantity');
    
    if (medicine && stockWarning) {
        const stock = medicine.stock || 0;
        const unit = medicine.unit || 'units';
        const isRemoval = adjustType === 'Remove' || adjustType === 'Damage' || adjustType === 'Expiry';
        
        if (isRemoval && stock === 0) {
            stockWarning.className = 'stock-warning danger';
            stockWarning.innerHTML = `<i class="fas fa-times-circle"></i> Out of stock! Cannot ${adjustType.toLowerCase()} this medicine`;
            if (quantityInput) {
                quantityInput.disabled = true;
                quantityInput.value = '';
            }
        } else if (isRemoval && stock < 100 && stock > 0) {
            stockWarning.className = 'stock-warning warning';
            stockWarning.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Low stock: Only ${stock} ${unit} available`;
            if (quantityInput) quantityInput.disabled = false;
        } else if (isRemoval && stock > 0) {
            stockWarning.className = 'stock-warning success';
            stockWarning.innerHTML = `<i class="fas fa-check-circle"></i> Available stock: ${stock} ${unit}`;
            if (quantityInput) quantityInput.disabled = false;
        } else {
            stockWarning.className = 'stock-warning';
            stockWarning.innerHTML = `<i class="fas fa-info-circle"></i> Current stock: ${stock} ${unit}`;
            stockWarning.style.color = 'var(--color-brown-100)';
            if (quantityInput) quantityInput.disabled = false;
        }
    } else if (stockWarning) {
        stockWarning.className = 'stock-warning';
        stockWarning.innerHTML = '';
        if (quantityInput) quantityInput.disabled = false;
    }
}

// ─── Validation ──────────────────────────────────────

function validateAdjustmentForm(medicineId, adjustType, quantity, reason) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['medicineError', 'typeError', 'quantityError', 'reasonError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    
    const medicineSelect = document.getElementById('medicineId');
    const typeSelect = document.getElementById('adjustType');
    const quantityInput = document.getElementById('quantity');
    const reasonTextarea = document.getElementById('reason');
    
    [medicineSelect, typeSelect, quantityInput, reasonTextarea].forEach(el => {
        if (el) el.classList.remove('error');
    });
    
    // Medicine validation
    if (!medicineId) {
        const errorEl = document.getElementById('medicineError');
        if (errorEl) errorEl.textContent = 'Please select a medicine';
        if (medicineSelect) medicineSelect.classList.add('error');
        isValid = false;
    }
    
    // Adjustment type validation
    if (!adjustType) {
        const errorEl = document.getElementById('typeError');
        if (errorEl) errorEl.textContent = 'Please select adjustment type';
        if (typeSelect) typeSelect.classList.add('error');
        isValid = false;
    }
    
    // Quantity validation
    if (!quantity || quantity <= 0) {
        const errorEl = document.getElementById('quantityError');
        if (errorEl) errorEl.textContent = 'Please enter a valid quantity (minimum 1)';
        if (quantityInput) quantityInput.classList.add('error');
        isValid = false;
    } else if (quantity > 10000) {
        const errorEl = document.getElementById('quantityError');
        if (errorEl) errorEl.textContent = 'Quantity cannot exceed 10,000';
        if (quantityInput) quantityInput.classList.add('error');
        isValid = false;
    }
    
    // Reason validation
    if (!reason || reason.trim() === '') {
        const errorEl = document.getElementById('reasonError');
        if (errorEl) errorEl.textContent = 'Please provide a reason for adjustment';
        if (reasonTextarea) reasonTextarea.classList.add('error');
        isValid = false;
    } else if (reason.trim().length < 5) {
        const errorEl = document.getElementById('reasonError');
        if (errorEl) errorEl.textContent = 'Reason must be at least 5 characters';
        if (reasonTextarea) reasonTextarea.classList.add('error');
        isValid = false;
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
    // Refresh medicines
    const storedMedicines = localStorage.getItem('pharmacy_medicines');
    if (storedMedicines) medicines = JSON.parse(storedMedicines);
    populateSelects();
    
    document.getElementById('adjustForm').reset();
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-clipboard-list"></i> Stock Adjustment';
    
    // Reset stock warning
    const stockWarning = document.getElementById('stockWarning');
    if (stockWarning) {
        stockWarning.className = 'stock-warning';
        stockWarning.innerHTML = '';
    }
    
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) quantityInput.disabled = false;
    
    // Clear errors
    const errorFields = ['medicineError', 'typeError', 'quantityError', 'reasonError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    ['medicineId', 'adjustType', 'quantity', 'reason'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('error');
    });
    
    openModal('adjustModal');
}

// ─── Form Submit ────────────────────────────────────

function saveAdjustment(e) {
    e.preventDefault();
    
    const medicineId = parseInt(document.getElementById('medicineId').value) || null;
    const adjustType = document.getElementById('adjustType').value;
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const reason = document.getElementById('reason').value.trim();
    
    const medicine = medicines.find(m => m.id === medicineId);
    
    if (!validateAdjustmentForm(medicineId, adjustType, quantity, reason)) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    if (!medicine) {
        showToast('Invalid medicine selected', 'error');
        return;
    }
    
    // Check stock for removal types
    if ((adjustType === 'Remove' || adjustType === 'Damage' || adjustType === 'Expiry') && (medicine.stock || 0) < quantity) {
        showToast(`Insufficient stock! Only ${medicine.stock || 0} ${medicine.unit || 'units'} available`, 'error');
        return;
    }
    
    // Update medicine stock
    const medicineIndex = medicines.findIndex(m => m.id === medicineId);
    if (medicineIndex !== -1) {
        if (adjustType === 'Add') {
            medicines[medicineIndex].stock = (medicines[medicineIndex].stock || 0) + quantity;
        } else if (adjustType === 'Remove' || adjustType === 'Damage' || adjustType === 'Expiry') {
            medicines[medicineIndex].stock = (medicines[medicineIndex].stock || 0) - quantity;
        }
        localStorage.setItem('pharmacy_medicines', JSON.stringify(medicines));
    }
    
    const newId = adjustments.length > 0 ? Math.max(...adjustments.map(a => a.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];
    
    const newAdjustment = {
        id: newId,
        medicineId: medicineId,
        medicineName: medicine.name,
        type: adjustType,
        quantity: quantity,
        reason: reason,
        date: today
    };
    
    adjustments.push(newAdjustment);
    saveAdjustments();
    refreshUI();
    closeModal('adjustModal');
    
    let actionText = '';
    const unit = medicine.unit || 'units';
    if (adjustType === 'Add') {
        actionText = `Added ${quantity} ${unit} of "${medicine.name}" to stock`;
    } else if (adjustType === 'Remove') {
        actionText = `Removed ${quantity} ${unit} from stock of "${medicine.name}"`;
    } else if (adjustType === 'Damage') {
        actionText = `Marked ${quantity} ${unit} of "${medicine.name}" as damaged`;
    } else if (adjustType === 'Expiry') {
        actionText = `Marked ${quantity} ${unit} of "${medicine.name}" as expired`;
    }
    
    showToast(`✅ ${actionText}`, 'success');
}

// ─── Delete ──────────────────────────────────────────

function deleteAdjustment(id) {
    const adjustment = adjustments.find(a => a.id === id);
    if (!adjustment) return;
    
    if (confirm(`Are you sure you want to delete this adjustment record? This will NOT revert stock changes.`)) {
        adjustments = adjustments.filter(a => a.id !== id);
        saveAdjustments();
        refreshUI();
        showToast(`🗑️ Adjustment record deleted successfully`, 'success');
    }
}

// ─── Init ────────────────────────────────────────────

function initAdjustmentsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('adjustBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('adjustModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('adjustModal'));
    document.getElementById('adjustForm')?.addEventListener('submit', saveAdjustment);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        typeFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('typeFilter')?.addEventListener('change', (e) => {
        typeFilter = e.target.value;
        renderTable();
    });
    
    // Stock warning on medicine and type select
    document.getElementById('medicineId')?.addEventListener('change', updateStockWarning);
    document.getElementById('adjustType')?.addEventListener('change', updateStockWarning);
    
    // Close modal on overlay click
    document.getElementById('adjustModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('adjustModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('adjustModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initAdjustmentsModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initAdjustmentsModule();
    }, 3000);
});