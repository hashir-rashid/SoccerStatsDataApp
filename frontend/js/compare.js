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
    window.location.href = "/login.html";
  });
 
  // 3. --- SET ACTIVE NAV LINK ---
  // Deactivate other links
  document.getElementById("nav-dashboard")?.classList.remove("active");
  document.getElementById("nav-players")?.classList.remove("active");
  document.getElementById("nav-teams")?.classList.remove("active");
  document.getElementById("nav-matches")?.classList.remove("active");
  document.getElementById("nav-statistics")?.classList.remove("active");
 
  // Activate compare link
  const compareLink = document.getElementById("nav-compare");
  if (compareLink) {
    compareLink.classList.add("active");
  }

  // 4. --- MOCK PLAYER DATABASE ---
  // This data is based on your Phase 2 Report and mock files
  // In Phase 3, you will replace this with a single fetch() call
  const mockPlayerDatabase = [
    {
      id: 1,
      player_name: "Aaron Appindangoye",
      height: 182.88,
      weight: 187,
      overall_rating: 67,
      potential: 71,
      finishing: 44,
      short_passing: 61,
      dribbling: 51,
      sprint_speed: 64,
      acceleration: 58,
      stamina: 54,
      strength: 76,
      gk_diving: 6,
      gk_handling: 11,
      gk_kicking: 10,
    },
    {
      id: 2,
      player_name: "Aaron Cresswell",
      height: 170.18,
      weight: 146,
      overall_rating: 74,
      potential: 76,
      finishing: 53,
      short_passing: 71,
      dribbling: 73,
      sprint_speed: 78,
      acceleration: 79,
      stamina: 79,
      strength: 56,
      gk_diving: 14,
      gk_handling: 7,
      gk_kicking: 13,
    },
    {
      id: 3,
      player_name: "Aaron Doran",
      height: 170.18,
      weight: 163,
      overall_rating: 65,
      potential: 67,
      finishing: 58,
      short_passing: 66,
      dribbling: 68,
      sprint_speed: 74,
      acceleration: 77,
      stamina: 66,
      strength: 71,
      gk_diving: 13,
      gk_handling: 11,
      gk_kicking: 15,
    },
    {
      id: 4,
      player_name: "Aaron Galindo",
      height: 182.88,
      weight: 198,
      overall_rating: 69,
      potential: 69,
      finishing: 44,
      short_passing: 61,
      dribbling: 51,
      sprint_speed: 34,
      acceleration: 33,
      stamina: 49,
      strength: 90,
      gk_diving: 10,
      gk_handling: 10,
      gk_kicking: 23,
    },
    {
      id: 5,
      player_name: "Alex Johnson",
      height: 190.5,
      weight: 200,
      overall_rating: 88,
      potential: 92,
      finishing: 90,
      short_passing: 85,
      dribbling: 88,
      sprint_speed: 85,
      acceleration: 87,
      stamina: 82,
      strength: 78,
      gk_diving: 8,
      gk_handling: 8,
      gk_kicking: 12,
    },
    {
      id: 6,
      player_name: "Maria Garcia",
      height: 165.0,
      weight: 150,
      overall_rating: 85,
      potential: 90,
      finishing: 82,
      short_passing: 88,
      dribbling: 90,
      sprint_speed: 88,
      acceleration: 90,
      stamina: 85,
      strength: 65,
      gk_diving: 10,
      gk_handling: 10,
      gk_kicking: 10,
    },
  ];

  // 5. --- GET ELEMENTS ---
  const player1Select = document.getElementById("player1-select");
  const player2Select = document.getElementById("player2-select");

  // 6. --- POPULATE DROPDOWNS ---
  mockPlayerDatabase.forEach(player => {
    // Add to Player 1 list
    const option1 = document.createElement("option");
    option1.value = player.id;
    option1.textContent = player.player_name;
    player1Select.appendChild(option1);

    // Add to Player 2 list
    const option2 = document.createElement("option");
    option2.value = player.id;
    option2.textContent = player.player_name;
    player2Select.appendChild(option2);
  });

  // 7. --- SET DEFAULTS ---
  player1Select.value = mockPlayerDatabase[0].id; // Aaron Appindangoye
  player2Select.value = mockPlayerDatabase[1].id; // Aaron Cresswell

  // 8. --- COMPARISON LOGIC ---

  // List of all stat IDs to update
  const statIds = [
    "overall_rating", "potential", "height", "weight",
    "finishing", "short_passing", "dribbling",
    "sprint_speed", "acceleration", "stamina", "strength",
    "gk_diving", "gk_handling", "gk_kicking"
  ];

  function updateComparison() {
    const p1Id = player1Select.value;
    const p2Id = player2Select.value;

    const p1Data = mockPlayerDatabase.find(p => p.id == p1Id);
    const p2Data = mockPlayerDatabase.find(p => p.id == p2Id);

    if (!p1Data || !p2Data) return;

    // Loop and update all stats for Player 1
    statIds.forEach(stat => {
      const el = document.getElementById(`p1-${stat}`);
      if (el) el.textContent = p1Data[stat] ?? "N/A";
    });

    // Loop and update all stats for Player 2
    statIds.forEach(stat => {
      const el = document.getElementById(`p2-${stat}`);
      if (el) el.textContent = p2Data[stat] ?? "N/A";
    });
  }

  // This function enforces the "no same player" rule
  function syncDropdowns(changedSelect) {
    const p1Id = player1Select.value;
    const p2Id = player2Select.value;

    if (changedSelect === "player1") {
      // Disable the selected P1 option in the P2 list
      Array.from(player2Select.options).forEach(option => {
        option.disabled = (option.value === p1Id);
      });
    } else if (changedSelect === "player2") {
      // Disable the selected P2 option in the P1 list
      Array.from(player1Select.options).forEach(option => {
        option.disabled = (option.value === p2Id);
      });
    }
  }

  // 9. --- ADD EVENT LISTENERS ---
  player1Select.addEventListener("change", () => {
    syncDropdowns("player1");
    updateComparison();
  });

  player2Select.addEventListener("change", () => {
    syncDropdowns("player2");
    updateComparison();
  });

  // 10. --- INITIAL LOAD ---
  syncDropdowns("player1");
  syncDropdowns("player2");
  updateComparison();

});