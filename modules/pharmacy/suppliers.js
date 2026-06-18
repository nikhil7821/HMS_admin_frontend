/**
 * Suppliers Management Module
 * MedFlow Pharmacy - Supplier/Vendor Management CRUD
 * Uses theme.css for styling, clean event handling
 */

let suppliers = [];
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

function loadSuppliers() {
    try {
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
        refreshUI();
    } catch (error) {
        console.error('Error loading suppliers:', error);
        showToast('Error loading suppliers', 'error');
    }
}

function saveSuppliers() {
    try {
        localStorage.setItem('pharmacy_suppliers', JSON.stringify(suppliers));
    } catch (error) {
        console.error('Error saving suppliers:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.status !== 'Inactive').length;
    const withEmail = suppliers.filter(s => s.email && s.email.trim()).length;
    
    document.getElementById('totalSuppliers').textContent = total;
    document.getElementById('activeSuppliers').textContent = active;
    document.getElementById('withEmailCount').textContent = withEmail;
    document.getElementById('lastUpdated').textContent = 
        new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Filter ──────────────────────────────────────────

function getFilteredSuppliers() {
    return suppliers.filter(sup => {
        const matchesSearch = searchTerm === '' || 
            sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sup.contactPerson && sup.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
            sup.phone.includes(searchTerm) ||
            (sup.email && sup.email.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('suppliersTable');
    if (!tbody) return;
    
    const filtered = getFilteredSuppliers();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="suppliers-empty">
                    <i class="fas fa-folder-open"></i>
                    <p>No suppliers found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Add a supplier to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(sup => `
        <tr class="supplier-row" data-id="${sup.id}">
            <td>
                <p class="supplier-name">${esc(sup.name)}</p>
            </td>
            <td style="color:var(--color-brown-300); font-size:0.8125rem;">
                ${sup.contactPerson ? esc(sup.contactPerson) : '—'}
            </td>
            <td class="phone-cell">${esc(sup.phone)}</td>
            <td class="email-cell">${sup.email ? esc(sup.email) : '—'}</td>
            <td class="address-cell">${sup.address ? esc(sup.address) : '—'}</td>
            <td style="text-align:center;">
                <button class="action-btn edit edit-btn" data-id="${sup.id}" title="Edit Supplier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete delete-btn" data-id="${sup.id}" title="Delete Supplier">
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
        btn.addEventListener('click', () => deleteSupplier(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Validation ──────────────────────────────────────

function validateSupplierForm(name, phone, email, isEditMode = false, currentId = null) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['supNameError', 'phoneError', 'emailError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    
    const nameInput = document.getElementById('supName');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    
    [nameInput, phoneInput, emailInput].forEach(el => {
        if (el) el.classList.remove('error');
    });
    
    // Name validation
    if (!name || name.trim() === '') {
        const errorEl = document.getElementById('supNameError');
        if (errorEl) errorEl.textContent = 'Supplier name is required';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length < 2) {
        const errorEl = document.getElementById('supNameError');
        if (errorEl) errorEl.textContent = 'Name must be at least 2 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else if (name.trim().length > 100) {
        const errorEl = document.getElementById('supNameError');
        if (errorEl) errorEl.textContent = 'Name cannot exceed 100 characters';
        if (nameInput) nameInput.classList.add('error');
        isValid = false;
    } else {
        const duplicate = suppliers.some(sup => {
            if (isEditMode && sup.id === currentId) return false;
            return sup.name.toLowerCase() === name.trim().toLowerCase();
        });
        if (duplicate) {
            const errorEl = document.getElementById('supNameError');
            if (errorEl) errorEl.textContent = 'Supplier name already exists';
            if (nameInput) nameInput.classList.add('error');
            isValid = false;
        }
    }
    
    // Phone validation
    if (!phone || phone.trim() === '') {
        const errorEl = document.getElementById('phoneError');
        if (errorEl) errorEl.textContent = 'Phone number is required';
        if (phoneInput) phoneInput.classList.add('error');
        isValid = false;
    } else {
        // Indian phone number validation
        const phoneClean = phone.trim().replace(/[\-\s]/g, '');
        if (!/^[0]?[6789]\d{9}$/.test(phoneClean) && !/^\+91[6789]\d{9}$/.test(phoneClean)) {
            const errorEl = document.getElementById('phoneError');
            if (errorEl) errorEl.textContent = 'Enter valid 10-digit Indian phone number';
            if (phoneInput) phoneInput.classList.add('error');
            isValid = false;
        } else {
            const duplicate = suppliers.some(sup => {
                if (isEditMode && sup.id === currentId) return false;
                return sup.phone === phone.trim();
            });
            if (duplicate) {
                const errorEl = document.getElementById('phoneError');
                if (errorEl) errorEl.textContent = 'Phone number already exists';
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
            if (errorEl) errorEl.textContent = 'Enter a valid email address';
            if (emailInput) emailInput.classList.add('error');
            isValid = false;
        } else {
            const duplicate = suppliers.some(sup => {
                if (isEditMode && sup.id === currentId) return false;
                return sup.email && sup.email.toLowerCase() === email.trim().toLowerCase();
            });
            if (duplicate) {
                const errorEl = document.getElementById('emailError');
                if (errorEl) errorEl.textContent = 'Email already exists';
                if (emailInput) emailInput.classList.add('error');
                isValid = false;
            }
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
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-truck"></i> Add Supplier';
    
    // Clear errors
    const errorFields = ['supNameError', 'phoneError', 'emailError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    ['supName', 'phone', 'email'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('error');
    });
    
    openModal('supplierModal');
}

function openEditModal(id) {
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
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Supplier';
    
    // Clear errors
    const errorFields = ['supNameError', 'phoneError', 'emailError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    ['supName', 'phone', 'email'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('error');
    });
    
    openModal('supplierModal');
}

// ─── Form Submit ────────────────────────────────────

function saveSupplier(e) {
    e.preventDefault();
    
    const id = document.getElementById('supplierId').value;
    const name = document.getElementById('supName').value.trim();
    const contactPerson = document.getElementById('contactPerson').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    
    const isEdit = !!id;
    const currentId = isEdit ? parseInt(id) : null;
    
    if (!validateSupplierForm(name, phone, email, isEdit, currentId)) {
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
        const index = suppliers.findIndex(s => s.id === currentId);
        if (index !== -1) {
            suppliers[index] = { ...suppliers[index], ...supplierData };
            showToast(`✅ "${esc(name)}" updated successfully`, 'success');
        }
    } else {
        const newId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1;
        suppliers.push({ id: newId, ...supplierData });
        showToast(`✅ "${esc(name)}" added successfully`, 'success');
    }
    
    saveSuppliers();
    refreshUI();
    closeModal('supplierModal');
}

// ─── Delete ──────────────────────────────────────────

function deleteSupplier(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;
    
    if (confirm(`Are you sure you want to delete supplier "${supplier.name}"? This action cannot be undone.`)) {
        suppliers = suppliers.filter(s => s.id !== id);
        saveSuppliers();
        refreshUI();
        showToast(`🗑️ "${esc(supplier.name)}" deleted successfully`, 'success');
    }
}

// ─── Init ────────────────────────────────────────────

function initSuppliersModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadSuppliers();
    
    // Event Listeners
    document.getElementById('addSupplierBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('supplierModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('supplierModal'));
    document.getElementById('supplierForm')?.addEventListener('submit', saveSupplier);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        document.getElementById('searchInput').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    // Close modal on overlay click
    document.getElementById('supplierModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('supplierModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('supplierModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initSuppliersModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initSuppliersModule();
    }, 3000);
});