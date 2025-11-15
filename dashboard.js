// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. --- AUTHENTICATION CHECK ---
  // This is the "Protected Route" logic
  if (localStorage.getItem("isAuthenticated") !== "true") {
    // User is not authenticated, redirect to login
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
    return; // Stop executing the rest of the script
  }

  // 2. --- POPULATE USER DATA ---
  // If we are here, the user is authenticated.
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");

  // Find the display elements in the header
  const userNameDisplay = document.getElementById("user-name-display");
  const userNameGreeting = document.getElementById("user-name-greeting");

  if (userName && userRole) {
    // Set text in the header
    userNameDisplay.innerHTML = `${userName} (<span>${userRole}</span>)`;
    
    // Set text in the main content greeting
    userNameGreeting.textContent = userName;
  }

  // 3. --- LOGOUT BUTTON ---
  const logoutButton = document.getElementById("logout-button");

  logoutButton.addEventListener("click", () => {
    // Clear the user's session from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    
    // Redirect to the login page
    window.location.href = "login.html";
  });
  
  // 4. --- SET ACTIVE NAV LINK ---
  // This logic highlights the current page in the sidebar
  const dashboardLink = document.getElementById("nav-dashboard");
  if (dashboardLink) {
    dashboardLink.classList.add("active");
  }
  
});