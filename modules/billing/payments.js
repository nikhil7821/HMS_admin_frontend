/**
 * Payments Management JS - Billing Module
 * Professional UI, Fully Working, Indian Names, Rupee Symbol
 */

let payments = [];

function loadPayments() {
    const stored = localStorage.getItem('hms_payments');
    if (stored) {
        payments = JSON.parse(stored);
        // Check and reset if foreign names exist
        if (payments[0] && (payments[0].patientName === 'John Doe' || payments[0].patientName === 'Jane Smith')) {
            setIndianPayments();
        }
    } else {
        setIndianPayments();
    }
    updateStats();
    renderTable();
}

function setIndianPayments() {
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];
    
    payments = [
        {id: 1700000000001, invoiceId: 1, patientName: 'Rajesh Kumar', amount: 1575, method: 'Card', transactionId: 'TXN123456789', date: today},
        {id: 1700000000002, invoiceId: 3, patientName: 'Amit Patel', amount: 840, method: 'UPI', transactionId: 'UPI987654321', date: today},
        {id: 1700000000003, invoiceId: 5, patientName: 'Neha Gupta', amount: 1000, method: 'Cash', transactionId: '', date: today},
        {id: 1700000000004, invoiceId: 2, patientName: 'Priya Sharma', amount: 500, method: 'Card', transactionId: 'TXN456789123', date: lastMonthStr},
        {id: 1700000000005, invoiceId: 4, patientName: 'Rajesh Kumar', amount: 1260, method: 'Bank Transfer', transactionId: 'BT789123456', date: lastMonthStr}
    ];
    savePayments();
}

function savePayments() {
    localStorage.setItem('hms_payments', JSON.stringify(payments));
}

function updateStats() {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
    const thisMonth = payments.filter(p => p.date.startsWith(currentMonth)).reduce((sum, p) => sum + p.amount, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayAmount = payments.filter(p => p.date === today).reduce((sum, p) => sum + p.amount, 0);
    
    document.getElementById('totalCollected').innerText = '₹' + total.toLocaleString('en-IN');
    document.getElementById('monthCollected').innerText = '₹' + thisMonth.toLocaleString('en-IN');
    document.getElementById('todayCollected').innerText = '₹' + todayAmount.toLocaleString('en-IN');
    document.getElementById('totalTransactions').innerText = payments.length;
}

function renderTable() {
    const tbody = document.getElementById('paymentsTable');
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-[#94a3b8]"><i class="fas fa-credit-card text-3xl mb-2 block"></i><p class="font-normal">No payments recorded</p> </td></tr>';
        return;
    }
    
    // Sort by date descending (newest first)
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedPayments.map(p => {
        let methodClass = '';
        let methodDisplay = p.method;
        
        switch(p.method) {
            case 'Cash':
                methodClass = 'bg-green-100 text-green-700';
                break;
            case 'Card':
                methodClass = 'bg-blue-100 text-blue-700';
                break;
            case 'UPI':
                methodClass = 'bg-purple-100 text-purple-700';
                break;
            case 'Insurance':
                methodClass = 'bg-orange-100 text-orange-700';
                break;
            case 'Bank Transfer':
                methodClass = 'bg-indigo-100 text-indigo-700';
                break;
            default:
                methodClass = 'bg-gray-100 text-gray-700';
        }
        
        return `
            <tr class="payment-row">
                <td class="px-5 py-3 text-sm text-[#475569]">${p.date}</td>
                <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(p.patientName)}</td>
                <td class="px-5 py-3 text-sm font-mono text-[#475569]">INV-${String(p.invoiceId).padStart(6, '0')}</td>
                <td class="px-5 py-3 font-semibold text-[#1e293b] text-sm">₹${p.amount.toLocaleString('en-IN')}</td>
                <td class="px-5 py-3"><span class="payment-method-badge ${methodClass}">${p.method}</span></td>
                <td class="px-5 py-3 text-sm text-[#475569] font-mono">${p.transactionId || '-'}</td>
            </table>
        `;
    }).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    loadPayments();
});