/**
 * Radiology Categories Management JS - Radiology Module
 * Professional UI, Fully Working, Form Validation
 */

let radioCategories = [];
let deleteId = null;

function loadCategories() {
    const stored = localStorage.getItem('radiology_categories');
    if(stored) {
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
    updateStats();
    renderTable();
}

function saveCategories() {
    localStorage.setItem('radiology_categories', JSON.stringify(radioCategories));
}

function updateStats() {
    document.getElementById('totalCategories').innerText = radioCategories.length;
    
    const tests = JSON.parse(localStorage.getItem('radiology_tests') || '[]');
    document.getElementById('totalTests').innerText = tests.length;
    
    const requests = JSON.parse(localStorage.getItem('radiology_requests') || '[]');
    const pending = requests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    document.getElementById('pendingRequests').innerText = pending;
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
    if(radioCategories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-folder-open text-3xl mb-2 block"></i><p class="font-normal">No categories found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = radioCategories.map((cat, idx) => `
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
    const cat = radioCategories.find(c => c.id === id);
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
        radioCategories = radioCategories.filter(c => c.id !== deleteId);
        saveCategories();
        
        let tests = JSON.parse(localStorage.getItem('radiology_tests') || '[]');
        tests = tests.filter(t => t.categoryId !== deleteId);
        localStorage.setItem('radiology_tests', JSON.stringify(tests));
        
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
        const index = radioCategories.findIndex(c => c.id === parseInt(id));
        if(index !== -1) {
            radioCategories[index] = { ...radioCategories[index], ...data };
            showToast('Category updated successfully', 'success');
        }
    } else {
        const newId = radioCategories.length > 0 ? Math.max(...radioCategories.map(c => c.id)) + 1 : 1;
        radioCategories.push({ id: newId, ...data });
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