/**
 * Hospital Profile JS - Settings Module
 * Professional UI, Fully Working, Indian Names, Form Validation
 */

function loadHospitalProfile() {
    const profile = JSON.parse(localStorage.getItem('hospital_profile') || '{}');
    
    // Basic Information
    document.getElementById('hospitalName').value = profile.hospitalName || 'MedFlow Multi-Speciality Hospital';
    document.getElementById('address').value = profile.address || '123 Healthcare Avenue, Andheri East, Mumbai - 400001';
    document.getElementById('city').value = profile.city || 'Mumbai';
    document.getElementById('state').value = profile.state || 'Maharashtra';
    document.getElementById('pincode').value = profile.pincode || '400001';
    document.getElementById('country').value = profile.country || 'India';
    document.getElementById('phone').value = profile.phone || '+91 22 1234 5678';
    document.getElementById('email').value = profile.email || 'info@medflow.com';
    document.getElementById('emergencyHotline').value = profile.emergencyHotline || '+91 22 1234 9999';
    document.getElementById('website').value = profile.website || 'www.medflow.com';
    
    // Tax Information
    document.getElementById('regNumber').value = profile.regNumber || 'MH-HOSP-2024-001';
    document.getElementById('gstNumber').value = profile.gstNumber || '27AAAAA0000A1Z';
    document.getElementById('panNumber').value = profile.panNumber || 'AAAAA1234F';
    document.getElementById('licenseNumber').value = profile.licenseNumber || 'LIC-MH-2024-12345';
    
    // Working Hours
    document.getElementById('weekdayHours').value = profile.weekdayHours || '9:00 AM - 8:00 PM';
    document.getElementById('saturdayHours').value = profile.saturdayHours || '9:00 AM - 5:00 PM';
    document.getElementById('sundayHours').value = profile.sundayHours || '10:00 AM - 2:00 PM';
    document.getElementById('emergencyHours').value = profile.emergencyHours || '24/7';
    
    // Logo
    const logo = localStorage.getItem('hospital_logo');
    const logoPreview = document.getElementById('logoPreview');
    if(logo && logoPreview) {
        logoPreview.style.backgroundImage = `url(${logo})`;
        logoPreview.style.backgroundSize = 'cover';
        logoPreview.style.backgroundPosition = 'center';
        logoPreview.innerHTML = '';
    } else if(logoPreview) {
        logoPreview.style.backgroundImage = '';
        logoPreview.innerHTML = 'H';
    }
}

function validateHospitalForm() {
    let isValid = true;
    
    const hospitalName = document.getElementById('hospitalName').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Hospital Name validation
    if (!hospitalName) {
        document.getElementById('hospitalNameError').classList.add('show');
        document.getElementById('hospitalName').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('hospitalNameError').classList.remove('show');
        document.getElementById('hospitalName').classList.remove('error');
    }
    
    // Address validation
    if (!address) {
        document.getElementById('addressError').classList.add('show');
        document.getElementById('address').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('addressError').classList.remove('show');
        document.getElementById('address').classList.remove('error');
    }
    
    // Phone validation
    if (!phone) {
        document.getElementById('phoneError').classList.add('show');
        document.getElementById('phone').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('phoneError').classList.remove('show');
        document.getElementById('phone').classList.remove('error');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        document.getElementById('emailError').classList.add('show');
        document.getElementById('email').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('emailError').classList.remove('show');
        document.getElementById('email').classList.remove('error');
    }
    
    return isValid;
}

function saveHospitalProfile(e) {
    e.preventDefault();
    
    if (!validateHospitalForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    const profile = {
        hospitalName: document.getElementById('hospitalName').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        pincode: document.getElementById('pincode').value,
        country: document.getElementById('country').value,
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        emergencyHotline: document.getElementById('emergencyHotline').value,
        website: document.getElementById('website').value,
        regNumber: document.getElementById('regNumber').value,
        gstNumber: document.getElementById('gstNumber').value,
        panNumber: document.getElementById('panNumber').value,
        licenseNumber: document.getElementById('licenseNumber').value,
        weekdayHours: document.getElementById('weekdayHours').value,
        saturdayHours: document.getElementById('saturdayHours').value,
        sundayHours: document.getElementById('sundayHours').value,
        emergencyHours: document.getElementById('emergencyHours').value,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('hospital_profile', JSON.stringify(profile));
    showToast('Hospital profile saved successfully!', 'success');
    logAudit('UPDATE_HOSPITAL_PROFILE', 'Hospital information updated');
}

function resetProfile() {
    if(confirm('Reset all profile information to default? This action cannot be undone.')) {
        localStorage.removeItem('hospital_profile');
        localStorage.removeItem('hospital_logo');
        loadHospitalProfile();
        showToast('Profile reset to default', 'success');
        logAudit('RESET_HOSPITAL_PROFILE', 'Hospital profile reset to default');
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if(file) {
        if (!file.type.match('image.*')) {
            showToast('Please select an image file', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            showToast('File size must be less than 2MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const logoPreview = document.getElementById('logoPreview');
            if(logoPreview) {
                logoPreview.style.backgroundImage = `url(${event.target.result})`;
                logoPreview.style.backgroundSize = 'cover';
                logoPreview.style.backgroundPosition = 'center';
                logoPreview.innerHTML = '';
                localStorage.setItem('hospital_logo', event.target.result);
                showToast('Logo uploaded successfully!', 'success');
                logAudit('UPLOAD_LOGO', 'Hospital logo updated');
            }
        };
        reader.readAsDataURL(file);
    }
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

// Real-time validation
document.getElementById('hospitalName')?.addEventListener('input', function() {
    if(this.value.trim()) {
        document.getElementById('hospitalNameError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('address')?.addEventListener('input', function() {
    if(this.value.trim()) {
        document.getElementById('addressError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('phone')?.addEventListener('input', function() {
    if(this.value.trim()) {
        document.getElementById('phoneError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.getElementById('email')?.addEventListener('input', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(this.value.trim() && emailRegex.test(this.value)) {
        document.getElementById('emailError')?.classList.remove('show');
        this.classList.remove('error');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadHospitalProfile();
    
    document.getElementById('profileForm')?.addEventListener('submit', saveHospitalProfile);
    document.getElementById('resetProfileBtn')?.addEventListener('click', resetProfile);
    document.getElementById('logoUpload')?.addEventListener('change', handleLogoUpload);
});