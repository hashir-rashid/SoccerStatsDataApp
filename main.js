// main.js

// Helper to fetch JSON with basic error handling
async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
    }
    return await res.json();
}

// Render any array of objects into a table
function renderTable(tableId, data) {
    const table = document.getElementById(tableId);
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="99">No records found.</td></tr>`;
        return;
    }

    const columns = Object.keys(data[0]);

    // Header
    const headerRow = document.createElement("tr");
    columns.forEach((col) => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Body
    data.forEach((row) => {
        const tr = document.createElement("tr");
        columns.forEach((col) => {
            const td = document.createElement("td");
            td.textContent = row[col];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// ----- Views (10 queries) -----
async function loadSelectedView() {
    const selectEl = document.getElementById("viewSelect");
    const statusEl = document.getElementById("viewStatus");
    const viewId = selectEl.value;

    statusEl.textContent = "Loading...";
    try {
        // Example endpoint: /api/views?viewId=1
        const data = await fetchJson(`/api/views?viewId=${encodeURIComponent(viewId)}`);
        renderTable("viewTable", data);
        statusEl.textContent = `Loaded view ${viewId}`;
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Failed to load view.";
    }
}

// ----- Search & Filter -----
async function handleSearchSubmit(event) {
    event.preventDefault();
    const statusEl = document.getElementById("searchStatus");

    const query = document.getElementById("searchQuery").value.trim();
    const team = document.getElementById("teamFilter").value;
    const position = document.getElementById("positionFilter").value;

    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (team) params.append("team", team);
    if (position) params.append("position", position);

    statusEl.textContent = "Searching...";

    try {
        // Example endpoint: /api/players/search?q=...&team=...&position=...
        const data = await fetchJson(`/api/players/search?${params.toString()}`);
        renderTable("searchTable", data);
        statusEl.textContent = `Found ${data.length} players.`;
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Search failed.";
    }
}

// ----- Chart.js for Top Players -----
let summaryChartInstance = null;

function buildSummaryChart(data) {
    const ctx = document.getElementById("summaryChart").getContext("2d");

    // Example expects data like: [{name: 'Player A', goals: 10}, ...]
    const labels = data.map((p) => p.name);
    const values = data.map((p) => p.goals); // adjust field name as needed

    if (summaryChartInstance) {
        summaryChartInstance.destroy();
    }

    summaryChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Goals",
                    data: values,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "#e5e7eb",
                    },
                },
                y: {
                    ticks: {
                        color: "#e5e7eb",
                    },
                },
            },
        },
    });
}

async function loadSummaryChartData() {
    const statusEl = document.getElementById("chartStatus");
    statusEl.textContent = "Loading chart data...";

    try {
        // Example endpoint: /api/views/top-scorers
        const data = await fetchJson("/api/views/top-scorers");
        buildSummaryChart(data);
        statusEl.textContent = "Chart updated.";
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Failed to load chart data.";
    }
}

// ----- Init -----
document.addEventListener("DOMContentLoaded", () => {
    const loadViewBtn = document.getElementById("loadViewBtn");
    const searchForm = document.getElementById("searchForm");
    const reloadChartBtn = document.getElementById("reloadChartBtn");

    if (loadViewBtn) {
        loadViewBtn.addEventListener("click", loadSelectedView);
        // Load default view once on page load
        loadSelectedView();
    }

    if (searchForm) {
        searchForm.addEventListener("submit", handleSearchSubmit);
    }

    if (reloadChartBtn) {
        reloadChartBtn.addEventListener("click", loadSummaryChartData);
        loadSummaryChartData();
    }
});
