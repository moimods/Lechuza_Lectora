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
function validateAddressInput(calle_numero, ciudad_estado, codigo_postal) {
  const errors = [];

  if (!calle_numero || String(calle_numero).trim() === "") {
    errors.push("Calle y número son obligatorios");
  }

  if (!ciudad_estado || String(ciudad_estado).trim() === "") {
    errors.push("Ciudad/estado es obligatorio");
  }

  if (!codigo_postal || String(codigo_postal).trim() === "") {
    errors.push("Código postal es obligatorio");
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
  validateProductInput,
  validateAddressInput
};
