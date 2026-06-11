/**
 * Financial Reports JS - Billing Module
 * Professional UI, Fully Working, Rupee Symbol, Charts
 */

let invoices = [];
let payments = [];
let revenueChart = null;
let paymentMethodChart = null;

function loadData() {
    invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
    payments = JSON.parse(localStorage.getItem('hms_payments') || '[]');
    
    updateReports();
    renderCharts();
    renderMonthlySummary();
}

function updateReports() {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const avg = payments.length > 0 ? total / payments.length : 0;
    const totalTransactions = payments.length;
    
    document.getElementById('reportTotal').innerText = '₹' + total.toLocaleString('en-IN');
    document.getElementById('avgTransaction').innerText = '₹' + avg.toFixed(2);
    document.getElementById('totalTransactions').innerText = totalTransactions;
    
    // Revenue by Type/Department
    const typeRevenue = {};
    invoices.filter(i => i.status === 'Paid').forEach(i => {
        const type = i.type || 'Other';
        typeRevenue[type] = (typeRevenue[type] || 0) + (i.total || i.amount || 0);
    });
    
    const typeColors = {
        'OPD': 'bg-blue-100 text-blue-700',
        'IPD': 'bg-purple-100 text-purple-700',
        'Pharmacy': 'bg-green-100 text-green-700',
        'Laboratory': 'bg-yellow-100 text-yellow-700',
        'Radiology': 'bg-orange-100 text-orange-700',
        'Other': 'bg-gray-100 text-gray-700'
    };
    
    const typeIcons = {
        'OPD': 'fa-walking',
        'IPD': 'fa-procedures',
        'Pharmacy': 'fa-capsules',
        'Laboratory': 'fa-microscope',
        'Radiology': 'fa-x-ray',
        'Other': 'fa-circle'
    };
    
    const typeHtml = Object.entries(typeRevenue).map(([type, amount]) => {
        const percent = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
        return `
            <div class="revenue-type-item">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg ${typeColors[type] || 'bg-gray-100'} flex items-center justify-center">
                        <i class="fas ${typeIcons[type] || 'fa-chart-line'} text-sm"></i>
                    </div>
                    <div>
                        <p class="revenue-type-label font-medium">${type}</p>
                        <p class="text-xs text-[#94a3b8]">${percent}% of total</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="revenue-type-value">₹${amount.toLocaleString('en-IN')}</p>
                    <div class="w-24 bg-[#e2e8f0] rounded-full h-1 mt-1">
                        <div class="bg-[#a8c49a] h-1 rounded-full" style="width: ${percent}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('revenueByType').innerHTML = typeHtml || '<div class="text-center py-8 text-[#94a3b8]"><p class="font-normal">No revenue data available</p></div>';
}

function renderCharts() {
    // Revenue Trend - Last 7 Days
    const last7Days = [];
    const revenueData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(dateStr.substring(5)); // Show MM-DD
        const dailyRevenue = payments.filter(p => p.date === dateStr).reduce((sum, p) => sum + p.amount, 0);
        revenueData.push(dailyRevenue);
    }
    
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx) {
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
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { family: 'Poppins', size: 11 }
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
                            font: { family: 'Poppins', size: 10 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: 'Poppins', size: 10 }
                        }
                    }
                }
            }
        });
    }
    
    // Payment Method Distribution
    const methodData = {};
    payments.forEach(p => {
        methodData[p.method] = (methodData[p.method] || 0) + p.amount;
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
    if (methodCtx) {
        if (paymentMethodChart) paymentMethodChart.destroy();
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
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Poppins', size: 11 },
                            usePointStyle: true,
                            boxWidth: 8
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
}

function renderMonthlySummary() {
    const monthlyData = {};
    
    payments.forEach(p => {
        const month = p.date.substring(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + p.amount;
    });
    
    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    const monthsMap = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
        '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    };
    
    const container = document.getElementById('monthlySummary');
    
    if (sortedMonths.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-[#94a3b8]"><i class="fas fa-chart-line text-3xl mb-2 block"></i><p class="font-normal">No monthly data available</p></div>';
        return;
    }
    
    const maxRevenue = Math.max(...Object.values(monthlyData));
    
    container.innerHTML = sortedMonths.map(month => {
        const year = month.substring(0, 4);
        const monthNum = month.substring(5, 7);
        const monthName = monthsMap[monthNum];
        const amount = monthlyData[month];
        const percent = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
        
        return `
            <div class="flex items-center justify-between py-2 border-b border-[#f0e8e0] last:border-b-0">
                <div class="w-24">
                    <p class="font-medium text-[#1e293b] text-sm">${monthName} ${year}</p>
                </div>
                <div class="flex-1 mx-3">
                    <div class="w-full bg-[#e2e8f0] rounded-full h-2">
                        <div class="bg-gradient-to-r from-[#a8c49a] to-[#8aae7a] h-2 rounded-full" style="width: ${percent}%"></div>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-[#1e293b] text-sm">₹${amount.toLocaleString('en-IN')}</p>
                </div>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});