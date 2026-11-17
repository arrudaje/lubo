import { logEvent } from "firebase/analytics";
import { analytics } from "./index.js";

/**
 * Formats a Brazilian phone number as user types
 * Handles both mobile (11 digits) and landline (10 digits) formats
 */
function formatBrazilianPhone(value) {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, "");

  // Limit to 11 digits (2 for area code + 9 for mobile)
  const truncated = numbers.substring(0, 11);

  // Format based on length
  if (truncated.length === 0) {
    return "";
  } else if (truncated.length <= 2) {
    return `(${truncated}`;
  } else if (truncated.length === 3) {
    return `(${truncated.substring(0, 2)}) ${truncated.substring(2)}`;
  } else if (truncated.length <= 6) {
    return `(${truncated.substring(0, 2)}) ${truncated.substring(2)}`;
  } else if (truncated.length <= 10) {
    // Format as landline: (XX) XXXX-XXXX
    const areaCode = truncated.substring(0, 2);
    const firstPart = truncated.substring(2, 6);
    const secondPart = truncated.substring(6);
    return `(${areaCode}) ${firstPart}${secondPart ? "-" + secondPart : ""}`;
  } else {
    // Format as mobile: (XX) 9XXXX-XXXX
    const areaCode = truncated.substring(0, 2);
    const firstPart = truncated.substring(2, 7);
    const secondPart = truncated.substring(7);
    return `(${areaCode}) ${firstPart}${secondPart ? "-" + secondPart : ""}`;
  }
}

/**
 * Handles phone input formatting
 */
function handlePhoneInput(event) {
  const input = event.target;
  const cursorPosition = input.selectionStart;
  const previousLength = input.value.length;

  // Format the phone number
  const formatted = formatBrazilianPhone(input.value);
  input.value = formatted;

  // Adjust cursor position after formatting
  const newLength = formatted.length;
  const lengthDiff = newLength - previousLength;

  // Try to maintain cursor position intelligently
  if (event.inputType === "deleteContentBackward") {
    // When deleting, keep cursor at same position
    input.setSelectionRange(cursorPosition, cursorPosition);
  } else {
    // When typing, advance cursor by the difference
    const newPosition = cursorPosition + lengthDiff;
    input.setSelectionRange(newPosition, newPosition);
  }
}

/**
 * Handles paste event on phone input
 */
function handlePhonePaste(event) {
  event.preventDefault();

  const input = event.target;
  const pastedData = (event.clipboardData || window.clipboardData).getData(
    "text"
  );

  // Format the pasted data
  input.value = formatBrazilianPhone(pastedData);
}

/**
 * Initialize phone number formatting
 */
function initPhoneFormatting() {
  const phoneInput = document.getElementById("phone");

  if (phoneInput) {
    // Add input event listener for real-time formatting
    phoneInput.addEventListener("input", handlePhoneInput);

    // Add paste event listener for formatted pasting
    phoneInput.addEventListener("paste", handlePhonePaste);

    // Add keydown listener to handle special cases
    phoneInput.addEventListener("keydown", function (event) {
      // Allow backspace, delete, tab, escape, enter
      if (
        [8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.keyCode === 65 && event.ctrlKey === true) ||
        (event.keyCode === 67 && event.ctrlKey === true) ||
        (event.keyCode === 86 && event.ctrlKey === true) ||
        (event.keyCode === 88 && event.ctrlKey === true)
      ) {
        return;
      }

      // Ensure that it's a number and stop the keypress if not
      if (
        (event.shiftKey || event.keyCode < 48 || event.keyCode > 57) &&
        (event.keyCode < 96 || event.keyCode > 105)
      ) {
        event.preventDefault();
      }
    });
  }
}

// Initialize phone formatting when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPhoneFormatting);
} else {
  // DOM is already loaded
  initPhoneFormatting();
}

function showOrderToast(message) {
  const existingToast = document.getElementById("order-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "order-toast";
  toast.className =
    "fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-(--deep) text-(--white) px-5 py-4 shadow-xl flex items-center gap-3 transition-all duration-300";
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <p class="text-sm font-medium leading-snug">${message}</p>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

/**
 * Handles the order form submission
 */
function handleOrderSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Get form values
  const name = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const eventDate = formData.get("eventDate");
  const servings = formData.get("servings");
  const message = formData.get("message");

  // Parse date safely without UTC timezone shift (e.g. YYYY-MM-DD -> DD/MM/YYYY)
  let formattedDate = eventDate;
  if (eventDate && eventDate.includes("-")) {
    const [year, month, day] = eventDate.split("-");
    formattedDate = `${day}/${month}/${year}`;
  }

  const whatsappMessage = encodeURIComponent(
    `*NOVO PEDIDO - Lubô Confeitaria*\n` +
      `------------------------\n\n` +
      `*Nome:* ${name}\n` +
      `*WhatsApp:* ${phone}\n` +
      `*E-mail:* ${email}\n` +
      `*Data do evento:* ${formattedDate}\n` +
      `*Número de pessoas:* ${servings}\n\n` +
      `*Detalhes do pedido:*\n${message}\n\n` +
      `------------------------\n` +
      `Mensagem enviada via site`
  );

  // Open WhatsApp with pre-filled message
  window.open(`https://wa.me/5511988137150?text=${whatsappMessage}`, "_blank");

  // Show success message
  const button = form.querySelector('button[type="submit"]');
  const originalText = button.textContent;
  button.textContent = "✓ Redirecionando para WhatsApp...";
  button.disabled = true;
  button.classList.add("opacity-75");

  logEvent(analytics, "order_submitted");

  // Reset form after 3 seconds
  setTimeout(() => {
    form.reset();
    button.textContent = originalText;
    button.disabled = false;
    button.classList.remove("opacity-75");

    showOrderToast(
      "Obrigado pelo seu interesse! Continue a conversa no WhatsApp para finalizar seu pedido."
    );
  }, 3000);
}

document.addEventListener("DOMContentLoaded", async () => {
  const orderForm = document.getElementById("orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", handleOrderSubmit);
  }
});
