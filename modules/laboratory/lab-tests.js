/**
 * Lab Tests Management JS - Laboratory Module
 * Uses theme.css for styling, clean event handling
 */

let labTests = [];
let labCategories = [];
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
        labCategories = JSON.parse(localStorage.getItem('lab_categories') || '[]');
        
        const stored = localStorage.getItem('lab_tests');
        if (stored) {
            labTests = JSON.parse(stored);
        } else {
            labTests = [
                {id: 1, name: 'Complete Blood Count', categoryId: 1, categoryName: 'Hematology', normalRange: '4.5-11.0', unit: 'K/uL', price: 500, instructions: 'No fasting required'},
                {id: 2, name: 'Blood Sugar Fasting', categoryId: 2, categoryName: 'Biochemistry', normalRange: '70-100', unit: 'mg/dL', price: 200, instructions: '8 hours fasting required'},
                {id: 3, name: 'Lipid Profile', categoryId: 2, categoryName: 'Biochemistry', normalRange: '<200', unit: 'mg/dL', price: 800, instructions: '12 hours fasting required'},
                {id: 4, name: 'Urine Culture', categoryId: 3, categoryName: 'Microbiology', normalRange: 'No growth', unit: 'CFU/mL', price: 600, instructions: 'Clean catch sample'},
                {id: 5, name: 'Liver Function Test', categoryId: 2, categoryName: 'Biochemistry', normalRange: '10-40', unit: 'U/L', price: 700, instructions: '8 hours fasting required'},
                {id: 6, name: 'Thyroid Profile', categoryId: 2, categoryName: 'Biochemistry', normalRange: '0.5-5.0', unit: 'mIU/L', price: 550, instructions: 'No fasting required'},
                {id: 7, name: 'Vitamin D Test', categoryId: 2, categoryName: 'Biochemistry', normalRange: '30-100', unit: 'ng/mL', price: 1200, instructions: 'No fasting required'}
            ];
            saveTests();
        }
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading test data', 'error');
    }
}

function saveTests() {
    try {
        localStorage.setItem('lab_tests', JSON.stringify(labTests));
    } catch (error) {
        console.error('Error saving tests:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const categories = JSON.parse(localStorage.getItem('lab_categories') || '[]');
    const requests = JSON.parse(localStorage.getItem('lab_requests') || '[]');
    const active = requests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('totalTests').textContent = labTests.length;
    document.getElementById('activeRequests').textContent = active;
    document.getElementById('lastUpdated').textContent = 
        new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Filter ──────────────────────────────────────────

function getFilteredTests() {
    return labTests.filter(test => {
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
                    <i class="fas fa-flask"></i>
                    <p>No tests found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a test to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(test => `
        <tr class="test-row" data-id="${test.id}">
            <td class="test-name">${esc(test.name)}</td>
            <td><span class="category-badge">${esc(test.categoryName)}</span></td>
            <td style="color:var(--color-brown-300); font-size:0.8125rem;">${test.normalRange || '-'}</td>
            <td style="color:var(--color-brown-300); font-size:0.8125rem;">${test.unit || '-'}</td>
            <td style="text-align:center;" class="test-price">₹${test.price.toLocaleString('en-IN')}</td>
            <td style="text-align:center;">
                <button class="action-btn edit edit-btn" data-id="${test.id}" title="Edit Test">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete delete-btn" data-id="${test.id}" title="Delete Test">
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
            labCategories.map(cat => `<option value="${cat.id}">${esc(cat.name)}</option>`).join('');
    }
    
    // Category select in modal
    const select = document.getElementById('categoryId');
    if (select) {
        select.innerHTML = '<option value="">-- Select Category --</option>' + 
            labCategories.map(cat => `<option value="${cat.id}">${esc(cat.name)}</option>`).join('');
    }
}

// ─── Validation ──────────────────────────────────────

function validateTestForm() {
    let isValid = true;
    
    const testName = document.getElementById('testName').value.trim();
    const categoryId = document.getElementById('categoryId').value;
    const price = document.getElementById('price').value;
    
    // Reset errors
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    
    if (!testName) {
        document.getElementById('testNameError').classList.add('show');
        document.getElementById('testName').classList.add('error');
        isValid = false;
    }
    
    if (!categoryId) {
        document.getElementById('categoryIdError').classList.add('show');
        document.getElementById('categoryId').classList.add('error');
        isValid = false;
    }
    
    if (!price || parseFloat(price) <= 0) {
        document.getElementById('priceError').classList.add('show');
        document.getElementById('price').classList.add('error');
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
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-microscope"></i> Add Test';
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    populateFilters();
    openModal('testModal');
}

function openEditModal(id) {
    const test = labTests.find(t => t.id === id);
    if (test) {
        document.getElementById('testId').value = test.id;
        document.getElementById('testName').value = test.name;
        document.getElementById('categoryId').value = test.categoryId;
        document.getElementById('normalRange').value = test.normalRange || '';
        document.getElementById('unit').value = test.unit || '';
        document.getElementById('price').value = test.price;
        document.getElementById('instructions').value = test.instructions || '';
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Test';
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
        populateFilters();
        openModal('testModal');
    }
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveTest(e) {
    e.preventDefault();
    
    if (!validateTestForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    const id = document.getElementById('testId').value;
    const categoryId = parseInt(document.getElementById('categoryId').value);
    const category = labCategories.find(c => c.id === categoryId);
    
    if (!category && categoryId) {
        showToast('Invalid category selected', 'error');
        return;
    }
    
    const data = {
        name: document.getElementById('testName').value.trim(),
        categoryId: categoryId,
        categoryName: category?.name || '',
        normalRange: document.getElementById('normalRange').value.trim(),
        unit: document.getElementById('unit').value.trim(),
        price: parseFloat(document.getElementById('price').value),
        instructions: document.getElementById('instructions').value.trim()
    };
    
    if (id) {
        const index = labTests.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            labTests[index] = { ...labTests[index], ...data };
            showToast(`✅ "${data.name}" updated successfully`, 'success');
        }
    } else {
        const newId = labTests.length > 0 ? Math.max(...labTests.map(t => t.id)) + 1 : 1;
        labTests.push({ id: newId, ...data });
        showToast(`✅ "${data.name}" added successfully`, 'success');
    }
    
    saveTests();
    refreshUI();
    closeModal('testModal');
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    const test = labTests.find(t => t.id === deleteTargetId);
    labTests = labTests.filter(t => t.id !== deleteTargetId);
    saveTests();
    refreshUI();
    closeModal('deleteModal');
    
    if (test) {
        showToast(`🗑️ "${test.name}" deleted successfully`, 'success');
    }
    deleteTargetId = null;
}

// ─── Init ────────────────────────────────────────────

function initLabTestsModule() {
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
            setTimeout(initLabTestsModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initLabTestsModule();
    }, 3000);
});