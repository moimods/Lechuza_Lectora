/**
 * Utilidades de validación para La Lechuza Lectora
 */

/**
 * Valida email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).trim());
}

/**
 * Valida contraseña (mínimo 8 caracteres)
 */
function isValidPassword(password) {
  if (!password || typeof password !== "string") return false;
  return password.length >= 8;
}

/**
 * Valida nombre (al menos 2 caracteres)
 */
function isValidName(name) {
  if (!name || typeof name !== "string") return false;
  return name.trim().length >= 2;
}

/**
 * Valida precio (número positivo)
 */
function isValidPrice(price) {
  const num = Number(price);
  return !isNaN(num) && num >= 0;
}

/**
 * Valida stock (número entero positivo)
 */
function isValidStock(stock) {
  const num = Number(stock);
  return Number.isInteger(num) && num >= 0;
}

/**
 * Valida ID (número entero positivo)
 */
function isValidId(id) {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
}

/**
 * Valida URL
 */
function isValidUrl(url) {
  if (!url || typeof url !== "string") return true; // optional
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida objeto de login
 */
function validateLoginInput(email, password) {
  const errors = [];

  if (!email || !String(email).trim()) {
    errors.push("Email es obligatorio");
  } else if (!isValidEmail(email)) {
    errors.push("Email inválido");
  }

  if (!password || !String(password).trim()) {
    errors.push("Contraseña es obligatoria");
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Valida objeto de registro
 */
function validateRegisterInput(nombre_completo, email, password, passwordConfirm) {
  const errors = [];

  if (!isValidName(nombre_completo)) {
    errors.push("Nombre debe tener al menos 2 caracteres");
  }

  if (!isValidEmail(email)) {
    errors.push("Email inválido");
  }

  if (!isValidPassword(password)) {
    errors.push("Contraseña debe tener al menos 8 caracteres");
  }

  if (password !== passwordConfirm) {
    errors.push("Las contraseñas no coinciden");
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Valida cambio de contraseña
 */
function validatePasswordInput(passwordActual, passwordNueva, passwordConfirm) {
  const errors = [];

  if (!passwordActual || String(passwordActual).trim() === "") {
    errors.push("Contraseña actual es obligatoria");
  }

  if (!isValidPassword(passwordNueva)) {
    errors.push("Contraseña nueva debe tener al menos 8 caracteres");
  }

  if (passwordNueva !== passwordConfirm) {
    errors.push("Las contraseñas no coinciden");
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Valida recuperación de contraseña por correo
 */
function validateRecoveryPasswordInput(email, passwordNueva, passwordConfirm) {
  const errors = [];

  if (!isValidEmail(email)) {
    errors.push("Email inválido");
  }

  if (!isValidPassword(passwordNueva)) {
    errors.push("Contraseña nueva debe tener al menos 8 caracteres");
  }

  if (passwordNueva !== passwordConfirm) {
    errors.push("Las contraseñas no coinciden");
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Valida objeto de producto
 */
function validateProductInput(titulo, precio, stock) {
  const errors = [];

  if (!titulo || String(titulo).trim() === "") {
    errors.push("Título es obligatorio");
  }

  if (!isValidPrice(precio)) {
    errors.push("Precio debe ser un número positivo");
  }

  if (!isValidStock(stock)) {
    errors.push("Stock debe ser un número entero positivo");
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Valida objeto de dirección
 */
function validateAddressInput(calle_numero, ciudad_estado, codigo_postal, options = {}) {
  const errors = [];
  const partial = Boolean(options.partial);

  const calle = calle_numero === undefined || calle_numero === null
    ? ""
    : String(calle_numero).trim();
  const ciudadEstado = ciudad_estado === undefined || ciudad_estado === null
    ? ""
    : String(ciudad_estado).trim();
  const cp = codigo_postal === undefined || codigo_postal === null
    ? ""
    : String(codigo_postal).trim();

  if (!partial || calle_numero !== undefined) {
    if (!calle) {
      errors.push("Calle y número son obligatorios");
    } else if (calle.length < 5) {
      errors.push("Calle y número debe tener al menos 5 caracteres");
    }
  }

  if (!partial || ciudad_estado !== undefined) {
    if (!ciudadEstado) {
      errors.push("Ciudad/estado es obligatorio");
    } else if (ciudadEstado.length < 3) {
      errors.push("Ciudad/estado debe tener al menos 3 caracteres");
    }
  }

  if (!partial || codigo_postal !== undefined) {
    if (!cp) {
      errors.push("Código postal es obligatorio");
    } else if (!/^\d{5}$/.test(cp)) {
      errors.push("Código postal debe tener 5 dígitos");
    }
  }

  if (partial && calle_numero === undefined && ciudad_estado === undefined && codigo_postal === undefined) {
    errors.push("Debes enviar al menos un campo de dirección para actualizar");
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidPrice,
  isValidStock,
  isValidId,
  isValidUrl,
  validateLoginInput,
  validateRegisterInput,
  validatePasswordInput,
  validateRecoveryPasswordInput,
  validateProductInput,
  validateAddressInput
};
