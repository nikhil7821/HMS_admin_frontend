/**
 * Payments Management JS - Billing Module
 * Version: 2.0 - DYNAMIC with Invoice Integration
 * 
 * Features:
 * ✅ Auto-sync with invoices
 * ✅ Filter by method, date, patient
 * ✅ Professional stats
 * ✅ Indian names and currency
 */

var payments = [];
var invoices = [];
var patients = [];
var searchTerm = '';
var methodFilter = '';
var dateFrom = '';
var dateTo = '';
var isInitialized = false;

// ─── Utility Functions ──────────────────────────────────────

function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        var d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function formatCurrency(amount) {
    return '₹' + (amount || 0).toFixed(2);
}

// ─── Toast Notification ──────────────────────────────────────

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

// ─── Data Management ──────────────────────────────────────────

function loadAllData() {
    try {
        // Load patients
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        
        // Load invoices (to get patient names)
        invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
        
        // Load payments from localStorage
        var stored = localStorage.getItem('hms_payments');
        if (stored) {
            payments = JSON.parse(stored);
        } else {
            // If no payments, create sample from invoices
            syncPaymentsFromInvoices();
        }
        
        // Ensure all payments have patient names
        syncPatientNames();
        
        savePayments();
        refreshUI();
    } catch (error) {
        console.error('Error loading payments:', error);
        showToast('Error loading payment data', 'error');
    }
}

function savePayments() {
    try {
        localStorage.setItem('hms_payments', JSON.stringify(payments));
    } catch (error) {
        console.error('Error saving payments:', error);
    }
}

// ─── Auto-Sync from Invoices ──────────────────────────────────

function syncPaymentsFromInvoices() {
    payments = [];
    
    // Find all invoices that have payments
    for (var i = 0; i < invoices.length; i++) {
        var inv = invoices[i];
        if (inv.payments && inv.payments.length > 0) {
            for (var j = 0; j < inv.payments.length; j++) {
                var p = inv.payments[j];
                var patientName = getPatientName(inv.patientId);
                payments.push({
                    id: Date.now() + i + j,
                    invoiceId: inv.id,
                    patientName: patientName || inv.patientName || 'Unknown',
                    amount: p.amount || 0,
                    method: p.method || 'Cash',
                    transactionId: p.transactionId || '',
                    date: p.date || new Date().toISOString().split('T')[0]
                });
            }
        }
    }
    
    // If still no payments, create sample data
    if (payments.length === 0) {
        createSamplePayments();
    }
}

function createSamplePayments() {
    var today = new Date().toISOString().split('T')[0];
    var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    var lastMonthStr = lastMonth.toISOString().split('T')[0];
    
    var sampleInvoices = invoices.length > 0 ? invoices : [
        { id: 1, patientId: 1, patientName: 'Rajesh Kumar', total: 1575 },
        { id: 2, patientId: 2, patientName: 'Priya Sharma', total: 2525 },
        { id: 3, patientId: 3, patientName: 'Amit Patel', total: 840 }
    ];
    
    for (var i = 0; i < sampleInvoices.length; i++) {
        var inv = sampleInvoices[i];
        var patientName = getPatientName(inv.patientId) || inv.patientName || 'Unknown';
        payments.push({
            id: Date.now() + i,
            invoiceId: inv.id || i + 1,
            patientName: patientName,
            amount: inv.total || 500,
            method: ['Cash', 'Card', 'UPI', 'Bank Transfer'][i % 4],
            transactionId: 'TXN' + String(Math.random()).substring(2, 10),
            date: i % 2 === 0 ? today : lastMonthStr
        });
    }
}

function getPatientName(patientId) {
    for (var i = 0; i < patients.length; i++) {
        if (patients[i].id === patientId) {
            return patients[i].fullName;
        }
    }
    return null;
}

function syncPatientNames() {
    for (var i = 0; i < payments.length; i++) {
        var p = payments[i];
        if (p.patientName && p.patientName !== 'Unknown') continue;
        
        // Try to get from invoice
        var invoice = getInvoice(p.invoiceId);
        if (invoice) {
            var patientName = getPatientName(invoice.patientId);
            if (patientName) {
                p.patientName = patientName;
            } else if (invoice.patientName) {
                p.patientName = invoice.patientName;
            }
        }
    }
}

function getInvoice(invoiceId) {
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].id === invoiceId) {
            return invoices[i];
        }
    }
    return null;
}

// ─── Stats ──────────────────────────────────────────────────────

function updateStats() {
    var total = 0;
    var thisMonth = 0;
    var todayAmount = 0;
    var currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
    var today = new Date().toISOString().split('T')[0];
    
    for (var i = 0; i < payments.length; i++) {
        var p = payments[i];
        total += p.amount || 0;
        if (p.date && p.date.startsWith(currentMonth)) {
            thisMonth += p.amount || 0;
        }
        if (p.date === today) {
            todayAmount += p.amount || 0;
        }
    }
    
    document.getElementById('totalCollected').textContent = formatCurrency(total);
    document.getElementById('monthCollected').textContent = formatCurrency(thisMonth);
    document.getElementById('todayCollected').textContent = formatCurrency(todayAmount);
    document.getElementById('totalTransactions').textContent = payments.length;
}

// ─── Filter ──────────────────────────────────────────────────────

function getFilteredPayments() {
    var result = [];
    for (var i = 0; i < payments.length; i++) {
        var p = payments[i];
        var matchesSearch = searchTerm === '' || 
            p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(p.invoiceId).includes(searchTerm);
        var matchesMethod = methodFilter === '' || p.method === methodFilter;
        var matchesDateFrom = dateFrom === '' || p.date >= dateFrom;
        var matchesDateTo = dateTo === '' || p.date <= dateTo;
        if (matchesSearch && matchesMethod && matchesDateFrom && matchesDateTo) {
            result.push(p);
        }
    }
    return result;
}

// ─── Render ──────────────────────────────────────────────────────

function renderTable() {
    var tbody = document.getElementById('paymentsTable');
    if (!tbody) return;
    
    var filtered = getFilteredPayments();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-credit-card"></i>
                    <p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No payments recorded</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Payments will appear here when invoices are paid.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date descending (newest first)
    var sorted = filtered.slice().sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    
    var html = '';
    for (var i = 0; i < sorted.length; i++) {
        var p = sorted[i];
        var methodClass = getMethodClass(p.method);
        var invoiceDisplay = p.invoiceId ? 'INV-' + String(p.invoiceId).padStart(6, '0') : '-';
        
        html += '<tr class="payment-row">';
        html += '<td class="payment-date">' + formatDate(p.date) + '</td>';
        html += '<td class="payment-patient">' + esc(p.patientName) + '</td>';
        html += '<td class="payment-invoice">' + invoiceDisplay + '</td>';
        html += '<td style="text-align:center;" class="payment-amount">' + formatCurrency(p.amount) + '</td>';
        html += '<td><span class="payment-method-badge ' + methodClass + '">' + p.method + '</span></td>';
        html += '<td class="payment-transaction">' + esc(p.transactionId || '-') + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function getMethodClass(method) {
    var map = {
        'Cash': 'badge-cash',
        'Card': 'badge-card',
        'UPI': 'badge-upi',
        'Insurance': 'badge-insurance',
        'Bank Transfer': 'badge-bank-transfer'
    };
    return map[method] || 'badge-other';
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Init ───────────────────────────────────────────────────────

function initPaymentsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadAllData();
    
    // Event Listeners
    document.getElementById('refreshBtn')?.addEventListener('click', function() {
        loadAllData();
        showToast('Refreshed', 'info');
    });
    
    document.getElementById('resetFilter')?.addEventListener('click', function() {
        searchTerm = '';
        methodFilter = '';
        dateFrom = '';
        dateTo = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('methodFilter').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('methodFilter')?.addEventListener('change', function(e) {
        methodFilter = e.target.value;
        renderTable();
    });
    
    document.getElementById('dateFrom')?.addEventListener('change', function(e) {
        dateFrom = e.target.value;
        renderTable();
    });
    
    document.getElementById('dateTo')?.addEventListener('change', function(e) {
        dateTo = e.target.value;
        renderTable();
    });
}

// ─── Wait ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initPaymentsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initPaymentsModule();
    }, 3000);
});

// ─── ─── Expose ──────────────────────────────────────────────────────

window.loadAllData = loadAllData;
window.savePayments = savePayments