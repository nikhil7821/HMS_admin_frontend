function loadNotificationSettings() {
    const settings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
    document.getElementById('smtpServer').value = settings.smtpServer || 'smtp.gmail.com';
    document.getElementById('smtpPort').value = settings.smtpPort || '587';
    document.getElementById('senderEmail').value = settings.senderEmail || 'noreply@hospital.com';
    document.getElementById('senderName').value = settings.senderName || 'Hospital Management System';
    document.getElementById('smtpPassword').value = settings.smtpPassword || '';
    document.getElementById('enableEmail').checked = settings.enableEmail || false;
    document.getElementById('smsGateway').value = settings.smsGateway || 'Twilio';
    document.getElementById('smsApiKey').value = settings.smsApiKey || '';
    document.getElementById('smsSenderId').value = settings.smsSenderId || 'HOSPITAL';
    document.getElementById('enableSms').checked = settings.enableSms || false;
    document.getElementById('notifyAppointment').checked = settings.notifyAppointment !== false;
    document.getElementById('notifyLabResults').checked = settings.notifyLabResults !== false;
    document.getElementById('notifyInvoice').checked = settings.notifyInvoice !== false;
    document.getElementById('notifyPayment').checked = settings.notifyPayment !== false;
    document.getElementById('notifyDischarge').checked = settings.notifyDischarge !== false;
    document.getElementById('notifyLowStock').checked = settings.notifyLowStock !== false;
    document.getElementById('notifyEmergency').checked = settings.notifyEmergency !== false;
    document.getElementById('notifyBirthday').checked = settings.notifyBirthday || false;
}

function saveNotificationSettings() {
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
    showToast('Notification settings saved successfully!', 'success');
}

function resetNotificationSettings() {
    if(confirm('Reset all notification settings?')) {
        localStorage.removeItem('notification_settings');
        loadNotificationSettings();
        showToast('Settings reset to defaults', 'info');
    }
}

function testEmail() {
    showToast('Test email sent! (Demo mode)', 'success');
}

function testSms() {
    showToast('Test SMS sent! (Demo mode)', 'success');
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-300`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadNotificationSettings();
    document.getElementById('saveNotifBtn')?.addEventListener('click', saveNotificationSettings);
    document.getElementById('resetNotifBtn')?.addEventListener('click', resetNotificationSettings);
    document.getElementById('testEmailBtn')?.addEventListener('click', testEmail);
    document.getElementById('testSmsBtn')?.addEventListener('click', testSms);
});