/**
 * Prescriptions Management Module
 * MedFlow - Patient Prescriptions History
 * Matching Executive Dashboard UI/UX - Indian Context
 */

// Data Stores
let prescriptions = [];
let patients = [];

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
    const total = prescriptions.length;
    
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthCount = prescriptions.filter(p => p.date && p.date.startsWith(currentMonth)).length;
    
    const uniquePatients = new Set(prescriptions.map(p => p.patientId)).size;
    
    // Extract unique medicine names from prescriptions
    const allMedicines = [];
    prescriptions.forEach(p => {
        if (p.prescription) {
            const medicines = p.prescription.match(/\b[A-Za-z]+(?:cin|micin|zole|pam|statin|pril|olol|prazole|idine|cycline|mycin|floxacin|dipine|sartan)\b/gi) || [];
            allMedicines.push(...medicines);
        }
    });
    const uniqueMedicines = new Set(allMedicines).size;
    
    const totalEl = document.getElementById('totalPrescriptions');
    const monthEl = document.getElementById('monthPrescriptions');
    const activeEl = document.getElementById('activePatients');
    const uniqueEl = document.getElementById('uniqueMedicines');
    
    if (totalEl) totalEl.innerText = total;
    if (monthEl) monthEl.innerText = monthCount;
    if (activeEl) activeEl.innerText = uniquePatients;
    if (uniqueEl) uniqueEl.innerText = uniqueMedicines;
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
    
    // Load consultations and extract prescriptions
    const storedConsultations = localStorage.getItem('hms_consultations');
    if (storedConsultations) {
        const consultations = JSON.parse(storedConsultations);
        prescriptions = consultations
            .filter(c => c.prescription && c.prescription.trim() !== '')
            .map(c => ({
                id: c.id,
                patientId: c.patientId,
                patientName: c.patientName,
                doctorName: c.doctorName,
                date: c.date,
                prescription: c.prescription,
                diagnosis: c.diagnosis,
                followUp: c.followUp || null
            }));
    } else {
        // Sample Indian prescriptions
        prescriptions = [
            { 
                id: 1, patientId: 1, patientName: 'Rajesh Kumar', doctorName: 'Anjali Nair', 
                date: '2026-06-10', 
                diagnosis: 'Type 2 Diabetes with Hypertension',
                prescription: `Tab. Metformin 500mg - 1 tablet twice daily after meals\nTab. Telmisartan 40mg - 1 tablet once daily\nTab. Atorvastatin 10mg - 1 tablet at night`,
                followUp: '15 days'
            },
            { 
                id: 2, patientId: 2, patientName: 'Priya Sharma', doctorName: 'Vikram Singh', 
                date: '2026-06-08', 
                diagnosis: 'Upper Respiratory Tract Infection',
                prescription: `Tab. Azithromycin 500mg - 1 tablet once daily for 3 days\nTab. Levocetirizine 5mg - 1 tablet at night for 5 days\nSyrup. Ascoril - 10ml thrice daily for 5 days`,
                followUp: '5 days'
            },
            { 
                id: 3, patientId: 3, patientName: 'Amit Patel', doctorName: 'Sneha Joshi', 
                date: '2026-06-05', 
                diagnosis: 'Acute Gastritis',
                prescription: `Tab. Pantoprazole 40mg - 1 tablet before breakfast\nTab. Domperidone 10mg - 1 tablet before meals\nSyp. Digene - 2 tsp thrice daily after meals`,
                followUp: '7 days'
            },
            { 
                id: 4, patientId: 4, patientName: 'Sunita Verma', doctorName: 'Rajiv Menon', 
                date: '2026-06-03', 
                diagnosis: 'Osteoarthritis - Right Knee',
                prescription: `Tab. Aceclofenac 100mg - 1 tablet twice daily after meals\nTab. Serratiopeptidase 10mg - 1 tablet twice daily\nGel. Volini - Apply locally twice daily`,
                followUp: '1 month'
            },
            { 
                id: 5, patientId: 5, patientName: 'Vikram Singh', doctorName: 'Neha Gupta', 
                date: '2026-06-01', 
                diagnosis: 'Allergic Rhinitis',
                prescription: `Tab. Montelukast 10mg + Levocetirizine 5mg - 1 tablet at night\nNasal spray. Fluticasone - 2 sprays in each nostril twice daily`,
                followUp: '15 days'
            }
        ];
        localStorage.setItem('hms_consultations', JSON.stringify(
            prescriptions.map(p => ({
                id: p.id,
                patientId: p.patientId,
                patientName: p.patientName,
                doctorName: p.doctorName,
                date: p.date,
                diagnosis: p.diagnosis,
                prescription: p.prescription,
                followUp: p.followUp
            }))
        ));
    }
    
    updateStats();
    populateFilters();
    renderPrescriptions();
}

// Populate patient filter
function populateFilters() {
    const filterSelect = document.getElementById('patientFilter');
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="">All Patients</option>' + 
            patients.map(p => `<option value="${p.id}">${escapeHtml(p.fullName)}</option>`).join('');
    }
}

// Extract medicine names from prescription text
function extractMedicines(prescriptionText) {
    const medicines = prescriptionText.match(/\b[A-Za-z]+(?:cin|micin|zole|pam|statin|pril|olol|prazole|idine|cycline|mycin|floxacin|dipine|sartan)\b/gi) || [];
    return [...new Set(medicines)].slice(0, 5);
}

// Render prescriptions grid
function renderPrescriptions() {
    const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const patientFilter = document.getElementById('patientFilter')?.value || '';
    
    let filtered = prescriptions.filter(p => {
        const matchesSearch = searchValue === '' || 
            p.patientName.toLowerCase().includes(searchValue) || 
            p.doctorName.toLowerCase().includes(searchValue) ||
            p.diagnosis.toLowerCase().includes(searchValue) ||
            p.prescription.toLowerCase().includes(searchValue);
        const matchesPatient = patientFilter === '' || p.patientId.toString() === patientFilter;
        return matchesSearch && matchesPatient;
    });
    
    // Sort by date descending (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const grid = document.getElementById('prescriptionsGrid');
    if (!grid) return;
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-2 text-center py-12 text-[#d4c9bc] text-sm"><i class="fas fa-folder-open mr-2"></i>No prescriptions found</div>`;
        return;
    }
    
    grid.innerHTML = filtered.map(p => {
        const medicines = extractMedicines(p.prescription);
        const preview = p.prescription.substring(0, 80) + (p.prescription.length > 80 ? '...' : '');
        
        return `
            <div class="prescription-card p-5">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="font-medium text-[#5a4a3a] text-base">${escapeHtml(p.patientName)}</h3>
                        <p class="text-xs text-[#b8aa9a]">Dr. ${escapeHtml(p.doctorName)}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <i class="fas fa-calendar-alt text-[#d4c9bc] text-xs"></i>
                            <span class="text-xs text-[#9a8e82]">${p.date}</span>
                        </div>
                    </div>
                    <button onclick="window.viewPrescriptionHandler(${p.id})" class="text-[#a8c49a] hover:text-[#8aae7a] transition">
                        <i class="fas fa-eye text-base"></i>
                    </button>
                </div>
                
                <div class="mt-3">
                    <p class="text-xs font-medium text-[#b8aa9a] uppercase tracking-wide">Diagnosis</p>
                    <p class="text-sm text-[#5a4a3a] mt-0.5">${escapeHtml(p.diagnosis)}</p>
                </div>
                
                <div class="mt-2">
                    <p class="text-xs font-medium text-[#b8aa9a] uppercase tracking-wide">Medicines</p>
                    <div class="flex flex-wrap gap-1 mt-1">
                        ${medicines.map(m => `<span class="badge-report text-xs">${escapeHtml(m)}</span>`).join('')}
                    </div>
                    <p class="text-xs text-[#9a8e82] mt-2 italic">"${escapeHtml(preview)}"</p>
                </div>
                
                <button onclick="window.printPrescriptionHandler(${p.id})" class="mt-4 w-full btn-print text-white py-2 rounded-xl text-xs font-medium transition">
                    <i class="fas fa-print mr-1"></i> Print Prescription
                </button>
            </div>
        `;
    }).join('');
}

// Modal management
const modal = document.getElementById('prescriptionModal');

function openModal() {
    if (!modal) return;
    modal.classList.remove('opacity-0', 'invisible');
    modal.classList.add('opacity-100', 'visible');
}

function closeModal() {
    if (!modal) return;
    modal.classList.add('opacity-0', 'invisible');
    modal.classList.remove('opacity-100', 'visible');
}

// View prescription handler
window.viewPrescriptionHandler = function(id) {
    const prescription = prescriptions.find(p => p.id === id);
    if (!prescription) {
        showToast('Prescription not found', 'error');
        return;
    }
    
    const detailsDiv = document.getElementById('prescriptionDetails');
    if (detailsDiv) {
        detailsDiv.innerHTML = `
            <div class="border-b border-[#f0e8e0] pb-4 mb-4">
                <h3 class="font-semibold text-[#5a4a3a] text-lg">${escapeHtml(prescription.patientName)}</h3>
                <div class="grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <p class="text-xs text-[#b8aa9a]">Date</p>
                        <p class="text-sm text-[#5a4a3a]">${prescription.date}</p>
                    </div>
                    <div>
                        <p class="text-xs text-[#b8aa9a]">Doctor</p>
                        <p class="text-sm text-[#5a4a3a]">Dr. ${escapeHtml(prescription.doctorName)}</p>
                    </div>
                </div>
            </div>
            
            <div class="mb-4">
                <p class="text-xs font-medium text-[#b8aa9a] uppercase tracking-wide mb-1">Diagnosis</p>
                <p class="text-sm text-[#5a4a3a] bg-[#fefcf9] p-3 rounded-xl border border-[#f0e8e0]">${escapeHtml(prescription.diagnosis)}</p>
            </div>
            
            <div class="mb-4">
                <p class="text-xs font-medium text-[#b8aa9a] uppercase tracking-wide mb-1">Prescription / Medicines</p>
                <div class="bg-[#fefcf9] p-3 rounded-xl border border-[#f0e8e0]">
                    <pre class="whitespace-pre-wrap text-sm text-[#5a4a3a] font-mono prescription-content">${escapeHtml(prescription.prescription)}</pre>
                </div>
            </div>
            
            ${prescription.followUp ? `
            <div class="mb-4">
                <p class="text-xs font-medium text-[#b8aa9a] uppercase tracking-wide mb-1">Follow-up</p>
                <p class="text-sm text-[#d4a853] bg-[#fef5e8] p-2 rounded-xl inline-block">Follow up after ${escapeHtml(prescription.followUp)}</p>
            </div>
            ` : ''}
            
            <div class="mt-4 pt-3 border-t border-[#f0e8e0] text-center">
                <p class="text-xs text-[#b8aa9a]">MedFlow Hospital - Digital Prescription</p>
                <p class="text-xs text-[#d4c9bc]">www.medflow.com</p>
            </div>
        `;
    }
    
    openModal();
};

// Print single prescription handler
window.printPrescriptionHandler = function(id) {
    const prescription = prescriptions.find(p => p.id === id);
    if (!prescription) {
        showToast('Prescription not found', 'error');
        return;
    }
    
    const printContent = `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white;">
            <div style="text-align: center; border-bottom: 2px solid #a8c49a; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #5a4a3a; margin: 0;">MedFlow Hospital</h1>
                <p style="color: #9a8e82; margin: 5px 0;">Digital Prescription</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #5a4a3a; margin: 0 0 10px 0;">Patient Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0;"><strong>Name:</strong></td><td>${escapeHtml(prescription.patientName)}</td></tr>
                    <tr><td style="padding: 8px 0;"><strong>Date:</strong></td><td>${prescription.date}</td></tr>
                    <tr><td style="padding: 8px 0;"><strong>Doctor:</strong></td><td>Dr. ${escapeHtml(prescription.doctorName)}</td></tr>
                </table>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #5a4a3a; margin: 0 0 10px 0;">Diagnosis</h3>
                <div style="background: #fefcf9; padding: 15px; border-radius: 8px; border: 1px solid #f0e8e0;">
                    <p style="margin: 0;">${escapeHtml(prescription.diagnosis)}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #5a4a3a; margin: 0 0 10px 0;">Prescription</h3>
                <div style="background: #fefcf9; padding: 15px; border-radius: 8px; border: 1px solid #f0e8e0;">
                    <pre style="white-space: pre-wrap; font-family: monospace; margin: 0; font-size: 14px;">${escapeHtml(prescription.prescription)}</pre>
                </div>
            </div>
            
            ${prescription.followUp ? `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #5a4a3a; margin: 0 0 10px 0;">Follow-up</h3>
                <p style="color: #d4a853; background: #fef5e8; padding: 10px; border-radius: 8px; display: inline-block;">Follow up after ${escapeHtml(prescription.followUp)}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #f0e8e0; color: #b8aa9a; font-size: 12px;">
                <p>This is a computer-generated prescription. Valid with doctor's signature.</p>
                <p>MedFlow Hospital - www.medflow.com</p>
            </div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>Prescription - ${escapeHtml(prescription.patientName)}</title>
            <style>
                @media print {
                    body { margin: 0; padding: 0; }
                    .no-print { display: none; }
                }
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
};

// Global print all prescriptions (from header button)
function printAllPrescriptions() {
    if (prescriptions.length === 0) {
        showToast('No prescriptions to print', 'error');
        return;
    }
    
    let allPrescriptionsHtml = `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 40px;">
            <div style="text-align: center; border-bottom: 2px solid #a8c49a; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #5a4a3a; margin: 0;">MedFlow Hospital</h1>
                <p style="color: #9a8e82; margin: 5px 0;">All Prescriptions Report</p>
                <p style="color: #9a8e82; font-size: 12px;">Generated on ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
    `;
    
    prescriptions.forEach((p, index) => {
        allPrescriptionsHtml += `
            <div style="margin-bottom: 40px; page-break-inside: avoid; border: 1px solid #f0e8e0; padding: 20px; border-radius: 8px;">
                <div style="background: #fefcf9; padding: 10px; margin-bottom: 15px;">
                    <h3 style="color: #5a4a3a; margin: 0;">#${index + 1} - ${escapeHtml(p.patientName)}</h3>
                    <p style="color: #9a8e82; margin: 5px 0 0;">Date: ${p.date} | Doctor: Dr. ${escapeHtml(p.doctorName)}</p>
                </div>
                <div><strong>Diagnosis:</strong> ${escapeHtml(p.diagnosis)}</div>
                <div style="margin-top: 10px;"><strong>Prescription:</strong></div>
                <pre style="white-space: pre-wrap; font-family: monospace; background: #fefcf9; padding: 10px; border-radius: 8px;">${escapeHtml(p.prescription)}</pre>
            </div>
        `;
    });
    
    allPrescriptionsHtml += `</div>`;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>All Prescriptions - MedFlow</title>
            <style>
                @media print {
                    body { margin: 0; padding: 20px; }
                }
                body { font-family: 'Poppins', Arial, sans-serif; }
            </style>
            </head>
            <body>${allPrescriptionsHtml}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        showToast('Opening print dialog for all prescriptions...', 'success');
    } else {
        showToast('Please allow popups to print', 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    const searchInput = document.getElementById('searchInput');
    const patientFilter = document.getElementById('patientFilter');
    const resetFilter = document.getElementById('resetFilter');
    const printBtn = document.getElementById('printBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const printModalBtn = document.getElementById('printModalBtn');
    const modalOverlay = modal?.querySelector('.modal-overlay');
    
    if (searchInput) searchInput.addEventListener('input', () => renderPrescriptions());
    if (patientFilter) patientFilter.addEventListener('change', () => renderPrescriptions());
    if (resetFilter) {
        resetFilter.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (patientFilter) patientFilter.value = '';
            renderPrescriptions();
        });
    }
    if (printBtn) printBtn.addEventListener('click', () => printAllPrescriptions());
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (printModalBtn) printModalBtn.addEventListener('click', () => {
        const prescriptionContent = document.getElementById('prescriptionDetails')?.innerHTML;
        if (prescriptionContent) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>Prescription - MedFlow</title>
                    <style>
                        body { font-family: 'Poppins', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        @media print { body { padding: 20px; } }
                    </style>
                    </head>
                    <body>${prescriptionContent}</body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    });
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('invisible')) {
            closeModal();
        }
    });
});