/**
 * Bed Occupancy Module
 * MedFlow Reports - Bed Utilization Analytics
 * Matching Executive Dashboard UI/UX - Indian Context
 */

let wardChart, statusChart;

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

// Load all data
function loadData() {
    // Load wards
    let wards = JSON.parse(localStorage.getItem('wards') || '[]');
    
    // Create sample Indian wards if none exist
    if (wards.length === 0) {
        wards = [
            { id: 1, name: 'General Ward', code: 'GEN', capacity: 40, floor: 1 },
            { id: 2, name: 'Private Ward', code: 'PRI', capacity: 20, floor: 2 },
            { id: 3, name: 'ICU', code: 'ICU', capacity: 15, floor: 1 },
            { id: 4, name: 'Cardiac Care Unit (CCU)', code: 'CCU', capacity: 10, floor: 2 },
            { id: 5, name: 'Pediatric Ward', code: 'PED', capacity: 25, floor: 1 },
            { id: 6, name: 'Maternity Ward', code: 'MAT', capacity: 20, floor: 2 },
            { id: 7, name: 'Orthopedic Ward', code: 'ORT', capacity: 20, floor: 3 },
            { id: 8, name: 'Neurology Ward', code: 'NEU', capacity: 15, floor: 3 }
        ];
        localStorage.setItem('wards', JSON.stringify(wards));
    }
    
    // Load beds
    let beds = JSON.parse(localStorage.getItem('beds') || '[]');
    
    // Create sample Indian beds if none exist
    if (beds.length === 0) {
        const bedNumbers = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110',
                           '201', '202', '203', '204', '205', '206', '207', '208', '209', '210',
                           '301', '302', '303', '304', '305', '306', '307', '308', '309', '310'];
        
        let bedId = 1;
        wards.forEach(ward => {
            const bedCount = ward.capacity;
            for (let i = 0; i < bedCount; i++) {
                // Randomly assign status with realistic distribution
                let status = 'Available';
                const random = Math.random();
                if (random < 0.65) status = 'Occupied';
                else if (random < 0.75) status = 'Maintenance';
                else status = 'Available';
                
                // Assign patients to occupied beds
                let patientId = null;
                let patientName = null;
                let admissionDate = null;
                if (status === 'Occupied') {
                    const patients = [
                        'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Verma', 'Vikram Singh',
                        'Neha Gupta', 'Ramesh Iyer', 'Kavya Reddy', 'Sanjay Joshi', 'Anjali Nair',
                        'Manish Malhotra', 'Deepika Roy', 'Suresh Raina', 'Pooja Mishra', 'Arjun Kapoor'
                    ];
                    patientName = patients[Math.floor(Math.random() * patients.length)];
                    patientId = Math.floor(Math.random() * 100) + 1;
                    const startDate = new Date();
                    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
                    admissionDate = startDate.toISOString().split('T')[0];
                }
                
                beds.push({
                    id: bedId++,
                    bedNumber: `${ward.code}-${String(i + 1).padStart(3, '0')}`,
                    wardId: ward.id,
                    wardName: ward.name,
                    status: status,
                    patientId: patientId,
                    patientName: patientName,
                    admissionDate: admissionDate,
                    floor: ward.floor
                });
            }
        });
        localStorage.setItem('beds', JSON.stringify(beds));
    }
    
    // Load IPD patients
    let ipdPatients = JSON.parse(localStorage.getItem('hms_ipd') || '[]');
    
    // Create sample IPD patients if none exist and beds are occupied
    if (ipdPatients.length === 0) {
        const occupiedBeds = beds.filter(b => b.status === 'Occupied');
        let ipdId = 1;
        occupiedBeds.forEach((bed, index) => {
            if (bed.patientName) {
                ipdPatients.push({
                    id: ipdId++,
                    patientId: bed.patientId || index + 1,
                    patientName: bed.patientName,
                    bedId: bed.id,
                    bedNumber: bed.bedNumber,
                    wardId: bed.wardId,
                    wardName: bed.wardName,
                    admissionDate: bed.admissionDate || new Date().toISOString().split('T')[0],
                    diagnosis: ['Pneumonia', 'Fracture', 'Cardiac Issue', 'Stroke', 'Appendicitis', 'Diabetes Management'][Math.floor(Math.random() * 6)],
                    doctorName: ['Dr. Anjali Nair', 'Dr. Vikram Singh', 'Dr. Sneha Joshi', 'Dr. Rajiv Menon'][Math.floor(Math.random() * 4)]
                });
            }
        });
        localStorage.setItem('hms_ipd', JSON.stringify(ipdPatients));
    }
    
    // --- Calculate Statistics ---
    
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
    const availableBeds = beds.filter(b => b.status === 'Available').length;
    const maintenanceBeds = beds.filter(b => b.status === 'Maintenance').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    
    const totalBedsEl = document.getElementById('totalBeds');
    const occupiedBedsEl = document.getElementById('occupiedBeds');
    const availableBedsEl = document.getElementById('availableBeds');
    const occupancyRateEl = document.getElementById('occupancyRate');
    
    if (totalBedsEl) totalBedsEl.innerText = totalBeds;
    if (occupiedBedsEl) occupiedBedsEl.innerText = occupiedBeds;
    if (availableBedsEl) availableBedsEl.innerText = availableBeds;
    if (occupancyRateEl) occupancyRateEl.innerText = occupancyRate + '%';
    
    // --- Ward-wise Statistics ---
    const wardStats = wards.map(ward => {
        const wardBeds = beds.filter(b => b.wardId === ward.id);
        const occupied = wardBeds.filter(b => b.status === 'Occupied').length;
        const available = wardBeds.filter(b => b.status === 'Available').length;
        const maintenance = wardBeds.filter(b => b.status === 'Maintenance').length;
        const total = wardBeds.length;
        const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
        
        let statusText = 'Normal';
        let statusClass = 'badge-normal';
        let progressClass = '';
        if (rate > 80) {
            statusText = 'Critical';
            statusClass = 'badge-critical';
            progressClass = 'progress-bar-critical';
        } else if (rate > 60) {
            statusText = 'High';
            statusClass = 'badge-high';
            progressClass = 'progress-bar-high';
        } else {
            statusText = 'Normal';
            statusClass = 'badge-normal';
            progressClass = '';
        }
        
        return { 
            id: ward.id,
            name: ward.name, 
            total, 
            occupied, 
            available, 
            maintenance,
            rate, 
            statusText,
            statusClass,
            progressClass
        };
    });
    
    // --- Ward Chart (Bar Chart) ---
    const ctx1 = document.getElementById('wardChart')?.getContext('2d');
    if (ctx1) {
        if (wardChart) wardChart.destroy();
        wardChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: wardStats.map(w => w.name),
                datasets: [{
                    label: 'Occupancy Rate (%)',
                    data: wardStats.map(w => w.rate),
                    backgroundColor: wardStats.map(w => 
                        w.rate > 80 ? '#d48c8c' : (w.rate > 60 ? '#d4a853' : '#a8c49a')
                    ),
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
                                return `Occupancy: ${context.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f0e8e0' },
                        ticks: {
                            font: { family: 'Poppins', size: 10 },
                            color: '#b8aa9a',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { family: 'Poppins', size: 10 },
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
    
    // --- Status Chart (Doughnut Chart) ---
    const ctx2 = document.getElementById('statusChart')?.getContext('2d');
    if (ctx2) {
        if (statusChart) statusChart.destroy();
        statusChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Occupied', 'Available', 'Maintenance'],
                datasets: [{
                    data: [occupiedBeds, availableBeds, maintenanceBeds],
                    backgroundColor: ['#d48c8c', '#8aae7a', '#d4a853'],
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
                                const total = occupiedBeds + availableBeds + maintenanceBeds;
                                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // --- Render Ward Table ---
    const tbody = document.getElementById('wardTable');
    if (tbody) {
        if (wardStats.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-[#94a3b8]">No ward data available</td></tr>`;
        } else {
            tbody.innerHTML = wardStats.map(w => `
                <tr class="report-row">
                    <td class="px-5 py-3 text-sm font-medium text-[#1e293b]">${escapeHtml(w.name)}</td>
                    <td class="px-5 py-3 text-sm text-[#64748b] text-right">${w.total}</td>
                    <td class="px-5 py-3 text-sm text-[#d48c8c] text-right font-medium">${w.occupied}</td>
                    <td class="px-5 py-3 text-sm text-[#8aae7a] text-right font-medium">${w.available}</td>
                    <td class="px-5 py-3 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <div class="w-24 bg-[#f0ebe4] rounded-full h-2">
                                <div class="progress-bar ${w.progressClass}" style="width: ${w.rate}%"></div>
                            </div>
                            <span class="text-sm font-medium text-[#1e293b]">${w.rate}%</span>
                        </div>
                    </td>
                    <td class="px-5 py-3 text-center">
                        <span class="${w.statusClass}">${w.statusText}</span>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Print report
function printReport() {
    const printContent = document.querySelector('main').cloneNode(true);
    
    // Remove canvas and replace with images for print
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
    
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            body { margin: 0; padding: 20px; background: white; }
            .no-print { display: none !important; }
            .stat-card, .bg-white { break-inside: avoid; page-break-inside: avoid; margin-bottom: 20px; }
            .report-row { break-inside: avoid; }
        }
        body { font-family: 'Poppins', Arial, sans-serif; background: white; }
        .stat-card { border: 1px solid #ddd; padding: 16px; border-radius: 12px; }
        .bg-white { border: 1px solid #ddd; border-radius: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .border-l-4 { border-left-width: 4px; }
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bed Occupancy Report - MedFlow Hospital</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                ${style.outerHTML}
            </head>
            <body style="padding: 40px; max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; border-bottom: 2px solid #a8c49a; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #5a4a3a; margin: 0;">MedFlow Hospital</h1>
                    <p style="color: #9a8e82; margin: 5px 0;">Bed Occupancy Report</p>
                    <p style="color: #b8aa9a; font-size: 12px;">Generated on: ${new Date().toLocaleString('en-IN')}</p>
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
    loadData();
    
    const printReportBtn = document.getElementById('printReport');
    if (printReportBtn) printReportBtn.addEventListener('click', printReport);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);