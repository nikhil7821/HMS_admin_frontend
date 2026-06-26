/**
 * Doctors Management - Clinical Module
 * Uses theme.css for styling, no inline HTML event handlers
 * 
 * Version: 2.1 - Added External Visits Integration
 */

let doctors = [];
let schedules = [];
let deleteTargetId = null;
let isInitialized = false;
let currentTab = 'all';

// ─── 🔥 AUTO-OPEN FROM DASHBOARD ────────────────────
document.addEventListener('DOMContentLoaded', function() {
    var action = sessionStorage.getItem('dashboard_action');
    if (action === 'openAddDoctor') {
        sessionStorage.removeItem('dashboard_action');
        setTimeout(function() {
            if (typeof openAddModal === 'function') {
                openAddModal();
            } else if (typeof window.openAddModal === 'function') {
                window.openAddModal();
            } else {
                var addBtn = document.getElementById('addDoctorBtn');
                if (addBtn) addBtn.click();
            }
        }, 600);
    }
});

// ─── Data Management ──────────────────────────────

function loadDoctors() {
    try {
        const stored = localStorage.getItem('hms_doctors');
        if (stored) {
            doctors = JSON.parse(stored);
            doctors = doctors.map(d => ({
                ...d,
                doctorType: d.doctorType || 'inhouse',
                availability: d.availability || 'available',
                notes: d.notes || '',
                externalConsults: d.externalConsults || [],
                schedule: d.schedule || []
            }));
            saveDoctors();
        } else {
            doctors = [
                {id: 1, name: 'Dr. Anjali Nair', specialization: 'Cardiologist', qualification: 'MD, DM', fee: 1500, phone: '+91 98765 43210', email: 'anjali.nair@medflow.com', experience: 12, status: 'Active', doctorType: 'inhouse', availability: 'available', notes: 'Senior cardiologist with 12 years of experience', externalConsults: [], schedule: []},
                {id: 2, name: 'Dr. Vikram Singh', specialization: 'Neurologist', qualification: 'MD, DM', fee: 1800, phone: '+91 98765 43211', email: 'vikram.singh@medflow.com', experience: 10, status: 'Active', doctorType: 'inhouse', availability: 'oncall', notes: 'Specializes in stroke and epilepsy', externalConsults: [], schedule: []},
                {id: 3, name: 'Dr. Sneha Joshi', specialization: 'Pediatrician', qualification: 'MD', fee: 1200, phone: '+91 98765 43212', email: 'sneha.joshi@medflow.com', experience: 8, status: 'Active', doctorType: 'inhouse', availability: 'available', notes: 'Child specialist with focus on neonatology', externalConsults: [], schedule: []},
                {id: 4, name: 'Dr. Rajiv Menon', specialization: 'Orthopedic', qualification: 'MS', fee: 1400, phone: '+91 98765 43213', email: 'rajiv.menon@medflow.com', experience: 15, status: 'Active', doctorType: 'inhouse', availability: 'available', notes: 'Joint replacement specialist', externalConsults: [], schedule: []},
                {id: 5, name: 'Dr. Neha Gupta', specialization: 'Dermatologist', qualification: 'MD', fee: 1300, phone: '+91 98765 43214', email: 'neha.gupta@medflow.com', experience: 7, status: 'Inactive', doctorType: 'inhouse', availability: 'unavailable', notes: 'On leave until next month', externalConsults: [], schedule: []},
                {id: 6, name: 'Dr. Meera Desai', specialization: 'Gynecologist', qualification: 'MD, DGO', fee: 1600, phone: '+91 98765 43215', email: 'meera.desai@medflow.com', experience: 11, status: 'Active', doctorType: 'inhouse', availability: 'available', notes: 'Obstetrics and gynecology specialist', externalConsults: [], schedule: []},
                {id: 7, name: 'Dr. Sanjay Kulkarni', specialization: 'General Physician', qualification: 'MD', fee: 1000, phone: '+91 98765 43216', email: 'sanjay.kulkarni@medflow.com', experience: 9, status: 'Active', doctorType: 'inhouse', availability: 'available', notes: 'General medicine and preventive care', externalConsults: [], schedule: []},
                {id: 8, name: 'Dr. Pooja Verma', specialization: 'Ophthalmologist', qualification: 'MS', fee: 1200, phone: '+91 98765 43217', email: 'pooja.verma@medflow.com', experience: 6, status: 'Active', doctorType: 'external', availability: 'oncall', notes: 'External specialist - available for consultations', externalConsults: [], schedule: []}
            ];
            saveDoctors();
        }
        
        loadSchedules();
        refreshUI();
        populateSpecializationFilter();
    } catch (error) {
        console.error('Error loading doctors:', error);
        if (window.showToast) {
            window.showToast('Error loading doctors data', 'error');
        }
    }
}

function saveDoctors() {
    try {
        localStorage.setItem('hms_doctors', JSON.stringify(doctors));
    } catch (error) {
        console.error('Error saving doctors:', error);
    }
}

function loadSchedules() {
    try {
        const stored = localStorage.getItem('hms_doctor_schedules');
        if (stored) {
            schedules = JSON.parse(stored);
        } else {
            schedules = [
                { id: 1, doctorId: 1, date: '2026-06-23', shift: 'Morning', status: 'scheduled' },
                { id: 2, doctorId: 1, date: '2026-06-24', shift: 'Morning', status: 'scheduled' },
                { id: 3, doctorId: 2, date: '2026-06-23', shift: 'Evening', status: 'scheduled' },
                { id: 4, doctorId: 3, date: '2026-06-23', shift: 'Morning', status: 'scheduled' },
                { id: 5, doctorId: 4, date: '2026-06-23', shift: 'Afternoon', status: 'scheduled' }
            ];
            saveSchedules();
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
        schedules = [];
    }
}

function saveSchedules() {
    try {
        localStorage.setItem('hms_doctor_schedules', JSON.stringify(schedules));
    } catch (error) {
        console.error('Error saving schedules:', error);
    }
}

// ─── 🆕 External Visits Helper ──────────────────────────────────

function getExternalVisitsForDoctor(doctorId) {
    try {
        const visits = JSON.parse(localStorage.getItem('hms_external_visits') || '[]');
        return visits.filter(v => v.doctorId === doctorId);
    } catch {
        return [];
    }
}

function getExternalVisitsCount(doctorId) {
    return getExternalVisitsForDoctor(doctorId).length;
}

function getExternalVisitsTotal(doctorId) {
    const visits = getExternalVisitsForDoctor(doctorId);
    return visits.reduce((sum, v) => sum + (v.amount || 0), 0);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getInitials(name) {
    if (!name) return 'D';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getAvailabilityBadge(availability) {
    const map = {
        'available': { label: 'Available', class: 'status-badge-active', dot: 'available' },
        'oncall': { label: 'On Call', class: 'status-badge-oncall', dot: 'oncall' },
        'unavailable': { label: 'Unavailable', class: 'status-badge-unavailable', dot: 'unavailable' }
    };
    return map[availability] || map['available'];
}

function getTypeBadge(type) {
    if (type === 'external') {
        return '<span class="badge-external"><i class="fas fa-external-link-alt"></i> External</span>';
    }
    return '<span style="font-size:0.6rem; color:var(--color-sage);">🏥 In-House</span>';
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const total = doctors.length;
    const specs = [...new Set(doctors.map(d => d.specialization))];
    const available = doctors.filter(d => d.availability === 'available').length;
    const external = doctors.filter(d => d.doctorType === 'external').length;
    
    document.getElementById('totalDoctors').textContent = total;
    document.getElementById('totalSpecs').textContent = specs.length;
    document.getElementById('availableDoctors').textContent = available;
    document.getElementById('externalDoctors').textContent = external;
}

// ─── Filters ──────────────────────────────────────────

function populateSpecializationFilter() {
    const specFilter = document.getElementById('specFilter');
    if (!specFilter) return;
    
    const specs = [...new Set(doctors.map(d => d.specialization))].sort();
    specFilter.innerHTML = '<option value="">All Specializations</option>' + 
        specs.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
}

function getFilteredDoctors() {
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const spec = document.getElementById('specFilter')?.value || '';
    const availability = document.getElementById('availabilityFilter')?.value || '';
    const type = document.getElementById('typeFilter')?.value || '';
    
    let tabFiltered = doctors;
    if (currentTab === 'available') {
        tabFiltered = doctors.filter(d => d.availability === 'available');
    } else if (currentTab === 'inhouse') {
        tabFiltered = doctors.filter(d => d.doctorType === 'inhouse');
    } else if (currentTab === 'external') {
        tabFiltered = doctors.filter(d => d.doctorType === 'external');
    }
    
    return tabFiltered.filter(d => {
        const matchSearch = !search || 
            d.name.toLowerCase().includes(search) || 
            d.specialization.toLowerCase().includes(search);
        const matchSpec = !spec || d.specialization === spec;
        const matchAvailability = !availability || d.availability === availability;
        const matchType = !type || d.doctorType === type;
        return matchSearch && matchSpec && matchAvailability && matchType;
    });
}

// ─── Render ──────────────────────────────────────────

function renderDoctors() {
    const grid = document.getElementById('doctorsGrid');
    if (!grid) return;
    
    const filtered = getFilteredDoctors();
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="doctors-empty">
                <i class="fas fa-user-md"></i>
                <p style="font-size:0.875rem;">No doctors found</p>
                <p style="font-size:0.75rem; margin-top:0.25rem;">Try adjusting your search or add a new doctor.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filtered.map(doc => {
        const avail = getAvailabilityBadge(doc.availability);
        const externalVisits = getExternalVisitsForDoctor(doc.id);
        const visitCount = externalVisits.length;
        
        return `
            <div class="doctor-card" data-id="${doc.id}">
                <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">
                    <div class="doctor-avatar">${getInitials(doc.name)}</div>
                    <div style="flex:1; min-width:0;">
                        <h3 class="doctor-name truncate">${esc(doc.name)}</h3>
                        <p class="doctor-spec truncate">${esc(doc.specialization)}</p>
                    </div>
                    ${getTypeBadge(doc.doctorType)}
                </div>
                
                <div style="display:flex; flex-direction:column; gap:0.375rem; margin-bottom:0.75rem;">
                    <div class="doctor-meta">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${esc(doc.qualification)}</span>
                    </div>
                    <div class="doctor-meta">
                        <i class="fas fa-rupee-sign"></i>
                        <span>₹${doc.fee.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="doctor-meta">
                        <i class="fas fa-briefcase"></i>
                        <span>${doc.experience} yrs exp</span>
                    </div>
                    ${visitCount > 0 ? `
                        <div class="doctor-meta" style="color:var(--color-sage);">
                            <i class="fas fa-ambulance"></i>
                            <span>${visitCount} external visit${visitCount > 1 ? 's' : ''}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.625rem; border-top:1px solid var(--border-default);">
                    <div style="display:flex; align-items:center; gap:0.25rem;">
                        <span class="availability-dot ${avail.dot}"></span>
                        <span class="${avail.class}" style="font-size:0.65rem;">${avail.label}</span>
                    </div>
                    <div style="display:flex; gap:0.375rem;">
                        <button class="view-doctor-btn icon-btn" data-id="${doc.id}" title="View Doctor Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="edit-doctor-btn icon-btn" data-id="${doc.id}" title="Edit Doctor">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="delete-doctor-btn icon-btn delete" data-id="${doc.id}" title="Delete Doctor">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    grid.querySelectorAll('.view-doctor-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            viewDoctor(id);
        });
    });
    grid.querySelectorAll('.edit-doctor-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            openEditModal(id);
        });
    });
    grid.querySelectorAll('.delete-doctor-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            openDeleteModal(id);
        });
    });
}

function renderSchedule() {
    const content = document.getElementById('scheduleContent');
    if (!content) return;
    
    const today = new Date().toISOString().split('T')[0];
    const weekSchedule = schedules.filter(s => {
        const sDate = new Date(s.date);
        const tDate = new Date(today);
        const diffTime = Math.abs(sDate - tDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    });
    
    if (weekSchedule.length === 0) {
        content.innerHTML = `
            <div style="text-align:center; padding:2rem; color:var(--color-brown-100);">
                <i class="fas fa-calendar" style="font-size:1.5rem; display:block; margin-bottom:0.5rem; opacity:0.4;"></i>
                <p>No schedules for the next 7 days</p>
            </div>
        `;
        return;
    }
    
    content.innerHTML = `
        <div style="overflow-x:auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Shift</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${weekSchedule.map(s => {
                        const doctor = doctors.find(d => d.id === s.doctorId);
                        const externalVisits = doctor ? getExternalVisitsForDoctor(doctor.id) : [];
                        return `
                            <tr>
                                <td>${doctor ? esc(doctor.name) : 'Unknown'}</td>
                                <td>${new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                <td><span class="badge badge-info">${s.shift}</span></td>
                                <td><span class="badge badge-success">${s.status}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function refreshUI() {
    updateStats();
    renderDoctors();
    renderSchedule();
}

// ─── View Doctor ──────────────────────────────────────

function viewDoctor(id) {
    const doctor = doctors.find(d => d.id === id);
    if (!doctor) return;
    
    const avail = getAvailabilityBadge(doctor.availability);
    const content = document.getElementById('viewDoctorContent');
    
    const doctorSchedules = schedules.filter(s => s.doctorId === id);
    const upcomingSchedules = doctorSchedules.filter(s => new Date(s.date) >= new Date());
    
    // 🆕 Get external visits
    const externalVisits = getExternalVisitsForDoctor(id);
    const totalAmount = getExternalVisitsTotal(id);
    
    // Build external visits HTML
    let externalVisitsHtml = '';
    if (externalVisits.length > 0) {
        externalVisitsHtml = `
            <div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">
                <strong style="font-size:0.85rem; color:var(--color-brown-700);">
                    <i class="fas fa-ambulance" style="color:var(--color-sage);"></i> External Visits (${externalVisits.length})
                </strong>
                <div style="margin-top:0.5rem;">
                    ${externalVisits.map(v => `
                        <div style="display:flex; justify-content:space-between; padding:0.25rem 0; border-bottom:1px solid #f8f3ee; font-size:0.75rem;">
                            <span>${esc(v.hospitalName)} - ${formatDate(v.visitDate)}</span>
                            <span style="font-weight:var(--font-weight-medium); color:${v.paymentStatus === 'paid' ? '#4a8c3a' : '#ef4444'};">
                                $${v.amount} (${v.paymentStatus})
                            </span>
                        </div>
                    `).join('')}
                    <div style="font-weight:600; margin-top:0.5rem; color:var(--color-brown-700);">
                        Total: $${totalAmount}
                    </div>
                </div>
            </div>
        `;
    } else {
        externalVisitsHtml = `
            <div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">
                <span style="font-size:0.8rem; color:var(--color-brown-100);">
                    <i class="fas fa-ambulance" style="color:var(--color-sage);"></i> No external visits
                </span>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div style="display:grid; gap:0.25rem;">
            <div class="doctor-detail-row">
                <span class="doctor-detail-label">Name</span>
                <span class="doctor-detail-value"><strong>${esc(doctor.name)}</strong></span>
            </div>
            <div class="doctor-detail-row">
                <span class="doctor-detail-label">Specialization</span>
                <span class="doctor-detail-value">${esc(doctor.specialization)}</span>
            </div>
            <div class="doctor-detail-row">
                <span class="doctor-detail-label">Qualification</span>
                <span class="doctor-detail-value">${esc(doctor.qualification)}</span>
            </div>
            <div class="doctor-detail-row">
                <span class="doctor-detail-label">Experience</span>
                <span class="doctor-detail-value">${doctor.experience} years</span>
            </div>
            <div class="doctor-detail-row">
                <span class="doctor-detail-label">Consultation Fee</span>
                <span class="doctor-detail-value">₹${doctor.fee.toLocaleString('en-IN')}</span>
            </div>
            <div class="doctor-detail-row">
                <span class="doctor-detail-label">Phone</span>
                <span class="doctor-detail-value">${esc(doctor.phone)}</span>
            </div>
            <div class="doctor-detail-row">
                <span class="doctor-detail-label">Email</span>
                <span class="doctor-detail-value">${esc(doctor.email)}</span>
            </div>
            <div class="doctor-detail-row">
                <span class="doctor-detail-label">Type</span>
                <span class="doctor-detail-value">${doctor.doctorType === 'external' ? 'External Specialist' : 'In-House'}</span>
            </div>
            <div class="doctor-detail-row">
                <span class="doctor-detail-label">Availability</span>
                <span class="doctor-detail-value">
                    <span class="availability-dot ${avail.dot}"></span>
                    <span class="${avail.class}">${avail.label}</span>
                </span>
            </div>
            <div class="doctor-detail-row">
                <span class="doctor-detail-label">Status</span>
                <span class="doctor-detail-value">${doctor.status}</span>
            </div>
            <div class="doctor-detail-row" style="flex-direction:column; align-items:stretch; gap:0.25rem;">
                <span class="doctor-detail-label">Notes</span>
                <span class="doctor-detail-value" style="font-size:0.8rem; color:var(--color-brown-300);">${esc(doctor.notes) || 'No notes'}</span>
            </div>
            ${upcomingSchedules.length > 0 ? `
                <div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">
                    <strong style="font-size:0.85rem; color:var(--color-brown-700);">Upcoming Schedule</strong>
                    ${upcomingSchedules.map(s => `
                        <div class="schedule-item">
                            <span>${new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>${s.shift} - ${s.status}</span>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-default);">
                    <span style="font-size:0.8rem; color:var(--color-brown-100);">No upcoming schedule</span>
                </div>
            `}
            ${externalVisitsHtml}
        </div>
    `;
    
    document.getElementById('viewModalTitle').innerHTML = `<i class="fas fa-eye" style="color:var(--color-sage);"></i> ${esc(doctor.name)} - Details`;
    openModal('viewDoctorModal');
}

// ─── 🔥 FIXED: Modal Functions - Using 'active' class ───

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

function openAddModal() {
    document.getElementById('doctorForm').reset();
    document.getElementById('doctorId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-md"></i> Add Doctor';
    document.getElementById('doctorType').value = 'inhouse';
    document.getElementById('availability').value = 'available';
    document.getElementById('status').value = 'Active';
    openModal('doctorModal');
}

function openEditModal(id) {
    const doc = doctors.find(d => d.id === id);
    if (!doc) return;
    
    document.getElementById('doctorId').value = doc.id;
    document.getElementById('name').value = doc.name;
    document.getElementById('specialization').value = doc.specialization;
    document.getElementById('qualification').value = doc.qualification;
    document.getElementById('fee').value = doc.fee;
    document.getElementById('phone').value = doc.phone;
    document.getElementById('email').value = doc.email;
    document.getElementById('experience').value = doc.experience;
    document.getElementById('status').value = doc.status;
    document.getElementById('doctorType').value = doc.doctorType || 'inhouse';
    document.getElementById('availability').value = doc.availability || 'available';
    document.getElementById('notes').value = doc.notes || '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-pen"></i> Edit Doctor';
    openModal('doctorModal');
}

function openDeleteModal(id) {
    deleteTargetId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('doctorId').value;
    const data = {
        name: document.getElementById('name').value.trim(),
        specialization: document.getElementById('specialization').value.trim(),
        qualification: document.getElementById('qualification').value.trim(),
        fee: parseInt(document.getElementById('fee').value) || 0,
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        experience: parseInt(document.getElementById('experience').value) || 0,
        status: document.getElementById('status').value,
        doctorType: document.getElementById('doctorType').value,
        availability: document.getElementById('availability').value,
        notes: document.getElementById('notes').value.trim()
    };
    
    if (!data.name || !data.specialization || !data.qualification || !data.fee || !data.phone || !data.email) {
        if (window.showToast) {
            window.showToast('Please fill in all required fields', 'error');
        }
        return;
    }
    
    if (id) {
        const index = doctors.findIndex(d => d.id === parseInt(id));
        if (index !== -1) {
            doctors[index] = { ...doctors[index], ...data };
            if (window.showToast) window.showToast(`✅ ${data.name} updated successfully`, 'success');
        }
    } else {
        const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
        doctors.push({ 
            id: newId, 
            ...data, 
            externalConsults: [], 
            schedule: [],
            createdAt: new Date().toISOString()
        });
        if (window.showToast) window.showToast(`✅ ${data.name} added successfully`, 'success');
    }
    
    saveDoctors();
    refreshUI();
    closeModal('doctorModal');
}

// ─── Delete ──────────────────────────────────────────

function handleConfirmDelete() {
    if (!deleteTargetId) return;
    
    const doc = doctors.find(d => d.id === deleteTargetId);
    doctors = doctors.filter(d => d.id !== deleteTargetId);
    schedules = schedules.filter(s => s.doctorId !== deleteTargetId);
    saveDoctors();
    saveSchedules();
    refreshUI();
    closeModal('deleteModal');
    
    if (doc && window.showToast) {
        window.showToast(`🗑️ ${doc.name} deleted`, 'error');
    }
    deleteTargetId = null;
}

// ─── Init ────────────────────────────────────────────

function initDoctorsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadDoctors();
    
    document.getElementById('addDoctorBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        openAddModal();
    });
    document.getElementById('closeModalBtn')?.addEventListener('click', function() {
        closeModal('doctorModal');
    });
    document.getElementById('cancelModalBtn')?.addEventListener('click', function() {
        closeModal('doctorModal');
    });
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', function() {
        closeModal('deleteModal');
    });
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', function() {
        closeModal('deleteModal');
    });
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('doctorForm')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('searchInput')?.addEventListener('input', renderDoctors);
    document.getElementById('specFilter')?.addEventListener('change', renderDoctors);
    document.getElementById('availabilityFilter')?.addEventListener('change', renderDoctors);
    document.getElementById('typeFilter')?.addEventListener('change', renderDoctors);
    
    document.getElementById('closeViewModalBtn')?.addEventListener('click', function() {
        closeModal('viewDoctorModal');
    });
    document.getElementById('closeViewModalFooterBtn')?.addEventListener('click', function() {
        closeModal('viewDoctorModal');
    });
    document.getElementById('viewDoctorModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewDoctorModal');
    });
    
    document.getElementById('resetFilter')?.addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        document.getElementById('specFilter').value = '';
        document.getElementById('availabilityFilter').value = '';
        document.getElementById('typeFilter').value = '';
        renderDoctors();
    });
    
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;
            
            const scheduleSection = document.getElementById('scheduleSection');
            const grid = document.getElementById('doctorsGrid');
            if (currentTab === 'schedule') {
                scheduleSection.style.display = 'block';
                if (grid) grid.style.display = 'none';
                renderSchedule();
            } else {
                scheduleSection.style.display = 'none';
                if (grid) grid.style.display = 'grid';
                renderDoctors();
            }
        });
    });
    
    document.getElementById('doctorModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('doctorModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('doctorModal');
            closeModal('deleteModal');
            closeModal('viewDoctorModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initDoctorsModule, 100);
        }
    }, 50);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        initDoctorsModule();
    }, 3000);
});

// ─── Expose functions globally ────────────────────

window.openAddModal = openAddModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.viewDoctor = viewDoctor;
window.getExternalVisitsForDoctor = getExternalVisitsForDoctor;
window.getExternalVisitsCount = getExternalVisitsCount;
window.getExternalVisitsTotal = getExternalVisitsTotal;