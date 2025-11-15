// statistics.js

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
  // Deactivate other links
  document.getElementById("nav-dashboard")?.classList.remove("active");
  document.getElementById("nav-players")?.classList.remove("active");
  document.getElementById("nav-teams")?.classList.remove("active");
  document.getElementById("nav-matches")?.classList.remove("active");
  
  // Activate statistics link
  const statisticsLink = document.getElementById("nav-statistics");
  if (statisticsLink) {
    statisticsLink.classList.add("active");
  }

  // 4. --- MOCK PLAYER STATS & RENDER TABLE ---
  const mockPlayerStats = [
    { rank: 1, name: "Alex Johnson", team: "Warriors", ppg: 30.2 },
    { rank: 2, name: "Maria Garcia", team: "Lions", ppg: 28.5 },
    { rank: 3, name: "Li Chen", team: "Panthers", ppg: 25.1 },
    { rank: 4, name: "James Smith", team: "Tigers", ppg: 24.9 },
  ];

  const playerStatsBody = document.getElementById("player-stats-table-body");
  playerStatsBody.innerHTML = ""; // Clear existing content

  mockPlayerStats.forEach(player => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${player.rank}</td>
      <td>${player.name}</td>
      <td>${player.team}</td>
      <td>${player.ppg}</td>
    `;
    playerStatsBody.appendChild(row);
  });

  // 5. --- MOCK TEAM STATS & RENDER TABLE ---
  const mockTeamStats = [
    { rank: 1, name: "Warriors", wins: 57, losses: 25 },
    { rank: 2, name: "Panthers", wins: 50, losses: 32 },
    { rank: 3, name: "Lions", wins: 45, losses: 37 },
    { rank: 4, name: "Tigers", wins: 30, losses: 52 },
  ];

  const teamStatsBody = document.getElementById("team-stats-table-body");
  teamStatsBody.innerHTML = ""; // Clear existing content

  mockTeamStats.forEach(team => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${team.rank}</td>
      <td>${team.name}</td>
      <td>${team.wins}</td>
      <td>${team.losses}</td>
    `;
    teamStatsBody.appendChild(row);
  });
  
});