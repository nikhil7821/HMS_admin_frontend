/**
 * Stock Adjustments Management Module
 * MedFlow Pharmacy - Stock Corrections, Damages, Expiry CRUD
 * Matching Executive Dashboard UI/UX - Indian Context
 */

// Data Stores
let adjustments = [];
let medicines = [];

// Helper: Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Toast notification
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
    toast.innerHTML = `<i class="fas ${icons[type]} text-sm"></i><span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

// Save adjustments to localStorage
function saveAdjustments() {
    localStorage.setItem('pharmacy_adjustments', JSON.stringify(adjustments));
}

// Update statistics
function updateStats() {
    const totalAdjustmentsEl = document.getElementById('totalAdjustments');
    const totalAddedEl = document.getElementById('totalAdded');
    const totalRemovedEl = document.getElementById('totalRemoved');
    const totalLossEl = document.getElementById('totalLoss');
    
    if (totalAdjustmentsEl) totalAdjustmentsEl.innerText = adjustments.length;
    
    const added = adjustments.filter(a => a.type === 'Add').reduce((sum, a) => sum + a.quantity, 0);
    const removed = adjustments.filter(a => a.type === 'Remove').reduce((sum, a) => sum + a.quantity, 0);
    const loss = adjustments.filter(a => a.type === 'Damage' || a.type === 'Expiry').reduce((sum, a) => sum + a.quantity, 0);
    
    if (totalAddedEl) totalAddedEl.innerText = added;
    if (totalRemovedEl) totalRemovedEl.innerText = removed;
    if (totalLossEl) totalLossEl.innerText = loss;
}

// Load data from localStorage
function loadData() {
    // Load medicines from pharmacy
    const storedMedicines = localStorage.getItem('pharmacy_medicines');
    if (storedMedicines) {
        medicines = JSON.parse(storedMedicines);
    } else {
        medicines = [];
    }
    
    // Load adjustments
    const storedAdjustments = localStorage.getItem('pharmacy_adjustments');
    if (storedAdjustments) {
        adjustments = JSON.parse(storedAdjustments);
    } else {
        adjustments = [];
    }
    
    renderTable();
    populateSelects();
    updateStats();
}

// Validate adjustment form
function validateAdjustmentForm(medicineId, adjustType, quantity, reason) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['medicineError', 'typeError', 'quantityError', 'reasonError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    
    const medicineSelect = document.getElementById('medicineId');
    const typeSelect = document.getElementById('adjustType');
    const quantityInput = document.getElementById('quantity');
    const reasonTextarea = document.getElementById('reason');
    
    if (medicineSelect) medicineSelect.classList.remove('error');
    if (typeSelect) typeSelect.classList.remove('error');
    if (quantityInput) quantityInput.classList.remove('error');
    if (reasonTextarea) reasonTextarea.classList.remove('error');
    
    // Medicine validation
    if (!medicineId) {
        const errorEl = document.getElementById('medicineError');
        if (errorEl) errorEl.innerText = 'Please select a medicine';
        if (medicineSelect) medicineSelect.classList.add('error');
        isValid = false;
    }
    
    // Adjustment type validation
    if (!adjustType) {
        const errorEl = document.getElementById('typeError');
        if (errorEl) errorEl.innerText = 'Please select adjustment type';
        if (typeSelect) typeSelect.classList.add('error');
        isValid = false;
    }
    
    // Quantity validation
    if (!quantity || quantity <= 0) {
        const errorEl = document.getElementById('quantityError');
        if (errorEl) errorEl.innerText = 'Please enter a valid quantity (minimum 1)';
        if (quantityInput) quantityInput.classList.add('error');
        isValid = false;
    } else if (quantity > 10000) {
        const errorEl = document.getElementById('quantityError');
        if (errorEl) errorEl.innerText = 'Quantity cannot exceed 10,000';
        if (quantityInput) quantityInput.classList.add('error');
        isValid = false;
    }
    
    // Reason validation
    if (!reason || reason.trim() === '') {
        const errorEl = document.getElementById('reasonError');
        if (errorEl) errorEl.innerText = 'Please provide a reason for adjustment';
        if (reasonTextarea) reasonTextarea.classList.add('error');
        isValid = false;
    } else if (reason.trim().length < 5) {
        const errorEl = document.getElementById('reasonError');
        if (errorEl) errorEl.innerText = 'Reason must be at least 5 characters';
        if (reasonTextarea) reasonTextarea.classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// Get badge class based on adjustment type
function getBadgeClass(type) {
    switch(type) {
        case 'Add': return 'badge-add';
        case 'Remove': return 'badge-remove';
        case 'Damage': return 'badge-damage';
        case 'Expiry': return 'badge-expiry';
        default: return 'badge-add';
    }
}

// Render adjustments table
function renderTable() {
    const tbody = document.getElementById('adjustmentsTable');
    if (!tbody) return;
    
    if (adjustments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-[#d4c9bc] text-sm"><i class="fas fa-folder-open mr-2"></i>No adjustments recorded. Click "New Adjustment" to create one.</div></tr></div>`;
        return;
    }
    
    // Sort by date descending (newest first)
    const sortedAdjustments = [...adjustments].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedAdjustments.map(adj => {
        const badgeClass = getBadgeClass(adj.type);
        let typeDisplay = adj.type;
        if (adj.type === 'Add') typeDisplay = '➕ Add Stock';
        else if (adj.type === 'Remove') typeDisplay = '➖ Remove Stock';
        else if (adj.type === 'Damage') typeDisplay = '⚠️ Damage';
        else if (adj.type === 'Expiry') typeDisplay = '📅 Expiry';
        
        return `
            <tr class="dashboard-table-row">
                <td class="px-5 py-3 text-sm text-[#5a4a3a]">${adj.date}</div>
                <td class="px-5 py-3 text-sm font-medium text-[#5a4a3a]">${escapeHtml(adj.medicineName)}</div>
                <td class="px-5 py-3"><span class="${badgeClass}">${typeDisplay}</span></div>
                <td class="px-5 py-3 text-sm text-[#5a4a3a]">${adj.quantity}</div>
                <td class="px-5 py-3 text-sm text-[#9a8e82] max-w-xs truncate">${escapeHtml(adj.reason)}</div>
                <td class="px-5 py-3 text-center">
                    <button onclick="window.deleteAdjustmentHandler(${adj.id})" class="action-delete text-base transition" title="Delete Adjustment">
                        <i class="fas fa-trash"></i>
                    </button>
                 </div>
             </div>
        `;
    }).join('');
}

// Populate medicine select
function populateSelects() {
    const medicineSelect = document.getElementById('medicineId');
    if (medicineSelect) {
        medicineSelect.innerHTML = '<option value="">Select Medicine</option>' + 
            medicines.map(m => `<option value="${m.id}">${escapeHtml(m.name)} ${m.brand ? '(' + escapeHtml(m.brand) + ')' : ''} - Current Stock: ${m.stock} ${m.unit || ''}</option>`).join('');
    }
}

// Update stock warning based on selected medicine and type
function updateStockWarning() {
    const medicineId = parseInt(document.getElementById('medicineId')?.value) || null;
    const adjustType = document.getElementById('adjustType')?.value || '';
    const medicine = medicines.find(m => m.id === medicineId);
    const stockWarning = document.getElementById('stockWarning');
    const quantityInput = document.getElementById('quantity');
    
    if (medicine && stockWarning) {
        if ((adjustType === 'Remove' || adjustType === 'Damage' || adjustType === 'Expiry') && medicine.stock === 0) {
            stockWarning.innerHTML = `<i class="fas fa-times-circle mr-1"></i>Out of stock! Cannot remove/damage/expire this medicine`;
            stockWarning.style.color = '#d8b48c';
            if (quantityInput) quantityInput.disabled = true;
        } else if ((adjustType === 'Remove' || adjustType === 'Damage' || adjustType === 'Expiry') && medicine.stock < 100 && medicine.stock > 0) {
            stockWarning.innerHTML = `<i class="fas fa-exclamation-triangle mr-1"></i>Low stock warning: Only ${medicine.stock} ${medicine.unit || 'units'} available`;
            stockWarning.style.color = '#d4a853';
            if (quantityInput) quantityInput.disabled = false;
        } else {
            stockWarning.innerHTML = '';
            if (quantityInput) quantityInput.disabled = false;
        }
    } else if (stockWarning) {
        stockWarning.innerHTML = '';
        if (quantityInput) quantityInput.disabled = false;
    }
}

// Modal management
const modal = document.getElementById('adjustModal');
const form = document.getElementById('adjustForm');

function openModal() {
    if (!modal) return;
    // Refresh medicines before opening
    const storedMedicines = localStorage.getItem('pharmacy_medicines');
    if (storedMedicines) medicines = JSON.parse(storedMedicines);
    populateSelects();
    
    modal.classList.remove('opacity-0', 'invisible');
    modal.classList.add('opacity-100', 'visible');
    const modalCard = modal.querySelector('.form-card');
    if (modalCard) {
        modalCard.classList.remove('scale-95');
        modalCard.classList.add('scale-100');
    }
}

function closeModal() {
    if (!modal) return;
    modal.classList.add('opacity-0', 'invisible');
    modal.classList.remove('opacity-100', 'visible');
    const modalCard = modal.querySelector('.form-card');
    if (modalCard) {
        modalCard.classList.add('scale-95');
        modalCard.classList.remove('scale-100');
    }
    if (form) form.reset();
    
    // Clear errors
    const errorFields = ['medicineError', 'typeError', 'quantityError', 'reasonError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    const inputs = ['medicineId', 'adjustType', 'quantity', 'reason'];
    inputs.forEach(input => {
        const el = document.getElementById(input);
        if (el) el.classList.remove('error');
    });
    
    const stockWarning = document.getElementById('stockWarning');
    if (stockWarning) stockWarning.innerHTML = '';
    
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) quantityInput.disabled = false;
}

// Add adjustment
function addAdjustment() {
    openModal();
}

// Delete adjustment handler
window.deleteAdjustmentHandler = function(id) {
    const adjustment = adjustments.find(a => a.id === id);
    if (!adjustment) return;
    
    if (confirm(`Are you sure you want to delete this adjustment record? This will NOT revert stock changes.`)) {
        adjustments = adjustments.filter(a => a.id !== id);
        saveAdjustments();
        renderTable();
        updateStats();
        showToast(`Adjustment record deleted successfully`, 'success');
    }
};

// Save adjustment
function saveAdjustmentHandler(e) {
    e.preventDefault();
    
    const medicineId = parseInt(document.getElementById('medicineId')?.value) || null;
    const adjustType = document.getElementById('adjustType')?.value || '';
    const quantity = parseInt(document.getElementById('quantity')?.value) || 0;
    const reason = document.getElementById('reason')?.value.trim() || '';
    
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
    if ((adjustType === 'Remove' || adjustType === 'Damage' || adjustType === 'Expiry') && medicine.stock < quantity) {
        showToast(`Insufficient stock! Only ${medicine.stock} ${medicine.unit || 'units'} available`, 'error');
        return;
    }
    
    // Update medicine stock
    const medicineIndex = medicines.findIndex(m => m.id === medicineId);
    if (medicineIndex !== -1) {
        if (adjustType === 'Add') {
            medicines[medicineIndex].stock += quantity;
        } else if (adjustType === 'Remove' || adjustType === 'Damage' || adjustType === 'Expiry') {
            medicines[medicineIndex].stock -= quantity;
        }
        medicines[medicineIndex].status = medicines[medicineIndex].stock < 100 ? 'Low Stock' : 'In Stock';
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
    renderTable();
    updateStats();
    
    let actionText = '';
    if (adjustType === 'Add') actionText = `Added ${quantity} ${medicine.unit || 'units'} to stock of "${medicine.name}"`;
    else if (adjustType === 'Remove') actionText = `Removed ${quantity} ${medicine.unit || 'units'} from stock of "${medicine.name}"`;
    else if (adjustType === 'Damage') actionText = `Marked ${quantity} ${medicine.unit || 'units'} of "${medicine.name}" as damaged`;
    else if (adjustType === 'Expiry') actionText = `Marked ${quantity} ${medicine.unit || 'units'} of "${medicine.name}" as expired`;
    
    showToast(`${actionText}`, 'success');
    closeModal();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    const addBtn = document.getElementById('adjustBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalOverlay = document.querySelector('#adjustModal .modal-overlay');
    const adjustForm = document.getElementById('adjustForm');
    const medicineSelect = document.getElementById('medicineId');
    const typeSelect = document.getElementById('adjustType');
    
    if (addBtn) addBtn.addEventListener('click', addAdjustment);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (adjustForm) adjustForm.addEventListener('submit', saveAdjustmentHandler);
    if (medicineSelect) medicineSelect.addEventListener('change', updateStockWarning);
    if (typeSelect) typeSelect.addEventListener('change', updateStockWarning);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('invisible')) {
            closeModal();
        }
    });
});