// compare.js

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
    }
    return await res.json();
}

// Autocomplete logic for each player input
function setupAutocomplete(inputId, suggestionsId, hiddenId) {
    const inputEl = document.getElementById(inputId);
    const suggestionsEl = document.getElementById(suggestionsId);
    const hiddenEl = document.getElementById(hiddenId);

    let debounceTimeout = null;

    inputEl.addEventListener("input", () => {
        const query = inputEl.value.trim();
        hiddenEl.value = ""; // clear selected id whenever user types

        if (debounceTimeout) clearTimeout(debounceTimeout);
        if (!query) {
            suggestionsEl.innerHTML = "";
            return;
        }

        debounceTimeout = setTimeout(async () => {
            try {
                // Example endpoint: /api/players?search=query
                const data = await fetchJson(
                    `/api/players?search=${encodeURIComponent(query)}`
                );
                suggestionsEl.innerHTML = "";

                if (!data || data.length === 0) {
                    suggestionsEl.innerHTML = "<li>No results</li>";
                    return;
                }

                data.forEach((player) => {
                    const li = document.createElement("li");
                    li.textContent = `${player.name} (${player.team})`;
                    li.dataset.playerId = player.id;
                    li.addEventListener("click", () => {
                        inputEl.value = player.name;
                        hiddenEl.value = player.id;
                        suggestionsEl.innerHTML = "";
                    });
                    suggestionsEl.appendChild(li);
                });
            } catch (err) {
                console.error(err);
                suggestionsEl.innerHTML = "<li>Error loading players</li>";
            }
        }, 200); // simple debounce
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (event) => {
        if (!suggestionsEl.contains(event.target) && event.target !== inputEl) {
            suggestionsEl.innerHTML = "";
        }
    });
}

// Render comparison table
function renderCompareTable(data) {
    const table = document.getElementById("compareTable");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='99'>No comparison data.</td></tr>";
        return;
    }

    // Example: data = [{ name, team, goals, assists, minutes }, ...]
    const columns = Object.keys(data[0]);

    const headerRow = document.createElement("tr");
    columns.forEach((col) => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

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

// Chart.js for comparing players
let compareChartInstance = null;

function buildCompareChart(data) {
    const ctx = document.getElementById("compareChart").getContext("2d");

    // Choose which stats to compare
    const statFields = ["goals", "assists", "minutes"]; // adjust to your schema
    const labels = statFields.map((f) => f.toUpperCase());

    const datasets = data.map((player) => ({
        label: player.name,
        data: statFields.map((f) => Number(player[f]) || 0),
    }));

    if (compareChartInstance) {
        compareChartInstance.destroy();
    }

    compareChartInstance = new Chart(ctx, {
        type: "radar",
        data: {
            labels,
            datasets,
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
            },
            scales: {
                r: {
                    angleLines: { color: "#374151" },
                    grid: { color: "#1f2937" },
                    pointLabels: { color: "#e5e7eb" },
                },
            },
        },
    });
}

// Handle compare form submit
async function handleCompareSubmit(event) {
    event.preventDefault();
    const statusEl = document.getElementById("compareStatus");

    const player1Id = document.getElementById("player1Id").value;
    const player2Id = document.getElementById("player2Id").value;

    // Simple validation
    if (!player1Id || !player2Id) {
        statusEl.textContent = "Please select at least two players.";
        return;
    }
    if (player1Id === player2Id) {
        statusEl.textContent = "Please select two different players.";
        return;
    }

    const ids = [player1Id, player2Id]; // extend if you add more players
    const params = new URLSearchParams();
    params.append("ids", ids.join(","));

    statusEl.textContent = "Loading comparison...";

    try {
        // Example endpoint: /api/compare?ids=1,2
        const data = await fetchJson(`/api/compare?${params.toString()}`);
        renderCompareTable(data);
        buildCompareChart(data);
        statusEl.textContent = "Comparison loaded.";
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Failed to load comparison.";
    }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    setupAutocomplete("player1Input", "player1Suggestions", "player1Id");
    setupAutocomplete("player2Input", "player2Suggestions", "player2Id");

    const form = document.getElementById("compareForm");
    form.addEventListener("submit", handleCompareSubmit);
});
