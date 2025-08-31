/**
 * Toggle mobile menu visibility
 */
function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const button = document.getElementById("mobile-menu-button");
  const menuBars = button.querySelector(".menu-icon-bars");
  const menuClose = button.querySelector(".menu-icon-close");

  menu.classList.toggle("hidden");
  const isOpen = !menu.classList.contains("hidden");

  button.setAttribute("aria-expanded", isOpen);
  menuBars.classList.toggle("hidden", isOpen);
  menuClose.classList.toggle("hidden", !isOpen);
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const button = document.getElementById("mobile-menu-button");
  const menuBars = button.querySelector(".menu-icon-bars");
  const menuClose = button.querySelector(".menu-icon-close");

  menu.classList.add("hidden");
  button.setAttribute("aria-expanded", "false");
  menuBars.classList.remove("hidden");
  menuClose.classList.add("hidden");
}

// Add click event listener to mobile menu button
document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", toggleMobileMenu);
  }

  // Close menu when clicking outside
  document.addEventListener("click", function (event) {
    const menu = document.getElementById("mobile-menu");
    const button = document.getElementById("mobile-menu-button");

    if (
      !menu.contains(event.target) &&
      !button.contains(event.target) &&
      !menu.classList.contains("hidden")
    ) {
      closeMobileMenu();
    }
  });
});
