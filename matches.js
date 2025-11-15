// matches.js (Corrected)

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
  
  // Activate matches link
  const matchesLink = document.getElementById("nav-matches");
  if (matchesLink) {
    matchesLink.classList.add("active");
  }

  // 4. --- MOCK MATCH DATA & RENDER CARDS ---
  const mockMatches = [
    { 
      team1: { name: "Warriors", record: "57-25" },
      team2: { name: "Lions", record: "45-37" },
      score1: 102,
      score2: 98,
      status: "Final" 
    },
    { 
      team1: { name: "Tigers", record: "30-52" },
      team2: { name: "Panthers", record: "50-32" }, // <-- TYPO WAS HERE
      score1: 88,
      score2: 91,
      status: "Live" 
    },
    { 
      team1: { name: "Lions", record: "45-37" },
      team2: { name: "Tigers", record: "30-52" },
      status: "Upcoming",
      time: "Fri, Nov 14 @ 8:00 PM"
    },
  ];

  const listContainer = document.getElementById("match-list-container");
  listContainer.innerHTML = ""; // Clear existing content

  mockMatches.forEach(match => {
    const card = document.createElement("div");
    card.className = "match-card";
    
    let matchInfoHtml = "";
    
    if (match.status === "Final") {
      card.classList.add("past");
      
      // Determine winner
      const score1Class = match.score1 > match.score2 ? "team-score-winner" : "";
      const score2Class = match.score2 > match.score1 ? "team-score-winner" : "";

      matchInfoHtml = `
        <div class="match-info">
          <div class="match-info-status final">Final</div>
          <div class="match-info-score">
            <span class="team-score ${score1Class}">${match.score1}</span>
            <span>-</span>
            <span class="team-score ${score2Class}">${match.score2}</span>
          </div>
        </div>
      `;
    } else if (match.status === "Live") {
      matchInfoHtml = `
        <div class="match-info">
          <div class="match-info-status">Live</div>
          <div class="match-info-score">
            <span class="team-score">${match.score1}</span>
            <span>-</span>
            <span class="team-score">${match.score2}</span>
          </div>
        </div>
      `;
    } else if (match.status === "Upcoming") {
      matchInfoHtml = `
        <div class="match-info">
          <div class="match-info-time">${match.time}</div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="match-team">
        <div class="match-team-name">${match.team1.name}</div>
        <div class="match-team-record">(${match.team1.record})</div>
      </div>
      
      ${matchInfoHtml}
      
      <div class="match-team">
        <div class="match-team-name">${match.team2.name}</div>
        <div class="match-team-record">(${match.team2.record})</div>
      </div>
    `;
    
    listContainer.appendChild(card);
  });
});