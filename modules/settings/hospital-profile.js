/**
 * Hospital Profile JS - Settings Module
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

// ─── Load Profile ──────────────────────────────────────

function loadHospitalProfile() {
    try {
        var profile = JSON.parse(localStorage.getItem('hospital_profile') || '{}');
        
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
        
        document.getElementById('regNumber').value = profile.regNumber || 'MH-HOSP-2024-001';
        document.getElementById('gstNumber').value = profile.gstNumber || '27AAAAA0000A1Z';
        document.getElementById('panNumber').value = profile.panNumber || 'AAAAA1234F';
        document.getElementById('licenseNumber').value = profile.licenseNumber || 'LIC-MH-2024-12345';
        
        document.getElementById('weekdayHours').value = profile.weekdayHours || '9:00 AM - 8:00 PM';
        document.getElementById('saturdayHours').value = profile.saturdayHours || '9:00 AM - 5:00 PM';
        document.getElementById('sundayHours').value = profile.sundayHours || '10:00 AM - 2:00 PM';
        document.getElementById('emergencyHours').value = profile.emergencyHours || '24/7';
        
        var logo = localStorage.getItem('hospital_logo');
        var logoPreview = document.getElementById('logoPreview');
        if (logo && logoPreview) {
            logoPreview.style.backgroundImage = 'url(' + logo + ')';
            logoPreview.style.backgroundSize = 'cover';
            logoPreview.style.backgroundPosition = 'center';
            logoPreview.innerHTML = '';
        } else if (logoPreview) {
            logoPreview.style.backgroundImage = '';
            logoPreview.innerHTML = 'H';
        }
    } catch (error) {
        console.error('Error loading hospital profile:', error);
        showToast('Error loading profile', 'error');
    }
}

// ─── Validate Form ──────────────────────────────────────

function validateHospitalForm() {
    var isValid = true;
    
    var hospitalName = document.getElementById('hospitalName').value.trim();
    var address = document.getElementById('address').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var email = document.getElementById('email').value.trim();
    
    document.getElementById('hospitalNameError').classList.remove('show');
    document.getElementById('addressError').classList.remove('show');
    document.getElementById('phoneError').classList.remove('show');
    document.getElementById('emailError').classList.remove('show');
    document.getElementById('hospitalName').classList.remove('error');
    document.getElementById('address').classList.remove('error');
    document.getElementById('phone').classList.remove('error');
    document.getElementById('email').classList.remove('error');
    
    if (!hospitalName) {
        document.getElementById('hospitalNameError').classList.add('show');
        document.getElementById('hospitalName').classList.add('error');
        isValid = false;
    }
    
    if (!address) {
        document.getElementById('addressError').classList.add('show');
        document.getElementById('address').classList.add('error');
        isValid = false;
    }
    
    if (!phone) {
        document.getElementById('phoneError').classList.add('show');
        document.getElementById('phone').classList.add('error');
        isValid = false;
    }
    
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        document.getElementById('emailError').classList.add('show');
        document.getElementById('email').classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// ─── Save Profile ──────────────────────────────────────

function saveHospitalProfile(e) {
    e.preventDefault();
    
    if (!validateHospitalForm()) {
        showToast('Please fill all required fields correctly', 'error');
        return;
    }
    
    var profile = {
        hospitalName: document.getElementById('hospitalName').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        pincode: document.getElementById('pincode').value.trim(),
        country: document.getElementById('country').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        emergencyHotline: document.getElementById('emergencyHotline').value.trim(),
        website: document.getElementById('website').value.trim(),
        regNumber: document.getElementById('regNumber').value.trim(),
        gstNumber: document.getElementById('gstNumber').value.trim(),
        panNumber: document.getElementById('panNumber').value.trim(),
        licenseNumber: document.getElementById('licenseNumber').value.trim(),
        weekdayHours: document.getElementById('weekdayHours').value.trim(),
        saturdayHours: document.getElementById('saturdayHours').value.trim(),
        sundayHours: document.getElementById('sundayHours').value.trim(),
        emergencyHours: document.getElementById('emergencyHours').value.trim(),
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('hospital_profile', JSON.stringify(profile));
    showToast('✅ Hospital profile saved successfully!', 'success');
    logAudit('UPDATE_HOSPITAL_PROFILE', 'Hospital information updated');
}

// ─── Reset Profile ──────────────────────────────────────

function resetProfile() {
    if (confirm('Reset all profile information to default? This action cannot be undone.')) {
        localStorage.removeItem('hospital_profile');
        localStorage.removeItem('hospital_logo');
        loadHospitalProfile();
        showToast('🔄 Profile reset to default', 'success');
        logAudit('RESET_HOSPITAL_PROFILE', 'Hospital profile reset to default');
    }
}

// ─── Logo Upload ──────────────────────────────────────

function handleLogoUpload(e) {
    var file = e.target.files[0];
    if (file) {
        if (!file.type.match('image.*')) {
            showToast('Please select an image file', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            showToast('File size must be less than 2MB', 'error');
            return;
        }
        
        var reader = new FileReader();
        reader.onload = function(event) {
            var logoPreview = document.getElementById('logoPreview');
            if (logoPreview) {
                logoPreview.style.backgroundImage = 'url(' + event.target.result + ')';
                logoPreview.style.backgroundSize = 'cover';
                logoPreview.style.backgroundPosition = 'center';
                logoPreview.innerHTML = '';
                localStorage.setItem('hospital_logo', event.target.result);
                showToast('✅ Logo uploaded successfully!', 'success');
                logAudit('UPLOAD_LOGO', 'Hospital logo updated');
            }
        };
        reader.readAsDataURL(file);
    }
}

// ─── Real-time Validation ──────────────────────────────

function setupValidation() {
    var nameInput = document.getElementById('hospitalName');
    var addressInput = document.getElementById('address');
    var phoneInput = document.getElementById('phone');
    var emailInput = document.getElementById('email');
    
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            if (this.value.trim()) {
                document.getElementById('hospitalNameError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (addressInput) {
        addressInput.addEventListener('input', function() {
            if (this.value.trim()) {
                document.getElementById('addressError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            if (this.value.trim()) {
                document.getElementById('phoneError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value.trim() && emailRegex.test(this.value)) {
                document.getElementById('emailError').classList.remove('show');
                this.classList.remove('error');
            }
        });
    }
}

// ─── Init ────────────────────────────────────────────

function initHospitalProfileModule() {
    if (isInitialized) return;
    isInitialized = true;
    
    loadHospitalProfile();
    setupValidation();
    
    document.getElementById('profileForm').addEventListener('submit', saveHospitalProfile);
    document.getElementById('resetProfileBtn').addEventListener('click', resetProfile);
    document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
}

// ─── Wait for DOM and Common.js ──────────────────────

document.addEventListener('DOMContentLoaded', function() {
    var checkSidebar = setInterval(function() {
        var sidebar = document.getElementById('mainSidebar');
        if (sidebar) {
            clearInterval(checkSidebar);
            setTimeout(initHospitalProfileModule, 100);
        }
    }, 50);
    setTimeout(function() {
        clearInterval(checkSidebar);
        initHospitalProfileModule();
    }, 3000);
});