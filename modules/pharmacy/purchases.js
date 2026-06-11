/**
 * Purchases Management Module
 * MedFlow Pharmacy - Purchase Orders CRUD
 * Matching Executive Dashboard UI/UX - Indian Context (₹)
 */

// Data Stores
let purchases = [];
let suppliers = [];
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

// Save purchases to localStorage
function savePurchases() {
    localStorage.setItem('pharmacy_purchases', JSON.stringify(purchases));
}

// Update statistics
function updateStats() {
    const totalPurchasesEl = document.getElementById('totalPurchases');
    const totalQuantityEl = document.getElementById('totalQuantity');
    const totalInvestmentEl = document.getElementById('totalInvestment');
    
    if (totalPurchasesEl) totalPurchasesEl.innerText = purchases.length;
    
    const totalQty = purchases.reduce((sum, p) => sum + p.quantity, 0);
    if (totalQuantityEl) totalQuantityEl.innerText = totalQty;
    
    const totalInv = purchases.reduce((sum, p) => sum + p.total, 0);
    if (totalInvestmentEl) totalInvestmentEl.innerText = '₹' + totalInv.toLocaleString('en-IN');
}

// Load data from localStorage
function loadData() {
    // Load suppliers
    const storedSuppliers = localStorage.getItem('pharmacy_suppliers');
    if (storedSuppliers) {
        suppliers = JSON.parse(storedSuppliers);
    } else {
        suppliers = [];
    }
    
    // Load medicines
    const storedMedicines = localStorage.getItem('pharmacy_medicines');
    if (storedMedicines) {
        medicines = JSON.parse(storedMedicines);
    } else {
        medicines = [];
    }
    
    // Load purchases
    const storedPurchases = localStorage.getItem('pharmacy_purchases');
    if (storedPurchases) {
        purchases = JSON.parse(storedPurchases);
    } else {
        purchases = [];
        // Add some sample purchase data if needed
        if (medicines.length > 0 && suppliers.length > 0) {
            // Optional: Add demo data
        }
    }
    
    renderTable();
    populateSelects();
    updateStats();
}

// Validate purchase form
function validatePurchaseForm(supplierId, medicineId, quantity, unitPrice, purchaseDate) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['supplierError', 'medicineError', 'quantityError', 'unitPriceError', 'dateError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    
    const supplierSelect = document.getElementById('supplierId');
    const medicineSelect = document.getElementById('medicineId');
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('unitPrice');
    const dateInput = document.getElementById('purchaseDate');
    
    if (supplierSelect) supplierSelect.classList.remove('error');
    if (medicineSelect) medicineSelect.classList.remove('error');
    if (quantityInput) quantityInput.classList.remove('error');
    if (priceInput) priceInput.classList.remove('error');
    if (dateInput) dateInput.classList.remove('error');
    
    // Supplier validation
    if (!supplierId) {
        const errorEl = document.getElementById('supplierError');
        if (errorEl) errorEl.innerText = 'Please select a supplier';
        if (supplierSelect) supplierSelect.classList.add('error');
        isValid = false;
    }
    
    // Medicine validation
    if (!medicineId) {
        const errorEl = document.getElementById('medicineError');
        if (errorEl) errorEl.innerText = 'Please select a medicine';
        if (medicineSelect) medicineSelect.classList.add('error');
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
    
    // Unit price validation
    if (!unitPrice || unitPrice <= 0) {
        const errorEl = document.getElementById('unitPriceError');
        if (errorEl) errorEl.innerText = 'Please enter a valid unit price';
        if (priceInput) priceInput.classList.add('error');
        isValid = false;
    } else if (unitPrice > 100000) {
        const errorEl = document.getElementById('unitPriceError');
        if (errorEl) errorEl.innerText = 'Unit price cannot exceed ₹1,00,000';
        if (priceInput) priceInput.classList.add('error');
        isValid = false;
    }
    
    // Date validation
    if (!purchaseDate) {
        const errorEl = document.getElementById('dateError');
        if (errorEl) errorEl.innerText = 'Please select purchase date';
        if (dateInput) dateInput.classList.add('error');
        isValid = false;
    } else {
        const selectedDate = new Date(purchaseDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
            const errorEl = document.getElementById('dateError');
            if (errorEl) errorEl.innerText = 'Purchase date cannot be in the future';
            if (dateInput) dateInput.classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
}

// Render purchases table
function renderTable() {
    const tbody = document.getElementById('purchasesTable');
    if (!tbody) return;
    
    if (purchases.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-[#d4c9bc] text-sm"><i class="fas fa-folder-open mr-2"></i>No purchase orders found. Click "New Purchase" to create one.</div></td></div>`;
        return;
    }
    
    // Sort by date descending (newest first)
    const sortedPurchases = [...purchases].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedPurchases.map(purchase => `
        <tr class="dashboard-table-row">
            <td class="px-5 py-3">
                <span class="badge-purchase">PO-${purchase.id}</span>
             </div>
            <td class="px-5 py-3 text-sm text-[#5a4a3a]">${purchase.date}</div>
            <td class="px-5 py-3 text-sm font-medium text-[#5a4a3a]">${escapeHtml(purchase.supplierName)}</div>
            <td class="px-5 py-3 text-sm text-[#9a8e82]">${escapeHtml(purchase.medicineName)}</div>
            <td class="px-5 py-3 text-sm text-[#5a4a3a]">${purchase.quantity}</div>
            <td class="px-5 py-3 text-sm text-[#5a4a3a]">₹${purchase.unitPrice.toLocaleString('en-IN')}</div>
            <td class="px-5 py-3 text-sm font-semibold text-[#8aae7a]">₹${purchase.total.toLocaleString('en-IN')}</div>
            <td class="px-5 py-3 text-sm text-[#9a8e82]">${escapeHtml(purchase.invoiceNo || '—')}</div>
            <td class="px-5 py-3 text-center">
                <button onclick="window.deletePurchaseHandler(${purchase.id})" class="action-delete text-base transition" title="Delete Purchase">
                    <i class="fas fa-trash"></i>
                </button>
             </div>
         </div>
    `).join('');
}

// Populate selects
function populateSelects() {
    const supplierSelect = document.getElementById('supplierId');
    if (supplierSelect) {
        supplierSelect.innerHTML = '<option value="">Select Supplier</option>' + 
            suppliers.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    }
    
    const medicineSelect = document.getElementById('medicineId');
    if (medicineSelect) {
        medicineSelect.innerHTML = '<option value="">Select Medicine</option>' + 
            medicines.map(m => `<option value="${m.id}">${escapeHtml(m.name)} ${m.brand ? '(' + escapeHtml(m.brand) + ')' : ''} - Current Stock: ${m.stock}</option>`).join('');
    }
}

// Calculate and update total preview
function updateTotalPreview() {
    const quantity = parseInt(document.getElementById('quantity')?.value) || 0;
    const unitPrice = parseFloat(document.getElementById('unitPrice')?.value) || 0;
    const total = quantity * unitPrice;
    const totalPreview = document.getElementById('totalAmountPreview');
    if (totalPreview) {
        totalPreview.innerText = '₹' + total.toLocaleString('en-IN');
        if (total > 0) {
            totalPreview.style.color = '#8aae7a';
        } else {
            totalPreview.style.color = '#d4c9bc';
        }
    }
}

// Modal management
const modal = document.getElementById('purchaseModal');
const form = document.getElementById('purchaseForm');

function openModal() {
    if (!modal) return;
    modal.classList.remove('opacity-0', 'invisible');
    modal.classList.add('opacity-100', 'visible');
    const modalCard = modal.querySelector('.form-card');
    if (modalCard) {
        modalCard.classList.remove('scale-95');
        modalCard.classList.add('scale-100');
    }
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('purchaseDate');
    if (dateInput) dateInput.value = today;
    
    // Reset total preview
    const totalPreview = document.getElementById('totalAmountPreview');
    if (totalPreview) totalPreview.innerText = '₹0.00';
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
    const errorFields = ['supplierError', 'medicineError', 'quantityError', 'unitPriceError', 'dateError', 'invoiceError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    const inputs = ['supplierId', 'medicineId', 'quantity', 'unitPrice', 'purchaseDate'];
    inputs.forEach(input => {
        const el = document.getElementById(input);
        if (el) el.classList.remove('error');
    });
}

// Add purchase
function addPurchase() {
    // Refresh suppliers and medicines before opening
    const storedSuppliers = localStorage.getItem('pharmacy_suppliers');
    const storedMedicines = localStorage.getItem('pharmacy_medicines');
    if (storedSuppliers) suppliers = JSON.parse(storedSuppliers);
    if (storedMedicines) medicines = JSON.parse(storedMedicines);
    populateSelects();
    openModal();
}

// Delete purchase handler
window.deletePurchaseHandler = function(id) {
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;
    
    if (confirm(`Are you sure you want to delete purchase order PO-${id}? This will NOT revert stock changes.`)) {
        purchases = purchases.filter(p => p.id !== id);
        savePurchases();
        renderTable();
        updateStats();
        showToast(`Purchase order PO-${id} deleted successfully`, 'success');
    }
};

// Save purchase (add only, no edit)
function savePurchaseHandler(e) {
    e.preventDefault();
    
    const supplierId = parseInt(document.getElementById('supplierId')?.value) || null;
    const medicineId = parseInt(document.getElementById('medicineId')?.value) || null;
    const quantity = parseInt(document.getElementById('quantity')?.value) || 0;
    const unitPrice = parseFloat(document.getElementById('unitPrice')?.value) || 0;
    const purchaseDate = document.getElementById('purchaseDate')?.value || '';
    const invoiceNo = document.getElementById('invoiceNo')?.value.trim() || '';
    
    if (!validatePurchaseForm(supplierId, medicineId, quantity, unitPrice, purchaseDate)) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    const supplier = suppliers.find(s => s.id === supplierId);
    const medicine = medicines.find(m => m.id === medicineId);
    
    if (!supplier || !medicine) {
        showToast('Invalid supplier or medicine selected', 'error');
        return;
    }
    
    const total = quantity * unitPrice;
    const newId = purchases.length > 0 ? Math.max(...purchases.map(p => p.id)) + 1 : 1;
    
    const newPurchase = {
        id: newId,
        supplierId: supplierId,
        supplierName: supplier.name,
        medicineId: medicineId,
        medicineName: medicine.name,
        quantity: quantity,
        unitPrice: unitPrice,
        total: total,
        date: purchaseDate,
        invoiceNo: invoiceNo
    };
    
    purchases.push(newPurchase);
    
    // Update medicine stock
    const medicineIndex = medicines.findIndex(m => m.id === medicineId);
    if (medicineIndex !== -1) {
        medicines[medicineIndex].stock += quantity;
        medicines[medicineIndex].status = medicines[medicineIndex].stock < 100 ? 'Low Stock' : 'In Stock';
        localStorage.setItem('pharmacy_medicines', JSON.stringify(medicines));
    }
    
    savePurchases();
    renderTable();
    updateStats();
    showToast(`Purchase recorded! Added ${quantity} ${medicine.unit || 'units'} of "${medicine.name}" to stock.`, 'success');
    closeModal();
}

// Real-time total preview
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    const addBtn = document.getElementById('addPurchaseBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalOverlay = document.querySelector('#purchaseModal .modal-overlay');
    const purchaseForm = document.getElementById('purchaseForm');
    const quantityInput = document.getElementById('quantity');
    const unitPriceInput = document.getElementById('unitPrice');
    
    if (addBtn) addBtn.addEventListener('click', addPurchase);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (purchaseForm) purchaseForm.addEventListener('submit', savePurchaseHandler);
    
    if (quantityInput) quantityInput.addEventListener('input', updateTotalPreview);
    if (unitPriceInput) unitPriceInput.addEventListener('input', updateTotalPreview);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('invisible')) {
            closeModal();
        }
    });
});