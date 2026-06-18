/**
 * Invoices Management JS - Billing Module
 * Uses theme.css for styling, clean event handling
 */

var invoices = [];
var patients = [];
var currentPage = 1;
var rowsPerPage = 10;
var deleteTargetId = null;
var searchTerm = '';
var statusFilter = '';
var dateFrom = '';
var dateTo = '';
var isInitialized = false;

// ─── 🔥 ADD THIS HERE - Auto-Open from Dashboard ───
document.addEventListener('DOMContentLoaded', function() {
    var action = sessionStorage.getItem('dashboard_action');
    if (action === 'openCreateInvoice') {
        sessionStorage.removeItem('dashboard_action');
        setTimeout(function() {
            if (typeof openCreateModal === 'function') {
                openCreateModal();
            } else if (typeof window.openCreateModal === 'function') {
                window.openCreateModal();
            } else {
                var addBtn = document.getElementById('createInvoiceBtn');
                if (addBtn) addBtn.click();
            }
        }, 600);
    }
});
// ─── 🔥 END OF AUTO-OPEN SECTION ────────────────────

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
}

// ─── Toast Notification ──────────────────────────────

function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    var colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a' };
    toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300';
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = '<div class="flex items-center gap-2"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle') + '"></i><span>' + esc(message) + '</span></div>';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        var stored = localStorage.getItem('hms_invoices');
        if (stored) {
            invoices = JSON.parse(stored);
        } else {
            var today = new Date().toISOString().split('T')[0];
            invoices = [
                {id: 1, patientId: 1, patientName: 'Rajesh Kumar', invoiceNo: 'INV-20260001', date: today, dueDate: addDays(today, 15), type: 'OPD', description: 'Consultation fee for cardiology', amount: 1500, tax: 5, discount: 0, total: 1575, status: 'Paid'},
                {id: 2, patientId: 2, patientName: 'Priya Sharma', invoiceNo: 'INV-20260002', date: today, dueDate: addDays(today, 15), type: 'Laboratory', description: 'Blood tests - Complete Blood Count, Lipid Profile', amount: 2500, tax: 5, discount: 100, total: 2525, status: 'Pending'},
                {id: 3, patientId: 3, patientName: 'Amit Patel', invoiceNo: 'INV-20260003', date: today, dueDate: addDays(today, 15), type: 'Pharmacy', description: 'Medicines - Paracetamol, Antibiotics', amount: 800, tax: 5, discount: 0, total: 840, status: 'Paid'},
                {id: 4, patientId: 1, patientName: 'Rajesh Kumar', invoiceNo: 'INV-20260004', date: today, dueDate: addDays(today, 15), type: 'Radiology', description: 'Chest X-Ray', amount: 1200, tax: 5, discount: 0, total: 1260, status: 'Pending'},
                {id: 5, patientId: 4, patientName: 'Neha Gupta', invoiceNo: 'INV-20260005', date: today, dueDate: addDays(today, 15), type: 'OPD', description: 'Gynacology consultation', amount: 1000, tax: 5, discount: 50, total: 1000, status: 'Paid'},
                {id: 6, patientId: 5, patientName: 'Sunil Reddy', invoiceNo: 'INV-20260006', date: today, dueDate: addDays(today, 15), type: 'Laboratory', description: 'Thyroid Profile, Vitamin D Test', amount: 1800, tax: 5, discount: 0, total: 1890, status: 'Cancelled'}
            ];
            saveInvoices();
        }
        refreshUI();
        populatePatientSelect();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading invoice data', 'error');
    }
}

function saveInvoices() {
    try {
        localStorage.setItem('hms_invoices', JSON.stringify(invoices));
    } catch (error) {
        console.error('Error saving invoices:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    var total = invoices.length;
    var totalRevenue = 0;
    var pendingAmount = 0;
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].status === 'Paid') totalRevenue += invoices[i].total;
        if (invoices[i].status === 'Pending') pendingAmount += invoices[i].total;
    }
    var collectionRate = (totalRevenue + pendingAmount) > 0 ? Math.round((totalRevenue / (totalRevenue + pendingAmount)) * 100) : 0;
    
    document.getElementById('totalInvoices').textContent = total;
    document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
    document.getElementById('pendingAmount').textContent = '₹' + pendingAmount.toLocaleString('en-IN');
    document.getElementById('collectionRate').textContent = collectionRate + '%';
}

// ─── Filter ──────────────────────────────────────────

function getFilteredInvoices() {
    var result = [];
    for (var i = 0; i < invoices.length; i++) {
        var inv = invoices[i];
        var matchesSearch = searchTerm === '' || inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesStatus = statusFilter === '' || inv.status === statusFilter;
        var matchesDateFrom = dateFrom === '' || inv.date >= dateFrom;
        var matchesDateTo = dateTo === '' || inv.date <= dateTo;
        if (matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo) {
            result.push(inv);
        }
    }
    return result;
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    var tbody = document.getElementById('invoicesTableBody');
    if (!tbody) return;
    
    var filtered = getFilteredInvoices();
    var totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    var start = (currentPage - 1) * rowsPerPage;
    var end = Math.min(start + rowsPerPage, filtered.length);
    var pageInvoices = filtered.slice(start, end);
    
    if (pageInvoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:3rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-file-invoice" style="font-size:2rem; margin-bottom:0.75rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No invoices found</p><p style="font-size:0.75rem; margin-top:0.25rem; color:var(--color-brown-100);">Create an invoice to get started.</p></td></tr>';
        document.getElementById('paginationInfo').textContent = 'Showing 0 of 0';
        document.getElementById('paginationButtons').innerHTML = '';
        return;
    }
    
    var html = '';
    for (var i = 0; i < pageInvoices.length; i++) {
        var inv = pageInvoices[i];
        var statusClass = inv.status.toLowerCase();
        var isPending = inv.status === 'Pending';
        
        html += '<tr class="invoice-row" data-id="' + inv.id + '">';
        html += '<td class="invoice-no">' + inv.invoiceNo + '</td>';
        html += '<td class="patient-name">' + esc(inv.patientName) + '</td>';
        html += '<td class="hidden md:table-cell" style="color:var(--color-brown-300); font-size:0.8125rem;">' + inv.date + '</td>';
        html += '<td style="text-align:center;" class="total-amount">₹' + inv.total.toLocaleString('en-IN') + '</td>';
        html += '<td class="hidden lg:table-cell"><span class="type-badge">' + inv.type + '</span></td>';
        html += '<td><span class="status-' + statusClass + '">' + inv.status + '</span></td>';
        html += '<td style="text-align:center;"><div style="display:flex; gap:0.375rem; justify-content:center;">';
        html += '<button class="action-btn view view-btn" data-id="' + inv.id + '" title="View Invoice"><i class="fas fa-eye"></i></button>';
        if (isPending) {
            html += '<button class="action-btn pay pay-btn" data-id="' + inv.id + '" title="Record Payment"><i class="fas fa-money-bill-wave"></i></button>';
        }
        html += '<button class="action-btn edit edit-btn" data-id="' + inv.id + '" title="Edit Invoice"><i class="fas fa-edit"></i></button>';
        html += '<button class="action-btn delete delete-btn" data-id="' + inv.id + '" title="Delete Invoice"><i class="fas fa-trash-alt"></i></button>';
        html += '</div></td></tr>';
    }
    tbody.innerHTML = html;
    
    document.getElementById('paginationInfo').textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + filtered.length + ' invoices';
    
    var paginationHtml = '';
    for (var j = 1; j <= totalPages; j++) {
        paginationHtml += '<button class="pagination-btn ' + (j === currentPage ? 'active' : '') + '" data-page="' + j + '">' + j + '</button>';
    }
    document.getElementById('paginationButtons').innerHTML = paginationHtml;
    
    // Bind events
    tbody.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { viewInvoice(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.pay-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openPaymentModal(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openEditModal(parseInt(this.dataset.id)); });
    });
    tbody.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(parseInt(this.dataset.id)); });
    });
    
    document.querySelectorAll('.pagination-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            currentPage = parseInt(this.dataset.page);
            renderTable();
        });
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Populate Patient Select ──────────────────────────

function populatePatientSelect() {
    var select = document.getElementById('patientId');
    if (select) {
        var html = '<option value="">-- Select Patient --</option>';
        for (var i = 0; i < patients.length; i++) {
            html += '<option value="' + patients[i].id + '">' + esc(patients[i].fullName) + ' (' + patients[i].phone + ')</option>';
        }
        select.innerHTML = html;
    }
}

// ─── Validation ──────────────────────────────────────

function validateInvoiceForm() {
    var isValid = true;
    var patientId = document.getElementById('patientId').value;
    var invoiceType = document.getElementById('invoiceType').value;
    var invoiceDate = document.getElementById('invoiceDate').value;
    var amount = document.getElementById('amount').value;
    var status = document.getElementById('status').value;
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    
    if (!patientId) {
        document.getElementById('patientIdError').classList.add('show');
        document.getElementById('patientId').classList.add('error');
        isValid = false;
    }
    if (!invoiceType) {
        document.getElementById('invoiceTypeError').classList.add('show');
        document.getElementById('invoiceType').classList.add('error');
        isValid = false;
    }
    if (!invoiceDate) {
        document.getElementById('invoiceDateError').classList.add('show');
        document.getElementById('invoiceDate').classList.add('error');
        isValid = false;
    }
    if (!amount || parseFloat(amount) <= 0) {
        document.getElementById('amountError').classList.add('show');
        document.getElementById('amount').classList.add('error');
        isValid = false;
    }
    if (!status) {
        document.getElementById('statusError').classList.add('show');
        document.getElementById('status').classList.add('error');
        isValid = false;
    }
    return isValid;
}

function validatePaymentForm() {
    var isValid = true;
    var paymentAmount = document.getElementById('paymentAmount').value;
    var paymentMethod = document.getElementById('paymentMethod').value;
    
    document.getElementById('paymentAmountError').classList.remove('show');
    document.getElementById('paymentMethodError').classList.remove('show');
    document.getElementById('paymentAmount').classList.remove('error');
    document.getElementById('paymentMethod').classList.remove('error');
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        document.getElementById('paymentAmountError').classList.add('show');
        document.getElementById('paymentAmount').classList.add('error');
        isValid = false;
    }
    if (!paymentMethod) {
        document.getElementById('paymentMethodError').classList.add('show');
        document.getElementById('paymentMethod').classList.add('error');
        isValid = false;
    }
    return isValid;
}

// ─── Calculations ──────────────────────────────────

function calculateTotal() {
    var amount = parseFloat(document.getElementById('amount').value) || 0;
    var tax = parseFloat(document.getElementById('tax').value) || 0;
    var discount = parseFloat(document.getElementById('discount').value) || 0;
    var subtotal = amount;
    var taxAmount = (subtotal * tax) / 100;
    var total = subtotal + taxAmount - discount;
    
    document.getElementById('subtotalDisplay').textContent = '₹' + subtotal.toFixed(2);
    document.getElementById('taxRate').textContent = tax;
    document.getElementById('taxAmountDisplay').textContent = '₹' + taxAmount.toFixed(2);
    document.getElementById('discountDisplay').textContent = '₹' + discount.toFixed(2);
    document.getElementById('totalDisplay').textContent = '₹' + total.toFixed(2);
    return total;
}

// ─── Modals ──────────────────────────────────────────

function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('active'); }
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('active'); }
}

function openCreateModal() {
    document.getElementById('invoiceForm').reset();
    document.getElementById('invoiceId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-file-invoice"></i> Create New Invoice';
    document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('subtotalDisplay').textContent = '₹0.00';
    document.getElementById('taxAmountDisplay').textContent = '₹0.00';
    document.getElementById('discountDisplay').textContent = '₹0.00';
    document.getElementById('totalDisplay').textContent = '₹0.00';
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    populatePatientSelect();
    openModal('invoiceModal');
}

function openEditModal(id) {
    var invoice = null;
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].id === id) { invoice = invoices[i]; break; }
    }
    if (invoice) {
        document.getElementById('invoiceId').value = invoice.id;
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Invoice';
        document.getElementById('patientId').value = invoice.patientId;
        document.getElementById('invoiceType').value = invoice.type;
        document.getElementById('invoiceDate').value = invoice.date;
        document.getElementById('dueDate').value = invoice.dueDate || '';
        document.getElementById('description').value = invoice.description || '';
        document.getElementById('amount').value = invoice.amount;
        document.getElementById('tax').value = invoice.tax;
        document.getElementById('discount').value = invoice.discount;
        document.getElementById('status').value = invoice.status;
        calculateTotal();
        document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
        document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
        populatePatientSelect();
        openModal('invoiceModal');
    }
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

function openPaymentModal(id) {
    var invoice = null;
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].id === id) { invoice = invoices[i]; break; }
    }
    if (invoice) {
        document.getElementById('paymentInvoiceId').value = id;
        document.getElementById('paymentAmount').value = invoice.total;
        document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
        document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
        openModal('paymentModal');
    }
}

// ─── Save Invoice ──────────────────────────────────

function saveInvoice(e) {
    e.preventDefault();
    if (!validateInvoiceForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    var id = document.getElementById('invoiceId').value;
    var patientId = parseInt(document.getElementById('patientId').value);
    var patient = null;
    for (var i = 0; i < patients.length; i++) {
        if (patients[i].id === patientId) { patient = patients[i]; break; }
    }
    var type = document.getElementById('invoiceType').value;
    var date = document.getElementById('invoiceDate').value;
    var dueDate = document.getElementById('dueDate').value;
    var description = document.getElementById('description').value.trim();
    var amount = parseFloat(document.getElementById('amount').value);
    var tax = parseFloat(document.getElementById('tax').value) || 0;
    var discount = parseFloat(document.getElementById('discount').value) || 0;
    var status = document.getElementById('status').value;
    var subtotal = amount;
    var taxAmount = (subtotal * tax) / 100;
    var total = subtotal + taxAmount - discount;
    
    if (id) {
        var index = -1;
        for (var j = 0; j < invoices.length; j++) {
            if (invoices[j].id === parseInt(id)) { index = j; break; }
        }
        if (index !== -1) {
            invoices[index].patientId = patientId;
            invoices[index].patientName = patient ? patient.fullName : '';
            invoices[index].type = type;
            invoices[index].date = date;
            invoices[index].dueDate = dueDate;
            invoices[index].description = description;
            invoices[index].amount = amount;
            invoices[index].tax = tax;
            invoices[index].discount = discount;
            invoices[index].total = total;
            invoices[index].status = status;
            showToast('✅ Invoice updated successfully', 'success');
        }
    } else {
        var newId = 1;
        for (var k = 0; k < invoices.length; k++) {
            if (invoices[k].id >= newId) newId = invoices[k].id + 1;
        }
        var invoiceNo = 'INV-' + new Date().getFullYear() + String(newId).padStart(5, '0');
        invoices.push({
            id: newId,
            invoiceNo: invoiceNo,
            patientId: patientId,
            patientName: patient ? patient.fullName : '',
            type: type,
            date: date,
            dueDate: dueDate,
            description: description,
            amount: amount,
            tax: tax,
            discount: discount,
            total: total,
            status: status
        });
        showToast('✅ Invoice created successfully', 'success');
    }
    saveInvoices();
    refreshUI();
    closeModal('invoiceModal');
}

// ─── Record Payment ──────────────────────────────────

function recordPayment(e) {
    e.preventDefault();
    if (!validatePaymentForm()) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    var invoiceId = parseInt(document.getElementById('paymentInvoiceId').value);
    var paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    var paymentMethod = document.getElementById('paymentMethod').value;
    var transactionId = document.getElementById('transactionId').value.trim();
    var invoice = null;
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].id === invoiceId) { invoice = invoices[i]; break; }
    }
    if (invoice) {
        if (paymentAmount >= invoice.total) {
            invoice.status = 'Paid';
            saveInvoices();
            refreshUI();
            closeModal('paymentModal');
            showToast('✅ Payment recorded! Invoice marked as PAID.', 'success');
            var payments = JSON.parse(localStorage.getItem('hms_payments') || '[]');
            payments.push({
                id: Date.now(),
                invoiceId: invoiceId,
                patientName: invoice.patientName,
                amount: paymentAmount,
                method: paymentMethod,
                transactionId: transactionId || '',
                date: new Date().toISOString().split('T')[0]
            });
            localStorage.setItem('hms_payments', JSON.stringify(payments));
        } else {
            showToast('Payment amount must be at least the invoice total.', 'error');
        }
    }
}

// ─── View Invoice ──────────────────────────────────

function viewInvoice(id) {
    var invoice = null;
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].id === id) { invoice = invoices[i]; break; }
    }
    if (!invoice) return;
    
    var patient = null;
    for (var j = 0; j < patients.length; j++) {
        if (patients[j].id === invoice.patientId) { patient = patients[j]; break; }
    }
    
    var printArea = document.getElementById('invoicePrintArea');
    printArea.innerHTML = '';
    
    printArea.innerHTML += '<div style="text-align:center; border-bottom:1px solid var(--border-default); padding-bottom:1rem; margin-bottom:1rem;"><h2 style="font-size:1.25rem; font-weight:var(--font-weight-medium); color:var(--color-brown-700); margin:0;">MEDFLOW HOSPITAL</h2><p style="font-size:0.75rem; color:var(--color-brown-100); margin:0;">123 Healthcare Ave, Medical District, Mumbai - 400001</p><p style="font-size:0.75rem; color:var(--color-brown-100); margin:0;">Phone: +91 22 1234 5678 | Email: info@medflow.com</p><p style="font-size:0.75rem; color:var(--color-brown-100); margin:0;">GST No: 27AAAAA0000A1Z</p></div>';
    printArea.innerHTML += '<div style="display:flex; justify-content:space-between; margin-bottom:1.5rem;"><div><p style="font-size:0.8125rem;"><strong style="color:var(--color-brown-700);">Invoice No:</strong> <span style="color:var(--color-brown-300);">' + invoice.invoiceNo + '</span></p><p style="font-size:0.8125rem; margin-top:0.25rem;"><strong style="color:var(--color-brown-700);">Date:</strong> <span style="color:var(--color-brown-300);">' + invoice.date + '</span></p><p style="font-size:0.8125rem; margin-top:0.25rem;"><strong style="color:var(--color-brown-700);">Due Date:</strong> <span style="color:var(--color-brown-300);">' + (invoice.dueDate || 'N/A') + '</span></p></div><div style="text-align:right;"><p style="font-size:0.8125rem;"><strong style="color:var(--color-brown-700);">Patient Name:</strong> <span style="color:var(--color-brown-300);">' + esc(invoice.patientName) + '</span></p><p style="font-size:0.8125rem; margin-top:0.25rem;"><strong style="color:var(--color-brown-700);">Patient ID:</strong> <span style="color:var(--color-brown-300);">P-' + String(invoice.patientId).padStart(5, '0') + '</span></p><p style="font-size:0.8125rem; margin-top:0.25rem;"><strong style="color:var(--color-brown-700);">Phone:</strong> <span style="color:var(--color-brown-300);">' + (patient ? patient.phone : 'N/A') + '</span></p></div></div>';
    printArea.innerHTML += '<table style="width:100%; border-collapse:collapse; margin-bottom:1rem;"><thead><tr style="background:var(--bg-muted);"><th style="padding:0.5rem; text-align:left; font-size:0.75rem; font-weight:var(--font-weight-medium); color:var(--color-brown-700);">Description</th><th style="padding:0.5rem; text-align:right; font-size:0.75rem; font-weight:var(--font-weight-medium); color:var(--color-brown-700);">Amount (₹)</th></tr></thead><tbody><tr><td style="padding:0.5rem; font-size:0.8125rem; color:var(--color-brown-300);">' + invoice.type + ' - ' + (invoice.description || 'Consultation') + '</td><td style="padding:0.5rem; text-align:right; font-size:0.8125rem; color:var(--color-brown-300);">' + invoice.amount.toFixed(2) + '</td></tr></tbody><tfoot style="border-top:1px solid var(--border-default);"><tr><td style="padding:0.5rem; text-align:right; font-size:0.8125rem;"><strong>Subtotal:</strong></td><td style="padding:0.5rem; text-align:right; font-size:0.8125rem;">₹' + invoice.amount.toFixed(2) + '</td></tr><tr><td style="padding:0.5rem; text-align:right; font-size:0.8125rem;"><strong>Tax (' + invoice.tax + '%):</strong></td><td style="padding:0.5rem; text-align:right; font-size:0.8125rem;">₹' + ((invoice.amount * invoice.tax) / 100).toFixed(2) + '</td></tr><tr><td style="padding:0.5rem; text-align:right; font-size:0.8125rem;"><strong>Discount:</strong></td><td style="padding:0.5rem; text-align:right; font-size:0.8125rem;">₹' + invoice.discount.toFixed(2) + '</td></tr><tr style="border-top:1px solid var(--border-default);"><td style="padding:0.5rem; text-align:right; font-weight:var(--font-weight-semibold); font-size:0.875rem; color:var(--color-brown-700);">Total:</td><td style="padding:0.5rem; text-align:right; font-weight:var(--font-weight-semibold); font-size:0.875rem; color:var(--color-sage-dark);">₹' + invoice.total.toFixed(2) + '</td></tr></tfoot></table>';
    printArea.innerHTML += '<div style="text-align:center; color:var(--color-brown-100); font-size:0.6875rem; padding-top:1rem; border-top:1px solid var(--border-default);"><p>Thank you for choosing MedFlow! This is a computer generated invoice.</p><p>For any queries, please contact our billing department.</p></div>';
    
    openModal('viewInvoiceModal');
}

function printInvoice() {
    window.print();
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    var invoice = null;
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].id === deleteTargetId) { invoice = invoices[i]; break; }
    }
    invoices = invoices.filter(function(item) { return item.id !== deleteTargetId; });
    saveInvoices();
    refreshUI();
    closeModal('deleteModal');
    if (invoice) {
        showToast('🗑️ Invoice ' + invoice.invoiceNo + ' deleted successfully', 'success');
    }
    deleteTargetId = null;
}

// ─── Init ────────────────────────────────────────────

function initInvoicesModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    
    document.getElementById('createInvoiceBtn').addEventListener('click', openCreateModal);
    document.getElementById('closeModalBtn').addEventListener('click', function() { closeModal('invoiceModal'); });
    document.getElementById('cancelModalBtn').addEventListener('click', function() { closeModal('invoiceModal'); });
    document.getElementById('closeViewModalBtn').addEventListener('click', function() { closeModal('viewInvoiceModal'); });
    document.getElementById('closeViewFooterBtn').addEventListener('click', function() { closeModal('viewInvoiceModal'); });
    document.getElementById('printInvoiceBtn').addEventListener('click', printInvoice);
    document.getElementById('closePaymentModalBtn').addEventListener('click', function() { closeModal('paymentModal'); });
    document.getElementById('cancelPaymentBtn').addEventListener('click', function() { closeModal('paymentModal'); });
    document.getElementById('closeDeleteModalBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('invoiceForm').addEventListener('submit', saveInvoice);
    document.getElementById('paymentForm').addEventListener('submit', recordPayment);
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        statusFilter = '';
        dateFrom = '';
        dateTo = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('statusFilter').addEventListener('change', function(e) {
        statusFilter = e.target.value;
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('dateFrom').addEventListener('change', function(e) {
        dateFrom = e.target.value;
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('dateTo').addEventListener('change', function(e) {
        dateTo = e.target.value;
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('amount').addEventListener('input', calculateTotal);
    document.getElementById('tax').addEventListener('input', calculateTotal);
    document.getElementById('discount').addEventListener('input', calculateTotal);
    
    document.getElementById('patientId').addEventListener('change', function() {
        if (this.value) { document.getElementById('patientIdError').classList.remove('show'); this.classList.remove('error'); }
    });
    document.getElementById('invoiceType').addEventListener('change', function() {
        if (this.value) { document.getElementById('invoiceTypeError').classList.remove('show'); this.classList.remove('error'); }
    });
    document.getElementById('invoiceDate').addEventListener('input', function() {
        if (this.value) { document.getElementById('invoiceDateError').classList.remove('show'); this.classList.remove('error'); }
    });
    document.getElementById('amount').addEventListener('input', function() {
        if (this.value && parseFloat(this.value) > 0) { document.getElementById('amountError').classList.remove('show'); this.classList.remove('error'); }
    });
    document.getElementById('status').addEventListener('change', function() {
        if (this.value) { document.getElementById('statusError').classList.remove('show'); this.classList.remove('error'); }
    });
    document.getElementById('paymentAmount').addEventListener('input', function() {
        if (this.value && parseFloat(this.value) > 0) { document.getElementById('paymentAmountError').classList.remove('show'); this.classList.remove('error'); }
    });
    document.getElementById('paymentMethod').addEventListener('change', function() {
        if (this.value) { document.getElementById('paymentMethodError').classList.remove('show'); this.classList.remove('error'); }
    });
    
    document.getElementById('invoiceModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('invoiceModal');
    });
    document.getElementById('viewInvoiceModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewInvoiceModal');
    });
    document.getElementById('paymentModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('paymentModal');
    });
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('invoiceModal');
            closeModal('viewInvoiceModal');
            closeModal('paymentModal');
            closeModal('deleteModal');
        }
    });
}

// ─── Wait ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initInvoicesModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initInvoicesModule();
    }, 3000);
});

// ─── Expose ────────────────────────────────────────────

window.goToPage = function(page) {
    currentPage = page;
    renderTable();
};
window.viewInvoice = viewInvoice;
window.editInvoice = openEditModal;
window.deleteInvoice = openDeleteModal;
window.openPaymentModal = openPaymentModal;