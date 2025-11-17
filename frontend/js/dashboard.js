document.addEventListener("DOMContentLoaded", async () => {
  
  // 1. AUTHENTICATION CHECK
  if (localStorage.getItem("isAuthenticated") !== "true") {
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
    return;
  }

  // 2. USER DISPLAY SETUP
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");
  const userNameDisplay = document.getElementById("user-name-display");
  const userNameGreeting = document.getElementById("user-name-greeting");

  if (userName && userRole) {
    userNameDisplay.innerHTML = `${userName} (<span>${userRole}</span>)`;
    userNameGreeting.textContent = userName;
  }

  // 3. LOGOUT LOGIC
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        window.location.href = "login.html";
      });
  }
  
  // 4. NAVIGATION HIGHLIGHT
  const dashboardLink = document.getElementById("nav-dashboard");
  if (dashboardLink) {
    dashboardLink.classList.add("active");
  }
  
  // 5. LOAD DATA & RENDER
  // First, try to load the API stats
  await loadDashboardStats();

  // Then, render the charts (Graph part added here)
  renderCharts();
});

async function renderCharts() {
  // Check if the canvas exists before trying to render
  const goalsCanvas = document.getElementById('goalsChart');
  const assistsCanvas = document.getElementById('assistsChart');

  try {
    // Fetch data for both charts
    const [scorersResponse, playmakersResponse] = await Promise.all([
      fetch('/api/stats/top-scorers'),
      fetch('/api/stats/top-playmakers')
    ]);

    if (!scorersResponse.ok || !playmakersResponse.ok) {
      throw new Error('Failed to fetch chart data');
    }

    const scorers = await scorersResponse.json();
    const playmakers = await playmakersResponse.json();

    // Process data - take top 5 players for each chart
    const topScorers = scorers.slice(0, 5);
    const topPlaymakers = playmakers.slice(0, 5);

    // Chart 1: Top Goal Scorers based on Shot Power
    if (goalsCanvas) {
      const ctxGoals = goalsCanvas.getContext('2d');
      new Chart(ctxGoals, {
        type: 'bar',
        data: {
          labels: topScorers.map(player => {
            const name = player.name;
            return name.length > 10 ? name.substring(0, 10) + '...' : name;
          }),
          datasets: [{
            label: 'Shot Power',
            data: topScorers.map(player => Math.round(player.shot_power)),
            backgroundColor: '#1a1f2e',
            borderRadius: 4,
            barPercentage: 0.7,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 85,
              max: 95,
              grid: { 
                borderDash: [5, 5], 
                color: '#e9ecef' 
              },
              title: {
                display: true,
                text: 'Shot Power Rating'
              }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // Chart 2: Top Playmakers based on Vision
    if (assistsCanvas) {
      const ctxAssists = assistsCanvas.getContext('2d');
      new Chart(ctxAssists, {
        type: 'bar',
        data: {
          labels: topPlaymakers.map(player => {
            const name = player.name;
            return name.length > 10 ? name.substring(0, 10) + '...' : name;
          }),
          datasets: [{
            label: 'Vision',
            data: topPlaymakers.map(player => Math.round(player.vision)),
            backgroundColor: '#1a1f2e',
            borderRadius: 4,
            barPercentage: 0.7,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 90,
              max: 95,
              grid: { 
                borderDash: [5, 5], 
                color: '#e9ecef' 
              },
              title: {
                display: true,
                text: 'Vision Rating'
              }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

  } catch (error) {
    console.error('Error rendering charts:', error);
  }
}

async function loadDashboardStats() {
  try {
    const response = await fetch('/api/stats/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    const stats = await response.json();
    
    // Update dashboard with real data
    updateStatCard('Total Players', stats.players);
    updateStatCard('Teams', stats.teams);
    updateStatCard('Leagues', stats.leagues);
    updateStatCard('Data Points', formatNumber(stats.dataPoints));

  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    setPlaceholderStats();
  }
}

function updateStatCard(statTitle, value) {
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(card => {
    const titleElement = card.querySelector('.stat-title');
    if (titleElement && titleElement.textContent === statTitle) {
      const valueElement = card.querySelector('.stat-value');
      if (valueElement) {
        valueElement.textContent = value;
      }
    }
  });
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toLocaleString();
}

function setPlaceholderStats() {
  updateStatCard('Total Players', 'N/A');
  updateStatCard('Teams', 'N/A');
  updateStatCard('Leagues', 'N/A');
  updateStatCard('Data Points', 'N/A');
}