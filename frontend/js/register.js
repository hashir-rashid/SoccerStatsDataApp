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

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    errorMessage.textContent = "";

    // Client-side validation
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

    registerButton.disabled = true;
    registerButton.textContent = "Creating account...";

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful - automatically log them in
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userEmail", data.user.email);
        
        alert("Account created successfully!");
        window.location.href = "dashboard.html";
      } else {
        errorMessage.textContent = data.error;
      }
    } catch (error) {
      errorMessage.textContent = "Network error. Please try again.";
      console.error('Registration error:', error);
    } finally {
      registerButton.disabled = false;
      registerButton.textContent = "Register";
    }
  });
});