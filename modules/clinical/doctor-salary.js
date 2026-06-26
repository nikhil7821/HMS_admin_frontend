/**
 * Doctor Salary Management - Clinical Module
 * Version: 1.0 - Complete Salary Calculation from ALL Modules
 * 
 * Reads data from:
 * - hms_doctors (Base Salary)
 * - hms_consultations (Consultation Fee)
 * - hms_surgeries (Surgery Fee)
 * - hms_emergency_cases (Emergency Fee)
 * - hms_external_visits (External Visit Fee)
 */

let salaryRecords = [];
let doctors = [];
let isInitialized = false;

// ─── Salary Configuration ──────────────────────────────

const SALARY_CONFIG = {
    baseSalary: {
        'Cardiologist': 150000,
        'Neurologist': 140000,
        'Orthopedic': 130000,
        'Pediatrician': 120000,
        'General Physician': 100000,
        'Gynecologist': 135000,
        'Dermatologist': 110000,
        'Ophthalmologist': 115000,
        'Surgeon': 160000,
        'Emergency Medicine': 145000,
        'Radiologist': 125000,
        'Anesthesiologist': 155000,
        'Pathologist': 120000,
        'Psychiatrist': 130000,
        'default': 100000
    },
    perConsultation: 500,
    perOPD: 300,
    perIPD: 600,
    perEmergency: 1000,
    perExternalVisit: 2000,
    travelAllowance: 1000,
    surgeryFees: {
        'minor': 5000,
        'major': 15000,
        'complex': 30000,
        'specialist': 25000
    },
    performanceBonus: {
        enabled: true,
        percentage: 10,
        maxBonus: 50000,
        minConsultations: 30
    },
    deductions: {
        tax: 10,
        insurance: 2000,
        providentFund: 12
    },
    incentives: {
        emergencyIncentive: 500,
        surgeryIncentive: 2000,
        externalVisitIncentive: 1000
    }
};

// ─── Utility Functions ──────────────────────────────

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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

function formatCurrency(amount) {
    return '₹' + Math.round(amount || 0).toLocaleString('en-IN');
}

function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month] || '';
}

function getBaseSalary(specialization) {
    return SALARY_CONFIG.baseSalary[specialization] || SALARY_CONFIG.baseSalary.default;
}

function getSurgeryFee(type) {
    return SALARY_CONFIG.surgeryFees[type] || 5000;
}

// ─── ─── Data Fetch Functions ──────────────────────────────────────────

function fetchDataFromModules() {
    try {
        // 1. Doctors
        doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
        
        // 2. Consultations (from consultation module)
        const consultations = JSON.parse(localStorage.getItem('hms_consultations') || '[]');
        
        // 3. Surgeries (from surgeries module)
        const surgeries = JSON.parse(localStorage.getItem('hms_surgeries') || '[]');
        
        // 4. Emergency Cases (from emergency module)
        const emergencyCases = JSON.parse(localStorage.getItem('hms_emergency_cases') || '[]');
        
        // 5. External Visits (from external-visits module)
        const externalVisits = JSON.parse(localStorage.getItem('hms_external_visits') || '[]');
        
        return { consultations, surgeries, emergencyCases, externalVisits };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { consultations: [], surgeries: [], emergencyCases: [], externalVisits: [] };
    }
}

// ─── ─── Salary Calculation Engine ─────────────────────────────────────

function calculateDoctorSalary(doctorId, month, year) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return null;
    
    const { consultations, surgeries, emergencyCases, externalVisits } = fetchDataFromModules();
    
    // ─── 1. Base Salary ──────────────────────────────────────────────
    const baseSalary = getBaseSalary(doctor.specialization);
    
    // ─── 2. Consultations ────────────────────────────────────────────
    const doctorConsults = consultations.filter(c => 
        c.doctorId === doctorId && 
        new Date(c.date).getMonth() === month && 
        new Date(c.date).getFullYear() === year
    );
    
    const consultationCount = doctorConsults.length;
    const opdCount = doctorConsults.filter(c => c.type === 'opd').length;
    const ipdCount = doctorConsults.filter(c => c.type === 'ipd').length;
    
    const consultationFee = consultationCount * SALARY_CONFIG.perConsultation;
    const opdFee = opdCount * SALARY_CONFIG.perOPD;
    const ipdFee = ipdCount * SALARY_CONFIG.perIPD;
    
    // ─── 3. Surgeries ────────────────────────────────────────────────
    const doctorSurgeries = surgeries.filter(s => 
        s.doctorId === doctorId && 
        new Date(s.date).getMonth() === month && 
        new Date(s.date).getFullYear() === year &&
        s.status === 'completed'
    );
    
    const surgeryCount = doctorSurgeries.length;
    let surgeryFee = 0;
    doctorSurgeries.forEach(s => {
        surgeryFee += getSurgeryFee(s.type);
    });
    
    // ─── 4. Emergency Cases ──────────────────────────────────────────
    const doctorEmergency = emergencyCases.filter(c => 
        c.doctorId === doctorId && 
        new Date(c.date).getMonth() === month && 
        new Date(c.date).getFullYear() === year
    );
    
    const emergencyCount = doctorEmergency.length;
    const emergencyFee = emergencyCount * SALARY_CONFIG.perEmergency;
    
    // ─── 5. External Visits ──────────────────────────────────────────
    const doctorExternal = externalVisits.filter(v => 
        v.doctorId === doctorId && 
        new Date(v.visitDate).getMonth() === month && 
        new Date(v.visitDate).getFullYear() === year
    );
    
    const externalCount = doctorExternal.length;
    const externalFee = externalCount * SALARY_CONFIG.perExternalVisit;
    const travelAllowance = externalCount * SALARY_CONFIG.travelAllowance;
    
    // ─── 6. Incentives ──────────────────────────────────────────────
    const emergencyIncentive = emergencyCount * (SALARY_CONFIG.incentives.emergencyIncentive || 500);
    const surgeryIncentive = surgeryCount * (SALARY_CONFIG.incentives.surgeryIncentive || 2000);
    const externalIncentive = externalCount * (SALARY_CONFIG.incentives.externalVisitIncentive || 1000);
    const totalIncentives = emergencyIncentive + surgeryIncentive + externalIncentive;
    
    // ─── 7. Total Before Bonus ──────────────────────────────────────
    let totalBeforeBonus = baseSalary + consultationFee + opdFee + ipdFee + 
                           surgeryFee + emergencyFee + externalFee + 
                           travelAllowance + totalIncentives;
    
    // ─── 8. Performance Bonus ──────────────────────────────────────
    let performanceBonus = 0;
    if (SALARY_CONFIG.performanceBonus.enabled && consultationCount >= SALARY_CONFIG.performanceBonus.minConsultations) {
        const bonusPercent = SALARY_CONFIG.performanceBonus.percentage || 10;
        performanceBonus = totalBeforeBonus * (bonusPercent / 100);
        const maxBonus = SALARY_CONFIG.performanceBonus.maxBonus || 50000;
        performanceBonus = Math.min(performanceBonus, maxBonus);
    }
    
    // ─── 9. Deductions ──────────────────────────────────────────────
    const grossSalary = totalBeforeBonus + performanceBonus;
    const tax = grossSalary * (SALARY_CONFIG.deductions.tax || 10) / 100;
    const insurance = SALARY_CONFIG.deductions.insurance || 2000;
    const pf = grossSalary * (SALARY_CONFIG.deductions.providentFund || 12) / 100;
    const totalDeductions = tax + insurance + pf;
    
    // ─── 10. Final Salary ──────────────────────────────────────────
    const finalSalary = grossSalary - totalDeductions;
    
    return {
        doctorId: doctorId,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        month: month,
        year: year,
        breakdown: {
            baseSalary: baseSalary,
            consultationFee: consultationFee,
            consultationCount: consultationCount,
            opdFee: opdFee,
            opdCount: opdCount,
            ipdFee: ipdFee,
            ipdCount: ipdCount,
            surgeryFee: surgeryFee,
            surgeryCount: surgeryCount,
            emergencyFee: emergencyFee,
            emergencyCount: emergencyCount,
            externalFee: externalFee,
            externalCount: externalCount,
            travelAllowance: travelAllowance,
            incentives: totalIncentives,
            performanceBonus: performanceBonus,
            tax: tax,
            insurance: insurance,
            providentFund: pf
        },
        totalBeforeBonus: totalBeforeBonus,
        grossSalary: grossSalary,
        totalDeductions: totalDeductions,
        finalSalary: finalSalary,
        generatedAt: new Date().toISOString()
    };
}

// ─── Generate Salary for All Doctors ─────────────────────

function generateMonthlySalary(month, year, doctorId = null) {
    let targetDoctors = doctors;
    if (doctorId) {
        targetDoctors = doctors.filter(d => d.id === doctorId);
    }
    
    const results = [];
    targetDoctors.forEach(doctor => {
        const salary = calculateDoctorSalary(doctor.id, month, year);
        if (salary) {
            const existingIndex = salaryRecords.findIndex(r => 
                r.doctorId === doctor.id && r.month === month && r.year === year
            );
            if (existingIndex !== -1) {
                salaryRecords[existingIndex] = salary;
            } else {
                salaryRecords.push(salary);
            }
            results.push(salary);
        }
    });
    
    saveSalaryRecords();
    refreshUI();
    return results;
}

// ─── ─── Data Management ──────────────────────────────────────────────

function loadSalaryRecords() {
    try {
        const stored = localStorage.getItem('hms_doctor_salaries');
        if (stored) {
            salaryRecords = JSON.parse(stored);
        } else {
            salaryRecords = [];
            saveSalaryRecords();
        }
    } catch (error) {
        console.error('Error loading salary records:', error);
        salaryRecords = [];
    }
}

function saveSalaryRecords() {
    try {
        localStorage.setItem('hms_doctor_salaries', JSON.stringify(salaryRecords));
    } catch (error) {
        console.error('Error saving salary records:', error);
    }
}

// ─── ─── Stats ─────────────────────────────────────────────────────────

function getSalaryStats() {
    const totalRecords = salaryRecords.length;
    const totalSalary = salaryRecords.reduce((sum, r) => sum + r.finalSalary, 0);
    const avgSalary = totalRecords > 0 ? totalSalary / totalRecords : 0;
    const highestSalary = totalRecords > 0 ? Math.max(...salaryRecords.map(r => r.finalSalary)) : 0;
    
    return { totalRecords, totalSalary, avgSalary, highestSalary };
}

function getFilteredRecords(doctorId = null, month = null, year = null) {
    let filtered = [...salaryRecords];
    if (doctorId) filtered = filtered.filter(r => r.doctorId === parseInt(doctorId));
    if (month !== null && month !== -1) filtered = filtered.filter(r => r.month === parseInt(month));
    if (year !== null && year !== -1) filtered = filtered.filter(r => r.year === parseInt(year));
    return filtered;
}

// ─── ─── Render Functions ─────────────────────────────────────────────

function renderStats() {
    const stats = getSalaryStats();
    document.getElementById('totalRecords').textContent = stats.totalRecords;
    document.getElementById('totalSalary').textContent = formatCurrency(stats.totalSalary);
    document.getElementById('avgSalary').textContent = formatCurrency(Math.round(stats.avgSalary));
    document.getElementById('highestSalary').textContent = formatCurrency(stats.highestSalary);
}

function renderTable() {
    const tbody = document.getElementById('salaryTableBody');
    if (!tbody) return;
    
    const doctorFilter = document.getElementById('salaryDoctorFilter')?.value || '';
    const monthFilter = parseInt(document.getElementById('salaryMonthFilter')?.value) || -1;
    const yearFilter = parseInt(document.getElementById('salaryYearFilter')?.value) || -1;
    
    let filtered = getFilteredRecords(doctorFilter, monthFilter, yearFilter);
    
    filtered.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        if (a.month !== b.month) return b.month - a.month;
        return a.doctorName.localeCompare(b.doctorName);
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <p>No salary records found</p>
                    <p style="font-size:0.75rem; margin-top:0.25rem;">Generate salary for a month to get started.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(r => {
        const consultCount = r.breakdown.consultationCount || 0;
        const surgeryCount = r.breakdown.surgeryCount || 0;
        const emergencyCount = r.breakdown.emergencyCount || 0;
        const externalCount = r.breakdown.externalCount || 0;
        
        return `
            <tr class="salary-row">
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">
                    ${esc(r.doctorName)}
                    <div style="font-size:0.6rem; color:var(--color-brown-100);">${r.specialization}</div>
                </td>
                <td>${getMonthName(r.month)} ${r.year}</td>
                <td style="font-size:0.7rem; color:var(--color-brown-300);">
                    <div>🩺 ${consultCount} consults</div>
                    <div>🔬 ${surgeryCount} surgeries</div>
                    <div>🚨 ${emergencyCount} emergencies</div>
                    <div>🚑 ${externalCount} external</div>
                </td>
                <td style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${formatCurrency(r.totalBeforeBonus)}</td>
                <td style="color:var(--color-gold); font-weight:var(--font-weight-medium);">${formatCurrency(r.breakdown.performanceBonus)}</td>
                <td style="font-weight:var(--font-weight-medium); color:var(--color-sage-dark); font-size:1.05rem;">${formatCurrency(r.finalSalary)}</td>
                <td style="text-align:center;">
                    <button class="action-btn view-btn" data-id="${r.doctorId}" data-month="${r.month}" data-year="${r.year}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn print-btn" data-id="${r.doctorId}" data-month="${r.month}" data-year="${r.year}" title="Print Salary Slip">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            viewSalaryDetail(parseInt(this.dataset.id), parseInt(this.dataset.month), parseInt(this.dataset.year));
        });
    });
    
    tbody.querySelectorAll('.print-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            printSalarySlip(parseInt(this.dataset.id), parseInt(this.dataset.month), parseInt(this.dataset.year));
        });
    });
}

function refreshUI() {
    renderStats();
    renderTable();
}

// ─── ─── View Salary Detail ──────────────────────────────────────────

function viewSalaryDetail(doctorId, month, year) {
    const record = salaryRecords.find(r => r.doctorId === doctorId && r.month === month && r.year === year);
    if (!record) {
        if (window.showToast) window.showToast('Salary record not found', 'error');
        return;
    }
    
    const content = document.getElementById('viewSalaryContent');
    content.innerHTML = `
        <div style="display:grid; gap:0.25rem;">
            <div style="text-align:center; padding-bottom:0.75rem; border-bottom:2px solid var(--color-sage);">
                <h3 style="font-weight:var(--font-weight-medium); color:var(--color-brown-700);">${esc(record.doctorName)}</h3>
                <p style="font-size:0.8rem; color:var(--color-brown-100);">${record.specialization}</p>
                <p style="font-size:0.75rem; color:var(--color-brown-300);">${getMonthName(record.month)} ${record.year}</p>
            </div>
            
            <div class="detail-grid">
                <div><p class="detail-label">Base Salary</p><p class="detail-value">${formatCurrency(record.breakdown.baseSalary)}</p></div>
                <div><p class="detail-label">Consultations (${record.breakdown.consultationCount})</p><p class="detail-value">${formatCurrency(record.breakdown.consultationFee)}</p></div>
                <div><p class="detail-label">OPD (${record.breakdown.opdCount})</p><p class="detail-value">${formatCurrency(record.breakdown.opdFee)}</p></div>
                <div><p class="detail-label">IPD (${record.breakdown.ipdCount})</p><p class="detail-value">${formatCurrency(record.breakdown.ipdFee)}</p></div>
                <div><p class="detail-label">Surgeries (${record.breakdown.surgeryCount})</p><p class="detail-value">${formatCurrency(record.breakdown.surgeryFee)}</p></div>
                <div><p class="detail-label">Emergency (${record.breakdown.emergencyCount})</p><p class="detail-value">${formatCurrency(record.breakdown.emergencyFee)}</p></div>
                <div><p class="detail-label">External (${record.breakdown.externalCount})</p><p class="detail-value">${formatCurrency(record.breakdown.externalFee)}</p></div>
                <div><p class="detail-label">Travel Allowance</p><p class="detail-value">${formatCurrency(record.breakdown.travelAllowance)}</p></div>
                <div><p class="detail-label">Incentives</p><p class="detail-value">${formatCurrency(record.breakdown.incentives)}</p></div>
            </div>
            
            <div style="border-top:2px solid var(--border-default); padding-top:0.5rem; margin-top:0.25rem;">
                <div class="detail-row"><span class="detail-label" style="font-weight:var(--font-weight-medium);">Total Before Bonus</span><span class="detail-value" style="font-weight:var(--font-weight-medium);">${formatCurrency(record.totalBeforeBonus)}</span></div>
                <div class="detail-row" style="color:var(--color-gold);"><span class="detail-label" style="font-weight:var(--font-weight-medium);">Performance Bonus</span><span class="detail-value" style="font-weight:var(--font-weight-medium);">${formatCurrency(record.breakdown.performanceBonus)}</span></div>
            </div>
            
            <div style="border-top:2px solid var(--border-default); padding-top:0.5rem;">
                <div class="detail-row" style="color:#ef4444;"><span class="detail-label">Tax</span><span class="detail-value">-${formatCurrency(record.breakdown.tax)}</span></div>
                <div class="detail-row" style="color:#ef4444;"><span class="detail-label">Insurance</span><span class="detail-value">-${formatCurrency(record.breakdown.insurance)}</span></div>
                <div class="detail-row" style="color:#ef4444;"><span class="detail-label">Provident Fund</span><span class="detail-value">-${formatCurrency(record.breakdown.providentFund)}</span></div>
            </div>
            
            <div style="border-top:3px solid var(--color-sage); padding-top:0.75rem; margin-top:0.5rem;">
                <div class="detail-row"><span class="detail-label" style="font-weight:var(--font-weight-medium); font-size:0.9rem;">Gross Salary</span><span class="detail-value" style="font-weight:var(--font-weight-medium); font-size:1rem;">${formatCurrency(record.grossSalary)}</span></div>
                <div class="detail-row"><span class="detail-label" style="font-weight:var(--font-weight-medium); font-size:0.9rem;">Total Deductions</span><span class="detail-value" style="font-weight:var(--font-weight-medium); font-size:1rem; color:#ef4444;">-${formatCurrency(record.totalDeductions)}</span></div>
                <div class="detail-row" style="border-top:2px solid var(--color-sage); padding-top:0.5rem;">
                    <span class="detail-label" style="font-weight:var(--font-weight-medium); font-size:1rem;">FINAL SALARY</span>
                    <span class="detail-value" style="font-weight:var(--font-weight-medium); font-size:1.2rem; color:var(--color-sage-dark);">${formatCurrency(record.finalSalary)}</span>
                </div>
            </div>
            
            <div style="font-size:0.6rem; color:var(--color-brown-100); text-align:center; margin-top:0.5rem;">
                Generated: ${formatDate(record.generatedAt)}
            </div>
        </div>
    `;
    
    document.getElementById('viewSalaryModalTitle').innerHTML = 
        `<i class="fas fa-file-invoice-dollar" style="color:var(--color-sage);"></i> ${esc(record.doctorName)} - ${getMonthName(record.month)} ${record.year}`;
    openModal('viewSalaryModal');
}

// ─── ─── Print Salary Slip ────────────────────────────────────────────

function printSalarySlip(doctorId, month, year) {
    const record = salaryRecords.find(r => r.doctorId === doctorId && r.month === month && r.year === year);
    if (!record) {
        if (window.showToast) window.showToast('Salary record not found', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
        <html>
        <head><title>Salary Slip - ${record.doctorName}</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: auto; }
            .header { text-align: center; border-bottom: 3px solid #4a8c3a; padding-bottom: 20px; margin-bottom: 20px; }
            .hospital-name { font-size: 26px; font-weight: bold; color: #3a7a2a; }
            .slip-title { font-size: 18px; color: #666; margin-top: 5px; }
            .doctor-info { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #f8f8f8; border-radius: 8px; }
            .doctor-info div { font-size: 14px; }
            .doctor-info strong { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; }
            td { padding: 10px 12px; border-bottom: 1px solid #eee; }
            .label { color: #666; }
            .value { text-align: right; font-weight: 500; }
            .total-row { border-top: 2px solid #4a8c3a; font-weight: bold; }
            .bonus-row { color: #d4a853; }
            .deduction-row { color: #ef4444; }
            .final-row { border-top: 3px solid #4a8c3a; font-size: 18px; }
            .final-row td { padding-top: 15px; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 11px; border-top: 1px solid #ddd; padding-top: 20px; }
            @media print { body { padding: 20px; } .no-print { display: none; } }
        </style>
        </head>
        <body>
            <div class="header">
                <div class="hospital-name">🏥 MedFlow Multi-Speciality Hospital</div>
                <div class="slip-title">Salary Slip - ${getMonthName(record.month)} ${record.year}</div>
            </div>
            
            <div class="doctor-info">
                <div><strong>${esc(record.doctorName)}</strong><br>${record.specialization}</div>
                <div><strong>Period:</strong> ${getMonthName(record.month)} ${record.year}</div>
            </div>
            
            <table>
                <tr><td class="label">Base Salary</td><td class="value">${formatCurrency(record.breakdown.baseSalary)}</td></tr>
                <tr><td class="label">Consultations (${record.breakdown.consultationCount})</td><td class="value">${formatCurrency(record.breakdown.consultationFee)}</td></tr>
                <tr><td class="label">OPD (${record.breakdown.opdCount})</td><td class="value">${formatCurrency(record.breakdown.opdFee)}</td></tr>
                <tr><td class="label">IPD (${record.breakdown.ipdCount})</td><td class="value">${formatCurrency(record.breakdown.ipdFee)}</td></tr>
                <tr><td class="label">Surgeries (${record.breakdown.surgeryCount})</td><td class="value">${formatCurrency(record.breakdown.surgeryFee)}</td></tr>
                <tr><td class="label">Emergency (${record.breakdown.emergencyCount})</td><td class="value">${formatCurrency(record.breakdown.emergencyFee)}</td></tr>
                <tr><td class="label">External (${record.breakdown.externalCount})</td><td class="value">${formatCurrency(record.breakdown.externalFee)}</td></tr>
                <tr><td class="label">Travel Allowance</td><td class="value">${formatCurrency(record.breakdown.travelAllowance)}</td></tr>
                <tr><td class="label">Incentives</td><td class="value">${formatCurrency(record.breakdown.incentives)}</td></tr>
                <tr class="total-row"><td>Total Before Bonus</td><td>${formatCurrency(record.totalBeforeBonus)}</td></tr>
                <tr class="bonus-row"><td>Performance Bonus</td><td>${formatCurrency(record.breakdown.performanceBonus)}</td></tr>
                <tr><td style="padding-top:15px;"><strong>Gross Salary</strong></td><td style="padding-top:15px; text-align:right;"><strong>${formatCurrency(record.grossSalary)}</strong></td></tr>
            </table>
            
            <table>
                <tr class="deduction-row"><td>Tax</td><td>-${formatCurrency(record.breakdown.tax)}</td></tr>
                <tr class="deduction-row"><td>Insurance</td><td>-${formatCurrency(record.breakdown.insurance)}</td></tr>
                <tr class="deduction-row"><td>Provident Fund</td><td>-${formatCurrency(record.breakdown.providentFund)}</td></tr>
                <tr><td style="padding-top:15px;"><strong>Total Deductions</strong></td><td style="padding-top:15px; text-align:right;"><strong>-${formatCurrency(record.totalDeductions)}</strong></td></tr>
                <tr class="final-row"><td><strong>NET SALARY</strong></td><td><strong>${formatCurrency(record.finalSalary)}</strong></td></tr>
            </table>
            
            <div class="footer">This is a computer-generated salary slip.<br>Generated: ${formatDate(record.generatedAt)}</div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ─── ─── Modal Functions ──────────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}

function openGenerateSalaryModal() {
    populateMonthYearFilters();
    populateDoctorSelects();
    openModal('generateSalaryModal');
}

function confirmGenerateSalary() {
    const month = parseInt(document.getElementById('generateMonth').value);
    const year = parseInt(document.getElementById('generateYear').value);
    const doctorId = document.getElementById('generateDoctorId')?.value || null;
    
    if (isNaN(month) || isNaN(year)) {
        if (window.showToast) window.showToast('Please select month and year', 'error');
        return;
    }
    
    const existing = salaryRecords.filter(r => r.month === month && r.year === year);
    if (existing.length > 0) {
        if (!confirm(`⚠️ Salary for ${getMonthName(month)} ${year} already exists for ${existing.length} doctors.\nDo you want to regenerate?`)) {
            return;
        }
    }
    
    const results = generateMonthlySalary(month, year, doctorId ? parseInt(doctorId) : null);
    closeModal('generateSalaryModal');
    if (window.showToast) window.showToast(`✅ Salary generated for ${results.length} doctors`, 'success');
}

// ─── ─── Populate Selects ──────────────────────────────────────────────

function populateDoctorSelects() {
    const select = document.getElementById('salaryDoctorFilter');
    const genSelect = document.getElementById('generateDoctorId');
    
    if (select) {
        select.innerHTML = '<option value="">All Doctors</option>' + 
            doctors.map(d => `<option value="${d.id}">${esc(d.name)} (${d.specialization})</option>`).join('');
    }
    
    if (genSelect) {
        genSelect.innerHTML = '<option value="">All Doctors</option>' + 
            doctors.map(d => `<option value="${d.id}">${esc(d.name)} (${d.specialization})</option>`).join('');
    }
}

function populateMonthYearFilters() {
    const monthSelects = ['salaryMonthFilter', 'generateMonth'];
    const yearSelects = ['salaryYearFilter', 'generateYear'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    monthSelects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const val = select.value;
        select.innerHTML = months.map((m, i) => `<option value="${i}">${m}</option>`).join('');
        if (id === 'generateMonth') select.value = currentMonth;
        else if (val) select.value = val;
        else select.value = -1;
    });
    
    yearSelects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const val = select.value;
        select.innerHTML = '';
        for (let i = currentYear; i >= currentYear - 5; i--) {
            select.innerHTML += `<option value="${i}">${i}</option>`;
        }
        if (id === 'generateYear') select.value = currentYear;
        else if (val) select.value = val;
        else select.value = -1;
    });
}

// ─── ─── Init ──────────────────────────────────────────────────────────

function initSalaryModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('🚀 Initializing Doctor Salary Module...');
    
    // Load data
    loadSalaryRecords();
    doctors = JSON.parse(localStorage.getItem('hms_doctors') || '[]');
    
    populateDoctorSelects();
    populateMonthYearFilters();
    refreshUI();
    
    // Event Listeners
    document.getElementById('generateSalaryBtn')?.addEventListener('click', openGenerateSalaryModal);
    document.getElementById('confirmGenerateSalaryBtn')?.addEventListener('click', confirmGenerateSalary);
    document.getElementById('cancelGenerateSalaryBtn')?.addEventListener('click', () => closeModal('generateSalaryModal'));
    document.getElementById('closeGenerateSalaryModalBtn')?.addEventListener('click', () => closeModal('generateSalaryModal'));
    document.getElementById('generateSalaryModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('generateSalaryModal');
    });
    
    document.getElementById('salaryDoctorFilter')?.addEventListener('change', renderTable);
    document.getElementById('salaryMonthFilter')?.addEventListener('change', renderTable);
    document.getElementById('salaryYearFilter')?.addEventListener('change', renderTable);
    
    document.getElementById('resetSalaryFilter')?.addEventListener('click', () => {
        document.getElementById('salaryDoctorFilter').value = '';
        document.getElementById('salaryMonthFilter').value = '-1';
        document.getElementById('salaryYearFilter').value = '-1';
        renderTable();
    });
    
    document.getElementById('closeViewSalaryModalBtn')?.addEventListener('click', () => closeModal('viewSalaryModal'));
    document.getElementById('closeViewSalaryModalFooterBtn')?.addEventListener('click', () => closeModal('viewSalaryModal'));
    document.getElementById('viewSalaryModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal('viewSalaryModal');
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('generateSalaryModal');
            closeModal('viewSalaryModal');
        }
    });
    
    console.log('✅ Doctor Salary Module initialized. Total records:', salaryRecords.length);
}

document.addEventListener('DOMContentLoaded', function() {
    const checkInterval = setInterval(() => {
        if (document.getElementById('mainSidebar')) {
            clearInterval(checkInterval);
            setTimeout(initSalaryModule, 100);
        }
    }, 50);
    setTimeout(() => { clearInterval(checkInterval); initSalaryModule(); }, 3000);
});