/**
 * Doctor Performance Module
 * MedFlow Reports - Doctor-wise Analytics
 * Matching Executive Dashboard UI/UX - Indian Context (₹)
 */

let doctorChart;

// Helper: Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Toast notification
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
    toast.innerHTML = `<i class="fas ${icons[type]} text-sm"></i><span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

// Generate rating stars
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star rating-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt rating-star"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star rating-star-empty"></i>';
    }
    return stars;
}

// Set default dates (last 30 days)
function setDefaultDates() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    
    if (fromDateInput && !fromDateInput.value) {
        fromDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    }
    if (toDateInput && !toDateInput.value) {
        toDateInput.value = today.toISOString().split('T')[0];
    }
}

// Reset to last 30 days
function resetDates() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById('fromDate').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('toDate').value = today.toISOString().split('T')[0];
    loadData();
    showToast('Date range reset to last 30 days', 'info');
}

// Load doctor data
function loadData() {
    // Load doctors from localStorage
    let doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
    
    // If no doctors exist, create sample Indian doctors
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
    let consultations = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
    
    // Create sample consultations if none exist
    if (consultations.length === 0) {
        const sampleConsultations = [];
        const startDate = new Date('2026-05-01');
        const endDate = new Date('2026-06-10');
        
        for (let i = 0; i < 50; i++) {
            const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
            const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
            sampleConsultations.push({
                id: i + 1,
                patientId: Math.floor(Math.random() * 20) + 1,
                patientName: ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Verma', 'Vikram Singh'][Math.floor(Math.random() * 5)],
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
    let appointments = JSON.parse(localStorage.getItem('hms_appointments') || '[]');
    
    // Load invoices
    let invoices = JSON.parse(localStorage.getItem('hms_invoices') || '[]');
    
    // Create sample invoices if none exist
    if (invoices.length === 0 && consultations.length > 0) {
        const sampleInvoices = [];
        consultations.forEach((c, index) => {
            const amount = [500, 800, 1000, 1200, 1500, 2000][Math.floor(Math.random() * 6)];
            sampleInvoices.push({
                id: index + 1,
                type: 'OPD',
                appointmentId: index + 1,
                patientId: c.patientId,
                patientName: c.patientName,
                total: amount,
                amount: amount,
                status: 'Paid',
                date: c.date
            });
        });
        invoices = sampleInvoices;
        localStorage.setItem('hms_invoices', JSON.stringify(invoices));
    }
    
    // Get date range
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    
    // Update total doctors count
    const totalDoctorsEl = document.getElementById('totalDoctors');
    if (totalDoctorsEl) totalDoctorsEl.innerText = doctors.length;
    
    // Filter consultations by date
    let filteredConsultations = consultations;
    if (fromDate && toDate) {
        filteredConsultations = consultations.filter(c => c.date >= fromDate && c.date <= toDate);
    }
    
    const totalConsultationsEl = document.getElementById('totalConsultations');
    if (totalConsultationsEl) totalConsultationsEl.innerText = filteredConsultations.length;
    
    // Build doctor statistics
    const doctorStats = {};
    doctors.forEach(doc => {
        doctorStats[doc.id] = {
            id: doc.id,
            name: doc.name,
            specialization: doc.specialization,
            consultations: 0,
            revenue: 0,
            rating: doc.rating || 4.5
        };
    });
    
    // Count consultations per doctor
    filteredConsultations.forEach(c => {
        if (doctorStats[c.doctorId]) {
            doctorStats[c.doctorId].consultations++;
        }
    });
    
    // Filter invoices by date
    let filteredInvoices = invoices;
    if (fromDate && toDate) {
        filteredInvoices = invoices.filter(i => i.date >= fromDate && i.date <= toDate);
    }
    
    // Calculate revenue per doctor
    filteredInvoices.forEach(inv => {
        if (inv.type === 'OPD' && inv.status === 'Paid') {
            // Find appointment to get doctorId
            const appointment = appointments.find(a => a.id === inv.appointmentId);
            if (appointment && doctorStats[appointment.doctorId]) {
                doctorStats[appointment.doctorId].revenue += (inv.total || inv.amount || 0);
            }
            // Also try to match by patient if appointment not found
            else if (inv.doctorId && doctorStats[inv.doctorId]) {
                doctorStats[inv.doctorId].revenue += (inv.total || inv.amount || 0);
            }
        }
    });
    
    // Calculate total revenue
    let totalRevenue = 0;
    Object.values(doctorStats).forEach(d => {
        totalRevenue += d.revenue;
    });
    
    const doctorRevenueEl = document.getElementById('doctorRevenue');
    if (doctorRevenueEl) doctorRevenueEl.innerText = '₹' + totalRevenue.toLocaleString('en-IN');
    
    const avgPerDoctorEl = document.getElementById('avgPerDoctor');
    const avgRevenue = doctors.length ? Math.round(totalRevenue / doctors.length) : 0;
    if (avgPerDoctorEl) avgPerDoctorEl.innerText = '₹' + avgRevenue.toLocaleString('en-IN');
    
    // Update Chart
    const chartLabels = Object.values(doctorStats).map(d => d.name.split(' ')[1] || d.name);
    const chartData = Object.values(doctorStats).map(d => d.consultations);
    const chartColors = ['#a8c49a', '#8aae7a', '#d4a853', '#b8aa9a', '#d48c8c', '#7da06c', '#c49a6c', '#9a8e82'];
    
    const ctx = document.getElementById('doctorChart')?.getContext('2d');
    if (ctx) {
        if (doctorChart) {
            doctorChart.destroy();
        }
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
                            font: { family: 'Poppins', size: 11 },
                            color: '#9a8e82'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#5a4a3a',
                        bodyColor: '#9a8e82',
                        borderColor: '#f0e8e0',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `Consultations: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f0e8e0' },
                        ticks: { 
                            stepSize: 1,
                            font: { family: 'Poppins', size: 10 },
                            color: '#b8aa9a'
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { 
                            font: { family: 'Poppins', size: 10 },
                            color: '#b8aa9a',
                            rotation: 0
                        }
                    }
                }
            }
        });
    }
    
    // Update Table
    const tbody = document.getElementById('doctorTable');
    if (tbody) {
        const sortedDoctors = Object.values(doctorStats).sort((a, b) => b.consultations - a.consultations);
        
        if (sortedDoctors.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-[#d4c9bc] text-sm">No data available for selected period</td></tr>`;
        } else {
            tbody.innerHTML = sortedDoctors.map(doc => `
                <tr class="dashboard-table-row">
                    <td class="px-4 py-3 text-sm font-medium text-[#5a4a3a]">${escapeHtml(doc.name)}</td>
                    <td class="px-4 py-3 text-sm text-[#9a8e82]">${escapeHtml(doc.specialization)}</td>
                    <td class="px-4 py-3 text-sm text-[#8aae7a] text-center font-medium">${doc.consultations}</td>
                    <td class="px-4 py-3 text-sm text-[#d4a853] text-right font-medium">₹${doc.revenue.toLocaleString('en-IN')}</td>
                    <td class="px-4 py-3 text-center">${generateRatingStars(doc.rating)}</td>
                </tr>
            `).join('');
        }
    }
}

// Print report
function printReport() {
    const printContent = document.querySelector('main').cloneNode(true);
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
            .stat-card, .content-card { break-inside: avoid; page-break-inside: avoid; }
            .dashboard-table-row { break-inside: avoid; }
            .chart-container { height: 300px; }
            canvas { max-height: 300px; }
        }
        body { font-family: 'Poppins', Arial, sans-serif; background: white; }
        .stat-card { border: 1px solid #f0e8e0; margin-bottom: 10px; }
        .content-card { border: 1px solid #f0e8e0; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #f0e8e0; text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Doctor Performance Report - MedFlow</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                ${style.outerHTML}
            </head>
            <body style="padding: 40px; max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; border-bottom: 2px solid #a8c49a; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #5a4a3a; margin: 0;">MedFlow Hospital</h1>
                    <p style="color: #9a8e82; margin: 5px 0;">Doctor Performance Report</p>
                    <p style="color: #b8aa9a; font-size: 12px;">Period: ${document.getElementById('fromDate').value} to ${document.getElementById('toDate').value}</p>
                    <p style="color: #b8aa9a; font-size: 12px;">Generated on: ${new Date().toLocaleString('en-IN')}</p>
                </div>
                ${printContent.innerHTML}
                <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #f0e8e0; color: #b8aa9a; font-size: 12px;">
                    <p>MedFlow Hospital - www.medflow.com</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        showToast('Opening print dialog...', 'success');
    } else {
        showToast('Please allow popups to print', 'error');
    }
}

// Initialize
function init() {
    setDefaultDates();
    loadData();
    
    const applyFilterBtn = document.getElementById('applyFilter');
    const printReportBtn = document.getElementById('printReport');
    const resetFilterBtn = document.getElementById('resetFilter');
    
    if (applyFilterBtn) applyFilterBtn.addEventListener('click', () => loadData());
    if (printReportBtn) printReportBtn.addEventListener('click', printReport);
    if (resetFilterBtn) resetFilterBtn.addEventListener('click', resetDates);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);