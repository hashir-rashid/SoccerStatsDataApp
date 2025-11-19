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
    document.getElementById("nav-dashboard")?.classList.remove("active");
    document.getElementById("nav-players")?.classList.remove("active");
    document.getElementById("nav-teams")?.classList.remove("active");
    document.getElementById("nav-statistics")?.classList.remove("active");
    document.getElementById("nav-compare")?.classList.remove("active");

    const liveDataLink = document.querySelector('a[href="live_data.html"]');
    if (liveDataLink) {
        liveDataLink.classList.add("active");
    }

    // 4. --- LIVE DATA FUNCTIONALITY ---
    const fetchBtn = document.getElementById('fetch-live-data');
    const saveBtn = document.getElementById('save-to-db');
    const resultsDiv = document.getElementById('live-data-results');

    let currentMatches = null;

    // Check if user is admin and update button accordingly
    function checkAdminPermissions() {
        const userRole = localStorage.getItem("userRole");
        if (userRole !== "admin") {
            saveBtn.disabled = true;
            saveBtn.title = "Admin access required";
            saveBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Admin Only
            `;
            saveBtn.style.opacity = "0.6";
            saveBtn.style.cursor = "not-allowed";
        }
    }

    // Call this on page load
    checkAdminPermissions();

    fetchBtn.addEventListener('click', async () => {
        try {
            fetchBtn.disabled = true;
            fetchBtn.textContent = 'Loading...';
            
            const response = await fetch('/api/external/matches');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            const data = await response.json();
            currentMatches = data;
            displayMatches(data);
        } catch (error) {
            console.error('Failed to fetch live data:', error);
            alert('Failed to fetch live data: ' + error.message);
        } finally {
            fetchBtn.disabled = false;
            fetchBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9v-4.5m0 4.5c-1.5 0-3-.5-4.5-1.5"/>
                </svg>
                Fetch Live Matches
            `;
        }
    });

    saveBtn.addEventListener('click', async () => {
        // Double-check admin permissions on click
        const userRole = localStorage.getItem("userRole");
        if (userRole !== "admin") {
            alert("Access denied. Admin privileges required to save data to the database.");
            return;
        }

        if (!currentMatches) {
            alert('No data to save. Please fetch data first.');
            return;
        }

        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            
            const response = await fetch('/api/external/save-matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matches: currentMatches })
            });
            
            const result = await response.json();
            if (result.success) {
                alert(`Successfully saved ${result.saved} out of ${result.total} matches to database`);
            } else {
                alert('Failed to save data: ' + result.error);
            }
        } catch (error) {
            alert('Failed to save data: ' + error.message);
        } finally {
            // Only re-enable if user is still admin
            if (localStorage.getItem("userRole") === "admin") {
                saveBtn.disabled = false;
                saveBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-xs">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Save to Database
                `;
            }
        }
    });

    function displayMatches(data) {
        if (!data.matches || data.matches.length === 0) {
            resultsDiv.innerHTML = `
                <div class="no-matches" style="text-align: center;">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No matches found in the response.</p>
                </div>
            `;
            return;
        }

        // Group matches by competition
        const matchesByCompetition = {};
        data.matches.forEach(match => {
            const competition = match.competition?.name || 'Other Matches';
            if (!matchesByCompetition[competition]) {
                matchesByCompetition[competition] = [];
            }
            matchesByCompetition[competition].push(match);
        });

        let html = '<div class="matches-container">';
        
        Object.keys(matchesByCompetition).forEach(competition => {
            html += `<div class="competition-header">${competition}</div>`;
            
            matchesByCompetition[competition].forEach(match => {
                const score = match.score?.fullTime;
                const hasScore = score && score.home !== null && score.away !== null;
                const scoreDisplay = hasScore ? `${score.home} - ${score.away}` : '';
                
                html += `
                    <div class="match-card">
                        <h4>${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'}</h4>
                        <div class="match-score">${scoreDisplay}</div>
                        <p><strong>Status:</strong> <span class="match-status ${match.status}">${match.status}</span></p>
                        <p><strong>Date:</strong> ${new Date(match.utcDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${new Date(match.utcDate).toLocaleTimeString()}</p>
                    </div>
                `;
            });
        });
        
        html += '</div>';
        resultsDiv.innerHTML = html;
    }

    // Load any previously saved matches on page load
    async function loadSavedMatches() {
        try {
            const response = await fetch('/api/external/saved-matches');
            const savedMatches = await response.json();
            if (savedMatches.length > 0) {
                console.log(`Found ${savedMatches.length} saved matches in database`);
            }
        } catch (error) {
            console.error('Error loading saved matches:', error);
        }
    }

    loadSavedMatches();

    // 5. --- EXPORT FUNCTIONALITY ---
    const exportCsvButton = document.getElementById("export-csv");
    const exportPdfButton = document.getElementById("export-pdf");

    if (exportCsvButton) {
        exportCsvButton.addEventListener("click", exportLiveDataToCSV);
    }

    if (exportPdfButton) {
        exportPdfButton.addEventListener("click", exportLiveDataToPDF);
    }

    function exportLiveDataToCSV() {
        if (!currentMatches || !currentMatches.matches || currentMatches.matches.length === 0) {
            alert("No data to export. Please fetch matches first.");
            return;
        }

        // Create CSV content
        const headers = ["Home Team", "Away Team", "Score", "Status", "Competition", "Date", "Time"];
        const csvContent = [
            headers.join(","),
            ...currentMatches.matches.map(match => {
                const score = match.score?.fullTime;
                const hasScore = score && score.home !== null && score.away !== null;
                const scoreDisplay = hasScore ? `${score.home}-${score.away}` : 'N/A';
                const matchDate = new Date(match.utcDate);
                
                return [
                    `"${(match.homeTeam?.name || "Unknown").replace(/"/g, '""')}"`,
                    `"${(match.awayTeam?.name || "Unknown").replace(/"/g, '""')}"`,
                    `"${scoreDisplay}"`,
                    `"${match.status || "N/A"}"`,
                    `"${(match.competition?.name || "N/A").replace(/"/g, '""')}"`,
                    `"${matchDate.toLocaleDateString()}"`,
                    `"${matchDate.toLocaleTimeString()}"`
                ].join(",");
            })
        ].join("\n");

        // Create and download file
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `live_matches_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function exportLiveDataToPDF() {
        if (!currentMatches || !currentMatches.matches || currentMatches.matches.length === 0) {
            alert("No data to export. Please fetch matches first.");
            return;
        }

        // Create a simple PDF using window.print() with custom styles
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Live Matches Export</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .export-info { margin-bottom: 20px; color: #666; }
                </style>
            </head>
            <body>
                <h1>Live Football Matches Export</h1>
                <div class="export-info">
                    <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                    <p>Total matches: ${currentMatches.matches.length}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Home Team</th>
                            <th>Away Team</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Competition</th>
                            <th>Date</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentMatches.matches.map(match => {
                            const score = match.score?.fullTime;
                            const hasScore = score && score.home !== null && score.away !== null;
                            const scoreDisplay = hasScore ? `${score.home}-${score.away}` : 'N/A';
                            const matchDate = new Date(match.utcDate);
                            
                            return `
                                <tr>
                                    <td>${match.homeTeam?.name || "Unknown"}</td>
                                    <td>${match.awayTeam?.name || "Unknown"}</td>
                                    <td>${scoreDisplay}</td>
                                    <td>${match.status || "N/A"}</td>
                                    <td>${match.competition?.name || "N/A"}</td>
                                    <td>${matchDate.toLocaleDateString()}</td>
                                    <td>${matchDate.toLocaleTimeString()}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }
});