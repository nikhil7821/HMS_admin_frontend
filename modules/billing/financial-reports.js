/**
 * Financial Reports JS - Billing Module
 * Version: 2.0 - COMPLETE DYNAMIC VERSION
 * 
 * Features:
 * ✅ Reads from ALL modules (Invoices, Payments, Consultations, Surgeries, Emergency)
 * ✅ Dynamic revenue tracking
 * ✅ Professional charts
 * ✅ Department-wise breakdown
 * ✅ Doctor performance tracking
 * ✅ Monthly summary with progress bars
 */

var invoices = [];
var payments = [];
var consultations = [];
var surgeries = [];
var emergencyCases = [];
var externalVisits = [];
var doctors = [];
var patients = [];
var revenueChart = null;
var sourceChart = null;
var isInitialized = false;

// ─── Utility Functions ──────────────────────────────────────

function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatCurrency(amount) {
    return '₹' + (amount || 0).toFixed(2);
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

// ─── Toast Notification ──────────────────────────────────────

function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    var colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a', warning: '#d4a853' };
    toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300';
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = '<div class="flex items-center gap-2"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle') + '"></i><span>' + esc(message) + '</span></div>';
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
        // Load from all modules
        invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
        payments = JSON.parse(localStorage.getItem('hms_payments') || '[]');
        consultations = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
        surgeries = JSON.parse(localStorage.getItem('hms_surgeries') || '[]');
        emergencyCases = JSON.parse(localStorage.getItem('hms_emergency_cases') || '[]');
        externalVisits = JSON.parse(localStorage.getItem('hms_external_visits') || '[]');
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        
        // If no data, create sample
        if (invoices.length === 0 && payments.length === 0) {
            createSampleData();
        }
        
        refreshUI();
    } catch (error) {
        console.error('Error loading financial data:', error);
        showToast('Error loading financial data', 'error');
    }
}

function createSampleData() {
    var today = new Date().toISOString().split('T')[0];
    var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    var lastMonthStr = lastMonth.toISOString().split('T')[0];
    
    // Sample invoices
    invoices = [
        { id: 1, patientId: 1, patientName: 'Rajesh Kumar', type: 'OPD', amount: 1500, total: 1575, status: 'Paid', date: today },
        { id: 2, patientId: 2, patientName: 'Priya Sharma', type: 'Laboratory', amount: 2500, total: 2525, status: 'Paid', date: today },
        { id: 3, patientId: 3, patientName: 'Amit Patel', type: 'Pharmacy', amount: 800, total: 840, status: 'Paid', date: today },
        { id: 4, patientId: 1, patientName: 'Rajesh Kumar', type: 'Radiology', amount: 1200, total: 1260, status: 'Pending', date: lastMonthStr },
        { id: 5, patientId: 4, patientName: 'Neha Gupta', type: 'OPD', amount: 1000, total: 1000, status: 'Paid', date: lastMonthStr }
    ];
    localStorage.setItem('hms_invoices', JSON.stringify(invoices));
    
    // Sample payments
    payments = [
        { id: 1, invoiceId: 1, patientName: 'Rajesh Kumar', amount: 1575, method: 'Cash', date: today },
        { id: 2, invoiceId: 2, patientName: 'Priya Sharma', amount: 2525, method: 'Card', date: today },
        { id: 3, invoiceId: 3, patientName: 'Amit Patel', amount: 840, method: 'UPI', date: today },
        { id: 4, invoiceId: 5, patientName: 'Neha Gupta', amount: 1000, method: 'Bank Transfer', date: lastMonthStr }
    ];
    localStorage.setItem('hms_payments', JSON.stringify(payments));
}

// ─── ─── Stats ─────────────────────────────────────────────────────────────

function updateStats() {
    var totalRevenue = 0;
    var pendingAmount = 0;
    var totalInvoices = invoices.length;
    
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].status === 'Paid') {
            totalRevenue += invoices[i].total || invoices[i].amount || 0;
        } else if (invoices[i].status === 'Pending' || invoices[i].status === 'Partial') {
            pendingAmount += invoices[i].total || invoices[i].amount || 0;
        }
    }
    
    var collectionRate = (totalRevenue + pendingAmount) > 0 ? Math.round((totalRevenue / (totalRevenue + pendingAmount)) * 100) : 0;
    
    document.getElementById('reportTotal').textContent = formatCurrency(totalRevenue);
    document.getElementById('totalInvoices').textContent = totalInvoices;
    document.getElementById('pendingAmount').textContent = formatCurrency(pendingAmount);
    document.getElementById('collectionRate').textContent = collectionRate + '%';
}

// ─── ─── Revenue by Department ──────────────────────────────────────────────

function renderRevenueByDepartment() {
    var container = document.getElementById('revenueByType');
    var revenueMap = {};
    var total = 0;
    
    // From invoices
    for (var i = 0; i < invoices.length; i++) {
        var inv = invoices[i];
        if (inv.status === 'Paid') {
            var type = inv.type || 'Other';
            var amount = inv.total || inv.amount || 0;
            revenueMap[type] = (revenueMap[type] || 0) + amount;
            total += amount;
        }
    }
    
    // Also add from consultations (as OPD revenue)
    for (var j = 0; j < consultations.length; j++) {
        var c = consultations[j];
        if (c.status !== 'cancelled') {
            var type = c.type === 'opd' ? 'OPD' : 'IPD';
            revenueMap[type] = (revenueMap[type] || 0) + (c.fee || 500);
            total += (c.fee || 500);
        }
    }
    
    var typeColors = {
        'OPD': 'opd',
        'IPD': 'ipd',
        'Pharmacy': 'pharmacy',
        'Laboratory': 'laboratory',
        'Radiology': 'radiology',
        'Surgery': 'surgery',
        'Emergency': 'emergency',
        'Other': 'other'
    };
    
    var typeIcons = {
        'OPD': 'fa-walking',
        'IPD': 'fa-procedures',
        'Pharmacy': 'fa-capsules',
        'Laboratory': 'fa-microscope',
        'Radiology': 'fa-x-ray',
        'Surgery': 'fa-scalpel',
        'Emergency': 'fa-ambulance',
        'Other': 'fa-circle'
    };
    
    var keys = Object.keys(revenueMap);
    if (keys.length === 0) {
        container.innerHTML = '<div class="empty-state-sm"><i class="fas fa-chart-pie"></i><p>No revenue data available</p></div>';
        return;
    }
    
    var html = '';
    for (var k = 0; k < keys.length; k++) {
        var type = keys[k];
        var amount = revenueMap[type];
        var percent = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
        var colorClass = typeColors[type] || 'other';
        var icon = typeIcons[type] || 'fa-chart-line';
        
        html += '<div class="revenue-type-item">';
        html += '<div style="display:flex; align-items:center; gap:0.5rem;">';
        html += '<div class="type-badge ' + colorClass + '"><i class="fas ' + icon + '"></i></div>';
        html += '<div><p class="revenue-type-label" style="font-weight:var(--font-weight-medium);">' + type + '</p>';
        html += '<p style="font-size:0.6rem; color:var(--color-brown-100);">' + percent + '% of total</p></div></div>';
        html += '<div style="text-align:right;"><p class="revenue-type-value">' + formatCurrency(amount) + '</p>';
        html += '<div class="progress-bar-track"><div class="fill" style="width: ' + percent + '%;"></div></div></div>';
        html += '</div>';
    }
    container.innerHTML = html;
}

// ─── ─── Monthly Summary ─────────────────────────────────────────────────────

function renderMonthlySummary() {
    var container = document.getElementById('monthlySummary');
    var monthlyData = {};
    
    // From payments
    for (var i = 0; i < payments.length; i++) {
        var p = payments[i];
        if (p.date) {
            var month = p.date.substring(0, 7);
            monthlyData[month] = (monthlyData[month] || 0) + (p.amount || 0);
        }
    }
    
    // From invoices paid
    for (var j = 0; j < invoices.length; j++) {
        var inv = invoices[j];
        if (inv.status === 'Paid' && inv.date) {
            var month2 = inv.date.substring(0, 7);
            monthlyData[month2] = (monthlyData[month2] || 0) + (inv.total || inv.amount || 0);
        }
    }
    
    var sortedMonths = Object.keys(monthlyData).sort().reverse();
    var monthsMap = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
        '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    };
    
    if (sortedMonths.length === 0) {
        container.innerHTML = '<div class="empty-state-sm"><i class="fas fa-calendar-alt"></i><p>No monthly data available</p></div>';
        return;
    }
    
    var maxRevenue = 0;
    for (var m = 0; m < sortedMonths.length; m++) {
        if (monthlyData[sortedMonths[m]] > maxRevenue) {
            maxRevenue = monthlyData[sortedMonths[m]];
        }
    }
    
    var html = '';
    for (var k = 0; k < sortedMonths.length; k++) {
        var month = sortedMonths[k];
        var year = month.substring(0, 4);
        var monthNum = month.substring(5, 7);
        var monthName = monthsMap[monthNum] || monthNum;
        var amount = monthlyData[month];
        var percent = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
        
        html += '<div class="monthly-item">';
        html += '<div class="monthly-month">' + monthName + ' ' + year + '</div>';
        html += '<div class="monthly-progress"><div class="track"><div class="fill" style="width: ' + percent + '%;"></div></div></div>';
        html += '<div class="monthly-amount">' + formatCurrency(amount) + '</div>';
        html += '</div>';
    }
    container.innerHTML = html;
}

// ─── ─── Doctor Performance ──────────────────────────────────────────────────

function renderDoctorPerformance() {
    var container = document.getElementById('doctorPerformance');
    var doctorRevenue = {};
    
    // From consultations
    for (var i = 0; i < consultations.length; i++) {
        var c = consultations[i];
        if (c.doctorId && c.doctorName) {
            var key = c.doctorId + '|' + c.doctorName;
            doctorRevenue[key] = (doctorRevenue[key] || 0) + (c.fee || 500);
        }
    }
    
    // From surgeries
    for (var j = 0; j < surgeries.length; j++) {
        var s = surgeries[j];
        if (s.doctorId && s.doctorName && s.status === 'completed') {
            var key2 = s.doctorId + '|' + s.doctorName;
            doctorRevenue[key2] = (doctorRevenue[key2] || 0) + (s.fee || 5000);
        }
    }
    
    // From emergency
    for (var k = 0; k < emergencyCases.length; k++) {
        var e = emergencyCases[k];
        if (e.doctorId && e.doctorName) {
            var key3 = e.doctorId + '|' + e.doctorName;
            doctorRevenue[key3] = (doctorRevenue[key3] || 0) + (e.fee || 1000);
        }
    }
    
    var sorted = Object.entries(doctorRevenue).sort(function(a, b) { return b[1] - a[1]; });
    
    if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-state-sm"><i class="fas fa-user-md"></i><p>No doctor data available</p></div>';
        return;
    }
    
    var maxRevenue = sorted.length > 0 ? sorted[0][1] : 0;
    var html = '';
    var limit = Math.min(sorted.length, 10);
    
    for (var l = 0; l < limit; l++) {
        var item = sorted[l];
        var parts = item[0].split('|');
        var name = parts[1] || 'Unknown';
        var amount = item[1];
        var percent = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
        
        html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:0.3rem 0.25rem; border-bottom:1px solid var(--border-default);">';
        html += '<div style="display:flex; align-items:center; gap:0.5rem;">';
        html += '<span style="font-weight:var(--font-weight-medium); font-size:0.75rem; color:var(--color-brown-700);">' + esc(name) + '</span>';
        html += '</div>';
        html += '<div style="flex:1; margin:0 0.5rem;"><div style="width:100%; height:4px; background:var(--bg-muted); border-radius:4px; overflow:hidden;">';
        html += '<div style="width:' + percent + '%; height:100%; background:linear-gradient(90deg, var(--color-sage), var(--color-sage-dark)); border-radius:4px;"></div></div></div>';
        html += '<div style="font-weight:var(--font-weight-medium); font-size:0.75rem; color:var(--color-sage-dark); min-width:70px; text-align:right;">' + formatCurrency(amount) + '</div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// ─── ─── Charts ─────────────────────────────────────────────────────────────

function renderCharts() {
    renderRevenueChart();
    renderSourceChart();
}

function renderRevenueChart() {
    var last7Days = [];
    var revenueData = [];
    
    for (var i = 6; i >= 0; i--) {
        var date = new Date();
        date.setDate(date.getDate() - i);
        var dateStr = date.toISOString().split('T')[0];
        last7Days.push(dateStr.substring(5));
        var dailyRevenue = 0;
        for (var j = 0; j < payments.length; j++) {
            if (payments[j].date === dateStr) {
                dailyRevenue += payments[j].amount || 0;
            }
        }
        revenueData.push(dailyRevenue);
    }
    
    var revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (!revenueCtx) return;
    
    if (revenueChart) revenueChart.destroy();
    
    revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Daily Revenue',
                data: revenueData,
                borderColor: '#a8c49a',
                backgroundColor: 'rgba(168, 196, 154, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8aae7a',
                pointBorderColor: '#fff',
                pointRadius: 3,
                pointHoverRadius: 5,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { font: { family: 'Poppins', size: 9 }, boxWidth: 10, padding: 6 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.raw.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        },
                        font: { family: 'Poppins', size: 8 }
                    }
                },
                x: {
                    ticks: { font: { family: 'Poppins', size: 8 } }
                }
            }
        }
    });
}

function renderSourceChart() {
    var sourceData = {};
    
    // From payments (Invoice sources)
    for (var i = 0; i < invoices.length; i++) {
        var inv = invoices[i];
        if (inv.status === 'Paid') {
            var type = inv.type || 'Other';
            sourceData[type] = (sourceData[type] || 0) + (inv.total || inv.amount || 0);
        }
    }
    
    // Add consultation fees as OPD
    for (var j = 0; j < consultations.length; j++) {
        var c = consultations[j];
        if (c.status !== 'cancelled') {
            var type2 = c.type === 'opd' ? 'OPD' : 'IPD';
            sourceData[type2] = (sourceData[type2] || 0) + (c.fee || 500);
        }
    }
    
    var sourceLabels = Object.keys(sourceData);
    var sourceAmounts = Object.values(sourceData);
    var colors = {
        'OPD': '#3b82f6',
        'IPD': '#8b5cf6',
        'Pharmacy': '#10b981',
        'Laboratory': '#f59e0b',
        'Radiology': '#f97316',
        'Surgery': '#ef4444',
        'Emergency': '#dc2626',
        'Other': '#64748b'
    };
    
    var backgroundColors = sourceLabels.map(function(label) {
        return colors[label] || '#a8c49a';
    });
    
    var sourceCtx = document.getElementById('sourceChart')?.getContext('2d');
    if (!sourceCtx) return;
    
    if (sourceChart) sourceChart.destroy();
    
    if (sourceLabels.length === 0) {
        var container = sourceCtx.canvas.parentElement;
        if (container) {
            container.innerHTML = '<div class="empty-state-sm" style="padding:0.5rem;"><i class="fas fa-chart-pie"></i><p style="font-size:0.6875rem;">No data available</p></div>';
        }
        return;
    }
    
    sourceChart = new Chart(sourceCtx, {
        type: 'doughnut',
        data: {
            labels: sourceLabels,
            datasets: [{
                data: sourceAmounts,
                backgroundColor: backgroundColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '55%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Poppins', size: 9 },
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 4
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var label = context.label || '';
                            var value = context.raw;
                            var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                            var percent = ((value / total) * 100).toFixed(1);
                            return label + ': ' + formatCurrency(value) + ' (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });
}

// ─── ─── Refresh UI ──────────────────────────────────────────────────────────

function refreshUI() {
    updateStats();
    renderRevenueByDepartment();
    renderMonthlySummary();
    renderDoctorPerformance();
    renderCharts();
}

// ─── ─── Init ────────────────────────────────────────────────────────────────

function initFinancialReportsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadAllData();
    
    document.getElementById('refreshBtn')?.addEventListener('click', function() {
        loadAllData();
        showToast('Refreshed', 'info');
    });
}

// ─── ─── Wait ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initFinancialReportsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initFinancialReportsModule();
    }, 3000);
});

// ─── ─── Expose ──────────────────────────────────────────────────────────────

window.loadAllData = loadAllData;
window.refreshUI = refreshUI;