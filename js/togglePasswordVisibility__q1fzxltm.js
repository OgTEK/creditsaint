$(document).ready(function () {
  function togglePasswordVisibility(button) {
    const passwordField = $(button).siblings(".password-field");
    const passwordIcon = $(button).find(".password-icon");

    if (passwordField.attr("type") === "password") {
      passwordField.attr("type", "text");
      passwordIcon.removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      passwordField.attr("type", "password");
      passwordIcon.removeClass("fa-eye-slash").addClass("fa-eye");
    }
  }

  $(".toggle-password-button").on("click", function () {
    togglePasswordVisibility(this);
  });
});
