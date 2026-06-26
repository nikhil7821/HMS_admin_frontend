/**
 * Prescriptions Management Module
 * Version: 3.0 - COMPLETE PROFESSIONAL UPGRADE
 * 
 * Features:
 * ✅ Full CRUD operations
 * ✅ Patient and Doctor linking
 * ✅ Medicine extraction and tagging
 * ✅ Search and filter
 * ✅ Real-time stats
 * ✅ Print prescription
 * ✅ Professional UI with cards
 * ✅ Detailed view with all fields
 */

let prescriptions = [];
let patients = [];
let doctors = [];
let deleteTargetId = null;
let viewTargetId = null;
let searchTerm = '';
let patientFilter = '';
let doctorFilter = '';
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
    return 'RX' + Date.now() + Math.floor(Math.random() * 1000);
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
        
        // Load doctors
        var storedDoctors = localStorage.getItem('hms_doctors');
        if (storedDoctors) {
            doctors = JSON.parse(storedDoctors);
        } else {
            doctors = [
                { id: 1, name: 'Dr. Anjali Nair', specialty: 'General Physician' },
                { id: 2, name: 'Dr. Vikram Singh', specialty: 'Internal Medicine' },
                { id: 3, name: 'Dr. Sneha Joshi', specialty: 'Gastroenterology' },
                { id: 4, name: 'Dr. Rajiv Menon', specialty: 'Orthopedics' },
                { id: 5, name: 'Dr. Neha Gupta', specialty: 'ENT' }
            ];
            localStorage.setItem('hms_doctors', JSON.stringify(doctors));
        }
        
        // Load prescriptions
        var stored = localStorage.getItem('prescriptions_data');
        if (stored) {
            prescriptions = JSON.parse(stored);
        } else {
            createSampleData();
        }
        
        refreshUI();
        populateFilters();
    } catch (error) {
        console.error('Error loading prescription data:', error);
        showToast('Error loading prescription data', 'error');
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
    
    prescriptions = [
        {
            id: generateId(),
            patientId: 1,
            patientName: 'Rajesh Kumar',
            doctorId: 1,
            doctorName: 'Dr. Anjali Nair',
            date: today,
            diagnosis: 'Type 2 Diabetes with Hypertension',
            prescription: 'Tab. Metformin 500mg - 1 tablet twice daily after meals\nTab. Telmisartan 40mg - 1 tablet once daily\nTab. Atorvastatin 10mg - 1 tablet at night\nTab. Aspirin 75mg - 1 tablet once daily\n\nDiet: Low sugar, low salt diet\nExercise: 30 min walking daily',
            followUp: '15 days'
        },
        {
            id: generateId(),
            patientId: 2,
            patientName: 'Priya Sharma',
            doctorId: 2,
            doctorName: 'Dr. Vikram Singh',
            date: lastWeekStr,
            diagnosis: 'Upper Respiratory Tract Infection',
            prescription: 'Tab. Azithromycin 500mg - 1 tablet once daily for 3 days\nTab. Levocetirizine 5mg - 1 tablet at night for 5 days\nSyrup. Ascoril - 10ml thrice daily for 5 days\nTab. Paracetamol 650mg - 1 tablet SOS for fever\n\nPlenty of warm fluids, rest, steam inhalation',
            followUp: '5 days'
        },
        {
            id: generateId(),
            patientId: 3,
            patientName: 'Amit Patel',
            doctorId: 3,
            doctorName: 'Dr. Sneha Joshi',
            date: lastMonthStr,
            diagnosis: 'Acute Gastritis with GERD',
            prescription: 'Tab. Pantoprazole 40mg - 1 tablet before breakfast\nTab. Domperidone 10mg - 1 tablet before meals\nSyp. Digene - 2 tsp thrice daily after meals\nTab. Ranitidine 150mg - 1 tablet at night\n\nAvoid spicy, oily, and acidic foods\nSmall frequent meals',
            followUp: '7 days'
        },
        {
            id: generateId(),
            patientId: 4,
            patientName: 'Sunita Verma',
            doctorId: 4,
            doctorName: 'Dr. Rajiv Menon',
            date: lastWeekStr,
            diagnosis: 'Osteoarthritis - Right Knee',
            prescription: 'Tab. Aceclofenac 100mg - 1 tablet twice daily after meals\nTab. Serratiopeptidase 10mg - 1 tablet twice daily\nTab. Glucosamine 1500mg - 1 tablet once daily\nGel. Volini - Apply locally thrice daily\n\nHot pack application, knee strengthening exercises',
            followUp: '1 month'
        },
        {
            id: generateId(),
            patientId: 5,
            patientName: 'Vikram Singh',
            doctorId: 5,
            doctorName: 'Dr. Neha Gupta',
            date: lastMonthStr,
            diagnosis: 'Allergic Rhinitis with Sinusitis',
            prescription: 'Tab. Montelukast 10mg + Levocetirizine 5mg - 1 tablet at night\nNasal spray. Fluticasone - 2 sprays in each nostril twice daily\nTab. Ambroxol 30mg - 1 tablet thrice daily\n\nAvoid dust and pollen, use saline nasal rinse',
            followUp: '15 days'
        },
        {
            id: generateId(),
            patientId: 1,
            patientName: 'Rajesh Kumar',
            doctorId: 1,
            doctorName: 'Dr. Anjali Nair',
            date: lastMonthStr,
            diagnosis: 'Follow-up - Diabetes Review',
            prescription: 'Tab. Metformin 500mg - 1 tablet thrice daily\nTab. Glimepiride 2mg - 1 tablet once daily\nTab. Telmisartan 40mg - 1 tablet once daily\nTab. Atorvastatin 10mg - 1 tablet at night\n\nHbA1c to be checked in 3 months',
            followUp: '3 months'
        }
    ];
    savePrescriptions();
}

function savePrescriptions() {
    try {
        localStorage.setItem('prescriptions_data', JSON.stringify(prescriptions));
    } catch (error) {
        console.error('Error saving prescriptions:', error);
    }
}

// ─── Stats ─────────────────────────────────────────────────────────────

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
            var medicines = prescriptions[i].prescription.match(/\b[A-Za-z]+(?:cin|micin|zole|pam|statin|pril|olol|prazole|idine|cycline|mycin|floxacin|dipine|sartan|dipine|pine)\b/gi) || [];
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

// ─── Populate Filters ───────────────────────────────────────────────

function populateFilters() {
    // Patient filter
    var patientFilterSelect = document.getElementById('patientFilter');
    if (patientFilterSelect) {
        var html = '<option value="">All Patients</option>';
        for (var i = 0; i < patients.length; i++) {
            html += '<option value="' + patients[i].id + '">' + esc(patients[i].fullName) + '</option>';
        }
        patientFilterSelect.innerHTML = html;
    }
    
    // Doctor filter
    var doctorFilterSelect = document.getElementById('doctorFilter');
    if (doctorFilterSelect) {
        var html2 = '<option value="">All Doctors</option>';
        for (var j = 0; j < doctors.length; j++) {
            html2 += '<option value="' + doctors[j].id + '">' + esc(doctors[j].name) + '</option>';
        }
        doctorFilterSelect.innerHTML = html2;
    }
    
    // Patient select in modal
    var patientSelect = document.getElementById('patientId');
    if (patientSelect) {
        var html3 = '<option value="">-- Select Patient --</option>';
        for (var k = 0; k < patients.length; k++) {
            html3 += '<option value="' + patients[k].id + '">' + esc(patients[k].fullName) + ' (' + patients[k].phone + ')</option>';
        }
        patientSelect.innerHTML = html3;
    }
    
    // Doctor select in modal
    var doctorSelect = document.getElementById('doctorId');
    if (doctorSelect) {
        var html4 = '<option value="">-- Select Doctor --</option>';
        for (var l = 0; l < doctors.length; l++) {
            html4 += '<option value="' + doctors[l].id + '">' + esc(doctors[l].name) + ' (' + doctors[l].specialty + ')</option>';
        }
        doctorSelect.innerHTML = html4;
    }
}

// ─── Filter ──────────────────────────────────────────────────────────────

function getFilteredPrescriptions() {
    var result = [];
    for (var i = 0; i < prescriptions.length; i++) {
        var p = prescriptions[i];
        var matchesSearch = searchTerm === '' || 
            p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.prescription.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesPatient = patientFilter === '' || p.patientId.toString() === patientFilter;
        var matchesDoctor = doctorFilter === '' || p.doctorId.toString() === doctorFilter;
        if (matchesSearch && matchesPatient && matchesDoctor) {
            result.push(p);
        }
    }
    // Sort by date (newest first)
    result.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    return result;
}

// ─── Extract Medicines ──────────────────────────────────────────────────

function extractMedicines(prescriptionText) {
    if (!prescriptionText) return [];
    var medicines = prescriptionText.match(/\b[A-Za-z]+(?:cin|micin|zole|pam|statin|pril|olol|prazole|idine|cycline|mycin|floxacin|dipine|sartan|dipine|pine|rone|done|dine|mine|pine)\b/gi) || [];
    var unique = [];
    for (var i = 0; i < medicines.length; i++) {
        var med = medicines[i].charAt(0).toUpperCase() + medicines[i].slice(1).toLowerCase();
        if (unique.indexOf(med) === -1) {
            unique.push(med);
        }
    }
    return unique.slice(0, 6);
}

// ─── Render ──────────────────────────────────────────────────────────────

function renderPrescriptions() {
    var grid = document.getElementById('prescriptionsGrid');
    if (!grid) return;
    
    var filtered = getFilteredPrescriptions();
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-prescription-bottle"></i><p>No prescriptions found</p><p style="font-size:0.75rem; margin-top:0.25rem;">Add a prescription to get started.</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var p = filtered[i];
        var medicines = extractMedicines(p.prescription);
        var preview = p.prescription.substring(0, 80) + (p.prescription.length > 80 ? '...' : '');
        var hasFollowUp = p.followUp && p.followUp !== '';
        
        html += '<div class="prescription-card" data-id="' + p.id + '">';
        html += '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">';
        html += '<div><h3 class="patient-name">' + esc(p.patientName) + '</h3>';
        html += '<p class="doctor-name"><i class="fas fa-user-md" style="margin-right:0.25rem;"></i>' + esc(p.doctorName) + '</p>';
        html += '<div style="display:flex; align-items:center; gap:0.375rem; margin-top:0.25rem;">';
        html += '<i class="fas fa-calendar-alt" style="color:var(--color-brown-100); font-size:0.625rem;"></i>';
        html += '<span class="date-text">' + formatDate(p.date) + '</span>';
        if (hasFollowUp) {
            html += '<span style="display:inline-block; padding:0.05rem 0.4rem; border-radius:var(--radius-full); font-size:0.55rem; font-weight:var(--font-weight-medium); background:#fef5e8; color:var(--color-warning-text);">Follow-up: ' + p.followUp + '</span>';
        }
        html += '</div></div>';
        html += '<div style="display:flex; gap:0.25rem;">';
        html += '<button class="view-btn" data-id="' + p.id + '" style="background:none; border:none; color:var(--color-sage); cursor:pointer; font-size:1rem;"><i class="fas fa-eye"></i></button>';
        html += '</div></div>';
        
        html += '<div style="margin-top:0.5rem;">';
        html += '<p style="font-size:0.625rem; font-weight:var(--font-weight-medium); color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.04em; margin:0;">Diagnosis</p>';
        html += '<p class="diagnosis-text">' + esc(p.diagnosis) + '</p></div>';
        
        html += '<div style="margin-top:0.375rem;">';
        html += '<p style="font-size:0.625rem; font-weight:var(--font-weight-medium); color:var(--color-brown-100); text-transform:uppercase; letter-spacing:0.04em; margin:0;">Medicines</p>';
        html += '<div style="display:flex; flex-wrap:wrap; gap:0.25rem; margin-top:0.25rem;">';
        if (medicines.length > 0) {
            for (var j = 0; j < medicines.length; j++) {
                html += '<span class="medicine-tag">' + esc(medicines[j]) + '</span>';
            }
        } else {
            html += '<span style="font-size:0.625rem; color:var(--color-brown-100);">No medicines listed</span>';
        }
        html += '</div></div>';
        
        html += '<p style="font-size:0.625rem; color:var(--color-brown-100); margin-top:0.25rem; font-style:italic;">"' + esc(preview) + '"</p>';
        
        html += '<div style="display:flex; gap:0.5rem; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">';
        html += '<button class="card-btn card-btn-primary view-btn" data-id="' + p.id + '"><i class="fas fa-eye"></i> View</button>';
        html += '<button class="card-btn card-btn-print print-btn" data-id="' + p.id + '"><i class="fas fa-print"></i> Print</button>';
        html += '<button class="card-btn card-btn-danger delete-btn" data-id="' + p.id + '"><i class="fas fa-trash"></i></button>';
        html += '</div></div>';
    }
    grid.innerHTML = html;
    
    // Bind events
    grid.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { viewPrescription(this.dataset.id); });
    });
    grid.querySelectorAll('.print-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { printPrescription(this.dataset.id); });
    });
    grid.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openDeleteModal(this.dataset.id); });
    });
}

function refreshUI() {
    updateStats();
    renderPrescriptions();
}

// ─── Validation ─────────────────────────────────────────────────────────

function validatePrescriptionForm() {
    var isValid = true;
    var patientId = document.getElementById('patientId').value;
    var doctorId = document.getElementById('doctorId').value;
    var date = document.getElementById('prescriptionDate').value;
    var diagnosis = document.getElementById('diagnosis').value.trim();
    var prescription = document.getElementById('prescriptionText').value.trim();
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function(el) { el.classList.remove('error'); });
    
    if (!patientId) {
        document.getElementById('patientError').classList.add('show');
        document.getElementById('patientId').classList.add('error');
        isValid = false;
    }
    if (!doctorId) {
        document.getElementById('doctorError').classList.add('show');
        document.getElementById('doctorId').classList.add('error');
        isValid = false;
    }
    if (!date) {
        document.getElementById('dateError').classList.add('show');
        document.getElementById('prescriptionDate').classList.add('error');
        isValid = false;
    }
    if (!diagnosis) {
        document.getElementById('diagnosisError').classList.add('show');
        document.getElementById('diagnosis').classList.add('error');
        isValid = false;
    }
    if (!prescription) {
        document.getElementById('prescriptionError').classList.add('show');
        document.getElementById('prescriptionText').classList.add('error');
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
    document.getElementById('prescriptionForm').reset();
    document.getElementById('prescriptionId').value = '';
    document.getElementById('prescriptionDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-prescription-bottle" style="color:var(--color-sage);"></i> Add Prescription';
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function(el) { el.classList.remove('error'); });
    
    populateFilters();
    openModal('prescriptionModal');
}

function openEditModal(id) {
    var prescription = null;
    for (var i = 0; i < prescriptions.length; i++) {
        if (prescriptions[i].id === id) { prescription = prescriptions[i]; break; }
    }
    if (!prescription) return;
    
    document.getElementById('prescriptionId').value = prescription.id;
    document.getElementById('patientId').value = prescription.patientId;
    document.getElementById('doctorId').value = prescription.doctorId;
    document.getElementById('prescriptionDate').value = prescription.date;
    document.getElementById('diagnosis').value = prescription.diagnosis;
    document.getElementById('prescriptionText').value = prescription.prescription;
    document.getElementById('followUp').value = prescription.followUp || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--color-sage);"></i> Edit Prescription';
    
    document.querySelectorAll('.error-text').forEach(function(el) { el.classList.remove('show'); });
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function(el) { el.classList.remove('error'); });
    
    populateFilters();
    openModal('prescriptionModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Save Prescription ──────────────────────────────────────────────────

function savePrescription(e) {
    e.preventDefault();
    if (!validatePrescriptionForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    var id = document.getElementById('prescriptionId').value;
    var patientId = parseInt(document.getElementById('patientId').value);
    var doctorId = parseInt(document.getElementById('doctorId').value);
    var date = document.getElementById('prescriptionDate').value;
    var diagnosis = document.getElementById('diagnosis').value.trim();
    var prescriptionText = document.getElementById('prescriptionText').value.trim();
    var followUp = document.getElementById('followUp').value;
    
    var patient = null;
    for (var i = 0; i < patients.length; i++) {
        if (patients[i].id === patientId) { patient = patients[i]; break; }
    }
    var doctor = null;
    for (var j = 0; j < doctors.length; j++) {
        if (doctors[j].id === doctorId) { doctor = doctors[j]; break; }
    }
    
    if (!patient || !doctor) {
        showToast('Invalid patient or doctor selection', 'error');
        return;
    }
    
    var data = {
        patientId: patientId,
        patientName: patient.fullName,
        doctorId: doctorId,
        doctorName: doctor.name,
        date: date,
        diagnosis: diagnosis,
        prescription: prescriptionText,
        followUp: followUp || ''
    };
    
    if (id) {
        var index = -1;
        for (var k = 0; k < prescriptions.length; k++) {
            if (prescriptions[k].id === id) { index = k; break; }
        }
        if (index !== -1) {
            prescriptions[index] = { id: prescriptions[index].id, ...data };
            showToast('✅ Prescription updated successfully', 'success');
        }
    } else {
        data.id = generateId();
        prescriptions.push(data);
        showToast('✅ Prescription added successfully', 'success');
    }
    
    savePrescriptions();
    refreshUI();
    closeModal('prescriptionModal');
}

// ─── View Prescription ──────────────────────────────────────────────────

function viewPrescription(id) {
    var prescription = null;
    for (var i = 0; i < prescriptions.length; i++) {
        if (prescriptions[i].id === id) { prescription = prescriptions[i]; break; }
    }
    if (!prescription) {
        showToast('Prescription not found', 'error');
        return;
    }
    
    viewTargetId = id;
    var viewContent = document.getElementById('viewContent');
    if (viewContent) {
        viewContent.innerHTML = '';
        
        // Title
        viewContent.innerHTML += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">';
        viewContent.innerHTML += '<div><h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:1.1rem; margin:0;">' + esc(prescription.patientName) + '</h3>';
        viewContent.innerHTML += '<p style="font-size:0.8125rem; color:var(--color-brown-300); margin:0;">' + esc(prescription.doctorName) + '</p></div>';
        if (prescription.followUp) {
            viewContent.innerHTML += '<span style="display:inline-block; padding:0.2rem 0.625rem; border-radius:var(--radius-full); font-size:0.625rem; font-weight:var(--font-weight-medium); background:#fef5e8; color:var(--color-warning-text);">Follow-up: ' + prescription.followUp + '</span>';
        }
        viewContent.innerHTML += '</div>';
        
        // Details grid
        viewContent.innerHTML += '<div class="prescription-detail-grid">';
        viewContent.innerHTML += '<div><p class="prescription-detail-label">Date</p><p class="prescription-detail-value">' + formatDate(prescription.date) + '</p></div>';
        viewContent.innerHTML += '<div><p class="prescription-detail-label">Doctor</p><p class="prescription-detail-value">' + esc(prescription.doctorName) + '</p></div>';
        viewContent.innerHTML += '</div>';
        
        // Diagnosis
        viewContent.innerHTML += '<div class="prescription-detail-section">';
        viewContent.innerHTML += '<p class="prescription-detail-label">Diagnosis</p>';
        viewContent.innerHTML += '<div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-default);">';
        viewContent.innerHTML += '<p style="font-size:0.875rem; color:var(--color-brown-700); margin:0;">' + esc(prescription.diagnosis) + '</p>';
        viewContent.innerHTML += '</div></div>';
        
        // Prescription
        viewContent.innerHTML += '<div class="prescription-detail-section">';
        viewContent.innerHTML += '<p class="prescription-detail-label">Prescription / Medicines</p>';
        viewContent.innerHTML += '<div style="background:var(--bg-subtle); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-default);">';
        viewContent.innerHTML += '<pre class="prescription-content">' + esc(prescription.prescription) + '</pre>';
        viewContent.innerHTML += '</div></div>';
        
        // Footer
        viewContent.innerHTML += '<div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--border-default); text-align:center;">';
        viewContent.innerHTML += '<p style="font-size:0.6875rem; color:var(--color-brown-100); margin:0;">MedFlow Hospital - Digital Prescription</p>';
        viewContent.innerHTML += '<p style="font-size:0.625rem; color:var(--color-brown-100); margin:0;">www.medflow.com</p>';
        viewContent.innerHTML += '</div>';
    }
    
    document.getElementById('viewModalTitle').innerHTML = '<i class="fas fa-prescription-bottle" style="color:var(--color-sage); margin-right:0.5rem;"></i> Prescription - ' + esc(prescription.patientName);
    openModal('viewModal');
}

// ─── Print Prescription ─────────────────────────────────────────────────

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
    printContent += '<div class="print-prescription">';
    printContent += '<div class="print-header">';
    printContent += '<h1>MedFlow Hospital</h1>';
    printContent += '<p style="color:var(--color-brown-300); margin:5px 0 0 0;">Digital Prescription</p>';
    printContent += '</div>';
    
    printContent += '<table>';
    printContent += '<tr><td class="label-cell"><strong>Patient Name:</strong></td><td>' + esc(prescription.patientName) + '</td>';
    printContent += '<td class="label-cell"><strong>Date:</strong></td><td>' + formatDate(prescription.date) + '</td></tr>';
    printContent += '<tr><td class="label-cell"><strong>Doctor:</strong></td><td colspan="3">' + esc(prescription.doctorName) + '</td></tr>';
    printContent += '</table>';
    
    printContent += '<div style="margin-bottom:20px;">';
    printContent += '<h3 style="color:var(--color-brown-700); margin:0 0 10px 0;">Diagnosis</h3>';
    printContent += '<div class="content-box"><p style="margin:0;">' + esc(prescription.diagnosis) + '</p></div></div>';
    
    printContent += '<div style="margin-bottom:20px;">';
    printContent += '<h3 style="color:var(--color-brown-700); margin:0 0 10px 0;">Prescription</h3>';
    printContent += '<div class="content-box"><pre style="white-space:pre-wrap; font-family:monospace; margin:0; font-size:14px; line-height:1.8;">' + esc(prescription.prescription) + '</pre></div></div>';
    
    if (prescription.followUp) {
        printContent += '<div style="margin-bottom:20px;">';
        printContent += '<h3 style="color:var(--color-brown-700); margin:0 0 10px 0;">Follow-up</h3>';
        printContent += '<div class="follow-up-badge">Follow up after ' + esc(prescription.followUp) + '</div></div>';
    }
    
    printContent += '<div class="print-footer">';
    printContent += '<p>This is a computer-generated prescription. Valid with doctor\'s signature.</p>';
    printContent += '<p>MedFlow Hospital - www.medflow.com</p>';
    printContent += '</div></div>';
    
    var printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>Prescription - ' + esc(prescription.patientName) + '</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('*{margin:0;padding:0;box-sizing:border-box;}');
        printWindow.document.write('body{font-family:Poppins, Arial, sans-serif;background:white;padding:20px;}');
        printWindow.document.write('.print-prescription{max-width:800px;margin:0 auto;padding:40px;background:white;}');
        printWindow.document.write('.print-header{text-align:center;border-bottom:2px solid #a8c49a;padding-bottom:20px;margin-bottom:30px;}');
        printWindow.document.write('.print-header h1{color:#5a4a3a;margin:0;}');
        printWindow.document.write('table{width:100%;border-collapse:collapse;margin-bottom:20px;}');
        printWindow.document.write('table td{padding:10px 12px;border:1px solid #f0e8e0;}');
        printWindow.document.write('.label-cell{background:#fefcf9;font-weight:600;}');
        printWindow.document.write('.content-box{background:#fefcf9;padding:15px;border-radius:8px;border:1px solid #f0e8e0;}');
        printWindow.document.write('.follow-up-badge{background:#fef5e8;color:#d4a853;padding:8px 16px;border-radius:8px;display:inline-block;}');
        printWindow.document.write('.print-footer{text-align:center;margin-top:50px;padding-top:20px;border-top:1px solid #f0e8e0;color:#b8aa9a;font-size:12px;}');
        printWindow.document.write('@media print{body{padding:0;}.print-prescription{padding:20px;}}');
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
    
    var prescription = null;
    for (var i = 0; i < prescriptions.length; i++) {
        if (prescriptions[i].id === deleteTargetId) { prescription = prescriptions[i]; break; }
    }
    
    prescriptions = prescriptions.filter(function(p) { return p.id !== deleteTargetId; });
    savePrescriptions();
    refreshUI();
    closeModal('deleteModal');
    
    if (prescription) {
        showToast('🗑️ Prescription for ' + esc(prescription.patientName) + ' deleted successfully', 'success');
    }
    deleteTargetId = null;
}

// ─── Init ──────────────────────────────────────────────────────────────

function initPrescriptionsModule() {
    if (isInitialized) return;
    isInitialized = true;
    loadData();
    
    // Event Listeners
    document.getElementById('addPrescriptionBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModalBtn').addEventListener('click', function() { closeModal('prescriptionModal'); });
    document.getElementById('cancelModalBtn').addEventListener('click', function() { closeModal('prescriptionModal'); });
    document.getElementById('closeViewModalBtn').addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('closeViewFooterBtn').addEventListener('click', function() { closeModal('viewModal'); });
    document.getElementById('closeDeleteModalBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() { closeModal('deleteModal'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);
    document.getElementById('prescriptionForm').addEventListener('submit', savePrescription);
    document.getElementById('refreshBtn').addEventListener('click', function() { refreshUI(); showToast('Refreshed', 'info'); });
    document.getElementById('printViewBtn').addEventListener('click', function() {
        if (viewTargetId) {
            printPrescription(viewTargetId);
        } else {
            showToast('No prescription selected', 'error');
        }
    });
    document.getElementById('editFromViewBtn').addEventListener('click', function() {
        if (viewTargetId) {
            closeModal('viewModal');
            setTimeout(function() { openEditModal(viewTargetId); }, 300);
        }
    });
    
    document.getElementById('resetFilter').addEventListener('click', function() {
        searchTerm = '';
        patientFilter = '';
        doctorFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('patientFilter').value = '';
        document.getElementById('doctorFilter').value = '';
        renderPrescriptions();
        showToast('Filters reset', 'info');
    });
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value;
        renderPrescriptions();
    });
    
    document.getElementById('patientFilter').addEventListener('change', function(e) {
        patientFilter = e.target.value;
        renderPrescriptions();
    });
    
    document.getElementById('doctorFilter').addEventListener('change', function(e) {
        doctorFilter = e.target.value;
        renderPrescriptions();
    });
    
    // Real-time validation
    document.getElementById('patientId').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('patientError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('doctorId').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('doctorError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('prescriptionDate').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('dateError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('diagnosis').addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('diagnosisError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    document.getElementById('prescriptionText').addEventListener('input', function() {
        if (this.value.trim()) {
            document.getElementById('prescriptionError').classList.remove('show');
            this.classList.remove('error');
        }
    });
    
    // Close modals on overlay click
    document.getElementById('prescriptionModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal('prescriptionModal');
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
            closeModal('prescriptionModal');
            closeModal('viewModal');
            closeModal('deleteModal');
        }
    });
    
    console.log('📋 Prescriptions Module initialized successfully');
}

// ─── Auto-init ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkReady = setInterval(function() {
        if (document.getElementById('mainSidebar') && document.getElementById('header-container')) {
            clearInterval(checkReady);
            initPrescriptionsModule();
        }
    }, 100);
    
    setTimeout(function() {
        if (!isInitialized) {
            initPrescriptionsModule();
        }
    }, 2000);
});

// ─── Expose for debugging ─────────────────────────────────────────────

window.prescriptionsModule = {
    prescriptions: prescriptions,
    patients: patients,
    doctors: doctors,
    refreshUI: refreshUI,
    addPrescription: openAddModal,
    viewPrescription: viewPrescription,
    printPrescription: printPrescription
};