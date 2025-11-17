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

  // 6. --- EXPORT FUNCTIONALITY ---
  const exportCsvButton = document.getElementById("export-csv");
  const exportPdfButton = document.getElementById("export-pdf");

  if (exportCsvButton) {
    exportCsvButton.addEventListener("click", exportToCSV);
  }

  if (exportPdfButton) {
    exportPdfButton.addEventListener("click", exportToPDF);
  }

  // CSV function
  function exportToCSV() {
    if (allPlayers.length === 0) {
      alert("No data to export");
      return;
    }

    // Get the currently displayed data (sorted and limited)
    let playersToExport = allPlayers;
    if (currentLimit !== -1) {
      playersToExport = allPlayers.slice(0, currentLimit);
    }
    const sortedPlayers = sortPlayers(playersToExport, currentSort);

    // Create CSV content
    const headers = ["Player Name", "Age", "Weight (kg)", "Height (cm)"];
    const csvContent = [
      headers.join(","),
      ...sortedPlayers.map(player => {
        const age = calculateAge(player.birthday) || "N/A";
        const weight = Math.round(player.weight * 0.453592) || "N/A";
        const height = Math.round(player.height) || "N/A";
        return [
          `"${(player.player_name || "Unknown").replace(/"/g, '""')}"`,
          age,
          weight,
          height
        ].join(",");
      })
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `players_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // PDF function
  function exportToPDF() {
    if (allPlayers.length === 0) {
      alert("No data to export");
      return;
    }

    // Get the currently displayed data (sorted and limited)
    let playersToExport = allPlayers;
    if (currentLimit !== -1) {
      playersToExport = allPlayers.slice(0, currentLimit);
    }
    const sortedPlayers = sortPlayers(playersToExport, currentSort);

    // Create a simple PDF using window.print() with custom styles
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Players Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .export-info { margin-bottom: 20px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Players Export</h1>
        <div class="export-info">
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total players: ${sortedPlayers.length}</p>
          <p>Sort: ${getSortDisplayName(currentSort)}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Age</th>
              <th>Weight (kg)</th>
              <th>Height (cm)</th>
            </tr>
          </thead>
          <tbody>
            ${sortedPlayers.map(player => {
              const age = calculateAge(player.birthday) || "N/A";
              const weight = Math.round(player.weight * 0.453592) || "N/A";
              const height = Math.round(player.height) || "N/A";
              return `
                <tr>
                  <td>${player.player_name || "Unknown"}</td>
                  <td>${age}</td>
                  <td>${weight}</td>
                  <td>${height}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }

  // Get Display Name for the sort type
  function getSortDisplayName(sortType) {
    const sortNames = {
      'name-asc': 'Name A-Z',
      'name-desc': 'Name Z-A',
      'age-asc': 'Age (Low to High)',
      'age-desc': 'Age (High to Low)',
      'height-asc': 'Height (Low to High)',
      'height-desc': 'Height (High to Low)',
      'weight-asc': 'Weight (Low to High)',
      'weight-desc': 'Weight (High to Low)'
    };
    return sortNames[sortType] || sortType;
  }

  // Load Players with default limit and sort
  loadPlayers();
});