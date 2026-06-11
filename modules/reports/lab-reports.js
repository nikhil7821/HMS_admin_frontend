/**
 * Laboratory Activity Report JS - Reports Module
 * Professional UI, Fully Working, Indian Names, Rupee Symbol
 */

let testChart = null;
let statusChart = null;

function loadLabReports() {
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
    const requests = JSON.parse(localStorage.getItem('lab_requests') || '[]');
    
    const filtered = requests.filter(r => r.requestDate >= fromDate && r.requestDate <= toDate);

    const total = filtered.length;
    const completed = filtered.filter(r => r.status === 'Completed').length;
    const pending = filtered.filter(r => r.status === 'Pending').length;
    const inProgress = filtered.filter(r => r.status === 'In Progress').length;
    const revenue = filtered.filter(r => r.status === 'Completed').reduce((sum, r) => sum + (r.testPrice || 0), 0);

    document.getElementById('totalRequests').innerText = total;
    document.getElementById('completedRequests').innerText = completed;
    document.getElementById('pendingRequests').innerText = pending;
    document.getElementById('labRevenue').innerText = '₹' + revenue.toLocaleString('en-IN');

    // Test-wise Distribution (Bar Chart)
    const testStats = {};
    filtered.forEach(r => {
        testStats[r.testName] = (testStats[r.testName] || 0) + 1;
    });
    
    const sortedTests = Object.entries(testStats).sort((a, b) => b[1] - a[1]);
    const topTests = sortedTests.slice(0, 5);
    const testLabels = topTests.map(t => t[0]);
    const testCounts = topTests.map(t => t[1]);

    const ctx1 = document.getElementById('testChart')?.getContext('2d');
    if(ctx1) {
        if(testChart) testChart.destroy();
        testChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: testLabels,
                datasets: [{
                    label: 'Number of Requests',
                    data: testCounts,
                    backgroundColor: '#a8c49a',
                    borderRadius: 6,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top', labels: { font: { family: 'Poppins', size: 11 } } },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.raw} requests` } }
                },
                scales: {
                    y: { ticks: { stepSize: 1, font: { family: 'Poppins', size: 10 } }, title: { display: true, text: 'Number of Requests', font: { family: 'Poppins', size: 10 } } },
                    x: { ticks: { font: { family: 'Poppins', size: 10, rotation: 15 } } }
                }
            }
        });
    }

    // Status Breakdown (Doughnut Chart)
    const ctx2 = document.getElementById('statusChart')?.getContext('2d');
    if(ctx2) {
        if(statusChart) statusChart.destroy();
        statusChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending', 'In Progress'],
                datasets: [{
                    data: [completed, pending, inProgress],
                    backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
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
                                const total = completed + pending + inProgress;
                                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Popular Tests Table
    const tbody = document.getElementById('popularTestsTable');
    if(sortedTests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-[#94a3b8]">No data available</td><td></td><td></td><td></td><td></td></table>';
        return;
    }

    tbody.innerHTML = sortedTests.map(([test, count]) => {
        const completedCount = filtered.filter(r => r.testName === test && r.status === 'Completed').length;
        const testRevenue = filtered.filter(r => r.testName === test && r.status === 'Completed').reduce((sum, r) => sum + (r.testPrice || 0), 0);
        const completionRate = count > 0 ? Math.round((completedCount / count) * 100) : 0;
        
        let trendColor = '';
        let trendText = '';
        if(completionRate >= 80) { trendColor = 'bg-green-500'; trendText = 'High'; }
        else if(completionRate >= 50) { trendColor = 'bg-yellow-500'; trendText = 'Medium'; }
        else { trendColor = 'bg-red-500'; trendText = 'Low'; }
        
        return `
            <tr class="border-b border-[#f5f0ea] hover:bg-[#fefcf9] transition">
                <td class="px-5 py-3 font-medium text-[#1e293b] text-sm">${escapeHtml(test)}</td>
                <td class="px-5 py-3 text-right">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#a8c49a]/10 text-[#a8c49a] font-semibold text-sm">${count}</span>
                </td>
                <td class="px-5 py-3 text-right">
                    <span class="text-sm text-[#475569]">${completedCount}</span>
                    <span class="text-xs text-[#10b981] ml-1">(${completionRate}%)</span>
                </td>
                <td class="px-5 py-3 text-right font-semibold text-[#1e293b] text-sm">₹${testRevenue.toLocaleString('en-IN')}</td>
                <td class="px-5 py-3">
                    <div class="flex items-center gap-2">
                        <div class="flex-1 bg-[#e2e8f0] rounded-full h-2 w-24">
                            <div class="trend-bar rounded-full" style="width: ${completionRate}%; background: ${completionRate >= 80 ? '#10b981' : completionRate >= 50 ? '#f59e0b' : '#ef4444'}"></div>
                        </div>
                        <span class="text-xs font-medium ${completionRate >= 80 ? 'text-green-600' : completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'}">${trendText}</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function escapeHtml(str) {
    if(!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadLabReports);