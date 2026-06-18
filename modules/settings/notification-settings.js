/**
 * Notification Settings JS - Settings Module
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

// ─── Load Settings ──────────────────────────────────

function loadNotificationSettings() {
    try {
        var settings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
        
        document.getElementById('smtpServer').value = settings.smtpServer || 'smtp.gmail.com';
        document.getElementById('smtpPort').value = settings.smtpPort || '587';
        document.getElementById('senderEmail').value = settings.senderEmail || 'noreply@medflow.com';
        document.getElementById('senderName').value = settings.senderName || 'MedFlow Hospital System';
        document.getElementById('smtpPassword').value = settings.smtpPassword || '';
        document.getElementById('enableEmail').checked = settings.enableEmail || false;
        
        document.getElementById('smsGateway').value = settings.smsGateway || 'Twilio';
        document.getElementById('smsApiKey').value = settings.smsApiKey || '';
        document.getElementById('smsSenderId').value = settings.smsSenderId || 'MEDFLOW';
        document.getElementById('enableSms').checked = settings.enableSms || false;
        
        document.getElementById('notifyAppointment').checked = settings.notifyAppointment !== false;
        document.getElementById('notifyLabResults').checked = settings.notifyLabResults !== false;
        document.getElementById('notifyInvoice').checked = settings.notifyInvoice !== false;
        document.getElementById('notifyPayment').checked = settings.notifyPayment !== false;
        document.getElementById('notifyDischarge').checked = settings.notifyDischarge !== false;
        document.getElementById('notifyLowStock').checked = settings.notifyLowStock !== false;
        document.getElementById('notifyEmergency').checked = settings.notifyEmergency !== false;
        document.getElementById('notifyBirthday').checked = settings.notifyBirthday || false;
    } catch (error) {
        console.error('Error loading notification settings:', error);
        showToast('Error loading settings', 'error');
    }
}

// ─── Validate Email ──────────────────────────────────

function validateEmailSettings() {
    var isValid = true;
    var enableEmail = document.getElementById('enableEmail').checked;
    
    document.getElementById('smtpServerError').classList.remove('show');
    document.getElementById('smtpPortError').classList.remove('show');
    document.getElementById('senderEmailError').classList.remove('show');
    document.getElementById('smtpServer').classList.remove('error');
    document.getElementById('smtpPort').classList.remove('error');
    document.getElementById('senderEmail').classList.remove('error');
    
    if (enableEmail) {
        var smtpServer = document.getElementById('smtpServer').value.trim();
        var smtpPort = document.getElementById('smtpPort').value.trim();
        var senderEmail = document.getElementById('senderEmail').value.trim();
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!smtpServer) {
            document.getElementById('smtpServerError').classList.add('show');
            document.getElementById('smtpServer').classList.add('error');
            isValid = false;
        }
        
        if (!smtpPort) {
            document.getElementById('smtpPortError').classList.add('show');
            document.getElementById('smtpPort').classList.add('error');
            isValid = false;
        }
        
        if (!senderEmail || !emailRegex.test(senderEmail)) {
            document.getElementById('senderEmailError').classList.add('show');
            document.getElementById('senderEmail').classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
}

// ─── Validate SMS ────────────────────────────────────

function validateSmsSettings() {
    var isValid = true;
    var enableSms = document.getElementById('enableSms').checked;
    
    document.getElementById('smsApiKeyError').classList.remove('show');
    document.getElementById('smsApiKey').classList.remove('error');
    
    if (enableSms) {
        var smsApiKey = document.getElementById('smsApiKey').value.trim();
        
        if (!smsApiKey) {
            document.getElementById('smsApiKeyError').classList.add('show');
            document.getElementById('smsApiKey').classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
}

// ─── Save Settings ──────────────────────────────────

function saveNotificationSettings() {
    if (!validateEmailSettings()) {
        showToast('Please check email settings', 'error');
        return;
    }
    
    if (!validateSmsSettings()) {
        showToast('Please check SMS settings', 'error');
        return;
    }
    
    var settings = {
        smtpServer: document.getElementById('smtpServer').value.trim(),
        smtpPort: document.getElementById('smtpPort').value.trim(),
        senderEmail: document.getElementById('senderEmail').value.trim(),
        senderName: document.getElementById('senderName').value.trim(),
        smtpPassword: document.getElementById('smtpPassword').value,
        enableEmail: document.getElementById('enableEmail').checked,
        smsGateway: document.getElementById('smsGateway').value,
        smsApiKey: document.getElementById('smsApiKey').value.trim(),
        smsSenderId: document.getElementById('smsSenderId').value.trim(),
        enableSms: document.getElementById('enableSms').checked,
        notifyAppointment: document.getElementById('notifyAppointment').checked,
        notifyLabResults: document.getElementById('notifyLabResults').checked,
        notifyInvoice: document.getElementById('notifyInvoice').checked,
        notifyPayment: document.getElementById('notifyPayment').checked,
        notifyDischarge: document.getElementById('notifyDischarge').checked,
        notifyLowStock: document.getElementById('notifyLowStock').checked,
        notifyEmergency: document.getElementById('notifyEmergency').checked,
        notifyBirthday: document.getElementById('notifyBirthday').checked,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('notification_settings', JSON.stringify(settings));
    logAudit('UPDATE_NOTIFICATION_SETTINGS', 'Notification preferences updated');
    showToast('✅ Notification settings saved successfully!', 'success');
}

// ─── Reset Settings ──────────────────────────────────

function resetNotificationSettings() {
    if (confirm('Reset all notification settings to default? This will clear all your custom settings.')) {
        localStorage.removeItem('notification_settings');
        loadNotificationSettings();
        showToast('🔄 Settings reset to defaults', 'success');
        logAudit('RESET_NOTIFICATION_SETTINGS', 'Notification settings reset to default');
    }
}

// ─── Test Email ──────────────────────────────────────

function testEmail() {
    var enableEmail = document.getElementById('enableEmail').checked;
    
    if (!enableEmail) {
        showToast('Please enable email notifications first', 'error');
        return;
    }
    
    if (!validateEmailSettings()) {
        showToast('Please configure email settings correctly', 'error');
        return;
    }
    
    showToast('📧 Test email sent! (Demo mode)', 'success');
    logAudit('TEST_EMAIL', 'Test email sent from notification settings');
}

// ─── Test SMS ────────────────────────────────────────

function testSms() {
    var enableSms = document.getElementById('enableSms').checked;
    
    if (!enableSms) {
        showToast('Please enable SMS notifications first', 'error');
        return;
    }
    
    if (!validateSmsSettings()) {
        showToast('Please configure SMS settings correctly', 'error');
        return;
    }
    
    showToast('📱 Test SMS sent! (Demo mode)', 'success');
    logAudit('TEST_SMS', 'Test SMS sent from notification settings');
}

// ─── Real-time Validation ────────────────────────────

function setupValidation() {
    var smtpServer = document.getElementById('smtpServer');
    var smtpPort = document.getElementById('smtpPort');
    var senderEmail = document.getElementById('senderEmail');
    var smsApiKey = document.getElementById('smsApiKey');
    
    if (smtpServer) {
        smtpServer.addEventListener('input', function() {
            if (this.value.trim()) {
                document.getElementById('smtpServerError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (smtpPort) {
        smtpPort.addEventListener('input', function() {
            if (this.value.trim()) {
                document.getElementById('smtpPortError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (senderEmail) {
        senderEmail.addEventListener('input', function() {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value.trim() && emailRegex.test(this.value)) {
                document.getElementById('senderEmailError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (smsApiKey) {
        smsApiKey.addEventListener('input', function() {
            if (this.value.trim()) {
                document.getElementById('smsApiKeyError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
}

// ─── Init ────────────────────────────────────────────

function initNotificationSettingsModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadNotificationSettings();
    setupValidation();
    
    document.getElementById('saveNotifBtn').addEventListener('click', saveNotificationSettings);
    document.getElementById('resetNotifBtn').addEventListener('click', resetNotificationSettings);
    document.getElementById('testEmailBtn').addEventListener('click', testEmail);
    document.getElementById('testSmsBtn').addEventListener('click', testSms);
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkSidebar = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkSidebar);
            setTimeout(initNotificationSettingsModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkSidebar);
        initNotificationSettingsModule();
    }, 3000);
});