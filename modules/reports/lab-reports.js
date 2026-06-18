/**
 * Laboratory Activity Report JS - Reports Module
 * Uses theme.css for styling, clean event handling
 */

var testChart = null;
var statusChart = null;
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
        
        var requests = JSON.parse(localStorage.getItem('lab_requests') || '[]');
        
        // Filter by date range
        var filtered = [];
        for (var i = 0; i < requests.length; i++) {
            if (requests[i].requestDate >= fromDate && requests[i].requestDate <= toDate) {
                filtered.push(requests[i]);
            }
        }
        
        var total = filtered.length;
        var completed = 0, pending = 0, inProgress = 0;
        var revenue = 0;
        
        for (var j = 0; j < filtered.length; j++) {
            if (filtered[j].status === 'Completed') {
                completed++;
                revenue += (filtered[j].testPrice || 0);
            } else if (filtered[j].status === 'Pending') {
                pending++;
            } else if (filtered[j].status === 'In Progress') {
                inProgress++;
            }
        }
        
        document.getElementById('totalRequests').textContent = total;
        document.getElementById('completedRequests').textContent = completed;
        document.getElementById('pendingRequests').textContent = pending;
        document.getElementById('labRevenue').textContent = '₹' + revenue.toLocaleString('en-IN');
        
        // --- Test-wise Distribution (Bar Chart) ---
        var testStats = {};
        for (var k = 0; k < filtered.length; k++) {
            var testName = filtered[k].testName;
            testStats[testName] = (testStats[testName] || 0) + 1;
        }
        
        var sortedTests = [];
        var testKeys = Object.keys(testStats);
        for (var s = 0; s < testKeys.length; s++) {
            sortedTests.push({ name: testKeys[s], count: testStats[testKeys[s]] });
        }
        sortedTests.sort(function(a, b) { return b.count - a.count; });
        
        var topTests = sortedTests.slice(0, 5);
        var testLabels = [];
        var testCounts = [];
        for (var t = 0; t < topTests.length; t++) {
            testLabels.push(topTests[t].name);
            testCounts.push(topTests[t].count);
        }
        
        var ctx1 = document.getElementById('testChart')?.getContext('2d');
        if (ctx1) {
            if (testChart) { testChart.destroy(); }
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
                                    return context.raw + ' requests';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                font: { family: 'Poppins', size: 9 }
                            },
                            title: {
                                display: true,
                                text: 'Number of Requests',
                                font: { family: 'Poppins', size: 9 }
                            }
                        },
                        x: {
                            ticks: {
                                font: { family: 'Poppins', size: 9 },
                                rotation: 15,
                                maxRotation: 15
                            }
                        }
                    }
                }
            });
        }
        
        // --- Status Breakdown (Doughnut Chart) ---
        var ctx2 = document.getElementById('statusChart')?.getContext('2d');
        if (ctx2) {
            if (statusChart) { statusChart.destroy(); }
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
                                    var total = completed + pending + inProgress;
                                    var percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return label + ': ' + value + ' (' + percent + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // --- Popular Tests Table ---
        var tbody = document.getElementById('popularTestsTable');
        if (tbody) {
            if (sortedTests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-flask" style="font-size:1.5rem; margin-bottom:0.5rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No data available for selected period</p></td></tr>';
            } else {
                var html = '';
                for (var p = 0; p < sortedTests.length; p++) {
                    var test = sortedTests[p].name;
                    var count = sortedTests[p].count;
                    var completedCount = 0;
                    var testRevenue = 0;
                    for (var r = 0; r < filtered.length; r++) {
                        if (filtered[r].testName === test) {
                            if (filtered[r].status === 'Completed') {
                                completedCount++;
                                testRevenue += (filtered[r].testPrice || 0);
                            }
                        }
                    }
                    var completionRate = count > 0 ? Math.round((completedCount / count) * 100) : 0;
                    
                    var trendColor = '';
                    var trendText = '';
                    if (completionRate >= 80) {
                        trendColor = 'background:#10b981;';
                        trendText = 'High';
                    } else if (completionRate >= 50) {
                        trendColor = 'background:#f59e0b;';
                        trendText = 'Medium';
                    } else {
                        trendColor = 'background:#ef4444;';
                        trendText = 'Low';
                    }
                    
                    html += '<tr class="report-row">';
                    html += '<td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem;">' + esc(test) + '</td>';
                    html += '<td style="text-align:right;"><span style="display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:rgba(168,196,154,0.1); color:var(--color-sage); font-weight:var(--font-weight-semibold); font-size:0.875rem;">' + count + '</span></td>';
                    html += '<td style="text-align:right; color:var(--color-brown-300); font-size:0.8125rem;">' + completedCount + ' <span style="color:#10b981; font-size:0.6875rem;">(' + completionRate + '%)</span></td>';
                    html += '<td style="text-align:right; font-weight:var(--font-weight-semibold); color:var(--color-brown-700); font-size:0.8125rem;">₹' + testRevenue.toLocaleString('en-IN') + '</td>';
                    html += '<td><div style="display:flex; align-items:center; gap:0.5rem;"><div style="flex:1; background:var(--bg-muted); border-radius:var(--radius-full); height:6px; max-width:6rem; overflow:hidden;"><div class="trend-bar" style="width:' + completionRate + '%; ' + trendColor + '"></div></div><span style="font-size:0.625rem; font-weight:var(--font-weight-medium); color:' + (completionRate >= 80 ? '#10b981' : completionRate >= 50 ? '#f59e0b' : '#ef4444') + ';">' + trendText + '</span></div></td>';
                    html += '</tr>';
                }
                tbody.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Error loading lab activity data:', error);
        showToast('Error loading lab activity data', 'error');
    }
}

// ─── Init ────────────────────────────────────────────

function initLabReportsModule() {
    if (isInitialized) return;
    isInitialized = true;
    setDefaultDates();
    loadData();
    
    document.getElementById('applyFilter').addEventListener('click', loadData);
    document.getElementById('printReport').addEventListener('click', function() {
        window.print();
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkSidebar = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkSidebar);
            setTimeout(initLabReportsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkSidebar);
        initLabReportsModule();
    }, 3000);
});