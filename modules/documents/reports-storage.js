/**
 * Reports Storage Management Module
 * MedFlow - Medical Reports Storage
 * Matching Executive Dashboard UI/UX - Indian Context
 */

// Data Stores
let reports = [];
let currentReportId = null;

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

// Update statistics
function updateStats() {
    const total = reports.length;
    const labCount = reports.filter(r => r.type === 'Lab').length;
    const radiologyCount = reports.filter(r => r.type === 'Radiology').length;
    
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthCount = reports.filter(r => r.date && r.date.startsWith(currentMonth)).length;
    
    const totalEl = document.getElementById('totalReports');
    const labEl = document.getElementById('labCount');
    const radiologyEl = document.getElementById('radiologyCount');
    const monthEl = document.getElementById('monthCount');
    
    if (totalEl) totalEl.innerText = total;
    if (labEl) labEl.innerText = labCount;
    if (radiologyEl) radiologyEl.innerText = radiologyCount;
    if (monthEl) monthEl.innerText = monthCount;
}

// Get badge class based on report type
function getBadgeClass(type) {
    switch(type) {
        case 'Lab': return 'badge-lab';
        case 'Radiology': return 'badge-radiology';
        case 'Discharge': return 'badge-discharge';
        default: return 'badge-lab';
    }
}

// Get icon for report type
function getReportIcon(type) {
    switch(type) {
        case 'Lab': return 'fa-flask';
        case 'Radiology': return 'fa-x-ray';
        case 'Discharge': return 'fa-file-pdf';
        default: return 'fa-file-alt';
    }
}

// Load reports from localStorage
function loadReports() {
    // Load lab requests
    const labRequests = JSON.parse(localStorage.getItem('lab_requests') || '[]');
    
    // Load radiology requests
    const radiologyRequests = JSON.parse(localStorage.getItem('radiology_requests') || '[]');
    
    // Create sample reports if none exist
    if (labRequests.length === 0 && radiologyRequests.length === 0) {
        // Sample Indian lab reports
        const sampleLabReports = [
            {
                id: 'lab_1', type: 'Lab', patientName: 'Rajesh Kumar', testName: 'Complete Blood Count (CBC)',
                date: '2026-06-10', result: 'Hemoglobin: 14.2 g/dL (Normal: 13-17)\nWBC: 7,500/μL (Normal: 4,000-11,000)\nPlatelets: 2.8 lakhs/μL (Normal: 1.5-4.5)\nAll parameters within normal limits.',
                requestedBy: 'Dr. Anjali Nair', labTechnician: 'Priya Sharma'
            },
            {
                id: 'lab_2', type: 'Lab', patientName: 'Priya Sharma', testName: 'Thyroid Profile',
                date: '2026-06-08', result: 'TSH: 3.2 μIU/mL (Normal: 0.5-5.0)\nT3: 1.2 ng/mL (Normal: 0.8-2.0)\nT4: 8.5 μg/dL (Normal: 5.0-12.0)\nThyroid function is normal.',
                requestedBy: 'Dr. Vikram Singh', labTechnician: 'Rajesh Kumar'
            },
            {
                id: 'lab_3', type: 'Lab', patientName: 'Amit Patel', testName: 'Lipid Profile',
                date: '2026-06-05', result: 'Total Cholesterol: 210 mg/dL (Borderline High)\nHDL: 42 mg/dL (Low)\nLDL: 135 mg/dL (High)\nTriglycerides: 165 mg/dL (Borderline High)\nAdvise lifestyle modifications and repeat in 3 months.',
                requestedBy: 'Dr. Sneha Joshi', labTechnician: 'Neha Gupta'
            },
            {
                id: 'lab_4', type: 'Lab', patientName: 'Sunita Verma', testName: 'Blood Glucose (Fasting & PP)',
                date: '2026-06-03', result: 'Fasting Blood Sugar: 145 mg/dL (High)\nPost Prandial: 210 mg/dL (High)\nHbA1c: 7.8%\nIndicates poorly controlled diabetes. Review medications.',
                requestedBy: 'Dr. Rajiv Menon', labTechnician: 'Vikram Singh'
            },
            {
                id: 'lab_5', type: 'Lab', patientName: 'Vikram Singh', testName: 'Liver Function Test (LFT)',
                date: '2026-06-01', result: 'SGOT: 45 U/L (Normal: 10-40)\nSGPT: 52 U/L (Normal: 10-40)\nALP: 110 U/L (Normal: 30-120)\nBilirubin: 0.8 mg/dL\nMildly elevated liver enzymes. Suggest ultrasound.',
                requestedBy: 'Dr. Neha Gupta', labTechnician: 'Anjali Nair'
            }
        ];
        
        // Sample radiology reports
        const sampleRadiologyReports = [
            {
                id: 'rad_1', type: 'Radiology', patientName: 'Rajesh Kumar', testName: 'Chest X-Ray',
                date: '2026-06-09', findings: 'PA view chest shows normal cardiac silhouette. Lung fields are clear with no infiltrates or masses. Bilateral costophrenic angles are sharp. No evidence of consolidation or pleural effusion. Impression: Normal chest X-ray.',
                requestedBy: 'Dr. Anjali Nair', radiologist: 'Dr. Sanjay Gupta'
            },
            {
                id: 'rad_2', type: 'Radiology', patientName: 'Priya Sharma', testName: 'USG Abdomen',
                date: '2026-06-07', findings: 'Liver: Normal size and echotexture. No focal lesions. Gallbladder: Normal with no stones. Kidneys: Bilateral normal size and shape. No hydronephrosis. Pancreas: Normal. Spleen: Normal. Impression: Normal ultrasound of abdomen.',
                requestedBy: 'Dr. Vikram Singh', radiologist: 'Dr. Meera Desai'
            },
            {
                id: 'rad_3', type: 'Radiology', patientName: 'Amit Patel', testName: 'MRI Brain',
                date: '2026-06-04', findings: 'MRI brain shows normal grey-white matter differentiation. No evidence of any intra-axial or extra-axial mass. Ventricular system is normal. No midline shift. Conclusion: Normal MRI brain.',
                requestedBy: 'Dr. Sneha Joshi', radiologist: 'Dr. Rajesh Nair'
            },
            {
                id: 'rad_4', type: 'Radiology', patientName: 'Sunita Verma', testName: 'X-Ray Right Knee (AP & Lateral)',
                date: '2026-06-02', findings: 'Joint space narrowing in medial compartment. Osteophyte formation at medial femoral condyle and tibial plateau. Subchondral sclerosis noted. Impression: Moderate osteoarthritis changes in right knee joint.',
                requestedBy: 'Dr. Rajiv Menon', radiologist: 'Dr. Prakash Rao'
            },
            {
                id: 'rad_5', type: 'Radiology', patientName: 'Vikram Singh', testName: 'CT Chest',
                date: '2026-05-30', findings: 'CT chest shows no parenchymal lung lesions. Airways are patent. No mediastinal lymphadenopathy. Impression: Normal CT chest.',
                requestedBy: 'Dr. Neha Gupta', radiologist: 'Dr. Amit Sharma'
            }
        ];
        
        reports = [...sampleLabReports, ...sampleRadiologyReports];
        localStorage.setItem('reports_storage', JSON.stringify(reports));
    } else {
        reports = [
            ...labRequests.filter(r => r.status === 'Completed').map(r => ({
                id: `lab_${r.id}`,
                type: 'Lab',
                patientName: r.patientName,
                testName: r.testName,
                date: r.requestDate,
                result: r.result || 'Results pending review',
                requestedBy: r.requestedBy
            })),
            ...radiologyRequests.filter(r => r.status === 'Completed').map(r => ({
                id: `rad_${r.id}`,
                type: 'Radiology',
                patientName: r.patientName,
                testName: r.testName,
                date: r.requestDate,
                findings: r.findings || 'Report pending',
                requestedBy: r.requestedBy
            }))
        ];
        
        // Also load from stored reports
        const storedReports = localStorage.getItem('reports_storage');
        if (storedReports) {
            const additionalReports = JSON.parse(storedReports);
            reports = [...reports, ...additionalReports];
            // Remove duplicates
            reports = reports.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        }
    }
    
    updateStats();
    renderReports();
}

// Render reports grid
function renderReports() {
    const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    
    let filtered = reports.filter(r => {
        const matchesSearch = searchValue === '' || 
            r.patientName.toLowerCase().includes(searchValue) || 
            r.testName.toLowerCase().includes(searchValue) ||
            (r.result && r.result.toLowerCase().includes(searchValue)) ||
            (r.findings && r.findings.toLowerCase().includes(searchValue));
        const matchesType = typeFilter === '' || r.type === typeFilter;
        return matchesSearch && matchesType;
    });
    
    // Sort by date descending (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const grid = document.getElementById('reportsGrid');
    if (!grid) return;
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-3 text-center py-12 text-[#d4c9bc] text-sm"><i class="fas fa-folder-open mr-2"></i>No reports found</div>`;
        return;
    }
    
    grid.innerHTML = filtered.map(r => {
        const badgeClass = getBadgeClass(r.type);
        const iconClass = getReportIcon(r.type);
        const preview = r.result || r.findings || '';
        const shortPreview = preview.substring(0, 80) + (preview.length > 80 ? '...' : '');
        
        return `
            <div class="report-card p-5">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <i class="fas ${iconClass} text-[#a8c49a] text-sm"></i>
                            <h3 class="font-medium text-[#5a4a3a] text-sm">${escapeHtml(r.testName)}</h3>
                        </div>
                        <p class="text-xs text-[#b8aa9a]">${escapeHtml(r.patientName)}</p>
                    </div>
                    <span class="${badgeClass}">${r.type}</span>
                </div>
                
                <p class="text-xs text-[#d4c9bc] mt-1">
                    <i class="fas fa-calendar-alt mr-1"></i> ${r.date}
                </p>
                
                <div class="mt-2">
                    <p class="text-xs text-[#9a8e82] line-clamp-2">${escapeHtml(shortPreview) || 'No details available'}</p>
                </div>
                
                <div class="mt-4">
                    <button onclick="window.viewReportHandler('${r.id}')" class="w-full btn-primary text-white py-2 rounded-xl text-xs font-medium transition">
                        <i class="fas fa-eye mr-1"></i> View Full Report
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Modal management
const modal = document.getElementById('reportModal');

function openModal() {
    if (!modal) return;
    modal.classList.remove('opacity-0', 'invisible');
    modal.classList.add('opacity-100', 'visible');
}

function closeModal() {
    if (!modal) return;
    modal.classList.add('opacity-0', 'invisible');
    modal.classList.remove('opacity-100', 'visible');
    currentReportId = null;
}

// View report handler
window.viewReportHandler = function(id) {
    const report = reports.find(r => r.id === id);
    if (!report) {
        showToast('Report not found', 'error');
        return;
    }
    
    currentReportId = id;
    const badgeClass = getBadgeClass(report.type);
    
    const detailsDiv = document.getElementById('reportDetails');
    if (detailsDiv) {
        detailsDiv.innerHTML = `
            <div class="border-b border-[#f0e8e0] pb-4 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-[#5a4a3a] text-lg">${escapeHtml(report.testName)}</h3>
                        <p class="text-sm text-[#9a8e82]">${escapeHtml(report.patientName)}</p>
                    </div>
                    <span class="${badgeClass}">${report.type}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-3">
                    <div>
                        <p class="text-xs text-[#b8aa9a]">Report Date</p>
                        <p class="text-sm text-[#5a4a3a]">${report.date}</p>
                    </div>
                    <div>
                        <p class="text-xs text-[#b8aa9a]">Requested By</p>
                        <p class="text-sm text-[#5a4a3a]">${escapeHtml(report.requestedBy || 'Dr. Staff')}</p>
                    </div>
                </div>
            </div>
            
            <div class="mb-4">
                <p class="text-xs font-medium text-[#b8aa9a] uppercase tracking-wide mb-2">Report Findings / Results</p>
                <div class="bg-[#fefcf9] p-4 rounded-xl border border-[#f0e8e0]">
                    <pre class="whitespace-pre-wrap text-sm text-[#5a4a3a] font-mono report-content">${escapeHtml(report.result || report.findings || 'No detailed results available')}</pre>
                </div>
            </div>
            
            ${report.labTechnician || report.radiologist ? `
            <div class="mb-4">
                <p class="text-xs font-medium text-[#b8aa9a] uppercase tracking-wide mb-1">Authorized By</p>
                <p class="text-sm text-[#5a4a3a]">${escapeHtml(report.labTechnician || report.radiologist || 'Lab Department')}</p>
            </div>
            ` : ''}
            
            <div class="mt-4 pt-3 border-t border-[#f0e8e0] text-center">
                <p class="text-xs text-[#b8aa9a]">MedFlow Hospital - Diagnostic Report</p>
                <p class="text-xs text-[#d4c9bc]">www.medflow.com</p>
            </div>
        `;
    }
    
    openModal();
};

// Print report handler
function printReport() {
    if (!currentReportId) {
        showToast('No report selected', 'error');
        return;
    }
    
    const report = reports.find(r => r.id === currentReportId);
    if (!report) {
        showToast('Report not found', 'error');
        return;
    }
    
    const badgeClass = getBadgeClass(report.type);
    
    const printContent = `
        <div class="print-report" style="font-family: 'Poppins', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white;">
            <div style="text-align: center; border-bottom: 2px solid #a8c49a; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #5a4a3a; margin: 0;">MedFlow Hospital</h1>
                <p style="color: #9a8e82; margin: 5px 0;">Diagnostic Report</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #fefcf9;">
                        <td style="padding: 12px; border: 1px solid #f0e8e0;"><strong>Patient Name:</strong></td>
                        <td style="padding: 12px; border: 1px solid #f0e8e0;">${escapeHtml(report.patientName)}</td>
                        <td style="padding: 12px; border: 1px solid #f0e8e0;"><strong>Report Date:</strong></td>
                        <td style="padding: 12px; border: 1px solid #f0e8e0;">${report.date}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #f0e8e0;"><strong>Test Name:</strong></td>
                        <td style="padding: 12px; border: 1px solid #f0e8e0;" colspan="3">${escapeHtml(report.testName)}</td>
                    </tr>
                    <tr style="background: #fefcf9;">
                        <td style="padding: 12px; border: 1px solid #f0e8e0;"><strong>Report Type:</strong></td>
                        <td style="padding: 12px; border: 1px solid #f0e8e0;">${report.type}</td>
                        <td style="padding: 12px; border: 1px solid #f0e8e0;"><strong>Requested By:</strong></td>
                        <td style="padding: 12px; border: 1px solid #f0e8e0;">${escapeHtml(report.requestedBy || 'Dr. Staff')}</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #5a4a3a; margin: 0 0 15px 0;">Report Findings / Results</h3>
                <div style="background: #fefcf9; padding: 20px; border-radius: 8px; border: 1px solid #f0e8e0;">
                    <pre style="white-space: pre-wrap; font-family: monospace; margin: 0; font-size: 14px; line-height: 1.6;">${escapeHtml(report.result || report.findings || 'No detailed results available')}</pre>
                </div>
            </div>
            
            ${report.labTechnician || report.radiologist ? `
            <div style="margin-bottom: 30px;">
                <p><strong>Authorized By:</strong> ${escapeHtml(report.labTechnician || report.radiologist)}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #f0e8e0; color: #b8aa9a; font-size: 12px;">
                <p>This is a computer-generated report. Valid with digital signature.</p>
                <p>MedFlow Hospital - www.medflow.com</p>
            </div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>Report - ${escapeHtml(report.testName)} - ${escapeHtml(report.patientName)}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                @media print {
                    body { margin: 0; padding: 0; }
                }
                body { font-family: 'Poppins', Arial, sans-serif; background: white; }
            </style>
            </head>
            <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        showToast('Opening print dialog...', 'success');
    } else {
        showToast('Please allow popups to print', 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadReports();
    
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const resetFilter = document.getElementById('resetFilter');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const printReportBtn = document.getElementById('printReportBtn');
    const modalOverlay = modal?.querySelector('.modal-overlay');
    
    if (searchInput) searchInput.addEventListener('input', () => renderReports());
    if (typeFilter) typeFilter.addEventListener('change', () => renderReports());
    if (resetFilter) {
        resetFilter.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (typeFilter) typeFilter.value = '';
            renderReports();
        });
    }
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (printReportBtn) printReportBtn.addEventListener('click', printReport);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('invisible')) {
            closeModal();
        }
    });
});