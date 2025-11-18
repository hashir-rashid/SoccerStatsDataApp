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

  // 5. --- RENDER DATA FOR 10 VIEWS ---
  renderDataViews();
});

async function loadTopCardsData() {
  try {

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

async function renderDataViews() {  
  try {
    const views = [
      { endpoint: '/api/views/view-player-progression', tableId: 'view1-table-body' },
      { endpoint: '/api/views/high-rated-players-by-foot', tableId: 'view2-table-body' },
      { endpoint: '/api/views/player-peak-attributes', tableId: 'view3-table-body' },
      { endpoint: '/api/views/all-players-and-attributes', tableId: 'view4-table-body' },
      { endpoint: '/api/views/worst-player-union', tableId: 'view5-table-body' },
      { endpoint: '/api/views/current-player-ratings', tableId: 'view6-table-body' },
      { endpoint: '/api/views/player-physical-profile', tableId: 'view7-table-body' },
      { endpoint: '/api/views/player-speed-metrics', tableId: 'view8-table-body' },
      { endpoint: '/api/views/goalkeeper-rankings', tableId: 'view9-table-body' },
      { endpoint: '/api/views/league-country-overview', tableId: 'view10-table-body' }
    ];

    // Fetch all views in parallel but with timeout protection
    const fetchPromises = views.map(async (view, index) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(view.endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return { success: true, data, tableId: view.tableId, viewNumber: index + 1 };
        
      } catch (error) {
        console.error(`View ${index + 1} failed:`, error);
        return { success: false, error, tableId: view.tableId, viewNumber: index + 1 };
      }
    });

    const results = await Promise.all(fetchPromises);

    // Render all results
    results.forEach(result => {
      if (result.success) {
        renderCustomViewData(result.tableId, result.data, result.viewNumber);
      } else {
        renderError(result.tableId, result.error);
      }
    });

  } catch (error) {
    console.error('Error in renderDataViews:', error);
    for (let i = 1; i <= 10; i++) {
      renderError(`view${i}-table-body`, error);
    }
  }
}

function renderCustomViewData(tableId, data, viewNumber) {

  const tableBody = document.getElementById(tableId);
  if (!tableBody) return;

  tableBody.innerHTML = '';

  data.forEach((item, index) => {
    const row = document.createElement('tr');
    
    switch(viewNumber) {
      case 1: // Player Progression
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.name || 'N/A'}</td>
          <td>${formatDate(item.first_date)}</td>
          <td>${item.first_rating || 0}</td>
          <td>${formatDate(item.latest_date)}</td>
          <td>${item.latest_rating || 0}</td>
          <td>${item.improvement || 0}</td>
        `;
        break;
      case 2: // High Rated Players by Foot
        row.innerHTML = `
          <td>${item.foot || 'N/A'}</td>
          <td>${(item.avg || 0).toFixed(2)}</td>
          <td>${item.count || 0}</td>
          <td>${item.max || 0}</td>
        `;
        break;
      case 3: // Player Peak Attributes
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.name || 'N/A'}</td>
          <td>${formatDate(item.date)}</td>
          <td>${item.rating || 0}</td>
          <td>${item.potential || 0}</td>
          <td>${item.finishing || 0}</td>
          <td>${item.passing || 0}</td>
          <td>${item.dribbling || 0}</td>
        `;
        break;
      case 4: // All Players and Attributes
        row.innerHTML = `
          <td>${item.name || 'N/A'}</td>
          <td>${formatDate(item.birthday)}</td>
          <td>${formatDate(item.date)}</td>
          <td>${item.rating || 0}</td>
          <td>${item.potential || 0}</td>
        `;
        break;
      case 5: // Worst Player Union
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.name || 'N/A'}</td>
          <td>${item.rating || 0}</td>
          <td>${item.potential || 0}</td>
          <td>${item.category || 'N/A'}</td>
        `;
        break;
      case 6: // Current Player Ratings
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.name || 'N/A'}</td>
          <td>${formatDate(item.date)}</td>
          <td>${item.rating || 0}</td>
          <td>${item.potential || 0}</td>
          <td>${item.foot || 'N/A'}</td>
          <td>${item.work_rate || 'N/A'}</td>
        `;
        break;
      case 7: // Player Physical Profile
        row.innerHTML = `
          <td>${item.name || 'N/A'}</td>
          <td>${item.height || 0}</td>
          <td>${item.weight || 0}</td>
          <td>${item.stamina || 0}</td>
          <td>${item.strength || 0}</td>
          <td>${item.jumping || 0}</td>
          <td>${item.acceleration || 0}</td>
          <td>${item.sprint || 0}</td>
        `;
        break;
      case 8: // Player Speed Metrics
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.name || 'N/A'}</td>
          <td>${item.height || 0}</td>
          <td>${(item.sprint || 0).toFixed(2)}</td>
          <td>${(item.acceleration || 0).toFixed(2)}</td>
          <td>${(item.agility || 0).toFixed(2)}</td>
          <td>${(item.balance || 0).toFixed(2)}</td>
        `;
        break;
      case 9: // Goalkeeper Rankings
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.name || 'N/A'}</td>
          <td>${(item.diving || 0).toFixed(2)}</td>
          <td>${(item.handling || 0).toFixed(2)}</td>
          <td>${(item.kicking || 0).toFixed(2)}</td>
          <td>${(item.positioning || 0).toFixed(2)}</td>
          <td>${(item.reflexes || 0).toFixed(2)}</td>
          <td>${(item.rating || 0).toFixed(2)}</td>
        `;
        break;
      case 10: // League Country Overview
        row.innerHTML = `
          <td>${item.country || 'N/A'}</td>
          <td>${item.league || 'N/A'}</td>
          <td>${item.l_id || 0}</td>
          <td>${item.c_id || 0}</td>
        `;
        break;
      default:
        console.error('Unknown view number:', viewNumber);
    }

    tableBody.appendChild(row);
  });
}

function renderError(tableId, error) {
  const tableBody = document.getElementById(tableId);
  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red;">Error loading data: ${error.message}</td></tr>`;
  }
}