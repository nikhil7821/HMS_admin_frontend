/**
 * Reports Storage Management Module
 * MedFlow - Medical Reports Storage
 * Uses theme.css for styling, clean event handling
 */

var reports = [];
var currentReportId = null;
var searchTerm = '';
var typeFilter = '';
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

// ─── Data Management ──────────────────────────────

function loadReports() {
    try {
        // Try to load from localStorage
        var stored = localStorage.getItem('reports_storage');
        if (stored) {
            reports = JSON.parse(stored);
        } else {
            // Sample Indian reports
            var today = new Date().toISOString().split('T')[0];
            var lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            var lastMonthStr = lastMonth.toISOString().split('T')[0];
            
            reports = [
                {
                    id: 'lab_1', type: 'Lab', patientName: 'Rajesh Kumar', testName: 'Complete Blood Count (CBC)',
                    date: today, result: 'Hemoglobin: 14.2 g/dL (Normal: 13-17)\nWBC: 7,500/μL (Normal: 4,000-11,000)\nPlatelets: 2.8 lakhs/μL (Normal: 1.5-4.5)\nAll parameters within normal limits.',
                    requestedBy: 'Dr. Anjali Nair', labTechnician: 'Priya Sharma'
                },
                {
                    id: 'lab_2', type: 'Lab', patientName: 'Priya Sharma', testName: 'Thyroid Profile',
                    date: lastMonthStr, result: 'TSH: 3.2 μIU/mL (Normal: 0.5-5.0)\nT3: 1.2 ng/mL (Normal: 0.8-2.0)\nT4: 8.5 μg/dL (Normal: 5.0-12.0)\nThyroid function is normal.',
                    requestedBy: 'Dr. Vikram Singh', labTechnician: 'Rajesh Kumar'
                },
                {
                    id: 'lab_3', type: 'Lab', patientName: 'Amit Patel', testName: 'Lipid Profile',
                    date: lastMonthStr, result: 'Total Cholesterol: 210 mg/dL (Borderline High)\nHDL: 42 mg/dL (Low)\nLDL: 135 mg/dL (High)\nTriglycerides: 165 mg/dL (Borderline High)\nAdvise lifestyle modifications and repeat in 3 months.',
                    requestedBy: 'Dr. Sneha Joshi', labTechnician: 'Neha Gupta'
                },
                {
                    id: 'lab_4', type: 'Lab', patientName: 'Sunita Verma', testName: 'Blood Glucose (Fasting & PP)',
                    date: lastMonthStr, result: 'Fasting Blood Sugar: 145 mg/dL (High)\nPost Prandial: 210 mg/dL (High)\nHbA1c: 7.8%\nIndicates poorly controlled diabetes. Review medications.',
                    requestedBy: 'Dr. Rajiv Menon', labTechnician: 'Vikram Singh'
                },
                {
                    id: 'rad_1', type: 'Radiology', patientName: 'Rajesh Kumar', testName: 'Chest X-Ray',
                    date: today, findings: 'PA view chest shows normal cardiac silhouette. Lung fields are clear with no infiltrates or masses. Bilateral costophrenic angles are sharp. No evidence of consolidation or pleural effusion. Impression: Normal chest X-ray.',
                    requestedBy: 'Dr. Anjali Nair', radiologist: 'Dr. Sanjay Gupta'
                },
                {
                    id: 'rad_2', type: 'Radiology', patientName: 'Priya Sharma', testName: 'USG Abdomen',
                    date: lastMonthStr, findings: 'Liver: Normal size and echotexture. No focal lesions. Gallbladder: Normal with no stones. Kidneys: Bilateral normal size and shape. No hydronephrosis. Pancreas: Normal. Spleen: Normal. Impression: Normal ultrasound of abdomen.',
                    requestedBy: 'Dr. Vikram Singh', radiologist: 'Dr. Meera Desai'
                },
                {
                    id: 'rad_3', type: 'Radiology', patientName: 'Amit Patel', testName: 'MRI Brain',
                    date: lastMonthStr, findings: 'MRI brain shows normal grey-white matter differentiation. No evidence of any intra-axial or extra-axial mass. Ventricular system is normal. No midline shift. Conclusion: Normal MRI brain.',
                    requestedBy: 'Dr. Sneha Joshi', radiologist: 'Dr. Rajesh Nair'
                }
            ];
            saveReports();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading reports:', error);
        showToast('Error loading reports', 'error');
    }
}

function saveReports() {
    try {
        localStorage.setItem('reports_storage', JSON.stringify(reports));
    } catch (error) {
        console.error('Error saving reports:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    var total = reports.length;
    var labCount = 0, radiologyCount = 0;
    var currentMonth = new Date().toISOString().substring(0, 7);
    var monthCount = 0;
    
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].type === 'Lab') labCount++;
        else if (reports[i].type === 'Radiology') radiologyCount++;
        else radiologyCount++; // Discharge counts as other
        
        if (reports[i].date && reports[i].date.startsWith(currentMonth)) {
            monthCount++;
        }
    }
    
    document.getElementById('totalReports').textContent = total;
    document.getElementById('labCount').textContent = labCount;
    document.getElementById('radiologyCount').textContent = radiologyCount;
    document.getElementById('monthCount').textContent = monthCount;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredReports() {
    return reports.filter(function(r) {
        var matchesSearch = searchTerm === '' || 
            r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            r.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.result && r.result.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.findings && r.findings.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesType = typeFilter === '' || r.type === typeFilter;
        return matchesSearch && matchesType;
    });
}

// ─── Render ──────────────────────────────────────────

function getBadgeClass(type) {
    var map = {
        'Lab': 'badge-lab',
        'Radiology': 'badge-radiology',
        'Discharge': 'badge-discharge'
    };
    return map[type] || 'badge-lab';
}

function getReportIcon(type) {
    var map = {
        'Lab': 'fa-flask',
        'Radiology': 'fa-x-ray',
        'Discharge': 'fa-file-pdf'
    };
    return map[type] || 'fa-file-alt';
}

function renderReports() {
    var grid = document.getElementById('reportsGrid');
    if (!grid) return;
    
    var filtered = getFilteredReports();
    filtered.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-folder-open" style="font-size:2rem; margin-bottom:0.75rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No reports found</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var r = filtered[i];
        var badgeClass = getBadgeClass(r.type);
        var iconClass = getReportIcon(r.type);
        var preview = r.result || r.findings || '';
        var shortPreview = preview.substring(0, 80) + (preview.length > 80 ? '...' : '');
        
        html += '<div class="report-card">';
        html += '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">';
        html += '<div><div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">';
        html += '<i class="fas ' + iconClass + '" style="color:var(--color-sage); font-size:0.875rem;"></i>';
        html += '<h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.8125rem; margin:0;">' + esc(r.testName) + '</h3>';
        html += '</div>';
        html += '<p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">' + esc(r.patientName) + '</p>';
        html += '</div>';
        html += '<span class="' + badgeClass + '">' + r.type + '</span>';
        html += '</div>';
        
        html += '<p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0.25rem 0 0.5rem 0;"><i class="fas fa-calendar-alt" style="margin-right:0.25rem;"></i> ' + r.date + '</p>';
        
        html += '<div style="margin-top:0.5rem;"><p style="font-size:0.75rem; color:var(--color-brown-300); margin:0; line-height:1.4;">' + esc(shortPreview) + '</p></div>';
        
        html += '<div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">';
        html += '<button class="card-btn card-btn-primary view-btn" data-id="' + r.id + '"><i class="fas fa-eye"></i> View Full Report</button>';
        html += '</div></div>';
    }
    grid.innerHTML = html;
    
    // Bind events
    grid.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { viewReport(this.dataset.id); });
    });
}

function refreshUI() {
    updateStats();
    renderReports();
}

// ─── Modals ──────────────────────────────────────────

function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('active'); }
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('active'); }
}

// ─── View Report ──────────────────────────────────

function viewReport(id) {
    var report = null;
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].id === id) { report = reports[i]; break; }
    }
    if (!report) {
        showToast('Report not found', 'error');
        return;
    }
    
    currentReportId = id;
    var badgeClass = getBadgeClass(report.type);
    
    var detailsDiv = document.getElementById('reportDetails');
    if (detailsDiv) {
        detailsDiv.innerHTML = '';
        
        detailsDiv.innerHTML += '<div style="border-bottom:1px solid var(--border-default); padding-bottom:1rem; margin-bottom:1rem;">';
        detailsDiv.innerHTML += '<div style="display:flex; justify-content:space-between; align-items:flex-start;">';
        detailsDiv.innerHTML += '<div><h3 style="font-weight:var(--font-weight-semibold); color:var(--color-brown-700); font-size:1rem; margin:0;">' + esc(report.testName) + '</h3>';
        detailsDiv.innerHTML += '<p style="font-size:0.8125rem; color:var(--color-brown-300); margin:0;">' + esc(report.patientName) + '</p></div>';
        detailsDiv.innerHTML += '<span class="' + badgeClass + '">' + report.type + '</span>';
        detailsDiv.innerHTML += '</div>';
        
        detailsDiv.innerHTML += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:0.75rem;">';
        detailsDiv.innerHTML += '<div><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">Report Date</p><p style="font-size:0.8125rem; color:var(--color-brown-700); margin:0;">' + report.date + '</p></div>';
        detailsDiv.innerHTML += '<div><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">Requested By</p><p style="font-size:0.8125rem; color:var(--color-brown-700); margin:0;">' + esc(report.requestedBy || 'Dr. Staff') + '</p></div>';
        detailsDiv.innerHTML += '</div></div>';
        
        detailsDiv.innerHTML += '<div style="margin-bottom:1rem;">';
        detailsDiv.innerHTML += '<p style="font-size:0.6875rem; font-weight:var(--font-weight-medium); color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.5rem;">Report Findings / Results</p>';
        detailsDiv.innerHTML += '<div style="background:var(--bg-subtle); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-default);">';
        detailsDiv.innerHTML += '<pre class="report-content">' + esc(report.result || report.findings || 'No detailed results available') + '</pre>';
        detailsDiv.innerHTML += '</div></div>';
        
        if (report.labTechnician || report.radiologist) {
            detailsDiv.innerHTML += '<div style="margin-bottom:1rem;"><p style="font-size:0.6875rem; font-weight:var(--font-weight-medium); color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.25rem;">Authorized By</p><p style="font-size:0.8125rem; color:var(--color-brown-700); margin:0;">' + esc(report.labTechnician || report.radiologist || 'Lab Department') + '</p></div>';
        }
        
        detailsDiv.innerHTML += '<div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--border-default); text-align:center;">';
        detailsDiv.innerHTML += '<p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">MedFlow Hospital - Diagnostic Report</p>';
        detailsDiv.innerHTML += '<p style="font-size:0.625rem; color:var(--color-brown-100); margin:0;">www.medflow.com</p>';
        detailsDiv.innerHTML += '</div>';
    }
    
    openModal('reportModal');
}

// ─── Print Report ──────────────────────────────────

function printReport() {
    if (!currentReportId) {
        showToast('No report selected', 'error');
        return;
    }
    
    var report = null;
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].id === currentReportId) { report = reports[i]; break; }
    }
    if (!report) {
        showToast('Report not found', 'error');
        return;
    }
    
    var badgeClass = getBadgeClass(report.type);
    var printContent = '';
    
    printContent += '<div class="print-report" style="font-family:Poppins, Arial, sans-serif; max-width:800px; margin:0 auto; padding:40px; background:white;">';
    printContent += '<div style="text-align:center; border-bottom:2px solid #a8c49a; padding-bottom:20px; margin-bottom:30px;">';
    printContent += '<h1 style="color:#5a4a3a; margin:0;">MedFlow Hospital</h1>';
    printContent += '<p style="color:#9a8e82; margin:5px 0;">Diagnostic Report</p></div>';
    
    printContent += '<div style="margin-bottom:30px;"><table style="width:100%; border-collapse:collapse;">';
    printContent += '<tr style="background:#fefcf9;"><td style="padding:12px; border:1px solid #f0e8e0;"><strong>Patient Name:</strong></td><td style="padding:12px; border:1px solid #f0e8e0;">' + esc(report.patientName) + '</td>';
    printContent += '<td style="padding:12px; border:1px solid #f0e8e0;"><strong>Report Date:</strong></td><td style="padding:12px; border:1px solid #f0e8e0;">' + report.date + '</td></tr>';
    printContent += '<tr><td style="padding:12px; border:1px solid #f0e8e0;"><strong>Test Name:</strong></td><td style="padding:12px; border:1px solid #f0e8e0;" colspan="3">' + esc(report.testName) + '</td></tr>';
    printContent += '<tr style="background:#fefcf9;"><td style="padding:12px; border:1px solid #f0e8e0;"><strong>Report Type:</strong></td><td style="padding:12px; border:1px solid #f0e8e0;">' + report.type + '</td>';
    printContent += '<td style="padding:12px; border:1px solid #f0e8e0;"><strong>Requested By:</strong></td><td style="padding:12px; border:1px solid #f0e8e0;">' + esc(report.requestedBy || 'Dr. Staff') + '</td></tr>';
    printContent += '</table></div>';
    
    printContent += '<div style="margin-bottom:30px;"><h3 style="color:#5a4a3a; margin:0 0 15px 0;">Report Findings / Results</h3>';
    printContent += '<div style="background:#fefcf9; padding:20px; border-radius:8px; border:1px solid #f0e8e0;">';
    printContent += '<pre style="white-space:pre-wrap; font-family:monospace; margin:0; font-size:14px; line-height:1.6;">' + esc(report.result || report.findings || 'No detailed results available') + '</pre>';
    printContent += '</div></div>';
    
    if (report.labTechnician || report.radiologist) {
        printContent += '<div style="margin-bottom:30px;"><p><strong>Authorized By:</strong> ' + esc(report.labTechnician || report.radiologist) + '</p></div>';
    }
    
    printContent += '<div style="text-align:center; margin-top:50px; padding-top:20px; border-top:1px solid #f0e8e0; color:#b8aa9a; font-size:12px;">';
    printContent += '<p>This is a computer-generated report. Valid with digital signature.</p>';
    printContent += '<p>MedFlow Hospital - www.medflow.com</p></div></div>';
    
    var printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>Report - ' + esc(report.testName) + ' - ' + esc(report.patientName) + '</title><style>*{margin:0;padding:0;box-sizing:border-box;}@media print{body{margin:0;padding:0;}}body{font-family:Poppins, Arial, sans-serif;background:white;}</style></head><body>' + printContent + '</body></html>');
        printWindow.document.close();
        printWindow.print();
        showToast('Opening print dialog...', 'success');
    } else {
        showToast('Please allow popups to print', 'error');
    }
}

// ─── Init ────────────────────────────────────────────

function initReportsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadReports();
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderReports();
    });
    
    document.getElementById('typeFilter').addEventListener('change', function(e) {
        typeFilter = e.target.value;
        renderReports();
    });
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        typeFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
        renderReports();
    });
    
    document.getElementById('closeModalBtn').addEventListener('click', function() { closeModal('reportModal'); });
    document.getElementById('closeFooterBtn').addEventListener('click', function() { closeModal('reportModal'); });
    document.getElementById('printReportBtn').addEventListener('click', printReport);
    
    document.getElementById('reportModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('reportModal');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('reportModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initReportsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initReportsModule();
    }, 3000);
});

// ─── Expose ────────────────────────────────────────────

window.viewReport = viewReport;
window.printReport = printReport;