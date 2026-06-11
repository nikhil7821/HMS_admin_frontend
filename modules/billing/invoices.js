/**
 * Invoices Management JS - Billing Module
 * Professional UI, Fully Working, Indian Names, Rupee Symbol
 */

let invoices = [];
let patients = [];
let currentPage = 1;
let rowsPerPage = 10;
let deleteId = null;

function loadData() {
    patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
    
    const stored = localStorage.getItem('hms_invoices');
    if (stored) {
        invoices = JSON.parse(stored);
        if (invoices[0] && (invoices[0].patientName === 'John Doe' || invoices[0].patientName === 'Jane Smith')) {
            setIndianInvoices();
        }
    } else {
        setIndianInvoices();
    }
    
    updateStats();
    renderTable();
    populatePatientSelect();
}

function setIndianInvoices() {
    const today = new Date().toISOString().split('T')[0];
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

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
}

function saveInvoices() {
    localStorage.setItem('hms_invoices', JSON.stringify(invoices));
}

function updateStats() {
    const total = invoices.length;
    const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);
    const pendingAmount = invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.total, 0);
    const collectionRate = (totalRevenue + pendingAmount) > 0 ? Math.round((totalRevenue / (totalRevenue + pendingAmount)) * 100) : 0;
    
    document.getElementById('totalInvoices').innerText = total;
    document.getElementById('totalRevenue').innerText = '₹' + totalRevenue.toLocaleString('en-IN');
    document.getElementById('pendingAmount').innerText = '₹' + pendingAmount.toLocaleString('en-IN');
    document.getElementById('collectionRate').innerText = collectionRate + '%';
}

function validateInvoiceForm() {
    let isValid = true;
    
    const patientId = document.getElementById('patientId').value;
    const invoiceType = document.getElementById('invoiceType').value;
    const invoiceDate = document.getElementById('invoiceDate').value;
    const amount = document.getElementById('amount').value;
    const status = document.getElementById('status').value;
    
    if (!patientId) {
        document.getElementById('patientIdError').classList.add('show');
        document.getElementById('patientId').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('patientIdError').classList.remove('show');
        document.getElementById('patientId').classList.remove('error');
    }
    
    if (!invoiceType) {
        document.getElementById('invoiceTypeError').classList.add('show');
        document.getElementById('invoiceType').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('invoiceTypeError').classList.remove('show');
        document.getElementById('invoiceType').classList.remove('error');
    }
    
    if (!invoiceDate) {
        document.getElementById('invoiceDateError').classList.add('show');
        document.getElementById('invoiceDate').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('invoiceDateError').classList.remove('show');
        document.getElementById('invoiceDate').classList.remove('error');
    }
    
    if (!amount || parseFloat(amount) <= 0) {
        document.getElementById('amountError').classList.add('show');
        document.getElementById('amount').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('amountError').classList.remove('show');
        document.getElementById('amount').classList.remove('error');
    }
    
    if (!status) {
        document.getElementById('statusError').classList.add('show');
        document.getElementById('status').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('statusError').classList.remove('show');
        document.getElementById('status').classList.remove('error');
    }
    
    return isValid;
}

function validatePaymentForm() {
    let isValid = true;
    const paymentAmount = document.getElementById('paymentAmount').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        document.getElementById('paymentAmountError').classList.add('show');
        document.getElementById('paymentAmount').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('paymentAmountError').classList.remove('show');
        document.getElementById('paymentAmount').classList.remove('error');
    }
    
    if (!paymentMethod) {
        document.getElementById('paymentMethodError').classList.add('show');
        document.getElementById('paymentMethod').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('paymentMethodError').classList.remove('show');
        document.getElementById('paymentMethod').classList.remove('error');
    }
    
    return isValid;
}

function getFilteredInvoices() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const dateFrom = document.getElementById('dateFrom')?.value || '';
    const dateTo = document.getElementById('dateTo')?.value || '';
    
    return invoices.filter(inv => {
        const matchesSearch = search === '' || 
            inv.patientName.toLowerCase().includes(search) || 
            inv.invoiceNo.toLowerCase().includes(search);
        const matchesStatus = status === '' || inv.status === status;
        const matchesDateFrom = dateFrom === '' || inv.date >= dateFrom;
        const matchesDateTo = dateTo === '' || inv.date <= dateTo;
        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
}

function renderTable() {
    const filtered = getFilteredInvoices();
    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageInvoices = filtered.slice(start, end);
    
    const tbody = document.getElementById('invoicesTableBody');
    
    if (pageInvoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-file-invoice text-3xl mb-2 block"></i><p class="font-normal">No invoices found</p> </td></tr>';
        document.getElementById('paginationInfo').innerHTML = 'Showing 0 of 0';
        document.getElementById('paginationButtons').innerHTML = '';
        return;
    }
    
    tbody.innerHTML = pageInvoices.map(inv => `
        <tr class="invoice-row">
            <td class="px-5 py-3 text-sm font-mono font-medium text-[#1e293b]">${inv.invoiceNo}</td>
            <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(inv.patientName)}</td>
            <td class="px-5 py-3 text-sm text-[#475569] hidden md:table-cell">${inv.date}</td>
            <td class="px-5 py-3 font-semibold text-[#1e293b] text-sm">₹${inv.total.toLocaleString('en-IN')}</td>
            <td class="px-5 py-3 text-sm text-[#475569] hidden lg:table-cell">${inv.type}</td>
            <td class="px-5 py-3">
                <span class="status-${inv.status.toLowerCase()}">${inv.status}</span>
            </td>
            <td class="px-5 py-3 text-center">
                <div class="flex gap-2 justify-center">
                    <button onclick="viewInvoice(${inv.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="View Invoice">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${inv.status === 'Pending' ? `
                        <button onclick="openPaymentModal(${inv.id})" class="text-[#10b981] hover:text-[#059669] transition" title="Record Payment">
                            <i class="fas fa-money-bill-wave"></i>
                        </button>
                    ` : ''}
                    <button onclick="editInvoice(${inv.id})" class="text-[#a8c49a] hover:text-[#7a9a68] transition" title="Edit Invoice">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteInvoice(${inv.id})" class="text-[#d8b48c] hover:text-[#c49a6c] transition" title="Delete Invoice">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
          </tr>
    `).join('');
    
    document.getElementById('paginationInfo').innerHTML = `Showing ${start + 1} to ${Math.min(end, filtered.length)} of ${filtered.length} invoices`;
    
    let paginationHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button onclick="goToPage(${i})" class="pagination-btn px-3 py-1 rounded-lg text-sm ${i === currentPage ? 'bg-[#a8c49a] text-white' : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'} transition">${i}</button>`;
    }
    document.getElementById('paginationButtons').innerHTML = paginationHtml;
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

function populatePatientSelect() {
    const select = document.getElementById('patientId');
    if (select) {
        select.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${escapeHtml(p.fullName)} (${p.phone})</option>`).join('');
    }
}

function calculateTotal() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const tax = parseFloat(document.getElementById('tax').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    
    const subtotal = amount;
    const taxAmount = (subtotal * tax) / 100;
    const total = subtotal + taxAmount - discount;
    
    document.getElementById('subtotalDisplay').innerText = '₹' + subtotal.toFixed(2);
    document.getElementById('taxRate').innerText = tax;
    document.getElementById('taxAmountDisplay').innerText = '₹' + taxAmount.toFixed(2);
    document.getElementById('discountDisplay').innerText = '₹' + discount.toFixed(2);
    document.getElementById('totalDisplay').innerText = '₹' + total.toFixed(2);
    
    return total;
}

function openCreateModal() {
    document.getElementById('invoiceForm').reset();
    document.getElementById('invoiceId').value = '';
    document.getElementById('modalTitle').innerText = 'Create New Invoice';
    document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('subtotalDisplay').innerText = '₹0.00';
    document.getElementById('taxAmountDisplay').innerText = '₹0.00';
    document.getElementById('discountDisplay').innerText = '₹0.00';
    document.getElementById('totalDisplay').innerText = '₹0.00';
    document.getElementById('invoiceModal').classList.add('active');
    populatePatientSelect();
    
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function editInvoice(id) {
    const invoice = invoices.find(i => i.id === id);
    if (invoice) {
        document.getElementById('invoiceId').value = invoice.id;
        document.getElementById('modalTitle').innerText = 'Edit Invoice';
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
        document.getElementById('invoiceModal').classList.add('active');
        populatePatientSelect();
        
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

function deleteInvoice(id) {
    deleteId = id;
    document.getElementById('deleteModal').classList.add('active');
}

function confirmDelete() {
    if (deleteId) {
        invoices = invoices.filter(i => i.id !== deleteId);
        saveInvoices();
        updateStats();
        renderTable();
        showToast('Invoice deleted successfully', 'success');
        deleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }
}

function saveInvoice(e) {
    e.preventDefault();
    
    if (!validateInvoiceForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    const id = document.getElementById('invoiceId').value;
    const patientId = parseInt(document.getElementById('patientId').value);
    const patient = patients.find(p => p.id === patientId);
    const type = document.getElementById('invoiceType').value;
    const date = document.getElementById('invoiceDate').value;
    const dueDate = document.getElementById('dueDate').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const tax = parseFloat(document.getElementById('tax').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const status = document.getElementById('status').value;
    
    const subtotal = amount;
    const taxAmount = (subtotal * tax) / 100;
    const total = subtotal + taxAmount - discount;
    
    const invoiceData = {
        patientId,
        patientName: patient?.fullName || '',
        type,
        date,
        dueDate,
        description,
        amount,
        tax,
        discount,
        total,
        status
    };
    
    if (id) {
        const index = invoices.findIndex(i => i.id === parseInt(id));
        if (index !== -1) {
            invoices[index] = { ...invoices[index], ...invoiceData };
            showToast('Invoice updated successfully', 'success');
        }
    } else {
        const newId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
        const invoiceNo = 'INV-' + new Date().getFullYear() + String(newId).padStart(5, '0');
        invoices.push({
            id: newId,
            invoiceNo,
            ...invoiceData
        });
        showToast('Invoice created successfully', 'success');
    }
    
    saveInvoices();
    updateStats();
    renderTable();
    closeModal();
}

function viewInvoice(id) {
    const invoice = invoices.find(i => i.id === id);
    if (invoice) {
        const patient = patients.find(p => p.id === invoice.patientId);
        const printArea = document.getElementById('invoicePrintArea');
        
        printArea.innerHTML = `
            <div class="text-center border-b pb-4 mb-4">
                <h1 class="text-2xl font-bold text-[#1e293b]">MEDFLOW HOSPITAL</h1>
                <p class="text-[#64748b] text-sm">123 Healthcare Ave, Medical District, Mumbai - 400001</p>
                <p class="text-[#64748b] text-sm">Phone: +91 22 1234 5678 | Email: info@medflow.com</p>
                <p class="text-[#64748b] text-sm">GST No: 27AAAAA0000A1Z</p>
            </div>
            
            <div class="flex justify-between mb-6">
                <div>
                    <p class="text-sm"><strong class="text-[#1e293b]">Invoice No:</strong> <span class="text-[#475569]">${invoice.invoiceNo}</span></p>
                    <p class="text-sm mt-1"><strong class="text-[#1e293b]">Date:</strong> <span class="text-[#475569]">${invoice.date}</span></p>
                    <p class="text-sm mt-1"><strong class="text-[#1e293b]">Due Date:</strong> <span class="text-[#475569]">${invoice.dueDate || 'N/A'}</span></p>
                </div>
                <div class="text-right">
                    <p class="text-sm"><strong class="text-[#1e293b]">Patient Name:</strong> <span class="text-[#475569]">${invoice.patientName}</span></p>
                    <p class="text-sm mt-1"><strong class="text-[#1e293b]">Patient ID:</strong> <span class="text-[#475569]">P-${String(invoice.patientId).padStart(5, '0')}</span></p>
                    <p class="text-sm mt-1"><strong class="text-[#1e293b]">Phone:</strong> <span class="text-[#475569]">${patient?.phone || 'N/A'}</span></p>
                </div>
            </div>
            
            <table class="w-full border-collapse mb-6">
                <thead>
                    <tr class="bg-[#f8fafc]">
                        <th class="p-2 text-left text-sm font-medium text-[#1e293b]">Description</th>
                        <th class="p-2 text-right text-sm font-medium text-[#1e293b]">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="p-2 text-sm text-[#475569]">${invoice.type} - ${invoice.description || 'Consultation'}</td>
                        <td class="p-2 text-right text-sm text-[#475569]">${invoice.amount.toFixed(2)}</td>
                    </tr>
                </tbody>
                <tfoot class="border-t">
                    <tr><td class="p-2 text-right text-sm"><strong>Subtotal:</strong></td><td class="p-2 text-right text-sm">₹${invoice.amount.toFixed(2)}</td></tr>
                    <tr><td class="p-2 text-right text-sm"><strong>Tax (${invoice.tax}%):</strong></td><td class="p-2 text-right text-sm">₹${((invoice.amount * invoice.tax) / 100).toFixed(2)}</td></tr>
                    <tr><td class="p-2 text-right text-sm"><strong>Discount:</strong></td><td class="p-2 text-right text-sm">₹${invoice.discount.toFixed(2)}</td></tr>
                    <tr class="border-t"><td class="p-2 text-right font-bold text-[#1e293b]"><strong>Total:</strong></td><td class="p-2 text-right font-bold text-[#a8c49a]">₹${invoice.total.toFixed(2)}</td></tr>
                </tfoot>
            </table>
            
            <div class="text-center text-[#94a3b8] text-xs pt-4 border-t">
                <p>Thank you for choosing MedFlow! This is a computer generated invoice.</p>
                <p>For any queries, please contact our billing department.</p>
            </div>
        `;
        
        document.getElementById('viewInvoiceModal').classList.add('active');
    }
}

function printInvoice() {
    window.print();
}

function openPaymentModal(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
        document.getElementById('paymentInvoiceId').value = invoiceId;
        document.getElementById('paymentAmount').value = invoice.total;
        document.getElementById('paymentModal').classList.add('active');
        
        document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
    }
}

function recordPayment(e) {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    const invoiceId = parseInt(document.getElementById('paymentInvoiceId').value);
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const transactionId = document.getElementById('transactionId').value;
    
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice && paymentAmount >= invoice.total) {
        invoice.status = 'Paid';
        saveInvoices();
        updateStats();
        renderTable();
        closePaymentModal();
        showToast('Payment recorded successfully! Invoice marked as PAID.', 'success');
        
        let payments = JSON.parse(localStorage.getItem('hms_payments') || '[]');
        payments.push({
            id: Date.now(),
            invoiceId,
            patientName: invoice.patientName,
            amount: paymentAmount,
            method: paymentMethod,
            transactionId: transactionId,
            date: new Date().toISOString().split('T')[0]
        });
        localStorage.setItem('hms_payments', JSON.stringify(payments));
    } else {
        showToast('Payment amount must be at least the invoice total.', 'error');
    }
}

function closeModal() {
    document.getElementById('invoiceModal').classList.remove('active');
    document.getElementById('invoiceForm').reset();
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
}

function closeViewModal() {
    document.getElementById('viewInvoiceModal').classList.remove('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
    document.getElementById('paymentForm').reset();
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
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.getElementById('createInvoiceBtn')?.addEventListener('click', openCreateModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeViewModalBtn')?.addEventListener('click', closeViewModal);
    document.getElementById('closeViewFooterBtn')?.addEventListener('click', closeViewModal);
    document.getElementById('printInvoiceBtn')?.addEventListener('click', printInvoice);
    document.getElementById('closePaymentModalBtn')?.addEventListener('click', closePaymentModal);
    document.getElementById('cancelPaymentBtn')?.addEventListener('click', closePaymentModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    document.getElementById('invoiceForm')?.addEventListener('submit', saveInvoice);
    document.getElementById('paymentForm')?.addEventListener('submit', recordPayment);
    document.getElementById('searchInput')?.addEventListener('input', () => { currentPage = 1; renderTable(); });
    document.getElementById('statusFilter')?.addEventListener('change', () => { currentPage = 1; renderTable(); });
    document.getElementById('dateFrom')?.addEventListener('change', () => { currentPage = 1; renderTable(); });
    document.getElementById('dateTo')?.addEventListener('change', () => { currentPage = 1; renderTable(); });
    
    // Real-time calculation
    document.getElementById('amount')?.addEventListener('input', calculateTotal);
    document.getElementById('tax')?.addEventListener('input', calculateTotal);
    document.getElementById('discount')?.addEventListener('input', calculateTotal);
    
    // Real-time validation
    document.getElementById('patientId')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('patientIdError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('invoiceType')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('invoiceTypeError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('invoiceDate')?.addEventListener('input', function() {
        if(this.value) {
            document.getElementById('invoiceDateError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('amount')?.addEventListener('input', function() {
        const val = parseFloat(this.value);
        if(this.value && val > 0) {
            document.getElementById('amountError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('status')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('statusError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('paymentAmount')?.addEventListener('input', function() {
        const val = parseFloat(this.value);
        if(this.value && val > 0) {
            document.getElementById('paymentAmountError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('paymentMethod')?.addEventListener('change', function() {
        if(this.value) {
            document.getElementById('paymentMethodError')?.classList.remove('show');
            this.classList.remove('error');
        }
    });
});

window.goToPage = goToPage;
window.viewInvoice = viewInvoice;
window.editInvoice = editInvoice;
window.deleteInvoice = deleteInvoice;
window.openPaymentModal = openPaymentModal;