/**
 * Patient Reports Module
 * MedFlow Reports - Patient Statistics and Analytics
 * Uses theme.css for styling, clean event handling
 */

var patientTrendChart = null;
var genderChart = null;
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

// ─── Date Helpers ──────────────────────────────────

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

function resetDates() {
    var today = new Date();
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById('fromDate').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('toDate').value = today.toISOString().split('T')[0];
    loadData();
    showToast('Date range reset to last 30 days', 'info');
}

function calculateAge(dob) {
    if (!dob) return null;
    var birthDate = new Date(dob);
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function getAgeGroup(age) {
    if (age === null) return 'Unknown';
    if (age <= 18) return '0-18';
    if (age <= 35) return '19-35';
    if (age <= 50) return '36-50';
    if (age <= 65) return '51-65';
    return '65+';
}

// ─── Load Data ──────────────────────────────────────

function loadData() {
    try {
        var fromDate = document.getElementById('fromDate').value;
        var toDate = document.getElementById('toDate').value;
        
        // Load patients
        var patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        
        // Create sample patients if none exist
        if (patients.length === 0) {
            var samplePatients = [];
            var patientNames = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Verma', 'Vikram Singh', 'Neha Gupta', 'Ramesh Iyer', 'Kavya Reddy', 'Sanjay Joshi', 'Anjali Nair', 'Manish Malhotra', 'Deepika Roy', 'Suresh Raina', 'Pooja Mishra', 'Arjun Kapoor'];
            var genders = ['Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female'];
            var startDate = new Date('2026-05-01');
            var endDate = new Date('2026-06-10');
            
            for (var i = 0; i < patientNames.length; i++) {
                var randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
                var gender = genders[i % genders.length];
                var age = Math.floor(Math.random() * 60) + 18;
                var dob = new Date();
                dob.setFullYear(dob.getFullYear() - age);
                
                samplePatients.push({
                    id: i + 1,
                    fullName: patientNames[i],
                    phone: '98765432' + String(i + 10).padStart(2, '0'),
                    email: patientNames[i].toLowerCase().replace(' ', '.') + '@email.com',
                    gender: gender,
                    dob: dob.toISOString().split('T')[0],
                    bloodGroup: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-'][Math.floor(Math.random() * 6)],
                    address: ['Mumbai', 'Delhi', 'Ahmedabad', 'Lucknow', 'Jaipur', 'Pune', 'Chennai', 'Hyderabad', 'Nagpur', 'Kochi'][Math.floor(Math.random() * 10)],
                    createdAt: randomDate.toISOString().split('T')[0]
                });
            }
            patients = samplePatients;
            localStorage.setItem('hms_patients', JSON.stringify(patients));
        }
        
        // Load consultations
        var consultations = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
        
        // Create sample consultations if none exist
        if (consultations.length === 0 && patients.length > 0) {
            var sampleConsultations = [];
            var doctors = ['Dr. Anjali Nair', 'Dr. Vikram Singh', 'Dr. Sneha Joshi', 'Dr. Rajiv Menon', 'Dr. Neha Gupta', 'Dr. Sanjay Kulkarni'];
            var startDate2 = new Date('2026-05-01');
            var endDate2 = new Date('2026-06-10');
            
            for (var j = 0; j < 60; j++) {
                var randomDate2 = new Date(startDate2.getTime() + Math.random() * (endDate2.getTime() - startDate2.getTime()));
                var randomPatient = patients[Math.floor(Math.random() * patients.length)];
                sampleConsultations.push({
                    id: j + 1,
                    patientId: randomPatient.id,
                    patientName: randomPatient.fullName,
                    doctorId: Math.floor(Math.random() * 6) + 1,
                    doctorName: doctors[Math.floor(Math.random() * doctors.length)],
                    date: randomDate2.toISOString().split('T')[0],
                    diagnosis: 'Sample diagnosis',
                    prescription: 'Sample prescription'
                });
            }
            consultations = sampleConsultations;
            localStorage.setItem('hms_consultations', JSON.stringify(consultations));
        }
        
        // Load appointments
        var appointments = JSON.parse(localStorage.getItem('hms_appointments') || '[]');
        
        // Load OPD visits
        var opdVisits = JSON.parse(localStorage.getItem('hms_opd') || '[]');
        
        // --- Calculate Statistics ---
        var totalPatients = patients.length;
        document.getElementById('totalPatients').textContent = totalPatients;
        
        var newPatients = 0;
        for (var p = 0; p < patients.length; p++) {
            var createdDate = patients[p].createdAt ? patients[p].createdAt.split('T')[0] : patients[p].createdAt;
            if (createdDate && createdDate >= fromDate && createdDate <= toDate) {
                newPatients++;
            }
        }
        document.getElementById('newPatients').textContent = newPatients;
        
        var maleCount = 0, femaleCount = 0, otherCount = 0;
        for (var g = 0; g < patients.length; g++) {
            if (patients[g].gender === 'Male') maleCount++;
            else if (patients[g].gender === 'Female') femaleCount++;
            else otherCount++;
        }
        document.getElementById('genderRatio').textContent = maleCount + ':' + femaleCount;
        
        var totalAge = 0, validAgeCount = 0;
        for (var a = 0; a < patients.length; a++) {
            var age = calculateAge(patients[a].dob);
            if (age !== null) {
                totalAge += age;
                validAgeCount++;
            }
        }
        var avgAge = validAgeCount > 0 ? Math.round(totalAge / validAgeCount) : 0;
        document.getElementById('avgAge').textContent = avgAge;
        
        // --- Patient Trend Chart ---
        var dateRange = [];
        var patientCounts = [];
        var chartStartDate = new Date(fromDate);
        var chartEndDate = new Date(toDate);
        var daysDiff = Math.ceil((chartEndDate - chartStartDate) / (1000 * 60 * 60 * 24));
        
        var actualStartDate = chartStartDate;
        if (daysDiff > 30) {
            actualStartDate = new Date(chartEndDate);
            actualStartDate.setDate(actualStartDate.getDate() - 30);
        }
        
        for (var d = new Date(actualStartDate); d <= chartEndDate; d.setDate(d.getDate() + 1)) {
            var dateStr = d.toISOString().split('T')[0];
            dateRange.push(dateStr.substring(5));
            var count = 0;
            for (var pc = 0; pc < patients.length; pc++) {
                var created = patients[pc].createdAt ? patients[pc].createdAt.split('T')[0] : patients[pc].createdAt;
                if (created === dateStr) count++;
            }
            patientCounts.push(count);
        }
        
        var ctx1 = document.getElementById('patientTrendChart')?.getContext('2d');
        if (ctx1) {
            if (patientTrendChart) { patientTrendChart.destroy(); }
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
                        pointRadius: 3,
                        pointHoverRadius: 5
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
                                    return 'New Patients: ' + context.raw;
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
        var ctx2 = document.getElementById('genderChart')?.getContext('2d');
        if (ctx2) {
            if (genderChart) { genderChart.destroy(); }
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
                                    var total = maleCount + femaleCount + otherCount;
                                    var percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                    return context.label + ': ' + context.raw + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // --- Age Group Distribution ---
        var ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0, 'Unknown': 0 };
        for (var ag = 0; ag < patients.length; ag++) {
            var age2 = calculateAge(patients[ag].dob);
            var group = getAgeGroup(age2);
            ageGroups[group]++;
        }
        
        var ageGroupDiv = document.getElementById('ageGroupTable');
        if (ageGroupDiv) {
            var totalPatientsWithAge = patients.length;
            var html = '';
            var ageKeys = ['0-18', '19-35', '36-50', '51-65', '65+'];
            for (var ak = 0; ak < ageKeys.length; ak++) {
                var group2 = ageKeys[ak];
                var count = ageGroups[group2] || 0;
                var percentage = totalPatientsWithAge > 0 ? ((count / totalPatientsWithAge) * 100).toFixed(1) : 0;
                html += '<div class="age-group-row">';
                html += '<span class="age-group-label">' + group2 + ' years</span>';
                html += '<div class="age-group-bar">';
                html += '<span class="age-group-count">' + count + '</span>';
                html += '<div class="age-group-track"><div class="progress-bar" style="width:' + percentage + '%;"></div></div>';
                html += '<span class="age-group-percent">' + percentage + '%</span>';
                html += '</div></div>';
            }
            ageGroupDiv.innerHTML = html;
        }
        
        // --- Most Frequent Patients ---
        var visitCount = {};
        
        for (var c = 0; c < consultations.length; c++) {
            var consult = consultations[c];
            if (consult.patientId) {
                visitCount[consult.patientId] = (visitCount[consult.patientId] || 0) + 1;
            }
        }
        for (var ap = 0; ap < appointments.length; ap++) {
            var appt = appointments[ap];
            if (appt.patientId) {
                visitCount[appt.patientId] = (visitCount[appt.patientId] || 0) + 1;
            }
        }
        for (var ov = 0; ov < opdVisits.length; ov++) {
            var opd = opdVisits[ov];
            if (opd.patientId) {
                visitCount[opd.patientId] = (visitCount[opd.patientId] || 0) + 1;
            }
        }
        
        var frequentPatients = [];
        var vKeys = Object.keys(visitCount);
        for (var vk = 0; vk < vKeys.length; vk++) {
            var id = parseInt(vKeys[vk]);
            var visits = visitCount[id];
            var patient = null;
            for (var fp = 0; fp < patients.length; fp++) {
                if (patients[fp].id === id) { patient = patients[fp]; break; }
            }
            if (!patient) continue;
            
            var allVisits = [];
            for (var ca = 0; ca < consultations.length; ca++) {
                if (consultations[ca].patientId === patient.id) allVisits.push(consultations[ca]);
            }
            for (var aa = 0; aa < appointments.length; aa++) {
                if (appointments[aa].patientId === patient.id) allVisits.push(appointments[aa]);
            }
            for (var oa = 0; oa < opdVisits.length; oa++) {
                if (opdVisits[oa].patientId === patient.id) allVisits.push(opdVisits[oa]);
            }
            
            var lastVisit = '-';
            if (allVisits.length > 0) {
                var latestDate = new Date(allVisits[0].date);
                for (var lv = 1; lv < allVisits.length; lv++) {
                    var currentDate = new Date(allVisits[lv].date);
                    if (currentDate > latestDate) latestDate = currentDate;
                }
                lastVisit = latestDate.toISOString().split('T')[0];
            }
            
            frequentPatients.push({
                name: patient.fullName,
                phone: patient.phone,
                visits: visits,
                lastVisit: lastVisit
            });
        }
        frequentPatients.sort(function(a, b) { return b.visits - a.visits; });
        frequentPatients = frequentPatients.slice(0, 10);
        
        var tbody = document.getElementById('frequentPatientsTable');
        if (tbody) {
            if (frequentPatients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-users" style="font-size:1.5rem; margin-bottom:0.5rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No patient visit data available</p></td></tr>';
            } else {
                var html2 = '';
                for (var fp2 = 0; fp2 < frequentPatients.length; fp2++) {
                    var p2 = frequentPatients[fp2];
                    html2 += '<tr class="dashboard-table-row">';
                    html2 += '<td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem;">' + esc(p2.name) + '</td>';
                    html2 += '<td style="color:var(--color-brown-300); font-size:0.8125rem;">' + esc(p2.phone) + '</td>';
                    html2 += '<td style="text-align:center; color:var(--color-sage-dark); font-weight:var(--font-weight-semibold);">' + p2.visits + '</td>';
                    html2 += '<td style="color:var(--color-brown-300); font-size:0.8125rem;">' + p2.lastVisit + '</td>';
                    html2 += '</tr>';
                }
                tbody.innerHTML = html2;
            }
        }
    } catch (error) {
        console.error('Error loading patient reports:', error);
        showToast('Error loading patient reports', 'error');
    }
}

// ─── Print Report ──────────────────────────────────

function printReport() {
    var mainContent = document.querySelector('main');
    var clone = mainContent.cloneNode(true);
    
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
            .stat-card { break-inside: avoid; }
            .card-white { break-inside: avoid; }
            .dashboard-table-row { break-inside: avoid; }
            .chart-container { height: 250px; }
            canvas { max-height: 250px; }
        }
        body { font-family: 'Poppins', Arial, sans-serif; background: white; }
        .stat-card { border: 1px solid #f0e8e0; padding: 16px; border-radius: 12px; }
        .card-white { border: 1px solid #f0e8e0; border-radius: 12px; padding: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #f0e8e0; text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .border-l-4 { border-left-width: 4px; }
        .progress-bar { background: #a8c49a; height: 6px; border-radius: 4px; }
    `;
    
    var printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>Patient Reports - MedFlow Hospital</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">' + style.outerHTML + '</head><body style="padding:40px; max-width:1200px; margin:0 auto;"><div style="text-align:center; border-bottom:2px solid #a8c49a; padding-bottom:20px; margin-bottom:30px;"><h1 style="color:#5a4a3a; margin:0;">MedFlow Hospital</h1><p style="color:#9a8e82; margin:5px 0;">Patient Reports & Analytics</p><p style="color:#b8aa9a; font-size:12px;">Period: ' + document.getElementById('fromDate').value + ' to ' + document.getElementById('toDate').value + '</p><p style="color:#b8aa9a; font-size:12px;">Generated on: ' + new Date().toLocaleString('en-IN') + '</p></div>' + clone.innerHTML + '<div style="text-align:center; margin-top:50px; padding-top:20px; border-top:1px solid #f0e8e0; color:#b8aa9a; font-size:12px;"><p>MedFlow Hospital - www.medflow.com</p><p>This is a computer-generated report</p></div></body></html>');
        printWindow.document.close();
        printWindow.print();
        showToast('Opening print dialog...', 'success');
    } else {
        showToast('Please allow popups to print', 'error');
    }
}

// ─── Init ────────────────────────────────────────────

function initPatientReportsModule() {
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
    var checkSidebar = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkSidebar);
            setTimeout(initPatientReportsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkSidebar);
        initPatientReportsModule();
    }, 3000);
});