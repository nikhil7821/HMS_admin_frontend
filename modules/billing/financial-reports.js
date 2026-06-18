/**
 * Financial Reports JS - Billing Module
 * Uses theme.css for styling, clean event handling
 */

let invoices = [];
let payments = [];
let revenueChart = null;
let paymentMethodChart = null;
let isInitialized = false;

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
        payments = JSON.parse(localStorage.getItem('hms_payments') || '[]');
        
        updateReports();
        renderCharts();
        renderMonthlySummary();
    } catch (error) {
        console.error('Error loading financial data:', error);
        showToast('Error loading financial data', 'error');
    }
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
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

// ─── Update Reports ──────────────────────────────────

function updateReports() {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const avg = payments.length > 0 ? total / payments.length : 0;
    const totalTransactions = payments.length;
    
    document.getElementById('reportTotal').textContent = '₹' + total.toLocaleString('en-IN');
    document.getElementById('avgTransaction').textContent = '₹' + avg.toFixed(2);
    document.getElementById('totalTransactions').textContent = totalTransactions;
    
    // Revenue by Type/Department
    const typeRevenue = {};
    invoices.filter(i => i.status === 'Paid').forEach(i => {
        const type = i.type || 'Other';
        typeRevenue[type] = (typeRevenue[type] || 0) + (i.total || i.amount || 0);
    });
    
    const typeColors = {
        'OPD': 'opd',
        'IPD': 'ipd',
        'Pharmacy': 'pharmacy',
        'Laboratory': 'laboratory',
        'Radiology': 'radiology',
        'Other': 'other'
    };
    
    const typeIcons = {
        'OPD': 'fa-walking',
        'IPD': 'fa-procedures',
        'Pharmacy': 'fa-capsules',
        'Laboratory': 'fa-microscope',
        'Radiology': 'fa-x-ray',
        'Other': 'fa-circle'
    };
    
    const container = document.getElementById('revenueByType');
    
    if (Object.keys(typeRevenue).length === 0) {
        container.innerHTML = `
            <div class="empty-state-sm">
                <i class="fas fa-chart-pie"></i>
                <p>No revenue data available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = Object.entries(typeRevenue).map(([type, amount]) => {
        const percent = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
        const colorClass = typeColors[type] || 'other';
        const icon = typeIcons[type] || 'fa-chart-line';
        
        return `
            <div class="revenue-type-item">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <div class="type-badge ${colorClass}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div>
                        <p class="revenue-type-label" style="font-weight:var(--font-weight-medium);">${type}</p>
                        <p style="font-size:0.625rem; color:var(--color-brown-100);">${percent}% of total</p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <p class="revenue-type-value">₹${amount.toLocaleString('en-IN')}</p>
                    <div class="progress-bar-track">
                        <div class="fill" style="width: ${percent}%;"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ─── Render Charts ───────────────────────────────────

function renderCharts() {
    renderRevenueChart();
    renderPaymentMethodChart();
}

function renderRevenueChart() {
    const last7Days = [];
    const revenueData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(dateStr.substring(5));
        const dailyRevenue = payments.filter(p => p.date === dateStr).reduce((sum, p) => sum + p.amount, 0);
        revenueData.push(dailyRevenue);
    }
    
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (!revenueCtx) return;
    
    if (revenueChart) revenueChart.destroy();
    
    revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Daily Revenue (₹)',
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
                    labels: {
                        font: { family: 'Poppins', size: 10 },
                        boxWidth: 10,
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
                    beginAtZero: true,
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

function renderPaymentMethodChart() {
    const methodData = {};
    payments.forEach(p => {
        const method = p.method || 'Cash';
        methodData[method] = (methodData[method] || 0) + p.amount;
    });
    
    const methodColors = {
        'Cash': '#10b981',
        'Card': '#3b82f6',
        'UPI': '#8b5cf6',
        'Insurance': '#f59e0b',
        'Bank Transfer': '#6366f1'
    };
    
    const methodLabels = Object.keys(methodData);
    const methodAmounts = Object.values(methodData);
    const backgroundColors = methodLabels.map(label => methodColors[label] || '#a8c49a');
    
    const methodCtx = document.getElementById('paymentMethodChart')?.getContext('2d');
    if (!methodCtx) return;
    
    if (paymentMethodChart) paymentMethodChart.destroy();
    
    if (methodLabels.length === 0) {
        const container = methodCtx.canvas.parentElement;
        if (container) {
            container.innerHTML = `
                <div class="empty-state-sm" style="padding:0.5rem;">
                    <i class="fas fa-credit-card"></i>
                    <p style="font-size:0.6875rem;">No payment data available</p>
                </div>
            `;
        }
        return;
    }
    
    paymentMethodChart = new Chart(methodCtx, {
        type: 'doughnut',
        data: {
            labels: methodLabels,
            datasets: [{
                data: methodAmounts,
                backgroundColor: backgroundColors,
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
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${label}: ₹${value.toLocaleString('en-IN')} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ─── Render Monthly Summary ──────────────────────────

function renderMonthlySummary() {
    const monthlyData = {};
    
    payments.forEach(p => {
        const month = p.date.substring(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + p.amount;
    });
    
    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    const monthsMap = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
        '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    };
    
    const container = document.getElementById('monthlySummary');
    
    if (sortedMonths.length === 0) {
        container.innerHTML = `
            <div class="empty-state-sm">
                <i class="fas fa-calendar-alt"></i>
                <p>No monthly data available</p>
            </div>
        `;
        return;
    }
    
    const maxRevenue = Math.max(...Object.values(monthlyData));
    
    container.innerHTML = sortedMonths.map(month => {
        const year = month.substring(0, 4);
        const monthNum = month.substring(5, 7);
        const monthName = monthsMap[monthNum] || monthNum;
        const amount = monthlyData[month];
        const percent = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
        
        return `
            <div class="monthly-item">
                <div style="min-width:4.5rem;">
                    <p style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.8125rem;">${monthName} ${year}</p>
                </div>
                <div class="monthly-progress">
                    <div class="track">
                        <div class="fill" style="width: ${percent}%;"></div>
                    </div>
                </div>
                <div style="text-align:right; min-width:5rem;">
                    <p style="font-weight:var(--font-weight-semibold); color:var(--color-sage-dark); font-size:0.8125rem;">₹${amount.toLocaleString('en-IN')}</p>
                </div>
            </div>
        `;
    }).join('');
}

// ─── Init ────────────────────────────────────────────

function initFinancialReportsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initFinancialReportsModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initFinancialReportsModule();
    }, 3000);
});