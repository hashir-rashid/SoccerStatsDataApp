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

// --- API FUNCTIONS ---

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

// --- GRAPH/CHART FUNCTIONS (Added) ---

function renderCharts() {
  // Check if the canvas exists before trying to render to prevent errors on other pages
  const goalsCanvas = document.getElementById('goalsChart');
  const assistsCanvas = document.getElementById('assistsChart');

  if (goalsCanvas) {
      // --- Chart 1: Top 5 Goal Scorers (Dark Navy) ---
      const ctxGoals = goalsCanvas.getContext('2d');
      new Chart(ctxGoals, {
        type: 'bar',
        data: {
          labels: ['Haaland', 'Kane', 'Mbappé', 'Ronaldo', 'Messi'],
          datasets: [{
            label: 'Goals',
            data: [36, 32, 30, 28, 25], // Dummy Data
            backgroundColor: '#1a1f2e', // Dark Navy
            borderRadius: 4,
            barPercentage: 0.7,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false } 
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { 
                borderDash: [5, 5], 
                color: '#e9ecef' 
              }
            },
            x: {
              grid: { display: false } 
            }
          }
        }
      });
  }

  if (assistsCanvas) {
      // --- Chart 2: Top 5 Assist Providers (Light Grey) ---
      const ctxAssists = assistsCanvas.getContext('2d');
      new Chart(ctxAssists, {
        type: 'bar',
        data: {
          labels: ['De Bruyne', 'Messi', 'Salah', 'Vinícius Jr', 'Olise'],
          datasets: [{
            label: 'Assists',
            data: [22, 18, 16, 14, 12], // Dummy Data
            backgroundColor: '#f1f5f9', // Light Grey
            borderRadius: 4,
            barPercentage: 0.7,
            hoverBackgroundColor: '#cbd5e1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false } 
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { 
                borderDash: [5, 5], 
                color: '#e9ecef' 
              }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
  }
}

// --- HELPER FUNCTIONS ---

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
