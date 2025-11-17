let comparisonChart = null;

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
  document.getElementById("nav-teams")?.classList.remove("active");
  document.getElementById("nav-statistics")?.classList.remove("active");

  const compareLink = document.getElementById("nav-compare");
  if (compareLink) {
    compareLink.classList.add("active");
  }

  // 4. --- PLAYER SEARCH ELEMENTS ---
  const player1Input = document.getElementById("player1-search");
  const player2Input = document.getElementById("player2-search");
  const player1Suggestions = document.getElementById("player1-suggestions");
  const player2Suggestions = document.getElementById("player2-suggestions");

  let selectedPlayer1 = null;
  let selectedPlayer2 = null;

  // 5. --- STAT RENDERING CONFIG ---
  const statRenderers = {
    overall_rating: (p) => p.overall_rating ?? "N/A",
    potential: (p) => p.potential ?? "N/A",

    height: (p) => {
      if (!p.height) return "N/A";
      return `${Math.round(p.height)} cm`;
    },

    weight: (p) => {
      if (!p.weight) return "N/A";
      const kg = Math.round(p.weight * 0.453592);
      return `${kg} kg`;
    },

    finishing: (p) => p.finishing ?? "N/A",
    short_passing: (p) => p.short_passing ?? "N/A",
    dribbling: (p) => p.dribbling ?? "N/A",

    sprint_speed: (p) => p.sprint_speed ?? "N/A",
    acceleration: (p) => p.acceleration ?? "N/A",
    stamina: (p) => p.stamina ?? "N/A",
    strength: (p) => p.strength ?? "N/A",

    gk_diving: (p) => p.gk_diving ?? "N/A",
    gk_handling: (p) => p.gk_handling ?? "N/A",
    gk_kicking: (p) => p.gk_kicking ?? "N/A",
  };

  const statKeys = Object.keys(statRenderers);

  // 6. --- API HELPERS ---

  async function fetchPlayerSuggestions(term) {
    if (!term || term.length < 2) return [];

    try {
      const url = `/api/players?search=${encodeURIComponent(term)}&limit=10`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch player suggestions");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function fetchPlayerDetails(id) {
    try {
      const res = await fetch(`/api/players/${id}`);
      if (!res.ok) throw new Error("Failed to fetch player details");
      const data = await res.json();
      console.log('Player details fetched:', data); // Debug log
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // 7. --- AUTOCOMPLETE RENDERING ---

  function renderSuggestions(side, players) {
    const inputEl = side === "player1" ? player1Input : player2Input;
    const suggestionsEl = side === "player1" ? player1Suggestions : player2Suggestions;

    suggestionsEl.innerHTML = "";
    if (!players.length) return;

    players.forEach((player) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.textContent = player.player_name;

      item.addEventListener("click", async () => {
        console.log('Clicked player:', player); // Debug log
        
        inputEl.value = player.player_name;
        suggestionsEl.innerHTML = "";

        const details = await fetchPlayerDetails(player.id);
        console.log('Player details after click:', details); // Debug log
        
        if (!details) {
          console.error('No details found for player:', player.id);
          return;
        }

        if (side === "player1") {
          if (selectedPlayer2 && selectedPlayer2.id === details.id) {
            alert("That player is already selected on the right side.");
            return;
          }
          selectedPlayer1 = details;
        } else {
          if (selectedPlayer1 && selectedPlayer1.id === details.id) {
            alert("That player is already selected on the left side.");
            return;
          }
          selectedPlayer2 = details;
        }

        updateComparison();
        updateChart(selectedPlayer1, selectedPlayer2);
      });

      suggestionsEl.appendChild(item);
    });
  }

  function setupSearchInput(side) {
    const inputEl = side === "player1" ? player1Input : player2Input;
    const suggestionsEl = side === "player1" ? player1Suggestions : player2Suggestions;

    let timeoutId = null;

    inputEl.addEventListener("input", () => {
      const term = inputEl.value.trim();
      clearTimeout(timeoutId);

      if (term.length < 2) {
        suggestionsEl.innerHTML = "";
        return;
      }

      timeoutId = setTimeout(async () => {
        const players = await fetchPlayerSuggestions(term);
        renderSuggestions(side, players);
      }, 250);
    });

    // Close suggestions when input loses focus
    inputEl.addEventListener("blur", () => {
      setTimeout(() => {
        suggestionsEl.innerHTML = "";
      }, 200);
    });

    // Allow pressing Enter to select first suggestion
    inputEl.addEventListener("keydown", async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const firstSuggestion = suggestionsEl.querySelector('.suggestion-item');
        if (firstSuggestion) {
          firstSuggestion.click();
        }
      }
    });
  }

  // 8. --- UPDATE TABLE ---
  function updateComparison() {
    console.log('Updating comparison:', { selectedPlayer1, selectedPlayer2 }); // Debug log
    
    statKeys.forEach((stat) => {
      const p1Cell = document.getElementById(`p1-${stat}`);
      const p2Cell = document.getElementById(`p2-${stat}`);

      if (p1Cell) {
        p1Cell.textContent = selectedPlayer1 ? statRenderers[stat](selectedPlayer1) : "...";
        // Add visual comparison (highlight higher values)
        if (selectedPlayer1 && selectedPlayer2) {
          const val1 = parseFloat(selectedPlayer1[stat]) || 0;
          const val2 = parseFloat(selectedPlayer2[stat]) || 0;
          p1Cell.className = val1 > val2 ? 'higher-value' : (val1 < val2 ? 'lower-value' : '');
        } else {
          p1Cell.className = '';
        }
      }

      if (p2Cell) {
        p2Cell.textContent = selectedPlayer2 ? statRenderers[stat](selectedPlayer2) : "...";
        // Add visual comparison (highlight higher values)
        if (selectedPlayer1 && selectedPlayer2) {
          const val1 = parseFloat(selectedPlayer1[stat]) || 0;
          const val2 = parseFloat(selectedPlayer2[stat]) || 0;
          p2Cell.className = val2 > val1 ? 'higher-value' : (val2 < val1 ? 'lower-value' : '');
        } else {
          p2Cell.className = '';
        }
      }
    });
  }

  // 9. --- DEFAULT PLAYERS ---
  async function loadDefaultPlayers() {
    try {
      // Try to find some players in the database
      const [popularPlayers] = await Promise.all([
        fetchPlayerSuggestions("a") // Get first 10 players
      ]);

      if (popularPlayers.length >= 2) {
        // Use first two players as defaults
        player1Input.value = popularPlayers[0].player_name;
        selectedPlayer1 = await fetchPlayerDetails(popularPlayers[0].id);
        
        player2Input.value = popularPlayers[1].player_name;
        selectedPlayer2 = await fetchPlayerDetails(popularPlayers[1].id);
      }

      updateComparison();
    } catch (err) {
      console.error("Error loading default players:", err);
    }
  }

  // 10 --- CHART ---
  function updateChart(p1, p2) {
    if (p1 == null || p2 == null) {return;}

    const ctx = document.getElementById('comparisonChart').getContext('2d');

    if (comparisonChart) {
      comparisonChart.destroy();
    }

    comparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Overall', 'Finishing', 'Passing', 'Dribbling', 'Speed', 'Stamina', 'Strength'],
        datasets: [
          {
            label: p1.player_name,
            data: [
              p1.overall_rating, p1.finishing, p1.short_passing, 
              p1.dribbling, p1.sprint_speed, p1.stamina, p1.strength
            ],
            backgroundColor: '#212529',
            borderRadius: 4,
            barPercentage: 0.6,
          },
          {
            label: p2.player_name,
            data: [
              p2.overall_rating, p2.finishing, p2.short_passing, 
              p2.dribbling, p2.sprint_speed, p2.stamina, p2.strength
            ],
            backgroundColor: '#e9ecef',
            borderRadius: 4,
            barPercentage: 0.6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  // 12. --- EXPORT FUNCTIONALITY ---
  const exportCsvButton = document.getElementById("export-csv");
  const exportPdfButton = document.getElementById("export-pdf");

  if (exportCsvButton) {
    exportCsvButton.addEventListener("click", exportComparisonToCSV);
  }

  if (exportPdfButton) {
    exportPdfButton.addEventListener("click", exportComparisonToPDF);
  }

  function exportComparisonToCSV() {
    if (!selectedPlayer1 || !selectedPlayer2) {
      alert("Please select both players to export comparison");
      return;
    }

    // Create CSV content
    const headers = ["Statistic", selectedPlayer1.player_name, selectedPlayer2.player_name];
    const rows = [
      ["Overall Rating", selectedPlayer1.overall_rating || "N/A", selectedPlayer2.overall_rating || "N/A"],
      ["Potential", selectedPlayer1.potential || "N/A", selectedPlayer2.potential || "N/A"],
      ["Height", `${Math.round(selectedPlayer1.height) || "N/A"} cm`, `${Math.round(selectedPlayer2.height) || "N/A"} cm`],
      ["Weight", `${Math.round((selectedPlayer1.weight || 0) * 0.453592) || "N/A"} kg`, `${Math.round((selectedPlayer2.weight || 0) * 0.453592) || "N/A"} kg`],
      [],
      ["Finishing", selectedPlayer1.finishing || "N/A", selectedPlayer2.finishing || "N/A"],
      ["Short Passing", selectedPlayer1.short_passing || "N/A", selectedPlayer2.short_passing || "N/A"],
      ["Dribbling", selectedPlayer1.dribbling || "N/A", selectedPlayer2.dribbling || "N/A"],
      [],
      ["Sprint Speed", selectedPlayer1.sprint_speed || "N/A", selectedPlayer2.sprint_speed || "N/A"],
      ["Acceleration", selectedPlayer1.acceleration || "N/A", selectedPlayer2.acceleration || "N/A"],
      ["Stamina", selectedPlayer1.stamina || "N/A", selectedPlayer2.stamina || "N/A"],
      ["Strength", selectedPlayer1.strength || "N/A", selectedPlayer2.strength || "N/A"],
      [],
      ["GK Diving", selectedPlayer1.gk_diving || "N/A", selectedPlayer2.gk_diving || "N/A"],
      ["GK Handling", selectedPlayer1.gk_handling || "N/A", selectedPlayer2.gk_handling || "N/A"],
      ["GK Kicking", selectedPlayer1.gk_kicking || "N/A", selectedPlayer2.gk_kicking || "N/A"]
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `player_comparison_${selectedPlayer1.player_name}_vs_${selectedPlayer2.player_name}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportComparisonToPDF() {
    if (!selectedPlayer1 || !selectedPlayer2) {
      alert("Please select both players to export comparison");
      return;
    }

    // Create a simple PDF using window.print() with custom styles
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Player Comparison Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .comparison-header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 20px; 
            background: #f5f5f5; 
            padding: 15px; 
            border-radius: 5px;
          }
          .player-card { text-align: center; flex: 1; }
          .player-name { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
          .vs { align-self: center; font-weight: bold; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .stat-category { background-color: #e9ecef; font-weight: bold; }
          .higher-value { background-color: #d4edda; }
          .export-info { margin-bottom: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <h1>Player Comparison Report</h1>
        <div class="export-info">
          <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="comparison-header">
          <div class="player-card">
            <div class="player-name">${selectedPlayer1.player_name}</div>
          </div>
          <div class="vs">VS</div>
          <div class="player-card">
            <div class="player-name">${selectedPlayer2.player_name}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Statistic</th>
              <th>${selectedPlayer1.player_name}</th>
              <th>${selectedPlayer2.player_name}</th>
            </tr>
          </thead>
          <tbody>
            <tr class="stat-category">
              <td colspan="3">General</td>
            </tr>
            ${createComparisonRow("Overall Rating", selectedPlayer1.overall_rating, selectedPlayer2.overall_rating)}
            ${createComparisonRow("Potential", selectedPlayer1.potential, selectedPlayer2.potential)}
            ${createComparisonRow("Height", selectedPlayer1.height ? Math.round(selectedPlayer1.height) + " cm" : "N/A", selectedPlayer2.height ? Math.round(selectedPlayer2.height) + " cm" : "N/A")}
            ${createComparisonRow("Weight", selectedPlayer1.weight ? Math.round(selectedPlayer1.weight * 0.453592) + " kg" : "N/A", selectedPlayer2.weight ? Math.round(selectedPlayer2.weight * 0.453592) + " kg" : "N/A")}
            
            <tr class="stat-category">
              <td colspan="3">Attacking</td>
            </tr>
            ${createComparisonRow("Finishing", selectedPlayer1.finishing, selectedPlayer2.finishing)}
            ${createComparisonRow("Short Passing", selectedPlayer1.short_passing, selectedPlayer2.short_passing)}
            ${createComparisonRow("Dribbling", selectedPlayer1.dribbling, selectedPlayer2.dribbling)}
            
            <tr class="stat-category">
              <td colspan="3">Physical</td>
            </tr>
            ${createComparisonRow("Sprint Speed", selectedPlayer1.sprint_speed, selectedPlayer2.sprint_speed)}
            ${createComparisonRow("Acceleration", selectedPlayer1.acceleration, selectedPlayer2.acceleration)}
            ${createComparisonRow("Stamina", selectedPlayer1.stamina, selectedPlayer2.stamina)}
            ${createComparisonRow("Strength", selectedPlayer1.strength, selectedPlayer2.strength)}
            
            <tr class="stat-category">
              <td colspan="3">Goalkeeping</td>
            </tr>
            ${createComparisonRow("GK Diving", selectedPlayer1.gk_diving, selectedPlayer2.gk_diving)}
            ${createComparisonRow("GK Handling", selectedPlayer1.gk_handling, selectedPlayer2.gk_handling)}
            ${createComparisonRow("GK Kicking", selectedPlayer1.gk_kicking, selectedPlayer2.gk_kicking)}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }

  function createComparisonRow(statName, value1, value2) {
    const val1 = parseFloat(value1) || 0;
    const val2 = parseFloat(value2) || 0;
    const p1Class = val1 > val2 ? 'higher-value' : '';
    const p2Class = val2 > val1 ? 'higher-value' : '';
    
    return `
      <tr>
        <td>${statName}</td>
        <td class="${p1Class}">${value1 || "N/A"}</td>
        <td class="${p2Class}">${value2 || "N/A"}</td>
      </tr>
    `;
  }

  // 12. --- INIT ---
  setupSearchInput("player1");
  setupSearchInput("player2");
  loadDefaultPlayers();
});