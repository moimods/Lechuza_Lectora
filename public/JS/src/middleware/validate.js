/* ======================================
   VALIDADOR GLOBAL
====================================== */

export const Validator = {

  email(value) {

    if (!value)
      return "El email es obligatorio";

    if (value.length > 100)
      return "Email demasiado largo";

    const regex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(value))
      return "Formato de email inválido";

    return null;
  },

  password(value) {

    if (!value)
      return "La contraseña es obligatoria";

    if (value.length < 8)
      return "Mínimo 8 caracteres";

    if (!/[A-Z]/.test(value))
      return "Debe contener una mayúscula";

    if (!/[0-9]/.test(value))
      return "Debe contener un número";

    return null;
  }
};