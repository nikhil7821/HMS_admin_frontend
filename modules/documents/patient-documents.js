/**
 * Patient Documents Management Module
 * Version: 3.0 - COMPLETE PROFESSIONAL UPGRADE
 * 
 * Features:
 * ✅ Full CRUD operations
 * ✅ File upload with drag & drop
 * ✅ Document categorization
 * ✅ Patient linking
 * ✅ Search and filter
 * ✅ Real-time stats
 * ✅ Download functionality
 * ✅ Professional UI
 */

let documents = [];
let patients = [];
let deleteTargetId = null;
let downloadTargetId = null;
let searchTerm = '';
let patientFilter = '';
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

function getBadgeClass(type) {
    var map = {
        'Report': 'badge-report',
        'Prescription': 'badge-prescription',
        'Discharge Summary': 'badge-discharge',
        'Insurance': 'badge-insurance'
    };
    return map[type] || 'badge-other';
}

function getTypeIcon(type) {
    var map = {
        'Report': 'fa-file-alt',
        'Prescription': 'fa-prescription-bottle',
        'Discharge Summary': 'fa-download',
        'Insurance': 'fa-shield-alt'
    };
    return map[type] || 'fa-file';
}

function getFileIcon(fileName) {
    if (!fileName) return 'fa-file';
    var ext = fileName.split('.').pop().toLowerCase();
    var map = {
        'pdf': 'fa-file-pdf',
        'jpg': 'fa-file-image',
        'jpeg': 'fa-file-image',
        'png': 'fa-file-image',
        'doc': 'fa-file-word',
        'docx': 'fa-file-word',
        'xls': 'fa-file-excel',
        'xlsx': 'fa-file-excel'
    };
    return map[ext] || 'fa-file';
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
        // Load patients
        var storedPatients = localStorage.getItem('hms_patients');
        if (storedPatients) {
            patients = JSON.parse(storedPatients);
        } else {
            patients = [
                { id: 1, fullName: 'Rajesh Kumar', phone: '9876543210', age: 45, gender: 'Male' },
                { id: 2, fullName: 'Priya Sharma', phone: '9876543211', age: 32, gender: 'Female' },
                { id: 3, fullName: 'Amit Patel', phone: '9876543212', age: 28, gender: 'Male' },
                { id: 4, fullName: 'Sunita Verma', phone: '9876543213', age: 55, gender: 'Female' },
                { id: 5, fullName: 'Vikram Singh', phone: '9876543214', age: 38, gender: 'Male' }
            ];
            localStorage.setItem('hms_patients', JSON.stringify(patients));
        }
        
        // Load documents
        var storedDocs = localStorage.getItem('patient_documents');
        if (storedDocs) {
            documents = JSON.parse(storedDocs);
        } else {
            createSampleData();
        }
        
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading document data:', error);
        showToast('Error loading document data', 'error');
    }
}

function createSampleData() {
    var today = new Date().toISOString().split('T')[0];
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var yesterdayStr = yesterday.toISOString().split('T')[0];
    var lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    var lastWeekStr = lastWeek.toISOString().split('T')[0];
    
    documents = [
        { 
            id: 1, 
            patientId: 1, 
            patientName: 'Rajesh Kumar', 
            type: 'Report', 
            title: 'Blood Test Report - June 2024', 
            description: 'Complete blood count and lipid profile. All values within normal range.', 
            fileName: 'blood_test_rajesh.pdf', 
            fileSize: '1.2 MB', 
            uploadDate: today,
            fileData: 'BASE64_ENCODED_DATA_PLACEHOLDER'
        },
        { 
            id: 2, 
            patientId: 1, 
            patientName: 'Rajesh Kumar', 
            type: 'Prescription', 
            title: 'Diabetes Medication Prescription', 
            description: 'Metformin 500mg - Twice daily with meals. Review after 3 months.', 
            fileName: 'prescription_rajesh.pdf', 
            fileSize: '0.8 MB', 
            uploadDate: yesterdayStr,
            fileData: 'BASE64_ENCODED_DATA_PLACEHOLDER'
        },
        { 
            id: 3, 
            patientId: 2, 
            patientName: 'Priya Sharma', 
            type: 'Report', 
            title: 'X-Ray Report - Chest', 
            description: 'Chest X-Ray - Post COVID follow up. Mild residual scarring observed.', 
            fileName: 'xray_priya.pdf', 
            fileSize: '2.1 MB', 
            uploadDate: today,
            fileData: 'BASE64_ENCODED_DATA_PLACEHOLDER'
        },
        { 
            id: 4, 
            patientId: 2, 
            patientName: 'Priya Sharma', 
            type: 'Discharge Summary', 
            title: 'Discharge Summary - Apollo Hospital', 
            description: 'Post-surgery discharge from Apollo Hospital. Follow up in 2 weeks.', 
            fileName: 'discharge_priya.pdf', 
            fileSize: '1.5 MB', 
            uploadDate: yesterdayStr,
            fileData: 'BASE64_ENCODED_DATA_PLACEHOLDER'
        },
        { 
            id: 5, 
            patientId: 3, 
            patientName: 'Amit Patel', 
            type: 'Insurance', 
            title: 'Health Insurance Policy Documents', 
            description: 'Star Health Insurance Policy #SHI-2024-001. Coverage up to ₹5 Lakhs.', 
            fileName: 'insurance_amit.pdf', 
            fileSize: '3.2 MB', 
            uploadDate: lastWeekStr,
            fileData: 'BASE64_ENCODED_DATA_PLACEHOLDER'
        },
        { 
            id: 6, 
            patientId: 4, 
            patientName: 'Sunita Verma', 
            type: 'Report', 
            title: 'MRI Scan Report - Brain', 
            description: 'MRI Brain with contrast - Normal study. No abnormalities detected.', 
            fileName: 'mri_sunita.pdf', 
            fileSize: '4.5 MB', 
            uploadDate: today,
            fileData: 'BASE64_ENCODED_DATA_PLACEHOLDER'
        },
        { 
            id: 7, 
            patientId: 5, 
            patientName: 'Vikram Singh', 
            type: 'Prescription', 
            title: 'Hypertension Medication', 
            description: 'Amlodipine 5mg - Once daily. Monitor blood pressure regularly.', 
            fileName: 'prescription_vikram.pdf', 
            fileSize: '0.6 MB', 
            uploadDate: yesterdayStr,
            fileData: 'BASE64_ENCODED_DATA_PLACEHOLDER'
        }
    ];
    saveDocuments();
}

function saveDocuments() {
    try {
        localStorage.setItem('patient_documents', JSON.stringify(documents));
    } catch (error) {
        console.error('Error saving documents:', error);
    }
}

// ─── Stats ─────────────────────────────────────────────────────────────

function updateStats() {
    var total = documents.length;
    var reports = 0, prescriptions = 0, others = 0;
    for (var i = 0; i < documents.length; i++) {
        if (documents[i].type === 'Report') reports++;
        else if (documents[i].type === 'Prescription') prescriptions++;
        else others++;
    }
    
    document.getElementById('totalDocs').textContent = total;
    document.getElementById('reportCount').textContent = reports;
    document.getElementById('prescriptionCount').textContent = prescriptions;
    document.getElementById('otherCount').textContent = others;
}

// ─── Populate Filters ───────────────────────────────────────────────

function populateFilters() {
    // Patient filter
    var filterSelect = document.getElementById('patientFilter');
    if (filterSelect) {
        var html = '<option value="">All Patients</option>';
        for (var i = 0; i < patients.length; i++) {
            html += '<option value="' + patients[i].id + '">' + esc(patients[i].fullName) + ' (' + patients[i].phone + ')</option>';
        }
        filterSelect.innerHTML = html;
    }
    
    // Patient select in modal
    var patientSelect = document.getElementById('patientId');
    if (patientSelect) {
        var html2 = '<option value="">-- Select Patient --</option>';
        for (var j = 0; j < patients.length; j++) {
            html2 += '<option value="' + patients[j].id + '">' + esc(patients[j].fullName) + ' (' + patients[j].phone + ')</option>';
        }
        patientSelect.innerHTML = html2;
    }
}

// ─── Filter ──────────────────────────────────────────────────────────────

function getFilteredDocuments() {
    var result = [];
    for (var i = 0; i < documents.length; i++) {
        var doc = documents[i];
        var matchesSearch = searchTerm === '' || 
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesPatient = patientFilter === '' || doc.patientId.toString() === patientFilter;
        var matchesType = typeFilter === '' || doc.type === typeFilter;
        if (matchesSearch && matchesPatient && matchesType) {
            result.push(doc);
        }
    }
    // Sort by upload date (newest first)
    result.sort(function(a, b) {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
    });
    return result;
}

// ─── Render ──────────────────────────────────────────────────────────────

function renderDocuments() {
    var grid = document.getElementById('documentsGrid');
    if (!grid) return;
    
    var filtered = getFilteredDocuments();
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No documents found</p><p style="font-size:0.75rem; margin-top:0.25rem;">Upload a document to get started.</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var doc = filtered[i];
        var badgeClass = getBadgeClass(doc.type);
        var typeIcon = getTypeIcon(doc.type);
        var fileIcon = getFileIcon(doc.fileName);
        var isReport = doc.type === 'Report';
        var isPrescription = doc.type === 'Prescription';
        
        html += '<div class="doc-card" data-id="' + doc.id + '">';
        html += '<div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:0.75rem;">';
        html += '<div style="display:flex; align-items:center; gap:0.75rem;">';
        html += '<div style="width:2.5rem; height:2.5rem; background:var(--bg-muted); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center;"><i class="fas ' + fileIcon + '" style="color:var(--color-sage); font-size:1rem;"></i></div>';
        html += '<div><h3 class="doc-title">' + esc(doc.title) + '</h3><p class="doc-patient">' + esc(doc.patientName) + '</p></div>';
        html += '</div>';
        html += '<span class="' + badgeClass + '">' + doc.type + '</span>';
        html += '</div>';
        
        if (doc.description) {
            html += '<p class="doc-description">' + esc(doc.description) + '</p>';
        }
        
        html += '<div class="doc-meta">';
        html += '<span><i class="fas fa-calendar"></i> ' + formatDate(doc.uploadDate) + '</span>';
        html += '<span><i class="fas fa-file"></i> ' + (doc.fileSize || '0.5 MB') + '</span>';
        html += '</div>';
        
        html += '<div style="display:flex; gap:0.5rem; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">';
        html += '<button class="card-btn card-btn-primary view-btn" data-id="' + doc.id + '"><i class="fas fa-eye"></i> View</button>';
        html += '<button class="card-btn card-btn-primary download-btn" data-id="' + doc.id + '" style="background:var(--color-info-text);"><i class="fas fa-download"></i></button>';
        html += '<button class="card-btn card-btn-danger delete-btn" data-id="' + doc.id + '"><i class="fas fa-trash"></i></button>';
        html += '</div></div>';
    }
    grid.innerHTML = html;
    
    // Bind events
    grid.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { viewDocument(parseInt(this.dataset.id)); });
    });
    grid.querySelectorAll('.download-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { downloadDocument(parseInt(this.dataset.id)); });
    });
    grid.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(parseInt(this.dataset.id)); });
    });
}

function refreshUI() {
    updateStats();
    renderDocuments();
}

// ─── Validation ─────────────────────────────────────────────────────────

function validateDocumentForm() {
    var isValid = true;
    var patientId = document.getElementById('patientId').value;
    var docType = document.getElementById('docType').value;
    var title = document.getElementById('docTitle').value.trim();
    var uploadDate = document.getElementById('uploadDate').value;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(function(el) { el.textContent = ''; });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    
    if (!patientId) {
        document.getElementById('patientError').textContent = 'Please select a patient';
        document.getElementById('patientId').classList.add('error');
        isValid = false;
    }
    
    if (!docType) {
        document.getElementById('docTypeError').textContent = 'Please select document type';
        document.getElementById('docType').classList.add('error');
        isValid = false;
    }
    
    if (!title) {
        document.getElementById('titleError').textContent = 'Document title is required';
        document.getElementById('docTitle').classList.add('error');
        isValid = false;
    } else if (title.length < 3) {
        document.getElementById('titleError').textContent = 'Title must be at least 3 characters';
        document.getElementById('docTitle').classList.add('error');
        isValid = false;
    }
    
    if (!uploadDate) {
        document.getElementById('dateError').textContent = 'Please select upload date';
        document.getElementById('uploadDate').classList.add('error');
        isValid = false;
    } else {
        var selectedDate = new Date(uploadDate);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
            document.getElementById('dateError').textContent = 'Upload date cannot be in the future';
            document.getElementById('uploadDate').classList.add('error');
            isValid = false;
        }
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

function openUploadModal() {
    document.getElementById('uploadForm').reset();
    document.getElementById('docId').value = '';
    document.getElementById('uploadDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('fileNameDisplay').classList.add('hidden');
    document.getElementById('fileNameDisplay').textContent = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-upload" style="color:var(--color-sage);"></i> Upload Document';
    
    document.querySelectorAll('.error-message').forEach(function(el) { el.textContent = ''; });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    
    populateFilters();
    openModal('uploadModal');
}

function openEditModal(id) {
    var doc = null;
    for (var i = 0; i < documents.length; i++) {
        if (documents[i].id === id) { doc = documents[i]; break; }
    }
    if (!doc) return;
    
    document.getElementById('docId').value = doc.id;
    document.getElementById('patientId').value = doc.patientId;
    document.getElementById('docType').value = doc.type;
    document.getElementById('docTitle').value = doc.title;
    document.getElementById('docDesc').value = doc.description || '';
    document.getElementById('uploadDate').value = doc.uploadDate;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Document';
    
    if (doc.fileName) {
        document.getElementById('fileNameDisplay').textContent = '📎 Current: ' + doc.fileName + ' (' + (doc.fileSize || '0.5 MB') + ')';
        document.getElementById('fileNameDisplay').classList.remove('hidden');
    }
    
    document.querySelectorAll('.error-message').forEach(function(el) { el.textContent = ''; });
    document.querySelectorAll('.form-input, .form-select').forEach(function(el) { el.classList.remove('error'); });
    
    populateFilters();
    openModal('uploadModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Save Document ──────────────────────────────────────────────────────

function saveDocument(e) {
    e.preventDefault();
    if (!validateDocumentForm()) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    var id = document.getElementById('docId').value;
    var patientId = parseInt(document.getElementById('patientId').value);
    var docType = document.getElementById('docType').value;
    var title = document.getElementById('docTitle').value.trim();
    var description = document.getElementById('docDesc').value.trim();
    var uploadDate = document.getElementById('uploadDate').value;
    
    var patient = null;
    for (var i = 0; i < patients.length; i++) {
        if (patients[i].id === patientId) { patient = patients[i]; break; }
    }
    if (!patient) {
        showToast('Invalid patient selected', 'error');
        return;
    }
    
    var fileInput = document.getElementById('fileInput');
    var fileName = 'document_' + Date.now() + '.pdf';
    var fileSize = '0.5 MB';
    var fileData = null;
    
    if (fileInput.files && fileInput.files[0]) {
        fileName = fileInput.files[0].name;
        fileSize = (fileInput.files[0].size / (1024 * 1024)).toFixed(1) + ' MB';
        // Read file as base64 for storage simulation
        var reader = new FileReader();
        reader.onload = function(e) {
            fileData = e.target.result;
            // Continue with save
            performSave(id, patientId, patient.fullName, docType, title, description, fileName, fileSize, uploadDate, fileData);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        // No new file selected, keep existing
        performSave(id, patientId, patient.fullName, docType, title, description, fileName, fileSize, uploadDate, null);
    }
}

function performSave(id, patientId, patientName, docType, title, description, fileName, fileSize, uploadDate, fileData) {
    var docData = {
        patientId: patientId,
        patientName: patientName,
        type: docType,
        title: title,
        description: description,
        fileName: fileName,
        fileSize: fileSize,
        uploadDate: uploadDate
    };
    
    if (fileData) {
        docData.fileData = fileData;
    }
    
    if (id) {
        var index = -1;
        for (var i = 0; i < documents.length; i++) {
            if (documents[i].id === parseInt(id)) { index = i; break; }
        }
        if (index !== -1) {
            // Preserve existing fileData if no new file
            if (!fileData && documents[index].fileData) {
                docData.fileData = documents[index].fileData;
            }
            documents[index] = { id: documents[index].id, ...docData };
            showToast('✅ Document updated successfully', 'success');
        }
    } else {
        var newId = documents.length > 0 ? Math.max(...documents.map(function(d) { return d.id; })) + 1 : 1;
        documents.push({ id: newId, ...docData });
        showToast('✅ Document uploaded successfully', 'success');
    }
    
    saveDocuments();
    refreshUI();
    closeModal('uploadModal');
}

// ─── View Document ───────────────────────────────────────────────────────

function viewDocument(id) {
    var doc = null;
    for (var i = 0; i < documents.length; i++) {
        if (documents[i].id === id) { doc = documents[i]; break; }
    }
    if (!doc) {
        showToast('Document not found', 'error');
        return;
    }
    
    var titleEl = document.getElementById('viewModalTitle');
    if (titleEl) {
        titleEl.innerHTML = '<i class="fas ' + getTypeIcon(doc.type) + '" style="color:var(--color-sage); margin-right:0.5rem;"></i> ' + esc(doc.title);
    }
    
    var viewContent = document.getElementById('viewContent');
    if (viewContent) {
        var badgeClass = getBadgeClass(doc.type);
        var fileIcon = getFileIcon(doc.fileName);
        
        viewContent.innerHTML = '';
        
        viewContent.innerHTML += '<div class="detail-grid">';
        viewContent.innerHTML += '<div><p class="detail-label">Patient Name</p><p class="detail-value">' + esc(doc.patientName) + '</p></div>';
        viewContent.innerHTML += '<div><p class="detail-label">Document Type</p><p class="detail-value"><span class="' + badgeClass + '">' + doc.type + '</span></p></div>';
        viewContent.innerHTML += '<div><p class="detail-label">Upload Date</p><p class="detail-value">' + formatDate(doc.uploadDate) + '</p></div>';
        viewContent.innerHTML += '<div><p class="detail-label">File Size</p><p class="detail-value">' + (doc.fileSize || '0.5 MB') + '</p></div>';
        viewContent.innerHTML += '<div style="grid-column:1 / -1;"><p class="detail-label">File Name</p><p class="detail-value" style="font-weight:var(--font-weight-light);">' + esc(doc.fileName) + '</p></div>';
        viewContent.innerHTML += '</div>';
        
        if (doc.description) {
            viewContent.innerHTML += '<div class="detail-section" style="margin-top:0.75rem;"><p class="detail-label">Description</p><p class="detail-value" style="color:var(--color-brown-300); font-size:0.8125rem;">' + esc(doc.description) + '</p></div>';
        }
        
        viewContent.innerHTML += '<div class="file-preview" style="margin-top:0.75rem;">';
        viewContent.innerHTML += '<i class="fas ' + fileIcon + '"></i>';
        viewContent.innerHTML += '<p class="file-name">' + esc(doc.fileName) + '</p>';
        viewContent.innerHTML += '<button onclick="downloadDocument(' + doc.id + ')" class="btn-primary" style="margin-top:0.75rem; padding:0.375rem 1rem; font-size:0.75rem;"><i class="fas fa-download"></i> Download File</button>';
        viewContent.innerHTML += '</div>';
        
        // Store current document ID for download button
        downloadTargetId = doc.id;
    }
    
    openModal('viewModal');
}

// ─── Download Document ──────────────────────────────────────────────────

function downloadDocument(id) {
    var doc = null;
    for (var i = 0; i < documents.length; i++) {
        if (documents[i].id === id) { doc = documents[i]; break; }
    }
    if (!doc) {
        showToast('Document not found', 'error');
        return;
    }
    
    // Create a blob from base64 data or generate a sample
    var content = 'Document: ' + doc.title + '\n';
    content += 'Patient: ' + doc.patientName + '\n';
    content += 'Type: ' + doc.type + '\n';
    content += 'Date: ' + doc.uploadDate + '\n';
    content += 'Description: ' + (doc.description || 'N/A') + '\n';
    content += 'File: ' + doc.fileName + '\n';
    content += 'Size: ' + (doc.fileSize || '0.5 MB') + '\n\n';
    content += 'This is a sample document content for demonstration purposes.\n';
    content += 'In a production environment, this would contain the actual file data.';
    
    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    
    var a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || 'document_' + doc.id + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📥 Downloading "' + doc.fileName + '"...', 'success');
}

// ─── Delete ─────────────────────────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    var doc = null;
    for (var i = 0; i < documents.length; i++) {
        if (documents[i].id === deleteTargetId) { doc = documents[i]; break; }
    }
    
    documents = documents.filter(function(item) { return item.id !== deleteTargetId; });
    saveDocuments();
    refreshUI();
    closeModal('deleteModal');
    
    if (doc) {
        showToast('🗑️ "' + esc(doc.title) + '" deleted successfully', 'success');
    }
    deleteTargetId = null;
}

// ─── File Upload Handling ──────────────────────────────────────────────

function setupFileUpload() {
    var dropZone = document.getElementById('dropZone');
    var fileInput = document.getElementById('fileInput');
    var fileNameDisplay = document.getElementById('fileNameDisplay');
    
    if (!dropZone || !fileInput) return;
    
    dropZone.addEventListener('click', function() { fileInput.click(); });
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dropzone-active');
    });
    
    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('dropzone-active');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dropzone-active');
        var file = e.dataTransfer.files[0];
        if (file) {
            fileInput.files = e.dataTransfer.files;
            if (fileNameDisplay) {
                fileNameDisplay.textContent = '✅ Selected: ' + file.name + ' (' + (file.size / 1024 / 1024).toFixed(2) + ' MB)';
                fileNameDisplay.classList.remove('hidden');
            }
        }
    });
    
    fileInput.addEventListener('change', function() {
        if (fileInput.files && fileInput.files[0]) {
            var file = fileInput.files[0];
            if (fileNameDisplay) {
                fileNameDisplay.textContent = '✅ Selected: ' + file.name + ' (' + (file.size / 1024 / 1024).toFixed(2) + ' MB)';
                fileNameDisplay.classList.remove('hidden');
            }
        }
    });
}

// ─── Init ──────────────────────────────────────────────────────────────

function initDocumentsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    setupFileUpload();
    
    // Event Listeners
    document.getElementById('uploadDocBtn').addEventListener('click', openUploadModal);
    document.getElementById('closeUploadModalBtn').addEventListener('click', function() { closeModal('uploadModal'); });
    document.getElementById('cancelUploadBtn').addEventListener('click', function() { closeModal('uploadModal'); });
    document.getElementById('closeViewModalBtn').addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('closeViewFooterBtn').addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('downloadDocBtn').addEventListener('click', function() { 
        if (downloadTargetId) {
            downloadDocument(downloadTargetId);
        } else {
            showToast('No document selected for download', 'warning');
        }
    });
    document.getElementById('closeDeleteModalBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('uploadForm').addEventListener('submit', saveDocument);
    document.getElementById('refreshBtn').addEventListener('click', function() { refreshUI(); showToast('Refreshed', 'info'); });
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        patientFilter = '';
        typeFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('patientFilter').value = '';
        document.getElementById('typeFilter').value = '';
        renderDocuments();
        showToast('Filters reset', 'info');
    });
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderDocuments();
    });
    
    document.getElementById('patientFilter').addEventListener('change', function(e) {
        patientFilter = e.target.value;
        renderDocuments();
    });
    
    document.getElementById('typeFilter').addEventListener('change', function(e) {
        typeFilter = e.target.value;
        renderDocuments();
    });
    
    // Real-time validation
    document.getElementById('patientId').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('patientError').textContent = '';
            this.classList.remove('error');
        }
    });
    
    document.getElementById('docType').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('docTypeError').textContent = '';
            this.classList.remove('error');
        }
    });
    
    document.getElementById('docTitle').addEventListener('input', function() {
        if (this.value.trim().length >= 3) {
            document.getElementById('titleError').textContent = '';
            this.classList.remove('error');
        }
    });
    
    document.getElementById('uploadDate').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('dateError').textContent = '';
            this.classList.remove('error');
        }
    });
    
    // Close modals on overlay click
    document.getElementById('uploadModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('uploadModal');
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
            closeModal('uploadModal');
            closeModal('viewModal');
            closeModal('deleteModal');
        }
    });
    
    console.log('📄 Patient Documents Module initialized successfully');
}

// ─── Auto-init ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkReady = setInterval(function() {
        if (document.getElementById('mainSidebar') && document.getElementById('header-container')) {
            clearInterval(checkReady);
            initDocumentsModule();
        }
    }, 100);
    
    setTimeout(function() {
        if (!isInitialized) {
            initDocumentsModule();
        }
    }, 2000);
});

// ─── Expose for debugging ─────────────────────────────────────────────

window.documentsModule = {
    documents: documents,
    patients: patients,
    refreshUI: refreshUI,
    uploadDocument: openUploadModal,
    viewDocument: viewDocument,
    downloadDocument: downloadDocument
};