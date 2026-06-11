/**
 * Radiology Tests Management JS - Radiology Module
 * Professional UI, Fully Working, Rupee Symbol, Form Validation
 */

let radioTests = [];
let radioCategories = [];
let deleteId = null;

function loadData() {
    radioCategories = JSON.parse(localStorage.getItem('radiology_categories') || '[]');
    const stored = localStorage.getItem('radiology_tests');
    if(stored) {
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
    updateStats();
    renderTable();
    populateCategoryFilter();
    populateCategorySelect();
}

function saveTests() {
    localStorage.setItem('radiology_tests', JSON.stringify(radioTests));
}

function updateStats() {
    const categories = JSON.parse(localStorage.getItem('radiology_categories') || '[]');
    document.getElementById('totalCategories').innerText = categories.length;
    document.getElementById('totalTests').innerText = radioTests.length;
    const requests = JSON.parse(localStorage.getItem('radiology_requests') || '[]');
    const pending = requests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    document.getElementById('pendingRequests').innerText = pending;
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
    
    let filtered = radioTests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(search);
        const matchesCategory = categoryFilter === '' || test.categoryId.toString() === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    const tbody = document.getElementById('testsTable');
    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-mri text-3xl mb-2 block"></i><p class="font-normal">No scans found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(test => `
        <tr class="test-row">
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(test.name)}</td>
            <td class="px-5 py-3"><span class="category-badge">${escapeHtml(test.categoryName)}</span></td>
            <td class="px-5 py-3 text-sm text-[#475569]">${test.bodyPart || '-'}</td>
            <td class="px-5 py-3 font-semibold text-[#1e293b] text-sm">₹${test.price.toLocaleString('en-IN')}</td>
            <td class="px-5 py-3 text-sm text-[#475569] max-w-[200px] truncate">${escapeHtml(test.preparation) || '-'}</td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    <button onclick="editTest(${test.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="Edit Scan">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTest(${test.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Scan">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
              </tr>
            ),
    `).join('');
}

function populateCategoryFilter() {
    const filterSelect = document.getElementById('categoryFilter');
    if(filterSelect) {
        filterSelect.innerHTML = '<option value="">All Categories</option>' + 
            radioCategories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
    }
}

function populateCategorySelect() {
    const select = document.getElementById('categoryId');
    if(select) {
        select.innerHTML = '<option value="">-- Select Category --</option>' + 
            radioCategories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
    }
}

function openModal() {
    document.getElementById('testForm').reset();
    document.getElementById('testId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Scan';
    document.getElementById('testModal').classList.add('active');
    populateCategorySelect();
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function editTest(id) {
    const test = radioTests.find(t => t.id === id);
    if(test) {
        document.getElementById('testId').value = test.id;
        document.getElementById('testName').value = test.name;
        document.getElementById('categoryId').value = test.categoryId;
        document.getElementById('bodyPart').value = test.bodyPart || '';
        document.getElementById('price').value = test.price;
        document.getElementById('preparation').value = test.preparation || '';
        document.getElementById('modalTitle').innerText = 'Edit Scan';
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
        radioTests = radioTests.filter(t => t.id !== deleteId);
        saveTests();
        updateStats();
        renderTable();
        showToast('Scan deleted successfully', 'success');
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
    const category = radioCategories.find(c => c.id === categoryId);
    
    if (!category && categoryId) {
        showToast('Invalid category selected', 'error');
        return;
    }
    
    const data = {
        name: document.getElementById('testName').value.trim(),
        categoryId: categoryId,
        categoryName: category?.name || '',
        bodyPart: document.getElementById('bodyPart').value,
        price: parseFloat(document.getElementById('price').value),
        preparation: document.getElementById('preparation').value
    };
    
    if(id) {
        const index = radioTests.findIndex(t => t.id === parseInt(id));
        if(index !== -1) {
            radioTests[index] = { ...radioTests[index], ...data };
            showToast('Scan updated successfully', 'success');
        }
    } else {
        const newId = radioTests.length > 0 ? Math.max(...radioTests.map(t => t.id)) + 1 : 1;
        radioTests.push({ id: newId, ...data });
        showToast('Scan added successfully', 'success');
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