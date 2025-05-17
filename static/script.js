function openResetPopup() {
  document.getElementById("container").style.display = "none";
  document.getElementById("resetPopup").style.display = "flex";
}

function closeResetPopup() {
  document.getElementById("resetForm").reset();
}

document.addEventListener("DOMContentLoaded", () => {
  // All DOM-interacting code goes here
  const container = document.getElementById("container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");

  if (registerBtn && loginBtn) {
    registerBtn.addEventListener("click", () => container.classList.add("active"));
    loginBtn.addEventListener("click", () => container.classList.remove("active"));
  }

  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      openResetPopup();
    });
  }

  const passwordInput = document.getElementById("reg_password");
  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      const password = passwordInput.value;
      document.getElementById("length").className = password.length >= 8 ? "valid" : "invalid";
      document.getElementById("uppercase").className = /[A-Z]/.test(password) ? "valid" : "invalid";
      document.getElementById("lowercase").className = /[a-z]/.test(password) ? "valid" : "invalid";
      document.getElementById("number").className = /[0-9]/.test(password) ? "valid" : "invalid";
      document.getElementById("special").className = /[!@#4%^$*(),.?":{}|\-_+=;'<>]/.test(password) ? "valid" : "invalid";
    });
  }

  const activeForm = "{{ active_form }}";
  if (activeForm === "register") {
    container.classList.add("active");
  } else {
    container.classList.remove("active");
  }
});


async function handleReset(event) {
  event.preventDefault();
  const email = document.getElementById("reset_email").value;
  const question = document.getElementById("reset_question").value;
  const answer = document.getElementById("reset_answer").value;
  const errorMsg = document.getElementById("resetError");
  const passwordFields = document.getElementById("passwordFields");

  if (passwordFields.style.display === "none") {
    const res = await fetch("/verify_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, question, answer })
    });
    const data = await res.json();
    if (data.success) {
      passwordFields.style.display = "block";
      document.getElementById("reset_answer").style.display = "none";
      document.getElementById("reset_question").style.display = "none";
      document.getElementById("reset_email").readOnly = true;
      document.getElementById("resetPopup").style.height = "50%";
      errorMsg.style.display = "none";
    } else {
      errorMsg.textContent = data.message;
      errorMsg.style.display = "block";
    }
  } else {
    const newPass = document.getElementById("new_password").value;
    const confirmPass = document.getElementById("confirm_new_password").value;
    const password_error_msg=document.getElementById("reset_password_error");
    const isValidLength = newPass.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPass);
    const hasLowercase = /[a-z]/.test(newPass);
    const hasDigit = /[0-9]/.test(newPass);
    const hasSpecialChar = /[!@#\$%\^&\*\(\)\[\]\{\},\.?":{}|<>_\-+=;'`~\\/]/.test(newPass);


    if (!isValidLength || !hasUppercase || !hasLowercase || !hasDigit || !hasSpecialChar) {
      password_error_msg.textContent = "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special symbol.";
      password_error_msg.style.display = "block";
      return;
    }
    if (newPass !== confirmPass) {
      errorMsg.textContent = "Passwords do not match!";
      errorMsg.style.display = "block";
      return;
    }

    const res = await fetch("/reset_password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPass })
    });
    const data = await res.json();
    if (data.success) {
      alert("Password reset successful. Please log in.");
      closeResetPopup();
    } else {
      errorMsg.textContent = data.message;
      errorMsg.style.display = "block";
    }
  }
}

let closeResetPass = () => {
  document.getElementById('resetPopup').style.display = "none";
  document.getElementById('container').style.display = "flex";
};
