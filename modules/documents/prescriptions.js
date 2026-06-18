/**
 * Prescriptions Management Module
 * MedFlow - Patient Prescriptions History
 * Uses theme.css for styling, clean event handling
 */

var prescriptions = [];
var patients = [];
var searchTerm = '';
var patientFilter = '';
var isInitialized = false;
var currentPrescriptionId = null;

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
        
        // Load prescriptions from consultations
        var storedConsultations = localStorage.getItem('hms_consultations');
        if (storedConsultations) {
            var consultations = JSON.parse(storedConsultations);
            prescriptions = [];
            for (var i = 0; i < consultations.length; i++) {
                if (consultations[i].prescription && consultations[i].prescription.trim() !== '') {
                    prescriptions.push({
                        id: consultations[i].id,
                        patientId: consultations[i].patientId,
                        patientName: consultations[i].patientName,
                        doctorName: consultations[i].doctorName,
                        date: consultations[i].date,
                        prescription: consultations[i].prescription,
                        diagnosis: consultations[i].diagnosis,
                        followUp: consultations[i].followUp || null
                    });
                }
            }
        } else {
            // Sample Indian prescriptions
            var today = new Date().toISOString().split('T')[0];
            var lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            var lastMonthStr = lastMonth.toISOString().split('T')[0];
            
            prescriptions = [
                { 
                    id: 1, patientId: 1, patientName: 'Rajesh Kumar', doctorName: 'Dr. Anjali Nair', 
                    date: today, 
                    diagnosis: 'Type 2 Diabetes with Hypertension',
                    prescription: 'Tab. Metformin 500mg - 1 tablet twice daily after meals\nTab. Telmisartan 40mg - 1 tablet once daily\nTab. Atorvastatin 10mg - 1 tablet at night',
                    followUp: '15 days'
                },
                { 
                    id: 2, patientId: 2, patientName: 'Priya Sharma', doctorName: 'Dr. Vikram Singh', 
                    date: lastMonthStr, 
                    diagnosis: 'Upper Respiratory Tract Infection',
                    prescription: 'Tab. Azithromycin 500mg - 1 tablet once daily for 3 days\nTab. Levocetirizine 5mg - 1 tablet at night for 5 days\nSyrup. Ascoril - 10ml thrice daily for 5 days',
                    followUp: '5 days'
                },
                { 
                    id: 3, patientId: 3, patientName: 'Amit Patel', doctorName: 'Dr. Sneha Joshi', 
                    date: lastMonthStr, 
                    diagnosis: 'Acute Gastritis',
                    prescription: 'Tab. Pantoprazole 40mg - 1 tablet before breakfast\nTab. Domperidone 10mg - 1 tablet before meals\nSyp. Digene - 2 tsp thrice daily after meals',
                    followUp: '7 days'
                },
                { 
                    id: 4, patientId: 4, patientName: 'Sunita Verma', doctorName: 'Dr. Rajiv Menon', 
                    date: lastMonthStr, 
                    diagnosis: 'Osteoarthritis - Right Knee',
                    prescription: 'Tab. Aceclofenac 100mg - 1 tablet twice daily after meals\nTab. Serratiopeptidase 10mg - 1 tablet twice daily\nGel. Volini - Apply locally twice daily',
                    followUp: '1 month'
                },
                { 
                    id: 5, patientId: 5, patientName: 'Vikram Singh', doctorName: 'Dr. Neha Gupta', 
                    date: lastMonthStr, 
                    diagnosis: 'Allergic Rhinitis',
                    prescription: 'Tab. Montelukast 10mg + Levocetirizine 5mg - 1 tablet at night\nNasal spray. Fluticasone - 2 sprays in each nostril twice daily',
                    followUp: '15 days'
                }
            ];
        }
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading prescription data', 'error');
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    var total = prescriptions.length;
    var currentMonth = new Date().toISOString().substring(0, 7);
    var monthCount = 0;
    var patientIds = {};
    var allMedicines = [];
    
    for (var i = 0; i < prescriptions.length; i++) {
        if (prescriptions[i].date && prescriptions[i].date.startsWith(currentMonth)) {
            monthCount++;
        }
        if (prescriptions[i].patientId) {
            patientIds[prescriptions[i].patientId] = true;
        }
        if (prescriptions[i].prescription) {
            var medicines = prescriptions[i].prescription.match(/\b[A-Za-z]+(?:cin|micin|zole|pam|statin|pril|olol|prazole|idine|cycline|mycin|floxacin|dipine|sartan)\b/gi) || [];
            for (var j = 0; j < medicines.length; j++) {
                allMedicines.push(medicines[j]);
            }
        }
    }
    
    var uniquePatients = Object.keys(patientIds).length;
    var uniqueMedicines = new Set(allMedicines).size;
    
    document.getElementById('totalPrescriptions').textContent = total;
    document.getElementById('monthPrescriptions').textContent = monthCount;
    document.getElementById('activePatients').textContent = uniquePatients;
    document.getElementById('uniqueMedicines').textContent = uniqueMedicines;
}

// ─── Populate Filters ──────────────────────────────

function populateFilters() {
    var filterSelect = document.getElementById('patientFilter');
    if (filterSelect) {
        var html = '<option value="">All Patients</option>';
        for (var i = 0; i < patients.length; i++) {
            html += '<option value="' + patients[i].id + '">' + esc(patients[i].fullName) + '</option>';
        }
        filterSelect.innerHTML = html;
    }
}

// ─── Filter ──────────────────────────────────────────

function getFilteredPrescriptions() {
    return prescriptions.filter(function(p) {
        var matchesSearch = searchTerm === '' || 
            p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.prescription.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesPatient = patientFilter === '' || p.patientId.toString() === patientFilter;
        return matchesSearch && matchesPatient;
    });
}

// ─── Extract Medicines ──────────────────────────────

function extractMedicines(prescriptionText) {
    if (!prescriptionText) return [];
    var medicines = prescriptionText.match(/\b[A-Za-z]+(?:cin|micin|zole|pam|statin|pril|olol|prazole|idine|cycline|mycin|floxacin|dipine|sartan)\b/gi) || [];
    var unique = [];
    for (var i = 0; i < medicines.length; i++) {
        if (unique.indexOf(medicines[i]) === -1) {
            unique.push(medicines[i]);
        }
    }
    return unique.slice(0, 5);
}

// ─── Render ──────────────────────────────────────────

function renderPrescriptions() {
    var grid = document.getElementById('prescriptionsGrid');
    if (!grid) return;
    
    var filtered = getFilteredPrescriptions();
    filtered.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem 1.25rem; color:var(--color-brown-100);"><i class="fas fa-folder-open" style="font-size:2rem; margin-bottom:0.75rem; display:block; opacity:0.4;"></i><p style="font-size:0.875rem; font-weight:var(--font-weight-light);">No prescriptions found</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var p = filtered[i];
        var medicines = extractMedicines(p.prescription);
        var preview = p.prescription.substring(0, 80) + (p.prescription.length > 80 ? '...' : '');
        
        html += '<div class="prescription-card">';
        html += '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">';
        html += '<div><h3 class="patient-name" style="font-size:0.8125rem; font-weight:var(--font-weight-medium); color:var(--color-brown-700); margin:0;">' + esc(p.patientName) + '</h3>';
        html += '<p class="doctor-name" style="font-size:0.6875rem; color:var(--color-brown-300); margin:0;">' + esc(p.doctorName) + '</p>';
        html += '<div style="display:flex; align-items:center; gap:0.375rem; margin-top:0.25rem;"><i class="fas fa-calendar-alt" style="color:var(--color-brown-100); font-size:0.625rem;"></i><span class="date-text" style="font-size:0.625rem; color:var(--color-brown-100);">' + p.date + '</span></div>';
        html += '</div>';
        html += '<button class="view-btn" data-id="' + p.id + '" style="background:none; border:none; color:var(--color-sage); cursor:pointer; font-size:1rem;"><i class="fas fa-eye"></i></button>';
        html += '</div>';
        
        html += '<div style="margin-top:0.5rem;"><p style="font-size:0.625rem; font-weight:var(--font-weight-medium); color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.04em; margin:0;">Diagnosis</p><p class="diagnosis-text" style="font-size:0.6875rem; color:var(--color-brown-600); margin:0;">' + esc(p.diagnosis) + '</p></div>';
        
        html += '<div style="margin-top:0.375rem;"><p style="font-size:0.625rem; font-weight:var(--font-weight-medium); color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.04em; margin:0;">Medicines</p><div style="display:flex; flex-wrap:wrap; gap:0.25rem; margin-top:0.25rem;">';
        for (var j = 0; j < medicines.length; j++) {
            html += '<span class="medicine-tag">' + esc(medicines[j]) + '</span>';
        }
        if (medicines.length === 0) {
            html += '<span style="font-size:0.625rem; color:var(--color-brown-100);">No medicines listed</span>';
        }
        html += '</div>';
        html += '<p style="font-size:0.625rem; color:var(--color-brown-100); margin-top:0.25rem; font-style:italic;">"' + esc(preview) + '"</p></div>';
        
        html += '<div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">';
        html += '<button class="card-btn-print print-btn" data-id="' + p.id + '"><i class="fas fa-print"></i> Print Prescription</button>';
        html += '</div></div>';
    }
    grid.innerHTML = html;
    
    // Bind events
    grid.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { viewPrescription(parseInt(this.dataset.id)); });
    });
    grid.querySelectorAll('.print-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { printPrescription(parseInt(this.dataset.id)); });
    });
}

function refreshUI() {
    updateStats();
    renderPrescriptions();
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

// ─── View Prescription ──────────────────────────────────

function viewPrescription(id) {
    var prescription = null;
    for (var i = 0; i < prescriptions.length; i++) {
        if (prescriptions[i].id === id) { prescription = prescriptions[i]; break; }
    }
    if (!prescription) {
        showToast('Prescription not found', 'error');
        return;
    }
    
    currentPrescriptionId = id;
    var detailsDiv = document.getElementById('prescriptionDetails');
    if (detailsDiv) {
        detailsDiv.innerHTML = '';
        
        detailsDiv.innerHTML += '<div style="border-bottom:1px solid var(--border-default); padding-bottom:1rem; margin-bottom:1rem;">';
        detailsDiv.innerHTML += '<h3 style="font-weight:var(--font-weight-semibold); color:var(--color-brown-700); font-size:1rem; margin:0;">' + esc(prescription.patientName) + '</h3>';
        detailsDiv.innerHTML += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:0.5rem;">';
        detailsDiv.innerHTML += '<div><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">Date</p><p style="font-size:0.8125rem; color:var(--color-brown-700); margin:0;">' + prescription.date + '</p></div>';
        detailsDiv.innerHTML += '<div><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">Doctor</p><p style="font-size:0.8125rem; color:var(--color-brown-700); margin:0;">' + esc(prescription.doctorName) + '</p></div>';
        detailsDiv.innerHTML += '</div></div>';
        
        detailsDiv.innerHTML += '<div style="margin-bottom:1rem;"><p style="font-size:0.6875rem; font-weight:var(--font-weight-medium); color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:0.25rem;">Diagnosis</p><div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-default);"><p style="font-size:0.8125rem; color:var(--color-brown-700); margin:0;">' + esc(prescription.diagnosis) + '</p></div></div>';
        
        detailsDiv.innerHTML += '<div style="margin-bottom:1rem;"><p style="font-size:0.6875rem; font-weight:var(--font-weight-medium); color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:0.25rem;">Prescription / Medicines</p><div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-default);"><pre class="prescription-content">' + esc(prescription.prescription) + '</pre></div></div>';
        
        if (prescription.followUp) {
            detailsDiv.innerHTML += '<div style="margin-bottom:1rem;"><p style="font-size:0.6875rem; font-weight:var(--font-weight-medium); color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:0.25rem;">Follow-up</p><div style="background:#fef5e8; padding:0.5rem 0.75rem; border-radius:var(--radius-md); display:inline-block;"><p style="font-size:0.8125rem; color:var(--color-warning-text); margin:0;">Follow up after ' + esc(prescription.followUp) + '</p></div></div>';
        }
        
        detailsDiv.innerHTML += '<div style="margin-top:0.5rem; padding-top:0.75rem; border-top:1px solid var(--border-default); text-align:center;"><p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">MedFlow Hospital - Digital Prescription</p><p style="font-size:0.625rem; color:var(--color-brown-100); margin:0;">www.medflow.com</p></div>';
    }
    
    openModal('prescriptionModal');
}

// ─── Print Prescription ──────────────────────────────────

function printPrescription(id) {
    var prescription = null;
    for (var i = 0; i < prescriptions.length; i++) {
        if (prescriptions[i].id === id) { prescription = prescriptions[i]; break; }
    }
    if (!prescription) {
        showToast('Prescription not found', 'error');
        return;
    }
    
    var printContent = '';
    printContent += '<div style="font-family:Poppins, Arial, sans-serif; max-width:800px; margin:0 auto; padding:40px; background:white;">';
    printContent += '<div style="text-align:center; border-bottom:2px solid #a8c49a; padding-bottom:20px; margin-bottom:30px;">';
    printContent += '<h1 style="color:#5a4a3a; margin:0;">MedFlow Hospital</h1>';
    printContent += '<p style="color:#9a8e82; margin:5px 0;">Digital Prescription</p></div>';
    
    printContent += '<div style="margin-bottom:30px;"><h3 style="color:#5a4a3a; margin:0 0 10px 0;">Patient Information</h3><table style="width:100%; border-collapse:collapse;"><tr><td style="padding:8px 0;"><strong>Name:</strong></td><td>' + esc(prescription.patientName) + '</td></tr><tr><td style="padding:8px 0;"><strong>Date:</strong></td><td>' + prescription.date + '</td></tr><tr><td style="padding:8px 0;"><strong>Doctor:</strong></td><td>' + esc(prescription.doctorName) + '</td></tr></table></div>';
    
    printContent += '<div style="margin-bottom:30px;"><h3 style="color:#5a4a3a; margin:0 0 10px 0;">Diagnosis</h3><div style="background:#fefcf9; padding:15px; border-radius:8px; border:1px solid #f0e8e0;"><p style="margin:0;">' + esc(prescription.diagnosis) + '</p></div></div>';
    
    printContent += '<div style="margin-bottom:30px;"><h3 style="color:#5a4a3a; margin:0 0 10px 0;">Prescription</h3><div style="background:#fefcf9; padding:15px; border-radius:8px; border:1px solid #f0e8e0;"><pre style="white-space:pre-wrap; font-family:monospace; margin:0; font-size:14px; line-height:1.8;">' + esc(prescription.prescription) + '</pre></div></div>';
    
    if (prescription.followUp) {
        printContent += '<div style="margin-bottom:30px;"><h3 style="color:#5a4a3a; margin:0 0 10px 0;">Follow-up</h3><p style="color:#d4a853; background:#fef5e8; padding:10px; border-radius:8px; display:inline-block;">Follow up after ' + esc(prescription.followUp) + '</p></div>';
    }
    
    printContent += '<div style="text-align:center; margin-top:50px; padding-top:20px; border-top:1px solid #f0e8e0; color:#b8aa9a; font-size:12px;"><p>This is a computer-generated prescription. Valid with doctor\'s signature.</p><p>MedFlow Hospital - www.medflow.com</p></div></div>';
    
    var printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>Prescription - ' + esc(prescription.patientName) + '</title><style>*{margin:0;padding:0;box-sizing:border-box;}@media print{body{margin:0;padding:0;}}.no-print{display:none;}body{font-family:Poppins, Arial, sans-serif;background:white;}</style></head><body>' + printContent + '</body></html>');
        printWindow.document.close();
        printWindow.print();
        showToast('Opening print dialog...', 'success');
    } else {
        showToast('Please allow popups to print', 'error');
    }
}

// ─── Init ────────────────────────────────────────────

function initPrescriptionsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderPrescriptions();
    });
    
    document.getElementById('patientFilter').addEventListener('change', function(e) {
        patientFilter = e.target.value;
        renderPrescriptions();
    });
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        patientFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('patientFilter').value = '';
        renderPrescriptions();
    });
    
    document.getElementById('closeModalBtn').addEventListener('click', function() { closeModal('prescriptionModal'); });
    document.getElementById('closeFooterBtn').addEventListener('click', function() { closeModal('prescriptionModal'); });
    document.getElementById('printModalBtn').addEventListener('click', function() {
        if (currentPrescriptionId) {
            printPrescription(currentPrescriptionId);
        } else {
            showToast('No prescription selected', 'error');
        }
    });
    
    document.getElementById('prescriptionModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('prescriptionModal');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('prescriptionModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initPrescriptionsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkInterval);
        initPrescriptionsModule();
    }, 3000);
});

// ─── Expose ────────────────────────────────────────────

window.viewPrescription = viewPrescription;
window.printPrescription = printPrescription;