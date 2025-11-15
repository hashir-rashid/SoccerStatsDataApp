// teams.js

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. --- AUTHENTICATION CHECK ---
  if (localStorage.getItem("isAuthenticated") !== "true") {
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
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
  // Deactivate other links
  document.getElementById("nav-dashboard")?.classList.remove("active");
  document.getElementById("nav-players")?.classList.remove("active");
  
  // Activate teams link
  const teamsLink = document.getElementById("nav-teams");
  if (teamsLink) {
    teamsLink.classList.add("active");
  }

  // 4. --- MOCK TEAM DATA & RENDER CARDS ---
  const mockTeams = [
    { name: "Warriors", coach: "Steve Kerr", players: 15, wins: 57, losses: 25 },
    { name: "Lions", coach: "Dan Campbell", players: 14, wins: 45, losses: 37 },
    { name: "Tigers", coach: "A.J. Hinch", players: 16, wins: 30, losses: 52 },
    { name: "Panthers", coach: "Frank Reich", players: 15, wins: 50, losses: 32 },
  ];

  const gridContainer = document.getElementById("team-grid-container");

  // Clear existing content
  gridContainer.innerHTML = ""; 

  // Loop through data and create team cards
  mockTeams.forEach(team => {
    // Create a new div element for the card
    const card = document.createElement("div");
    card.className = "team-card";
    
    // Set the inner HTML of the card
    card.innerHTML = `
      <div class="team-card-banner">
        <span>${team.name}</span>
      </div>
      <div class="team-card-content">
        <h3 class="team-card-title">${team.name}</h3>
        <p class="team-card-meta">Coach: ${team.coach}</p>
        
        <div class="team-card-stats">
          <div class="stat">
            <div class="stat-label">Players</div>
            <div class="stat-value-sm">${team.players}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Wins</div>
            <div class="stat-value-sm">${team.wins}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Losses</div>
            <div class="stat-value-sm">${team.losses}</div>
          </div>
        </div>
      </div>
    `;
    
    // Append the new card to the grid
    gridContainer.appendChild(card);
  });
});