/**
 * Notification Settings JS - Settings Module
 * Professional UI, Fully Working, Form Validation
 */

function loadNotificationSettings() {
    const settings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
    
    // Email Settings
    document.getElementById('smtpServer').value = settings.smtpServer || 'smtp.gmail.com';
    document.getElementById('smtpPort').value = settings.smtpPort || '587';
    document.getElementById('senderEmail').value = settings.senderEmail || 'noreply@medflow.com';
    document.getElementById('senderName').value = settings.senderName || 'MedFlow Hospital System';
    document.getElementById('smtpPassword').value = settings.smtpPassword || '';
    document.getElementById('enableEmail').checked = settings.enableEmail || false;
    
    // SMS Settings
    document.getElementById('smsGateway').value = settings.smsGateway || 'Twilio';
    document.getElementById('smsApiKey').value = settings.smsApiKey || '';
    document.getElementById('smsSenderId').value = settings.smsSenderId || 'MEDFLOW';
    document.getElementById('enableSms').checked = settings.enableSms || false;
    
    // Notification Events (default to true if not set)
    document.getElementById('notifyAppointment').checked = settings.notifyAppointment !== false;
    document.getElementById('notifyLabResults').checked = settings.notifyLabResults !== false;
    document.getElementById('notifyInvoice').checked = settings.notifyInvoice !== false;
    document.getElementById('notifyPayment').checked = settings.notifyPayment !== false;
    document.getElementById('notifyDischarge').checked = settings.notifyDischarge !== false;
    document.getElementById('notifyLowStock').checked = settings.notifyLowStock !== false;
    document.getElementById('notifyEmergency').checked = settings.notifyEmergency !== false;
    document.getElementById('notifyBirthday').checked = settings.notifyBirthday || false;
}

function validateEmailSettings() {
    let isValid = true;
    const enableEmail = document.getElementById('enableEmail').checked;
    
    if (enableEmail) {
        const smtpServer = document.getElementById('smtpServer').value.trim();
        const smtpPort = document.getElementById('smtpPort').value.trim();
        const senderEmail = document.getElementById('senderEmail').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!smtpServer) {
            document.getElementById('smtpServerError').classList.add('show');
            document.getElementById('smtpServer').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('smtpServerError').classList.remove('show');
            document.getElementById('smtpServer').classList.remove('error');
        }
        
        if (!smtpPort) {
            document.getElementById('smtpPortError').classList.add('show');
            document.getElementById('smtpPort').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('smtpPortError').classList.remove('show');
            document.getElementById('smtpPort').classList.remove('error');
        }
        
        if (!senderEmail || !emailRegex.test(senderEmail)) {
            document.getElementById('senderEmailError').classList.add('show');
            document.getElementById('senderEmail').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('senderEmailError').classList.remove('show');
            document.getElementById('senderEmail').classList.remove('error');
        }
    }
    
    return isValid;
}

function validateSmsSettings() {
    let isValid = true;
    const enableSms = document.getElementById('enableSms').checked;
    
    if (enableSms) {
        const smsApiKey = document.getElementById('smsApiKey').value.trim();
        
        if (!smsApiKey) {
            document.getElementById('smsApiKeyError').classList.add('show');
            document.getElementById('smsApiKey').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('smsApiKeyError').classList.remove('show');
            document.getElementById('smsApiKey').classList.remove('error');
        }
    }
    
    return isValid;
}

function saveNotificationSettings() {
    // Validate settings if enabled
    if (!validateEmailSettings()) {
        showToast('Please check email settings', 'error');
        return;
    }
    
    if (!validateSmsSettings()) {
        showToast('Please check SMS settings', 'error');
        return;
    }
    
    const settings = {
        smtpServer: document.getElementById('smtpServer').value,
        smtpPort: document.getElementById('smtpPort').value,
        senderEmail: document.getElementById('senderEmail').value,
        senderName: document.getElementById('senderName').value,
        smtpPassword: document.getElementById('smtpPassword').value,
        enableEmail: document.getElementById('enableEmail').checked,
        smsGateway: document.getElementById('smsGateway').value,
        smsApiKey: document.getElementById('smsApiKey').value,
        smsSenderId: document.getElementById('smsSenderId').value,
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
    showToast('Notification settings saved successfully!', 'success');
}

function resetNotificationSettings() {
    if(confirm('Reset all notification settings to default? This will clear all your custom settings.')) {
        localStorage.removeItem('notification_settings');
        loadNotificationSettings();
        showToast('Settings reset to defaults', 'success');
        logAudit('RESET_NOTIFICATION_SETTINGS', 'Notification settings reset to default');
    }
}

function testEmail() {
    const enableEmail = document.getElementById('enableEmail').checked;
    
    if (!enableEmail) {
        showToast('Please enable email notifications first', 'error');
        return;
    }
    
    if (!validateEmailSettings()) {
        showToast('Please configure email settings correctly', 'error');
        return;
    }
    
    // Simulate sending test email
    showToast('📧 Test email sent to configured sender! (Demo mode)', 'success');
    logAudit('TEST_EMAIL', 'Test email sent from notification settings');
}

function testSms() {
    const enableSms = document.getElementById('enableSms').checked;
    
    if (!enableSms) {
        showToast('Please enable SMS notifications first', 'error');
        return;
    }
    
    if (!validateSmsSettings()) {
        showToast('Please configure SMS settings correctly', 'error');
        return;
    }
    
    // Simulate sending test SMS
    showToast('📱 Test SMS sent! (Demo mode)', 'success');
    logAudit('TEST_SMS', 'Test SMS sent from notification settings');
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
document.getElementById('smtpServer')?.addEventListener('input', function() {
    if(this.value.trim()) {
        document.getElementById('smtpServerError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('smtpPort')?.addEventListener('input', function() {
    if(this.value.trim()) {
        document.getElementById('smtpPortError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('senderEmail')?.addEventListener('input', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(this.value.trim() && emailRegex.test(this.value)) {
        document.getElementById('senderEmailError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('smsApiKey')?.addEventListener('input', function() {
    if(this.value.trim()) {
        document.getElementById('smsApiKeyError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadNotificationSettings();
    
    document.getElementById('saveNotifBtn')?.addEventListener('click', saveNotificationSettings);
    document.getElementById('resetNotifBtn')?.addEventListener('click', resetNotificationSettings);
    document.getElementById('testEmailBtn')?.addEventListener('click', testEmail);
    document.getElementById('testSmsBtn')?.addEventListener('click', testSms);
});