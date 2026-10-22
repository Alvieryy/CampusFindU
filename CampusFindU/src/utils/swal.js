import Swal from "sweetalert2";
import "../styles/alerts.css";

const AppSwal = Swal.mixin({
  buttonsStyling: false,
  heightAuto: false,
  reverseButtons: true,
  showCloseButton: true,
  customClass: {
    popup: "campus-alert",
    title: "campus-alert-title",
    htmlContainer: "campus-alert-text",
    actions: "campus-alert-actions",
    confirmButton: "campus-alert-confirm",
    cancelButton: "campus-alert-cancel",
    denyButton: "campus-alert-deny",
    closeButton: "campus-alert-close",
  },
});

export default AppSwal;