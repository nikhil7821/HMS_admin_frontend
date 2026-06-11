/**
 * Revenue Reports JS - Reports Module
 * Professional UI, Fully Working, Indian Names, Rupee Symbol
 */

let revenueChart = null;
let deptChart = null;

function loadRevenueReports() {
    setDefaultDates();
    loadData();
    setupEventListeners();
}

function setDefaultDates() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    document.getElementById('fromDate').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('toDate').value = today.toISOString().split('T')[0];
}

function setupEventListeners() {
    document.getElementById('applyFilter')?.addEventListener('click', () => loadData());
    document.getElementById('printReport')?.addEventListener('click', () => window.print());
}

function getDateRange() {
    return { 
        fromDate: document.getElementById('fromDate').value, 
        toDate: document.getElementById('toDate').value 
    };
}

function loadData() {
    const { fromDate, toDate } = getDateRange();
    const invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
    
    const filtered = invoices.filter(i => i.date >= fromDate && i.date <= toDate);

    const total = filtered.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.total || i.amount || 0), 0);
    const pending = filtered.filter(i => i.status === 'Pending').reduce((sum, i) => sum + (i.total || i.amount || 0), 0);
    const collectionRate = (total + pending) > 0 ? Math.round((total / (total + pending)) * 100) : 0;

    document.getElementById('totalRevenue').innerText = '₹' + total.toLocaleString('en-IN');
    document.getElementById('pendingRevenue').innerText = '₹' + pending.toLocaleString('en-IN');
    document.getElementById('collectionRate').innerText = collectionRate + '%';
    document.getElementById('totalInvoices').innerText = filtered.length;

    // Daily Revenue Trend (Last 7 Days)
    const last7Days = [];
    const dailyRevenue = [];
    for(let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push(dateStr.substring(5)); // MM-DD format
        const dayRevenue = filtered.filter(i => i.date === dateStr && i.status === 'Paid')
            .reduce((sum, i) => sum + (i.total || i.amount || 0), 0);
        dailyRevenue.push(dayRevenue);
    }

    const ctx1 = document.getElementById('revenueTrendChart')?.getContext('2d');
    if(ctx1) {
        if(revenueChart) revenueChart.destroy();
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
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top', labels: { font: { family: 'Poppins', size: 11 } } },
                    tooltip: { callbacks: { label: (ctx) => '₹' + ctx.raw.toLocaleString('en-IN') } }
                },
                scales: {
                    y: { ticks: { callback: (value) => '₹' + value.toLocaleString('en-IN'), font: { family: 'Poppins', size: 10 } } },
                    x: { ticks: { font: { family: 'Poppins', size: 10 } } }
                }
            }
        });
    }

    // Revenue by Department (Doughnut Chart)
    const deptRevenue = { OPD: 0, IPD: 0, Pharmacy: 0, Laboratory: 0, Radiology: 0 };
    filtered.forEach(i => {
        const type = i.type || 'OPD';
        if(deptRevenue[type] !== undefined) {
            deptRevenue[type] += (i.total || i.amount || 0);
        } else {
            deptRevenue['OPD'] += (i.total || i.amount || 0);
        }
    });

    const deptColors = {
        'OPD': '#3b82f6',
        'IPD': '#8b5cf6',
        'Pharmacy': '#10b981',
        'Laboratory': '#f59e0b',
        'Radiology': '#ef4444'
    };

    const deptLabels = Object.keys(deptRevenue);
    const deptValues = Object.values(deptRevenue);
    const deptBackgrounds = deptLabels.map(label => deptColors[label] || '#a8c49a');

    const ctx2 = document.getElementById('deptChart')?.getContext('2d');
    if(ctx2) {
        if(deptChart) deptChart.destroy();
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
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 11 }, usePointStyle: true } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = deptValues.reduce((a, b) => a + b, 0);
                                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ₹${value.toLocaleString('en-IN')} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Monthly Breakdown
    const monthlyData = {};
    filtered.forEach(i => {
        const month = i.date.substring(0, 7); // YYYY-MM
        if(!monthlyData[month]) {
            monthlyData[month] = { OPD: 0, IPD: 0, Pharmacy: 0, Laboratory: 0, Radiology: 0 };
        }
        const type = i.type || 'OPD';
        if(monthlyData[month][type] !== undefined) {
            monthlyData[month][type] += (i.total || i.amount || 0);
        } else {
            monthlyData[month]['OPD'] += (i.total || i.amount || 0);
        }
    });

    const monthsMap = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
        '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    };

    const tbody = document.getElementById('monthlyTable');
    const sortedMonths = Object.keys(monthlyData).sort().reverse();

    if(sortedMonths.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-[#94a3b8]">No data available</td></tr>';
        return;
    }

    tbody.innerHTML = sortedMonths.map(month => {
        const year = month.substring(0, 4);
        const monthNum = month.substring(5, 7);
        const monthName = monthsMap[monthNum];
        const depts = monthlyData[month];
        const total = Object.values(depts).reduce((a, b) => a + b, 0);
        
        return `
            <tr class="border-b border-[#f5f0ea] hover:bg-[#fefcf9] transition">
                <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${monthName} ${year}</td>
                <td class="px-5 py-3 text-right text-sm text-[#475569]">₹${depts.OPD.toLocaleString('en-IN')}</td>
                <td class="px-5 py-3 text-right text-sm text-[#475569]">₹${depts.IPD.toLocaleString('en-IN')}</td>
                <td class="px-5 py-3 text-right text-sm text-[#475569]">₹${depts.Pharmacy.toLocaleString('en-IN')}</td>
                <td class="px-5 py-3 text-right text-sm text-[#475569]">₹${depts.Laboratory.toLocaleString('en-IN')}</td>
                <td class="px-5 py-3 text-right text-sm text-[#475569]">₹${depts.Radiology.toLocaleString('en-IN')}</td>
                <td class="px-5 py-3 text-right font-semibold text-[#1e293b] text-sm">₹${total.toLocaleString('en-IN')}</td>
            </tr>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', loadRevenueReports);