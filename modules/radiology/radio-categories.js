/**
 * Radiology Categories Management JS - Radiology Module
 * Uses theme.css for styling, clean event handling
 */

let radioCategories = [];
let deleteTargetId = null;
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

function loadCategories() {
    try {
        const stored = localStorage.getItem('radiology_categories');
        if (stored) {
            radioCategories = JSON.parse(stored);
        } else {
            radioCategories = [
                {id: 1, name: 'X-Ray', code: 'XRAY', description: 'General radiography for bone and chest imaging'},
                {id: 2, name: 'MRI', code: 'MRI', description: 'Magnetic Resonance Imaging for soft tissues and brain'},
                {id: 3, name: 'CT Scan', code: 'CT', description: 'Computed Tomography for detailed cross-sectional images'},
                {id: 4, name: 'Ultrasound', code: 'USG', description: 'Sonography for abdominal and pregnancy scans'},
                {id: 5, name: 'Mammography', code: 'MAM', description: 'Breast imaging for cancer screening'},
                {id: 6, name: 'PET Scan', code: 'PET', description: 'Positron Emission Tomography for cancer detection'},
                {id: 7, name: 'DEXA Scan', code: 'DEXA', description: 'Bone density measurement for osteoporosis'}
            ];
            saveCategories();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Error loading categories', 'error');
    }
}

function saveCategories() {
    try {
        localStorage.setItem('radiology_categories', JSON.stringify(radioCategories));
    } catch (error) {
        console.error('Error saving categories:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = radioCategories.length;
    
    const tests = JSON.parse(localStorage.getItem('radiology_tests') || '[]');
    const totalTests = tests.length;
    
    const requests = JSON.parse(localStorage.getItem('radiology_requests') || '[]');
    const pending = requests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    
    document.getElementById('totalCategories').textContent = total;
    document.getElementById('totalTests').textContent = totalTests;
    document.getElementById('pendingRequests').textContent = pending;
    document.getElementById('lastUpdated').textContent = 
        new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Filter ──────────────────────────────────────────

function getFilteredCategories() {
    return radioCategories.filter(cat => {
        const matchesSearch = searchTerm === '' || 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('categoriesTable');
    if (!tbody) return;
    
    const filtered = getFilteredCategories();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="categories-empty">
                    <i class="fas fa-folder-open"></i>
                    <p>No categories found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a category to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map((cat, idx) => `
        <tr class="category-row" data-id="${cat.id}">
            <td class="sno-cell">${idx + 1}</td>
            <td class="cat-name">${esc(cat.name)}</td>
            <td><span class="code-badge">${esc(cat.code)}</span></td>
            <td class="desc-cell">${cat.description ? esc(cat.description) : '—'}</td>
            <td style="text-align:center;">
                <button class="action-btn edit edit-btn" data-id="${cat.id}" title="Edit Category">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete delete-btn" data-id="${cat.id}" title="Delete Category">
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
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Validation ──────────────────────────────────────

function validateCategoryForm(name, code, isEditMode = false, currentId = null) {
    let isValid = true;
    
    const nameErrorEl = document.getElementById('catNameError');
    const codeErrorEl = document.getElementById('catCodeError');
    const nameInput = document.getElementById('catName');
    const codeInput = document.getElementById('catCode');
    
    if (nameErrorEl) nameErrorEl.textContent = '';
    if (codeErrorEl) codeErrorEl.textContent = '';
    if (nameInput) nameInput.classList.remove('error');
    if (codeInput) codeInput.classList.remove('error');
    
    // Name validation
    if (!name || name.trim() === '') {
        if (nameErrorEl) nameErrorEl.textContent = 'Category name is required';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length < 2) {
        if (nameErrorEl) nameErrorEl.textContent = 'Name must be at least 2 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length > 50) {
        if (nameErrorEl) nameErrorEl.textContent = 'Name cannot exceed 50 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else {
        const duplicate = radioCategories.some(cat => {
            if (isEditMode && cat.id === currentId) return false;
            return cat.name.toLowerCase() === name.trim().toLowerCase();
        });
        if (duplicate) {
            if (nameErrorEl) nameErrorEl.textContent = 'Category name already exists';
            if (nameInput) nameInput.classList.add('error');
            isValid = false;
        }
    }
    
    // Code validation
    if (!code || code.trim() === '') {
        if (codeErrorEl) codeErrorEl.textContent = 'Category code is required';
        if (codeInput) codeInput.classList.add('error');
        isValid = false;
    } else if (code.trim().length < 2) {
        if (codeErrorEl) codeErrorEl.textContent = 'Code must be at least 2 characters';
        if (codeInput) codeInput.classList.add('error');
        isValid = false;
    } else if (code.trim().length > 10) {
        if (codeErrorEl) codeErrorEl.textContent = 'Code cannot exceed 10 characters';
        if (codeInput) codeInput.classList.add('error');
        isValid = false;
    } else if (!/^[A-Za-z0-9]+$/.test(code.trim())) {
        if (codeErrorEl) codeErrorEl.textContent = 'Code must contain only letters and numbers';
        if (codeInput) codeInput.classList.add('error');
        isValid = false;
    } else {
        const duplicate = radioCategories.some(cat => {
            if (isEditMode && cat.id === currentId) return false;
            return cat.code.toLowerCase() === code.trim().toLowerCase();
        });
        if (duplicate) {
            if (codeErrorEl) codeErrorEl.textContent = 'Category code already exists';
            if (codeInput) codeInput.classList.add('error');
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
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-folder-plus"></i> Add Category';
    
    const nameErrorEl = document.getElementById('catNameError');
    const codeErrorEl = document.getElementById('catCodeError');
    const nameInput = document.getElementById('catName');
    const codeInput = document.getElementById('catCode');
    
    if (nameErrorEl) nameErrorEl.textContent = '';
    if (codeErrorEl) codeErrorEl.textContent = '';
    if (nameInput) nameInput.classList.remove('error');
    if (codeInput) codeInput.classList.remove('error');
    
    openModal('categoryModal');
}

function openEditModal(id) {
    const category = radioCategories.find(c => c.id === id);
    if (!category) {
        showToast('Category not found', 'error');
        return;
    }
    
    document.getElementById('categoryId').value = category.id;
    document.getElementById('catName').value = category.name;
    document.getElementById('catCode').value = category.code;
    document.getElementById('catDesc').value = category.description || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Category';
    
    const nameErrorEl = document.getElementById('catNameError');
    const codeErrorEl = document.getElementById('catCodeError');
    const nameInput = document.getElementById('catName');
    const codeInput = document.getElementById('catCode');
    
    if (nameErrorEl) nameErrorEl.textContent = '';
    if (codeErrorEl) codeErrorEl.textContent = '';
    if (nameInput) nameInput.classList.remove('error');
    if (codeInput) codeInput.classList.remove('error');
    
    openModal('categoryModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveCategory(e) {
    e.preventDefault();
    
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('catName').value.trim();
    const code = document.getElementById('catCode').value.trim().toUpperCase();
    const description = document.getElementById('catDesc').value.trim();
    
    const isEdit = !!id;
    const currentId = isEdit ? parseInt(id) : null;
    
    if (!validateCategoryForm(name, code, isEdit, currentId)) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    if (isEdit) {
        const index = radioCategories.findIndex(c => c.id === currentId);
        if (index !== -1) {
            radioCategories[index] = { ...radioCategories[index], name, code, description };
            saveCategories();
            refreshUI();
            showToast(`✅ "${esc(name)}" updated successfully`, 'success');
            closeModal('categoryModal');
        } else {
            showToast('Category not found', 'error');
        }
    } else {
        const newId = radioCategories.length > 0 ? Math.max(...radioCategories.map(c => c.id)) + 1 : 1;
        radioCategories.push({ id: newId, name, code, description });
        saveCategories();
        refreshUI();
        showToast(`✅ "${esc(name)}" added successfully`, 'success');
        closeModal('categoryModal');
    }
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    const category = radioCategories.find(c => c.id === deleteTargetId);
    radioCategories = radioCategories.filter(c => c.id !== deleteTargetId);
    saveCategories();
    
    // Delete associated tests
    let tests = JSON.parse(localStorage.getItem('radiology_tests') || '[]');
    tests = tests.filter(t => t.categoryId !== deleteTargetId);
    localStorage.setItem('radiology_tests', JSON.stringify(tests));
    
    refreshUI();
    closeModal('deleteModal');
    
    if (category) {
        showToast(`🗑️ "${esc(category.name)}" deleted successfully`, 'success');
    }
    deleteTargetId = null;
}

// ─── Apply Filter ────────────────────────────────────

function applyFilter() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchTerm = searchInput.value;
        renderTable();
    }
}

// ─── Reset Filter ────────────────────────────────────

function resetFilter() {
    searchTerm = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    renderTable();
}

// ─── Init ────────────────────────────────────────────

function initRadioCategoriesModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadCategories();
    
    // Event Listeners
    document.getElementById('addCategoryBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('categoryModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('categoryModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('categoryForm')?.addEventListener('submit', saveCategory);
    
    // Apply Filter button
    document.getElementById('applyFilterBtn')?.addEventListener('click', applyFilter);
    
    // Reset Filter button
    document.getElementById('resetFilterBtn')?.addEventListener('click', resetFilter);
    
    // Enter key on search input triggers filter
    document.getElementById('searchInput')?.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilter();
        }
    });
    
    // Close modal on overlay click
    document.getElementById('categoryModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('categoryModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // Auto-uppercase code
    document.getElementById('catCode')?.addEventListener('input', function() {
        const pos = this.selectionStart;
        this.value = this.value.toUpperCase();
        this.setSelectionRange(pos, pos);
    });
    
    // Real-time validation
    document.getElementById('catName')?.addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('catNameError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('catCode')?.addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('catCodeError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('categoryModal');
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
            setTimeout(initRadioCategoriesModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initRadioCategoriesModule();
    }, 3000);
});