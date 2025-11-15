// players.js

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. --- AUTHENTICATION CHECK ---
  if (localStorage.getItem("isAuthenticated") !== "true") {
    alert("You must be logged in to view this page.");
    window.location.href = "/login.html";
    return;
  }

  // 2. --- POPULATE USER DATA (Header & Logout) ---
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");
  const userNameDisplay = document.getElementById("user-name-display");
  const logoutButton = document.getElementById("logout-button");

  if (userName && userRole) {
    userNameDisplay.innerHTML = `${userName} (<span>${userRole}</span>)`;
  }

  logoutButton.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
  
  // 3. --- SET ACTIVE NAV LINK ---
  // Deactivate dashboard link
  const dashboardLink = document.getElementById("nav-dashboard");
  if (dashboardLink) {
    dashboardLink.classList.remove("active");
  }
  // Activate players link
  const playersLink = document.getElementById("nav-players");
  if (playersLink) {
    playersLink.classList.add("active");
  }

  // 4. --- MOCK PLAYER DATA & RENDER TABLE ---
  const mockPlayers = [
    { name: "Alex Johnson", team: "Warriors", position: "Forward", age: 25, status: "Active" },
    { name: "Maria Garcia", team: "Lions", position: "Guard", age: 22, status: "Active" },
    { name: "James Smith", team: "Tigers", position: "Center", age: 28, status: "Inactive" },
    { name: "Li Chen", team: "Panthers", position: "Guard", age: 24, status: "Active" },
    { name: "Tom Brady", team: "Warriors", position: "Forward", age: 31, status: "Active" }
  ];

  const tableBody = document.getElementById("players-table-body");

  // Clear existing rows (if any)
  tableBody.innerHTML = ""; 

  // Loop through data and create table rows
  mockPlayers.forEach(player => {
    const row = document.createElement("tr");
    
    // Status badge logic
    const statusClass = player.status === "Active" ? "" : "inactive";
    const statusBadge = `<span class="status-badge ${statusClass}">${player.status}</span>`;
    
    // Action buttons
    const actions = `
      <a href="#" class="action-link">Edit</a>
      <a href="#" class="action-link">Delete</a>
    `;
    
    row.innerHTML = `
      <td>${player.name}</td>
      <td>${player.team}</td>
      <td>${player.position}</td>
      <td>${player.age}</td>
      <td>${statusBadge}</td>
      <td>${actions}</td>
    `;
    
    tableBody.appendChild(row);
  });
});