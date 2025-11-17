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
  let currentLimit = 50; // Default limit
  let currentSort = 'name-asc';
  let allTeams = [];

  // Load the teams
  async function loadTeams(limit = currentLimit, sort = currentSort) {
    try {
      // Show loading state
      gridContainer.innerHTML = `
        <div class="team-card">
          <div class="team-card-content">
            <h3 class="team-card-title">Loading teams...</h3>
          </div>
        </div>
      `;

      // Use a very high limit for "All entries"
      const effectiveLimit = limit === -1 ? 10000 : limit;
      
      // Ask backend for teams from the SQLite DB
      const response = await fetch(`/api/teams?limit=${effectiveLimit}&page=1`);
      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }

      const teams = await response.json();
      allTeams = teams; // Store for client-side sorting

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

      // Apply limit if not "all entries" (-1)
      let teamsToShow = teams;
      if (limit !== -1) {
        teamsToShow = teams.slice(0, limit);
      }

      // Apply sorting
      const sortedTeams = sortTeams(teamsToShow, sort);
      
      renderTeams(sortedTeams);

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

  // Sort the teams
  function sortTeams(teams, sortType) {
    const sortedTeams = [...teams];
    
    switch (sortType) {
      case 'name-asc':
        return sortedTeams.sort((a, b) => (a.team_long_name || '').localeCompare(b.team_long_name || ''));
      
      case 'name-desc':
        return sortedTeams.sort((a, b) => (b.team_long_name || '').localeCompare(a.team_long_name || ''));
      
      default:
        return sortedTeams;
    }
  }

  // Render the teams
  function renderTeams(teams) {
    // Clear existing content first
    gridContainer.innerHTML = "";
    
    teams.forEach((team) => {
      const card = document.createElement("div");
      card.className = "team-card";

      const name = team.team_long_name || "Unknown team";
      const shortName = team.team_short_name || name;

      card.innerHTML = `
        <div class="team-card-banner">
          <span>${shortName}</span>
        </div>
        <div class="team-card-content">
          <h3 class="team-card-title">${name}</h3>
        </div>
      `;

      gridContainer.appendChild(card);
    });
  }

  // 5. --- LIMIT SELECTOR FUNCTIONALITY ---
  const limitSelect = document.getElementById("limit-select");
  const sortSelect = document.getElementById("sort-select");

  if (limitSelect) {
    limitSelect.addEventListener("change", (event) => {
      const newLimit = parseInt(event.target.value);
      currentLimit = newLimit;
      loadTeams(newLimit, currentSort); 
    });
  }

  if (sortSelect) {
    sortSelect.removeAttribute('disabled'); // Enable the sort dropdown
    sortSelect.addEventListener("change", (event) => {
      const newSort = event.target.value;
      currentSort = newSort;
      
      // If we already have teams loaded, just re-sort them
      if (allTeams.length > 0) {
        const teamsToShow = currentLimit === -1 ? allTeams : allTeams.slice(0, currentLimit);
        const sortedTeams = sortTeams(teamsToShow, newSort);
        renderTeams(sortedTeams);
      } else {
        // Otherwise reload from server
        loadTeams(currentLimit, newSort);
      }
    });
  }

  // Load the teams
  loadTeams(currentLimit, currentSort);
});