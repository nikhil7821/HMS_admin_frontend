/**
 * Revenue Reports JS - Reports Module
 * Uses theme.css for styling, clean event handling
 */

var revenueChart = null;
var deptChart = null;
var isInitialized = false;

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Toast Notification ──────────────────────────────

function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    var colors = { success: '#8aae7a', error: '#d8b48c', info: '#a8c49a' };
    toast.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; align-items:center; gap:8px; padding:10px 20px; border-radius:12px; background:' + colors[type] + '; color:white; font-weight:500; font-size:0.75rem; backdrop-filter:blur(8px); box-shadow:0 4px 12px rgba(0,0,0,0.08); animation:slideInRight 0.25s ease-out; font-family:Poppins, sans-serif;';
    toast.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle') + '"></i><span>' + esc(message) + '</span>';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 250);
    }, 3000);
}

// ─── Set Default Dates ──────────────────────────────

function setDefaultDates() {
    var today = new Date();
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    var fromDateInput = document.getElementById('fromDate');
    var toDateInput = document.getElementById('toDate');
    
    if (fromDateInput && !fromDateInput.value) {
        fromDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    }
    if (toDateInput && !toDateInput.value) {
        toDateInput.value = today.toISOString().split('T')[0];
    }
}

// ─── Get Date Range ──────────────────────────────────

function getDateRange() {
    return {
        fromDate: document.getElementById('fromDate').value,
        toDate: document.getElementById('toDate').value
    };
}

// ─── Load Data ──────────────────────────────────────

function loadData() {
    try {
        var dateRange = getDateRange();
        var fromDate = dateRange.fromDate;
        var toDate = dateRange.toDate;
        
        var invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
        
        // Create sample invoices if none exist
        if (invoices.length === 0) {
            var today = new Date();
            var sampleInvoices = [];
            var types = ['OPD', 'IPD', 'Pharmacy', 'Laboratory', 'Radiology'];
            var statuses = ['Paid', 'Pending', 'Paid', 'Paid', 'Paid'];
            var patientNames = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Verma', 'Vikram Singh', 'Neha Gupta', 'Ramesh Iyer', 'Kavya Reddy'];
            
            for (var i = 0; i < 30; i++) {
                var date = new Date(today);
                date.setDate(date.getDate() - Math.floor(Math.random() * 40));
                var dateStr = date.toISOString().split('T')[0];
                var type = types[Math.floor(Math.random() * types.length)];
                var amount = Math.floor(Math.random() * 2000) + 500;
                var status = Math.random() > 0.7 ? 'Pending' : 'Paid';
                
                sampleInvoices.push({
                    id: i + 1,
                    type: type,
                    patientName: patientNames[Math.floor(Math.random() * patientNames.length)],
                    amount: amount,
                    total: amount,
                    status: status,
                    date: dateStr
                });
            }
            invoices = sampleInvoices;
            localStorage.setItem('hms_invoices', JSON.stringify(invoices));
        }
        
        // Filter by date range
        var filtered = [];
        for (var f = 0; f < invoices.length; f++) {
            if (invoices[f].date >= fromDate && invoices[f].date <= toDate) {
                filtered.push(invoices[f]);
            }
        }
        
        // Calculate totals
        var total = 0, pending = 0;
        for (var t = 0; t < filtered.length; t++) {
            var amount = filtered[t].total || filtered[t].amount || 0;
            if (filtered[t].status === 'Paid') total += amount;
            else if (filtered[t].status === 'Pending') pending += amount;
        }
        var collectionRate = (total + pending) > 0 ? Math.round((total / (total + pending)) * 100) : 0;
        
        document.getElementById('totalRevenue').textContent = '₹' + total.toLocaleString('en-IN');
        document.getElementById('pendingRevenue').textContent = '₹' + pending.toLocaleString('en-IN');
        document.getElementById('collectionRate').textContent = collectionRate + '%';
        document.getElementById('totalInvoices').textContent = filtered.length;
        
        // --- Daily Revenue Trend (Last 7 Days) ---
        var last7Days = [];
        var dailyRevenue = [];
        for (var d = 6; d >= 0; d--) {
            var date = new Date();
            date.setDate(date.getDate() - d);
            var dateStr = date.toISOString().split('T')[0];
            last7Days.push(dateStr.substring(5));
            var dayRevenue = 0;
            for (var dr = 0; dr < filtered.length; dr++) {
                if (filtered[dr].date === dateStr && filtered[dr].status === 'Paid') {
                    dayRevenue += (filtered[dr].total || filtered[dr].amount || 0);
                }
            }
            dailyRevenue.push(dayRevenue);
        }
        
        var ctx1 = document.getElementById('revenueTrendChart')?.getContext('2d');
        if (ctx1) {
            if (revenueChart) { revenueChart.destroy(); }
            revenueChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: last7Days,
                    datasets: [{
                        label: 'Daily Revenue (₹)',
                        data: dailyRevenue,
                        borderColor: '#a8c49a',
                        backgroundColor: 'rgba(168, 196, 154, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#8aae7a',
                        pointBorderColor: '#fff',
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { family: 'Poppins', size: 10 },
                                boxWidth: 12,
                                padding: 8
                            }
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
                            ticks: {
                                callback: function(value) {
                                    return '₹' + value.toLocaleString('en-IN');
                                },
                                font: { family: 'Poppins', size: 9 }
                            }
                        },
                        x: {
                            ticks: {
                                font: { family: 'Poppins', size: 9 }
                            }
                        }
                    }
                }
            });
        }
        
        // --- Revenue by Department (Doughnut Chart) ---
        var deptRevenue = { 'OPD': 0, 'IPD': 0, 'Pharmacy': 0, 'Laboratory': 0, 'Radiology': 0 };
        for (var dr2 = 0; dr2 < filtered.length; dr2++) {
            var inv = filtered[dr2];
            var type2 = inv.type || 'OPD';
            if (inv.status === 'Paid') {
                if (deptRevenue[type2] !== undefined) {
                    deptRevenue[type2] += (inv.total || inv.amount || 0);
                } else {
                    deptRevenue['OPD'] += (inv.total || inv.amount || 0);
                }
            }
        }
        
        var deptColors = {
            'OPD': '#3b82f6',
            'IPD': '#8b5cf6',
            'Pharmacy': '#10b981',
            'Laboratory': '#f59e0b',
            'Radiology': '#ef4444'
        };
        
        var deptLabels = [];
        var deptValues = [];
        var deptBackgrounds = [];
        var dKeys = Object.keys(deptRevenue);
        for (var dk = 0; dk < dKeys.length; dk++) {
            if (deptRevenue[dKeys[dk]] > 0) {
                deptLabels.push(dKeys[dk]);
                deptValues.push(deptRevenue[dKeys[dk]]);
                deptBackgrounds.push(deptColors[dKeys[dk]] || '#a8c49a');
            }
        }
        
        var ctx2 = document.getElementById('deptChart')?.getContext('2d');
        if (ctx2) {
            if (deptChart) { deptChart.destroy(); }
            deptChart = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: deptLabels,
                    datasets: [{
                        data: deptValues,
                        backgroundColor: deptBackgrounds,
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: 'Poppins', size: 10 },
                                usePointStyle: true,
                                boxWidth: 8,
                                padding: 6
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    var label = context.label || '';
                                    var value = context.raw;
                                    var total = 0;
                                    for (var tv = 0; tv < deptValues.length; tv++) {
                                        total += deptValues[tv];
                                    }
                                    var percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return label + ': ₹' + value.toLocaleString('en-IN') + ' (' + percent + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // --- Monthly Breakdown ---
        var monthlyData = {};
        for (var mi = 0; mi < filtered.length; mi++) {
            var inv2 = filtered[mi];
            var month = inv2.date.substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { 'OPD': 0, 'IPD': 0, 'Pharmacy': 0, 'Laboratory': 0, 'Radiology': 0 };
            }
            var type3 = inv2.type || 'OPD';
            if (monthlyData[month][type3] !== undefined && inv2.status === 'Paid') {
                monthlyData[month][type3] += (inv2.total || inv2.amount || 0);
            } else if (inv2.status === 'Paid') {
                monthlyData[month]['OPD'] += (inv2.total || inv2.amount || 0);
            }
        }
        
        var monthsMap = {
            '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
            '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
        };
        
        var tbody = document.getElementById('monthlyTable');
        var sortedMonths = Object.keys(monthlyData).sort().reverse();
        
        if (sortedMonths.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-calendar-alt" style="font-size:1.5rem; margin-bottom:0.5rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No data available</p></td></tr>';
        } else {
            var html = '';
            for (var sm = 0; sm < sortedMonths.length; sm++) {
                var month2 = sortedMonths[sm];
                var year = month2.substring(0, 4);
                var monthNum = month2.substring(5, 7);
                var monthName = monthsMap[monthNum] || monthNum;
                var depts = monthlyData[month2];
                var totalMonth = 0;
                var dNames = ['OPD', 'IPD', 'Pharmacy', 'Laboratory', 'Radiology'];
                for (var dn = 0; dn < dNames.length; dn++) {
                    totalMonth += (depts[dNames[dn]] || 0);
                }
                
                html += '<tr class="report-row">';
                html += '<td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem;">' + monthName + ' ' + year + '</td>';
                html += '<td style="text-align:right; color:var(--color-brown-300); font-size:0.8125rem;">₹' + (depts.OPD || 0).toLocaleString('en-IN') + '</td>';
                html += '<td style="text-align:right; color:var(--color-brown-300); font-size:0.8125rem;">₹' + (depts.IPD || 0).toLocaleString('en-IN') + '</td>';
                html += '<td style="text-align:right; color:var(--color-brown-300); font-size:0.8125rem;">₹' + (depts.Pharmacy || 0).toLocaleString('en-IN') + '</td>';
                html += '<td style="text-align:right; color:var(--color-brown-300); font-size:0.8125rem;">₹' + (depts.Laboratory || 0).toLocaleString('en-IN') + '</td>';
                html += '<td style="text-align:right; color:var(--color-brown-300); font-size:0.8125rem;">₹' + (depts.Radiology || 0).toLocaleString('en-IN') + '</td>';
                html += '<td style="text-align:right; font-weight:var(--font-weight-semibold); color:var(--color-sage-dark); font-size:0.875rem;">₹' + totalMonth.toLocaleString('en-IN') + '</td>';
                html += '</tr>';
            }
            tbody.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading revenue reports:', error);
        showToast('Error loading revenue reports', 'error');
    }
}

// ─── Print Report ──────────────────────────────────

function printReport() {
    var mainContent = document.querySelector('main');
    var clone = mainContent.cloneNode(true);
    
    var canvasElements = clone.querySelectorAll('canvas');
    for (var i = 0; i < canvasElements.length; i++) {
        var canvas = canvasElements[i];
        var container = canvas.parentElement;
        if (container) {
            var img = document.createElement('img');
            try {
                img.src = canvas.toDataURL();
            } catch (e) {
                img.src = '';
            }
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            container.replaceChild(img, canvas);
        }
    }
    
    var style = document.createElement('style');
    style.textContent = `
        @media print {
            body { margin: 0; padding: 20px; background: white; }
            .no-print { display: none !important; }
            .stat-card { break-inside: avoid; }
            .card-white { break-inside: avoid; }
            .report-row { break-inside: avoid; }
        }
        body { font-family: 'Poppins', Arial, sans-serif; background: white; }
        .stat-card { border: 1px solid #f0e8e0; padding: 16px; border-radius: 12px; }
        .card-white { border: 1px solid #f0e8e0; border-radius: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #f0e8e0; text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .border-l-4 { border-left-width: 4px; }
    `;
    
    var printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>Revenue Reports - MedFlow Hospital</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">' + style.outerHTML + '</head><body style="padding:40px; max-width:1200px; margin:0 auto;"><div style="text-align:center; border-bottom:2px solid #a8c49a; padding-bottom:20px; margin-bottom:30px;"><h1 style="color:#5a4a3a; margin:0;">MedFlow Hospital</h1><p style="color:#9a8e82; margin:5px 0;">Revenue Reports</p><p style="color:#b8aa9a; font-size:12px;">Period: ' + document.getElementById('fromDate').value + ' to ' + document.getElementById('toDate').value + '</p><p style="color:#b8aa9a; font-size:12px;">Generated on: ' + new Date().toLocaleString('en-IN') + '</p></div>' + clone.innerHTML + '<div style="text-align:center; margin-top:50px; padding-top:20px; border-top:1px solid #f0e8e0; color:#b8aa9a; font-size:12px;"><p>MedFlow Hospital - www.medflow.com</p><p>This is a computer-generated report</p></div></body></html>');
        printWindow.document.close();
        printWindow.print();
        showToast('Opening print dialog...', 'success');
    } else {
        showToast('Please allow popups to print', 'error');
    }
}

// ─── Init ────────────────────────────────────────────

function initRevenueReportsModule() {
    if (isInitialized) return;
    isInitialized = true;
    setDefaultDates();
    loadData();
    
    document.getElementById('applyFilter').addEventListener('click', loadData);
    document.getElementById('printReport').addEventListener('click', printReport);
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkSidebar = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkSidebar);
            setTimeout(initRevenueReportsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkSidebar);
        initRevenueReportsModule();
    }, 3000);
});