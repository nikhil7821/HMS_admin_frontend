/**
 * Issue Medicines Management Module
 * MedFlow Pharmacy - Issue Medicines to Patients CRUD
 * Matching Executive Dashboard UI/UX - Indian Context
 */

// Data Stores
let issues = [];
let patients = [];
let medicines = [];

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

// Save issues to localStorage
function saveIssues() {
    localStorage.setItem('pharmacy_issues', JSON.stringify(issues));
}

// Update statistics
function updateStats() {
    const totalIssuesEl = document.getElementById('totalIssues');
    const totalQuantityEl = document.getElementById('totalQuantity');
    const todayIssuesEl = document.getElementById('todayIssues');
    
    if (totalIssuesEl) totalIssuesEl.innerText = issues.length;
    
    const totalQty = issues.reduce((sum, i) => sum + i.quantity, 0);
    if (totalQuantityEl) totalQuantityEl.innerText = totalQty;
    
    const today = new Date().toISOString().split('T')[0];
    const todayCount = issues.filter(i => i.date === today).length;
    if (todayIssuesEl) todayIssuesEl.innerText = todayCount;
}

// Load data from localStorage
function loadData() {
    // Load patients from HMS
    const storedPatients = localStorage.getItem('hms_patients');
    if (storedPatients) {
        patients = JSON.parse(storedPatients);
    } else {
        // Sample Indian patients if none exist
        patients = [
            { id: 1, fullName: 'Rajesh Kumar', phone: '9876543210', age: 45 },
            { id: 2, fullName: 'Priya Sharma', phone: '9876543211', age: 32 },
            { id: 3, fullName: 'Amit Patel', phone: '9876543212', age: 28 }
        ];
        localStorage.setItem('hms_patients', JSON.stringify(patients));
    }
    
    // Load medicines from pharmacy
    const storedMedicines = localStorage.getItem('pharmacy_medicines');
    if (storedMedicines) {
        medicines = JSON.parse(storedMedicines);
    } else {
        medicines = [];
    }
    
    // Load issues
    const storedIssues = localStorage.getItem('pharmacy_issues');
    if (storedIssues) {
        issues = JSON.parse(storedIssues);
    } else {
        issues = [];
    }
    
    renderTable();
    populateSelects();
    updateStats();
}

// Validate issue form
function validateIssueForm(patientId, medicineId, quantity, availableStock) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['patientError', 'medicineError', 'quantityError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    
    const patientSelect = document.getElementById('patientId');
    const medicineSelect = document.getElementById('medicineId');
    const quantityInput = document.getElementById('quantity');
    
    if (patientSelect) patientSelect.classList.remove('error');
    if (medicineSelect) medicineSelect.classList.remove('error');
    if (quantityInput) quantityInput.classList.remove('error');
    
    // Patient validation
    if (!patientId) {
        const errorEl = document.getElementById('patientError');
        if (errorEl) errorEl.innerText = 'Please select a patient';
        if (patientSelect) patientSelect.classList.add('error');
        isValid = false;
    }
    
    // Medicine validation
    if (!medicineId) {
        const errorEl = document.getElementById('medicineError');
        if (errorEl) errorEl.innerText = 'Please select a medicine';
        if (medicineSelect) medicineSelect.classList.add('error');
        isValid = false;
    }
    
    // Quantity validation
    if (!quantity || quantity <= 0) {
        const errorEl = document.getElementById('quantityError');
        if (errorEl) errorEl.innerText = 'Please enter a valid quantity (minimum 1)';
        if (quantityInput) quantityInput.classList.add('error');
        isValid = false;
    } else if (medicineId && quantity > availableStock) {
        const errorEl = document.getElementById('quantityError');
        if (errorEl) errorEl.innerText = `Insufficient stock! Only ${availableStock} available`;
        if (quantityInput) quantityInput.classList.add('error');
        isValid = false;
    } else if (quantity > 1000) {
        const errorEl = document.getElementById('quantityError');
        if (errorEl) errorEl.innerText = 'Quantity cannot exceed 1000';
        if (quantityInput) quantityInput.classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// Render issues table
function renderTable() {
    const tbody = document.getElementById('issuesTable');
    if (!tbody) return;
    
    if (issues.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-[#d4c9bc] text-sm"><i class="fas fa-folder-open mr-2"></i>No issues recorded. Click "New Issue" to issue medicine.</div></td></div>`;
        return;
    }
    
    // Sort by date descending (newest first)
    const sortedIssues = [...issues].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedIssues.map(issue => `
        <tr class="dashboard-table-row">
            <td class="px-5 py-3 text-sm text-[#5a4a3a]">${issue.date}</div>
            <td class="px-5 py-3 text-sm font-medium text-[#5a4a3a]">${escapeHtml(issue.patientName)}</div>
            <td class="px-5 py-3 text-sm text-[#9a8e82]">${escapeHtml(issue.medicineName)}</div>
            <td class="px-5 py-3 text-sm text-[#5a4a3a]">${issue.quantity}</div>
            <td class="px-5 py-3 text-sm text-[#9a8e82]">${escapeHtml(issue.prescribedBy || '—')}</div>
            <td class="px-5 py-3 text-center">
                <button onclick="window.deleteIssueHandler(${issue.id})" class="action-delete text-base transition" title="Delete Issue">
                    <i class="fas fa-trash"></i>
                </button>
             </div>
         </div>
    `).join('');
}

// Populate selects
function populateSelects() {
    const patientSelect = document.getElementById('patientId');
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">Select Patient</option>' + 
            patients.map(p => `<option value="${p.id}">${escapeHtml(p.fullName)}</option>`).join('');
    }
    
    const medicineSelect = document.getElementById('medicineId');
    if (medicineSelect) {
        medicineSelect.innerHTML = '<option value="">Select Medicine</option>' + 
            medicines.map(m => `<option value="${m.id}">${escapeHtml(m.name)} ${m.brand ? '(' + escapeHtml(m.brand) + ')' : ''} - Stock: ${m.stock} ${m.unit || ''}</option>`).join('');
    }
}

// Update stock warning when medicine is selected
function updateStockWarning() {
    const medicineId = parseInt(document.getElementById('medicineId')?.value) || null;
    const medicine = medicines.find(m => m.id === medicineId);
    const stockWarning = document.getElementById('stockWarning');
    const quantityInput = document.getElementById('quantity');
    
    if (medicine && stockWarning) {
        if (medicine.stock < 100 && medicine.stock > 0) {
            stockWarning.innerHTML = `<i class="fas fa-exclamation-triangle mr-1"></i>Low stock: Only ${medicine.stock} ${medicine.unit || 'units'} left`;
            stockWarning.style.color = '#d4a853';
        } else if (medicine.stock === 0) {
            stockWarning.innerHTML = `<i class="fas fa-times-circle mr-1"></i>Out of stock! Cannot issue this medicine`;
            stockWarning.style.color = '#d8b48c';
            if (quantityInput) quantityInput.disabled = true;
        } else {
            stockWarning.innerHTML = `<i class="fas fa-check-circle mr-1"></i>Available stock: ${medicine.stock} ${medicine.unit || 'units'}`;
            stockWarning.style.color = '#8aae7a';
            if (quantityInput) quantityInput.disabled = false;
        }
    } else if (stockWarning) {
        stockWarning.innerHTML = '';
        if (quantityInput) quantityInput.disabled = false;
    }
    
    // Reset quantity if stock is 0
    if (medicine && medicine.stock === 0 && quantityInput) {
        quantityInput.value = '';
        quantityInput.disabled = true;
    } else if (quantityInput && medicine && medicine.stock > 0) {
        quantityInput.disabled = false;
    }
}

// Modal management
const modal = document.getElementById('issueModal');
const form = document.getElementById('issueForm');

function openModal() {
    if (!modal) return;
    // Refresh data before opening
    const storedPatients = localStorage.getItem('hms_patients');
    const storedMedicines = localStorage.getItem('pharmacy_medicines');
    if (storedPatients) patients = JSON.parse(storedPatients);
    if (storedMedicines) medicines = JSON.parse(storedMedicines);
    populateSelects();
    
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
    
    // Clear errors
    const errorFields = ['patientError', 'medicineError', 'quantityError', 'prescribedError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    const inputs = ['patientId', 'medicineId', 'quantity'];
    inputs.forEach(input => {
        const el = document.getElementById(input);
        if (el) el.classList.remove('error');
    });
    
    const stockWarning = document.getElementById('stockWarning');
    if (stockWarning) stockWarning.innerHTML = '';
    
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) quantityInput.disabled = false;
}

// Add issue
function addIssue() {
    openModal();
}

// Delete issue handler
window.deleteIssueHandler = function(id) {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;
    
    if (confirm(`Are you sure you want to delete this issue record for "${issue.patientName}"? This will NOT revert stock changes.`)) {
        issues = issues.filter(i => i.id !== id);
        saveIssues();
        renderTable();
        updateStats();
        showToast(`Issue record deleted successfully`, 'success');
    }
};

// Save issue
function saveIssueHandler(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patientId')?.value) || null;
    const medicineId = parseInt(document.getElementById('medicineId')?.value) || null;
    const quantity = parseInt(document.getElementById('quantity')?.value) || 0;
    const prescribedBy = document.getElementById('prescribedBy')?.value.trim() || '';
    
    const medicine = medicines.find(m => m.id === medicineId);
    const availableStock = medicine ? medicine.stock : 0;
    
    if (!validateIssueForm(patientId, medicineId, quantity, availableStock)) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    
    if (!patient || !medicine) {
        showToast('Invalid patient or medicine selected', 'error');
        return;
    }
    
    // Update medicine stock
    const medicineIndex = medicines.findIndex(m => m.id === medicineId);
    if (medicineIndex !== -1) {
        medicines[medicineIndex].stock -= quantity;
        medicines[medicineIndex].status = medicines[medicineIndex].stock < 100 ? 'Low Stock' : 'In Stock';
        localStorage.setItem('pharmacy_medicines', JSON.stringify(medicines));
    }
    
    const newId = issues.length > 0 ? Math.max(...issues.map(i => i.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];
    
    const newIssue = {
        id: newId,
        patientId: patientId,
        patientName: patient.fullName,
        medicineId: medicineId,
        medicineName: medicine.name,
        quantity: quantity,
        prescribedBy: prescribedBy,
        date: today
    };
    
    issues.push(newIssue);
    saveIssues();
    renderTable();
    updateStats();
    showToast(`Issued ${quantity} ${medicine.unit || 'unit(s)'} of "${medicine.name}" to ${patient.fullName}`, 'success');
    closeModal();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    const addBtn = document.getElementById('issueBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalOverlay = document.querySelector('#issueModal .modal-overlay');
    const issueForm = document.getElementById('issueForm');
    const medicineSelect = document.getElementById('medicineId');
    
    if (addBtn) addBtn.addEventListener('click', addIssue);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (issueForm) issueForm.addEventListener('submit', saveIssueHandler);
    if (medicineSelect) medicineSelect.addEventListener('change', updateStockWarning);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('invisible')) {
            closeModal();
        }
    });
});