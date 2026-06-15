/**
 * MEDFLOW HOSPITAL MANAGEMENT SYSTEM
 * COMPLETE FORM VALIDATION LIBRARY
 * Works across ALL pages - Patients, Doctors, Departments, Appointments, Billing
 * Version: 1.0
 */

// ========================
// VALIDATION RULES
// ========================
const ValidationRules = {
    // Name fields (Patient Name, Doctor Name, Department Name, etc.)
    name: {
        pattern: /^[a-zA-Z\s\.\-\']{2,100}$/,
        message: 'Name must contain only letters, spaces, dots, hyphens (2-100 characters)',
        maxLength: 100,
        minLength: 2
    },
    
    // Full Name (with spaces allowed)
    fullName: {
        pattern: /^[a-zA-Z\s\.\-\']{2,150}$/,
        message: 'Please enter a valid full name (2-150 characters, letters only)',
        maxLength: 150,
        minLength: 2
    },
    
    // Email
    email: {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: 'Please enter a valid email address (e.g., name@example.com)',
        maxLength: 100
    },
    
    // Phone/ Mobile (Indian format)
    phone: {
        pattern: /^[6-9]\d{9}$/,
        message: 'Please enter a valid 10-digit mobile number (starting with 6-9)',
        maxLength: 10,
        minLength: 10
    },
    
    // Landline/Alternate Phone
    alternatePhone: {
        pattern: /^\d{10,12}$/,
        message: 'Please enter a valid phone number (10-12 digits)',
        maxLength: 12,
        minLength: 10
    },
    
    // Age
    age: {
        pattern: /^(0?[1-9]|[1-9][0-9]|100)$/,
        message: 'Please enter a valid age (1-100 years)',
        max: 100,
        min: 1
    },
    
    // Date of Birth
    dob: {
        validate: function(value) {
            const date = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();
            return age >= 0 && age <= 120;
        },
        message: 'Please enter a valid date of birth (Age should be between 0-120 years)'
    },
    
    // Department Code
    deptCode: {
        pattern: /^[A-Z]{2,10}$/,
        message: 'Department code must contain only uppercase letters (2-10 characters)',
        maxLength: 10,
        minLength: 2
    },
    
    // Department Name
    deptName: {
        pattern: /^[a-zA-Z\s\-]{2,50}$/,
        message: 'Department name must contain only letters, spaces (2-50 characters)',
        maxLength: 50,
        minLength: 2
    },
    
    // Blood Group
    bloodGroup: {
        pattern: /^(A|B|AB|O)[+-]$/,
        message: 'Please select a valid blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)'
    },
    
    // Gender
    gender: {
        pattern: /^(Male|Female|Other)$/,
        message: 'Please select a valid gender'
    },
    
    // Address
    address: {
        minLength: 5,
        maxLength: 500,
        message: 'Address must be between 5-500 characters',
        maxLength: 500,
        minLength: 5
    },
    
    // Pincode/Zipcode
    pincode: {
        pattern: /^[1-9][0-9]{5}$/,
        message: 'Please enter a valid 6-digit pincode',
        maxLength: 6,
        minLength: 6
    },
    
    // Amount/Price (for billing)
    amount: {
        pattern: /^\d+(\.\d{1,2})?$/,
        message: 'Please enter a valid amount (e.g., 100 or 100.50)',
        max: 9999999.99,
        min: 0
    },
    
    // Quantity (for pharmacy)
    quantity: {
        pattern: /^\d+$/,
        message: 'Please enter a valid quantity (positive whole number)',
        max: 10000,
        min: 1
    },
    
    // Bed Number
    bedNumber: {
        pattern: /^[A-Za-z0-9\-]{2,20}$/,
        message: 'Please enter a valid bed number (2-20 characters, letters, numbers, hyphens)',
        maxLength: 20,
        minLength: 2
    },
    
    // Room Number
    roomNumber: {
        pattern: /^[A-Za-z0-9\-]{2,15}$/,
        message: 'Please enter a valid room number (2-15 characters)',
        maxLength: 15,
        minLength: 2
    },
    
    // Doctor ID / Employee ID
    employeeId: {
        pattern: /^[A-Z0-9]{4,15}$/,
        message: 'Employee ID must contain uppercase letters and numbers (4-15 characters)',
        maxLength: 15,
        minLength: 4
    },
    
    // Prescription/Notes
    prescription: {
        minLength: 10,
        maxLength: 1000,
        message: 'Prescription must be between 10-1000 characters',
        maxLength: 1000,
        minLength: 10
    },
    
    // Percentage
    percentage: {
        pattern: /^(100|[1-9]?[0-9])$/,
        message: 'Please enter a valid percentage (0-100)',
        max: 100,
        min: 0
    },
    
    // Year
    year: {
        pattern: /^\d{4}$/,
        message: 'Please enter a valid 4-digit year',
        maxLength: 4,
        minLength: 4,
        max: new Date().getFullYear(),
        min: 1900
    }
};

// ========================
// HELPER FUNCTIONS
// ========================

// Restrict input to numbers only (for number fields)
function restrictToNumbers(event) {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    
    // Apply max length if specified
    const maxLength = input.getAttribute('maxlength');
    if (maxLength && input.value.length > parseInt(maxLength)) {
        input.value = input.value.slice(0, parseInt(maxLength));
    }
}

// Restrict input to alphabets and spaces only (for name fields)
function restrictToAlphabets(event) {
    const input = event.target;
    input.value = input.value.replace(/[^a-zA-Z\s\.\-\']/g, '');
    
    // Apply max length
    const maxLength = input.getAttribute('maxlength');
    if (maxLength && input.value.length > parseInt(maxLength)) {
        input.value = input.value.slice(0, parseInt(maxLength));
    }
}

// Restrict input to alphanumeric (for codes)
function restrictToAlphanumeric(event) {
    const input = event.target;
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
    
    const maxLength = input.getAttribute('maxlength');
    if (maxLength && input.value.length > parseInt(maxLength)) {
        input.value = input.value.slice(0, parseInt(maxLength));
    }
}

// Format phone number as user types (add spaces after 3, 6 digits)
function formatPhoneNumber(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    
    if (value.length >= 6) {
        input.value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
        input.value = `${value.slice(0, 3)} ${value.slice(3)}`;
    } else {
        input.value = value;
    }
}

// Format amount (add commas and 2 decimal places)
function formatAmount(event) {
    let input = event.target;
    let value = input.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    input.value = value;
}

// Convert to uppercase
function toUpperCase(event) {
    const input = event.target;
    input.value = input.value.toUpperCase();
}

// Convert to proper case (First letter capital, rest lower)
function toProperCase(event) {
    const input = event.target;
    input.value = input.value.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// ========================
// VALIDATION FUNCTIONS
// ========================

// Validate a single field
function validateField(field, rules) {
    const value = field.value.trim();
    const errorSpan = document.getElementById(`${field.id}Error`) || createErrorSpan(field);
    
    // Clear previous error
    errorSpan.classList.remove('show');
    field.classList.remove('error');
    
    // Check if field is required
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, errorSpan, 'This field is required');
        return false;
    }
    
    // If field is empty and not required, skip validation
    if (!value) {
        return true;
    }
    
    // Apply validation rules
    let isValid = true;
    let errorMessage = '';
    
    // Check min length
    if (rules.minLength && value.length < rules.minLength) {
        errorMessage = `Minimum ${rules.minLength} characters required`;
        isValid = false;
    }
    // Check max length
    else if (rules.maxLength && value.length > rules.maxLength) {
        errorMessage = `Maximum ${rules.maxLength} characters allowed`;
        isValid = false;
    }
    // Check pattern
    else if (rules.pattern && !rules.pattern.test(value)) {
        errorMessage = rules.message;
        isValid = false;
    }
    // Check custom validation function
    else if (rules.validate && !rules.validate(value)) {
        errorMessage = rules.message;
        isValid = false;
    }
    // Check min value
    else if (rules.min && parseFloat(value) < rules.min) {
        errorMessage = `Minimum value is ${rules.min}`;
        isValid = false;
    }
    // Check max value
    else if (rules.max && parseFloat(value) > rules.max) {
        errorMessage = `Maximum value is ${rules.max}`;
        isValid = false;
    }
    
    if (!isValid) {
        showFieldError(field, errorSpan, errorMessage);
        return false;
    }
    
    return true;
}

// Create error span if not exists
function createErrorSpan(field) {
    let errorSpan = document.getElementById(`${field.id}Error`);
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'error-text';
        errorSpan.id = `${field.id}Error`;
        field.parentNode.appendChild(errorSpan);
    }
    return errorSpan;
}

// Show field error
function showFieldError(field, errorSpan, message) {
    errorSpan.textContent = message;
    errorSpan.classList.add('show');
    field.classList.add('error');
}

// Validate entire form
function validateForm(formId, validationMapping) {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    let isValid = true;
    const fields = form.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
        // Skip buttons and non-validation fields
        if (field.type === 'button' || field.type === 'submit' || field.type === 'reset') {
            return;
        }
        
        const fieldName = field.id;
        const rules = validationMapping[fieldName];
        
        if (rules) {
            const fieldValid = validateField(field, rules);
            if (!fieldValid) isValid = false;
        } else if (field.hasAttribute('required')) {
            // Default validation for required fields without specific rules
            if (!field.value.trim()) {
                const errorSpan = createErrorSpan(field);
                showFieldError(field, errorSpan, 'This field is required');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Real-time validation on input
function setupRealTimeValidation(fieldId, rules) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.addEventListener('input', function() {
        validateField(field, rules);
    });
    
    field.addEventListener('blur', function() {
        validateField(field, rules);
    });
}

// ========================
// FIELD-SPECIFIC SETUP
// ========================

// Setup all input restrictions and validations for a form
function setupFormValidations(formId, validationMapping) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Apply input restrictions
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        const fieldId = input.id;
        const rules = validationMapping[fieldId];
        
        if (!rules) return;
        
        // Apply input restrictions based on field type
        switch(input.getAttribute('data-validation-type')) {
            case 'numbers':
                input.addEventListener('input', restrictToNumbers);
                break;
            case 'alphabets':
                input.addEventListener('input', restrictToAlphabets);
                break;
            case 'alphanumeric':
                input.addEventListener('input', restrictToAlphanumeric);
                break;
            case 'phone':
                input.addEventListener('input', formatPhoneNumber);
                input.addEventListener('input', restrictToNumbers);
                break;
            case 'amount':
                input.addEventListener('input', formatAmount);
                break;
            case 'uppercase':
                input.addEventListener('input', toUpperCase);
                break;
            case 'propercase':
                input.addEventListener('blur', toProperCase);
                break;
        }
        
        // Set maxlength attribute
        if (rules.maxLength && !input.hasAttribute('maxlength')) {
            input.setAttribute('maxlength', rules.maxLength);
        }
        
        // Setup real-time validation
        setupRealTimeValidation(fieldId, rules);
    });
}

// ========================
// PRE-BUILT VALIDATION MAPPINGS FOR DIFFERENT PAGES
// ========================

// Patient Form Validation Mapping
const PatientValidationMapping = {
    patientName: ValidationRules.fullName,
    patientFullName: ValidationRules.fullName,
    patientEmail: ValidationRules.email,
    patientPhone: ValidationRules.phone,
    alternatePhone: ValidationRules.alternatePhone,
    patientAge: ValidationRules.age,
    patientDob: ValidationRules.dob,
    bloodGroup: ValidationRules.bloodGroup,
    gender: ValidationRules.gender,
    address: ValidationRules.address,
    pincode: ValidationRules.pincode
};

// Doctor Form Validation Mapping
const DoctorValidationMapping = {
    doctorName: ValidationRules.fullName,
    doctorEmail: ValidationRules.email,
    doctorPhone: ValidationRules.phone,
    specialization: ValidationRules.name,
    qualification: ValidationRules.name,
    experience: ValidationRules.age,
    consultationFee: ValidationRules.amount
};

// Department Form Validation Mapping
const DepartmentValidationMapping = {
    deptName: ValidationRules.deptName,
    deptCode: ValidationRules.deptCode,
    hod: ValidationRules.fullName,
    description: { maxLength: 500, minLength: 10, message: 'Description must be between 10-500 characters' }
};

// Appointment Form Validation Mapping
const AppointmentValidationMapping = {
    patientName: ValidationRules.fullName,
    patientPhone: ValidationRules.phone,
    doctorName: ValidationRules.fullName,
    appointmentDate: { validate: (val) => new Date(val) >= new Date(), message: 'Appointment date cannot be in the past' },
    symptoms: { maxLength: 500, message: 'Symptoms cannot exceed 500 characters' }
};

// Billing Form Validation Mapping
const BillingValidationMapping = {
    patientName: ValidationRules.fullName,
    billAmount: ValidationRules.amount,
    discount: ValidationRules.percentage,
    tax: ValidationRules.percentage,
    paidAmount: { pattern: /^\d+(\.\d{1,2})?$/, message: 'Please enter valid amount', max: 9999999 }
};

// Staff Form Validation Mapping
const StaffValidationMapping = {
    staffName: ValidationRules.fullName,
    staffEmail: ValidationRules.email,
    staffPhone: ValidationRules.phone,
    employeeId: ValidationRules.employeeId,
    department: ValidationRules.name,
    salary: ValidationRules.amount
};

// Pharmacy/Medicine Form Validation Mapping
const PharmacyValidationMapping = {
    medicineName: ValidationRules.name,
    batchNo: { pattern: /^[A-Z0-9]{6,15}$/, message: 'Batch number must be 6-15 alphanumeric characters' },
    quantity: ValidationRules.quantity,
    price: ValidationRules.amount,
    expiryDate: { validate: (val) => new Date(val) > new Date(), message: 'Expiry date must be in the future' }
};

// Bed/Room Form Validation Mapping
const BedValidationMapping = {
    bedNumber: ValidationRules.bedNumber,
    roomNumber: ValidationRules.roomNumber,
    floor: { pattern: /^[0-9]+$/, message: 'Floor number must be numeric', max: 20, min: 0 }
};

// ========================
// EXPORT FUNCTIONS (Global)
// ========================

window.ValidationRules = ValidationRules;
window.validateField = validateField;
window.validateForm = validateForm;
window.setupFormValidations = setupFormValidations;
window.restrictToNumbers = restrictToNumbers;
window.restrictToAlphabets = restrictToAlphabets;
window.restrictToAlphanumeric = restrictToAlphanumeric;
window.formatPhoneNumber = formatPhoneNumber;
window.formatAmount = formatAmount;
window.toUpperCase = toUpperCase;
window.toProperCase = toProperCase;

// Pre-built mappings
window.PatientValidationMapping = PatientValidationMapping;
window.DoctorValidationMapping = DoctorValidationMapping;
window.DepartmentValidationMapping = DepartmentValidationMapping;
window.AppointmentValidationMapping = AppointmentValidationMapping;
window.BillingValidationMapping = BillingValidationMapping;
window.StaffValidationMapping = StaffValidationMapping;
window.PharmacyValidationMapping = PharmacyValidationMapping;
window.BedValidationMapping = BedValidationMapping;