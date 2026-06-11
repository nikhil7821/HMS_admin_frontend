/**
 * Suppliers Management Module
 * MedFlow Pharmacy - Supplier/Vendor Management CRUD
 * Matching Executive Dashboard UI/UX - Indian Context
 */

// Data Store
let suppliers = [];

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

// Save suppliers to localStorage
function saveSuppliers() {
    localStorage.setItem('pharmacy_suppliers', JSON.stringify(suppliers));
}

// Load suppliers from localStorage
function loadSuppliers() {
    const stored = localStorage.getItem('pharmacy_suppliers');
    if (stored) {
        suppliers = JSON.parse(stored);
    } else {
        // Default Indian suppliers
        suppliers = [
            { id: 1, name: 'Medico Pharma Distributors', contactPerson: 'Rajesh Sharma', phone: '9876543210', email: 'rajesh@medicopharma.com', address: 'Andheri East, Mumbai - 400069, Maharashtra' },
            { id: 2, name: 'HealthCare Ltd India', contactPerson: 'Priya Singh', phone: '9876543211', email: 'priya@healthcareindia.com', address: 'Connaught Place, New Delhi - 110001' },
            { id: 3, name: 'Sunrise Medical Agency', contactPerson: 'Amit Patel', phone: '9876543212', email: 'amit@sunrisemedical.com', address: 'Salt Lake City, Kolkata - 700091, West Bengal' },
            { id: 4, name: 'Sri Sai Pharma', contactPerson: 'Venkatesh Rao', phone: '9876543213', email: 'venkatesh@srisaipharma.com', address: 'MG Road, Bengaluru - 560001, Karnataka' },
            { id: 5, name: 'Apollo Pharmacy Supplies', contactPerson: 'Anjali Nair', phone: '9876543214', email: 'anjali@apollosupplies.com', address: 'T Nagar, Chennai - 600017, Tamil Nadu' }
        ];
        saveSuppliers();
    }
    renderTable();
}

// Validate supplier form
function validateSupplierForm(name, phone, email, isEditMode = false, currentId = null) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['supNameError', 'phoneError', 'emailError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    
    const nameInput = document.getElementById('supName');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    
    if (nameInput) nameInput.classList.remove('error');
    if (phoneInput) phoneInput.classList.remove('error');
    if (emailInput) emailInput.classList.remove('error');
    
    // Name validation
    if (!name || name.trim() === '') {
        const errorEl = document.getElementById('supNameError');
        if (errorEl) errorEl.innerText = 'Supplier name is required';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length < 2) {
        const errorEl = document.getElementById('supNameError');
        if (errorEl) errorEl.innerText = 'Name must be at least 2 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length > 100) {
        const errorEl = document.getElementById('supNameError');
        if (errorEl) errorEl.innerText = 'Name cannot exceed 100 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else {
        // Check for duplicate name
        const duplicate = suppliers.some(sup => {
            if (isEditMode && sup.id === currentId) return false;
            return sup.name.toLowerCase() === name.trim().toLowerCase();
        });
        if (duplicate) {
            const errorEl = document.getElementById('supNameError');
            if (errorEl) errorEl.innerText = 'Supplier name already exists';
            if (nameInput) nameInput.classList.add('error');
            isValid = false;
        }
    }
    
    // Phone validation
    if (!phone || phone.trim() === '') {
        const errorEl = document.getElementById('phoneError');
        if (errorEl) errorEl.innerText = 'Phone number is required';
        if (phoneInput) phoneInput.classList.add('error');
        isValid = false;
    } else {
        // Indian phone number validation (10 digits, optional +91 prefix)
        const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
        const phoneClean = phone.trim().replace(/[\-\s]/g, '');
        if (!phoneRegex.test(phoneClean) && !/^\d{10}$/.test(phoneClean)) {
            const errorEl = document.getElementById('phoneError');
            if (errorEl) errorEl.innerText = 'Enter valid 10-digit Indian phone number';
            if (phoneInput) phoneInput.classList.add('error');
            isValid = false;
        } else {
            // Check for duplicate phone
            const duplicate = suppliers.some(sup => {
                if (isEditMode && sup.id === currentId) return false;
                return sup.phone === phone.trim();
            });
            if (duplicate) {
                const errorEl = document.getElementById('phoneError');
                if (errorEl) errorEl.innerText = 'Phone number already exists for another supplier';
                if (phoneInput) phoneInput.classList.add('error');
                isValid = false;
            }
        }
    }
    
    // Email validation (optional but validate if provided)
    if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            const errorEl = document.getElementById('emailError');
            if (errorEl) errorEl.innerText = 'Enter a valid email address';
            if (emailInput) emailInput.classList.add('error');
            isValid = false;
        } else {
            // Check for duplicate email
            const duplicate = suppliers.some(sup => {
                if (isEditMode && sup.id === currentId) return false;
                return sup.email && sup.email.toLowerCase() === email.trim().toLowerCase();
            });
            if (duplicate) {
                const errorEl = document.getElementById('emailError');
                if (errorEl) errorEl.innerText = 'Email already exists for another supplier';
                if (emailInput) emailInput.classList.add('error');
                isValid = false;
            }
        }
    }
    
    return isValid;
}

// Render suppliers table
function renderTable() {
    const tbody = document.getElementById('suppliersTable');
    if (!tbody) return;
    
    if (suppliers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-[#d4c9bc] text-sm"><i class="fas fa-folder-open mr-2"></i>No suppliers found. Click "Add Supplier" to create one.</div></td></div>`;
        return;
    }
    
    tbody.innerHTML = suppliers.map(sup => `
        <tr class="dashboard-table-row">
            <td class="px-5 py-3">
                <p class="font-medium text-[#5a4a3a] text-sm">${escapeHtml(sup.name)}</p>
            </div>
            <td class="px-5 py-3 text-sm text-[#9a8e82]">${escapeHtml(sup.contactPerson || '—')}</div>
            <td class="px-5 py-3 text-sm text-[#5a4a3a]">${escapeHtml(sup.phone)}</div>
            <td class="px-5 py-3 text-sm text-[#9a8e82]">${escapeHtml(sup.email || '—')}</div>
            <td class="px-5 py-3 text-sm text-[#9a8e82] max-w-xs truncate">${escapeHtml(sup.address || '—')}</div>
            <td class="px-5 py-3 text-center">
                <button onclick="window.editSupplierHandler(${sup.id})" class="action-edit mr-3 text-base transition">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="window.deleteSupplierHandler(${sup.id})" class="action-delete text-base transition">
                    <i class="fas fa-trash"></i>
                </button>
             </div>
         </div>
    `).join('');
}

// Modal management
const modal = document.getElementById('supplierModal');
const modalTitle = document.getElementById('modalTitle');
const form = document.getElementById('supplierForm');

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
    document.getElementById('supplierId').value = '';
    
    // Clear errors
    const errorFields = ['supNameError', 'phoneError', 'emailError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    const inputs = ['supName', 'phone', 'email'];
    inputs.forEach(input => {
        const el = document.getElementById(input);
        if (el) el.classList.remove('error');
    });
}

// Add supplier
function addSupplier() {
    if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-truck text-[#a8c49a] mr-2"></i> Add Supplier';
    document.getElementById('supplierId').value = '';
    if (form) form.reset();
    openModal();
}

// Edit supplier handler
window.editSupplierHandler = function(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) {
        showToast('Supplier not found', 'error');
        return;
    }
    
    document.getElementById('supplierId').value = supplier.id;
    document.getElementById('supName').value = supplier.name;
    document.getElementById('contactPerson').value = supplier.contactPerson || '';
    document.getElementById('phone').value = supplier.phone;
    document.getElementById('email').value = supplier.email || '';
    document.getElementById('address').value = supplier.address || '';
    
    if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit text-[#a8c49a] mr-2"></i> Edit Supplier';
    
    // Clear errors
    const errorFields = ['supNameError', 'phoneError', 'emailError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    
    openModal();
};

// Delete supplier handler
window.deleteSupplierHandler = function(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;
    
    if (confirm(`Are you sure you want to delete supplier "${supplier.name}"? This action cannot be undone.`)) {
        suppliers = suppliers.filter(s => s.id !== id);
        saveSuppliers();
        renderTable();
        showToast(`Supplier "${escapeHtml(supplier.name)}" deleted successfully`, 'success');
    }
};

// Save supplier (add/edit with validation)
function saveSupplierHandler(e) {
    e.preventDefault();
    
    const id = document.getElementById('supplierId').value;
    const name = document.getElementById('supName')?.value.trim() || '';
    const contactPerson = document.getElementById('contactPerson')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const address = document.getElementById('address')?.value.trim() || '';
    
    const isEdit = !!id;
    if (!validateSupplierForm(name, phone, email, isEdit, id ? parseInt(id) : null)) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    const supplierData = {
        name: name,
        contactPerson: contactPerson,
        phone: phone,
        email: email,
        address: address
    };
    
    if (isEdit) {
        const index = suppliers.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
            suppliers[index] = { ...suppliers[index], ...supplierData };
            showToast(`Supplier "${escapeHtml(name)}" updated successfully`, 'success');
        }
    } else {
        const newId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1;
        suppliers.push({ id: newId, ...supplierData });
        showToast(`Supplier "${escapeHtml(name)}" added successfully`, 'success');
    }
    
    saveSuppliers();
    renderTable();
    closeModal();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadSuppliers();
    
    const addBtn = document.getElementById('addSupplierBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalOverlay = document.querySelector('#supplierModal .modal-overlay');
    const supplierForm = document.getElementById('supplierForm');
    
    if (addBtn) addBtn.addEventListener('click', addSupplier);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (supplierForm) supplierForm.addEventListener('submit', saveSupplierHandler);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('invisible')) {
            closeModal();
        }
    });
});