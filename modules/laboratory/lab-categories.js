/**
 * Lab Categories Management JS - Laboratory Module
 * Professional UI, Fully Working, Form Validation
 */

let labCategories = [];
let deleteId = null;

function loadCategories() {
    const stored = localStorage.getItem('lab_categories');
    if(stored) {
        labCategories = JSON.parse(stored);
    } else {
        labCategories = [
            {id: 1, name: 'Hematology', code: 'HEM', description: 'Blood related tests - CBC, Blood count, etc.'},
            {id: 2, name: 'Biochemistry', code: 'BIO', description: 'Chemical analysis of blood and body fluids'},
            {id: 3, name: 'Microbiology', code: 'MIC', description: 'Bacterial, viral, and fungal tests'},
            {id: 4, name: 'Pathology', code: 'PAT', description: 'Tissue and cell analysis, biopsy'},
            {id: 5, name: 'Immunology', code: 'IMM', description: 'Immune system tests, allergies, antibodies'}
        ];
        saveCategories();
    }
    updateStats();
    renderTable();
}

function saveCategories() {
    localStorage.setItem('lab_categories', JSON.stringify(labCategories));
}

function updateStats() {
    document.getElementById('totalCategories').innerText = labCategories.length;
    
    const tests = JSON.parse(localStorage.getItem('lab_tests') || '[]');
    document.getElementById('totalTests').innerText = tests.length;
    
    const requests = JSON.parse(localStorage.getItem('lab_requests') || '[]');
    const active = requests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    document.getElementById('activeRequests').innerText = active;
}

function validateCategoryForm() {
    let isValid = true;
    
    const catName = document.getElementById('catName').value.trim();
    const catCode = document.getElementById('catCode').value.trim();
    
    if (!catName) {
        document.getElementById('catNameError').classList.add('show');
        document.getElementById('catName').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('catNameError').classList.remove('show');
        document.getElementById('catName').classList.remove('error');
    }
    
    if (!catCode) {
        document.getElementById('catCodeError').classList.add('show');
        document.getElementById('catCode').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('catCodeError').classList.remove('show');
        document.getElementById('catCode').classList.remove('error');
    }
    
    return isValid;
}

function renderTable() {
    const tbody = document.getElementById('categoriesTable');
    if(labCategories.length === 0) {
        tbody.innerHTML = '<td><td colspan="5" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-folder-open text-3xl mb-2 block"></i><p class="font-normal">No categories found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = labCategories.map((cat, idx) => `
        <tr class="category-row">
            <td class="px-5 py-3 text-sm text-[#475569]">${idx + 1}</td>
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(cat.name)}</td>
            <td class="px-5 py-3"><span class="code-badge">${escapeHtml(cat.code)}</span></td>
            <td class="px-5 py-3 text-sm text-[#475569]">${escapeHtml(cat.description) || '-'}</td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    <button onclick="editCategory(${cat.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="Edit Category">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCategory(${cat.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Category">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
             </td>
          </tr>
    `).join('');
}

function openModal() {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Category';
    document.getElementById('categoryModal').classList.add('active');
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function editCategory(id) {
    const cat = labCategories.find(c => c.id === id);
    if(cat) {
        document.getElementById('categoryId').value = cat.id;
        document.getElementById('catName').value = cat.name;
        document.getElementById('catCode').value = cat.code;
        document.getElementById('catDesc').value = cat.description || '';
        document.getElementById('modalTitle').innerText = 'Edit Category';
        document.getElementById('categoryModal').classList.add('active');
        
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

function deleteCategory(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        labCategories = labCategories.filter(c => c.id !== deleteId);
        saveCategories();
        
        let tests = JSON.parse(localStorage.getItem('lab_tests') || '[]');
        tests = tests.filter(t => t.categoryId !== deleteId);
        localStorage.setItem('lab_tests', JSON.stringify(tests));
        
        updateStats();
        renderTable();
        showToast('Category deleted successfully', 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function saveCategory(e) {
    e.preventDefault();
    
    if(!validateCategoryForm()) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const id = document.getElementById('categoryId').value;
    const data = {
        name: document.getElementById('catName').value.trim(),
        code: document.getElementById('catCode').value.trim().toUpperCase(),
        description: document.getElementById('catDesc').value
    };
    
    if(id) {
        const index = labCategories.findIndex(c => c.id === parseInt(id));
        if(index !== -1) {
            labCategories[index] = { ...labCategories[index], ...data };
            showToast('Category updated successfully', 'success');
        }
    } else {
        const newId = labCategories.length > 0 ? Math.max(...labCategories.map(c => c.id)) + 1 : 1;
        labCategories.push({ id: newId, ...data });
        showToast('Category added successfully', 'success');
    }
    
    saveCategories();
    updateStats();
    renderTable();
    closeModal();
}

function closeModal() {
    document.getElementById('categoryModal').classList.remove('active');
    document.getElementById('categoryForm').reset();
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
    loadCategories();
    
    document.getElementById('addCategoryBtn')?.addEventListener('click', openModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('categoryForm')?.addEventListener('submit', saveCategory);
    
    // Real-time validation
    document.getElementById('catName')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('catNameError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('catCode')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('catCodeError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
});

window.editCategory = editCategory;
window.deleteCategory = deleteCategory;