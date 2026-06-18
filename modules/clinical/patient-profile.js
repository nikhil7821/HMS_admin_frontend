/**
 * Patient Profile JS - Clinical Module
 * Uses theme.css for styling, clean event handling
 */

let patient = null;
let consultations = [];
let prescriptions = [];
let isInitialized = false;

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

// ─── Load Profile ────────────────────────────────────

function loadProfile() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = parseInt(urlParams.get('id'));
        
        if (!patientId) {
            showError('No patient ID provided');
            return;
        }
        
        const patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        patient = patients.find(p => p.id === patientId);
        
        if (!patient) {
            showError('Patient not found');
            return;
        }
        
        // Load related data
        consultations = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
        const patientConsultations = consultations.filter(c => c.patientId === patientId);
        prescriptions = patientConsultations.filter(c => c.prescription);
        
        // Render profile
        renderProfile();
        renderMedicalHistory(patientConsultations);
        renderConsultations(patientConsultations);
        renderPrescriptions(patientConsultations);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Error loading patient data');
    }
}

function showError(message) {
    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.textContent = 'Error';
    
    const errorHtml = `
        <div class="empty-state">
            <i class="fas fa-user-slash"></i>
            <p>${esc(message)}</p>
            <a href="patients.html" style="display:inline-block; margin-top:1rem; color:var(--color-sage); text-decoration:none;">
                ← Back to Patients
            </a>
        </div>
    `;
    
    document.getElementById('medicalHistoryList').innerHTML = errorHtml;
    document.getElementById('consultationsList').innerHTML = errorHtml;
    document.getElementById('prescriptionsList').innerHTML = errorHtml;
}

// ─── Render Profile ──────────────────────────────────

function renderProfile() {
    if (!patient) return;
    
    // Avatar
    document.getElementById('profileInitials').textContent = getInitials(patient.fullName);
    
    // Name & ID
    document.getElementById('profileName').textContent = patient.fullName;
    document.getElementById('profileId').textContent = 'P-' + patient.id.toString().padStart(5, '0');
    
    // Info fields
    document.getElementById('profileGender').textContent = patient.gender || 'N/A';
    document.getElementById('profileDob').textContent = formatDate(patient.dob);
    document.getElementById('profileAge').textContent = calculateAge(patient.dob) + ' yrs';
    document.getElementById('profileBloodGroup').textContent = patient.bloodGroup || 'N/A';
    document.getElementById('profilePhone').textContent = patient.phone || 'N/A';
    document.getElementById('profileEmail').textContent = patient.email || 'N/A';
    document.getElementById('profileAddress').textContent = patient.address || 'N/A';
    document.getElementById('profileRegistered').textContent = formatDate(patient.createdAt);
}

// ─── Render Medical History ──────────────────────────

function renderMedicalHistory(patientConsultations) {
    const container = document.getElementById('medicalHistoryList');
    
    if (!patientConsultations || patientConsultations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No medical history found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = patientConsultations.map(c => `
        <div class="history-item">
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
        </div>
    `).join('');
}

// ─── Render Consultations ────────────────────────────

function renderConsultations(patientConsultations) {
    const container = document.getElementById('consultationsList');
    
    if (!patientConsultations || patientConsultations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-stethoscope"></i>
                <p>No consultations found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = patientConsultations.map(c => `
        <div class="history-item">
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
        </div>
    `).join('');
}

// ─── Render Prescriptions ────────────────────────────

function renderPrescriptions(patientConsultations) {
    const container = document.getElementById('prescriptionsList');
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
    
    container.innerHTML = presc.map(c => `
        <div class="history-item">
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
                <p>${esc(c.prescription)}</p>
            </div>
            ${c.doctorName ? `<p style="font-size:0.6875rem; color:var(--color-brown-100); margin-top:0.5rem;">👨‍⚕️ Prescribed by: ${esc(c.doctorName)}</p>` : ''}
        </div>
    `).join('');
}

// ─── Tabs ─────────────────────────────────────────────

function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = {
        medical: document.getElementById('medicalTab'),
        consultations: document.getElementById('consultationsTab'),
        prescriptions: document.getElementById('prescriptionsTab')
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active class
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide content
            Object.keys(tabContents).forEach(key => {
                if (key === tabName) {
                    tabContents[key].classList.remove('hidden');
                } else {
                    tabContents[key].classList.add('hidden');
                }
            });
        });
    });
}

// ─── Init ─────────────────────────────────────────────

function initPatientProfile() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadProfile();
    initTabs();
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    // Check if common.js has loaded sidebar
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initPatientProfile, 100);
        }
    }, 50);
    
    // Fallback: if sidebar doesn't load in 3 seconds, init anyway
    setTimeout(() => {
        clearInterval(checkInterval);
        initPatientProfile();
    }, 3000);
});