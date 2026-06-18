/**
 * Bed Occupancy Module
 * MedFlow Reports - Bed Utilization Analytics
 * Uses theme.css for styling, clean event handling
 */

var wardChart = null;
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

// ─── Load Data ──────────────────────────────────────

function loadData() {
    try {
        // Load wards
        var wards = JSON.parse(localStorage.getItem('wards') || '[]');
        
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
        var beds = JSON.parse(localStorage.getItem('beds') || '[]');
        
        // Create sample Indian beds if none exist
        if (beds.length === 0) {
            var bedId = 1;
            for (var w = 0; w < wards.length; w++) {
                var ward = wards[w];
                var bedCount = ward.capacity;
                for (var i = 0; i < bedCount; i++) {
                    var random = Math.random();
                    var status = 'Available';
                    if (random < 0.65) status = 'Occupied';
                    else if (random < 0.75) status = 'Maintenance';
                    
                    var patientId = null;
                    var patientName = null;
                    var admissionDate = null;
                    if (status === 'Occupied') {
                        var patients = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Verma', 'Vikram Singh', 'Neha Gupta', 'Ramesh Iyer', 'Kavya Reddy', 'Sanjay Joshi', 'Anjali Nair', 'Manish Malhotra', 'Deepika Roy'];
                        patientName = patients[Math.floor(Math.random() * patients.length)];
                        patientId = Math.floor(Math.random() * 100) + 1;
                        var startDate = new Date();
                        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
                        admissionDate = startDate.toISOString().split('T')[0];
                    }
                    
                    beds.push({
                        id: bedId++,
                        bedNumber: ward.code + '-' + String(i + 1).padStart(3, '0'),
                        wardId: ward.id,
                        wardName: ward.name,
                        status: status,
                        patientId: patientId,
                        patientName: patientName,
                        admissionDate: admissionDate,
                        floor: ward.floor
                    });
                }
            }
            localStorage.setItem('beds', JSON.stringify(beds));
        }
        
        // Load IPD patients
        var ipdPatients = JSON.parse(localStorage.getItem('hms_ipd') || '[]');
        
        // Create sample IPD patients if none exist
        if (ipdPatients.length === 0) {
            var occupiedBeds = [];
            for (var b = 0; b < beds.length; b++) {
                if (beds[b].status === 'Occupied') occupiedBeds.push(beds[b]);
            }
            var ipdId = 1;
            for (var o = 0; o < occupiedBeds.length; o++) {
                var bed = occupiedBeds[o];
                if (bed.patientName) {
                    ipdPatients.push({
                        id: ipdId++,
                        patientId: bed.patientId || o + 1,
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
            }
            localStorage.setItem('hms_ipd', JSON.stringify(ipdPatients));
        }
        
        // --- Calculate Statistics ---
        var totalBeds = beds.length;
        var occupiedBeds = 0, availableBeds = 0, maintenanceBeds = 0;
        for (var k = 0; k < beds.length; k++) {
            if (beds[k].status === 'Occupied') occupiedBeds++;
            else if (beds[k].status === 'Available') availableBeds++;
            else if (beds[k].status === 'Maintenance') maintenanceBeds++;
        }
        var occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
        
        document.getElementById('totalBeds').textContent = totalBeds;
        document.getElementById('occupiedBeds').textContent = occupiedBeds;
        document.getElementById('availableBeds').textContent = availableBeds;
        document.getElementById('occupancyRate').textContent = occupancyRate + '%';
        
        // --- Ward-wise Statistics ---
        var wardStats = [];
        for (var w2 = 0; w2 < wards.length; w2++) {
            var ward = wards[w2];
            var wardBeds = [];
            for (var b2 = 0; b2 < beds.length; b2++) {
                if (beds[b2].wardId === ward.id) wardBeds.push(beds[b2]);
            }
            var occupied = 0, available = 0, maintenance = 0;
            for (var wb = 0; wb < wardBeds.length; wb++) {
                if (wardBeds[wb].status === 'Occupied') occupied++;
                else if (wardBeds[wb].status === 'Available') available++;
                else if (wardBeds[wb].status === 'Maintenance') maintenance++;
            }
            var total = wardBeds.length;
            var rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
            
            var statusText = 'Normal';
            var statusClass = 'badge-normal';
            var progressClass = '';
            if (rate > 80) {
                statusText = 'Critical';
                statusClass = 'badge-critical';
                progressClass = 'progress-bar-critical';
            } else if (rate > 60) {
                statusText = 'High';
                statusClass = 'badge-high';
                progressClass = 'progress-bar-high';
            }
            
            wardStats.push({
                id: ward.id,
                name: ward.name,
                total: total,
                occupied: occupied,
                available: available,
                maintenance: maintenance,
                rate: rate,
                statusText: statusText,
                statusClass: statusClass,
                progressClass: progressClass
            });
        }
        
        // --- Ward Chart (Bar Chart) ---
        var ctx1 = document.getElementById('wardChart')?.getContext('2d');
        if (ctx1) {
            if (wardChart) wardChart.destroy();
            var wardNames = [], wardRates = [], wardColors = [];
            for (var ws = 0; ws < wardStats.length; ws++) {
                wardNames.push(wardStats[ws].name);
                wardRates.push(wardStats[ws].rate);
                if (wardStats[ws].rate > 80) wardColors.push('#d48c8c');
                else if (wardStats[ws].rate > 60) wardColors.push('#d4a853');
                else wardColors.push('#a8c49a');
            }
            
            wardChart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: wardNames,
                    datasets: [{
                        label: 'Occupancy Rate (%)',
                        data: wardRates,
                        backgroundColor: wardColors,
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
                                    return 'Occupancy: ' + context.raw + '%';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                font: { family: 'Poppins', size: 9 },
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        },
                        x: {
                            ticks: {
                                font: { family: 'Poppins', size: 9 },
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
        var ctx2 = document.getElementById('statusChart')?.getContext('2d');
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
                                    var total = occupiedBeds + availableBeds + maintenanceBeds;
                                    var percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                    return context.label + ': ' + context.raw + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // --- Render Ward Table ---
        var tbody = document.getElementById('wardTable');
        if (tbody) {
            if (wardStats.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-building" style="font-size:1.5rem; margin-bottom:0.5rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No ward data available</p></td></tr>';
            } else {
                var html = '';
                for (var ws2 = 0; ws2 < wardStats.length; ws2++) {
                    var w = wardStats[ws2];
                    html += '<tr class="report-row">';
                    html += '<td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem;">' + esc(w.name) + '</td>';
                    html += '<td style="text-align:right; color:var(--color-brown-300);">' + w.total + '</td>';
                    html += '<td style="text-align:right; color:#d48c8c; font-weight:var(--font-weight-medium);">' + w.occupied + '</td>';
                    html += '<td style="text-align:right; color:#8aae7a; font-weight:var(--font-weight-medium);">' + w.available + '</td>';
                    html += '<td style="text-align:right;"><div style="display:flex; align-items:center; justify-content:flex-end; gap:0.5rem;"><div style="width:5rem; background:var(--bg-muted); border-radius:var(--radius-full); height:6px; overflow:hidden;"><div class="progress-bar ' + w.progressClass + '" style="width:' + w.rate + '%;"></div></div><span style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.8125rem;">' + w.rate + '%</span></div></td>';
                    html += '<td style="text-align:center;"><span class="' + w.statusClass + '">' + w.statusText + '</span></td>';
                    html += '</tr>';
                }
                tbody.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Error loading bed occupancy data:', error);
        showToast('Error loading bed occupancy data', 'error');
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
            .stat-card { break-inside: avoid; margin-bottom: 20px; }
            .card-white { break-inside: avoid; }
            .report-row { break-inside: avoid; }
        }
        body { font-family: 'Poppins', Arial, sans-serif; background: white; }
        .stat-card { border: 1px solid #ddd; padding: 16px; border-radius: 12px; }
        .card-white { border: 1px solid #ddd; border-radius: 12px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #ddd; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .border-l-4 { border-left-width: 4px; }
        .progress-bar { height: 6px; border-radius: 4px; }
        .badge-critical, .badge-high, .badge-normal { padding: 2px 10px; border-radius: 12px; font-size: 0.65rem; font-weight: 500; display: inline-block; }
        .badge-critical { background: #fee2e2; color: #dc2626; }
        .badge-high { background: #fef3c7; color: #d97706; }
        .badge-normal { background: #dcfce7; color: #16a34a; }
    `;
    
    var printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>Bed Occupancy Report - MedFlow Hospital</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">' + style.outerHTML + '</head><body style="padding:40px; max-width:1200px; margin:0 auto;"><div style="text-align:center; border-bottom:2px solid #a8c49a; padding-bottom:20px; margin-bottom:30px;"><h1 style="color:#5a4a3a; margin:0;">MedFlow Hospital</h1><p style="color:#9a8e82; margin:5px 0;">Bed Occupancy Report</p><p style="color:#b8aa9a; font-size:12px;">Generated on: ' + new Date().toLocaleString('en-IN') + '</p></div>' + clone.innerHTML + '<div style="text-align:center; margin-top:50px; padding-top:20px; border-top:1px solid #f0e8e0; color:#b8aa9a; font-size:12px;"><p>MedFlow Hospital - www.medflow.com</p><p>This is a computer-generated report</p></div></body></html>');
        printWindow.document.close();
        printWindow.print();
        showToast('Opening print dialog...', 'success');
    } else {
        showToast('Please allow popups to print', 'error');
    }
}

// ─── Init ────────────────────────────────────────────

function initBedOccupancyModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    
    document.getElementById('printReport').addEventListener('click', printReport);
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initBedOccupancyModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initBedOccupancyModule();
    }, 3000);
});