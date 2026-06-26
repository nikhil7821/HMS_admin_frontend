/**
 * Patient Profile JS - Clinical Module
 * Version: 3.0 - Added Treatment Timeline & Progress
 */

let patient = null;
let consultations = [];
let isInitialized = false;
let externalConsults = [];

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function calculateAge(dob) {
    if (!dob) return '?';
    try {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch {
        return '?';
    }
}

function getInitials(name) {
    if (!name) return '--';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    } catch {
        return dateStr;
    }
}

// ─── Badge Helpers ──────────────────────────────────

function getCategoryBadge(category) {
    const map = {
        'inpatient': { label: 'IPD', class: 'badge-ipd' },
        'outpatient': { label: 'OPD', class: 'badge-opd' },
        'emergency': { label: '🚨 Emergency', class: 'badge-emergency' },
        'consultation': { label: 'Consult', class: 'badge-consult' },
        'surgery': { label: '🔬 Surgery', class: 'badge-surgery' }
    };
    return map[category] || { label: 'IPD', class: 'badge-ipd' };
}

function getConditionBadge(condition) {
    const map = {
        'critical': { label: 'Critical', class: 'badge-critical' },
        'stable': { label: 'Stable', class: 'badge-stable' },
        'serious': { label: 'Serious', class: 'badge-serious' },
        'recovering': { label: 'Recovering', class: 'badge-recovering' }
    };
    return map[condition] || { label: 'Stable', class: 'badge-stable' };
}

function getStatusBadge(status) {
    const map = {
        'admitted': { label: 'Admitted', class: 'badge-admitted', dot: 'green' },
        'treatment': { label: 'Under Treatment', class: 'badge-treatment', dot: 'blue' },
        'discharged': { label: 'Discharged', class: 'badge-discharged', dot: 'gray' },
        'consultation': { label: 'Consultation', class: 'badge-consultation', dot: 'yellow' }
    };
    return map[status] || { label: 'Admitted', class: 'badge-admitted', dot: 'green' };
}

function getPackageStatusBadge(status) {
    const map = {
        'not_started': { label: 'Not Started', class: 'badge-secondary' },
        'in_progress': { label: 'In Progress', class: 'badge-progress' },
        'completed': { label: 'Completed', class: 'badge-completed' },
        'expired': { label: 'Expired', class: 'badge-error' }
    };
    return map[status] || { label: 'Not Started', class: 'badge-secondary' };
}

function getDoctorName(doctorId) {
    if (!doctorId) return 'Not Assigned';
    try {
        const doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        const doc = doctors.find(d => d.id === doctorId);
        return doc ? doc.name : 'Not Assigned';
    } catch {
        return 'Not Assigned';
    }
}

function getPackageName(packageId) {
    if (!packageId) return 'None';
    try {
        const packages = JSON.parse(localStorage.getItem('medflow_packages') || '[]');
        const pkg = packages.find(p => p.id === packageId);
        return pkg ? pkg.name : 'None';
    } catch {
        return 'None';
    }
}

// ─── Get Patient ID from URL ──────────────────────────

function getPatientIdFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        console.log('🔍 URL param "id":', id);
        console.log('🔍 Full URL:', window.location.href);
        
        if (!id) {
            console.error('❌ No id parameter in URL');
            return null;
        }
        
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            console.error('❌ Invalid id parameter:', id);
            return null;
        }
        
        return parsedId;
    } catch (error) {
        console.error('❌ Error parsing URL:', error);
        return null;
    }
}

// ─── Load Profile ────────────────────────────────────

function loadProfile() {
    try {
        console.log('🚀 Loading patient profile...');
        
        const patientId = getPatientIdFromURL();
        
        if (!patientId) {
            showError('No valid patient ID provided. Please go back and select a patient.');
            return;
        }
        
        console.log('📋 Looking for patient with ID:', patientId);
        
        const patientsData = localStorage.getItem('hms_patients');
        console.log('📦 Patients data exists?', !!patientsData);
        
        if (!patientsData) {
            console.error('❌ No patients data found in localStorage');
            showError('No patient records found. Please add a patient first.');
            return;
        }
        
        let patients = [];
        try {
            patients = JSON.parse(patientsData);
            console.log('📋 Total patients in storage:', patients.length);
        } catch (parseError) {
            console.error('❌ Error parsing patients data:', parseError);
            showError('Error reading patient data. Please try again.');
            return;
        }
        
        patient = patients.find(p => p.id === patientId);
        
        console.log('👤 Found patient:', patient ? patient.fullName : 'NOT FOUND');
        
        if (!patient) {
            console.error('❌ Patient not found with ID:', patientId);
            showError('Patient not found. The patient may have been deleted.');
            return;
        }
        
        externalConsults = patient.externalConsults || [];
        console.log('📋 External consults:', externalConsults.length);
        
        const consultationsData = localStorage.getItem('hms_consultations');
        if (consultationsData) {
            try {
                consultations = JSON.parse(consultationsData);
            } catch (e) {
                consultations = [];
            }
        } else {
            consultations = [];
        }
        
        const patientConsultations = consultations.filter(c => c.patientId === patientId);
        console.log('📋 Patient consultations:', patientConsultations.length);
        
        renderProfile();
        renderMedicalHistory(patientConsultations);
        renderConsultations(patientConsultations);
        renderPrescriptions(patientConsultations);
        renderExternalConsults();
        renderTreatmentTimeline();
        
        console.log('✅ Patient profile loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error loading profile:', error);
        showError('Error loading patient data: ' + error.message);
    }
}

function showError(message) {
    console.error('📢 Showing error:', message);
    
    const nameEl = document.getElementById('profileName');
    if (nameEl) {
        nameEl.textContent = 'Error';
        nameEl.style.color = '#ef4444';
    }
    
    const errorHtml = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle" style="color:#ef4444; font-size:2rem;"></i>
            <p style="color:#ef4444; margin-top:0.75rem;">${esc(message)}</p>
            <a href="patients.html" style="display:inline-block; margin-top:1.25rem; color:var(--color-sage); text-decoration:none; font-weight:var(--font-weight-medium);">
                <i class="fas fa-arrow-left"></i> Back to Patients
            </a>
        </div>
    `;
    
    const sections = ['medicalHistoryList', 'consultationsList', 'prescriptionsList', 'timelineList'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = errorHtml;
    });
    
    const externalContainer = document.getElementById('externalConsultsList');
    if (externalContainer) {
        externalContainer.innerHTML = errorHtml;
    }
    
    const totalEl = document.getElementById('externalTotal');
    if (totalEl) totalEl.textContent = 'Error';
}

// ─── Render Profile ──────────────────────────────────

function renderProfile() {
    if (!patient) return;
    
    console.log('🎨 Rendering profile for:', patient.fullName);
    
    const initialsEl = document.getElementById('profileInitials');
    if (initialsEl) initialsEl.textContent = getInitials(patient.fullName);
    
    const nameEl = document.getElementById('profileName');
    if (nameEl) {
        nameEl.textContent = patient.fullName;
        nameEl.style.color = '';
    }
    
    const idEl = document.getElementById('profileId');
    if (idEl) idEl.textContent = 'P-' + patient.id.toString().padStart(5, '0');
    
    const category = getCategoryBadge(patient.category || 'inpatient');
    const condition = getConditionBadge(patient.condition || 'stable');
    const status = getStatusBadge(patient.status || 'admitted');
    
    const catBadge = document.getElementById('profileCategoryBadge');
    if (catBadge) {
        catBadge.textContent = category.label;
        catBadge.className = `badge-category ${category.class}`;
    }
    
    const condBadge = document.getElementById('profileConditionBadge');
    if (condBadge) {
        condBadge.textContent = condition.label;
        condBadge.className = `badge-condition ${condition.class}`;
    }
    
    const statBadge = document.getElementById('profileStatusBadge');
    if (statBadge) {
        statBadge.innerHTML = `<span class="status-dot ${status.dot}"></span>${status.label}`;
        statBadge.className = `badge-status ${status.class}`;
    }
    
    setElementText('profileGender', patient.gender || 'N/A');
    setElementText('profileDob', formatDate(patient.dob));
    setElementText('profileAge', calculateAge(patient.dob) + ' yrs');
    setElementText('profileBloodGroup', patient.bloodGroup || 'N/A');
    setElementText('profilePhone', patient.phone || 'N/A');
    setElementText('profileEmail', patient.email || 'N/A');
    setElementText('profileAddress', patient.address || 'N/A');
    setElementText('profileRegistered', formatDate(patient.createdAt));
    
    const doctorEl = document.getElementById('profileDoctor');
    if (doctorEl) doctorEl.textContent = getDoctorName(patient.doctorId);
    
    const packageEl = document.getElementById('profilePackage');
    if (packageEl) {
        const packageName = getPackageName(patient.packageId);
        if (packageName !== 'None') {
            packageEl.innerHTML = `<span class="badge-package">${packageName}</span>`;
        } else {
            packageEl.textContent = 'None';
        }
    }
    
    // NEW: Treatment Progress
    const progress = patient.treatmentProgress || 0;
    const progressBar = document.getElementById('profileProgressBar');
    const progressText = document.getElementById('profileProgressText');
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = progress + '%';
    
    const pkgStatus = getPackageStatusBadge(patient.packageStatus || 'not_started');
    const pkgStatusEl = document.getElementById('profilePackageStatus');
    if (pkgStatusEl) {
        pkgStatusEl.textContent = pkgStatus.label;
        pkgStatusEl.className = pkgStatus.class + ' badge-status';
    }
    
    setElementText('profileTreatmentStart', patient.treatmentStartDate ? formatDate(patient.treatmentStartDate) : '-');
    setElementText('profileTreatmentEnd', patient.treatmentEndDate ? formatDate(patient.treatmentEndDate) : '-');
    
    const notesEl = document.getElementById('profileNotes');
    if (notesEl) notesEl.textContent = patient.medicalNotes || 'No medical notes';
}

function setElementText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// ─── Render External Consults ────────────────────────

function renderExternalConsults() {
    const container = document.getElementById('externalConsultsList');
    const totalEl = document.getElementById('externalTotal');
    
    if (!externalConsults || externalConsults.length === 0) {
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding:0.5rem 0; color:var(--color-brown-100); font-size:0.75rem;">
                    No external consultations
                </div>
            `;
        }
        if (totalEl) totalEl.textContent = 'Total: $0';
        return;
    }
    
    const total = externalConsults.reduce((sum, ec) => sum + (ec.amount || 0), 0);
    if (totalEl) totalEl.textContent = `Total: $${total}`;
    
    if (container) {
        container.innerHTML = externalConsults.map(ec => `
            <div class="external-consult-item">
                <div>
                    <div style="font-weight:var(--font-weight-medium); font-size:0.75rem; color:var(--color-brown-700);">
                        ${esc(ec.externalDoctor || 'Unknown')}
                    </div>
                    <div style="font-size:0.65rem; color:var(--color-brown-100);">
                        ${formatDate(ec.consultDate)}
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:var(--font-weight-medium); font-size:0.8rem; color:${ec.paymentStatus === 'paid' ? '#4a8c3a' : '#ef4444'};">
                        $${ec.amount || 0}
                    </div>
                    <div style="font-size:0.6rem; color:var(--color-brown-100);">
                        ${(ec.paymentStatus || 'pending').charAt(0).toUpperCase() + (ec.paymentStatus || 'pending').slice(1)}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ─── Render Medical History ──────────────────────────

function renderMedicalHistory(patientConsultations) {
    const container = document.getElementById('medicalHistoryList');
    if (!container) return;
    
    if (!patientConsultations || patientConsultations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No medical history found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = patientConsultations.map((c, index) => `
        <div class="history-item" data-index="${index}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <span style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.8125rem;">
                    ${formatDate(c.date)}
                </span>
                <span class="visit-badge">
                    <i class="fas fa-notes-medical" style="font-size:0.5rem; margin-right:0.25rem;"></i>
                    Visit
                </span>
            </div>
            <p style="font-size:0.8125rem;">
                <span style="font-weight:var(--font-weight-medium); color:var(--color-brown-300);">Diagnosis:</span>
                <span style="color:var(--color-brown-700);">${esc(c.diagnosis || 'N/A')}</span>
            </p>
            ${c.symptoms ? `<p style="font-size:0.75rem; color:var(--color-brown-300); margin-top:0.25rem;">${esc(c.symptoms)}</p>` : ''}
            <p style="font-size:0.6875rem; color:var(--color-brown-100); margin-top:0.5rem;">
                <i class="fas fa-user-md" style="margin-right:0.25rem;"></i>
                ${esc(c.doctorName || 'Not assigned')}
            </p>
            <button class="view-detail-btn" data-index="${index}" data-type="consultation">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
    `).join('');
    
    container.querySelectorAll('.view-detail-btn[data-type="consultation"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(this.dataset.index);
            const consultation = patientConsultations[index];
            if (consultation) {
                showConsultationDetail(consultation);
            }
        });
    });
}

// ─── Render Consultations ────────────────────────────

function renderConsultations(patientConsultations) {
    const container = document.getElementById('consultationsList');
    if (!container) return;
    
    if (!patientConsultations || patientConsultations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-stethoscope"></i>
                <p>No consultations found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = patientConsultations.map((c, index) => `
        <div class="history-item" data-index="${index}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <span style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.8125rem;">
                    ${formatDate(c.date)}
                </span>
                <span class="visit-badge" style="background-color:#e2f0fb; color:var(--color-info-text);">
                    <i class="fas fa-stethoscope" style="font-size:0.5rem; margin-right:0.25rem;"></i>
                    Consultation
                </span>
            </div>
            <p style="font-size:0.8125rem;">
                <span style="font-weight:var(--font-weight-medium); color:var(--color-brown-300);">Doctor:</span>
                <span style="color:var(--color-brown-700);">${esc(c.doctorName || 'Not assigned')}</span>
            </p>
            <p style="font-size:0.8125rem;">
                <span style="font-weight:var(--font-weight-medium); color:var(--color-brown-300);">Diagnosis:</span>
                <span style="color:var(--color-brown-700);">${esc(c.diagnosis || 'N/A')}</span>
            </p>
            ${c.notes ? `<p style="font-size:0.75rem; color:var(--color-brown-300); margin-top:0.25rem;">📝 ${esc(c.notes)}</p>` : ''}
            <button class="view-detail-btn" data-index="${index}" data-type="consultation">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
    `).join('');
    
    container.querySelectorAll('.view-detail-btn[data-type="consultation"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(this.dataset.index);
            const consultation = patientConsultations[index];
            if (consultation) {
                showConsultationDetail(consultation);
            }
        });
    });
}

// ─── Render Prescriptions ────────────────────────────

function renderPrescriptions(patientConsultations) {
    const container = document.getElementById('prescriptionsList');
    if (!container) return;
    
    const presc = patientConsultations.filter(c => c.prescription);
    
    if (!presc || presc.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-prescription-bottle"></i>
                <p>No prescriptions found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = presc.map((c, index) => `
        <div class="history-item" data-index="${index}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <span style="font-weight:var(--font-weight-medium); color:var(--color-brown-700); font-size:0.8125rem;">
                    ${formatDate(c.date)}
                </span>
                <span class="visit-badge" style="background-color:#fef3dd; color:var(--color-warning-text);">
                    <i class="fas fa-prescription-bottle" style="font-size:0.5rem; margin-right:0.25rem;"></i>
                    Prescription
                </span>
            </div>
            <div class="prescription-box">
                <p>${esc(c.prescription.substring(0, 100))}${c.prescription.length > 100 ? '...' : ''}</p>
            </div>
            ${c.doctorName ? `<p style="font-size:0.6875rem; color:var(--color-brown-100); margin-top:0.5rem;">👨‍⚕️ Prescribed by: ${esc(c.doctorName)}</p>` : ''}
            <button class="view-detail-btn" data-index="${index}" data-type="prescription">
                <i class="fas fa-eye"></i> View Full Prescription
            </button>
        </div>
    `).join('');
    
    container.querySelectorAll('.view-detail-btn[data-type="prescription"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(this.dataset.index);
            const prescription = presc[index];
            if (prescription) {
                showPrescriptionDetail(prescription);
            }
        });
    });
}

// ─── NEW: Render Treatment Timeline ───────────────────

function renderTreatmentTimeline() {
    const container = document.getElementById('timelineList');
    if (!container) return;
    
    const milestones = patient.treatmentMilestones || [];
    
    if (!milestones || milestones.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <p>No treatment milestones recorded</p>
            </div>
        `;
        return;
    }
    
    // Sort by date
    const sorted = [...milestones].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    container.innerHTML = `
        <div class="timeline-container">
            ${sorted.map(m => `
                <div class="timeline-item ${m.status}">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="timeline-milestone">${esc(m.milestone)}</span>
                        <span class="timeline-status ${m.status === 'completed' ? 'badge-completed' : m.status === 'in-progress' ? 'badge-progress' : 'badge-secondary'}">
                            ${m.status === 'completed' ? '✅ Completed' : m.status === 'in-progress' ? '⏳ In Progress' : '⏰ Pending'}
                        </span>
                    </div>
                    <div class="timeline-date">${formatDate(m.date)}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ─── Show Consultation Detail ─────────────────────────

function showConsultationDetail(consultation) {
    console.log('📋 Showing consultation detail:', consultation);
    
    const content = document.getElementById('consultationDetailContent');
    content.innerHTML = `
        <div style="display:grid; gap:0.5rem;">
            <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${formatDate(consultation.date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Doctor</span>
                <span class="detail-value">${esc(consultation.doctorName || 'Not assigned')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Diagnosis</span>
                <span class="detail-value">${esc(consultation.diagnosis || 'N/A')}</span>
            </div>
            ${consultation.symptoms ? `
                <div class="detail-row">
                    <span class="detail-label">Symptoms</span>
                    <span class="detail-value">${esc(consultation.symptoms)}</span>
                </div>
            ` : ''}
            ${consultation.notes ? `
                <div class="detail-row">
                    <span class="detail-label">Notes</span>
                    <span class="detail-value">${esc(consultation.notes)}</span>
                </div>
            ` : ''}
            ${consultation.followUp ? `
                <div class="detail-row">
                    <span class="detail-label">Follow-up</span>
                    <span class="detail-value">${formatDate(consultation.followUp)}</span>
                </div>
            ` : ''}
            ${consultation.prescription ? `
                <div class="detail-row" style="flex-direction:column; align-items:stretch; gap:0.25rem;">
                    <span class="detail-label">Prescription</span>
                    <div class="detail-value prescription-text">${esc(consultation.prescription)}</div>
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('consultationModalTitle').innerHTML = `
        <i class="fas fa-stethoscope" style="color:var(--color-sage);"></i>
        Consultation - ${formatDate(consultation.date)}
    `;
    
    openModal('consultationDetailModal');
}

// ─── Show Prescription Detail ─────────────────────────

function showPrescriptionDetail(prescription) {
    console.log('📋 Showing prescription detail:', prescription);
    
    const content = document.getElementById('prescriptionDetailContent');
    content.innerHTML = `
        <div style="display:grid; gap:0.5rem;">
            <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${formatDate(prescription.date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Prescribed By</span>
                <span class="detail-value">${esc(prescription.doctorName || 'Not assigned')}</span>
            </div>
            ${prescription.diagnosis ? `
                <div class="detail-row">
                    <span class="detail-label">Diagnosis</span>
                    <span class="detail-value">${esc(prescription.diagnosis)}</span>
                </div>
            ` : ''}
            <div class="detail-row" style="flex-direction:column; align-items:stretch; gap:0.25rem;">
                <span class="detail-label">Prescription</span>
                <div class="detail-value prescription-text">${esc(prescription.prescription)}</div>
            </div>
            ${prescription.notes ? `
                <div class="detail-row">
                    <span class="detail-label">Notes</span>
                    <span class="detail-value">${esc(prescription.notes)}</span>
                </div>
            ` : ''}
            ${prescription.followUp ? `
                <div class="detail-row">
                    <span class="detail-label">Follow-up</span>
                    <span class="detail-value">${formatDate(prescription.followUp)}</span>
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('prescriptionModalTitle').innerHTML = `
        <i class="fas fa-prescription-bottle" style="color:var(--color-sage);"></i>
        Prescription - ${formatDate(prescription.date)}
    `;
    
    openModal('prescriptionDetailModal');
}

// ─── Modal Functions ──────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ─── Tabs ─────────────────────────────────────────────

function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = {
        medical: document.getElementById('medicalTab'),
        consultations: document.getElementById('consultationsTab'),
        prescriptions: document.getElementById('prescriptionsTab'),
        timeline: document.getElementById('timelineTab')
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            Object.keys(tabContents).forEach(key => {
                if (tabContents[key]) {
                    if (key === tabName) {
                        tabContents[key].classList.remove('hidden');
                    } else {
                        tabContents[key].classList.add('hidden');
                    }
                }
            });
        });
    });
}

// ─── Init ─────────────────────────────────────────────

function initPatientProfile() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('🚀 Initializing Patient Profile...');
    loadProfile();
    initTabs();
    
    // Modal close handlers
    document.getElementById('closeConsultationModalBtn')?.addEventListener('click', () => closeModal('consultationDetailModal'));
    document.getElementById('closeConsultationModalFooterBtn')?.addEventListener('click', () => closeModal('consultationDetailModal'));
    document.getElementById('consultationDetailModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('consultationDetailModal');
    });
    
    document.getElementById('closePrescriptionModalBtn')?.addEventListener('click', () => closeModal('prescriptionDetailModal'));
    document.getElementById('closePrescriptionModalFooterBtn')?.addEventListener('click', () => closeModal('prescriptionDetailModal'));
    document.getElementById('prescriptionDetailModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('prescriptionDetailModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('consultationDetailModal');
            closeModal('prescriptionDetailModal');
        }
    });
}

// ─── Wait for DOM ──────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Patient Profile DOM loaded');
    setTimeout(initPatientProfile, 500);
});