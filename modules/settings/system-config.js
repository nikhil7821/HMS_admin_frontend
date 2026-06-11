function loadSystemConfig() {
    const config = JSON.parse(localStorage.getItem('system_config') || '{}');
    document.getElementById('systemName').value = config.systemName || 'Hospital Management System';
    document.getElementById('timezone').value = config.timezone || 'UTC+5:30 (IST)';
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
}

function saveSystemConfig() {
    const config = {
        systemName: document.getElementById('systemName').value,
        timezone: document.getElementById('timezone').value,
        dateFormat: document.getElementById('dateFormat').value,
        currency: document.getElementById('currency').value,
        taxRate: document.getElementById('taxRate').value,
        invoicePrefix: document.getElementById('invoicePrefix').value,
        dueDays: document.getElementById('dueDays').value,
        autoInvoice: document.getElementById('autoInvoice').checked,
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
        sessionTimeout: document.getElementById('sessionTimeout').value,
        passwordExpiry: document.getElementById('passwordExpiry').value,
        maxAttempts: document.getElementById('maxAttempts').value,
        backupFrequency: document.getElementById('backupFrequency').value,
        backupTime: document.getElementById('backupTime').value,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem('system_config', JSON.stringify(config));
    showToast('System configuration saved successfully!', 'success');
}

function resetSystemConfig() {
    if(confirm('Reset all system configuration to defaults?')) {
        localStorage.removeItem('system_config');
        loadSystemConfig();
        showToast('Configuration reset to defaults', 'info');
    }
}

function backupNow() {
    const data = {
        patients: localStorage.getItem('hms_patients'),
        doctors: localStorage.getItem('hms_doctors'),
        appointments: localStorage.getItem('hms_appointments'),
        invoices: localStorage.getItem('hms_invoices'),
        pharmacy: localStorage.getItem('pharmacy_medicines'),
        timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hms_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup created successfully!', 'success');
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-300`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadSystemConfig();
    document.getElementById('saveConfigBtn')?.addEventListener('click', saveSystemConfig);
    document.getElementById('resetConfigBtn')?.addEventListener('click', resetSystemConfig);
    document.getElementById('backupNowBtn')?.addEventListener('click', backupNow);
});