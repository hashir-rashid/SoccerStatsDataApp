// This runs when the script is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in (using localStorage)
  if (localStorage.getItem("isAuthenticated") === "true") {
    // If yes, redirect to dashboard
    window.location.href = "dashboard.html";
  }

  // Get elements from the DOM
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login-button");
  const errorMessage = document.getElementById("error-message");

  // Add event listener for the form submission
  loginForm.addEventListener("submit", async (e) => {
    // Prevent the form from actually submitting (which reloads the page)
    e.preventDefault();

    // Get values from the inputs
    const email = emailInput.value;
    const password = passwordInput.value;

    // Clear any previous errors
    errorMessage.textContent = "";

    // 1. Validation (from the original code)
    if (!email || !password) {
      errorMessage.textContent = "Please fill in all fields";
      return;
    }

    // 2. Disable button and show loading text
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    // 3. Fetch login data
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful - store user info in localStorage for client-side use
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userEmail", data.user.email);
        
        alert("Logged in successfully!");
        window.location.href = "dashboard.html";
      } else {
          errorMessage.textContent = data.error;
      }
    } catch (error) {
        errorMessage.textContent = "Network error. Please try again.";
        console.error('Login error:', error);
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
  });
});