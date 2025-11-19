document.addEventListener("DOMContentLoaded", () => {
  // 1. --- AUTHENTICATION CHECK ---
  if (localStorage.getItem("isAuthenticated") !== "true") {
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
    return;
  }

  // 1.5 --- ADMIN PERMISSIONS CHECK ---
  const userRole = localStorage.getItem("userRole");
  
  // Function to check admin permissions and update UI
  function checkAdminPermissions() {
    const addTeamButton = document.getElementById("add-team-button");
    if (!addTeamButton) return;
    
    if (userRole !== "admin") {
      addTeamButton.disabled = true;
      addTeamButton.title = "Admin access required";
      addTeamButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        Admin Only
      `;
      addTeamButton.style.opacity = "0.6";
      addTeamButton.style.cursor = "not-allowed";
    }
  }

  // Call this on page load
  checkAdminPermissions();

  // 2. --- POPULATE USER DATA (Header & Logout) ---
  const userName = localStorage.getItem("userName");
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

  // 6. --- ADD TEAM FUNCTIONALITY ---
  const addTeamButton = document.getElementById("add-team-button");
  const addTeamModal = document.getElementById("add-team-modal");
  const closeTeamModalButton = document.getElementById("close-team-modal");
  const cancelTeamModalButton = document.getElementById("cancel-team-modal");
  const submitTeamButton = document.getElementById("submit-team");
  const addTeamForm = document.getElementById("add-team-form");
  const teamModalErrorMessage = document.getElementById("team-modal-error-message");

  // Open modal
  if (addTeamButton) {
    addTeamButton.addEventListener("click", () => {
      // Double-check admin permissions on click
      const currentUserRole = localStorage.getItem("userRole");
      if (currentUserRole !== "admin") {
        alert("Access denied. Admin privileges required to add teams.");
        return;
      }

      addTeamForm.reset();
      teamModalErrorMessage.style.display = "none";
      addTeamModal.style.display = "flex";
    });
  }

  // Close modal functions
  function closeTeamModal() {
    addTeamModal.style.display = "none";
  }

  if (closeTeamModalButton) {
    closeTeamModalButton.addEventListener("click", closeTeamModal);
  }

  if (cancelTeamModalButton) {
    cancelTeamModalButton.addEventListener("click", closeTeamModal);
  }

  // Close modal when clicking outside
  addTeamModal.addEventListener("click", (event) => {
    if (event.target === addTeamModal) {
      closeTeamModal();
    }
  });

  // Submit new team
  if (submitTeamButton) {
    submitTeamButton.addEventListener("click", async () => {
      // Double-check admin permissions on click
      const currentUserRole = localStorage.getItem("userRole");
      if (currentUserRole !== "admin") {
        alert("Access denied. Admin privileges required to add teams.");
        return;
      }

      const teamLongName = document.getElementById("team-long-name").value.trim();
      const teamShortName = document.getElementById("team-short-name").value.trim();

      // Validate required fields
      if (!teamLongName) {
        showTeamModalError("Team long name is required");
        return;
      }
      if (!teamShortName) {
        showTeamModalError("Team short name is required");
        return;
      }

      try {
        // Show loading state
        submitTeamButton.disabled = true;
        submitTeamButton.textContent = "Adding...";

        const newTeam = {
          team_long_name: teamLongName,
          team_short_name: teamShortName
        };

        const response = await fetch('/api/teams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTeam)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to add team: ${response.status}`);
        }

        // Success - close modal and refresh page
        closeTeamModal();
        window.location.reload();

      } catch (err) {
        console.error("Error adding team:", err);
        showTeamModalError(err.message || "Failed to add team. Please try again.");
      } finally {
        // Only re-enable if user is still admin
        if (localStorage.getItem("userRole") === "admin") {
          submitTeamButton.disabled = false;
          submitTeamButton.textContent = "Add Team";
        }
      }
    });
  }

  function showTeamModalError(message) {
    teamModalErrorMessage.textContent = message;
    teamModalErrorMessage.style.display = "block";
  }
});