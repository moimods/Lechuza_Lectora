(function () {
  const badge = document.getElementById("estado-servidor");
  if (!badge) return;

  function setEstado(texto, tipo) {
    badge.textContent = texto;
    badge.classList.remove("estado-ok", "estado-warn", "estado-error");
    badge.classList.add(tipo);
  }

  async function verificarEstado() {
    setEstado("Verificando servidor...", "estado-warn");

    try {
      const response = await fetch("/api/health", {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Healthcheck no disponible");
      }

      const data = await response.json();
      if (data.ok && data.database === "up") {
        setEstado("Servidor activo | BD conectada", "estado-ok");
        return;
      }

      setEstado("Servidor activo | Revisar base de datos", "estado-warn");
    } catch (error) {
      setEstado("No se pudo verificar backend", "estado-error");
      console.error("Diagnostico de estado fallo:", error);
    }
  }

  verificarEstado();
})();
