/**
 * Lab Tests Management JS - Laboratory Module
 * Professional UI, Fully Working, Indian Names, Rupee Symbol
 */

let labTests = [];
let labCategories = [];
let deleteId = null;

function loadData() {
    labCategories = JSON.parse(localStorage.getItem('lab_categories') || '[]');
    const stored = localStorage.getItem('lab_tests');
    if(stored) {
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
    updateStats();
    renderTable();
    populateCategoryFilter();
    populateCategorySelect();
}

function saveTests() {
    localStorage.setItem('lab_tests', JSON.stringify(labTests));
}

function updateStats() {
    const categories = JSON.parse(localStorage.getItem('lab_categories') || '[]');
    document.getElementById('totalCategories').innerText = categories.length;
    document.getElementById('totalTests').innerText = labTests.length;
    const requests = JSON.parse(localStorage.getItem('lab_requests') || '[]');
    const active = requests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    document.getElementById('activeRequests').innerText = active;
}

function validateTestForm() {
    let isValid = true;
    
    const testName = document.getElementById('testName').value.trim();
    const categoryId = document.getElementById('categoryId').value;
    const price = document.getElementById('price').value;
    
    if (!testName) {
        document.getElementById('testNameError').classList.add('show');
        document.getElementById('testName').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('testNameError').classList.remove('show');
        document.getElementById('testName').classList.remove('error');
    }
    
    if (!categoryId) {
        document.getElementById('categoryIdError').classList.add('show');
        document.getElementById('categoryId').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('categoryIdError').classList.remove('show');
        document.getElementById('categoryId').classList.remove('error');
    }
    
    if (!price || parseFloat(price) <= 0) {
        document.getElementById('priceError').classList.add('show');
        document.getElementById('price').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('priceError').classList.remove('show');
        document.getElementById('price').classList.remove('error');
    }
    
    return isValid;
}

function renderTable() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    let filtered = labTests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(search);
        const matchesCategory = categoryFilter === '' || test.categoryId.toString() === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    const tbody = document.getElementById('testsTable');
    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-flask text-3xl mb-2 block"></i><p class="font-normal">No tests found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(test => `
        <tr class="test-row">
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(test.name)}</td>
            <td class="px-5 py-3"><span class="category-badge">${escapeHtml(test.categoryName)}</span></td>
            <td class="px-5 py-3 text-sm text-[#475569]">${test.normalRange || '-'}</td>
            <td class="px-5 py-3 text-sm text-[#475569]">${test.unit || '-'}</td>
            <td class="px-5 py-3 font-semibold text-[#1e293b] text-sm">₹${test.price.toLocaleString('en-IN')}</td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    <button onclick="editTest(${test.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="Edit Test">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTest(${test.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Test">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
              </td>
           </tr>
    `).join('');
}

function populateCategoryFilter() {
    const filterSelect = document.getElementById('categoryFilter');
    if(filterSelect) {
        filterSelect.innerHTML = '<option value="">All Categories</option>' + 
            labCategories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
    }
}

function populateCategorySelect() {
    const select = document.getElementById('categoryId');
    if(select) {
        select.innerHTML = '<option value="">-- Select Category --</option>' + 
            labCategories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
    }
}

function openModal() {
    document.getElementById('testForm').reset();
    document.getElementById('testId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Test';
    document.getElementById('testModal').classList.add('active');
    populateCategorySelect();
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function editTest(id) {
    const test = labTests.find(t => t.id === id);
    if(test) {
        document.getElementById('testId').value = test.id;
        document.getElementById('testName').value = test.name;
        document.getElementById('categoryId').value = test.categoryId;
        document.getElementById('normalRange').value = test.normalRange || '';
        document.getElementById('unit').value = test.unit || '';
        document.getElementById('price').value = test.price;
        document.getElementById('instructions').value = test.instructions || '';
        document.getElementById('modalTitle').innerText = 'Edit Test';
        document.getElementById('testModal').classList.add('active');
        populateCategorySelect();
        
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

function deleteTest(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        labTests = labTests.filter(t => t.id !== deleteId);
        saveTests();
        updateStats();
        renderTable();
        showToast('Test deleted successfully', 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function saveTest(e) {
    e.preventDefault();
    
    if(!validateTestForm()) {
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
        normalRange: document.getElementById('normalRange').value,
        unit: document.getElementById('unit').value,
        price: parseFloat(document.getElementById('price').value),
        instructions: document.getElementById('instructions').value
    };
    
    if(id) {
        const index = labTests.findIndex(t => t.id === parseInt(id));
        if(index !== -1) {
            labTests[index] = { ...labTests[index], ...data };
            showToast('Test updated successfully', 'success');
        }
    } else {
        const newId = labTests.length > 0 ? Math.max(...labTests.map(t => t.id)) + 1 : 1;
        labTests.push({ id: newId, ...data });
        showToast('Test added successfully', 'success');
    }
    
    saveTests();
    updateStats();
    renderTable();
    closeModal();
}

function closeModal() {
    document.getElementById('testModal').classList.remove('active');
    document.getElementById('testForm').reset();
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteId = null;
}

function showToast(message, type) {
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a' };
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300`;
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if(!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.getElementById('addTestBtn')?.addEventListener('click', openModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('testForm')?.addEventListener('submit', saveTest);
    document.getElementById('searchInput')?.addEventListener('input', () => renderTable());
    document.getElementById('categoryFilter')?.addEventListener('change', () => renderTable());
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        renderTable();
    });
    
    // Real-time validation
    document.getElementById('testName')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('testNameError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('categoryId')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('categoryIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('price')?.addEventListener('input', function() {
        const val = parseFloat(this.value);
        if(this.value && val > 0) {
            document.getElementById('priceError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
});

window.editTest = editTest;
window.deleteTest = deleteTest;