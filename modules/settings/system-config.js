/**
 * System Configuration JS - Settings Module
 * Professional UI, Fully Working, Form Validation
 */

function loadSystemConfig() {
    const config = JSON.parse(localStorage.getItem('system_config') || '{}');
    
    // General Settings
    document.getElementById('systemName').value = config.systemName || 'MedFlow Hospital Management System';
    document.getElementById('timezone').value = config.timezone || 'UTC+05:30 (India Standard Time)';
    document.getElementById('dateFormat').value = config.dateFormat || 'DD/MM/YYYY';
    document.getElementById('currency').value = config.currency || '₹ INR';
    
    // Invoice Settings
    document.getElementById('taxRate').value = config.taxRate || '5';
    document.getElementById('invoicePrefix').value = config.invoicePrefix || 'INV-';
    document.getElementById('dueDays').value = config.dueDays || '15';
    document.getElementById('autoInvoice').checked = config.autoInvoice || false;
    
    // Security Settings
    document.getElementById('twoFactorAuth').checked = config.twoFactorAuth || false;
    document.getElementById('sessionTimeout').value = config.sessionTimeout || '30';
    document.getElementById('passwordExpiry').value = config.passwordExpiry || '90';
    document.getElementById('maxAttempts').value = config.maxAttempts || '5';
    
    // Backup Settings
    document.getElementById('backupFrequency').value = config.backupFrequency || 'Weekly';
    document.getElementById('backupTime').value = config.backupTime || '02:00';
}

function validateSystemConfig() {
    let isValid = true;
    
    // System Name validation
    const systemName = document.getElementById('systemName').value.trim();
    if (!systemName) {
        document.getElementById('systemNameError').classList.add('show');
        document.getElementById('systemName').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('systemNameError').classList.remove('show');
        document.getElementById('systemName').classList.remove('error');
    }
    
    // Tax Rate validation
    const taxRate = parseFloat(document.getElementById('taxRate').value);
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        document.getElementById('taxRateError').classList.add('show');
        document.getElementById('taxRate').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('taxRateError').classList.remove('show');
        document.getElementById('taxRate').classList.remove('error');
    }
    
    // Due Days validation
    const dueDays = parseInt(document.getElementById('dueDays').value);
    if (isNaN(dueDays) || dueDays < 1 || dueDays > 365) {
        document.getElementById('dueDaysError').classList.add('show');
        document.getElementById('dueDays').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('dueDaysError').classList.remove('show');
        document.getElementById('dueDays').classList.remove('error');
    }
    
    // Session Timeout validation
    const sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);
    if (isNaN(sessionTimeout) || sessionTimeout < 5 || sessionTimeout > 1440) {
        document.getElementById('sessionTimeoutError').classList.add('show');
        document.getElementById('sessionTimeout').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('sessionTimeoutError').classList.remove('show');
        document.getElementById('sessionTimeout').classList.remove('error');
    }
    
    // Password Expiry validation
    const passwordExpiry = parseInt(document.getElementById('passwordExpiry').value);
    if (isNaN(passwordExpiry) || passwordExpiry < 30 || passwordExpiry > 365) {
        document.getElementById('passwordExpiryError').classList.add('show');
        document.getElementById('passwordExpiry').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('passwordExpiryError').classList.remove('show');
        document.getElementById('passwordExpiry').classList.remove('error');
    }
    
    // Max Attempts validation
    const maxAttempts = parseInt(document.getElementById('maxAttempts').value);
    if (isNaN(maxAttempts) || maxAttempts < 3 || maxAttempts > 10) {
        document.getElementById('maxAttemptsError').classList.add('show');
        document.getElementById('maxAttempts').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('maxAttemptsError').classList.remove('show');
        document.getElementById('maxAttempts').classList.remove('error');
    }
    
    return isValid;
}

function saveSystemConfig() {
    if (!validateSystemConfig()) {
        showToast('Please correct the highlighted fields', 'error');
        return;
    }
    
    const config = {
        systemName: document.getElementById('systemName').value,
        timezone: document.getElementById('timezone').value,
        dateFormat: document.getElementById('dateFormat').value,
        currency: document.getElementById('currency').value,
        taxRate: parseFloat(document.getElementById('taxRate').value),
        invoicePrefix: document.getElementById('invoicePrefix').value,
        dueDays: parseInt(document.getElementById('dueDays').value),
        autoInvoice: document.getElementById('autoInvoice').checked,
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
        sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
        passwordExpiry: parseInt(document.getElementById('passwordExpiry').value),
        maxAttempts: parseInt(document.getElementById('maxAttempts').value),
        backupFrequency: document.getElementById('backupFrequency').value,
        backupTime: document.getElementById('backupTime').value,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('system_config', JSON.stringify(config));
    logAudit('UPDATE_SYSTEM_CONFIG', 'System configuration updated');
    showToast('System configuration saved successfully!', 'success');
}

function resetSystemConfig() {
    if(confirm('Reset all system configuration to defaults? This will restore all factory settings.')) {
        localStorage.removeItem('system_config');
        loadSystemConfig();
        showToast('Configuration reset to defaults', 'success');
        logAudit('RESET_SYSTEM_CONFIG', 'System configuration reset to defaults');
    }
}

function backupNow() {
    const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
            patients: JSON.parse(localStorage.getItem('hms_patients') || '[]'),
            doctors: JSON.parse(localStorage.getItem('hms_doctors') || '[]'),
            appointments: JSON.parse(localStorage.getItem('hms_appointments') || '[]'),
            invoices: JSON.parse(localStorage.getItem('hms_invoices') || '[]'),
            payments: JSON.parse(localStorage.getItem('hms_payments') || '[]'),
            pharmacy: JSON.parse(localStorage.getItem('pharmacy_medicines') || '[]'),
            staff: JSON.parse(localStorage.getItem('staff_members') || '[]'),
            wards: JSON.parse(localStorage.getItem('wards') || '[]'),
            rooms: JSON.parse(localStorage.getItem('rooms') || '[]'),
            beds: JSON.parse(localStorage.getItem('beds') || '[]')
        },
        stats: {
            totalPatients: JSON.parse(localStorage.getItem('hms_patients') || '[]').length,
            totalDoctors: JSON.parse(localStorage.getItem('hms_doctors') || '[]').length,
            totalInvoices: JSON.parse(localStorage.getItem('hms_invoices') || '[]').length,
            backupDate: new Date().toLocaleString()
        }
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medflow_backup_${new Date().toISOString().split('T')[0]}_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    logAudit('MANUAL_BACKUP', `Backup created with ${backupData.stats.totalPatients} patients, ${backupData.stats.totalDoctors} doctors`);
    showToast('Backup created successfully! File downloaded.', 'success');
}

function logAudit(action, details) {
    let auditLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    auditLogs.unshift({
        id: Date.now(),
        action: action,
        details: details,
        user: currentUser.email || 'system',
        timestamp: new Date().toLocaleString(),
        ip: '127.0.0.1'
    });
    if(auditLogs.length > 500) auditLogs = auditLogs.slice(0, 500);
    localStorage.setItem('audit_logs', JSON.stringify(auditLogs));
}

function showToast(message, type) {
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#a8c49a' };
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300`;
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Real-time validation clearing
document.getElementById('systemName')?.addEventListener('input', function() {
    if(this.value.trim()) {
        document.getElementById('systemNameError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('taxRate')?.addEventListener('input', function() {
    const val = parseFloat(this.value);
    if(!isNaN(val) && val >= 0 && val <= 100) {
        document.getElementById('taxRateError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('dueDays')?.addEventListener('input', function() {
    const val = parseInt(this.value);
    if(!isNaN(val) && val >= 1 && val <= 365) {
        document.getElementById('dueDaysError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('sessionTimeout')?.addEventListener('input', function() {
    const val = parseInt(this.value);
    if(!isNaN(val) && val >= 5 && val <= 1440) {
        document.getElementById('sessionTimeoutError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('passwordExpiry')?.addEventListener('input', function() {
    const val = parseInt(this.value);
    if(!isNaN(val) && val >= 30 && val <= 365) {
        document.getElementById('passwordExpiryError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('maxAttempts')?.addEventListener('input', function() {
    const val = parseInt(this.value);
    if(!isNaN(val) && val >= 3 && val <= 10) {
        document.getElementById('maxAttemptsError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadSystemConfig();
    
    document.getElementById('saveConfigBtn')?.addEventListener('click', saveSystemConfig);
    document.getElementById('resetConfigBtn')?.addEventListener('click', resetSystemConfig);
    document.getElementById('backupNowBtn')?.addEventListener('click', backupNow);
});