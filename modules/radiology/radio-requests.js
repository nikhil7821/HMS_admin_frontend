/**
 * Radiology Requests Management JS - Radiology Module
 * Uses theme.css for styling, clean event handling
 */

let radioRequests = [];
let patients = [];
let radioTests = [];
let deleteTargetId = null;
let searchTerm = '';
let statusFilter = '';
let dateFrom = '';
let dateTo = '';
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
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        radioTests = JSON.parse(localStorage.getItem('radiology_tests') || '[]');
        
        const stored = localStorage.getItem('radiology_requests');
        if (stored) {
            radioRequests = JSON.parse(stored);
        } else {
            const today = new Date().toISOString().split('T')[0];
            radioRequests = [
                {id: 1, requestNo: 'RAD-20260001', patientId: 1, patientName: 'Rajesh Kumar', testId: 1, testName: 'Chest X-Ray', testPrice: 500, requestDate: today, doctorName: 'Dr. Anjali Nair', status: 'Completed', findings: 'Normal chest X-ray, no abnormalities detected', impression: 'Clear lungs, normal cardiac shadow', radiologist: 'Dr. Rajesh Kulkarni', notes: ''},
                {id: 2, requestNo: 'RAD-20260002', patientId: 2, patientName: 'Priya Sharma', testId: 2, testName: 'MRI Brain', testPrice: 5000, requestDate: today, doctorName: 'Dr. Vikram Singh', status: 'Pending', findings: '', impression: '', radiologist: '', notes: ''},
                {id: 3, requestNo: 'RAD-20260003', patientId: 3, patientName: 'Amit Patel', testId: 3, testName: 'CT Abdomen', testPrice: 4000, requestDate: today, doctorName: 'Dr. Sneha Joshi', status: 'In Progress', findings: '', impression: '', radiologist: '', notes: ''},
                {id: 4, requestNo: 'RAD-20260004', patientId: 4, patientName: 'Neha Gupta', testId: 4, testName: 'Abdominal Ultrasound', testPrice: 1500, requestDate: today, doctorName: 'Dr. Rajiv Menon', status: 'Pending', findings: '', impression: '', radiologist: '', notes: ''}
            ];
            saveRequests();
        }
        refreshUI();
        populateSelects();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading request data', 'error');
    }
}

function saveRequests() {
    try {
        localStorage.setItem('radiology_requests', JSON.stringify(radioRequests));
    } catch (error) {
        console.error('Error saving requests:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const pending = radioRequests.filter(r => r.status === 'Pending').length;
    const inProgress = radioRequests.filter(r => r.status === 'In Progress').length;
    const completed = radioRequests.filter(r => r.status === 'Completed').length;
    const revenue = radioRequests.filter(r => r.status === 'Completed').reduce((sum, r) => sum + (r.testPrice || 0), 0);
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('totalRevenue').textContent = '₹' + revenue.toLocaleString('en-IN');
}

// ─── Filter ──────────────────────────────────────────

function getFilteredRequests() {
    return radioRequests.filter(req => {
        const matchesSearch = searchTerm === '' || 
            req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.testName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === '' || req.status === statusFilter;
        const matchesDateFrom = dateFrom === '' || req.requestDate >= dateFrom;
        const matchesDateTo = dateTo === '' || req.requestDate <= dateTo;
        
        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('requestsTable');
    if (!tbody) return;
    
    const filtered = getFilteredRequests();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="requests-empty">
                    <i class="fas fa-x-ray"></i>
                    <p>No requests found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Create a new request to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date descending (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    
    tbody.innerHTML = sorted.map(req => {
        const statusClass = req.status === 'Pending' ? 'pending' : 
                           req.status === 'In Progress' ? 'progress' : 
                           'completed';
        const hasReport = req.findings && req.findings.trim();
        const reportClass = hasReport ? 'report-cell has-report' : 'report-cell';
        
        return `
            <tr class="request-row" data-id="${req.id}">
                <td class="request-id">${req.requestNo}</td>
                <td class="patient-name">${esc(req.patientName)}</td>
                <td class="test-name">${esc(req.testName)}</td>
                <td style="color:var(--color-brown-300); font-size:0.8125rem;">${req.requestDate}</td>
                <td><span class="status-${statusClass}">${req.status}</span></td>
                <td class="${reportClass}">${hasReport ? esc(req.findings.substring(0, 40)) + (req.findings.length > 40 ? '...' : '') : '-'}</td>
                <td style="text-align:center;">
                    <div style="display:flex; gap:0.25rem; justify-content:center;">
                        ${req.status !== 'Completed' ? `
                            <button class="action-btn upload upload-btn" data-id="${req.id}" title="Upload Report">
                                <i class="fas fa-upload"></i>
                            </button>
                        ` : `
                            <button class="action-btn view view-btn" data-id="${req.id}" title="View Report">
                                <i class="fas fa-eye"></i>
                            </button>
                        `}
                        <button class="action-btn status status-btn" data-id="${req.id}" title="Update Status">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                        <button class="action-btn delete delete-btn" data-id="${req.id}" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Bind events
    tbody.querySelectorAll('.upload-btn').forEach(btn => {
        btn.addEventListener('click', () => openUploadModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewReport(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', () => updateStatus(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
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
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${esc(p.fullName)} (${p.phone})</option>`).join('');
    }
    
    // Scan select
    const testSelect = document.getElementById('testId');
    if (testSelect) {
        testSelect.innerHTML = '<option value="">-- Select Scan --</option>' + 
            radioTests.map(t => `<option value="${t.id}">${esc(t.name)} - ₹${t.price.toLocaleString('en-IN')}</option>`).join('');
    }
}

// ─── Validation ──────────────────────────────────────

function validateRequestForm() {
    let isValid = true;
    
    const patientId = document.getElementById('patientId').value;
    const testId = document.getElementById('testId').value;
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    
    if (!patientId) {
        document.getElementById('patientIdError').classList.add('show');
        document.getElementById('patientId').classList.add('error');
        isValid = false;
    }
    
    if (!testId) {
        document.getElementById('testIdError').classList.add('show');
        document.getElementById('testId').classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

function validateReportForm() {
    let isValid = true;
    const findings = document.getElementById('findings').value.trim();
    
    document.getElementById('findingsError').classList.remove('show');
    document.getElementById('findings').classList.remove('error');
    
    if (!findings) {
        document.getElementById('findingsError').classList.add('show');
        document.getElementById('findings').classList.add('error');
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
    document.getElementById('requestForm').reset();
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-x-ray"></i> New Radiology Request';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('requestDate');
    if (dateInput) dateInput.value = today;
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    populateSelects();
    openModal('requestModal');
}

function openUploadModal(id) {
    const request = radioRequests.find(r => r.id === id);
    if (request) {
        document.getElementById('reportRequestId').value = id;
        document.getElementById('findings').value = request.findings || '';
        document.getElementById('impression').value = request.impression || '';
        document.getElementById('radiologist').value = request.radiologist || '';
        document.getElementById('reportStatus').value = request.status || 'Completed';
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
        openModal('reportModal');
    }
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Form Submit - Request ──────────────────────────

function createRequest(e) {
    e.preventDefault();
    
    if (!validateRequestForm()) {
        showToast('Please select both patient and scan', 'error');
        return;
    }
    
    const patientId = parseInt(document.getElementById('patientId').value);
    const testId = parseInt(document.getElementById('testId').value);
    const patient = patients.find(p => p.id === patientId);
    const test = radioTests.find(t => t.id === testId);
    const requestDate = document.getElementById('requestDate').value || new Date().toISOString().split('T')[0];
    
    if (!patient || !test) {
        showToast('Invalid patient or scan selection', 'error');
        return;
    }
    
    const newId = radioRequests.length > 0 ? Math.max(...radioRequests.map(r => r.id)) + 1 : 1;
    const requestNo = 'RAD-' + new Date().getFullYear() + String(newId).padStart(5, '0');
    
    radioRequests.push({
        id: newId,
        requestNo: requestNo,
        patientId: patientId,
        patientName: patient.fullName,
        testId: testId,
        testName: test.name,
        testPrice: test.price,
        requestDate: requestDate,
        doctorName: document.getElementById('doctorName').value.trim(),
        notes: document.getElementById('notes').value.trim(),
        status: 'Pending',
        findings: '',
        impression: '',
        radiologist: ''
    });
    
    saveRequests();
    refreshUI();
    closeModal('requestModal');
    showToast(`✅ Radiology request created! Request ID: ${requestNo}`, 'success');
}

// ─── Form Submit - Report ──────────────────────────

function saveReport(e) {
    e.preventDefault();
    
    if (!validateReportForm()) {
        showToast('Please enter findings', 'error');
        return;
    }
    
    const requestId = parseInt(document.getElementById('reportRequestId').value);
    const request = radioRequests.find(r => r.id === requestId);
    
    if (request) {
        request.findings = document.getElementById('findings').value.trim();
        request.impression = document.getElementById('impression').value.trim();
        request.radiologist = document.getElementById('radiologist').value.trim();
        request.status = document.getElementById('reportStatus').value;
        
        saveRequests();
        refreshUI();
        closeModal('reportModal');
        showToast('✅ Report uploaded successfully!', 'success');
        
        // Create invoice if completed
        if (request.status === 'Completed') {
            createRadiologyInvoice(request);
        }
    }
}

function createRadiologyInvoice(request) {
    try {
        let invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
        const newId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
        const invoiceNo = 'INV-' + new Date().getFullYear() + String(newId).padStart(5, '0');
        const total = request.testPrice * 1.05; // 5% tax
        
        invoices.push({
            id: newId,
            invoiceNo: invoiceNo,
            patientId: request.patientId,
            patientName: request.patientName,
            type: 'Radiology',
            description: `Radiology Scan: ${request.testName}`,
            amount: request.testPrice,
            tax: 5,
            discount: 0,
            total: total,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending'
        });
        
        localStorage.setItem('hms_invoices', JSON.stringify(invoices));
    } catch (error) {
        console.error('Error creating invoice:', error);
    }
}

// ─── Actions ─────────────────────────────────────────

function updateStatus(id) {
    const request = radioRequests.find(r => r.id === id);
    if (request) {
        const statuses = ['Pending', 'In Progress', 'Completed'];
        let currentIndex = statuses.indexOf(request.status);
        let nextIndex = (currentIndex + 1) % statuses.length;
        request.status = statuses[nextIndex];
        saveRequests();
        refreshUI();
        showToast(`✅ Status updated to ${request.status}`, 'success');
    }
}

function viewReport(id) {
    const request = radioRequests.find(r => r.id === id);
    if (request && request.findings) {
        const reportMsg = `🩻 RADIOLOGY REPORT 🩻\n\n` +
            `Request ID: ${request.requestNo}\n` +
            `Patient: ${request.patientName}\n` +
            `Scan: ${request.testName}\n` +
            `Request Date: ${request.requestDate}\n\n` +
            `🔍 Findings:\n${request.findings}\n\n` +
            `📝 Impression:\n${request.impression || 'N/A'}\n\n` +
            `👨‍⚕️ Radiologist: ${request.radiologist || 'Not specified'}`;
        alert(reportMsg);
    } else {
        showToast('No report available yet', 'error');
    }
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    const request = radioRequests.find(r => r.id === deleteTargetId);
    radioRequests = radioRequests.filter(r => r.id !== deleteTargetId);
    saveRequests();
    refreshUI();
    closeModal('deleteModal');
    
    if (request) {
        showToast(`🗑️ Request ${request.requestNo} deleted successfully`, 'success');
    }
    deleteTargetId = null;
}

// ─── Init ────────────────────────────────────────────

function initRadioRequestsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('newRequestBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeRequestModalBtn')?.addEventListener('click', () => closeModal('requestModal'));
    document.getElementById('cancelRequestModalBtn')?.addEventListener('click', () => closeModal('requestModal'));
    document.getElementById('closeReportModalBtn')?.addEventListener('click', () => closeModal('reportModal'));
    document.getElementById('cancelReportModalBtn')?.addEventListener('click', () => closeModal('reportModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('requestForm')?.addEventListener('submit', createRequest);
    document.getElementById('reportForm')?.addEventListener('submit', saveReport);
    
    document.getElementById('resetFilter')?.addEventListener('click', () => {
        searchTerm = '';
        statusFilter = '';
        dateFrom = '';
        dateTo = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderTable();
    });
    
    document.getElementById('dateFrom')?.addEventListener('change', (e) => {
        dateFrom = e.target.value;
        renderTable();
    });
    
    document.getElementById('dateTo')?.addEventListener('change', (e) => {
        dateTo = e.target.value;
        renderTable();
    });
    
    // Real-time validation
    document.getElementById('patientId')?.addEventListener('change', function() {
        if (this.value) {
            document.getElementById('patientIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('testId')?.addEventListener('change', function() {
        if (this.value) {
            document.getElementById('testIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('findings')?.addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('findingsError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    // Close modals on overlay click
    document.getElementById('requestModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('requestModal');
    });
    document.getElementById('reportModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('reportModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('requestModal');
            closeModal('reportModal');
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
            setTimeout(initRadioRequestsModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initRadioRequestsModule();
    }, 3000);
});