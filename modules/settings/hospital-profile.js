function loadHospitalProfile() {
    const profile = JSON.parse(localStorage.getItem('hospital_profile') || '{}');
    
    document.getElementById('hospitalName').value = profile.hospitalName || 'City Hospital & Medical Center';
    document.getElementById('address').value = profile.address || '123 Healthcare Avenue, Medical District';
    document.getElementById('city').value = profile.city || 'New York';
    document.getElementById('state').value = profile.state || 'NY';
    document.getElementById('pincode').value = profile.pincode || '10001';
    document.getElementById('country').value = profile.country || 'USA';
    document.getElementById('phone').value = profile.phone || '+1 (555) 123-4567';
    document.getElementById('email').value = profile.email || 'info@cityhospital.com';
    document.getElementById('emergencyHotline').value = profile.emergencyHotline || '+1 (555) 911-9999';
    document.getElementById('website').value = profile.website || 'www.cityhospital.com';
    document.getElementById('regNumber').value = profile.regNumber || 'HOSP-2024-001';
    document.getElementById('gstNumber').value = profile.gstNumber || '22AAAAA0000A1Z';
    document.getElementById('panNumber').value = profile.panNumber || 'AAAAA1234F';
    document.getElementById('licenseNumber').value = profile.licenseNumber || 'LIC-2024-12345';
    document.getElementById('weekdayHours').value = profile.weekdayHours || '9:00 AM - 8:00 PM';
    document.getElementById('saturdayHours').value = profile.saturdayHours || '9:00 AM - 5:00 PM';
    document.getElementById('sundayHours').value = profile.sundayHours || '10:00 AM - 2:00 PM';
    document.getElementById('emergencyHours').value = profile.emergencyHours || '24/7';
    
    const logo = localStorage.getItem('hospital_logo');
    if(logo) {
        document.getElementById('logoPreview').style.backgroundImage = `url(${logo})`;
        document.getElementById('logoPreview').style.backgroundSize = 'cover';
        document.getElementById('logoPreview').innerHTML = '';
    }
}

function saveHospitalProfile(e) {
    e.preventDefault();
    
    const profile = {
        hospitalName: document.getElementById('hospitalName').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        pincode: document.getElementById('pincode').value,
        country: document.getElementById('country').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
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
}

function resetProfile() {
    if(confirm('Reset all profile information?')) {
        localStorage.removeItem('hospital_profile');
        loadHospitalProfile();
        showToast('Profile reset to default', 'info');
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const logoPreview = document.getElementById('logoPreview');
            logoPreview.style.backgroundImage = `url(${event.target.result})`;
            logoPreview.style.backgroundSize = 'cover';
            logoPreview.style.backgroundPosition = 'center';
            logoPreview.innerHTML = '';
            localStorage.setItem('hospital_logo', event.target.result);
            showToast('Logo uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} transition-all duration-300`;
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadHospitalProfile();
    document.getElementById('profileForm')?.addEventListener('submit', saveHospitalProfile);
    document.getElementById('resetProfileBtn')?.addEventListener('click', resetProfile);
    document.getElementById('logoUpload')?.addEventListener('change', handleLogoUpload);
});