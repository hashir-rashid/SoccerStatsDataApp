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

  // 4. --- MOCK PLAYER DATABASE ---
  const mockPlayerDatabase = [
    {
      id: 1, player_name: "Lionel Messi",
      overall_rating: 93, potential: 93, height: "170 cm", weight: "72 kg",
      finishing: 95, short_passing: 91, dribbling: 96,
      sprint_speed: 80, acceleration: 91, stamina: 72, strength: 69,
      gk_diving: 6, gk_handling: 11, gk_kicking: 15
    },
    {
      id: 2, player_name: "Cristiano Ronaldo",
      overall_rating: 92, potential: 92, height: "187 cm", weight: "83 kg",
      finishing: 94, short_passing: 82, dribbling: 88,
      sprint_speed: 89, acceleration: 87, stamina: 84, strength: 78,
      gk_diving: 7, gk_handling: 11, gk_kicking: 15
    },
    {
      id: 3, player_name: "Kylian Mbappé",
      overall_rating: 91, potential: 95, height: "178 cm", weight: "73 kg",
      finishing: 89, short_passing: 80, dribbling: 92,
      sprint_speed: 97, acceleration: 97, stamina: 88, strength: 76,
      gk_diving: 13, gk_handling: 5, gk_kicking: 7
    },
    {
      id: 4, player_name: "Kevin De Bruyne",
      overall_rating: 91, potential: 91, height: "181 cm", weight: "70 kg",
      finishing: 82, short_passing: 94, dribbling: 88,
      sprint_speed: 76, acceleration: 78, stamina: 89, strength: 74,
      gk_diving: 15, gk_handling: 13, gk_kicking: 5
    },
    {
      id: 5, player_name: "Neymar Jr",
      overall_rating: 91, potential: 91, height: "175 cm", weight: "68 kg",
      finishing: 87, short_passing: 87, dribbling: 95,
      sprint_speed: 89, acceleration: 93, stamina: 81, strength: 50,
      gk_diving: 9, gk_handling: 9, gk_kicking: 15
    },
    {
      id: 6, player_name: "Robert Lewandowski",
      overall_rating: 92, potential: 92, height: "185 cm", weight: "81 kg",
      finishing: 95, short_passing: 85, dribbling: 86,
      sprint_speed: 78, acceleration: 77, stamina: 76, strength: 86,
      gk_diving: 15, gk_handling: 6, gk_kicking: 12
    },
    {
      id: 7, player_name: "Mohamed Salah",
      overall_rating: 90, potential: 90, height: "175 cm", weight: "71 kg",
      finishing: 91, short_passing: 84, dribbling: 90,
      sprint_speed: 91, acceleration: 93, stamina: 85, strength: 75,
      gk_diving: 14, gk_handling: 14, gk_kicking: 9
    },
    {
      id: 8, player_name: "Virgil van Dijk",
      overall_rating: 90, potential: 91, height: "193 cm", weight: "92 kg",
      finishing: 60, short_passing: 79, dribbling: 72,
      sprint_speed: 88, acceleration: 74, stamina: 75, strength: 92,
      gk_diving: 13, gk_handling: 10, gk_kicking: 13
    },
    {
      id: 9, player_name: "Erling Haaland",
      overall_rating: 89, potential: 94, height: "195 cm", weight: "94 kg",
      finishing: 94, short_passing: 77, dribbling: 80,
      sprint_speed: 94, acceleration: 88, stamina: 82, strength: 93,
      gk_diving: 7, gk_handling: 14, gk_kicking: 13
    },
    {
      id: 10, player_name: "Thibaut Courtois",
      overall_rating: 89, potential: 90, height: "199 cm", weight: "96 kg",
      finishing: 14, short_passing: 32, dribbling: 13,
      sprint_speed: 46, acceleration: 42, stamina: 38, strength: 70,
      gk_diving: 84, gk_handling: 89, gk_kicking: 74
    },
    {
      id: 11, player_name: "Manuel Neuer",
      overall_rating: 90, potential: 90, height: "193 cm", weight: "93 kg",
      finishing: 13, short_passing: 60, dribbling: 30,
      sprint_speed: 54, acceleration: 51, stamina: 43, strength: 80,
      gk_diving: 88, gk_handling: 88, gk_kicking: 91
    },
    {
      id: 12, player_name: "Harry Kane",
      overall_rating: 89, potential: 89, height: "188 cm", weight: "89 kg",
      finishing: 93, short_passing: 85, dribbling: 82,
      sprint_speed: 69, acceleration: 67, stamina: 83, strength: 84,
      gk_diving: 8, gk_handling: 10, gk_kicking: 11
    },
    {
      id: 13, player_name: "Luka Modric",
      overall_rating: 88, potential: 88, height: "172 cm", weight: "66 kg",
      finishing: 76, short_passing: 92, dribbling: 88,
      sprint_speed: 73, acceleration: 76, stamina: 82, strength: 58,
      gk_diving: 13, gk_handling: 9, gk_kicking: 7
    },
    {
      id: 14, player_name: "N'Golo Kanté",
      overall_rating: 88, potential: 88, height: "168 cm", weight: "70 kg",
      finishing: 65, short_passing: 86, dribbling: 81,
      sprint_speed: 77, acceleration: 82, stamina: 97, strength: 72,
      gk_diving: 15, gk_handling: 12, gk_kicking: 10
    },
    {
      id: 15, player_name: "Sadio Mané",
      overall_rating: 89, potential: 89, height: "175 cm", weight: "69 kg",
      finishing: 86, short_passing: 84, dribbling: 89,
      sprint_speed: 90, acceleration: 91, stamina: 88, strength: 70,
      gk_diving: 10, gk_handling: 10, gk_kicking: 15
    },
    {
      id: 16, player_name: "Karim Benzema",
      overall_rating: 91, potential: 91, height: "185 cm", weight: "81 kg",
      finishing: 90, short_passing: 87, dribbling: 87,
      sprint_speed: 78, acceleration: 77, stamina: 82, strength: 80,
      gk_diving: 13, gk_handling: 11, gk_kicking: 5
    },
    {
      id: 17, player_name: "Joshua Kimmich",
      overall_rating: 89, potential: 90, height: "177 cm", weight: "75 kg",
      finishing: 68, short_passing: 87, dribbling: 83,
      sprint_speed: 65, acceleration: 77, stamina: 94, strength: 68,
      gk_diving: 8, gk_handling: 15, gk_kicking: 15
    },
    {
      id: 18, player_name: "Son Heung-min",
      overall_rating: 89, potential: 89, height: "183 cm", weight: "78 kg",
      finishing: 89, short_passing: 84, dribbling: 87,
      sprint_speed: 90, acceleration: 86, stamina: 88, strength: 64,
      gk_diving: 11, gk_handling: 13, gk_kicking: 13
    },
    {
      id: 19, player_name: "Alisson",
      overall_rating: 89, potential: 90, height: "191 cm", weight: "91 kg",
      finishing: 20, short_passing: 60, dribbling: 22,
      sprint_speed: 40, acceleration: 45, stamina: 32, strength: 78,
      gk_diving: 86, gk_handling: 85, gk_kicking: 85
    },
    {
      id: 20, player_name: "Casemiro",
      overall_rating: 89, potential: 89, height: "185 cm", weight: "84 kg",
      finishing: 65, short_passing: 84, dribbling: 73,
      sprint_speed: 62, acceleration: 60, stamina: 90, strength: 90,
      gk_diving: 13, gk_handling: 14, gk_kicking: 16
    },
    {
      id: 21, player_name: "Ederson",
      overall_rating: 89, potential: 91, height: "188 cm", weight: "86 kg",
      finishing: 15, short_passing: 61, dribbling: 23,
      sprint_speed: 50, acceleration: 53, stamina: 40, strength: 78,
      gk_diving: 87, gk_handling: 82, gk_kicking: 93
    },
    {
      id: 22, player_name: "Raheem Sterling",
      overall_rating: 87, potential: 88, height: "170 cm", weight: "69 kg",
      finishing: 85, short_passing: 80, dribbling: 88,
      sprint_speed: 90, acceleration: 94, stamina: 79, strength: 65,
      gk_diving: 15, gk_handling: 12, gk_kicking: 12
    },
    {
      id: 23, player_name: "Toni Kroos",
      overall_rating: 88, potential: 88, height: "183 cm", weight: "76 kg",
      finishing: 80, short_passing: 93, dribbling: 80,
      sprint_speed: 52, acceleration: 55, stamina: 74, strength: 70,
      gk_diving: 10, gk_handling: 11, gk_kicking: 13
    },
    {
      id: 24, player_name: "Ruben Dias",
      overall_rating: 88, potential: 91, height: "187 cm", weight: "82 kg",
      finishing: 28, short_passing: 80, dribbling: 68,
      sprint_speed: 68, acceleration: 58, stamina: 85, strength: 89,
      gk_diving: 15, gk_handling: 8, gk_kicking: 15
    },
    {
      id: 25, player_name: "Trent Alexander-Arnold",
      overall_rating: 87, potential: 90, height: "175 cm", weight: "69 kg",
      finishing: 60, short_passing: 88, dribbling: 79,
      sprint_speed: 79, acceleration: 77, stamina: 88, strength: 63,
      gk_diving: 14, gk_handling: 15, gk_kicking: 14
    }
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
  player1Select.value = mockPlayerDatabase[0].id; // Messi
  player2Select.value = mockPlayerDatabase[1].id; // Ronaldo

  // 8. --- CHART VARIABLE ---
  let comparisonChart = null;

  // 9. --- COMPARISON LOGIC ---
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

    // Update Chart
    updateChart(p1Data, p2Data);
  }

  // 10. --- CHART FUNCTION ---
  function updateChart(p1, p2) {
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

  // 11. --- ADD EVENT LISTENERS ---
  player1Select.addEventListener("change", () => {
    syncDropdowns("player1");
    updateComparison();
  });

  player2Select.addEventListener("change", () => {
    syncDropdowns("player2");
    updateComparison();
  });

  // 12. --- INITIAL LOAD ---
  syncDropdowns("player1");
  syncDropdowns("player2");
  updateComparison();

});
