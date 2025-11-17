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
  const dashboardLink = document.getElementById("nav-dashboard");
  if (dashboardLink) {
    dashboardLink.classList.remove("active");
  }

  const playersLink = document.getElementById("nav-players");
  if (playersLink) {
    playersLink.classList.add("active");
  }

  // 4. --- LOAD REAL PLAYERS FROM API (SQLite) ---
  const tableBody = document.getElementById("players-table-body");
  let currentLimit = 500; // Default limit
  let currentSort = 'name-asc'; // Add this line
  let allPlayers = []; // Store all loaded players for client-side sorting

  // Load players function
  async function loadPlayers(limit = currentLimit, sort = currentSort) {
    try {
      // Show loading state
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 2rem;">
            Loading players...
          </td>
        </tr>
      `;

      // Use a very high limit for "All entries"
      const effectiveLimit = limit === 0 ? 100000 : limit;
      
      // Ask backend for players from the SQLite DB
      const response = await fetch(`/api/players?limit=${effectiveLimit}&page=1`);

      if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.status}`);
      }

      const players = await response.json();
      allPlayers = players; // Store for client-side sorting
      
      // Apply sorting
      const sortedPlayers = sortPlayers(players, sort);
      
      // Render the sorted players
      renderPlayersTable(sortedPlayers);

    } catch (err) {
      console.error("Error loading players:", err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="4">Failed to load players from the server.</td>
        </tr>
      `;
    }
  }

  // Sort players function
  function sortPlayers(players, sortType) {
    const sortedPlayers = [...players]; // Create a copy to avoid mutating original
    
    switch (sortType) {
      case 'name-asc':
        return sortedPlayers.sort((a, b) => (a.player_name || '').localeCompare(b.player_name || ''));
      
      case 'name-desc':
        return sortedPlayers.sort((a, b) => (b.player_name || '').localeCompare(a.player_name || ''));
      
      case 'age-asc':
        return sortedPlayers.sort((a, b) => {
          const ageA = calculateAge(a.birthday) || 0;
          const ageB = calculateAge(b.birthday) || 0;
          return ageA - ageB;
        });
      
      case 'age-desc':
        return sortedPlayers.sort((a, b) => {
          const ageA = calculateAge(a.birthday) || 0;
          const ageB = calculateAge(b.birthday) || 0;
          return ageB - ageA;
        });
      
      case 'height-asc':
        return sortedPlayers.sort((a, b) => (a.height || 0) - (b.height || 0));
      
      case 'height-desc':
        return sortedPlayers.sort((a, b) => (b.height || 0) - (a.height || 0));
      
      case 'weight-asc':
        return sortedPlayers.sort((a, b) => (a.weight || 0) - (b.weight || 0));
      
      case 'weight-desc':
        return sortedPlayers.sort((a, b) => (b.weight || 0) - (a.weight || 0));
      
      default:
        return sortedPlayers;
    }
  }

  // Render players table
  function renderPlayersTable(players) {
    // Clear any existing rows
    tableBody.innerHTML = "";

    if (!Array.isArray(players) || players.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4">No players found in the database.</td>
        </tr>
      `;
      return;
    }

    players.forEach((player) => {
      const row = document.createElement("tr");

      // Get player data from db
      let name = player.player_name || "Unknown";
      let weight = Math.round(player.weight * 0.453592) || "N/A";
      let height = Math.round(player.height) || "N/A";

      // Derive age from birthday
      let ageDisplay = "N/A";
      if (player.birthday) {
        const age = calculateAge(player.birthday);
        if (!isNaN(age)) {
          ageDisplay = age;
        }
      }

      row.innerHTML = `
        <td>${name}</td>
        <td>${ageDisplay}</td>
        <td>${weight} kg</td>
        <td>${height} cm</td>
      `;

      tableBody.appendChild(row);
    });
  }

  // Calculate age
  function calculateAge(birthdayString) {
    // birthday from SQLite is usually like "1987-06-24 00:00:00"
    const datePart = birthdayString.split(" ")[0]; // "1987-06-24"
    const birthDate = new Date(datePart);
    if (isNaN(birthDate.getTime())) return NaN;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // 5. --- LIMIT SELECTOR FUNCTIONALITY ---
  const limitSelect = document.getElementById("limit-select");
  const sortSelect = document.getElementById("sort-select");

  if (limitSelect) {
    limitSelect.addEventListener("change", (event) => {
      const newLimit = parseInt(event.target.value);
      currentLimit = newLimit;
      loadPlayers(newLimit, currentSort);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (event) => {
      const newSort = event.target.value;
      currentSort = newSort;
      
      // If we already have players loaded, just re-sort them
      if (allPlayers.length > 0) {
        const sortedPlayers = sortPlayers(allPlayers, newSort);
        renderPlayersTable(sortedPlayers);
      } else {
        // Otherwise reload from server
        loadPlayers(currentLimit, newSort);
      }
    });
  }

  // Load Players with default limit and sort
  loadPlayers();
});