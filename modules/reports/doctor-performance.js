/**
 * Doctor Performance Module
 * MedFlow Reports - Doctor-wise Analytics
 * Uses theme.css for styling, clean event handling
 */

var doctorChart = null;
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

// ─── Rating Stars ──────────────────────────────────

function generateRatingStars(rating) {
    var fullStars = Math.floor(rating);
    var hasHalfStar = rating % 1 >= 0.5;
    var emptyStars = 5 - Math.ceil(rating);
    var stars = '';
    for (var i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star rating-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt rating-star"></i>';
    }
    for (var j = 0; j < emptyStars; j++) {
        stars += '<i class="far fa-star rating-star-empty"></i>';
    }
    return stars;
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

// ─── Reset Dates ──────────────────────────────────

function resetDates() {
    var today = new Date();
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById('fromDate').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('toDate').value = today.toISOString().split('T')[0];
    loadData();
    showToast('Date range reset to last 30 days', 'info');
}

// ─── Load Data ──────────────────────────────────────

function loadData() {
    try {
        // Load doctors
        var doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        if (doctors.length === 0) {
            doctors = [
                { id: 1, name: 'Dr. Anjali Nair', specialization: 'Cardiology', email: 'anjali.nair@medflow.com', phone: '9876543201', rating: 4.8 },
                { id: 2, name: 'Dr. Vikram Singh', specialization: 'Neurology', email: 'vikram.singh@medflow.com', phone: '9876543202', rating: 4.6 },
                { id: 3, name: 'Dr. Sneha Joshi', specialization: 'Pediatrics', email: 'sneha.joshi@medflow.com', phone: '9876543203', rating: 4.9 },
                { id: 4, name: 'Dr. Rajiv Menon', specialization: 'Orthopedics', email: 'rajiv.menon@medflow.com', phone: '9876543204', rating: 4.5 },
                { id: 5, name: 'Dr. Neha Gupta', specialization: 'Dermatology', email: 'neha.gupta@medflow.com', phone: '9876543205', rating: 4.7 },
                { id: 6, name: 'Dr. Sanjay Kulkarni', specialization: 'General Medicine', email: 'sanjay.kulkarni@medflow.com', phone: '9876543206', rating: 4.4 }
            ];
            localStorage.setItem('hms_doctors', JSON.stringify(doctors));
        }
        
        // Load consultations
        var consultations = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
        
        // Create sample consultations if none exist
        if (consultations.length === 0) {
            var sampleConsultations = [];
            var startDate = new Date('2026-05-01');
            var endDate = new Date('2026-06-10');
            var patientNames = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Verma', 'Vikram Singh'];
            
            for (var i = 0; i < 50; i++) {
                var randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
                var randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
                sampleConsultations.push({
                    id: i + 1,
                    patientId: Math.floor(Math.random() * 20) + 1,
                    patientName: patientNames[Math.floor(Math.random() * patientNames.length)],
                    doctorId: randomDoctor.id,
                    doctorName: randomDoctor.name,
                    date: randomDate.toISOString().split('T')[0],
                    diagnosis: 'Sample diagnosis',
                    prescription: 'Sample prescription'
                });
            }
            consultations = sampleConsultations;
            localStorage.setItem('hms_consultations', JSON.stringify(consultations));
        }
        
        // Load appointments
        var appointments = JSON.parse(localStorage.getItem('hms_appointments') || '[]');
        
        // Load invoices
        var invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
        
        // Create sample invoices if none exist
        if (invoices.length === 0 && consultations.length > 0) {
            var sampleInvoices = [];
            for (var j = 0; j < consultations.length; j++) {
                var c = consultations[j];
                var amount = [500, 800, 1000, 1200, 1500, 2000][Math.floor(Math.random() * 6)];
                sampleInvoices.push({
                    id: j + 1,
                    type: 'OPD',
                    appointmentId: j + 1,
                    patientId: c.patientId,
                    patientName: c.patientName,
                    total: amount,
                    amount: amount,
                    status: 'Paid',
                    date: c.date
                });
            }
            invoices = sampleInvoices;
            localStorage.setItem('hms_invoices', JSON.stringify(invoices));
        }
        
        // Get date range
        var fromDate = document.getElementById('fromDate').value;
        var toDate = document.getElementById('toDate').value;
        
        // Update total doctors
        document.getElementById('totalDoctors').textContent = doctors.length;
        
        // Filter consultations by date
        var filteredConsultations = consultations;
        if (fromDate && toDate) {
            filteredConsultations = [];
            for (var k = 0; k < consultations.length; k++) {
                if (consultations[k].date >= fromDate && consultations[k].date <= toDate) {
                    filteredConsultations.push(consultations[k]);
                }
            }
        }
        document.getElementById('totalConsultations').textContent = filteredConsultations.length;
        
        // Build doctor statistics
        var doctorStats = {};
        for (var d = 0; d < doctors.length; d++) {
            var doc = doctors[d];
            doctorStats[doc.id] = {
                id: doc.id,
                name: doc.name,
                specialization: doc.specialization,
                consultations: 0,
                revenue: 0,
                rating: doc.rating || 4.5
            };
        }
        
        // Count consultations per doctor
        for (var c2 = 0; c2 < filteredConsultations.length; c2++) {
            var consult = filteredConsultations[c2];
            if (doctorStats[consult.doctorId]) {
                doctorStats[consult.doctorId].consultations++;
            }
        }
        
        // Filter invoices by date
        var filteredInvoices = invoices;
        if (fromDate && toDate) {
            filteredInvoices = [];
            for (var i2 = 0; i2 < invoices.length; i2++) {
                if (invoices[i2].date >= fromDate && invoices[i2].date <= toDate) {
                    filteredInvoices.push(invoices[i2]);
                }
            }
        }
        
        // Calculate revenue per doctor
        for (var i3 = 0; i3 < filteredInvoices.length; i3++) {
            var inv = filteredInvoices[i3];
            if (inv.type === 'OPD' && inv.status === 'Paid') {
                var appointment = null;
                for (var a = 0; a < appointments.length; a++) {
                    if (appointments[a].id === inv.appointmentId) {
                        appointment = appointments[a];
                        break;
                    }
                }
                if (appointment && doctorStats[appointment.doctorId]) {
                    doctorStats[appointment.doctorId].revenue += (inv.total || inv.amount || 0);
                }
            }
        }
        
        // Calculate total revenue
        var totalRevenue = 0;
        var doctorIds = Object.keys(doctorStats);
        for (var ds = 0; ds < doctorIds.length; ds++) {
            totalRevenue += doctorStats[doctorIds[ds]].revenue;
        }
        document.getElementById('doctorRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
        
        var avgRevenue = doctors.length ? Math.round(totalRevenue / doctors.length) : 0;
        document.getElementById('avgPerDoctor').textContent = '₹' + avgRevenue.toLocaleString('en-IN');
        
        // Update Chart
        var chartLabels = [];
        var chartData = [];
        var chartColors = ['#a8c49a', '#8aae7a', '#d4a853', '#b8aa9a', '#d48c8c', '#7da06c', '#c49a6c', '#9a8e82'];
        var sortedStats = [];
        var statsKeys = Object.keys(doctorStats);
        for (var sk = 0; sk < statsKeys.length; sk++) {
            sortedStats.push(doctorStats[statsKeys[sk]]);
        }
        sortedStats.sort(function(a, b) { return b.consultations - a.consultations; });
        
        for (var ss = 0; ss < sortedStats.length; ss++) {
            var nameParts = sortedStats[ss].name.split(' ');
            chartLabels.push(nameParts[1] || sortedStats[ss].name);
            chartData.push(sortedStats[ss].consultations);
        }
        
        var ctx = document.getElementById('doctorChart')?.getContext('2d');
        if (ctx) {
            if (doctorChart) { doctorChart.destroy(); }
            doctorChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Consultations',
                        data: chartData,
                        backgroundColor: chartColors.slice(0, chartLabels.length),
                        borderRadius: 8,
                        barPercentage: 0.7,
                        categoryPercentage: 0.8
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
                                    return 'Consultations: ' + context.raw;
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
                            }
                        },
                        x: {
                            ticks: {
                                font: { family: 'Poppins', size: 9 },
                                rotation: 0
                            }
                        }
                    }
                }
            });
        }
        
        // Update Table
        var tbody = document.getElementById('doctorTable');
        if (tbody) {
            sortedStats.sort(function(a, b) { return b.consultations - a.consultations; });
            if (sortedStats.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-user-md" style="font-size:1.5rem; margin-bottom:0.5rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No data available for selected period</p></td></tr>';
            } else {
                var html = '';
                for (var ss2 = 0; ss2 < sortedStats.length; ss2++) {
                    var doc = sortedStats[ss2];
                    html += '<tr class="dashboard-table-row">';
                    html += '<td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem;">' + esc(doc.name) + '</td>';
                    html += '<td style="color:var(--color-brown-300); font-size:0.8125rem;">' + esc(doc.specialization) + '</td>';
                    html += '<td style="text-align:center; color:var(--color-sage-dark); font-weight:var(--font-weight-medium);">' + doc.consultations + '</td>';
                    html += '<td style="text-align:right; color:var(--color-gold); font-weight:var(--font-weight-medium);">₹' + doc.revenue.toLocaleString('en-IN') + '</td>';
                    html += '<td style="text-align:center;">' + generateRatingStars(doc.rating) + '</td>';
                    html += '</tr>';
                }
                tbody.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Error loading doctor performance data:', error);
        showToast('Error loading doctor performance data', 'error');
    }
}

// ─── Print Report ──────────────────────────────────

function printReport() {
    var mainContent = document.querySelector('main');
    var clone = mainContent.cloneNode(true);
    
    // Replace canvas with images
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
            .stat-card { break-inside: avoid; margin-bottom: 10px; }
            .card-white { break-inside: avoid; }
            .dashboard-table-row { break-inside: avoid; }
            .chart-container { height: 300px; }
            canvas { max-height: 300px; }
        }
        body { font-family: 'Poppins', Arial, sans-serif; background: white; }
        .stat-card { border: 1px solid #f0e8e0; padding: 16px; border-radius: 12px; }
        .card-white { border: 1px solid #f0e8e0; border-radius: 12px; padding: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #f0e8e0; text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .rating-star { color: #d4a853; }
        .rating-star-empty { color: #d4c9bc; }
    `;
    
    var fromDate = document.getElementById('fromDate').value;
    var toDate = document.getElementById('toDate').value;
    
    var printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>Doctor Performance Report - MedFlow</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">' + style.outerHTML + '</head><body style="padding:40px; max-width:1200px; margin:0 auto;"><div style="text-align:center; border-bottom:2px solid #a8c49a; padding-bottom:20px; margin-bottom:30px;"><h1 style="color:#5a4a3a; margin:0;">MedFlow Hospital</h1><p style="color:#9a8e82; margin:5px 0;">Doctor Performance Report</p><p style="color:#b8aa9a; font-size:12px;">Period: ' + fromDate + ' to ' + toDate + '</p><p style="color:#b8aa9a; font-size:12px;">Generated on: ' + new Date().toLocaleString('en-IN') + '</p></div>' + clone.innerHTML + '<div style="text-align:center; margin-top:50px; padding-top:20px; border-top:1px solid #f0e8e0; color:#b8aa9a; font-size:12px;"><p>MedFlow Hospital - www.medflow.com</p></div></body></html>');
        printWindow.document.close();
        printWindow.print();
        showToast('Opening print dialog...', 'success');
    } else {
        showToast('Please allow popups to print', 'error');
    }
}

// ─── Init ────────────────────────────────────────────

function initDoctorPerformanceModule() {
    if (isInitialized) return;
    isInitialized = true;
    setDefaultDates();
    loadData();
    
    document.getElementById('applyFilter').addEventListener('click', loadData);
    document.getElementById('printReport').addEventListener('click', printReport);
    document.getElementById('resetFilter').addEventListener('click', resetDates);
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkSidebar);
            setTimeout(initDoctorPerformanceModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initDoctorPerformanceModule();
    }, 3000);
});