(function () {
  function shouldClearInput(input) {
    if (!input || input.disabled || input.readOnly) return false;

    const type = (input.type || "").toLowerCase();
    const clearable = new Set([
      "text",
      "email",
      "password",
      "tel",
      "date",
      "number",
      "search",
      "url",
      "textarea"
    ]);

    if (input.tagName.toLowerCase() === "textarea") return true;
    return clearable.has(type);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const forms = document.querySelectorAll("form");

    forms.forEach(function (form) {
      form.setAttribute("autocomplete", "off");

      const fields = form.querySelectorAll("input, textarea");
      fields.forEach(function (field) {
        field.setAttribute("autocomplete", "off");
        field.setAttribute("autocorrect", "off");
        field.setAttribute("autocapitalize", "off");
        field.setAttribute("spellcheck", "false");

        if (shouldClearInput(field)) {
          field.value = "";
        }
      });
    });

    // Limpia rastros temporales comunes de flujos de formularios.
    sessionStorage.clear();
    localStorage.removeItem("email_recuperacion");
  });
})();
