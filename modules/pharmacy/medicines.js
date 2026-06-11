/**
 * Medicines Management Module
 * MedFlow Pharmacy - Medicine Inventory CRUD
 * Matching Executive Dashboard UI/UX - Indian Context (₹)
 */

// Data Stores
let medicines = [];
let categories = [];
let units = [];

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

// Save medicines to localStorage
function saveMedicines() {
    localStorage.setItem('pharmacy_medicines', JSON.stringify(medicines));
}

// Load data from localStorage
function loadData() {
    // Load categories
    const storedCategories = localStorage.getItem('pharmacy_categories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    } else {
        // Default Indian categories
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
        // Default Indian units
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
            { id: 1, name: 'Paracetamol', brand: 'Dolo 650', categoryId: 2, category: 'Painkillers (दर्द निवारक)', unitId: 3, unit: 'tab', stock: 500, price: 25, expiry: '2026-12-31', batchNo: 'B001', status: 'In Stock' },
            { id: 2, name: 'Amoxicillin', brand: 'Mox 500', categoryId: 1, category: 'Antibiotics (प्रतिजैविक)', unitId: 4, unit: 'cap', stock: 150, price: 85, expiry: '2025-08-31', batchNo: 'B002', status: 'In Stock' },
            { id: 3, name: 'Vitamin C', brand: 'Cecon', categoryId: 3, category: 'Vitamins (विटामिन)', unitId: 3, unit: 'tab', stock: 45, price: 12, expiry: '2025-03-31', batchNo: 'B003', status: 'Low Stock' },
            { id: 4, name: 'Metformin', brand: 'Glycomet 500', categoryId: 5, category: 'Antidiabetic (मधुमेह)', unitId: 3, unit: 'tab', stock: 200, price: 35, expiry: '2026-06-30', batchNo: 'B004', status: 'In Stock' },
            { id: 5, name: 'Atorvastatin', brand: 'Lipitor', categoryId: 4, category: 'Cardiac (हृदय)', unitId: 3, unit: 'tab', stock: 80, price: 120, expiry: '2025-10-31', batchNo: 'B005', status: 'Low Stock' },
            { id: 6, name: 'Ashwagandha', brand: 'Himalaya', categoryId: 6, category: 'Ayurvedic (आयुर्वेदिक)', unitId: 4, unit: 'cap', stock: 300, price: 250, expiry: '2026-11-30', batchNo: 'B006', status: 'In Stock' }
        ];
        saveMedicines();
    }
    
    updateStats();
    renderTable();
    populateFilters();
}

// Update statistics
function updateStats() {
    const totalEl = document.getElementById('totalMedicines');
    const lowStockEl = document.getElementById('lowStock');
    const expiringSoonEl = document.getElementById('expiringSoon');
    const totalValueEl = document.getElementById('totalValue');
    
    if (totalEl) totalEl.innerText = medicines.length;
    
    const lowStockCount = medicines.filter(m => m.stock < 100).length;
    if (lowStockEl) lowStockEl.innerText = lowStockCount;
    
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);
    const expiringCount = medicines.filter(m => {
        const expiryDate = new Date(m.expiry);
        return expiryDate <= threeMonthsLater && expiryDate >= today;
    }).length;
    if (expiringSoonEl) expiringSoonEl.innerText = expiringCount;
    
    const totalValue = medicines.reduce((sum, m) => sum + (m.stock * m.price), 0);
    if (totalValueEl) totalValueEl.innerText = '₹' + totalValue.toLocaleString('en-IN');
}

// Render medicines table
function renderTable() {
    const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    let filtered = medicines.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchValue) || 
                             (med.brand && med.brand.toLowerCase().includes(searchValue));
        const matchesCategory = !categoryFilter || med.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    const tbody = document.getElementById('medicinesTable');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-[#d4c9bc] text-sm"><i class="fas fa-folder-open mr-2"></i>No medicines found</td></tr>`;
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    tbody.innerHTML = filtered.map(med => {
        const expiryDate = new Date(med.expiry);
        const isExpired = expiryDate < today;
        const isLowStock = med.stock < 100;
        const expiryClass = isExpired ? 'text-[#d48c8c] font-medium' : '';
        
        return `
            <tr class="dashboard-table-row">
                <td class="px-4 py-3">
                    <p class="font-medium text-[#5a4a3a] text-sm">${escapeHtml(med.name)}</p>
                    <p class="text-xs text-[#b8aa9a]">${escapeHtml(med.brand || '—')}</p>
                </td>
                <td class="px-4 py-3 text-sm text-[#9a8e82]">${escapeHtml(med.category)}</td>
                <td class="px-4 py-3">
                    <span class="font-semibold ${isLowStock ? 'text-[#d4a853]' : 'text-[#8aae7a]'}">${med.stock}</span>
                </td>
                <td class="px-4 py-3"><span class="badge-unit">${escapeHtml(med.unit)}</span></td>
                <td class="px-4 py-3 text-sm text-[#5a4a3a]">₹${med.price.toLocaleString('en-IN')}</td>
                <td class="px-4 py-3 text-sm ${expiryClass}">${med.expiry}</td>
                <td class="px-4 py-3">
                    <span class="${isLowStock ? 'badge-stock-low' : 'badge-stock-normal'}">
                        ${isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                </td>
                <td class="px-4 py-3 text-center">
                    <button onclick="window.editMedicineHandler(${med.id})" class="action-edit mr-2 text-base transition">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.deleteMedicineHandler(${med.id})" class="action-delete text-base transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Populate filters and dropdowns
function populateFilters() {
    // Category dropdown in modal
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select Category</option>' + 
            categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    }
    
    // Unit dropdown in modal
    const unitSelect = document.getElementById('unit');
    if (unitSelect) {
        unitSelect.innerHTML = '<option value="">Select Unit</option>' + 
            units.map(u => `<option value="${u.id}">${escapeHtml(u.name)} (${escapeHtml(u.symbol)})</option>`).join('');
    }
    
    // Category filter dropdown
    const filterSelect = document.getElementById('categoryFilter');
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="">All Categories</option>' + 
            [...new Map(medicines.map(m => [m.category, m.category])).keys()].map(cat => 
                `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`
            ).join('');
    }
}

// Validate medicine form
function validateMedicineForm(name, categoryId, unitId, stock, price, expiry, isEditMode = false, currentId = null) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['medNameError', 'categoryError', 'unitError', 'stockError', 'priceError', 'expiryError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    
    const nameInput = document.getElementById('medName');
    const categoryInput = document.getElementById('category');
    const unitInput = document.getElementById('unit');
    const stockInput = document.getElementById('stock');
    const priceInput = document.getElementById('price');
    const expiryInput = document.getElementById('expiry');
    
    if (nameInput) nameInput.classList.remove('error');
    if (categoryInput) categoryInput.classList.remove('error');
    if (unitInput) unitInput.classList.remove('error');
    if (stockInput) stockInput.classList.remove('error');
    if (priceInput) priceInput.classList.remove('error');
    if (expiryInput) expiryInput.classList.remove('error');
    
    // Name validation
    if (!name || name.trim() === '') {
        const errorEl = document.getElementById('medNameError');
        if (errorEl) errorEl.innerText = 'Medicine name is required';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length < 2) {
        const errorEl = document.getElementById('medNameError');
        if (errorEl) errorEl.innerText = 'Name must be at least 2 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else {
        const duplicate = medicines.some(med => {
            if (isEditMode && med.id === currentId) return false;
            return med.name.toLowerCase() === name.trim().toLowerCase();
        });
        if (duplicate) {
            const errorEl = document.getElementById('medNameError');
            if (errorEl) errorEl.innerText = 'Medicine name already exists';
            if (nameInput) nameInput.classList.add('error');
            isValid = false;
        }
    }
    
    // Category validation
    if (!categoryId) {
        const errorEl = document.getElementById('categoryError');
        if (errorEl) errorEl.innerText = 'Please select a category';
        if (categoryInput) categoryInput.classList.add('error');
        isValid = false;
    }
    
    // Unit validation
    if (!unitId) {
        const errorEl = document.getElementById('unitError');
        if (errorEl) errorEl.innerText = 'Please select a unit';
        if (unitInput) unitInput.classList.add('error');
        isValid = false;
    }
    
    // Stock validation
    if (stock === undefined || stock === null || stock === '') {
        const errorEl = document.getElementById('stockError');
        if (errorEl) errorEl.innerText = 'Stock quantity is required';
        if (stockInput) stockInput.classList.add('error');
        isValid = false;
    } else if (isNaN(stock) || stock < 0) {
        const errorEl = document.getElementById('stockError');
        if (errorEl) errorEl.innerText = 'Stock must be a valid positive number';
        if (stockInput) stockInput.classList.add('error');
        isValid = false;
    }
    
    // Price validation
    if (price === undefined || price === null || price === '') {
        const errorEl = document.getElementById('priceError');
        if (errorEl) errorEl.innerText = 'Price is required';
        if (priceInput) priceInput.classList.add('error');
        isValid = false;
    } else if (isNaN(price) || price < 0) {
        const errorEl = document.getElementById('priceError');
        if (errorEl) errorEl.innerText = 'Price must be a valid positive number';
        if (priceInput) priceInput.classList.add('error');
        isValid = false;
    }
    
    // Expiry validation
    if (!expiry) {
        const errorEl = document.getElementById('expiryError');
        if (errorEl) errorEl.innerText = 'Expiry date is required';
        if (expiryInput) expiryInput.classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// Modal management
const modal = document.getElementById('medicineModal');
const modalTitle = document.getElementById('modalTitle');
const form = document.getElementById('medicineForm');

function openModal() {
    if (!modal) return;
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
    document.getElementById('medicineId').value = '';
    
    // Clear errors
    const errorFields = ['medNameError', 'categoryError', 'unitError', 'stockError', 'priceError', 'expiryError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    const inputs = ['medName', 'category', 'unit', 'stock', 'price', 'expiry'];
    inputs.forEach(input => {
        const el = document.getElementById(input);
        if (el) el.classList.remove('error');
    });
}

// Add medicine
function addMedicine() {
    if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-capsules text-[#a8c49a] mr-2"></i> Add Medicine';
    document.getElementById('medicineId').value = '';
    if (form) form.reset();
    closeModal(); // reset any open state
    openModal();
}

// Edit medicine handler
window.editMedicineHandler = function(id) {
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
    
    if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit text-[#a8c49a] mr-2"></i> Edit Medicine';
    
    // Clear errors
    const errorFields = ['medNameError', 'categoryError', 'unitError', 'stockError', 'priceError', 'expiryError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    
    openModal();
};

// Delete medicine handler
window.deleteMedicineHandler = function(id) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;
    
    if (confirm(`Are you sure you want to delete medicine "${medicine.name}"? This action cannot be undone.`)) {
        medicines = medicines.filter(m => m.id !== id);
        saveMedicines();
        updateStats();
        renderTable();
        populateFilters();
        showToast(`Medicine "${escapeHtml(medicine.name)}" deleted successfully`, 'success');
    }
};

// Save medicine
function saveMedicineHandler(e) {
    e.preventDefault();
    
    const id = document.getElementById('medicineId').value;
    const name = document.getElementById('medName')?.value.trim() || '';
    const brand = document.getElementById('brand')?.value.trim() || '';
    const categoryId = parseInt(document.getElementById('category')?.value) || null;
    const unitId = parseInt(document.getElementById('unit')?.value) || null;
    const stock = parseInt(document.getElementById('stock')?.value) || 0;
    const price = parseFloat(document.getElementById('price')?.value) || 0;
    const expiry = document.getElementById('expiry')?.value || '';
    const batchNo = document.getElementById('batchNo')?.value.trim() || '';
    
    const category = categories.find(c => c.id === categoryId);
    const unit = units.find(u => u.id === unitId);
    
    const isEdit = !!id;
    if (!validateMedicineForm(name, categoryId, unitId, stock, price, expiry, isEdit, id ? parseInt(id) : null)) {
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
        batchNo: batchNo,
        status: stock < 100 ? 'Low Stock' : 'In Stock'
    };
    
    if (isEdit) {
        const index = medicines.findIndex(m => m.id === parseInt(id));
        if (index !== -1) {
            medicines[index] = { ...medicines[index], ...medicineData };
            showToast(`Medicine "${escapeHtml(name)}" updated successfully`, 'success');
        }
    } else {
        const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
        medicines.push({ id: newId, ...medicineData });
        showToast(`Medicine "${escapeHtml(name)}" added successfully`, 'success');
    }
    
    saveMedicines();
    updateStats();
    renderTable();
    populateFilters();
    closeModal();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    const addBtn = document.getElementById('addMedicineBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalOverlay = document.querySelector('#medicineModal .modal-overlay');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const resetFilter = document.getElementById('resetFilter');
    const medicineForm = document.getElementById('medicineForm');
    
    if (addBtn) addBtn.addEventListener('click', addMedicine);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (medicineForm) medicineForm.addEventListener('submit', saveMedicineHandler);
    if (searchInput) searchInput.addEventListener('input', () => renderTable());
    if (categoryFilter) categoryFilter.addEventListener('change', () => renderTable());
    if (resetFilter) {
        resetFilter.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = '';
            renderTable();
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('invisible')) {
            closeModal();
        }
    });
});