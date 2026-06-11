/**
 * Categories Management Module
 * MedFlow Pharmacy - Medicine Categories CRUD
 * Matching Executive Dashboard UI/UX - Indian Context
 */

// Data Store
let categories = [];

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Toast notification matching dashboard style
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

// Save to localStorage
function saveCategories() {
    localStorage.setItem('pharmacy_categories', JSON.stringify(categories));
}

// Load initial data with Indian pharmacy categories
function loadCategories() {
    const stored = localStorage.getItem('pharmacy_categories');
    if (stored) {
        categories = JSON.parse(stored);
    } else {
        // Default Indian categories with Indian medicine names
        categories = [
            { id: 1, name: 'Antibiotics (प्रतिजैविक)', code: 'ANT', description: 'Medicines like Amoxicillin, Azithromycin, Ciprofloxacin used for bacterial infections' },
            { id: 2, name: 'Painkillers (दर्द निवारक)', code: 'PAIN', description: 'Analgesics including Paracetamol, Ibuprofen, Diclofenac for pain relief' },
            { id: 3, name: 'Vitamins & Supplements (विटामिन)', code: 'VIT', description: 'Multivitamins, Calcium, Vitamin D, B-Complex, Iron supplements' },
            { id: 4, name: 'Cardiac (हृदय)', code: 'CAR', description: 'Heart medications like Atorvastatin, Metoprolol, Aspirin, BP medicines' },
            { id: 5, name: 'Antidiabetic (मधुमेह)', code: 'DIAB', description: 'Diabetes medicines including Metformin, Glimepiride, Insulin, Sitagliptin' },
            { id: 6, name: 'Ayurvedic (आयुर्वेदिक)', code: 'AYUR', description: 'Herbal and Ayurvedic medicines like Chyawanprash, Triphala, Ashwagandha' },
            { id: 7, name: 'Gastrointestinal (पाचन)', code: 'GASTRO', description: 'Digestive medicines, Antacids, Omeprazole, Pantoprazole, Probiotics' },
            { id: 8, name: 'Respiratory (श्वसन)', code: 'RESP', description: 'Asthma, cold, cough medicines like Montelukast, Levosalbutamol, Cetirizine' }
        ];
        saveCategories();
    }
    renderTable();
}

// Validate form fields with proper constraints
function validateCategoryForm(name, code, isEditMode = false, currentId = null) {
    let isValid = true;
    
    // Clear previous errors
    const nameErrorEl = document.getElementById('catNameError');
    const codeErrorEl = document.getElementById('catCodeError');
    const nameInput = document.getElementById('catName');
    const codeInput = document.getElementById('catCode');
    
    if (nameErrorEl) nameErrorEl.innerText = '';
    if (codeErrorEl) codeErrorEl.innerText = '';
    if (nameInput) nameInput.classList.remove('error');
    if (codeInput) codeInput.classList.remove('error');
    
    // Name validation
    if (!name || name.trim() === '') {
        if (nameErrorEl) nameErrorEl.innerText = 'Category name is required';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length < 2) {
        if (nameErrorEl) nameErrorEl.innerText = 'Name must be at least 2 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length > 50) {
        if (nameErrorEl) nameErrorEl.innerText = 'Name cannot exceed 50 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else {
        // Check for duplicate name (excluding current in edit mode)
        const duplicate = categories.some(cat => {
            if (isEditMode && cat.id === currentId) return false;
            return cat.name.toLowerCase() === name.trim().toLowerCase();
        });
        if (duplicate) {
            if (nameErrorEl) nameErrorEl.innerText = 'Category name already exists';
            if (nameInput) nameInput.classList.add('error');
            isValid = false;
        }
    }
    
    // Code validation
    if (!code || code.trim() === '') {
        if (codeErrorEl) codeErrorEl.innerText = 'Category code is required';
        if (codeInput) codeInput.classList.add('error');
        isValid = false;
    } else if (code.trim().length < 2) {
        if (codeErrorEl) codeErrorEl.innerText = 'Code must be at least 2 characters';
        if (codeInput) codeInput.classList.add('error');
        isValid = false;
    } else if (code.trim().length > 10) {
        if (codeErrorEl) codeErrorEl.innerText = 'Code cannot exceed 10 characters';
        if (codeInput) codeInput.classList.add('error');
        isValid = false;
    } else if (!/^[A-Za-z0-9]+$/.test(code.trim())) {
        if (codeErrorEl) codeErrorEl.innerText = 'Code must contain only letters and numbers';
        if (codeInput) codeInput.classList.add('error');
        isValid = false;
    } else {
        // Check for duplicate code
        const duplicate = categories.some(cat => {
            if (isEditMode && cat.id === currentId) return false;
            return cat.code.toLowerCase() === code.trim().toLowerCase();
        });
        if (duplicate) {
            if (codeErrorEl) codeErrorEl.innerText = 'Category code already exists';
            if (codeInput) codeInput.classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
}

// Render table with categories
function renderTable() {
    const tbody = document.getElementById('categoriesTable');
    if (!tbody) return;
    
    if (categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-[#d4c9bc] text-sm"><i class="fas fa-folder-open mr-2"></i>No categories found. Click "Add Category" to create one.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = categories.map((cat, idx) => `
        <tr class="dashboard-table-row">
            <td class="px-5 py-3 text-sm text-[#6a5a4a]">${idx + 1}</td>
            <td class="px-5 py-3 text-sm font-medium text-[#5a4a3a]">${escapeHtml(cat.name)}</td>
            <td class="px-5 py-3"><span class="badge-code">${escapeHtml(cat.code)}</span></td>
            <td class="px-5 py-3 text-sm text-[#9a8e82] max-w-xs truncate">${escapeHtml(cat.description) || '—'}</td>
            <td class="px-5 py-3 text-center">
                <button onclick="window.editCategoryHandler(${cat.id})" class="action-edit mr-3 text-base transition">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="window.deleteCategoryHandler(${cat.id})" class="action-delete text-base transition">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal management
const modal = document.getElementById('categoryModal');
const modalTitle = document.getElementById('modalTitle');
const form = document.getElementById('categoryForm');
const catIdInput = document.getElementById('categoryId');
const catNameInput = document.getElementById('catName');
const catCodeInput = document.getElementById('catCode');
const catDescInput = document.getElementById('catDesc');

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
    // Reset form and errors
    if (form) form.reset();
    if (catIdInput) catIdInput.value = '';
    
    const nameErrorEl = document.getElementById('catNameError');
    const codeErrorEl = document.getElementById('catCodeError');
    const nameInput = document.getElementById('catName');
    const codeInput = document.getElementById('catCode');
    
    if (nameErrorEl) nameErrorEl.innerText = '';
    if (codeErrorEl) codeErrorEl.innerText = '';
    if (nameInput) nameInput.classList.remove('error');
    if (codeInput) codeInput.classList.remove('error');
}

// Add category handler
function addCategory() {
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-plus-circle text-[#a8c49a] mr-2"></i> Add Category';
    }
    if (catIdInput) catIdInput.value = '';
    if (catNameInput) catNameInput.value = '';
    if (catCodeInput) catCodeInput.value = '';
    if (catDescInput) catDescInput.value = '';
    
    // Clear errors
    const nameErrorEl = document.getElementById('catNameError');
    const codeErrorEl = document.getElementById('catCodeError');
    const nameInput = document.getElementById('catName');
    const codeInput = document.getElementById('catCode');
    
    if (nameErrorEl) nameErrorEl.innerText = '';
    if (codeErrorEl) codeErrorEl.innerText = '';
    if (nameInput) nameInput.classList.remove('error');
    if (codeInput) codeInput.classList.remove('error');
    
    openModal();
}

// Edit category (exposed globally)
window.editCategoryHandler = function(id) {
    const category = categories.find(c => c.id === id);
    if (!category) {
        showToast('Category not found', 'error');
        return;
    }
    if (catIdInput) catIdInput.value = category.id;
    if (catNameInput) catNameInput.value = category.name;
    if (catCodeInput) catCodeInput.value = category.code;
    if (catDescInput) catDescInput.value = category.description || '';
    
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-edit text-[#a8c49a] mr-2"></i> Edit Category';
    }
    
    // Clear errors
    const nameErrorEl = document.getElementById('catNameError');
    const codeErrorEl = document.getElementById('catCodeError');
    const nameInput = document.getElementById('catName');
    const codeInput = document.getElementById('catCode');
    
    if (nameErrorEl) nameErrorEl.innerText = '';
    if (codeErrorEl) codeErrorEl.innerText = '';
    if (nameInput) nameInput.classList.remove('error');
    if (codeInput) codeInput.classList.remove('error');
    
    openModal();
};

// Delete category handler (exposed globally)
window.deleteCategoryHandler = function(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    if (confirm(`Are you sure you want to delete category "${category.name}"? This action cannot be undone.`)) {
        categories = categories.filter(c => c.id !== id);
        saveCategories();
        renderTable();
        showToast(`Category "${escapeHtml(category.name)}" deleted successfully`, 'success');
    }
};

// Save category (add/edit with validation)
function saveCategoryHandler(e) {
    e.preventDefault();
    
    const id = catIdInput && catIdInput.value ? parseInt(catIdInput.value) : null;
    const name = catNameInput ? catNameInput.value.trim() : '';
    const code = catCodeInput ? catCodeInput.value.trim() : '';
    const description = catDescInput ? catDescInput.value.trim() : '';
    
    const isEdit = !!id;
    if (!validateCategoryForm(name, code, isEdit, id)) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    if (isEdit) {
        // Update existing
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = {
                ...categories[index],
                name: name,
                code: code.toUpperCase(),
                description: description
            };
            saveCategories();
            renderTable();
            showToast(`Category "${escapeHtml(name)}" updated successfully`, 'success');
            closeModal();
        } else {
            showToast('Category not found', 'error');
        }
    } else {
        // Create new
        const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
        const newCategory = {
            id: newId,
            name: name,
            code: code.toUpperCase(),
            description: description
        };
        categories.push(newCategory);
        saveCategories();
        renderTable();
        showToast(`Category "${escapeHtml(name)}" added successfully`, 'success');
        closeModal();
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    
    const addBtn = document.getElementById('addCategoryBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalOverlay = document.querySelector('#categoryModal .modal-overlay');
    const categoryForm = document.getElementById('categoryForm');
    
    if (addBtn) addBtn.addEventListener('click', addCategory);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (categoryForm) categoryForm.addEventListener('submit', saveCategoryHandler);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('invisible')) {
            closeModal();
        }
    });
});