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

  // 10. --- INIT ---

  setupSearchInput("player1");
  setupSearchInput("player2");
  loadDefaultPlayers();
});