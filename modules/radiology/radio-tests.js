/**
 * Radiology Tests Management JS - Radiology Module
 * Uses theme.css for styling, clean event handling
 */

let radioTests = [];
let radioCategories = [];
let deleteTargetId = null;
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
        radioCategories = JSON.parse(localStorage.getItem('radiology_categories') || '[]');
        
        const stored = localStorage.getItem('radiology_tests');
        if (stored) {
            radioTests = JSON.parse(stored);
        } else {
            radioTests = [
                {id: 1, name: 'Chest X-Ray', categoryId: 1, categoryName: 'X-Ray', bodyPart: 'Chest', price: 500, preparation: 'No preparation required'},
                {id: 2, name: 'MRI Brain', categoryId: 2, categoryName: 'MRI', bodyPart: 'Head', price: 5000, preparation: 'Remove all metal objects, inform about implants'},
                {id: 3, name: 'CT Abdomen', categoryId: 3, categoryName: 'CT Scan', bodyPart: 'Abdomen', price: 4000, preparation: '4-6 hours fasting required'},
                {id: 4, name: 'Abdominal Ultrasound', categoryId: 4, categoryName: 'Ultrasound', bodyPart: 'Abdomen', price: 1500, preparation: 'Full bladder required, fasting for 4 hours'},
                {id: 5, name: 'Mammography', categoryId: 5, categoryName: 'Mammography', bodyPart: 'Breast', price: 2500, preparation: 'No deodorant/cream on underarms/breasts'},
                {id: 6, name: 'CT Chest', categoryId: 3, categoryName: 'CT Scan', bodyPart: 'Chest', price: 3500, preparation: 'No food 4 hours before scan'},
                {id: 7, name: 'MRI Knee', categoryId: 2, categoryName: 'MRI', bodyPart: 'Knee', price: 4000, preparation: 'Remove all metal objects'}
            ];
            saveTests();
        }
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading scan data', 'error');
    }
}

function saveTests() {
    try {
        localStorage.setItem('radiology_tests', JSON.stringify(radioTests));
    } catch (error) {
        console.error('Error saving tests:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const categories = JSON.parse(localStorage.getItem('radiology_categories') || '[]');
    const requests = JSON.parse(localStorage.getItem('radiology_requests') || '[]');
    const pending = requests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('totalTests').textContent = radioTests.length;
    document.getElementById('pendingRequests').textContent = pending;
    document.getElementById('lastUpdated').textContent = 
        new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Filter ──────────────────────────────────────────

function getFilteredTests() {
    return radioTests.filter(test => {
        const matchesSearch = searchTerm === '' || 
            test.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoryFilter === '' || test.categoryId.toString() === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('testsTable');
    if (!tbody) return;
    
    const filtered = getFilteredTests();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="tests-empty">
                    <i class="fas fa-mri"></i>
                    <p>No scans found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a scan to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(test => `
        <tr class="test-row" data-id="${test.id}">
            <td class="test-name">${esc(test.name)}</td>
            <td><span class="category-badge">${esc(test.categoryName)}</span></td>
            <td style="color:var(--color-brown-300); font-size:0.8125rem;">${test.bodyPart || '-'}</td>
            <td style="text-align:center;" class="test-price">₹${test.price.toLocaleString('en-IN')}</td>
            <td class="prep-cell">${test.preparation ? esc(test.preparation) : '-'}</td>
            <td style="text-align:center;">
                <button class="action-btn edit edit-btn" data-id="${test.id}" title="Edit Scan">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete delete-btn" data-id="${test.id}" title="Delete Scan">
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

// ─── Populate Filters ──────────────────────────────

function populateFilters() {
    // Category filter
    const filterSelect = document.getElementById('categoryFilter');
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="">All Categories</option>' + 
            radioCategories.map(cat => `<option value="${cat.id}">${esc(cat.name)}</option>`).join('');
    }
    
    // Category select in modal
    const select = document.getElementById('categoryId');
    if (select) {
        select.innerHTML = '<option value="">-- Select Category --</option>' + 
            radioCategories.map(cat => `<option value="${cat.id}">${esc(cat.name)}</option>`).join('');
    }
}

// ─── Validation ──────────────────────────────────────

function validateTestForm(name, categoryId, price) {
    let isValid = true;
    
    // Clear previous errors
    const nameErrorEl = document.getElementById('testNameError');
    const categoryErrorEl = document.getElementById('categoryIdError');
    const priceErrorEl = document.getElementById('priceError');
    const nameInput = document.getElementById('testName');
    const categoryInput = document.getElementById('categoryId');
    const priceInput = document.getElementById('price');
    
    if (nameErrorEl) nameErrorEl.textContent = '';
    if (categoryErrorEl) categoryErrorEl.textContent = '';
    if (priceErrorEl) priceErrorEl.textContent = '';
    if (nameInput) nameInput.classList.remove('error');
    if (categoryInput) categoryInput.classList.remove('error');
    if (priceInput) priceInput.classList.remove('error');
    
    // Name validation
    if (!name || name.trim() === '') {
        if (nameErrorEl) nameErrorEl.textContent = 'Scan name is required';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length < 2) {
        if (nameErrorEl) nameErrorEl.textContent = 'Name must be at least 2 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length > 100) {
        if (nameErrorEl) nameErrorEl.textContent = 'Name cannot exceed 100 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    }
    
    // Category validation
    if (!categoryId) {
        if (categoryErrorEl) categoryErrorEl.textContent = 'Please select a category';
        if (categoryInput) categoryInput.classList.add('error');
        isValid = false;
    }
    
    // Price validation
    if (!price || parseFloat(price) <= 0) {
        if (priceErrorEl) priceErrorEl.textContent = 'Price must be greater than 0';
        if (priceInput) priceInput.classList.add('error');
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
    document.getElementById('testForm').reset();
    document.getElementById('testId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-mri"></i> Add Scan';
    
    // Clear errors
    const nameErrorEl = document.getElementById('testNameError');
    const categoryErrorEl = document.getElementById('categoryIdError');
    const priceErrorEl = document.getElementById('priceError');
    const nameInput = document.getElementById('testName');
    const categoryInput = document.getElementById('categoryId');
    const priceInput = document.getElementById('price');
    
    if (nameErrorEl) nameErrorEl.textContent = '';
    if (categoryErrorEl) categoryErrorEl.textContent = '';
    if (priceErrorEl) priceErrorEl.textContent = '';
    if (nameInput) nameInput.classList.remove('error');
    if (categoryInput) categoryInput.classList.remove('error');
    if (priceInput) priceInput.classList.remove('error');
    
    populateFilters();
    openModal('testModal');
}

function openEditModal(id) {
    const test = radioTests.find(t => t.id === id);
    if (!test) {
        showToast('Scan not found', 'error');
        return;
    }
    
    document.getElementById('testId').value = test.id;
    document.getElementById('testName').value = test.name;
    document.getElementById('categoryId').value = test.categoryId;
    document.getElementById('bodyPart').value = test.bodyPart || '';
    document.getElementById('price').value = test.price;
    document.getElementById('preparation').value = test.preparation || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Scan';
    
    // Clear errors
    const nameErrorEl = document.getElementById('testNameError');
    const categoryErrorEl = document.getElementById('categoryIdError');
    const priceErrorEl = document.getElementById('priceError');
    const nameInput = document.getElementById('testName');
    const categoryInput = document.getElementById('categoryId');
    const priceInput = document.getElementById('price');
    
    if (nameErrorEl) nameErrorEl.textContent = '';
    if (categoryErrorEl) categoryErrorEl.textContent = '';
    if (priceErrorEl) priceErrorEl.textContent = '';
    if (nameInput) nameInput.classList.remove('error');
    if (categoryInput) categoryInput.classList.remove('error');
    if (priceInput) priceInput.classList.remove('error');
    
    populateFilters();
    openModal('testModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveTest(e) {
    e.preventDefault();
    
    const id = document.getElementById('testId').value;
    const name = document.getElementById('testName').value.trim();
    const categoryId = parseInt(document.getElementById('categoryId').value);
    const bodyPart = document.getElementById('bodyPart').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const preparation = document.getElementById('preparation').value.trim();
    
    const category = radioCategories.find(c => c.id === categoryId);
    
    if (!validateTestForm(name, categoryId, price)) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    const data = {
        name: name,
        categoryId: categoryId,
        categoryName: category?.name || '',
        bodyPart: bodyPart,
        price: price,
        preparation: preparation
    };
    
    if (id) {
        const index = radioTests.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            radioTests[index] = { ...radioTests[index], ...data };
            showToast(`✅ "${esc(name)}" updated successfully`, 'success');
        }
    } else {
        const newId = radioTests.length > 0 ? Math.max(...radioTests.map(t => t.id)) + 1 : 1;
        radioTests.push({ id: newId, ...data });
        showToast(`✅ "${esc(name)}" added successfully`, 'success');
    }
    
    saveTests();
    refreshUI();
    closeModal('testModal');
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    const test = radioTests.find(t => t.id === deleteTargetId);
    radioTests = radioTests.filter(t => t.id !== deleteTargetId);
    saveTests();
    refreshUI();
    closeModal('deleteModal');
    
    if (test) {
        showToast(`🗑️ "${esc(test.name)}" deleted successfully`, 'success');
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
    categoryFilter = '';
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categoryFilter');
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = '';
    renderTable();
}

// ─── Init ────────────────────────────────────────────

function initRadioTestsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('addTestBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('testModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('testModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('testForm')?.addEventListener('submit', saveTest);
    
    // Reset Filter button
    document.getElementById('resetFilter')?.addEventListener('click', resetFilter);
    
    // Real-time search (instant filter)
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
        categoryFilter = e.target.value;
        renderTable();
    });
    
    // Real-time validation
    document.getElementById('testName')?.addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('testNameError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('categoryId')?.addEventListener('change', function() {
        if (this.value) {
            document.getElementById('categoryIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('price')?.addEventListener('input', function() {
        const val = parseFloat(this.value);
        if (this.value && val > 0) {
            document.getElementById('priceError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    // Close modal on overlay click
    document.getElementById('testModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('testModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('testModal');
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
            setTimeout(initRadioTestsModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initRadioTestsModule();
    }, 3000);
});