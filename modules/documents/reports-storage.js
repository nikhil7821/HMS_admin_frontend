/**
 * Reports Storage Management Module
 * Version: 3.1 - BUG FIXED
 * 
 * Features:
 * ✅ Full CRUD operations
 * ✅ Patient linking
 * ✅ Report categorization (Lab, Radiology, Pathology, Discharge)
 * ✅ Search and filter
 * ✅ Real-time stats
 * ✅ Print report functionality
 * ✅ Professional UI with cards
 * ✅ Detailed view with all fields
 * ✅ FIXED: Undefined content handling
 */

let reports = [];
let patients = [];
let deleteTargetId = null;
let viewTargetId = null;
let searchTerm = '';
let typeFilter = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────────────

function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        var d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function generateId() {
    return 'REP' + Date.now() + Math.floor(Math.random() * 1000);
}

function getBadgeClass(type) {
    var map = {
        'Lab': 'badge-lab',
        'Radiology': 'badge-radiology',
        'Pathology': 'badge-pathology',
        'Discharge': 'badge-discharge'
    };
    return map[type] || 'badge-lab';
}

function getReportIcon(type) {
    var map = {
        'Lab': 'fa-flask',
        'Radiology': 'fa-x-ray',
        'Pathology': 'fa-microscope',
        'Discharge': 'fa-file-pdf'
    };
    return map[type] || 'fa-file-alt';
}

function getTypeColor(type) {
    var map = {
        'Lab': 'var(--color-success-text)',
        'Radiology': 'var(--color-warning-text)',
        'Pathology': 'var(--color-info-text)',
        'Discharge': 'var(--color-brown-400)'
    };
    return map[type] || 'var(--color-brown-300)';
}

// ─── Toast Notification ──────────────────────────────────────

function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    var colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a', warning: '#d4a853' };
    toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300';
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = '<div class="flex items-center gap-2"><i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle') + '"></i><span>' + esc(message) + '</span></div>';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

// ─── Data Management ──────────────────────────────────────────

function loadData() {
    try {
        // Load patients for reference
        var storedPatients = localStorage.getItem('hms_patients');
        if (storedPatients) {
            patients = JSON.parse(storedPatients);
        } else {
            patients = [];
        }
        
        // Load reports
        var stored = localStorage.getItem('reports_storage');
        if (stored) {
            reports = JSON.parse(stored);
            // ✅ FIX: Ensure all reports have valid content
            for (var i = 0; i < reports.length; i++) {
                if (!reports[i].content) {
                    reports[i].content = 'No content available';
                }
                if (!reports[i].testName) {
                    reports[i].testName = 'Untitled Report';
                }
                if (!reports[i].patientName) {
                    reports[i].patientName = 'Unknown Patient';
                }
                if (!reports[i].date) {
                    reports[i].date = new Date().toISOString().split('T')[0];
                }
                if (!reports[i].type) {
                    reports[i].type = 'Lab';
                }
            }
        } else {
            createSampleData();
        }
        
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading reports:', error);
        showToast('Error loading reports', 'error');
    }
}

function createSampleData() {
    var today = new Date().toISOString().split('T')[0];
    var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    var lastMonthStr = lastMonth.toISOString().split('T')[0];
    var lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    var lastWeekStr = lastWeek.toISOString().split('T')[0];
    
    reports = [
        {
            id: generateId(),
            patientName: 'Rajesh Kumar',
            type: 'Lab',
            testName: 'Complete Blood Count (CBC)',
            date: today,
            content: 'Hemoglobin: 14.2 g/dL (Normal: 13-17)\nWBC: 7,500/μL (Normal: 4,000-11,000)\nPlatelets: 2.8 lakhs/μL (Normal: 1.5-4.5)\nRBC: 5.2 million/μL (Normal: 4.5-5.5)\nAll parameters within normal limits.\n\nConclusion: Normal CBC report.',
            requestedBy: 'Dr. Anjali Nair',
            authorizedBy: 'Priya Sharma (Lab Technician)'
        },
        {
            id: generateId(),
            patientName: 'Priya Sharma',
            type: 'Lab',
            testName: 'Thyroid Profile',
            date: lastMonthStr,
            content: 'TSH: 3.2 μIU/mL (Normal: 0.5-5.0)\nT3: 1.2 ng/mL (Normal: 0.8-2.0)\nT4: 8.5 μg/dL (Normal: 5.0-12.0)\n\nInterpretation: Thyroid function is within normal limits.\nNo signs of hyperthyroidism or hypothyroidism.\nRecommend annual follow-up.',
            requestedBy: 'Dr. Vikram Singh',
            authorizedBy: 'Rajesh Kumar (Lab Technician)'
        },
        {
            id: generateId(),
            patientName: 'Amit Patel',
            type: 'Pathology',
            testName: 'Lipid Profile',
            date: lastMonthStr,
            content: 'Total Cholesterol: 210 mg/dL (Borderline High)\nHDL: 42 mg/dL (Low - Desired >60)\nLDL: 135 mg/dL (High - Desired <100)\nTriglycerides: 165 mg/dL (Borderline High)\nVLDL: 33 mg/dL\n\nRisk Assessment: Moderate cardiovascular risk.\nRecommendations:\n1. Lifestyle modifications - Diet and exercise\n2. Follow up in 3 months\n3. Consider statin therapy if persists.',
            requestedBy: 'Dr. Sneha Joshi',
            authorizedBy: 'Neha Gupta (Pathologist)'
        },
        {
            id: generateId(),
            patientName: 'Sunita Verma',
            type: 'Lab',
            testName: 'Blood Glucose (Fasting & PP)',
            date: lastWeekStr,
            content: 'Fasting Blood Sugar: 145 mg/dL (High - Normal: 70-100)\nPost Prandial: 210 mg/dL (High - Normal: <140)\nHbA1c: 7.8% (High - Normal: 4-6%)\n\nDiagnosis: Uncontrolled Type 2 Diabetes Mellitus.\nImmediate Actions:\n1. Review current medications\n2. Start insulin if required\n3. Dietary counseling\n4. Monitor blood sugar daily',
            requestedBy: 'Dr. Rajiv Menon',
            authorizedBy: 'Vikram Singh (Lab Technician)'
        },
        {
            id: generateId(),
            patientName: 'Rajesh Kumar',
            type: 'Radiology',
            testName: 'Chest X-Ray',
            date: lastWeekStr,
            content: 'PA view chest X-ray:\n\nFindings:\n- Normal cardiac silhouette\n- Lung fields are clear with no infiltrates\n- No evidence of consolidation or pleural effusion\n- Bilateral costophrenic angles are sharp\n- No pneumothorax\n\nImpression: Normal Chest X-Ray.\nNo pathological findings.\n\nRecommended: Follow up if symptoms persist.',
            requestedBy: 'Dr. Anjali Nair',
            authorizedBy: 'Dr. Sanjay Gupta (Radiologist)'
        },
        {
            id: generateId(),
            patientName: 'Priya Sharma',
            type: 'Radiology',
            testName: 'USG Abdomen',
            date: lastMonthStr,
            content: 'Ultrasound of Abdomen:\n\nFindings:\n- Liver: Normal size and echotexture. No focal lesions.\n- Gallbladder: Normal with no stones. No wall thickening.\n- Kidneys: Bilateral normal size and shape. No hydronephrosis.\n- Pancreas: Normal echotexture. No mass.\n- Spleen: Normal size.\n- Aorta: Normal caliber.\n- No free fluid in peritoneal cavity.\n\nImpression: Normal Ultrasound of Abdomen.\nAll organs appear normal.',
            requestedBy: 'Dr. Vikram Singh',
            authorizedBy: 'Dr. Meera Desai (Radiologist)'
        },
        {
            id: generateId(),
            patientName: 'Amit Patel',
            type: 'Radiology',
            testName: 'MRI Brain',
            date: lastMonthStr,
            content: 'MRI Brain with contrast:\n\nFindings:\n- Normal grey-white matter differentiation\n- No evidence of intra-axial or extra-axial mass\n- Ventricular system is normal in size\n- No midline shift\n- No evidence of ischemia or infarct\n- No abnormal enhancement\n\nConclusion: Normal MRI Brain.\n\nNo structural abnormalities detected.\nRecommend clinical correlation if symptoms persist.',
            requestedBy: 'Dr. Sneha Joshi',
            authorizedBy: 'Dr. Rajesh Nair (Radiologist)'
        },
        {
            id: generateId(),
            patientName: 'Sunita Verma',
            type: 'Discharge',
            testName: 'Discharge Summary - Apollo Hospital',
            date: lastWeekStr,
            content: 'DISCHARGE SUMMARY\n\nPatient: Sunita Verma\nAge: 55\nGender: Female\nAdmission Date: 2024-01-15\nDischarge Date: 2024-01-20\n\nDiagnosis: Hypertension with uncontrolled BP\n\nTreatment Given:\n- IV antihypertensives for 3 days\n- Oral antihypertensives started\n- Regular monitoring of BP\n- Lifestyle counseling\n\nDischarge Medications:\n1. Amlodipine 5mg - Once daily\n2. Telmisartan 40mg - Once daily\n\nFollow Up:\n- Review in 2 weeks at OPD\n- Monitor BP daily\n- Report to ER if BP > 180/110\n\nCondition at Discharge: Stable\n\nRecommended: Continue medications and lifestyle modifications.',
            requestedBy: 'Dr. Rajiv Menon',
            authorizedBy: 'Dr. Rajiv Menon (Consultant)'
        }
    ];
    saveReports();
}

function saveReports() {
    try {
        localStorage.setItem('reports_storage', JSON.stringify(reports));
    } catch (error) {
        console.error('Error saving reports:', error);
    }
}

// ─── Stats ─────────────────────────────────────────────────────────────

function updateStats() {
    var total = reports.length;
    var labCount = 0, radiologyCount = 0, otherCount = 0;
    var currentMonth = new Date().toISOString().substring(0, 7);
    var monthCount = 0;
    
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].type === 'Lab') labCount++;
        else if (reports[i].type === 'Radiology') radiologyCount++;
        else otherCount++;
        
        if (reports[i].date && reports[i].date.startsWith(currentMonth)) {
            monthCount++;
        }
    }
    
    document.getElementById('totalReports').textContent = total;
    document.getElementById('labCount').textContent = labCount;
    document.getElementById('radiologyCount').textContent = radiologyCount;
    document.getElementById('monthCount').textContent = monthCount;
}

// ─── Populate Filters ───────────────────────────────────────────────

function populateFilters() {
    // Nothing to populate for now, but keeping for future
}

// ─── Filter ──────────────────────────────────────────────────────────────

function getFilteredReports() {
    var result = [];
    for (var i = 0; i < reports.length; i++) {
        var r = reports[i];
        var matchesSearch = searchTerm === '' || 
            (r.patientName && r.patientName.toLowerCase().includes(searchTerm.toLowerCase())) || 
            (r.testName && r.testName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.content && r.content.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesType = typeFilter === '' || r.type === typeFilter;
        if (matchesSearch && matchesType) {
            result.push(r);
        }
    }
    // Sort by date (newest first)
    result.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    return result;
}

// ─── Render ──────────────────────────────────────────────────────────────

function renderReports() {
    var grid = document.getElementById('reportsGrid');
    if (!grid) return;
    
    var filtered = getFilteredReports();
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No reports found</p><p style="font-size:0.75rem; margin-top:0.25rem;">Add a report to get started.</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var r = filtered[i];
        var badgeClass = getBadgeClass(r.type);
        var iconClass = getReportIcon(r.type);
        var typeColor = getTypeColor(r.type);
        
        // ✅ FIX: Safe content preview with null check
        var content = r.content || 'No content available';
        var preview = content.substring(0, 100) + (content.length > 100 ? '...' : '');
        
        html += '<div class="report-card" data-id="' + r.id + '">';
        html += '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">';
        html += '<div><div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">';
        html += '<i class="fas ' + iconClass + '" style="color:' + typeColor + '; font-size:0.875rem;"></i>';
        html += '<h3 class="report-title">' + esc(r.testName || 'Untitled Report') + '</h3>';
        html += '</div>';
        html += '<p class="report-patient"><i class="fas fa-user" style="margin-right:0.25rem;"></i>' + esc(r.patientName || 'Unknown Patient') + '</p>';
        html += '</div>';
        html += '<span class="' + badgeClass + '">' + (r.type || 'Lab') + '</span>';
        html += '</div>';
        
        html += '<p class="report-meta"><span><i class="fas fa-calendar-alt"></i> ' + formatDate(r.date) + '</span>';
        if (r.requestedBy) {
            html += '<span><i class="fas fa-user-md"></i> ' + esc(r.requestedBy) + '</span>';
        }
        html += '</p>';
        
        html += '<p class="report-preview">' + esc(preview) + '</p>';
        
        html += '<div style="display:flex; gap:0.5rem; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">';
        html += '<button class="card-btn card-btn-primary view-btn" data-id="' + r.id + '"><i class="fas fa-eye"></i> View</button>';
        html += '<button class="card-btn card-btn-primary edit-btn" data-id="' + r.id + '" style="background:var(--color-info-text);"><i class="fas fa-edit"></i></button>';
        html += '<button class="card-btn card-btn-primary delete-btn" data-id="' + r.id + '" style="background:var(--color-error-text);"><i class="fas fa-trash"></i></button>';
        html += '</div></div>';
    }
    grid.innerHTML = html;
    
    // Bind events
    grid.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { viewReport(this.dataset.id); });
    });
    grid.querySelectorAll('.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openEditModal(this.dataset.id); });
    });
    grid.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(this.dataset.id); });
    });
}

function refreshUI() {
    updateStats();
    renderReports();
}

// ─── Validation ─────────────────────────────────────────────────────────

function validateReportForm() {
    var isValid = true;
    var patientName = document.getElementById('patientName').value.trim();
    var reportType = document.getElementById('reportType').value;
    var testName = document.getElementById('testName').value.trim();
    var reportDate = document.getElementById('reportDate').value;
    var content = document.getElementById('reportContent').value.trim();
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function(el) { el.classList.remove('error'); });
    
    if (!patientName) {
        document.getElementById('patientError').classList.add('show');
        document.getElementById('patientName').classList.add('error');
        isValid = false;
    }
    if (!reportType) {
        document.getElementById('typeError').classList.add('show');
        document.getElementById('reportType').classList.add('error');
        isValid = false;
    }
    if (!testName) {
        document.getElementById('testError').classList.add('show');
        document.getElementById('testName').classList.add('error');
        isValid = false;
    }
    if (!reportDate) {
        document.getElementById('dateError').classList.add('show');
        document.getElementById('reportDate').classList.add('error');
        isValid = false;
    }
    if (!content) {
        document.getElementById('contentError').classList.add('show');
        document.getElementById('reportContent').classList.add('error');
        isValid = false;
    }
    return isValid;
}

// ─── Modals ──────────────────────────────────────────────────────────────

function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}

function openAddModal() {
    document.getElementById('reportForm').reset();
    document.getElementById('reportId').value = '';
    document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-file-medical" style="color:var(--color-sage);"></i> Add Report';
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function(el) { el.classList.remove('error'); });
    
    openModal('reportModal');
}

function openEditModal(id) {
    var report = null;
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].id === id) { report = reports[i]; break; }
    }
    if (!report) return;
    
    document.getElementById('reportId').value = report.id;
    document.getElementById('patientName').value = report.patientName || '';
    document.getElementById('reportType').value = report.type || 'Lab';
    document.getElementById('testName').value = report.testName || '';
    document.getElementById('reportDate').value = report.date || new Date().toISOString().split('T')[0];
    document.getElementById('requestedBy').value = report.requestedBy || '';
    document.getElementById('authorizedBy').value = report.authorizedBy || '';
    document.getElementById('reportContent').value = report.content || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Report';
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function(el) { el.classList.remove('error'); });
    
    openModal('reportModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Save Report ──────────────────────────────────────────────────────

function saveReport(e) {
    e.preventDefault();
    if (!validateReportForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    var id = document.getElementById('reportId').value;
    var patientName = document.getElementById('patientName').value.trim();
    var reportType = document.getElementById('reportType').value;
    var testName = document.getElementById('testName').value.trim();
    var reportDate = document.getElementById('reportDate').value;
    var requestedBy = document.getElementById('requestedBy').value.trim();
    var authorizedBy = document.getElementById('authorizedBy').value.trim();
    var content = document.getElementById('reportContent').value.trim();
    
    var reportData = {
        patientName: patientName,
        type: reportType,
        testName: testName,
        date: reportDate,
        content: content,
        requestedBy: requestedBy,
        authorizedBy: authorizedBy
    };
    
    if (id) {
        var index = -1;
        for (var i = 0; i < reports.length; i++) {
            if (reports[i].id === id) { index = i; break; }
        }
        if (index !== -1) {
            reports[index] = { id: reports[index].id, ...reportData };
            showToast('✅ Report updated successfully', 'success');
        }
    } else {
        reportData.id = generateId();
        reports.push(reportData);
        showToast('✅ Report added successfully', 'success');
    }
    
    saveReports();
    refreshUI();
    closeModal('reportModal');
}

// ─── View Report ───────────────────────────────────────────────────────

function viewReport(id) {
    var report = null;
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].id === id) { report = reports[i]; break; }
    }
    if (!report) {
        showToast('Report not found', 'error');
        return;
    }
    
    viewTargetId = id;
    var badgeClass = getBadgeClass(report.type);
    var iconClass = getReportIcon(report.type);
    var typeColor = getTypeColor(report.type);
    
    var viewContent = document.getElementById('viewContent');
    if (viewContent) {
        viewContent.innerHTML = '';
        
        // Title and type
        viewContent.innerHTML += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">';
        viewContent.innerHTML += '<div><h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:1.1rem; margin:0;">' + esc(report.testName || 'Untitled Report') + '</h3>';
        viewContent.innerHTML += '<p style="font-size:0.8125rem; color:var(--color-brown-300); margin:0;">' + esc(report.patientName || 'Unknown Patient') + '</p></div>';
        viewContent.innerHTML += '<span class="' + badgeClass + '" style="font-size:0.7rem;">' + (report.type || 'Lab') + '</span>';
        viewContent.innerHTML += '</div>';
        
        // Details grid
        viewContent.innerHTML += '<div class="detail-grid">';
        viewContent.innerHTML += '<div><p class="detail-label">Report Date</p><p class="detail-value">' + formatDate(report.date) + '</p></div>';
        if (report.requestedBy) {
            viewContent.innerHTML += '<div><p class="detail-label">Requested By</p><p class="detail-value">' + esc(report.requestedBy) + '</p></div>';
        }
        if (report.authorizedBy) {
            viewContent.innerHTML += '<div><p class="detail-label">Authorized By</p><p class="detail-value">' + esc(report.authorizedBy) + '</p></div>';
        }
        viewContent.innerHTML += '</div>';
        
        // Content
        viewContent.innerHTML += '<div class="detail-section" style="margin-top:0.75rem;">';
        viewContent.innerHTML += '<p class="detail-label">Report Findings / Results</p>';
        viewContent.innerHTML += '<div style="background:var(--bg-subtle); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-default);">';
        viewContent.innerHTML += '<pre class="report-content">' + esc(report.content || 'No content available') + '</pre>';
        viewContent.innerHTML += '</div></div>';
        
        // Footer
        viewContent.innerHTML += '<div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--border-default); text-align:center;">';
        viewContent.innerHTML += '<p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">MedFlow Hospital - Diagnostic Report</p>';
        viewContent.innerHTML += '<p style="font-size:0.625rem; color:var(--color-brown-100); margin:0;">www.medflow.com</p>';
        viewContent.innerHTML += '</div>';
    }
    
    document.getElementById('viewModalTitle').innerHTML = '<i class="fas ' + iconClass + '" style="color:' + typeColor + '; margin-right:0.5rem;"></i> ' + esc(report.testName || 'Untitled Report');
    openModal('viewModal');
}

// ─── Print Report ─────────────────────────────────────────────────────

function printReport() {
    if (!viewTargetId) {
        showToast('No report selected', 'error');
        return;
    }
    
    var report = null;
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].id === viewTargetId) { report = reports[i]; break; }
    }
    if (!report) {
        showToast('Report not found', 'error');
        return;
    }
    
    var printContent = '';
    printContent += '<div class="print-report">';
    printContent += '<div class="print-header">';
    printContent += '<h1>MedFlow Hospital</h1>';
    printContent += '<p style="color:var(--color-brown-300); margin:5px 0 0 0;">Diagnostic Report</p>';
    printContent += '</div>';
    
    printContent += '<table>';
    printContent += '<tr><td class="label-cell"><strong>Patient Name:</strong></td><td>' + esc(report.patientName || 'Unknown Patient') + '</td>';
    printContent += '<td class="label-cell"><strong>Report Date:</strong></td><td>' + formatDate(report.date) + '</td></tr>';
    printContent += '<tr><td class="label-cell"><strong>Test Name:</strong></td><td colspan="3">' + esc(report.testName || 'Untitled Report') + '</td></tr>';
    printContent += '<tr><td class="label-cell"><strong>Report Type:</strong></td><td>' + (report.type || 'Lab') + '</td>';
    printContent += '<td class="label-cell"><strong>Requested By:</strong></td><td>' + esc(report.requestedBy || 'N/A') + '</td></tr>';
    if (report.authorizedBy) {
        printContent += '<tr><td class="label-cell"><strong>Authorized By:</strong></td><td colspan="3">' + esc(report.authorizedBy) + '</td></tr>';
    }
    printContent += '</table>';
    
    printContent += '<div style="margin-bottom:20px;">';
    printContent += '<h3 style="color:var(--color-brown-700); margin:0 0 10px 0;">Report Findings / Results</h3>';
    printContent += '<div style="background:#fefcf9; padding:15px; border-radius:8px; border:1px solid var(--border-default);">';
    printContent += '<pre style="white-space:pre-wrap; font-family:monospace; margin:0; font-size:14px; line-height:1.6;">' + esc(report.content || 'No content available') + '</pre>';
    printContent += '</div></div>';
    
    printContent += '<div class="print-footer">';
    printContent += '<p>This is a computer-generated report. Valid with digital signature.</p>';
    printContent += '<p>MedFlow Hospital - www.medflow.com</p>';
    printContent += '</div></div>';
    
    var printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>Report - ' + esc(report.testName || 'Untitled') + ' - ' + esc(report.patientName || 'Unknown') + '</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('*{margin:0;padding:0;box-sizing:border-box;}');
        printWindow.document.write('body{font-family:Poppins, Arial, sans-serif;background:white;padding:20px;}');
        printWindow.document.write('.print-report{max-width:800px;margin:0 auto;padding:40px;background:white;}');
        printWindow.document.write('.print-header{text-align:center;border-bottom:2px solid #a8c49a;padding-bottom:20px;margin-bottom:30px;}');
        printWindow.document.write('.print-header h1{color:#5a4a3a;margin:0;}');
        printWindow.document.write('table{width:100%;border-collapse:collapse;margin-bottom:20px;}');
        printWindow.document.write('table td{padding:10px 12px;border:1px solid #f0e8e0;}');
        printWindow.document.write('.label-cell{background:#fefcf9;font-weight:600;}');
        printWindow.document.write('.print-footer{text-align:center;margin-top:50px;padding-top:20px;border-top:1px solid #f0e8e0;color:#b8aa9a;font-size:12px;}');
        printWindow.document.write('@media print{body{padding:0;}.print-report{padding:20px;}}');
        printWindow.document.write('</style></head><body>' + printContent + '</body></html>');
        printWindow.document.close();
        printWindow.print();
        showToast('Opening print dialog...', 'success');
    } else {
        showToast('Please allow popups to print', 'error');
    }
}

// ─── Delete ─────────────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    var report = null;
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].id === deleteTargetId) { report = reports[i]; break; }
    }
    
    reports = reports.filter(function(r) { return r.id !== deleteTargetId; });
    saveReports();
    refreshUI();
    closeModal('deleteModal');
    
    if (report) {
        showToast('🗑️ "' + esc(report.testName || 'Untitled Report') + '" deleted successfully', 'success');
    }
    deleteTargetId = null;
}

// ─── Init ──────────────────────────────────────────────────────────────

function initReportsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    
    // Event Listeners
    document.getElementById('addReportBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn').addEventListener('click', function() { closeModal('reportModal'); });
    document.getElementById('cancelModalBtn').addEventListener('click', function() { closeModal('reportModal'); });
    document.getElementById('closeViewModalBtn').addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('closeViewFooterBtn').addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('closeDeleteModalBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('reportForm').addEventListener('submit', saveReport);
    document.getElementById('refreshBtn').addEventListener('click', function() { refreshUI(); showToast('Refreshed', 'info'); });
    document.getElementById('printReportBtn').addEventListener('click', printReport);
    document.getElementById('editFromViewBtn').addEventListener('click', function() {
        if (viewTargetId) {
            closeModal('viewModal');
            setTimeout(function() { openEditModal(viewTargetId); }, 300);
        }
    });
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        typeFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
        renderReports();
        showToast('Filters reset', 'info');
    });
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderReports();
    });
    
    document.getElementById('typeFilter').addEventListener('change', function(e) {
        typeFilter = e.target.value;
        renderReports();
    });
    
    // Real-time validation
    document.getElementById('patientName').addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('patientError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('reportType').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('typeError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('testName').addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('testError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('reportDate').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('dateError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('reportContent').addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('contentError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    // Close modals on overlay click
    document.getElementById('reportModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('reportModal');
    });
    document.getElementById('viewModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewModal');
    });
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('reportModal');
            closeModal('viewModal');
            closeModal('deleteModal');
        }
    });
    
    console.log('📊 Reports Storage Module initialized successfully');
}

// ─── Auto-init ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkReady = setInterval(function() {
        if (document.getElementById('mainSidebar') && document.getElementById('header-container')) {
            clearInterval(checkReady);
            initReportsModule();
        }
    }, 100);
    
    setTimeout(function() {
        if (!isInitialized) {
            initReportsModule();
        }
    }, 2000);
});

// ─── Expose for debugging ─────────────────────────────────────────────

window.reportsModule = {
    reports: reports,
    patients: patients,
    refreshUI: refreshUI,
    addReport: openAddModal,
    viewReport: viewReport,
    printReport: printReport
};