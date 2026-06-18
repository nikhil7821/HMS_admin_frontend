/**
 * System Configuration JS - Settings Module
 * Uses theme.css for styling, clean event handling
 */

var isInitialized = false;

// ─── Toast Notification ──────────────────────────────

function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    var icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    var colors = { success: '#8aae7a', error: '#d8b48c', info: '#a8c49a' };
    
    toast.className = 'toast-notification ' + type;
    toast.innerHTML = '<i class="fas ' + icons[type] + '"></i><span>' + message + '</span>';
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 250);
    }, 3000);
}

// ─── Log Audit ──────────────────────────────────────

function logAudit(action, details) {
    try {
        var auditLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
        var currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        auditLogs.unshift({
            id: Date.now(),
            action: action,
            details: details,
            user: currentUser.email || 'system',
            timestamp: new Date().toLocaleString(),
            ip: '127.0.0.1'
        });
        if (auditLogs.length > 500) auditLogs = auditLogs.slice(0, 500);
        localStorage.setItem('audit_logs', JSON.stringify(auditLogs));
    } catch (error) {
        console.error('Error logging audit:', error);
    }
}

// ─── Load Config ──────────────────────────────────────

function loadSystemConfig() {
    try {
        var config = JSON.parse(localStorage.getItem('system_config') || '{}');
        
        document.getElementById('systemName').value = config.systemName || 'MedFlow Hospital Management System';
        document.getElementById('timezone').value = config.timezone || 'UTC+05:30';
        document.getElementById('dateFormat').value = config.dateFormat || 'DD/MM/YYYY';
        document.getElementById('currency').value = config.currency || '₹ INR';
        
        document.getElementById('taxRate').value = config.taxRate || '5';
        document.getElementById('invoicePrefix').value = config.invoicePrefix || 'INV-';
        document.getElementById('dueDays').value = config.dueDays || '15';
        document.getElementById('autoInvoice').checked = config.autoInvoice || false;
        
        document.getElementById('twoFactorAuth').checked = config.twoFactorAuth || false;
        document.getElementById('sessionTimeout').value = config.sessionTimeout || '30';
        document.getElementById('passwordExpiry').value = config.passwordExpiry || '90';
        document.getElementById('maxAttempts').value = config.maxAttempts || '5';
        
        document.getElementById('backupFrequency').value = config.backupFrequency || 'Weekly';
        document.getElementById('backupTime').value = config.backupTime || '02:00';
    } catch (error) {
        console.error('Error loading system config:', error);
        showToast('Error loading configuration', 'error');
    }
}

// ─── Validate ──────────────────────────────────────────

function validateSystemConfig() {
    var isValid = true;
    
    var systemName = document.getElementById('systemName').value.trim();
    var taxRate = parseFloat(document.getElementById('taxRate').value);
    var dueDays = parseInt(document.getElementById('dueDays').value);
    var sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);
    var passwordExpiry = parseInt(document.getElementById('passwordExpiry').value);
    var maxAttempts = parseInt(document.getElementById('maxAttempts').value);
    
    document.getElementById('systemNameError').classList.remove('show');
    document.getElementById('taxRateError').classList.remove('show');
    document.getElementById('dueDaysError').classList.remove('show');
    document.getElementById('sessionTimeoutError').classList.remove('show');
    document.getElementById('passwordExpiryError').classList.remove('show');
    document.getElementById('maxAttemptsError').classList.remove('show');
    document.getElementById('systemName').classList.remove('error');
    document.getElementById('taxRate').classList.remove('error');
    document.getElementById('dueDays').classList.remove('error');
    document.getElementById('sessionTimeout').classList.remove('error');
    document.getElementById('passwordExpiry').classList.remove('error');
    document.getElementById('maxAttempts').classList.remove('error');
    
    if (!systemName) {
        document.getElementById('systemNameError').classList.add('show');
        document.getElementById('systemName').classList.add('error');
        isValid = false;
    }
    
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        document.getElementById('taxRateError').classList.add('show');
        document.getElementById('taxRate').classList.add('error');
        isValid = false;
    }
    
    if (isNaN(dueDays) || dueDays < 1 || dueDays > 365) {
        document.getElementById('dueDaysError').classList.add('show');
        document.getElementById('dueDays').classList.add('error');
        isValid = false;
    }
    
    if (isNaN(sessionTimeout) || sessionTimeout < 5 || sessionTimeout > 1440) {
        document.getElementById('sessionTimeoutError').classList.add('show');
        document.getElementById('sessionTimeout').classList.add('error');
        isValid = false;
    }
    
    if (isNaN(passwordExpiry) || passwordExpiry < 30 || passwordExpiry > 365) {
        document.getElementById('passwordExpiryError').classList.add('show');
        document.getElementById('passwordExpiry').classList.add('error');
        isValid = false;
    }
    
    if (isNaN(maxAttempts) || maxAttempts < 3 || maxAttempts > 10) {
        document.getElementById('maxAttemptsError').classList.add('show');
        document.getElementById('maxAttempts').classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// ─── Save Config ──────────────────────────────────────

function saveSystemConfig() {
    if (!validateSystemConfig()) {
        showToast('Please correct the highlighted fields', 'error');
        return;
    }
    
    var config = {
        systemName: document.getElementById('systemName').value.trim(),
        timezone: document.getElementById('timezone').value,
        dateFormat: document.getElementById('dateFormat').value,
        currency: document.getElementById('currency').value,
        taxRate: parseFloat(document.getElementById('taxRate').value),
        invoicePrefix: document.getElementById('invoicePrefix').value.trim(),
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
    showToast('✅ System configuration saved successfully!', 'success');
}

// ─── Reset Config ──────────────────────────────────────

function resetSystemConfig() {
    if (confirm('Reset all system configuration to defaults? This will restore all factory settings.')) {
        localStorage.removeItem('system_config');
        loadSystemConfig();
        showToast('🔄 Configuration reset to defaults', 'success');
        logAudit('RESET_SYSTEM_CONFIG', 'System configuration reset to defaults');
    }
}

// ─── Backup Now ──────────────────────────────────────

function backupNow() {
    try {
        var backupData = {
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
        
        var blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'medflow_backup_' + new Date().toISOString().split('T')[0] + '_' + new Date().getTime() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        logAudit('MANUAL_BACKUP', 'Backup created with ' + backupData.stats.totalPatients + ' patients, ' + backupData.stats.totalDoctors + ' doctors');
        showToast('✅ Backup created successfully! File downloaded.', 'success');
    } catch (error) {
        console.error('Error creating backup:', error);
        showToast('Error creating backup', 'error');
    }
}

// ─── Real-time Validation ──────────────────────────────

function setupValidation() {
    var systemName = document.getElementById('systemName');
    var taxRate = document.getElementById('taxRate');
    var dueDays = document.getElementById('dueDays');
    var sessionTimeout = document.getElementById('sessionTimeout');
    var passwordExpiry = document.getElementById('passwordExpiry');
    var maxAttempts = document.getElementById('maxAttempts');
    
    if (systemName) {
        systemName.addEventListener('input', function() {
            if (this.value.trim()) {
                document.getElementById('systemNameError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (taxRate) {
        taxRate.addEventListener('input', function() {
            var val = parseFloat(this.value);
            if (!isNaN(val) && val >= 0 && val <= 100) {
                document.getElementById('taxRateError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (dueDays) {
        dueDays.addEventListener('input', function() {
            var val = parseInt(this.value);
            if (!isNaN(val) && val >= 1 && val <= 365) {
                document.getElementById('dueDaysError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (sessionTimeout) {
        sessionTimeout.addEventListener('input', function() {
            var val = parseInt(this.value);
            if (!isNaN(val) && val >= 5 && val <= 1440) {
                document.getElementById('sessionTimeoutError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (passwordExpiry) {
        passwordExpiry.addEventListener('input', function() {
            var val = parseInt(this.value);
            if (!isNaN(val) && val >= 30 && val <= 365) {
                document.getElementById('passwordExpiryError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (maxAttempts) {
        maxAttempts.addEventListener('input', function() {
            var val = parseInt(this.value);
            if (!isNaN(val) && val >= 3 && val <= 10) {
                document.getElementById('maxAttemptsError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
}

// ─── Init ────────────────────────────────────────────

function initSystemConfigModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadSystemConfig();
    setupValidation();
    
    document.getElementById('saveConfigBtn').addEventListener('click', saveSystemConfig);
    document.getElementById('resetConfigBtn').addEventListener('click', resetSystemConfig);
    document.getElementById('backupNowBtn').addEventListener('click', backupNow);
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkSidebar = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkSidebar);
            setTimeout(initSystemConfigModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkSidebar);
        initSystemConfigModule();
    }, 3000);
});