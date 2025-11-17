document.addEventListener("DOMContentLoaded", async () => {
  
  // Authentication and user setup (same as before)
  if (localStorage.getItem("isAuthenticated") !== "true") {
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
    return;
  }

  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");
  const userNameDisplay = document.getElementById("user-name-display");
  const userNameGreeting = document.getElementById("user-name-greeting");

  if (userName && userRole) {
    userNameDisplay.innerHTML = `${userName} (<span>${userRole}</span>)`;
    userNameGreeting.textContent = userName;
  }

  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    window.location.href = "login.html";
  });
  
  const dashboardLink = document.getElementById("nav-dashboard");
  if (dashboardLink) {
    dashboardLink.classList.add("active");
  }
  
  // Load stats with single API call
  await loadDashboardStats();
});

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

// Keep the helper functions the same
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