const formatDate = (dateString) => {
  if (!dateString || !dateString.includes(" ")) {
    return dateString;
  }
  return dateString.split(" ")[0];
};

document.addEventListener("DOMContentLoaded", async () => {
  
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
  document.getElementById("nav-matches")?.classList.remove("active");
  
  const statisticsLink = document.getElementById("nav-statistics");
  if (statisticsLink) {
    statisticsLink.classList.add("active");
  }

  // 4. --- LOAD REAL DATA FOR TOP CARDS FROM DATABASE ---
  await loadTopCardsData();

  // 5. --- RENDER MOCK DATA FOR 10 VIEWS ---
  renderMockDataViews();
});

async function loadTopCardsData() {
  try {
    console.log('Starting to load top cards data...');

    const endpoints = [
      '/api/stats/top-player',
      '/api/stats/highest-potential',
      '/api/stats/avg-player-age', 
      '/api/stats/avg-rating'
    ];

    // Check each endpoint individually with better error handling
    const responses = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          console.log(`Fetching: ${endpoint}`);
          const response = await fetch(endpoint);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} for ${endpoint}`);
          }
          
          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Expected JSON but got ${contentType} for ${endpoint}`);
          }
          
          const data = await response.json();
          return { success: true, data, endpoint };
        } catch (error) {
          console.error(`Failed to fetch ${endpoint}:`, error);
          return { success: false, error: error.message, endpoint };
        }
      })
    );

    console.log('All API responses:', responses);

    // Process successful responses
    const successfulResponses = responses.filter(r => r.success);
    
    if (successfulResponses.length === 0) {
      throw new Error('All API calls failed');
    }

    // Extract data from successful responses
    const topPlayer = successfulResponses.find(r => r.endpoint === '/api/stats/top-player')?.data || { name: 'N/A', overall_rating: 0 };
    const highestPotential = successfulResponses.find(r => r.endpoint === '/api/stats/highest-potential')?.data || { name: 'N/A', potential: 0 };
    const avgAge = successfulResponses.find(r => r.endpoint === '/api/stats/avg-player-age')?.data || { avg_age: 0 };
    const avgRating = successfulResponses.find(r => r.endpoint === '/api/stats/avg-rating')?.data || { avg_rating: 0 };

    console.log('Processed data:', { topPlayer, highestPotential, avgAge, avgRating });

    // Update the top cards with real data
    updateTopCard('Top Rated Player', topPlayer.name || 'No data', `${topPlayer.overall_rating || 0} rating`, 'Player');
    updateTopCard('Highest Potential', highestPotential.name || 'No data', `${highestPotential.potential || 0} potential`, 'Player');
    updateTopCard('Avg Player Age', Math.round(avgAge.avg_age || 0) + ' years', 'Across all players', 'Age');
    updateTopCard('Avg Player Rating', (avgRating.avg_rating || 0).toFixed(1), 'Across all players', 'Rating');

  } catch (error) {
    console.error('Error loading top cards data:', error);
    // Fallback to placeholder values
    setPlaceholderTopCards();
  }
}

function updateTopCard(title, value, meta, type) {
  const cards = document.querySelectorAll('.adv-stat-card');
  cards.forEach(card => {
    const titleElement = card.querySelector('.adv-stat-title');
    if (titleElement && titleElement.textContent === title) {
      // Find and update the main value display
      // Try both possible selectors
      const valueName = card.querySelector('.adv-stat-value-name');
      const valueNum = card.querySelector('.adv-stat-value-num');
      
      if (valueName) valueName.textContent = value;
      if (valueNum) valueNum.textContent = value;
      
      // Update meta text
      const metaElement = card.querySelector('.adv-stat-meta');
      if (metaElement) metaElement.textContent = meta;
    }
  });
}

function setPlaceholderTopCards() {
  updateTopCard('Top Rated Player', 'N/A', 'Data unavailable', 'Player');
  updateTopCard('Highest Potential', 'N/A', 'Data unavailable', 'Player');
  updateTopCard('Avg Player Age', 'N/A', 'Data unavailable', 'Age');
  updateTopCard('Avg Player Rating', 'N/A', 'Data unavailable', 'Rating');
}

function renderMockDataViews() {
  // --- View 1: Player Progression (view_player_progression) ---
  const mockView1 = [
    { name: "Aaron Appindangoye", first_date: "2007-02-22 00:00:00", first_rating: 61, latest_date: "2016-02-18 00:00:00", latest_rating: 67, improvement: 6 },
    { name: "Aaron Cresswell", first_date: "2007-02-22 00:00:00", first_rating: 53, latest_date: "2016-04-21 00:00:00", latest_rating: 74, improvement: 21 },
    { name: "Aaron Doran", first_date: "2007-02-22 00:00:00", first_rating: 59, latest_date: "2016-01-07 00:00:00", latest_rating: 65, improvement: 6 },
    { name: "Aaron Galindo", first_date: "2007-02-22 00:00:00", first_rating: 21, latest_date: "2016-04-21 00:00:00", latest_rating: 69, improvement: -2 },
    { name: "Aaron Hughes", first_date: "2013-03-08 00:00:00", first_rating: 74, latest_date: "2015-12-24 00:00:00", latest_rating: 70, improvement: -4 }
  ];
  // Sort by improvement descending
  mockView1.sort((a, b) => b.improvement - a.improvement);
  
  const view1Body = document.getElementById("view1-table-body");
  if (view1Body) {
    view1Body.innerHTML = ""; // Clear
    mockView1.forEach((p, index) => { // Added index
      view1Body.innerHTML += `<tr>
        <td>${index + 1}</td> <td>${p.name}</td>
        <td>${formatDate(p.first_date)}</td>
        <td>${p.first_rating}</td>
        <td>${formatDate(p.latest_date)}</td>
        <td>${p.latest_rating}</td>
        <td>${p.improvement}</td>
      </tr>`;
    });
  }

  // --- View 2: High Rated Players by Foot (high_rated_players_by_foot) ---
  const mockView2 = [
    { foot: "left", avg: 70.8400, count: 25, max: 74 },
    { foot: "right", avg: 70.3902, count: 41, max: 75 }
  ];
  // Sort by avg rating descending
  mockView2.sort((a, b) => b.avg - a.avg);

  const view2Body = document.getElementById("view2-table-body");
  if (view2Body) {
    view2Body.innerHTML = ""; // Clear
    mockView2.forEach(p => {
      view2Body.innerHTML += `<tr>
        <td>${p.foot}</td>
        <td>${p.avg.toFixed(2)}</td>
        <td>${p.count}</td>
        <td>${p.max}</td>
      </tr>`;
    });
  }

  // --- View 3: Player Peak Attributes (view_player_peak_attributes) ---
  const mockView3 = [
    { name: "Aaron Appindangoye", date: "2016-02-18 00:00:00", rating: 67, potential: 71, finishing: 44, passing: 61, dribbling: 51 },
    { name: "Aaron Appindangoye", date: "2015-11-19 00:00:00", rating: 67, potential: 71, finishing: 44, passing: 61, dribbling: 51 },
    { name: "Aaron Cresswell", date: "2016-04-21 00:00:00", rating: 74, potential: 76, finishing: 53, passing: 71, dribbling: 73 },
    { name: "Aaron Cresswell", date: "2016-04-07 00:00:00", rating: 74, potential: 76, finishing: 53, passing: 71, dribbling: 73 },
    { name: "Aaron Cresswell", date: "2015-09-25 00:00:00", rating: 74, potential: 78, finishing: 51, passing: 70, dribbling: 71 },
    { name: "Aaron Doran", date: "2013-09-20 00:00:00", rating: 71, potential: 78, finishing: 52, passing: 71, dribbling: 74 },
    { name: "Aaron Galindo", date: "2009-02-22 00:00:00", rating: 75, potential: 82, finishing: 44, passing: 72, dribbling: 60 },
    { name: "Aaron Hughes", date: "2013-04-26 00:00:00", rating: 74, potential: 74, finishing: 33, passing: 71, dribbling: 48 },
  ];
  // Sort by rating descending, then potential descending
  mockView3.sort((a, b) => b.rating - a.rating || b.potential - a.potential);

  const view3Body = document.getElementById("view3-table-body");
  if (view3Body) {
    view3Body.innerHTML = ""; // Clear
    mockView3.forEach((p, index) => { // Added index
      view3Body.innerHTML += `<tr>
        <td>${index + 1}</td> <td>${p.name}</td>
        <td>${formatDate(p.date)}</td>
        <td>${p.rating}</td>
        <td>${p.potential}</td>
        <td>${p.finishing}</td>
        <td>${p.passing}</td>
        <td>${p.dribbling}</td>
      </tr>`;
    });
  }

  // --- View 4: All Players and Attributes (view_all_players_and_attributes) ---
  const mockView4 = [
    { name: "Aaron Appindangoye", birthday: "1992-02-29 00:00:00", date: "2016-02-18 00:00:00", rating: 67, potential: 71 },
    { name: "Aaron Appindangoye", birthday: "1992-02-29 00:00:00", date: "2015-11-19 00:00:00", rating: 67, potential: 71 },
    { name: "Aaron Appindangoye", birthday: "1992-02-29 00:00:00", date: "2015-09-21 00:00:00", rating: 62, potential: 66 },
    { name: "Aaron Appindangoye", birthday: "1992-02-29 00:00:00", date: "2015-03-20 00:00:00", rating: 61, potential: 65 },
    { name: "Aaron Appindangoye", birthday: "1992-02-29 00:00:00", date: "2007-02-22 00:00:00", rating: 61, potential: 65 },
    { name: "Aaron Cresswell", birthday: "1989-12-15 00:00:00", date: "2016-04-21 00:00:00", rating: 74, potential: 76 },
    { name: "Aaron Cresswell", birthday: "1989-12-15 00:00:00", date: "2016-04-07 00:00:00", rating: 74, potential: 76 },
    { name: "Aaron Cresswell", birthday: "1989-12-15 00:00:00", date: "2016-01-07 00:00:00", rating: 73, potential: 75 },
  ];
  // Sort by name ascending, then date descending
  mockView4.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    // If names are equal, sort by date (newest first)
    return new Date(b.date) - new Date(a.date);
  });

  const view4Body = document.getElementById("view4-table-body");
  if (view4Body) {
    view4Body.innerHTML = ""; // Clear
    mockView4.forEach(p => {
      view4Body.innerHTML += `<tr>
        <td>${p.name}</td>
        <td>${formatDate(p.birthday)}</td>
        <td>${formatDate(p.date)}</td>
        <td>${p.rating}</td>
        <td>${p.potential}</td>
      </tr>`;
    });
  }

  // --- View 5: Worst Player Union (worst_player_union) ---
  const mockView5 = [
    { name: "Aaron Cresswell", rating: 54, potential: 65, category: "Low Rating" },
    { name: "Aaron Cresswell", rating: 51, potential: 64, category: "Low Rating" },
    { name: "Aaron Cresswell", rating: 52, potential: 65, category: "Low Rating" },
    { name: "Aaron Cresswell", rating: 47, potential: 60, category: "Low Rating" },
    { name: "Aaron Cresswell", rating: 53, potential: 60, category: "Low Rating" },
    { name: "Aaron Doran", rating: 59, potential: 70, category: "Low Rating" },
    { name: "Aaron Appindangoye", rating: 61, potential: 65, category: "Low Potential" },
    { name: "Aaron Cresswell", rating: 54, potential: 65, category: "Low Potential" },
  ];
  // Sort by category, then rating ascending (worst first)
  mockView5.sort((a, b) => {
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    return a.rating - b.rating;
  });

  const view5Body = document.getElementById("view5-table-body");
  if (view5Body) {
    view5Body.innerHTML = ""; // Clear
    mockView5.forEach((p, index) => { // Added index
      view5Body.innerHTML += `<tr>
        <td>${index + 1}</td> <td>${p.name}</td>
        <td>${p.rating}</td>
        <td>${p.potential}</td>
        <td>${p.category}</td>
      </tr>`;
    });
  }

  // --- View 6: Current Player Ratings (view_current_player_ratings) ---
  const mockView6 = [
    { name: "Aaron Appindangoye", date: "2016-02-18 00:00:00", rating: 67, potential: 71, foot: "right", work_rate: "medium" },
    { name: "Aaron Cresswell", date: "2016-04-21 00:00:00", rating: 74, potential: 76, foot: "left", work_rate: "medium" },
    { name: "Aaron Doran", date: "2016-01-07 00:00:00", rating: 65, potential: 67, foot: "right", work_rate: "medium" },
    { name: "Aaron Galindo", date: "2016-04-21 00:00:00", rating: 69, potential: 69, foot: "right", work_rate: "medium" },
    { name: "Aaron Hughes", date: "2015-12-24 00:00:00", rating: 70, potential: 70, foot: "right", work_rate: "medium" },
  ];
  // Sort by rating descending
  mockView6.sort((a, b) => b.rating - a.rating);
  
  const view6Body = document.getElementById("view6-table-body");
  if (view6Body) {
    view6Body.innerHTML = ""; // Clear
    mockView6.forEach((p, index) => { // Added index
      view6Body.innerHTML += `<tr>
        <td>${index + 1}</td> <td>${p.name}</td>
        <td>${formatDate(p.date)}</td>
        <td>${p.rating}</td>
        <td>${p.potential}</td>
        <td>${p.foot}</td>
        <td>${p.work_rate}</td>
      </tr>`;
    });
  }

  // --- View 7: Player Physical Profile (view_player_physical_profile) ---
  const mockView7 = [
    { name: "Aaron Appindangoye", height: 182.88, weight: 187, stamina: 54, strength: 76, jumping: 60, acceleration: 58, sprint: 64 },
    { name: "Aaron Cresswell", height: 170.18, weight: 146, stamina: 79, strength: 56, jumping: 85, acceleration: 79, sprint: 78 },
    { name: "Aaron Doran", height: 170.18, weight: 163, stamina: 66, strength: 71, jumping: 65, acceleration: 77, sprint: 74 },
    { name: "Aaron Galindo", height: 182.88, weight: 198, stamina: 49, strength: 90, jumping: 71, acceleration: 33, sprint: 34 },
    { name: "Aaron Hughes", height: 182.88, weight: 154, stamina: 60, strength: 75, jumping: 67, acceleration: 33, sprint: 31 },
  ];
  // Sort by name ascending
  mockView7.sort((a, b) => a.name.localeCompare(b.name));

  const view7Body = document.getElementById("view7-table-body");
  if (view7Body) {
    view7Body.innerHTML = ""; // Clear
    mockView7.forEach(p => {
      view7Body.innerHTML += `<tr>
        <td>${p.name}</td>
        <td>${p.height}</td>
        <td>${p.weight}</td>
        <td>${p.stamina}</td>
        <td>${p.strength}</td>
        <td>${p.jumping}</td>
        <td>${p.acceleration}</td>
        <td>${p.sprint}</td>
      </tr>`;
    });
  }

  // --- View 8: Player Speed Metrics (player_speed_metrics) ---
  const mockView8 = [
    { name: "Aaron Cresswell", height: 170.18, sprint: 74.9394, acceleration: 76.0000, agility: 75.2424, balance: 84.7273 },
    { name: "Aaron Doran", height: 170.18, sprint: 77.5000, acceleration: 75.5385, agility: 77.6154, balance: 80.7308 },
  ];
  // Sort by sprint speed descending
  mockView8.sort((a, b) => b.sprint - a.sprint);

  const view8Body = document.getElementById("view8-table-body");
  if (view8Body) {
    view8Body.innerHTML = ""; // Clear
    mockView8.forEach((p, index) => { // Added index
      view8Body.innerHTML += `<tr>
        <td>${index + 1}</td> <td>${p.name}</td>
        <td>${p.height}</td>
        <td>${p.sprint.toFixed(2)}</td>
        <td>${p.acceleration.toFixed(2)}</td>
        <td>${p.agility.toFixed(2)}</td>
        <td>${p.balance.toFixed(2)}</td>
      </tr>`;
    });
  }

  // --- View 9: Goalkeeper Rankings (goalkeeper_rankings) ---
  const mockView9 = [
    { name: "Aaron Galindo", diving: 14.1739, handling: 11.1739, kicking: 22.8696, positioning: 11.1739, reflexes: 10.1739, rating: 69.0870 },
    { name: "Aaron Doran", diving: 14.0385, handling: 11.8077, kicking: 17.7308, positioning: 10.1154, reflexes: 13.5000, rating: 67.0000 },
    { name: "Aaron Cresswell", diving: 12.1818, handling: 8.6667, kicking: 14.2424, positioning: 10.3636, reflexes: 12.9091, rating: 66.9697 },
    { name: "Aaron Hughes", diving: 7.1538, handling: 5.1538, kicking: 15.1538, positioning: 11.1538, reflexes: 10.1538, rating: 71.6923 },
    { name: "Aaron Appindangoye", diving: 5.6000, handling: 10.6000, kicking: 9.6000, positioning: 7.6000, reflexes: 7.6000, rating: 63.6000 },
  ];
  // Sort by overall rating descending
  mockView9.sort((a, b) => b.rating - a.rating);

  const view9Body = document.getElementById("view9-table-body");
  if (view9Body) {
    view9Body.innerHTML = ""; // Clear
    mockView9.forEach((p, index) => { // Added index
      view9Body.innerHTML += `<tr>
        <td>${index + 1}</td> <td>${p.name}</td>
        <td>${p.diving.toFixed(2)}</td>
        <td>${p.handling.toFixed(2)}</td>
        <td>${p.kicking.toFixed(2)}</td>
        <td>${p.positioning.toFixed(2)}</td>
        <td>${p.reflexes.toFixed(2)}</td>
        <td>${p.rating.toFixed(2)}</td>
      </tr>`;
    });
  }

  // --- View 10: League Country Overview (league_country_overview) ---
  const mockView10 = [
    { country: "Belgium", league: "Belgium Jupiler League", l_id: 1, c_id: 1 },
    { country: "England", league: "England Premier League", l_id: 1729, c_id: 1729 },
    { country: "France", league: "France Ligue 1", l_id: 4769, c_id: 4769 },
    { country: "Germany", league: "Germany 1. Bundesliga", l_id: 7809, c_id: 7809 },
    { country: "Italy", league: "Italy Serie A", l_id: 10257, c_id: 10257 },
    { country: "Netherlands", league: "Netherlands Eredivisie", l_id: 13274, c_id: 13274 },
    { country: "Poland", league: "Poland Ekstraklasa", l_id: 15722, c_id: 15722 },
    { country: "Portugal", league: "Portugal Liga ZON Sagres", l_id: 17642, c_id: 17642 },
    { country: "Scotland", league: "Scotland Premier League", l_id: 19694, c_id: 19694 },
    { country: "Spain", league: "Spain LIGA BBVA", l_id: 21518, c_id: 21518 },
    { country: "Switzerland", league: "Switzerland Super League", l_id: 24558, c_id: 24558 },
  ];
  // Sort by country name ascending
  mockView10.sort((a, b) => a.country.localeCompare(b.country));

  const view10Body = document.getElementById("view10-table-body");
  if (view10Body) {
    view10Body.innerHTML = ""; // Clear
    mockView10.forEach(p => {
      view10Body.innerHTML += `<tr>
        <td>${p.country}</td>
        <td>${p.league}</td>
        <td>${p.l_id}</td>
        <td>${p.c_id}</td>
      </tr>`;
    });
  }
}