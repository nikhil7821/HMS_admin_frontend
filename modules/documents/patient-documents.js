/**
 * Patient Documents Management Module
 * MedFlow - Patient Medical Records & Documents CRUD
 * Matching Executive Dashboard UI/UX - Indian Context
 */

// Data Stores
let documents = [];
let patients = [];
let deleteId = null;

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

// Save documents to localStorage
function saveDocuments() {
    localStorage.setItem('patient_documents', JSON.stringify(documents));
}

// Update statistics
function updateStats() {
    const total = documents.length;
    const reports = documents.filter(d => d.type === 'Report').length;
    const prescriptions = documents.filter(d => d.type === 'Prescription').length;
    const others = documents.filter(d => d.type !== 'Report' && d.type !== 'Prescription').length;
    
    const totalEl = document.getElementById('totalDocs');
    const reportEl = document.getElementById('reportCount');
    const prescriptionEl = document.getElementById('prescriptionCount');
    const otherEl = document.getElementById('otherCount');
    
    if (totalEl) totalEl.innerText = total;
    if (reportEl) reportEl.innerText = reports;
    if (prescriptionEl) prescriptionEl.innerText = prescriptions;
    if (otherEl) otherEl.innerText = others;
}

// Load data from localStorage
function loadData() {
    // Load patients from HMS
    const storedPatients = localStorage.getItem('hms_patients');
    if (storedPatients) {
        patients = JSON.parse(storedPatients);
    } else {
        // Sample Indian patients
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
    const storedDocs = localStorage.getItem('patient_documents');
    if (storedDocs) {
        documents = JSON.parse(storedDocs);
    } else {
        // Sample Indian documents
        documents = [
            { id: 1, patientId: 1, patientName: 'Rajesh Kumar', type: 'Report', title: 'Blood Test Report - June 2024', description: 'Complete blood count and lipid profile', fileName: 'blood_test_rajesh.pdf', fileSize: '1.2 MB', uploadDate: '2026-06-01' },
            { id: 2, patientId: 1, patientName: 'Rajesh Kumar', type: 'Prescription', title: 'Diabetes Medication Prescription', description: 'Metformin 500mg - Twice daily', fileName: 'prescription_rajesh.pdf', fileSize: '0.8 MB', uploadDate: '2026-06-02' },
            { id: 3, patientId: 2, patientName: 'Priya Sharma', type: 'Report', title: 'X-Ray Report', description: 'Chest X-Ray - Post COVID follow up', fileName: 'xray_priya.pdf', fileSize: '2.1 MB', uploadDate: '2026-06-03' },
            { id: 4, patientId: 2, patientName: 'Priya Sharma', type: 'Discharge Summary', title: 'Discharge Summary', description: 'Post-surgery discharge from Apollo Hospital', fileName: 'discharge_priya.pdf', fileSize: '1.5 MB', uploadDate: '2026-06-04' },
            { id: 5, patientId: 3, patientName: 'Amit Patel', type: 'Insurance', title: 'Health Insurance Documents', description: 'Star Health Insurance Policy', fileName: 'insurance_amit.pdf', fileSize: '3.2 MB', uploadDate: '2026-06-05' }
        ];
        saveDocuments();
    }
    
    updateStats();
    populateFilters();
    renderDocuments();
}

// Populate patient filters
function populateFilters() {
    const filterSelect = document.getElementById('patientFilter');
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="">All Patients</option>' + 
            patients.map(p => `<option value="${p.id}">${escapeHtml(p.fullName)} (${p.phone})</option>`).join('');
    }
    
    const patientSelect = document.getElementById('patientId');
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${escapeHtml(p.fullName)} (${p.phone})</option>`).join('');
    }
}

// Validate document form
function validateDocumentForm(patientId, docType, title, uploadDate) {
    let isValid = true;
    
    // Clear previous errors
    const errorFields = ['patientError', 'docTypeError', 'titleError', 'dateError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
    
    const patientSelect = document.getElementById('patientId');
    const typeSelect = document.getElementById('docType');
    const titleInput = document.getElementById('docTitle');
    const dateInput = document.getElementById('uploadDate');
    
    if (patientSelect) patientSelect.classList.remove('error');
    if (typeSelect) typeSelect.classList.remove('error');
    if (titleInput) titleInput.classList.remove('error');
    if (dateInput) dateInput.classList.remove('error');
    
    // Patient validation
    if (!patientId) {
        const errorEl = document.getElementById('patientError');
        if (errorEl) errorEl.innerText = 'Please select a patient';
        if (patientSelect) patientSelect.classList.add('error');
        isValid = false;
    }
    
    // Document type validation
    if (!docType) {
        const errorEl = document.getElementById('docTypeError');
        if (errorEl) errorEl.innerText = 'Please select document type';
        if (typeSelect) typeSelect.classList.add('error');
        isValid = false;
    }
    
    // Title validation
    if (!title || title.trim() === '') {
        const errorEl = document.getElementById('titleError');
        if (errorEl) errorEl.innerText = 'Document title is required';
        if (titleInput) titleInput.classList.add('error');
        isValid = false;
    } else if (title.trim().length < 3) {
        const errorEl = document.getElementById('titleError');
        if (errorEl) errorEl.innerText = 'Title must be at least 3 characters';
        if (titleInput) titleInput.classList.add('error');
        isValid = false;
    }
    
    // Date validation
    if (!uploadDate) {
        const errorEl = document.getElementById('dateError');
        if (errorEl) errorEl.innerText = 'Please select upload date';
        if (dateInput) dateInput.classList.add('error');
        isValid = false;
    } else {
        const selectedDate = new Date(uploadDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
            const errorEl = document.getElementById('dateError');
            if (errorEl) errorEl.innerText = 'Upload date cannot be in the future';
            if (dateInput) dateInput.classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
}

// Get badge class for document type
function getBadgeClass(type) {
    switch(type) {
        case 'Report': return 'badge-report';
        case 'Prescription': return 'badge-prescription';
        case 'Discharge Summary': return 'badge-discharge';
        case 'Insurance': return 'badge-insurance';
        default: return 'badge-other';
    }
}

// Get icon for document type
function getTypeIcon(type) {
    switch(type) {
        case 'Report': return 'fa-file-alt';
        case 'Prescription': return 'fa-prescription-bottle';
        case 'Discharge Summary': return 'fa-download';
        case 'Insurance': return 'fa-shield-alt';
        default: return 'fa-file';
    }
}

// Render documents grid
function renderDocuments() {
    const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const patientFilter = document.getElementById('patientFilter')?.value || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    
    let filtered = documents.filter(doc => {
        const matchesSearch = searchValue === '' || 
            doc.title.toLowerCase().includes(searchValue) || 
            doc.patientName.toLowerCase().includes(searchValue) ||
            (doc.description && doc.description.toLowerCase().includes(searchValue));
        const matchesPatient = patientFilter === '' || doc.patientId.toString() === patientFilter;
        const matchesType = typeFilter === '' || doc.type === typeFilter;
        return matchesSearch && matchesPatient && matchesType;
    });
    
    // Sort by date descending (newest first)
    filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    const grid = document.getElementById('documentsGrid');
    if (!grid) return;
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-3 text-center py-12 text-[#d4c9bc] text-sm"><i class="fas fa-folder-open mr-2"></i>No documents found</div>`;
        return;
    }
    
    grid.innerHTML = filtered.map(doc => {
        const badgeClass = getBadgeClass(doc.type);
        const typeIcon = getTypeIcon(doc.type);
        
        return `
            <div class="doc-card p-5">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-[#faf7f2] rounded-xl flex items-center justify-center">
                            <i class="fas ${typeIcon} text-[#a8c49a] text-base"></i>
                        </div>
                        <div>
                            <h3 class="font-medium text-[#5a4a3a] text-sm">${escapeHtml(doc.title)}</h3>
                            <p class="text-xs text-[#b8aa9a]">${escapeHtml(doc.patientName)}</p>
                        </div>
                    </div>
                    <span class="${badgeClass}">${doc.type}</span>
                </div>
                
                <div class="mt-3 space-y-2">
                    ${doc.description ? `<p class="text-[#9a8e82] text-xs">${escapeHtml(doc.description)}</p>` : ''}
                    <div class="flex justify-between text-[#d4c9bc] text-xs">
                        <span><i class="fas fa-calendar mr-1"></i> ${doc.uploadDate}</span>
                        <span><i class="fas fa-file mr-1"></i> ${doc.fileSize || '0.5 MB'}</span>
                    </div>
                </div>
                
                <div class="mt-4 flex gap-2">
                    <button onclick="window.viewDocumentHandler(${doc.id})" class="flex-1 btn-primary text-white py-2 rounded-xl text-xs font-medium transition">
                        <i class="fas fa-eye mr-1"></i> View
                    </button>
                    <button onclick="window.deleteDocumentHandler(${doc.id})" class="bg-[#d8b48c] hover:bg-[#c9a47c] text-white px-3 py-2 rounded-xl text-xs font-medium transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Modal management functions
const uploadModal = document.getElementById('uploadModal');
const viewModal = document.getElementById('viewModal');
const deleteModal = document.getElementById('deleteModal');

function openUploadModal() {
    if (!uploadModal) return;
    document.getElementById('uploadForm')?.reset();
    document.getElementById('docId').value = '';
    document.getElementById('uploadDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('fileNameDisplay')?.classList.add('hidden');
    
    uploadModal.classList.remove('opacity-0', 'invisible');
    uploadModal.classList.add('opacity-100', 'visible');
}

function closeUploadModal() {
    if (!uploadModal) return;
    uploadModal.classList.add('opacity-0', 'invisible');
    uploadModal.classList.remove('opacity-100', 'visible');
    document.getElementById('uploadForm')?.reset();
    document.getElementById('fileNameDisplay')?.classList.add('hidden');
    
    // Clear errors
    const errorFields = ['patientError', 'docTypeError', 'titleError', 'dateError'];
    errorFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.innerText = '';
    });
}

function openViewModal() {
    if (!viewModal) return;
    viewModal.classList.remove('opacity-0', 'invisible');
    viewModal.classList.add('opacity-100', 'visible');
}

function closeViewModal() {
    if (!viewModal) return;
    viewModal.classList.add('opacity-0', 'invisible');
    viewModal.classList.remove('opacity-100', 'visible');
}

function openDeleteModal() {
    if (!deleteModal) return;
    deleteModal.classList.remove('opacity-0', 'invisible');
    deleteModal.classList.add('opacity-100', 'visible');
}

function closeDeleteModal() {
    if (!deleteModal) return;
    deleteModal.classList.add('opacity-0', 'invisible');
    deleteModal.classList.remove('opacity-100', 'visible');
    deleteId = null;
}

// View document handler
window.viewDocumentHandler = function(id) {
    const doc = documents.find(d => d.id === id);
    if (!doc) {
        showToast('Document not found', 'error');
        return;
    }
    
    const titleEl = document.getElementById('viewTitle');
    if (titleEl) titleEl.innerHTML = `<i class="fas ${getTypeIcon(doc.type)} text-[#a8c49a] mr-2"></i> ${escapeHtml(doc.title)}`;
    
    const badgeClass = getBadgeClass(doc.type);
    const viewContent = document.getElementById('viewContent');
    if (viewContent) {
        viewContent.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-[#b8aa9a] text-xs">Patient Name</p>
                        <p class="font-medium text-[#5a4a3a] text-sm">${escapeHtml(doc.patientName)}</p>
                    </div>
                    <div>
                        <p class="text-[#b8aa9a] text-xs">Document Type</p>
                        <p><span class="${badgeClass}">${doc.type}</span></p>
                    </div>
                    <div>
                        <p class="text-[#b8aa9a] text-xs">Upload Date</p>
                        <p class="font-medium text-[#5a4a3a] text-sm">${doc.uploadDate}</p>
                    </div>
                    <div>
                        <p class="text-[#b8aa9a] text-xs">File Size</p>
                        <p class="font-medium text-[#5a4a3a] text-sm">${doc.fileSize || '0.5 MB'}</p>
                    </div>
                </div>
                ${doc.description ? `<div><p class="text-[#b8aa9a] text-xs">Description</p><p class="text-[#9a8e82] text-sm">${escapeHtml(doc.description)}</p></div>` : ''}
                <div class="bg-[#fefcf9] rounded-xl p-4 text-center border border-[#f0e8e0]">
                    <i class="fas ${doc.type === 'Report' ? 'fa-file-pdf' : 'fa-file-alt'} text-[#a8c49a] text-3xl mb-2"></i>
                    <p class="text-[#5a4a3a] text-sm">${escapeHtml(doc.fileName)}</p>
                    <button onclick="window.downloadDocumentHandler(${doc.id})" class="mt-3 btn-primary text-white px-4 py-2 rounded-xl text-xs font-medium transition">
                        <i class="fas fa-download mr-1"></i> Download File
                    </button>
                </div>
            </div>
        `;
    }
    
    openViewModal();
};

// Download document handler
window.downloadDocumentHandler = function(id) {
    const doc = documents.find(d => d.id === id);
    if (doc) {
        showToast(`Downloading "${doc.fileName}"...`, 'success');
    }
};

// Delete document handler
window.deleteDocumentHandler = function(id) {
    deleteId = id;
    openDeleteModal();
};

function confirmDelete() {
    if (deleteId) {
        documents = documents.filter(d => d.id !== deleteId);
        saveDocuments();
        updateStats();
        renderDocuments();
        showToast('Document deleted successfully', 'success');
        deleteId = null;
        closeDeleteModal();
    }
}

// Save document
function saveDocumentHandler(e) {
    e.preventDefault();
    
    const id = document.getElementById('docId').value;
    const patientId = parseInt(document.getElementById('patientId').value);
    const docType = document.getElementById('docType').value;
    const title = document.getElementById('docTitle').value.trim();
    const description = document.getElementById('docDesc').value.trim();
    const uploadDate = document.getElementById('uploadDate').value;
    
    const patient = patients.find(p => p.id === patientId);
    
    // File handling
    const fileInput = document.getElementById('fileInput');
    let fileName = `document_${Date.now()}.pdf`;
    let fileSize = '0.5 MB';
    
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
    
    const docData = {
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
        const index = documents.findIndex(d => d.id === parseInt(id));
        if (index !== -1) {
            documents[index] = { ...documents[index], ...docData };
            showToast('Document updated successfully', 'success');
        }
    } else {
        const newId = documents.length > 0 ? Math.max(...documents.map(d => d.id)) + 1 : 1;
        documents.push({ id: newId, ...docData });
        showToast('Document uploaded successfully', 'success');
    }
    
    saveDocuments();
    updateStats();
    renderDocuments();
    closeUploadModal();
}

// File upload handling
function setupFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    
    if (!dropZone || !fileInput) return;
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dropzone-active');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dropzone-active');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dropzone-active');
        const file = e.dataTransfer.files[0];
        if (file) {
            fileInput.files = e.dataTransfer.files;
            if (fileNameDisplay) {
                fileNameDisplay.innerHTML = `<i class="fas fa-check-circle mr-1"></i> Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                fileNameDisplay.classList.remove('hidden');
            }
        }
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            if (fileNameDisplay) {
                fileNameDisplay.innerHTML = `<i class="fas fa-check-circle mr-1"></i> Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                fileNameDisplay.classList.remove('hidden');
            }
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupFileUpload();
    
    const uploadBtn = document.getElementById('uploadDocBtn');
    const closeUploadBtn = document.getElementById('closeUploadModalBtn');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const closeViewBtn = document.getElementById('closeViewModalBtn');
    const downloadBtn = document.getElementById('downloadDocBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const uploadForm = document.getElementById('uploadForm');
    const searchInput = document.getElementById('searchInput');
    const patientFilter = document.getElementById('patientFilter');
    const typeFilter = document.getElementById('typeFilter');
    const resetFilter = document.getElementById('resetFilter');
    const uploadModalOverlay = uploadModal?.querySelector('.modal-overlay');
    const viewModalOverlay = viewModal?.querySelector('.modal-overlay');
    const deleteModalOverlay = deleteModal?.querySelector('.modal-overlay');
    
    if (uploadBtn) uploadBtn.addEventListener('click', openUploadModal);
    if (closeUploadBtn) closeUploadBtn.addEventListener('click', closeUploadModal);
    if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', closeUploadModal);
    if (closeViewBtn) closeViewBtn.addEventListener('click', closeViewModal);
    if (downloadBtn) downloadBtn.addEventListener('click', () => {
        showToast(`Downloading document...`, 'success');
    });
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDelete);
    if (uploadForm) uploadForm.addEventListener('submit', saveDocumentHandler);
    if (searchInput) searchInput.addEventListener('input', () => renderDocuments());
    if (patientFilter) patientFilter.addEventListener('change', () => renderDocuments());
    if (typeFilter) typeFilter.addEventListener('change', () => renderDocuments());
    if (resetFilter) {
        resetFilter.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (patientFilter) patientFilter.value = '';
            if (typeFilter) typeFilter.value = '';
            renderDocuments();
        });
    }
    
    // Close modals on overlay click
    if (uploadModalOverlay) uploadModalOverlay.addEventListener('click', closeUploadModal);
    if (viewModalOverlay) viewModalOverlay.addEventListener('click', closeViewModal);
    if (deleteModalOverlay) deleteModalOverlay.addEventListener('click', closeDeleteModal);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (uploadModal && !uploadModal.classList.contains('invisible')) closeUploadModal();
            if (viewModal && !viewModal.classList.contains('invisible')) closeViewModal();
            if (deleteModal && !deleteModal.classList.contains('invisible')) closeDeleteModal();
        }
    });
});