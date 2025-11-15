// login.js

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
  loginForm.addEventListener("submit", (e) => {
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

    // 3. Simulate the 'login' function (mocking the API call)
    // We use setTimeout to simulate a network delay
    setTimeout(() => {
      // Mocked login logic based on demo credentials
      if (
        (email === "admin@sports.com" && password === "admin123") ||
        (email === "user@sports.com" && password === "user123")
      ) {
        // --- Success ---
        
        // 1. Store user state in localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userName", email === "admin@sports.com" ? "Demo Admin" : "Demo User");
        localStorage.setItem("userRole", email === "admin@sports.com" ? "Admin" : "User");

        // 2. Show success (using a simple alert instead of a 'toast')
        alert("Logged in successfully!");

        // 3. Redirect to the dashboard
        window.location.href = "dashboard.html";

      } else {
        // --- Failure ---
        
        // 1. Show error message
        errorMessage.textContent = "Invalid email or password";
        
        // 2. Re-enable the button
        loginButton.disabled = false;
        loginButton.textContent = "Login";
      }
    }, 1000); // 1-second delay
  });
});