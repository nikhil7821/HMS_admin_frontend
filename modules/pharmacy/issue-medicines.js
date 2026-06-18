/**
 * Issue Medicines Management Module
 * MedFlow Pharmacy - Issue Medicines to Patients CRUD
 * Uses theme.css for styling, clean event handling
 */

let issues = [];
let patients = [];
let medicines = [];
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

function loadData() {
    try {
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
        medicines = storedMedicines ? JSON.parse(storedMedicines) : [];
        
        // Load issues
        const storedIssues = localStorage.getItem('pharmacy_issues');
        if (storedIssues) {
            issues = JSON.parse(storedIssues);
        } else {
            issues = [];
        }
        refreshUI();
        populateSelects();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data', 'error');
    }
}

function saveIssues() {
    try {
        localStorage.setItem('pharmacy_issues', JSON.stringify(issues));
    } catch (error) {
        console.error('Error saving issues:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = issues.length;
    const totalQty = issues.reduce((sum, i) => sum + i.quantity, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayCount = issues.filter(i => i.date === today).length;
    
    document.getElementById('totalIssues').textContent = total;
    document.getElementById('totalQuantity').textContent = totalQty;
    document.getElementById('todayIssues').textContent = todayCount;
    document.getElementById('lastUpdated').textContent = 
        new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Filter ──────────────────────────────────────────

function getFilteredIssues() {
    return issues.filter(issue => {
        const matchesSearch = searchTerm === '' || 
            issue.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (issue.prescribedBy && issue.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('issuesTable');
    if (!tbody) return;
    
    const filtered = getFilteredIssues();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="issues-empty">
                    <i class="fas fa-folder-open"></i>
                    <p>No issues recorded</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Issue medicine to a patient to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date descending (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sorted.map(issue => `
        <tr class="issue-row" data-id="${issue.id}">
            <td style="color:var(--color-brown-600); font-size:0.8125rem;">${issue.date}</td>
            <td class="patient-name">${esc(issue.patientName)}</td>
            <td class="medicine-name">${esc(issue.medicineName)}</td>
            <td style="text-align:center;"><span class="qty-badge">${issue.quantity}</span></td>
            <td style="color:var(--color-brown-300); font-size:0.8125rem;">${issue.prescribedBy ? esc(issue.prescribedBy) : '—'}</td>
            <td style="text-align:center;">
                <button class="action-btn delete delete-btn" data-id="${issue.id}" title="Delete Issue">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Bind events
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteIssue(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Populate Selects ──────────────────────────────

function populateSelects() {
    // Patient select
    const patientSelect = document.getElementById('patientId');
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">Select Patient</option>' + 
            patients.map(p => `<option value="${p.id}">${esc(p.fullName)}</option>`).join('');
    }
    
    // Medicine select
    const medicineSelect = document.getElementById('medicineId');
    if (medicineSelect) {
        medicineSelect.innerHTML = '<option value="">Select Medicine</option>' + 
            medicines.map(m => 
                `<option value="${m.id}">${esc(m.name)} ${m.brand ? '(' + esc(m.brand) + ')' : ''} - Stock: ${m.stock || 0} ${m.unit || ''}</option>`
            ).join('');
    }
}

// ─── Stock Warning ──────────────────────────────────

function updateStockWarning() {
    const medicineId = parseInt(document.getElementById('medicineId')?.value) || null;
    const medicine = medicines.find(m => m.id === medicineId);
    const stockWarning = document.getElementById('stockWarning');
    const quantityInput = document.getElementById('quantity');
    
    if (medicine && stockWarning) {
        const stock = medicine.stock || 0;
        const unit = medicine.unit || 'units';
        
        if (stock === 0) {
            stockWarning.className = 'stock-warning danger';
            stockWarning.innerHTML = `<i class="fas fa-times-circle"></i> Out of stock! Cannot issue this medicine`;
            if (quantityInput) {
                quantityInput.disabled = true;
                quantityInput.value = '';
            }
        } else if (stock < 100) {
            stockWarning.className = 'stock-warning warning';
            stockWarning.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Low stock: Only ${stock} ${unit} left`;
            if (quantityInput) quantityInput.disabled = false;
        } else {
            stockWarning.className = 'stock-warning success';
            stockWarning.innerHTML = `<i class="fas fa-check-circle"></i> Available stock: ${stock} ${unit}`;
            if (quantityInput) quantityInput.disabled = false;
        }
    } else if (stockWarning) {
        stockWarning.className = 'stock-warning';
        stockWarning.innerHTML = '';
        if (quantityInput) quantityInput.disabled = false;
    }
}

// ─── Validation ──────────────────────────────────────

function validateIssueForm(patientId, medicineId, quantity, availableStock) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['patientError', 'medicineError', 'quantityError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    
    const patientSelect = document.getElementById('patientId');
    const medicineSelect = document.getElementById('medicineId');
    const quantityInput = document.getElementById('quantity');
    
    [patientSelect, medicineSelect, quantityInput].forEach(el => {
        if (el) el.classList.remove('error');
    });
    
    // Patient validation
    if (!patientId) {
        const errorEl = document.getElementById('patientError');
        if (errorEl) errorEl.textContent = 'Please select a patient';
        if (patientSelect) patientSelect.classList.add('error');
        isValid = false;
    }
    
    // Medicine validation
    if (!medicineId) {
        const errorEl = document.getElementById('medicineError');
        if (errorEl) errorEl.textContent = 'Please select a medicine';
        if (medicineSelect) medicineSelect.classList.add('error');
        isValid = false;
    }
    
    // Quantity validation
    if (!quantity || quantity <= 0) {
        const errorEl = document.getElementById('quantityError');
        if (errorEl) errorEl.textContent = 'Please enter a valid quantity (minimum 1)';
        if (quantityInput) quantityInput.classList.add('error');
        isValid = false;
    } else if (medicineId && quantity > availableStock) {
        const errorEl = document.getElementById('quantityError');
        if (errorEl) errorEl.textContent = `Insufficient stock! Only ${availableStock} available`;
        if (quantityInput) quantityInput.classList.add('error');
        isValid = false;
    } else if (quantity > 1000) {
        const errorEl = document.getElementById('quantityError');
        if (errorEl) errorEl.textContent = 'Quantity cannot exceed 1000';
        if (quantityInput) quantityInput.classList.add('error');
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
    // Refresh data
    const storedPatients = localStorage.getItem('hms_patients');
    const storedMedicines = localStorage.getItem('pharmacy_medicines');
    if (storedPatients) patients = JSON.parse(storedPatients);
    if (storedMedicines) medicines = JSON.parse(storedMedicines);
    populateSelects();
    
    document.getElementById('issueForm').reset();
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-prescription-bottle"></i> Issue Medicine';
    
    // Reset stock warning
    const stockWarning = document.getElementById('stockWarning');
    if (stockWarning) {
        stockWarning.className = 'stock-warning';
        stockWarning.innerHTML = '';
    }
    
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) quantityInput.disabled = false;
    
    // Clear errors
    const errorFields = ['patientError', 'medicineError', 'quantityError', 'prescribedError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.textContent = '';
    });
    ['patientId', 'medicineId', 'quantity'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('error');
    });
    
    openModal('issueModal');
}

// ─── Form Submit ────────────────────────────────────

function saveIssue(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patientId').value) || null;
    const medicineId = parseInt(document.getElementById('medicineId').value) || null;
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const prescribedBy = document.getElementById('prescribedBy').value.trim();
    
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
        medicines[medicineIndex].stock = (medicines[medicineIndex].stock || 0) - quantity;
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
    refreshUI();
    closeModal('issueModal');
    
    showToast(`✅ Issued ${quantity} ${medicine.unit || 'unit(s)'} of "${medicine.name}" to ${patient.fullName}`, 'success');
}

// ─── Delete ──────────────────────────────────────────

function deleteIssue(id) {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;
    
    if (confirm(`Are you sure you want to delete this issue record for "${issue.patientName}"? This will NOT revert stock changes.`)) {
        issues = issues.filter(i => i.id !== id);
        saveIssues();
        refreshUI();
        showToast(`🗑️ Issue record deleted successfully`, 'success');
    }
}

// ─── Init ────────────────────────────────────────────

function initIssueModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('issueBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('issueModal'));
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => closeModal('issueModal'));
    document.getElementById('issueForm')?.addEventListener('submit', saveIssue);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        document.getElementById('searchInput').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    // Stock warning on medicine select
    document.getElementById('medicineId')?.addEventListener('change', updateStockWarning);
    
    // Close modal on overlay click
    document.getElementById('issueModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('issueModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('issueModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initIssueModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initIssueModule();
    }, 3000);
});