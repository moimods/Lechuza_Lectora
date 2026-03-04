/**
 * SISTEMA GLOBAL DE AUTENTICACIÓN Y SEGURIDAD - LA LECHUZA LECTORA
 * Incluye: Registro, Cambio de Pass, Captcha y Validaciones Reales.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURACIÓN DE RUTAS Y SELECTORES ---
    const LOGIN_URL = 'inicio_sesion.html';
    const INDEX_URL = '../../index.html';
    let currentCaptcha = '';

    // Referencias de Formulario
    const registrationForm = document.getElementById('registrationForm');
    const passwordForm = document.getElementById('password-form');
    
    // Referencias de Inputs
    const passwordInput = document.getElementById('password') || document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm_password') || document.getElementById('confirm-password');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('telefono');
    const birthdateInput = document.getElementById('fecha_nacimiento');
    const captchaInput = document.getElementById('captcha-input');
    
    // Referencias de Requisitos (UI)
    const reqs = {
        length: document.getElementById('req-length') || document.getElementById('reg-req-length'),
        number: document.getElementById('req-number') || document.getElementById('reg-req-number'),
        special: document.getElementById('req-special') || document.getElementById('reg-req-special'),
        common: document.getElementById('req-common') || document.getElementById('reg-req-common'),
        match: document.getElementById('req-match') || document.getElementById('reg-req-match')
    };

    const commonPasswords = ["123456", "password", "qwerty", "12345678", "123456789"];

    // --- 2. LÓGICA DE CAPTCHA ROBUSTA ---
    function generateCaptcha() {
        const captchaDisplay = document.getElementById('captcha-display');
        if (!captchaDisplay) return;

        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin caracteres confusos
        let result = "";
        captchaDisplay.innerHTML = ""; 

        for (let i = 0; i < 6; i++) {
            const char = chars.charAt(Math.floor(Math.random() * chars.length));
            result += char;

            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.transform = `rotate(${Math.floor(Math.random() * 30) - 15}deg)`;
            span.style.margin = '0 4px';
            span.style.fontSize = '24px';
            span.style.userSelect = 'none';
            captchaDisplay.appendChild(span);
        }
        currentCaptcha = result;
    }

    // --- 3. VALIDACIÓN DE CONTRASEÑA EN TIEMPO REAL ---
    function updateRequirementUI(element, condition) {
        if (!element) return;
        element.style.color = condition ? '#2e7d32' : '#d32f2f';
        const icon = element.querySelector('i');
        if (icon) {
            icon.className = condition ? 'fa-solid fa-check' : 'fa-solid fa-times';
        }
    }

    function validateSecurity() {
        const pass = passwordInput ? passwordInput.value : '';
        const confirm = confirmPasswordInput ? confirmPasswordInput.value : '';

        const rules = {
            length: pass.length >= 6 && pass.length <= 15,
            number: /[0-9]/.test(pass),
            special: /[!@#$%^&*._-]/.test(pass),
            common: !commonPasswords.includes(pass.toLowerCase().trim()),
            match: pass === confirm && pass.length > 0
        };

        updateRequirementUI(reqs.length, rules.length);
        updateRequirementUI(reqs.number, rules.number);
        updateRequirementUI(reqs.special, rules.special);
        updateRequirementUI(reqs.common, rules.common);
        updateRequirementUI(reqs.match, rules.match);

        return Object.values(rules).every(r => r === true);
    }

    // --- 4. VALIDACIONES DE CAMPO (EDAD, EMAIL) ---
    function isValidAge(dateStr) {
        if (!dateStr) return false;
        const birth = new Date(dateStr);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            age--;
        }
        return age >= 18;
    }

    // --- 5. EVENTOS DE INTERFAZ ---

    // Visibilidad de Password
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = document.getElementById(e.currentTarget.dataset.target);
            if (target) {
                const isPass = target.type === 'password';
                target.type = isPass ? 'text' : 'password';
                e.currentTarget.classList.toggle('fa-eye', !isPass);
                e.currentTarget.classList.toggle('fa-eye-slash', isPass);
            }
        });
    });

    // Refrescar Captcha
    const refreshBtn = document.getElementById('captcha-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', generateCaptcha);

    // Escuchar cambios en pass
    if (passwordInput) {
        passwordInput.addEventListener('input', validateSecurity);
        if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', validateSecurity);
    }

    // --- 6. ENVÍO DE FORMULARIOS ---
    
    const handleFormSubmit = (e, isRegistration = true) => {
        e.preventDefault();

        // Validar Password primero
        if (!validateSecurity()) {
            alert("🦉 La contraseña no cumple los requisitos de seguridad.");
            return;
        }

        // Validar Captcha
        if (captchaInput && captchaInput.value.trim().toUpperCase() !== currentCaptcha) {
            alert("Código CAPTCHA incorrecto.");
            generateCaptcha();
            return;
        }

        if (isRegistration) {
            // Validaciones extras de Registro
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                alert("Email no válido."); return;
            }
            if (!/^\d{8,15}$/.test(phoneInput.value)) {
                alert("Teléfono debe tener entre 8 y 15 números."); return;
            }
            if (!isValidAge(birthdateInput.value)) {
                alert("Debes ser mayor de 18 años."); return;
            }

            const modal = document.getElementById('success-modal');
            if (modal) modal.style.display = 'flex';
            else alert("¡Registro exitoso!");
        } else {
            // Lógica de Cambio de Pass
            alert("¡Contraseña actualizada!");
            window.location.replace(INDEX_URL);
        }
    };

    if (registrationForm) registrationForm.addEventListener('submit', (e) => handleFormSubmit(e, true));
    if (passwordForm) passwordForm.addEventListener('submit', (e) => handleFormSubmit(e, false));

    // Inicialización
    generateCaptcha();
    validateSecurity();
});