// register.js

document.addEventListener("DOMContentLoaded", () => {
  // Redirect if already logged in
  if (localStorage.getItem("isAuthenticated") === "true") {
    window.location.href = "dashboard.html";
  }

  // Get elements
  const registerForm = document.getElementById("register-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const registerButton = document.getElementById("register-button");
  const errorMessage = document.getElementById("error-message");

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get values
    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    errorMessage.textContent = "";

    // 1. Validation (from the original code)
    if (!name || !email || !password || !confirmPassword) {
      errorMessage.textContent = "Please fill in all fields";
      return;
    }
    if (password !== confirmPassword) {
      errorMessage.textContent = "Passwords do not match";
      return;
    }
    if (password.length < 6) {
      errorMessage.textContent = "Password must be at least 6 characters";
      return;
    }

    // 2. Disable button
    registerButton.disabled = true;
    registerButton.textContent = "Creating account...";

    // 3. Simulate registration
    setTimeout(() => {
      // In a real app, you'd check if the email already exists
      // For this demo, we will just assume it's successful

      // --- Success ---
      
      // 1. Store user state in localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userName", name);
      localStorage.setItem("userRole", "User"); // Default new users to "User"

      // 2. Show success
      alert("Account created successfully!");

      // 3. Redirect to dashboard
      window.location.href = "dashboard.html";

    }, 1000);
  });
});