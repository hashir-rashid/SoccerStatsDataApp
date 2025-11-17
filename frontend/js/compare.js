// compare.js

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
    window.location.href = "/login.html";
  });

  // 3. --- SET ACTIVE NAV LINK ---
  document.getElementById("nav-dashboard")?.classList.remove("active");
  document.getElementById("nav-players")?.classList.remove("active");
  document.getElementById("nav-teams")?.classList.remove("active");
  document.getElementById("nav-matches")?.classList.remove("active");
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

  let selectedPlayer1 = null; // full JSON row from /api/players/:id
  let selectedPlayer2 = null;

  // 5. --- STAT RENDERING CONFIG ---
  const statRenderers = {
    overall_rating: (p) => p.overall_rating ?? "N/A",
    potential: (p) => p.potential ?? "N/A",

    height: (p) => {
      if (!p.height) return "N/A";
      // DB has height in cm-ish (e.g. 182.88). Round nicely.
      return `${Math.round(p.height)} cm`;
    },

    weight: (p) => {
      if (!p.weight) return "N/A";
      // DB weight is in lbs in the Kaggle dataset; convert to kg approx.
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

  // Get a small list of players (id + name etc.) for autocomplete
  async function fetchPlayerSuggestions(term) {
    if (!term || term.length < 2) return [];

    try {
      const url = `/api/players?search=${encodeURIComponent(term)}&limit=10`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch player suggestions");
      const data = await res.json();
      // /api/players returns rows from Player table; that's fine for suggestions
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // Get full player + latest attributes JSON
  async function fetchPlayerDetails(id) {
    try {
      const res = await fetch(`/api/players/${id}`);
      if (!res.ok) throw new Error("Failed to fetch player details");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // 7. --- AUTOCOMPLETE RENDERING ---

  function renderSuggestions(side, players) {
    const inputEl = side === "player1" ? player1Input : player2Input;
    const suggestionsEl =
        side === "player1" ? player1Suggestions : player2Suggestions;

    suggestionsEl.innerHTML = "";
    if (!players.length) return;

    players.forEach((player) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.textContent = player.player_name;

      item.addEventListener("click", async () => {
        inputEl.value = player.player_name;
        suggestionsEl.innerHTML = "";

        const details = await fetchPlayerDetails(player.id);
        if (!details) return;

        if (side === "player1") {
          // prevent comparing exact same player on both sides
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
    const suggestionsEl =
        side === "player1" ? player1Suggestions : player2Suggestions;

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

    // Close suggestions when input loses focus (small delay so clicks still work)
    inputEl.addEventListener("blur", () => {
      setTimeout(() => {
        suggestionsEl.innerHTML = "";
      }, 200);
    });
  }

  // 8. --- UPDATE TABLE ---

  function updateComparison() {
    if (!selectedPlayer1 || !selectedPlayer2) {
      // If one side is empty, just show "..." everywhere
      statKeys.forEach((stat) => {
        const p1Cell = document.getElementById(`p1-${stat}`);
        const p2Cell = document.getElementById(`p2-${stat}`);
        if (p1Cell) p1Cell.textContent = selectedPlayer1 ? statRenderers[stat](selectedPlayer1) : "...";
        if (p2Cell) p2Cell.textContent = selectedPlayer2 ? statRenderers[stat](selectedPlayer2) : "...";
      });
      return;
    }

    statKeys.forEach((stat) => {
      const p1Cell = document.getElementById(`p1-${stat}`);
      const p2Cell = document.getElementById(`p2-${stat}`);

      if (p1Cell) p1Cell.textContent = statRenderers[stat](selectedPlayer1);
      if (p2Cell) p2Cell.textContent = statRenderers[stat](selectedPlayer2);
    });
  }

  // 9. --- DEFAULT PLAYERS (Messi vs Ronaldo) ---

  async function loadDefaultPlayers() {
    try {
      const [messiList, ronaldoList] = await Promise.all([
        fetchPlayerSuggestions("Lionel Messi"),
        fetchPlayerSuggestions("Cristiano Ronaldo"),
      ]);

      if (messiList[0]) {
        player1Input.value = messiList[0].player_name;
        selectedPlayer1 = await fetchPlayerDetails(messiList[0].id);
      }

      if (ronaldoList[0]) {
        player2Input.value = ronaldoList[0].player_name;
        selectedPlayer2 = await fetchPlayerDetails(ronaldoList[0].id);
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
