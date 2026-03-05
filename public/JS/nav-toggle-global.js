(function () {
  function syncToggleState(toggleButton, navElement) {
    if (!toggleButton || !navElement) return;
    const isOpen = navElement.classList.contains("active") || navElement.classList.contains("show-menu");
    toggleButton.classList.toggle("open", isOpen);
    toggleButton.classList.toggle("is-open", isOpen);
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  }

  function setupToggle(toggleButton) {
    if (!toggleButton) return;

    const navElement = document.getElementById("mobile-nav") || document.getElementById("menu-items");
    if (!navElement) return;

    if (!toggleButton.getAttribute("aria-label")) {
      toggleButton.setAttribute("aria-label", "Abrir menú");
    }
    if (!toggleButton.getAttribute("aria-expanded")) {
      toggleButton.setAttribute("aria-expanded", "false");
    }

    toggleButton.addEventListener("click", function () {
      requestAnimationFrame(function () {
        syncToggleState(toggleButton, navElement);
      });
    });

    const observer = new MutationObserver(function () {
      syncToggleState(toggleButton, navElement);
    });

    observer.observe(navElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    syncToggleState(toggleButton, navElement);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("hamburger-btn");
    if (toggleButton) {
      setupToggle(toggleButton);
    }
  });
})();
