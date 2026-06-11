/**
 * Patient Reports Module
 * MedFlow Reports - Patient Statistics and Analytics
 * Matching Executive Dashboard UI/UX - Indian Context
 */

let patientTrendChart, genderChart;

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

// Calculate age from date of birth
function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Get age group
function getAgeGroup(age) {
    if (age === null) return 'Unknown';
    if (age <= 18) return '0-18';
    if (age <= 35) return '19-35';
    if (age <= 50) return '36-50';
    if (age <= 65) return '51-65';
    return '65+';
}

// Load all data
function loadData() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    
    // Load patients
    let patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
    
    // Create sample Indian patients if none exist
    if (patients.length === 0) {
        const samplePatients = [
            { id: 1, fullName: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh.kumar@email.com', gender: 'Male', dob: '1978-05-15', bloodGroup: 'O+', address: 'Mumbai', createdAt: '2026-05-01' },
            { id: 2, fullName: 'Priya Sharma', phone: '9876543211', email: 'priya.sharma@email.com', gender: 'Female', dob: '1990-08-22', bloodGroup: 'A+', address: 'Delhi', createdAt: '2026-05-05' },
            { id: 3, fullName: 'Amit Patel', phone: '9876543212', email: 'amit.patel@email.com', gender: 'Male', dob: '1985-03-10', bloodGroup: 'B+', address: 'Ahmedabad', createdAt: '2026-05-10' },
            { id: 4, fullName: 'Sunita Verma', phone: '9876543213', email: 'sunita.verma@email.com', gender: 'Female', dob: '1970-11-30', bloodGroup: 'AB+', address: 'Lucknow', createdAt: '2026-05-15' },
            { id: 5, fullName: 'Vikram Singh', phone: '9876543214', email: 'vikram.singh@email.com', gender: 'Male', dob: '1988-07-18', bloodGroup: 'O-', address: 'Jaipur', createdAt: '2026-05-20' },
            { id: 6, fullName: 'Neha Gupta', phone: '9876543215', email: 'neha.gupta@email.com', gender: 'Female', dob: '1995-01-25', bloodGroup: 'A-', address: 'Pune', createdAt: '2026-05-25' },
            { id: 7, fullName: 'Ramesh Iyer', phone: '9876543216', email: 'ramesh.iyer@email.com', gender: 'Male', dob: '1965-09-12', bloodGroup: 'B-', address: 'Chennai', createdAt: '2026-06-01' },
            { id: 8, fullName: 'Kavya Reddy', phone: '9876543217', email: 'kavya.reddy@email.com', gender: 'Female', dob: '2000-04-05', bloodGroup: 'O+', address: 'Hyderabad', createdAt: '2026-06-05' },
            { id: 9, fullName: 'Sanjay Joshi', phone: '9876543218', email: 'sanjay.joshi@email.com', gender: 'Male', dob: '1975-12-20', bloodGroup: 'AB-', address: 'Nagpur', createdAt: '2026-06-08' },
            { id: 10, fullName: 'Anjali Nair', phone: '9876543219', email: 'anjali.nair@email.com', gender: 'Female', dob: '1992-06-14', bloodGroup: 'A+', address: 'Kochi', createdAt: '2026-06-10' }
        ];
        patients = samplePatients;
        localStorage.setItem('hms_patients', JSON.stringify(patients));
    }
    
    // Load consultations
    let consultations = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
    
    // Create sample consultations if none exist
    if (consultations.length === 0 && patients.length > 0) {
        const sampleConsultations = [];
        const startDate = new Date('2026-05-01');
        const endDate = new Date('2026-06-10');
        
        for (let i = 0; i < 60; i++) {
            const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
            const randomPatient = patients[Math.floor(Math.random() * patients.length)];
            sampleConsultations.push({
                id: i + 1,
                patientId: randomPatient.id,
                patientName: randomPatient.fullName,
                doctorId: Math.floor(Math.random() * 6) + 1,
                doctorName: ['Dr. Anjali Nair', 'Dr. Vikram Singh', 'Dr. Sneha Joshi', 'Dr. Rajiv Menon', 'Dr. Neha Gupta', 'Dr. Sanjay Kulkarni'][Math.floor(Math.random() * 6)],
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
    
    // Load OPD visits
    let opdVisits = JSON.parse(localStorage.getItem('hms_opd') || '[]');
    
    // --- Calculate Statistics ---
    
    // Total patients
    const totalPatientsEl = document.getElementById('totalPatients');
    if (totalPatientsEl) totalPatientsEl.innerText = patients.length;
    
    // New patients in selected period
    const newPatients = patients.filter(p => {
        const createdDate = p.createdAt ? p.createdAt.split('T')[0] : p.createdAt;
        return createdDate && createdDate >= fromDate && createdDate <= toDate;
    }).length;
    
    const newPatientsEl = document.getElementById('newPatients');
    if (newPatientsEl) newPatientsEl.innerText = newPatients;
    
    // Gender ratio
    const maleCount = patients.filter(p => p.gender === 'Male').length;
    const femaleCount = patients.filter(p => p.gender === 'Female').length;
    const otherCount = patients.filter(p => p.gender !== 'Male' && p.gender !== 'Female').length;
    
    const genderRatioEl = document.getElementById('genderRatio');
    if (genderRatioEl) genderRatioEl.innerText = `${maleCount}:${femaleCount}`;
    
    // Average age
    let totalAge = 0;
    let validAgeCount = 0;
    patients.forEach(p => {
        const age = calculateAge(p.dob);
        if (age !== null) {
            totalAge += age;
            validAgeCount++;
        }
    });
    const avgAge = validAgeCount > 0 ? Math.round(totalAge / validAgeCount) : 0;
    const avgAgeEl = document.getElementById('avgAge');
    if (avgAgeEl) avgAgeEl.innerText = avgAge;
    
    // --- Patient Trend Chart (Last 30 days or within date range) ---
    const dateRange = [];
    const patientCounts = [];
    
    // Determine date range for chart (max 30 days from date range)
    let chartStartDate = new Date(fromDate);
    let chartEndDate = new Date(toDate);
    const daysDiff = Math.ceil((chartEndDate - chartStartDate) / (1000 * 60 * 60 * 24));
    
    // Limit to last 30 days for better visualization
    let actualStartDate = chartStartDate;
    if (daysDiff > 30) {
        actualStartDate = new Date(chartEndDate);
        actualStartDate.setDate(actualStartDate.getDate() - 30);
    }
    
    for (let d = new Date(actualStartDate); d <= chartEndDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dateRange.push(dateStr.substring(5)); // MM-DD format
        const count = patients.filter(p => {
            const created = p.createdAt ? p.createdAt.split('T')[0] : p.createdAt;
            return created === dateStr;
        }).length;
        patientCounts.push(count);
    }
    
    const ctx1 = document.getElementById('patientTrendChart')?.getContext('2d');
    if (ctx1) {
        if (patientTrendChart) patientTrendChart.destroy();
        patientTrendChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: dateRange,
                datasets: [{
                    label: 'New Patients',
                    data: patientCounts,
                    borderColor: '#a8c49a',
                    backgroundColor: 'rgba(168, 196, 154, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8aae7a',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
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
                            font: { family: 'Poppins', size: 11 },
                            color: '#9a8e82'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#5a4a3a',
                        bodyColor: '#9a8e82',
                        borderColor: '#f0e8e0',
                        borderWidth: 1
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
                            font: { family: 'Poppins', size: 9 },
                            color: '#b8aa9a',
                            rotation: 45,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    // --- Gender Distribution Chart ---
    const ctx2 = document.getElementById('genderChart')?.getContext('2d');
    if (ctx2) {
        if (genderChart) genderChart.destroy();
        genderChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Male', 'Female', 'Other'],
                datasets: [{
                    data: [maleCount, femaleCount, otherCount],
                    backgroundColor: ['#a8c49a', '#d4a853', '#b8aa9a'],
                    borderWidth: 0,
                    hoverOffset: 10
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
                            color: '#9a8e82'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = maleCount + femaleCount + otherCount;
                                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // --- Age Group Distribution ---
    const ageGroups = {
        '0-18': 0,
        '19-35': 0,
        '36-50': 0,
        '51-65': 0,
        '65+': 0,
        'Unknown': 0
    };
    
    patients.forEach(p => {
        const age = calculateAge(p.dob);
        const group = getAgeGroup(age);
        ageGroups[group]++;
    });
    
    const ageGroupDiv = document.getElementById('ageGroupTable');
    if (ageGroupDiv) {
        const totalPatientsWithAge = patients.length;
        ageGroupDiv.innerHTML = Object.entries(ageGroups)
            .filter(([group]) => group !== 'Unknown' || ageGroups['Unknown'] > 0)
            .map(([group, count]) => {
                const percentage = totalPatientsWithAge > 0 ? ((count / totalPatientsWithAge) * 100).toFixed(1) : 0;
                return `
                    <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <div class="w-full md:w-32">
                            <span class="text-sm text-[#5a4a3a] font-medium">${group} years</span>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-3">
                                <span class="text-sm font-semibold text-[#8aae7a] w-12">${count}</span>
                                <div class="flex-1 bg-[#f0ebe4] rounded-full h-2">
                                    <div class="progress-bar" style="width: ${percentage}%"></div>
                                </div>
                                <span class="text-xs text-[#b8aa9a] w-12">${percentage}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
    }
    
    // --- Most Frequent Patients ---
    const visitCount = {};
    
    // Count consultations
    consultations.forEach(c => {
        if (c.patientId && fromDate && toDate && c.date >= fromDate && c.date <= toDate) {
            visitCount[c.patientId] = (visitCount[c.patientId] || 0) + 1;
        } else if (c.patientId) {
            visitCount[c.patientId] = (visitCount[c.patientId] || 0) + 1;
        }
    });
    
    // Count appointments
    appointments.forEach(a => {
        if (a.patientId && fromDate && toDate && a.date >= fromDate && a.date <= toDate) {
            visitCount[a.patientId] = (visitCount[a.patientId] || 0) + 1;
        } else if (a.patientId) {
            visitCount[a.patientId] = (visitCount[a.patientId] || 0) + 1;
        }
    });
    
    // Count OPD visits
    opdVisits.forEach(o => {
        if (o.patientId && fromDate && toDate && o.date >= fromDate && o.date <= toDate) {
            visitCount[o.patientId] = (visitCount[o.patientId] || 0) + 1;
        } else if (o.patientId) {
            visitCount[o.patientId] = (visitCount[o.patientId] || 0) + 1;
        }
    });
    
    // Build frequent patients list
    const frequentPatients = Object.entries(visitCount)
        .map(([id, visits]) => {
            const patient = patients.find(p => p.id === parseInt(id));
            if (!patient) return null;
            
            // Find last visit date
            let lastVisit = '-';
            const allVisits = [
                ...consultations.filter(c => c.patientId === patient.id),
                ...appointments.filter(a => a.patientId === patient.id),
                ...opdVisits.filter(o => o.patientId === patient.id)
            ];
            if (allVisits.length > 0) {
                const lastVisitDate = new Date(Math.max(...allVisits.map(v => new Date(v.date))));
                lastVisit = lastVisitDate.toISOString().split('T')[0];
            }
            
            return {
                name: patient.fullName,
                phone: patient.phone,
                visits: visits,
                lastVisit: lastVisit
            };
        })
        .filter(p => p !== null)
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
    
    const tbody = document.getElementById('frequentPatientsTable');
    if (tbody) {
        if (frequentPatients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-[#d4c9bc] text-sm">No patient visit data available</div></tr>`;
        } else {
            tbody.innerHTML = frequentPatients.map(p => `
                <tr class="dashboard-table-row">
                    <td class="px-4 py-3 text-sm font-medium text-[#5a4a3a]">${escapeHtml(p.name)}</div>
                    <td class="px-4 py-3 text-sm text-[#9a8e82]">${escapeHtml(p.phone)}</div>
                    <td class="px-4 py-3 text-sm text-[#8aae7a] text-center font-semibold">${p.visits}</div>
                    <td class="px-4 py-3 text-sm text-[#9a8e82]">${p.lastVisit}</div>
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
            body { margin: 0; padding: 20px; background: white; }
            .no-print { display: none !important; }
            .stat-card, .content-card { break-inside: avoid; page-break-inside: avoid; margin-bottom: 20px; }
            .dashboard-table-row { break-inside: avoid; }
            .chart-container { height: 250px; }
            canvas { max-height: 250px; }
            .progress-bar { background: #a8c49a; }
        }
        body { font-family: 'Poppins', Arial, sans-serif; background: white; }
        .stat-card { border: 1px solid #f0e8e0; padding: 16px; border-radius: 12px; margin-bottom: 10px; }
        .content-card { border: 1px solid #f0e8e0; padding: 16px; border-radius: 12px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #f0e8e0; text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .border-l-4 { border-left-width: 4px; }
    `;
    
    // Remove canvas and recreate as images for print
    const canvasElements = printContent.querySelectorAll('canvas');
    canvasElements.forEach(canvas => {
        const container = canvas.parentElement;
        if (container) {
            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            container.replaceChild(img, canvas);
        }
    });
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Patient Reports - MedFlow Hospital</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                ${style.outerHTML}
            </head>
            <body style="padding: 40px; max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; border-bottom: 2px solid #a8c49a; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #5a4a3a; margin: 0;">MedFlow Hospital</h1>
                    <p style="color: #9a8e82; margin: 5px 0;">Patient Reports & Analytics</p>
                    <p style="color: #b8aa9a; font-size: 12px;">
                        Period: ${document.getElementById('fromDate').value} to ${document.getElementById('toDate').value}
                    </p>
                    <p style="color: #b8aa9a; font-size: 12px;">
                        Generated on: ${new Date().toLocaleString('en-IN')}
                    </p>
                </div>
                ${printContent.innerHTML}
                <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #f0e8e0; color: #b8aa9a; font-size: 12px;">
                    <p>MedFlow Hospital - www.medflow.com</p>
                    <p>This is a computer-generated report</p>
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