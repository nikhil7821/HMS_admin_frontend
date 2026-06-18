/**
 * OPD Management JS - Clinical Module
 * Uses theme.css for styling, clean event handling
 */

let opdVisits = [];
let patients = [];
let doctors = [];
let currentDeleteId = null;
let searchTerm = '';
let statusFilter = '';
let isInitialized = false;

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Data Management ──────────────────────────────

function loadData() {
    try {
        patients = JSON.parse(localStorage.getItem('hms_patients') || '[]');
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        
        const stored = localStorage.getItem('hms_opd');
        if (stored) {
            opdVisits = JSON.parse(stored);
        } else {
            // Demo OPD visits data
            opdVisits = [
                {
                    id: 1,
                    token: 1,
                    patientId: 1,
                    patientName: 'Ramesh Gupta',
                    doctorId: 1,
                    doctorName: 'Dr. Anjali Nair',
                    complaint: 'Fever and cough for 3 days',
                    date: new Date().toISOString().split('T')[0],
                    time: '09:30 AM',
                    status: 'Waiting'
                },
                {
                    id: 2,
                    token: 2,
                    patientId: 2,
                    patientName: 'Sneha Patil',
                    doctorId: 2,
                    doctorName: 'Dr. Vikram Singh',
                    complaint: 'Headache and dizziness',
                    date: new Date().toISOString().split('T')[0],
                    time: '10:15 AM',
                    status: 'In Progress'
                },
                {
                    id: 3,
                    token: 3,
                    patientId: 3,
                    patientName: 'Manish Verma',
                    doctorId: 3,
                    doctorName: 'Dr. Sneha Joshi',
                    complaint: 'Back pain since 1 week',
                    date: new Date().toISOString().split('T')[0],
                    time: '11:00 AM',
                    status: 'Completed'
                }
            ];
            saveOpd();
        }
        refreshUI();
    } catch (error) {
        console.error('Error loading OPD data:', error);
        if (window.showToast) {
            window.showToast('Error loading OPD data', 'error');
        }
    }
}

function saveOpd() {
    try {
        localStorage.setItem('hms_opd', JSON.stringify(opdVisits));
    } catch (error) {
        console.error('Error saving OPD data:', error);
    }
}

// ─── Stats ──────────────────────────────────────────

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayOpd = opdVisits.filter(v => v.date === today).length;
    const waiting = opdVisits.filter(v => v.status === 'Waiting').length;
    const completed = opdVisits.filter(v => v.status === 'Completed').length;
    
    document.getElementById('todayOpd').textContent = todayOpd;
    document.getElementById('waitingQueue').textContent = waiting;
    document.getElementById('completedOpd').textContent = completed;
}

// ─── Filter ──────────────────────────────────────────

function getFilteredVisits() {
    return opdVisits.filter(visit => {
        const matchesSearch = searchTerm === '' || 
            visit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visit.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === '' || visit.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
}

// ─── Render ──────────────────────────────────────────

function renderTable() {
    const tbody = document.getElementById('opdTable');
    if (!tbody) return;
    
    const filtered = getFilteredVisits();
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="opd-empty">
                    <i class="fas fa-clinic-medical"></i>
                    <p>No OPD visits found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Create a new visit to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by token number (newest first)
    const sorted = [...filtered].sort((a, b) => b.token - a.token);
    
    tbody.innerHTML = sorted.map(visit => {
        const statusClass = visit.status === 'Waiting' ? 'status-waiting' : 
                           visit.status === 'In Progress' ? 'status-in-progress' : 
                           'status-completed';
        
        return `
            <tr class="opd-row" data-id="${visit.id}">
                <td><span class="token-badge">#${visit.token}</span></td>
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(visit.patientName)}</td>
                <td style="color:var(--color-brown-300);">${esc(visit.doctorName)}</td>
                <td style="color:var(--color-brown-300);">${visit.time}</td>
                <td><span class="${statusClass}">${visit.status}</span></td>
                <td style="text-align:center;">
                    <div style="display:flex; gap:0.25rem; justify-content:center;">
                        ${visit.status !== 'Completed' ? `
                            <button class="action-btn complete-btn" data-id="${visit.id}" title="Mark Complete">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn delete delete-btn" data-id="${visit.id}" title="Delete Visit">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Bind events
    tbody.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', () => completeVisit(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
}

function refreshUI() {
    updateStats();
    renderTable();
}

// ─── Modals ──────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('opacity-100', 'visible');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('opacity-100', 'visible');
}

function openAddModal() {
    const patientSelect = document.getElementById('patientId');
    const doctorSelect = document.getElementById('doctorId');
    
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + 
            patients.map(p => `<option value="${p.id}">${esc(p.fullName)} (${p.phone})</option>`).join('');
    }
    
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${esc(d.name)} (${d.specialization})</option>`).join('');
    }
    
    document.getElementById('opdForm').reset();
    openModal('opdModal');
}

function openDeleteModal(id) {
    currentDeleteId = id;
    openModal('deleteModal');
}

// ─── Form Submit ────────────────────────────────────

function saveVisit(e) {
    e.preventDefault();
    
    const patientId = parseInt(document.getElementById('patientId').value);
    const doctorId = parseInt(document.getElementById('doctorId').value);
    const complaint = document.getElementById('complaint').value.trim();
    
    if (!patientId || !doctorId) {
        if (window.showToast) {
            window.showToast('Please select both patient and doctor', 'error');
        }
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!patient || !doctor) {
        if (window.showToast) {
            window.showToast('Invalid patient or doctor selection', 'error');
        }
        return;
    }
    
    const newId = opdVisits.length > 0 ? Math.max(...opdVisits.map(v => v.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's visits to determine next token
    const todayVisits = opdVisits.filter(v => v.date === today);
    const token = todayVisits.length + 1;
    
    opdVisits.push({
        id: newId,
        token: token,
        patientId: patientId,
        patientName: patient.fullName,
        doctorId: doctorId,
        doctorName: doctor.name,
        complaint: complaint,
        date: today,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Waiting'
    });
    
    saveOpd();
    refreshUI();
    closeModal('opdModal');
    
    if (window.showToast) {
        window.showToast(`✅ OPD visit created! Token #${token} for ${patient.fullName}`, 'success');
    }
}

// ─── Actions ─────────────────────────────────────────

function completeVisit(id) {
    const visit = opdVisits.find(v => v.id === id);
    if (visit && visit.status !== 'Completed') {
        visit.status = 'Completed';
        saveOpd();
        refreshUI();
        if (window.showToast) {
            window.showToast(`✅ Visit completed for ${visit.patientName}`, 'success');
        }
    }
}

function handleConfirmDelete() {
    if (!currentDeleteId) return;
    
    const visit = opdVisits.find(v => v.id === currentDeleteId);
    opdVisits = opdVisits.filter(v => v.id !== currentDeleteId);
    saveOpd();
    refreshUI();
    closeModal('deleteModal');
    
    if (visit && window.showToast) {
        window.showToast(`🗑️ OPD visit removed for ${visit.patientName}`, 'info');
    }
    currentDeleteId = null;
}

// ─── Init ────────────────────────────────────────────

function initOPDModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadData();
    
    // Event Listeners
    document.getElementById('newVisitBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeOpdModalBtn')?.addEventListener('click', () => closeModal('opdModal'));
    document.getElementById('cancelOpdModalBtn')?.addEventListener('click', () => closeModal('opdModal'));
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleConfirmDelete);
    document.getElementById('opdForm')?.addEventListener('submit', saveVisit);
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        searchTerm = '';
        statusFilter = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        renderTable();
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderTable();
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderTable();
    });
    
    // Close modals on overlay click
    document.getElementById('opdModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('opdModal');
    });
    document.getElementById('deleteModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('deleteModal');
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('opdModal');
            closeModal('deleteModal');
        }
    });
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    // Check if common.js has loaded sidebar
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkInterval);
            setTimeout(initOPDModule, 100);
        }
    }, 50);
    
    // Fallback: if sidebar doesn't load in 3 seconds, init anyway
    setTimeout(() => {
        clearInterval(checkInterval);
        initOPDModule();
    }, 3000);
});