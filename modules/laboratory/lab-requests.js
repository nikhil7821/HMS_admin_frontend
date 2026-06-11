/**
 * Lab Requests Management JS - Laboratory Module
 * Professional UI, Fully Working, Indian Names, Rupee Symbol
 */

let labRequests = [];
let patients = [];
let labTests = [];
let deleteId = null;

function loadData() {
    patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
    labTests = JSON.parse(localStorage.getItem('lab_tests') || '[]');
    
    const stored = localStorage.getItem('lab_requests');
    if(stored) {
        labRequests = JSON.parse(stored);
        // Check and reset if foreign names exist
        if (labRequests[0] && (labRequests[0].patientName === 'John Doe' || labRequests[0].patientName === 'Jane Smith')) {
            setIndianRequests();
        }
    } else {
        setIndianRequests();
    }
    updateStats();
    renderTable();
    populateSelects();
}

function setIndianRequests() {
    const today = new Date().toISOString().split('T')[0];
    labRequests = [
        {id: 1, requestNo: 'LAB-20260001', patientId: 1, patientName: 'Rajesh Kumar', testId: 1, testName: 'Complete Blood Count', testPrice: 500, requestDate: today, doctorName: 'Dr. Anjali Nair', status: 'Completed', result: 'All values normal', normalRange: '4.5-11.0', remarks: '', notes: 'Routine checkup'},
        {id: 2, requestNo: 'LAB-20260002', patientId: 2, patientName: 'Priya Sharma', testId: 2, testName: 'Blood Sugar Fasting', testPrice: 200, requestDate: today, doctorName: 'Dr. Vikram Singh', status: 'Pending', result: '', normalRange: '', remarks: '', notes: ''},
        {id: 3, requestNo: 'LAB-20260003', patientId: 3, patientName: 'Amit Patel', testId: 3, testName: 'Lipid Profile', testPrice: 800, requestDate: today, doctorName: 'Dr. Sneha Joshi', status: 'In Progress', result: '', normalRange: '', remarks: '', notes: ''},
        {id: 4, requestNo: 'LAB-20260004', patientId: 4, patientName: 'Neha Gupta', testId: 4, testName: 'Urine Culture', testPrice: 600, requestDate: today, doctorName: 'Dr. Rajiv Menon', status: 'Pending', result: '', normalRange: '', remarks: '', notes: ''}
    ];
    saveRequests();
}

function saveRequests() {
    localStorage.setItem('lab_requests', JSON.stringify(labRequests));
}

function updateStats() {
    const pending = labRequests.filter(r => r.status === 'Pending').length;
    const inProgress = labRequests.filter(r => r.status === 'In Progress').length;
    const completed = labRequests.filter(r => r.status === 'Completed').length;
    const revenue = labRequests.filter(r => r.status === 'Completed').reduce((sum, r) => sum + (r.testPrice || 0), 0);
    
    document.getElementById('pendingCount').innerText = pending;
    document.getElementById('inProgressCount').innerText = inProgress;
    document.getElementById('completedCount').innerText = completed;
    document.getElementById('totalRevenue').innerText = '₹' + revenue.toLocaleString('en-IN');
}

function validateRequestForm() {
    let isValid = true;
    
    const patientId = document.getElementById('patientId').value;
    const testId = document.getElementById('testId').value;
    
    if (!patientId) {
        document.getElementById('patientIdError').classList.add('show');
        document.getElementById('patientId').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('patientIdError').classList.remove('show');
        document.getElementById('patientId').classList.remove('error');
    }
    
    if (!testId) {
        document.getElementById('testIdError').classList.add('show');
        document.getElementById('testId').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('testIdError').classList.remove('show');
        document.getElementById('testId').classList.remove('error');
    }
    
    return isValid;
}

function validateResultForm() {
    let isValid = true;
    const resultValue = document.getElementById('resultValue').value.trim();
    
    if (!resultValue) {
        document.getElementById('resultValueError').classList.add('show');
        document.getElementById('resultValue').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('resultValueError').classList.remove('show');
        document.getElementById('resultValue').classList.remove('error');
    }
    
    return isValid;
}

function renderTable() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const dateFrom = document.getElementById('dateFrom')?.value || '';
    const dateTo = document.getElementById('dateTo')?.value || '';
    
    let filtered = labRequests.filter(req => {
        const matchesSearch = search === '' || 
            req.patientName.toLowerCase().includes(search) || 
            req.testName.toLowerCase().includes(search);
        const matchesStatus = status === '' || req.status === status;
        const matchesDateFrom = dateFrom === '' || req.requestDate >= dateFrom;
        const matchesDateTo = dateTo === '' || req.requestDate <= dateTo;
        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
    
    const tbody = document.getElementById('requestsTable');
    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-flask text-3xl mb-2 block"></i><p class="font-normal">No requests found</p> </td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(req => `
        <tr class="request-row">
            <td class="px-5 py-3 text-sm font-mono font-medium text-[#1e293b]">${req.requestNo}</td>
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(req.patientName)}</td>
            <td class="px-5 py-3 text-[#475569] text-sm">${escapeHtml(req.testName)}</td>
            <td class="px-5 py-3 text-sm text-[#475569]">${req.requestDate}</td>
            <td class="px-5 py-3">
                <span class="status-${req.status === 'Pending' ? 'pending' : req.status === 'In Progress' ? 'progress' : 'completed'}">
                    ${req.status}
                </span>
            </td>
            <td class="px-5 py-3 text-sm text-[#475569] max-w-[150px] truncate">
                ${req.result ? escapeHtml(req.result.substring(0, 40)) + (req.result.length > 40 ? '...' : '') : '-'}
            </td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    ${req.status !== 'Completed' ? `
                        <button onclick="uploadResult(${req.id})" class="text-[#10b981] hover:text-[#059669] transition" title="Upload Result">
                            <i class="fas fa-upload"></i>
                        </button>
                    ` : `
                        <button onclick="viewResult(${req.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="View Result">
                            <i class="fas fa-eye"></i>
                        </button>
                    `}
                    <button onclick="updateStatus(${req.id})" class="text-[#f59e0b] hover:text-[#d97706] transition" title="Update Status">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                    <button onclick="deleteRequest(${req.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
          </tr>
    `).join('');
}

function populateSelects() {
    const patientSelect = document.getElementById('patientId');
    if(patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${escapeHtml(p.fullName)} (${p.phone})</option>`).join('');
    }
    
    const testSelect = document.getElementById('testId');
    if(testSelect) {
        testSelect.innerHTML = '<option value="">-- Select Test --</option>' + 
            labTests.map(t => `<option value="${t.id}" data-price="${t.price}">${escapeHtml(t.name)} - ₹${t.price.toLocaleString('en-IN')}</option>`).join('');
    }
}

function openRequestModal() {
    document.getElementById('requestForm').reset();
    document.getElementById('requestModal').classList.add('active');
    populateSelects();
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function createRequest(e) {
    e.preventDefault();
    
    if(!validateRequestForm()) {
        showToast('Please select both patient and test', 'error');
        return;
    }
    
    const patientId = parseInt(document.getElementById('patientId').value);
    const testId = parseInt(document.getElementById('testId').value);
    const patient = patients.find(p => p.id === patientId);
    const test = labTests.find(t => t.id === testId);
    
    if (!patient || !test) {
        showToast('Invalid patient or test selection', 'error');
        return;
    }
    
    const newId = labRequests.length > 0 ? Math.max(...labRequests.map(r => r.id)) + 1 : 1;
    const requestNo = 'LAB-' + new Date().getFullYear() + String(newId).padStart(5, '0');
    
    labRequests.push({
        id: newId,
        requestNo: requestNo,
        patientId: patientId,
        patientName: patient.fullName,
        testId: testId,
        testName: test.name,
        testPrice: test.price,
        requestDate: new Date().toISOString().split('T')[0],
        doctorName: document.getElementById('doctorName').value,
        notes: document.getElementById('notes').value,
        status: 'Pending',
        result: '',
        normalRange: '',
        remarks: ''
    });
    
    saveRequests();
    updateStats();
    renderTable();
    closeRequestModal();
    showToast(`Lab request created! Request ID: ${requestNo}`, 'success');
}

function uploadResult(requestId) {
    const request = labRequests.find(r => r.id === requestId);
    if(request) {
        document.getElementById('resultRequestId').value = requestId;
        document.getElementById('resultValue').value = request.result || '';
        document.getElementById('normalRangeRef').value = request.normalRange || '';
        document.getElementById('remarks').value = request.remarks || '';
        document.getElementById('resultModal').classList.add('active');
        
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

function saveResult(e) {
    e.preventDefault();
    
    if(!validateResultForm()) {
        showToast('Please enter test results', 'error');
        return;
    }
    
    const requestId = parseInt(document.getElementById('resultRequestId').value);
    const request = labRequests.find(r => r.id === requestId);
    
    if(request) {
        request.result = document.getElementById('resultValue').value;
        request.normalRange = document.getElementById('normalRangeRef').value;
        request.remarks = document.getElementById('remarks').value;
        request.status = 'Completed';
        
        saveRequests();
        updateStats();
        renderTable();
        closeResultModal();
        showToast('Result uploaded successfully!', 'success');
        
        // Create invoice for this lab test
        createLabInvoice(request);
    }
}

function createLabInvoice(request) {
    let invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
    const newId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
    const invoiceNo = 'INV-' + new Date().getFullYear() + String(newId).padStart(5, '0');
    
    invoices.push({
        id: newId,
        invoiceNo: invoiceNo,
        patientId: request.patientId,
        patientName: request.patientName,
        type: 'Laboratory',
        description: `Lab Test: ${request.testName}`,
        amount: request.testPrice,
        tax: 5,
        discount: 0,
        total: request.testPrice * 1.05,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
    });
    
    localStorage.setItem('hms_invoices', JSON.stringify(invoices));
}

function updateStatus(requestId) {
    const request = labRequests.find(r => r.id === requestId);
    if(request) {
        const statuses = ['Pending', 'In Progress', 'Completed'];
        let currentIndex = statuses.indexOf(request.status);
        let nextIndex = (currentIndex + 1) % statuses.length;
        request.status = statuses[nextIndex];
        saveRequests();
        updateStats();
        renderTable();
        showToast(`Status updated to ${request.status}`, 'success');
    }
}

function viewResult(requestId) {
    const request = labRequests.find(r => r.id === requestId);
    if(request && request.result) {
        alert(`📋 TEST RESULT DETAILS 📋\n\n` +
            `Request ID: ${request.requestNo}\n` +
            `Patient: ${request.patientName}\n` +
            `Test: ${request.testName}\n` +
            `Request Date: ${request.requestDate}\n\n` +
            `🔬 Result:\n${request.result}\n\n` +
            `📊 Normal Range: ${request.normalRange || 'N/A'}\n` +
            `📝 Remarks: ${request.remarks || 'N/A'}`);
    } else {
        showToast('No result available yet', 'error');
    }
}

function deleteRequest(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if(deleteId) {
        labRequests = labRequests.filter(r => r.id !== deleteId);
        saveRequests();
        updateStats();
        renderTable();
        showToast('Request deleted successfully', 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function closeRequestModal() {
    document.getElementById('requestModal').classList.remove('active');
    document.getElementById('requestForm').reset();
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function closeResultModal() {
    document.getElementById('resultModal').classList.remove('active');
    document.getElementById('resultForm').reset();
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
    
    document.getElementById('newRequestBtn')?.addEventListener('click', openRequestModal);
    document.getElementById('closeRequestModalBtn')?.addEventListener('click', closeRequestModal);
    document.getElementById('cancelRequestModalBtn')?.addEventListener('click', closeRequestModal);
    document.getElementById('closeResultModalBtn')?.addEventListener('click', closeResultModal);
    document.getElementById('cancelResultModalBtn')?.addEventListener('click', closeResultModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('requestForm')?.addEventListener('submit', createRequest);
    document.getElementById('resultForm')?.addEventListener('submit', saveResult);
    document.getElementById('searchInput')?.addEventListener('input', () => renderTable());
    document.getElementById('statusFilter')?.addEventListener('change', () => renderTable());
    document.getElementById('dateFrom')?.addEventListener('change', () => renderTable());
    document.getElementById('dateTo')?.addEventListener('change', () => renderTable());
    
    // Real-time validation
    document.getElementById('patientId')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('patientIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('testId')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('testIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('resultValue')?.addEventListener('input', function() {
        if(this.value.trim()) {
            document.getElementById('resultValueError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
});

window.uploadResult = uploadResult;
window.updateStatus = updateStatus;
window.viewResult = viewResult;
window.deleteRequest = deleteRequest;