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

  async function loadPlayers(limit = 500) {
    try {
      // Ask backend for first 100 players from the SQLite DB
      const response = await fetch(`/api/players?limit=${limit}&page=1`);

      if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.status}`);
      }

      const players = await response.json();

      // Clear any existing rows
      tableBody.innerHTML = "";

      if (!Array.isArray(players) || players.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6">No players found in the database.</td>
          </tr>
        `;
        return;
      }

      players.forEach((player) => {
        const row = document.createElement("tr");

        // The backend returns rows from the SQLite "Player" table.
        // Typical columns in that table: id, player_api_id, player_name, birthday, height, weight, etc.
        // We map what we can and keep the rest simple.

        const name = player.player_name || "Unknown";

        // The Player table doesn’t actually store team/position in this DB,
        // so we just show placeholders for now.
        const team = player.team_long_name || player.team || "N/A";
        const position = player.position || "N/A";

        // Try to compute age from birthday if available
        let ageDisplay = "N/A";
        if (player.birthday) {
          const age = calculateAge(player.birthday);
          if (!isNaN(age)) {
            ageDisplay = age;
          }
        }

        // Simple status: just mark everyone as Active (you can improve this later)
        const statusText = "Active";
        const statusClass = ""; // or "inactive" if you want to mark some differently
        const statusBadge = `<span class="status-badge ${statusClass}">${statusText}</span>`;

        const actions = `
          <a href="#" class="action-link">View</a>
        `;

        row.innerHTML = `
          <td>${name}</td>
          <td>${team}</td>
          <td>${position}</td>
          <td>${ageDisplay}</td>
          <td>${statusBadge}</td>
          <td>${actions}</td>
        `;

        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error("Error loading players:", err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">Failed to load players from the server.</td>
        </tr>
      `;
    }
  }

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

  // Kick it off
  loadPlayers();
});