/**
 * Patient Documents Management Module
 * MedFlow - Patient Medical Records & Documents CRUD
 * Uses theme.css for styling, clean event handling
 */

var documents = [];
var patients = [];
var deleteTargetId = null;
var searchTerm = '';
var patientFilter = '';
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

function loadData() {
    try {
        // Load patients
        var storedPatients = localStorage.getItem('hms_patients');
        if (storedPatients) {
            patients = JSON.parse(storedPatients);
        } else {
            patients = [
                { id: 1, fullName: 'Rajesh Kumar', phone: '9876543210', age: 45 },
                { id: 2, fullName: 'Priya Sharma', phone: '9876543211', age: 32 },
                { id: 3, fullName: 'Amit Patel', phone: '9876543212', age: 28 },
                { id: 4, fullName: 'Sunita Verma', phone: '9876543213', age: 55 },
                { id: 5, fullName: 'Vikram Singh', phone: '9876543214', age: 38 }
            ];
            localStorage.setItem('hms_patients', JSON.stringify(patients));
        }
        
        // Load documents
        var storedDocs = localStorage.getItem('patient_documents');
        if (storedDocs) {
            documents = JSON.parse(storedDocs);
        } else {
            var today = new Date().toISOString().split('T')[0];
            documents = [
                { id: 1, patientId: 1, patientName: 'Rajesh Kumar', type: 'Report', title: 'Blood Test Report - June 2024', description: 'Complete blood count and lipid profile', fileName: 'blood_test_rajesh.pdf', fileSize: '1.2 MB', uploadDate: today },
                { id: 2, patientId: 1, patientName: 'Rajesh Kumar', type: 'Prescription', title: 'Diabetes Medication Prescription', description: 'Metformin 500mg - Twice daily', fileName: 'prescription_rajesh.pdf', fileSize: '0.8 MB', uploadDate: today },
                { id: 3, patientId: 2, patientName: 'Priya Sharma', type: 'Report', title: 'X-Ray Report', description: 'Chest X-Ray - Post COVID follow up', fileName: 'xray_priya.pdf', fileSize: '2.1 MB', uploadDate: today },
                { id: 4, patientId: 2, patientName: 'Priya Sharma', type: 'Discharge Summary', title: 'Discharge Summary', description: 'Post-surgery discharge from Apollo Hospital', fileName: 'discharge_priya.pdf', fileSize: '1.5 MB', uploadDate: today },
                { id: 5, patientId: 3, patientName: 'Amit Patel', type: 'Insurance', title: 'Health Insurance Documents', description: 'Star Health Insurance Policy', fileName: 'insurance_amit.pdf', fileSize: '3.2 MB', uploadDate: today }
            ];
            saveDocuments();
        }
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading document data', 'error');
    }
}

function saveDocuments() {
    try {
        localStorage.setItem('patient_documents', JSON.stringify(documents));
    } catch (error) {
        console.error('Error saving documents:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

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

// ─── Populate Filters ──────────────────────────────

function populateFilters() {
    var filterSelect = document.getElementById('patientFilter');
    if (filterSelect) {
        var html = '<option value="">All Patients</option>';
        for (var i = 0; i < patients.length; i++) {
            html += '<option value="' + patients[i].id + '">' + esc(patients[i].fullName) + ' (' + patients[i].phone + ')</option>';
        }
        filterSelect.innerHTML = html;
    }
    
    var patientSelect = document.getElementById('patientId');
    if (patientSelect) {
        var html2 = '<option value="">-- Select Patient --</option>';
        for (var j = 0; j < patients.length; j++) {
            html2 += '<option value="' + patients[j].id + '">' + esc(patients[j].fullName) + ' (' + patients[j].phone + ')</option>';
        }
        patientSelect.innerHTML = html2;
    }
}

// ─── Filter ──────────────────────────────────────────

function getFilteredDocuments() {
    return documents.filter(function(doc) {
        var matchesSearch = searchTerm === '' || 
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesPatient = patientFilter === '' || doc.patientId.toString() === patientFilter;
        var matchesType = typeFilter === '' || doc.type === typeFilter;
        return matchesSearch && matchesPatient && matchesType;
    });
}

// ─── Render ──────────────────────────────────────────

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

function renderDocuments() {
    var grid = document.getElementById('documentsGrid');
    if (!grid) return;
    
    var filtered = getFilteredDocuments();
    filtered.sort(function(a, b) {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-folder-open" style="font-size:2rem; margin-bottom:0.75rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No documents found</p><p style="font-size:0.75rem; margin-top:0.25rem;">Upload a document to get started.</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var doc = filtered[i];
        var badgeClass = getBadgeClass(doc.type);
        var typeIcon = getTypeIcon(doc.type);
        
        html += '<div class="doc-card">';
        html += '<div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:0.75rem;">';
        html += '<div style="display:flex; align-items:center; gap:0.75rem;">';
        html += '<div style="width:2.5rem; height:2.5rem; background:var(--bg-muted); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center;"><i class="fas ' + typeIcon + '" style="color:var(--color-sage); font-size:1rem;"></i></div>';
        html += '<div><h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem; margin:0;">' + esc(doc.title) + '</h3><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">' + esc(doc.patientName) + '</p></div>';
        html += '</div>';
        html += '<span class="' + badgeClass + '">' + doc.type + '</span>';
        html += '</div>';
        
        if (doc.description) {
            html += '<p style="color:var(--color-brown-300); font-size:0.75rem; margin-top:0.5rem;">' + esc(doc.description) + '</p>';
        }
        
        html += '<div style="display:flex; justify-content:space-between; color:var(--color-brown-100); font-size:0.6875rem; margin-top:0.5rem;">';
        html += '<span><i class="fas fa-calendar"></i> ' + doc.uploadDate + '</span>';
        html += '<span><i class="fas fa-file"></i> ' + (doc.fileSize || '0.5 MB') + '</span>';
        html += '</div>';
        
        html += '<div style="display:flex; gap:0.5rem; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">';
        html += '<button class="card-btn card-btn-primary view-btn" data-id="' + doc.id + '"><i class="fas fa-eye"></i> View</button>';
        html += '<button class="card-btn card-btn-danger delete-btn" data-id="' + doc.id + '"><i class="fas fa-trash"></i></button>';
        html += '</div></div>';
    }
    grid.innerHTML = html;
    
    // Bind events
    grid.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { viewDocument(parseInt(this.dataset.id)); });
    });
    grid.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(parseInt(this.dataset.id)); });
    });
}

function refreshUI() {
    updateStats();
    renderDocuments();
}

// ─── Validation ──────────────────────────────────────

function validateDocumentForm(patientId, docType, title, uploadDate) {
    var isValid = true;
    
    var errorFields = ['patientError', 'docTypeError', 'titleError', 'dateError'];
    for (var i = 0; i < errorFields.length; i++) {
        var el = document.getElementById(errorFields[i]);
        if (el) el.textContent = '';
    }
    
    var patientSelect = document.getElementById('patientId');
    var typeSelect = document.getElementById('docType');
    var titleInput = document.getElementById('docTitle');
    var dateInput = document.getElementById('uploadDate');
    
    if (patientSelect) patientSelect.classList.remove('error');
    if (typeSelect) typeSelect.classList.remove('error');
    if (titleInput) titleInput.classList.remove('error');
    if (dateInput) dateInput.classList.remove('error');
    
    if (!patientId) {
        var errEl = document.getElementById('patientError');
        if (errEl) errEl.textContent = 'Please select a patient';
        if (patientSelect) patientSelect.classList.add('error');
        isValid = false;
    }
    
    if (!docType) {
        var errEl2 = document.getElementById('docTypeError');
        if (errEl2) errEl2.textContent = 'Please select document type';
        if (typeSelect) typeSelect.classList.add('error');
        isValid = false;
    }
    
    if (!title || title.trim() === '') {
        var errEl3 = document.getElementById('titleError');
        if (errEl3) errEl3.textContent = 'Document title is required';
        if (titleInput) titleInput.classList.add('error');
        isValid = false;
    } else if (title.trim().length < 3) {
        var errEl4 = document.getElementById('titleError');
        if (errEl4) errEl4.textContent = 'Title must be at least 3 characters';
        if (titleInput) titleInput.classList.add('error');
        isValid = false;
    }
    
    if (!uploadDate) {
        var errEl5 = document.getElementById('dateError');
        if (errEl5) errEl5.textContent = 'Please select upload date';
        if (dateInput) dateInput.classList.add('error');
        isValid = false;
    } else {
        var selectedDate = new Date(uploadDate);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
            var errEl6 = document.getElementById('dateError');
            if (errEl6) errEl6.textContent = 'Upload date cannot be in the future';
            if (dateInput) dateInput.classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
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

function openUploadModal() {
    document.getElementById('uploadForm').reset();
    document.getElementById('docId').value = '';
    document.getElementById('uploadDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('fileNameDisplay').classList.add('hidden');
    document.getElementById('fileNameDisplay').textContent = '';
    
    var errorFields = ['patientError', 'docTypeError', 'titleError', 'dateError'];
    for (var i = 0; i < errorFields.length; i++) {
        var el = document.getElementById(errorFields[i]);
        if (el) el.textContent = '';
    }
    var inputs = ['patientId', 'docType', 'docTitle', 'uploadDate'];
    for (var j = 0; j < inputs.length; j++) {
        var el2 = document.getElementById(inputs[j]);
        if (el2) el2.classList.remove('error');
    }
    
    populateFilters();
    openModal('uploadModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveDocument(e) {
    e.preventDefault();
    
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
    
    var fileInput = document.getElementById('fileInput');
    var fileName = 'document_' + Date.now() + '.pdf';
    var fileSize = '0.5 MB';
    
    if (fileInput.files && fileInput.files[0]) {
        fileName = fileInput.files[0].name;
        fileSize = (fileInput.files[0].size / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    if (!validateDocumentForm(patientId, docType, title, uploadDate)) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    if (!patient) {
        showToast('Invalid patient selected', 'error');
        return;
    }
    
    var docData = {
        patientId: patientId,
        patientName: patient.fullName,
        type: docType,
        title: title,
        description: description,
        fileName: fileName,
        fileSize: fileSize,
        uploadDate: uploadDate
    };
    
    if (id) {
        var index = -1;
        for (var k = 0; k < documents.length; k++) {
            if (documents[k].id === parseInt(id)) { index = k; break; }
        }
        if (index !== -1) {
            documents[index] = { id: documents[index].id, patientId: patientId, patientName: patient.fullName, type: docType, title: title, description: description, fileName: fileName, fileSize: fileSize, uploadDate: uploadDate };
            showToast('✅ Document updated successfully', 'success');
        }
    } else {
        var newId = 1;
        for (var m = 0; m < documents.length; m++) {
            if (documents[m].id >= newId) newId = documents[m].id + 1;
        }
        documents.push({ id: newId, patientId: patientId, patientName: patient.fullName, type: docType, title: title, description: description, fileName: fileName, fileSize: fileSize, uploadDate: uploadDate });
        showToast('✅ Document uploaded successfully', 'success');
    }
    
    saveDocuments();
    refreshUI();
    closeModal('uploadModal');
}

// ─── View Document ──────────────────────────────────

function viewDocument(id) {
    var doc = null;
    for (var i = 0; i < documents.length; i++) {
        if (documents[i].id === id) { doc = documents[i]; break; }
    }
    if (!doc) {
        showToast('Document not found', 'error');
        return;
    }
    
    var titleEl = document.getElementById('viewTitle');
    if (titleEl) {
        titleEl.innerHTML = '<i class="fas ' + getTypeIcon(doc.type) + '" style="color:var(--color-sage); margin-right:0.5rem;"></i> ' + esc(doc.title);
    }
    
    var viewContent = document.getElementById('viewContent');
    if (viewContent) {
        var badgeClass = getBadgeClass(doc.type);
        viewContent.innerHTML = '';
        
        viewContent.innerHTML += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">';
        viewContent.innerHTML += '<div><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">Patient Name</p><p style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem; margin:0;">' + esc(doc.patientName) + '</p></div>';
        viewContent.innerHTML += '<div><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">Document Type</p><p style="margin:0;"><span class="' + badgeClass + '">' + doc.type + '</span></p></div>';
        viewContent.innerHTML += '<div><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">Upload Date</p><p style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem; margin:0;">' + doc.uploadDate + '</p></div>';
        viewContent.innerHTML += '<div><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">File Size</p><p style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.875rem; margin:0;">' + (doc.fileSize || '0.5 MB') + '</p></div>';
        viewContent.innerHTML += '</div>';
        
        if (doc.description) {
            viewContent.innerHTML += '<div style="margin-bottom:1rem;"><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">Description</p><p style="color:var(--color-brown-300); font-size:0.8125rem; margin:0;">' + esc(doc.description) + '</p></div>';
        }
        
        viewContent.innerHTML += '<div style="background:var(--bg-subtle); border-radius:var(--radius-md); padding:1.5rem; text-align:center; border:1px solid var(--border-default);">';
        viewContent.innerHTML += '<i class="fas ' + (doc.type === 'Report' ? 'fa-file-pdf' : 'fa-file-alt') + '" style="color:var(--color-sage); font-size:2rem; margin-bottom:0.5rem; display:block;"></i>';
        viewContent.innerHTML += '<p style="color:var(--color-brown-700); font-size:0.875rem; margin:0;">' + esc(doc.fileName) + '</p>';
        viewContent.innerHTML += '<button onclick="downloadDocument(' + doc.id + ')" class="btn-primary" style="margin-top:0.75rem; padding:0.375rem 1rem; font-size:0.75rem;"><i class="fas fa-download"></i> Download File</button>';
        viewContent.innerHTML += '</div>';
    }
    
    openModal('viewModal');
}

function downloadDocument(id) {
    var doc = null;
    for (var i = 0; i < documents.length; i++) {
        if (documents[i].id === id) { doc = documents[i]; break; }
    }
    if (doc) {
        showToast('📥 Downloading "' + doc.fileName + '"...', 'success');
    }
}

// ─── Delete ──────────────────────────────────────────

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

// ─── File Upload Handling ──────────────────────────

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

// ─── Init ────────────────────────────────────────────

function initDocumentsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    setupFileUpload();
    
    document.getElementById('uploadDocBtn').addEventListener('click', openUploadModal);
    document.getElementById('closeUploadModalBtn').addEventListener('click', function() { closeModal('uploadModal'); });
    document.getElementById('cancelUploadBtn').addEventListener('click', function() { closeModal('uploadModal'); });
    document.getElementById('closeViewModalBtn').addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('closeViewFooterBtn').addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('downloadDocBtn').addEventListener('click', function() { showToast('📥 Downloading document...', 'success'); });
    document.getElementById('closeDeleteModalBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('uploadForm').addEventListener('submit', saveDocument);
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        patientFilter = '';
        typeFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('patientFilter').value = '';
        document.getElementById('typeFilter').value = '';
        renderDocuments();
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
    
    document.getElementById('uploadModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('uploadModal');
    });
    document.getElementById('viewModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewModal');
    });
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('uploadModal');
            closeModal('viewModal');
            closeModal('deleteModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initDocumentsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initDocumentsModule();
    }, 3000);
});

// ─── Expose ────────────────────────────────────────────

window.viewDocument = viewDocument;
window.deleteDocument = openDeleteModal;
window.downloadDocument = downloadDocument;