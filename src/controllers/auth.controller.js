const authService = require("../services/auth.service");
const usuariosService = require("../services/usuarios.service");
const { success, error } = require("../utils/response");
const {
  validateLoginInput,
  validateRegisterInput,
  validatePasswordInput,
  validateRecoveryPasswordInput
} = require("../utils/validators");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validar entrada
    const { isValid, errors } = validateLoginInput(email, password);
    if (!isValid) {
      return error(res, errors.join(", "), 400);
    }

    // Autenticar
    const { token, usuario } = await authService.login(email, password);

    return success(res, {
      token,
      usuario
    }, "Login exitoso", 200);
  } catch (err) {
    next(err);
  }
}

async function registro(req, res, next) {
  try {
    const { nombre_completo, email, password, passwordConfirm, telefono } = req.body;

    // Validar entrada
    const { isValid, errors } = validateRegisterInput(nombre_completo, email, password, passwordConfirm, telefono);
    if (!isValid) {
      return error(res, errors.join(", "), 400);
    }

    // Crear usuario
    const usuario = await usuariosService.crear(nombre_completo, email, password, telefono);

    // Generar token
    const token = authService.generarToken(usuario.id_usuario, usuario.email, usuario.rol);

    return success(res, {
      token,
      usuario
    }, "Usuario registrado correctamente", 201);
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  return success(res, null, "Sesión cerrada", 200);
}

async function actualizarPassword(req, res, next) {
  try {
    const { passwordActual, passwordNueva, passwordConfirm } = req.body;

    const { isValid, errors } = validatePasswordInput(passwordActual, passwordNueva, passwordConfirm);
    if (!isValid) {
      return error(res, errors.join(", "), 400);
    }

    await usuariosService.actualizarPassword(req.user.id, passwordActual, passwordNueva);

    return success(res, null, "Contraseña actualizada correctamente", 200);
  } catch (err) {
    next(err);
  }
}

async function recuperarPassword(req, res, next) {
  try {
    const { email, passwordNueva, passwordConfirm } = req.body;

    const { isValid, errors } = validateRecoveryPasswordInput(email, passwordNueva, passwordConfirm);
    if (!isValid) {
      return error(res, errors.join(", "), 400);
    }

    await usuariosService.actualizarPasswordPorEmail(email, passwordNueva);

    return success(res, null, "Contraseña restablecida correctamente", 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  registro,
  logout,
  actualizarPassword,
  recuperarPassword
};
