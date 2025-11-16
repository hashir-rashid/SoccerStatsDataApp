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
  document.getElementById("nav-dashboard")?.classList.remove("active");
  document.getElementById("nav-players")?.classList.remove("active");

  const teamsLink = document.getElementById("nav-teams");
  if (teamsLink) {
    teamsLink.classList.add("active");
  }

  // 4. --- LOAD REAL TEAMS FROM API (SQLite) ---
  const gridContainer = document.getElementById("team-grid-container");

  async function loadTeams() {
    try {
      // first 100 teams
      const response = await fetch("/api/teams?limit=100&page=1");
      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }

      const teams = await response.json();

      // Clear existing content
      gridContainer.innerHTML = "";

      if (!Array.isArray(teams) || teams.length === 0) {
        gridContainer.innerHTML = `
          <div class="team-card">
            <div class="team-card-content">
              <h3 class="team-card-title">No teams found</h3>
              <p class="team-card-meta">There are no teams in the database.</p>
            </div>
          </div>
        `;
        return;
      }

      teams.forEach((team) => {
        const card = document.createElement("div");
        card.className = "team-card";

        const name = team.team_long_name || "Unknown team";
        const shortName = team.team_short_name || name;

        // The SQLite Team table in this dataset doesn’t store coach/wins/losses,
        // so we just show placeholders for those stats.
        const coach = "N/A";
        const playersCount = "N/A";
        const wins = "-";
        const losses = "-";

        card.innerHTML = `
          <div class="team-card-banner">
            <span>${shortName}</span>
          </div>
          <div class="team-card-content">
            <h3 class="team-card-title">${name}</h3>
            <p class="team-card-meta">Coach: ${coach}</p>
            
            <div class="team-card-stats">
              <div class="stat">
                <div class="stat-label">Players</div>
                <div class="stat-value-sm">${playersCount}</div>
              </div>
              <div class="stat">
                <div class="stat-label">Wins</div>
                <div class="stat-value-sm">${wins}</div>
              </div>
              <div class="stat">
                <div class="stat-label">Losses</div>
                <div class="stat-value-sm">${losses}</div>
              </div>
            </div>
          </div>
        `;

        gridContainer.appendChild(card);
      });
    } catch (err) {
      console.error("Error loading teams:", err);
      gridContainer.innerHTML = `
        <div class="team-card">
          <div class="team-card-content">
            <h3 class="team-card-title">Error</h3>
            <p class="team-card-meta">Failed to load teams from the server.</p>
          </div>
        </div>
      `;
    }
  }

  // Kick it off
  loadTeams();
});