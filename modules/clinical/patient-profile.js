/**
 * Patient Profile JS - Clinical Module
 * Professional UI, Fully Working, Indian Names
 */

let patient = null;
let consultations = [];
let prescriptions = [];

function loadProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = parseInt(urlParams.get('id'));
    const patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
    patient = patients.find(p => p.id === patientId);
    consultations = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
    const allPrescriptions = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
    prescriptions = allPrescriptions.filter(c => c.patientId === patientId);
    
    if (patient) {
        // Profile Avatar - First letters of name
        const nameParts = patient.fullName.split(' ');
        let initials = '';
        if (nameParts.length >= 2) {
            initials = nameParts[0].charAt(0) + nameParts[1].charAt(0);
        } else {
            initials = patient.fullName.charAt(0);
        }
        document.getElementById('profileAvatar').innerText = initials.toUpperCase();
        document.getElementById('profileName').innerText = patient.fullName;
        document.getElementById('profileId').innerText = 'P-' + patient.id.toString().padStart(5, '0');
        document.getElementById('profileGender').innerText = patient.gender;
        
        let age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
        document.getElementById('profileAge').innerText = age + ' yrs';
        document.getElementById('profileBloodGroup').innerText = patient.bloodGroup || 'N/A';
        document.getElementById('profilePhone').innerText = patient.phone;
        document.getElementById('profileEmail').innerText = patient.email || 'N/A';
        document.getElementById('profileAddress').innerText = patient.address || 'N/A';
        
        // Medical History (Consultations with diagnosis and symptoms)
        const patientConsultations = consultations.filter(c => c.patientId === patientId);
        const historyDiv = document.getElementById('medicalHistoryList');
        
        if (patientConsultations.length === 0) {
            historyDiv.innerHTML = `
                <div class="text-center py-8 text-[#94a3b8]">
                    <i class="fas fa-folder-open text-3xl mb-2 block"></i>
                    <p class="font-normal">No medical history found</p>
                </div>
            `;
        } else {
            historyDiv.innerHTML = patientConsultations.map(c => `
                <div class="history-item pb-3 mb-3 last:border-b-0">
                    <div class="flex justify-between items-start mb-2">
                        <p class="font-medium text-[#1e293b] text-sm">${c.date || 'Date not specified'}</p>
                        <span class="text-xs text-[#a8c49a] bg-[#f0fdf4] px-2 py-0.5 rounded-full">Visit</span>
                    </div>
                    <p class="text-sm"><span class="font-medium text-[#475569]">Diagnosis:</span> <span class="text-[#334155]">${c.diagnosis || 'N/A'}</span></p>
                    <p class="text-sm text-[#64748b] mt-1">${c.symptoms || 'No symptoms recorded'}</p>
                    <p class="text-xs text-[#94a3b8] mt-2">Doctor: ${c.doctorName || 'Not assigned'}</p>
                </div>
            `).join('');
        }
        
        // Consultations List
        const consultDiv = document.getElementById('consultationsList');
        if (patientConsultations.length === 0) {
            consultDiv.innerHTML = `
                <div class="text-center py-8 text-[#94a3b8]">
                    <i class="fas fa-stethoscope text-3xl mb-2 block"></i>
                    <p class="font-normal">No consultations found</p>
                </div>
            `;
        } else {
            consultDiv.innerHTML = patientConsultations.map(c => `
                <div class="history-item pb-3 mb-3 last:border-b-0">
                    <div class="flex justify-between items-start mb-2">
                        <p class="font-medium text-[#1e293b] text-sm">${c.date || 'Date not specified'}</p>
                        <span class="text-xs text-[#a8c49a] bg-[#f0fdf4] px-2 py-0.5 rounded-full">Consultation</span>
                    </div>
                    <p class="text-sm"><span class="font-medium text-[#475569]">Doctor:</span> <span class="text-[#334155]">${c.doctorName || 'Not assigned'}</span></p>
                    <p class="text-sm"><span class="font-medium text-[#475569]">Diagnosis:</span> <span class="text-[#334155]">${c.diagnosis || 'N/A'}</span></p>
                    ${c.notes ? `<p class="text-sm text-[#64748b] mt-1">Notes: ${c.notes}</p>` : ''}
                </div>
            `).join('');
        }
        
        // Prescriptions List
        const presDiv = document.getElementById('prescriptionsList');
        if (prescriptions.length === 0) {
            presDiv.innerHTML = `
                <div class="text-center py-8 text-[#94a3b8]">
                    <i class="fas fa-prescription-bottle text-3xl mb-2 block"></i>
                    <p class="font-normal">No prescriptions found</p>
                </div>
            `;
        } else {
            presDiv.innerHTML = prescriptions.map(p => `
                <div class="history-item pb-3 mb-3 last:border-b-0">
                    <div class="flex justify-between items-start mb-2">
                        <p class="font-medium text-[#1e293b] text-sm">${p.date || 'Date not specified'}</p>
                        <span class="text-xs text-[#a8c49a] bg-[#f0fdf4] px-2 py-0.5 rounded-full">Prescription</span>
                    </div>
                    <div class="bg-[#f8fafc] rounded-lg p-3 mt-2">
                        <p class="text-sm whitespace-pre-wrap text-[#334155]">${p.prescription || 'No prescription details'}</p>
                    </div>
                    ${p.doctorName ? `<p class="text-xs text-[#94a3b8] mt-2">Prescribed by: ${p.doctorName}</p>` : ''}
                </div>
            `).join('');
        }
    } else {
        // Patient not found
        const profileName = document.getElementById('profileName');
        if (profileName) profileName.innerText = 'Patient Not Found';
        
        const errorHtml = `
            <div class="text-center py-12 text-[#94a3b8]">
                <i class="fas fa-user-slash text-4xl mb-3 block"></i>
                <p class="font-normal">Patient not found. Please select a valid patient.</p>
                <a href="patients.html" class="inline-block mt-4 text-[#a8c49a] hover:underline">← Back to Patients</a>
            </div>
        `;
        document.getElementById('medicalHistoryList').innerHTML = errorHtml;
        document.getElementById('consultationsList').innerHTML = errorHtml;
        document.getElementById('prescriptionsList').innerHTML = errorHtml;
    }
}

// Tab switching functionality
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const medicalTab = document.getElementById('medicalTab');
    const consultationsTab = document.getElementById('consultationsTab');
    const prescriptionsTab = document.getElementById('prescriptionsTab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Update active class on tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show/hide tab content
            medicalTab.classList.add('hidden');
            consultationsTab.classList.add('hidden');
            prescriptionsTab.classList.add('hidden');
            
            if (tabName === 'medical') {
                medicalTab.classList.remove('hidden');
            } else if (tabName === 'consultations') {
                consultationsTab.classList.remove('hidden');
            } else if (tabName === 'prescriptions') {
                prescriptionsTab.classList.remove('hidden');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    initTabs();
});