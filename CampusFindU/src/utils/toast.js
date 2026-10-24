import Swal from "sweetalert2";
import "../styles/toast.css";

// One notification surface, shared across routes. No provider is required.
function fire(titleOrOptions, text, icon = "info") {
  const options = typeof titleOrOptions === "object"
    ? titleOrOptions
    : { title: titleOrOptions, text, icon };
  const type = ["success", "error", "warning", "info", "question"].includes(options.icon)
    ? options.icon : "info";
  const message = String(options.text || "");
  const duration = type === "error" ? 0 : message.length > 100 ? 10000 : 5500;

  return Swal.fire({
    toast: true,
    position: "top-end",
    titleText: String(options.titleText || options.title || ""),
    text: message,
    icon: type,
    showConfirmButton: false,
    showCloseButton: true,
    closeButtonAriaLabel: "Dismiss notification",
    timer: duration,
    timerProgressBar: duration > 0,
    heightAuto: false,
    customClass: {
      container: "cfu-toast-container",
      popup: `cfu-toast cfu-toast--${type}`,
      title: "cfu-toast-title",
      htmlContainer: "cfu-toast-message",
      closeButton: "cfu-toast-close",
      timerProgressBar: "cfu-toast-progress",
    },
    didOpen: (popup) => {
      const pause = () => Swal.stopTimer();
      const resume = () => {
        if (!popup.matches(":hover") && !popup.contains(document.activeElement)) {
          Swal.resumeTimer();
        }
      };
      popup.addEventListener("mouseenter", pause);
      popup.addEventListener("mouseleave", resume);
      popup.addEventListener("focusin", pause);
      popup.addEventListener("focusout", resume);
    },
  });
}

export default { fire };
