/**
 * Medicines Management Module
 * MedFlow Pharmacy - Medicine Inventory CRUD
 * Uses theme.css for styling, clean event handling
 */

let medicines = [];
let categories = [];
let units = [];
let searchTerm = '';
let categoryFilter = '';
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
        // Load categories
        const storedCategories = localStorage.getItem('pharmacy_categories');
        if (storedCategories) {
            categories = JSON.parse(storedCategories);
        } else {
            categories = [
                { id: 1, name: 'Antibiotics (प्रतिजैविक)', code: 'ANT' },
                { id: 2, name: 'Painkillers (दर्द निवारक)', code: 'PAIN' },
                { id: 3, name: 'Vitamins (विटामिन)', code: 'VIT' },
                { id: 4, name: 'Cardiac (हृदय)', code: 'CAR' },
                { id: 5, name: 'Antidiabetic (मधुमेह)', code: 'DIAB' },
                { id: 6, name: 'Ayurvedic (आयुर्वेदिक)', code: 'AYUR' },
                { id: 7, name: 'Gastrointestinal (पाचन)', code: 'GASTRO' },
                { id: 8, name: 'Respiratory (श्वसन)', code: 'RESP' }
            ];
            localStorage.setItem('pharmacy_categories', JSON.stringify(categories));
        }
        
        // Load units
        const storedUnits = localStorage.getItem('pharmacy_units');
        if (storedUnits) {
            units = JSON.parse(storedUnits);
        } else {
            units = [
                { id: 1, name: 'Milligram (मिलीग्राम)', symbol: 'mg' },
                { id: 2, name: 'Milliliter (मिलीलीटर)', symbol: 'ml' },
                { id: 3, name: 'Tablet (टैबलेट)', symbol: 'tab' },
                { id: 4, name: 'Capsule (कैप्सूल)', symbol: 'cap' },
                { id: 5, name: 'Microgram (माइक्रोग्राम)', symbol: 'mcg' },
                { id: 6, name: 'Gram (ग्राम)', symbol: 'g' },
                { id: 7, name: 'Drop (बूंद)', symbol: 'drop' },
                { id: 8, name: 'Vial (शीशी)', symbol: 'vial' }
            ];
            localStorage.setItem('pharmacy_units', JSON.stringify(units));
        }
        
        // Load medicines
        const storedMedicines = localStorage.getItem('pharmacy_medicines');
        if (storedMedicines) {
            medicines = JSON.parse(storedMedicines);
        } else {
            // Default Indian medicines
            medicines = [
                { id: 1, name: 'Paracetamol', brand: 'Dolo 650', categoryId: 2, category: 'Painkillers (दर्द निवारक)', unitId: 3, unit: 'tab', stock: 500, price: 25, expiry: '2026-12-31', batchNo: 'B001' },
                { id: 2, name: 'Amoxicillin', brand: 'Mox 500', categoryId: 1, category: 'Antibiotics (प्रतिजैविक)', unitId: 4, unit: 'cap', stock: 150, price: 85, expiry: '2025-08-31', batchNo: 'B002' },
                { id: 3, name: 'Vitamin C', brand: 'Cecon', categoryId: 3, category: 'Vitamins (विटामिन)', unitId: 3, unit: 'tab', stock: 45, price: 12, expiry: '2025-03-31', batchNo: 'B003' },
                { id: 4, name: 'Metformin', brand: 'Glycomet 500', categoryId: 5, category: 'Antidiabetic (मधुमेह)', unitId: 3, unit: 'tab', stock: 200, price: 35, expiry: '2026-06-30', batchNo: 'B004' },
                { id: 5, name: 'Atorvastatin', brand: 'Lipitor', categoryId: 4, category: 'Cardiac (हृदय)', unitId: 3, unit: 'tab', stock: 80, price: 120, expiry: '2025-10-31', batchNo: 'B005' },
                { id: 6, name: 'Ashwagandha', brand: 'Himalaya', categoryId: 6, category: 'Ayurvedic (आयुर्वेदिक)', unitId: 4, unit: 'cap', stock: 300, price: 250, expiry: '2026-11-30', batchNo: 'B006' }
            ];
            saveMedicines();
        }
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data', 'error');
    }
}

function saveMedicines() {
    try {
        localStorage.setItem('pharmacy_medicines', JSON.stringify(medicines));
    } catch (error) {
        console.error('Error saving medicines:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = medicines.length;
    const lowStock = medicines.filter(m => m.stock < 100 && m.stock > 0).length;
    
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);
    const expiringSoon = medicines.filter(m => {
        const expiryDate = new Date(m.expiry);
        return expiryDate <= threeMonthsLater && expiryDate >= today;
    }).length;
    
    const totalValue = medicines.reduce((sum, m) => sum + (m.stock * m.price), 0);
    
    document.getElementById('totalMedicines').textContent = total;
    document.getElementById('lowStock').textContent = lowStock;
    document.getElementById('expiringSoon').textContent = expiringSoon;
    document.getElementById('totalValue').textContent = '₹' + totalValue.toLocaleString('en-IN');
}

// ─── Filter ──────────────────────────────────────────

function getFilteredMedicines() {
    return medicines.filter(med => {
        const matchesSearch = searchTerm === '' || 
            med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (med.brand && med.brand.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = categoryFilter === '' || med.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('medicinesTable');
    if (!tbody) return;
    
    const filtered = getFilteredMedicines();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="medicines-empty">
                    <i class="fas fa-folder-open"></i>
                    <p>No medicines found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a medicine to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    tbody.innerHTML = filtered.map(med => {
        const isLowStock = med.stock < 100 && med.stock > 0;
        const isOutOfStock = med.stock === 0;
        const expiryDate = new Date(med.expiry);
        const isExpired = expiryDate < today;
        const isExpiringSoon = expiryDate <= new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
        
        let statusClass = 'badge-stock-normal';
        let statusText = 'In Stock';
        
        if (isOutOfStock) {
            statusClass = 'badge-stock-expired';
            statusText = 'Out of Stock';
        } else if (isLowStock) {
            statusClass = 'badge-stock-low';
            statusText = 'Low Stock';
        }
        
        let expiryClass = '';
        if (isExpired) expiryClass = 'expiry-expired';
        else if (isExpiringSoon) expiryClass = 'expiry-soon';
        
        const stockClass = isLowStock || isOutOfStock ? 'stock-low' : 'stock-normal';
        
        return `
            <tr class="medicine-row" data-id="${med.id}">
                <td>
                    <p class="med-name">${esc(med.name)}</p>
                    <p class="med-brand">${med.brand ? esc(med.brand) : '—'}</p>
                </td>
                <td style="color:var(--color-brown-300); font-size:0.8125rem;">${esc(med.category)}</td>
                <td style="text-align:center;">
                    <span class="stock-number ${stockClass}">${med.stock}</span>
                </td>
                <td><span class="badge-unit">${esc(med.unit)}</span></td>
                <td style="text-align:center; color:var(--color-brown-700); font-weight:var(--font-weight-medium);">₹${med.price.toLocaleString('en-IN')}</td>
                <td class="${expiryClass}" style="font-size:0.8125rem;">${med.expiry}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td style="text-align:center;">
                    <button class="action-btn edit edit-btn" data-id="${med.id}" title="Edit Medicine">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete delete-btn" data-id="${med.id}" title="Delete Medicine">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Bind events
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteMedicine(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Populate Filters ──────────────────────────────

function populateFilters() {
    // Category dropdown in modal
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select Category</option>' + 
            categories.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    }
    
    // Unit dropdown in modal
    const unitSelect = document.getElementById('unit');
    if (unitSelect) {
        unitSelect.innerHTML = '<option value="">Select Unit</option>' + 
            units.map(u => `<option value="${u.id}">${esc(u.name)} (${esc(u.symbol)})</option>`).join('');
    }
    
    // Category filter dropdown
    const filterSelect = document.getElementById('categoryFilter');
    if (filterSelect) {
        const uniqueCategories = [...new Set(medicines.map(m => m.category))];
        filterSelect.innerHTML = '<option value="">All Categories</option>' + 
            uniqueCategories.map(cat => `<option value="${esc(cat)}">${esc(cat)}</option>`).join('');
    }
}

// ─── Validation ──────────────────────────────────────

function validateMedicineForm(name, categoryId, unitId, stock, price, expiry, isEditMode = false, currentId = null) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['medNameError', 'categoryError', 'unitError', 'stockError', 'priceError', 'expiryError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    
    const nameInput = document.getElementById('medName');
    const categoryInput = document.getElementById('category');
    const unitInput = document.getElementById('unit');
    const stockInput = document.getElementById('stock');
    const priceInput = document.getElementById('price');
    const expiryInput = document.getElementById('expiry');
    
    [nameInput, categoryInput, unitInput, stockInput, priceInput, expiryInput].forEach(el => {
        if (el) el.classList.remove('error');
    });
    
    // Name validation
    if (!name || name.trim() === '') {
        const errorEl = document.getElementById('medNameError');
        if (errorEl) errorEl.textContent = 'Medicine name is required';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length < 2) {
        const errorEl = document.getElementById('medNameError');
        if (errorEl) errorEl.textContent = 'Name must be at least 2 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else {
        const duplicate = medicines.some(med => {
            if (isEditMode && med.id === currentId) return false;
            return med.name.toLowerCase() === name.trim().toLowerCase();
        });
        if (duplicate) {
            const errorEl = document.getElementById('medNameError');
            if (errorEl) errorEl.textContent = 'Medicine name already exists';
            if (nameInput) nameInput.classList.add('error');
            isValid = false;
        }
    }
    
    // Category validation
    if (!categoryId) {
        const errorEl = document.getElementById('categoryError');
        if (errorEl) errorEl.textContent = 'Please select a category';
        if (categoryInput) categoryInput.classList.add('error');
        isValid = false;
    }
    
    // Unit validation
    if (!unitId) {
        const errorEl = document.getElementById('unitError');
        if (errorEl) errorEl.textContent = 'Please select a unit';
        if (unitInput) unitInput.classList.add('error');
        isValid = false;
    }
    
    // Stock validation
    if (stock === undefined || stock === null || stock === '') {
        const errorEl = document.getElementById('stockError');
        if (errorEl) errorEl.textContent = 'Stock quantity is required';
        if (stockInput) stockInput.classList.add('error');
        isValid = false;
    } else if (isNaN(stock) || stock < 0) {
        const errorEl = document.getElementById('stockError');
        if (errorEl) errorEl.textContent = 'Stock must be a valid positive number';
        if (stockInput) stockInput.classList.add('error');
        isValid = false;
    }
    
    // Price validation
    if (price === undefined || price === null || price === '') {
        const errorEl = document.getElementById('priceError');
        if (errorEl) errorEl.textContent = 'Price is required';
        if (priceInput) priceInput.classList.add('error');
        isValid = false;
    } else if (isNaN(price) || price < 0) {
        const errorEl = document.getElementById('priceError');
        if (errorEl) errorEl.textContent = 'Price must be a valid positive number';
        if (priceInput) priceInput.classList.add('error');
        isValid = false;
    }
    
    // Expiry validation
    if (!expiry) {
        const errorEl = document.getElementById('expiryError');
        if (errorEl) errorEl.textContent = 'Expiry date is required';
        if (expiryInput) expiryInput.classList.add('error');
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
    document.getElementById('medicineForm').reset();
    document.getElementById('medicineId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-capsules"></i> Add Medicine';
    
    // Clear errors
    const errorFields = ['medNameError', 'categoryError', 'unitError', 'stockError', 'priceError', 'expiryError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    ['medName', 'category', 'unit', 'stock', 'price', 'expiry'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('error');
    });
    
    populateFilters();
    openModal('medicineModal');
}

function openEditModal(id) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) {
        showToast('Medicine not found', 'error');
        return;
    }
    
    document.getElementById('medicineId').value = medicine.id;
    document.getElementById('medName').value = medicine.name;
    document.getElementById('brand').value = medicine.brand || '';
    document.getElementById('category').value = medicine.categoryId;
    document.getElementById('unit').value = medicine.unitId;
    document.getElementById('stock').value = medicine.stock;
    document.getElementById('price').value = medicine.price;
    document.getElementById('expiry').value = medicine.expiry;
    document.getElementById('batchNo').value = medicine.batchNo || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Medicine';
    
    // Clear errors
    const errorFields = ['medNameError', 'categoryError', 'unitError', 'stockError', 'priceError', 'expiryError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    ['medName', 'category', 'unit', 'stock', 'price', 'expiry'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('error');
    });
    
    populateFilters();
    openModal('medicineModal');
}

// ─── Form Submit ────────────────────────────────────

function saveMedicine(e) {
    e.preventDefault();
    
    const id = document.getElementById('medicineId').value;
    const name = document.getElementById('medName').value.trim();
    const brand = document.getElementById('brand').value.trim();
    const categoryId = parseInt(document.getElementById('category').value) || null;
    const unitId = parseInt(document.getElementById('unit').value) || null;
    const stock = parseInt(document.getElementById('stock').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;
    const expiry = document.getElementById('expiry').value;
    const batchNo = document.getElementById('batchNo').value.trim();
    
    const isEdit = !!id;
    const currentId = isEdit ? parseInt(id) : null;
    
    const category = categories.find(c => c.id === categoryId);
    const unit = units.find(u => u.id === unitId);
    
    if (!validateMedicineForm(name, categoryId, unitId, stock, price, expiry, isEdit, currentId)) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    const medicineData = {
        name: name,
        brand: brand,
        categoryId: categoryId,
        category: category ? category.name : '',
        unitId: unitId,
        unit: unit ? unit.symbol : '',
        stock: stock,
        price: price,
        expiry: expiry,
        batchNo: batchNo
    };
    
    if (isEdit) {
        const index = medicines.findIndex(m => m.id === currentId);
        if (index !== -1) {
            medicines[index] = { ...medicines[index], ...medicineData };
            showToast(`✅ "${esc(name)}" updated successfully`, 'success');
        }
    } else {
        const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
        medicines.push({ id: newId, ...medicineData });
        showToast(`✅ "${esc(name)}" added successfully`, 'success');
    }
    
    saveMedicines();
    refreshUI();
    populateFilters();
    closeModal('medicineModal');
}

// ─── Delete ──────────────────────────────────────────

function deleteMedicine(id) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;
    
    if (confirm(`Are you sure you want to delete medicine "${medicine.name}"? This action cannot be undone.`)) {
        medicines = medicines.filter(m => m.id !== id);
        saveMedicines();
        refreshUI();
        populateFilters();
        showToast(`🗑️ "${esc(medicine.name)}" deleted successfully`, 'success');
    }
}

// ─── Init ────────────────────────────────────────────

function initMedicinesModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('addMedicineBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('medicineModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('medicineModal'));
    document.getElementById('medicineForm')?.addEventListener('submit', saveMedicine);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        categoryFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
        categoryFilter = e.target.value;
        renderTable();
    });
    
    // Close modal on overlay click
    document.getElementById('medicineModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('medicineModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('medicineModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initMedicinesModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initMedicinesModule();
    }, 3000);
});