/**
 * Purchases Management Module
 * MedFlow Pharmacy - Purchase Orders CRUD
 * Uses theme.css for styling, clean event handling
 */

let purchases = [];
let suppliers = [];
let medicines = [];
let searchTerm = '';
let supplierFilter = '';
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
        // Load suppliers
        const storedSuppliers = localStorage.getItem('pharmacy_suppliers');
        suppliers = storedSuppliers ? JSON.parse(storedSuppliers) : [];
        
        // Load medicines
        const storedMedicines = localStorage.getItem('pharmacy_medicines');
        medicines = storedMedicines ? JSON.parse(storedMedicines) : [];
        
        // Load purchases
        const storedPurchases = localStorage.getItem('pharmacy_purchases');
        if (storedPurchases) {
            purchases = JSON.parse(storedPurchases);
        } else {
            purchases = [];
            // Create sample purchase if data exists
            if (medicines.length > 0 && suppliers.length > 0) {
                const today = new Date().toISOString().split('T')[0];
                purchases = [
                    {
                        id: 1,
                        supplierId: 1,
                        supplierName: 'Medico Pharma Distributors',
                        medicineId: 1,
                        medicineName: 'Paracetamol',
                        quantity: 100,
                        unitPrice: 20,
                        total: 2000,
                        date: today,
                        invoiceNo: 'INV-001'
                    },
                    {
                        id: 2,
                        supplierId: 2,
                        supplierName: 'HealthCare Ltd India',
                        medicineId: 2,
                        medicineName: 'Amoxicillin',
                        quantity: 50,
                        unitPrice: 75,
                        total: 3750,
                        date: today,
                        invoiceNo: 'INV-002'
                    }
                ];
                savePurchases();
            }
        }
        refreshUI();
        populateSelects();
        populateSupplierFilter();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data', 'error');
    }
}

function savePurchases() {
    try {
        localStorage.setItem('pharmacy_purchases', JSON.stringify(purchases));
    } catch (error) {
        console.error('Error saving purchases:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = purchases.length;
    const totalQty = purchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalInv = purchases.reduce((sum, p) => sum + p.total, 0);
    
    document.getElementById('totalPurchases').textContent = total;
    document.getElementById('totalQuantity').textContent = totalQty;
    document.getElementById('totalInvestment').textContent = '₹' + totalInv.toLocaleString('en-IN');
    document.getElementById('lastUpdated').textContent = 
        new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Filter ──────────────────────────────────────────

function getFilteredPurchases() {
    return purchases.filter(p => {
        const matchesSearch = searchTerm === '' || 
            p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSupplier = supplierFilter === '' || p.supplierId.toString() === supplierFilter;
        
        return matchesSearch && matchesSupplier;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('purchasesTable');
    if (!tbody) return;
    
    const filtered = getFilteredPurchases();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="purchases-empty">
                    <i class="fas fa-folder-open"></i>
                    <p>No purchase orders found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Create a new purchase to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date descending (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(p => `
        <tr class="purchase-row" data-id="${p.id}">
            <td><span class="badge-purchase">PO-${p.id}</span></td>
            <td style="color:var(--color-brown-600); font-size:0.8125rem;">${p.date}</td>
            <td class="supplier-name">${esc(p.supplierName)}</td>
            <td class="medicine-name">${esc(p.medicineName)}</td>
            <td style="text-align:center; color:var(--color-brown-600);">${p.quantity}</td>
            <td style="text-align:center; color:var(--color-brown-600);">₹${p.unitPrice.toLocaleString('en-IN')}</td>
            <td style="text-align:center;" class="total-amount">₹${p.total.toLocaleString('en-IN')}</td>
            <td style="color:var(--color-brown-300); font-size:0.8125rem;">${p.invoiceNo ? esc(p.invoiceNo) : '—'}</td>
            <td style="text-align:center;">
                <button class="action-btn delete delete-btn" data-id="${p.id}" title="Delete Purchase">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Bind events
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deletePurchase(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Populate Selects ──────────────────────────────

function populateSelects() {
    // Supplier select in modal
    const supplierSelect = document.getElementById('supplierId');
    if (supplierSelect) {
        supplierSelect.innerHTML = '<option value="">Select Supplier</option>' + 
            suppliers.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
    }
    
    // Medicine select in modal
    const medicineSelect = document.getElementById('medicineId');
    if (medicineSelect) {
        medicineSelect.innerHTML = '<option value="">Select Medicine</option>' + 
            medicines.map(m => 
                `<option value="${m.id}">${esc(m.name)} ${m.brand ? '(' + esc(m.brand) + ')' : ''} - Stock: ${m.stock || 0}</option>`
            ).join('');
    }
}

function populateSupplierFilter() {
    const filterSelect = document.getElementById('supplierFilter');
    if (filterSelect) {
        const uniqueSuppliers = [...new Set(purchases.map(p => p.supplierId))];
        const supplierMap = {};
        purchases.forEach(p => {
            if (!supplierMap[p.supplierId]) {
                supplierMap[p.supplierId] = p.supplierName;
            }
        });
        filterSelect.innerHTML = '<option value="">All Suppliers</option>' + 
            Object.entries(supplierMap).map(([id, name]) => 
                `<option value="${id}">${esc(name)}</option>`
            ).join('');
    }
}

// ─── Validation ──────────────────────────────────────

function validatePurchaseForm(supplierId, medicineId, quantity, unitPrice, purchaseDate) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['supplierError', 'medicineError', 'quantityError', 'unitPriceError', 'dateError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    
    const supplierSelect = document.getElementById('supplierId');
    const medicineSelect = document.getElementById('medicineId');
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('unitPrice');
    const dateInput = document.getElementById('purchaseDate');
    
    [supplierSelect, medicineSelect, quantityInput, priceInput, dateInput].forEach(el => {
        if (el) el.classList.remove('error');
    });
    
    // Supplier validation
    if (!supplierId) {
        const errorEl = document.getElementById('supplierError');
        if (errorEl) errorEl.textContent = 'Please select a supplier';
        if (supplierSelect) supplierSelect.classList.add('error');
        isValid = false;
    }
    
    // Medicine validation
    if (!medicineId) {
        const errorEl = document.getElementById('medicineError');
        if (errorEl) errorEl.textContent = 'Please select a medicine';
        if (medicineSelect) medicineSelect.classList.add('error');
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
    
    // Unit price validation
    if (!unitPrice || unitPrice <= 0) {
        const errorEl = document.getElementById('unitPriceError');
        if (errorEl) errorEl.textContent = 'Please enter a valid unit price';
        if (priceInput) priceInput.classList.add('error');
        isValid = false;
    } else if (unitPrice > 100000) {
        const errorEl = document.getElementById('unitPriceError');
        if (errorEl) errorEl.textContent = 'Unit price cannot exceed ₹1,00,000';
        if (priceInput) priceInput.classList.add('error');
        isValid = false;
    }
    
    // Date validation
    if (!purchaseDate) {
        const errorEl = document.getElementById('dateError');
        if (errorEl) errorEl.textContent = 'Please select purchase date';
        if (dateInput) dateInput.classList.add('error');
        isValid = false;
    } else {
        const selectedDate = new Date(purchaseDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
            const errorEl = document.getElementById('dateError');
            if (errorEl) errorEl.textContent = 'Purchase date cannot be in the future';
            if (dateInput) dateInput.classList.add('error');
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
    // Refresh data
    const storedSuppliers = localStorage.getItem('pharmacy_suppliers');
    const storedMedicines = localStorage.getItem('pharmacy_medicines');
    if (storedSuppliers) suppliers = JSON.parse(storedSuppliers);
    if (storedMedicines) medicines = JSON.parse(storedMedicines);
    populateSelects();
    
    document.getElementById('purchaseForm').reset();
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-shopping-cart"></i> New Purchase Order';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('purchaseDate');
    if (dateInput) dateInput.value = today;
    
    // Reset total preview
    const totalPreview = document.getElementById('totalAmountPreview');
    if (totalPreview) {
        totalPreview.textContent = '₹0.00';
        totalPreview.className = 'total-amount zero';
    }
    
    // Clear errors
    const errorFields = ['supplierError', 'medicineError', 'quantityError', 'unitPriceError', 'dateError', 'invoiceError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    ['supplierId', 'medicineId', 'quantity', 'unitPrice', 'purchaseDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('error');
    });
    
    openModal('purchaseModal');
}

// ─── Form Submit ────────────────────────────────────

function savePurchase(e) {
    e.preventDefault();
    
    const supplierId = parseInt(document.getElementById('supplierId').value) || null;
    const medicineId = parseInt(document.getElementById('medicineId').value) || null;
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
    const purchaseDate = document.getElementById('purchaseDate').value;
    const invoiceNo = document.getElementById('invoiceNo').value.trim();
    
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
        medicines[medicineIndex].stock = (medicines[medicineIndex].stock || 0) + quantity;
        localStorage.setItem('pharmacy_medicines', JSON.stringify(medicines));
    }
    
    savePurchases();
    refreshUI();
    populateSupplierFilter();
    closeModal('purchaseModal');
    
    showToast(`✅ Purchase recorded! Added ${quantity} ${medicine.unit || 'units'} of "${medicine.name}" to stock.`, 'success');
}

// ─── Delete ──────────────────────────────────────────

function deletePurchase(id) {
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;
    
    if (confirm(`Are you sure you want to delete purchase order PO-${id}? This will NOT revert stock changes.`)) {
        purchases = purchases.filter(p => p.id !== id);
        savePurchases();
        refreshUI();
        populateSupplierFilter();
        showToast(`🗑️ Purchase order PO-${id} deleted successfully`, 'success');
    }
}

// ─── Total Preview ──────────────────────────────────

function updateTotalPreview() {
    const quantity = parseInt(document.getElementById('quantity')?.value) || 0;
    const unitPrice = parseFloat(document.getElementById('unitPrice')?.value) || 0;
    const total = quantity * unitPrice;
    const totalPreview = document.getElementById('totalAmountPreview');
    if (totalPreview) {
        totalPreview.textContent = '₹' + total.toLocaleString('en-IN');
        totalPreview.className = 'total-amount' + (total > 0 ? '' : ' zero');
    }
}

// ─── Init ────────────────────────────────────────────

function initPurchasesModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('addPurchaseBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('purchaseModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('purchaseModal'));
    document.getElementById('purchaseForm')?.addEventListener('submit', savePurchase);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        supplierFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('supplierFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('supplierFilter')?.addEventListener('change', (e) => {
        supplierFilter = e.target.value;
        renderTable();
    });
    
    // Real-time total preview
    document.getElementById('quantity')?.addEventListener('input', updateTotalPreview);
    document.getElementById('unitPrice')?.addEventListener('input', updateTotalPreview);
    
    // Close modal on overlay click
    document.getElementById('purchaseModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('purchaseModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('purchaseModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initPurchasesModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initPurchasesModule();
    }, 3000);
});