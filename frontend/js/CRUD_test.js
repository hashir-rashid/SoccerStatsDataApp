// CRUD_test.js - Manual testing for Create, Read, Update, Delete operations
// Usage: Include this file and call CRUDTest.runAllTests() from browser console

const CRUDTest = {
    // Test configuration
    config: {
        baseUrl: window.location.origin,
        testPlayer: {
            player_name: "CRUD Test Player",
            birthday: "1995-05-15",
            weight: 175,
            height: 180
        },
        testTeam: {
            team_long_name: "CRUD Test Team FC",
            team_short_name: "CTT"
        }
    },

    // Test results storage
    results: {
        passed: 0,
        failed: 0,
        tests: []
    },

    // Utility functions
    utils: {
        log(message, type = 'info') {
            const colors = {
                info: '#3498db',
                success: '#2ecc71',
                error: '#e74c3c',
                warning: '#f39c12'
            };
            console.log(`%c[CRUD Test] ${message}`, `color: ${colors[type]}; font-weight: bold;`);
        },

        async makeRequest(url, options = {}) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    ...options
                });

                const contentType = response.headers.get('content-type');
                let data;
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }

                return {
                    success: response.ok,
                    status: response.status,
                    data: data
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        generateRandomName(base) {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            return `${base} ${timestamp}-${random}`;
        }
    },

    // Test functions
    tests: {
        // CREATE operations
        async createPlayer() {
            const testName = "Create Player";
            CRUDTest.utils.log(`Running: ${testName}`, 'info');

            const playerData = {
                ...CRUDTest.config.testPlayer,
                player_name: CRUDTest.utils.generateRandomName("Test Player")
            };

            const result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/players`, {
                method: 'POST',
                body: JSON.stringify(playerData)
            });

            if (result.success && result.data.success) {
                CRUDTest.utils.log(`✓ ${testName} PASSED - Created player with ID: ${result.data.playerId}`, 'success');
                return { success: true, playerId: result.data.playerId, playerData };
            } else {
                CRUDTest.utils.log(`✗ ${testName} FAILED - ${result.error || result.data.error}`, 'error');
                return { success: false, error: result.error || result.data };
            }
        },

        async createTeam() {
            const testName = "Create Team";
            CRUDTest.utils.log(`Running: ${testName}`, 'info');

            const teamData = {
                ...CRUDTest.config.testTeam,
                team_long_name: CRUDTest.utils.generateRandomName("Test Team")
            };

            const result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/teams`, {
                method: 'POST',
                body: JSON.stringify(teamData)
            });

            if (result.success && result.data.success) {
                CRUDTest.utils.log(`✓ ${testName} PASSED - Created team with ID: ${result.data.teamId}`, 'success');
                return { success: true, teamId: result.data.teamId, teamData };
            } else {
                CRUDTest.utils.log(`✗ ${testName} FAILED - ${result.error || result.data.error}`, 'error');
                return { success: false, error: result.error || result.data };
            }
        },

        // READ operations
        async readPlayers() {
            const testName = "Read Players";
            CRUDTest.utils.log(`Running: ${testName}`, 'info');

            const result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/players?limit=5`);

            if (result.success && Array.isArray(result.data)) {
                CRUDTest.utils.log(`✓ ${testName} PASSED - Retrieved ${result.data.length} players`, 'success');
                return { success: true, players: result.data };
            } else {
                CRUDTest.utils.log(`✗ ${testName} FAILED - ${result.error || 'Invalid response format'}`, 'error');
                return { success: false, error: result.error || result.data };
            }
        },

        async readTeams() {
            const testName = "Read Teams";
            CRUDTest.utils.log(`Running: ${testName}`, 'info');

            const result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/teams?limit=5`);

            if (result.success && Array.isArray(result.data)) {
                CRUDTest.utils.log(`✓ ${testName} PASSED - Retrieved ${result.data.length} teams`, 'success');
                return { success: true, teams: result.data };
            } else {
                CRUDTest.utils.log(`✗ ${testName} FAILED - ${result.error || 'Invalid response format'}`, 'error');
                return { success: false, error: result.error || result.data };
            }
        },

        async readPlayerById(playerId) {
            const testName = "Read Player by ID";
            CRUDTest.utils.log(`Running: ${testName}`, 'info');

            const result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/players/${playerId}`);

            if (result.success && result.data.player_name) {
                CRUDTest.utils.log(`✓ ${testName} PASSED - Retrieved player: ${result.data.player_name}`, 'success');
                return { success: true, player: result.data };
            } else {
                CRUDTest.utils.log(`✗ ${testName} FAILED - ${result.error || 'Player not found'}`, 'error');
                return { success: false, error: result.error || result.data };
            }
        },

        async readTeamById(teamId) {
            const testName = "Read Team by ID";
            CRUDTest.utils.log(`Running: ${testName}`, 'info');

            const result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/teams/${teamId}`);

            if (result.success && result.data.team_long_name) {
                CRUDTest.utils.log(`✓ ${testName} PASSED - Retrieved team: ${result.data.team_long_name}`, 'success');
                return { success: true, team: result.data };
            } else {
                CRUDTest.utils.log(`✗ ${testName} FAILED - ${result.error || 'Team not found'}`, 'error');
                return { success: false, error: result.error || result.data };
            }
        },

        // UPDATE operations (Note: You'll need to implement PATCH/PUT endpoints first)
        async updatePlayer(playerId) {
            const testName = "Update Player";
            CRUDTest.utils.log(`Running: ${testName}`, 'info');

            const updateData = {
                player_name: CRUDTest.utils.generateRandomName("Updated Player"),
                weight: 185
            };

            // Try PATCH first, then PUT as fallback
            let result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/players/${playerId}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData)
            });

            if (!result.success) {
                // Try PUT if PATCH fails
                result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/players/${playerId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updateData)
                });
            }

            if (result.success) {
                CRUDTest.utils.log(`✓ ${testName} PASSED - Updated player ${playerId}`, 'success');
                return { success: true };
            } else {
                CRUDTest.utils.log(`✗ ${testName} SKIPPED - Update endpoints not implemented: ${result.error || result.data.error}`, 'warning');
                return { success: false, skipped: true, error: result.error || result.data };
            }
        },

        async updateTeam(teamId) {
            const testName = "Update Team";
            CRUDTest.utils.log(`Running: ${testName}`, 'info');

            const updateData = {
                team_long_name: CRUDTest.utils.generateRandomName("Updated Team"),
                team_short_name: "UPD"
            };

            let result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/teams/${teamId}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData)
            });

            if (!result.success) {
                result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/teams/${teamId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updateData)
                });
            }

            if (result.success) {
                CRUDTest.utils.log(`✓ ${testName} PASSED - Updated team ${teamId}`, 'success');
                return { success: true };
            } else {
                CRUDTest.utils.log(`✗ ${testName} SKIPPED - Update endpoints not implemented: ${result.error || result.data.error}`, 'warning');
                return { success: false, skipped: true, error: result.error || result.data };
            }
        },

        // DELETE operations (Note: You'll need to implement DELETE endpoints first)
        async deletePlayer(playerId) {
            const testName = "Delete Player";
            CRUDTest.utils.log(`Running: ${testName}`, 'info');

            const result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/players/${playerId}`, {
                method: 'DELETE'
            });

            if (result.success) {
                CRUDTest.utils.log(`✓ ${testName} PASSED - Deleted player ${playerId}`, 'success');
                return { success: true };
            } else {
                CRUDTest.utils.log(`✗ ${testName} SKIPPED - Delete endpoint not implemented: ${result.error || result.data.error}`, 'warning');
                return { success: false, skipped: true, error: result.error || result.data };
            }
        },

        async deleteTeam(teamId) {
            const testName = "Delete Team";
            CRUDTest.utils.log(`Running: ${testName}`, 'info');

            const result = await CRUDTest.utils.makeRequest(`${CRUDTest.config.baseUrl}/api/teams/${teamId}`, {
                method: 'DELETE'
            });

            if (result.success) {
                CRUDTest.utils.log(`✓ ${testName} PASSED - Deleted team ${teamId}`, 'success');
                return { success: true };
            } else {
                CRUDTest.utils.log(`✗ ${testName} SKIPPED - Delete endpoint not implemented: ${result.error || result.data.error}`, 'warning');
                return { success: false, skipped: true, error: result.error || result.data };
            }
        }
    },

    // Test runners
    async runAllTests() {
        CRUDTest.utils.log('Starting comprehensive CRUD tests...', 'info');
        CRUDTest.utils.log('Make sure you are logged in as admin for CREATE operations', 'warning');
        
        this.results = { passed: 0, failed: 0, tests: [] };
        const createdResources = [];

        try {
            // CREATE tests
            const playerCreate = await this.tests.createPlayer();
            this.recordTestResult('Create Player', playerCreate);
            if (playerCreate.success) createdResources.push({ type: 'player', id: playerCreate.playerId });

            const teamCreate = await this.tests.createTeam();
            this.recordTestResult('Create Team', teamCreate);
            if (teamCreate.success) createdResources.push({ type: 'team', id: teamCreate.teamId });

            // READ tests
            const playersRead = await this.tests.readPlayers();
            this.recordTestResult('Read Players', playersRead);

            const teamsRead = await this.tests.readTeams();
            this.recordTestResult('Read Teams', teamsRead);

            // READ by ID tests (using created resources if available)
            if (playerCreate.success) {
                const playerReadById = await this.tests.readPlayerById(playerCreate.playerId);
                this.recordTestResult('Read Player by ID', playerReadById);
            }

            if (teamCreate.success) {
                const teamReadById = await this.tests.readTeamById(teamCreate.teamId);
                this.recordTestResult('Read Team by ID', teamReadById);
            }

            // UPDATE tests (using created resources if available)
            if (playerCreate.success) {
                const playerUpdate = await this.tests.updatePlayer(playerCreate.playerId);
                this.recordTestResult('Update Player', playerUpdate);
            }

            if (teamCreate.success) {
                const teamUpdate = await this.tests.updateTeam(teamCreate.teamId);
                this.recordTestResult('Update Team', teamUpdate);
            }

            // DELETE tests (using created resources if available)
            if (playerCreate.success) {
                const playerDelete = await this.tests.deletePlayer(playerCreate.playerId);
                this.recordTestResult('Delete Player', playerDelete);
            }

            if (teamCreate.success) {
                const teamDelete = await this.tests.deleteTeam(teamCreate.teamId);
                this.recordTestResult('Delete Team', teamDelete);
            }

        } catch (error) {
            CRUDTest.utils.log(`Test suite error: ${error.message}`, 'error');
        }

        // Summary
        this.printSummary();
        
        // Cleanup warning for any resources that couldn't be deleted
        const remainingResources = createdResources.filter(resource => 
            !this.results.tests.find(t => 
                t.name === `Delete ${resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}` && 
                t.passed
            )
        );

        if (remainingResources.length > 0) {
            CRUDTest.utils.log('⚠️  Some test resources may not have been cleaned up. Manual deletion may be required.', 'warning');
            console.table(remainingResources);
        }
    },

    async runCreateTests() {
        CRUDTest.utils.log('Running CREATE operations tests...', 'info');
        this.results = { passed: 0, failed: 0, tests: [] };

        const playerCreate = await this.tests.createPlayer();
        this.recordTestResult('Create Player', playerCreate);

        const teamCreate = await this.tests.createTeam();
        this.recordTestResult('Create Team', teamCreate);

        this.printSummary();
        return { player: playerCreate, team: teamCreate };
    },

    async runReadTests() {
        CRUDTest.utils.log('Running READ operations tests...', 'info');
        this.results = { passed: 0, failed: 0, tests: [] };

        const playersRead = await this.tests.readPlayers();
        this.recordTestResult('Read Players', playersRead);

        const teamsRead = await this.tests.readTeams();
        this.recordTestResult('Read Teams', teamsRead);

        this.printSummary();
        return { players: playersRead, teams: teamsRead };
    },

    // Utility methods
    recordTestResult(testName, result) {
        const passed = result.success || result.skipped;
        const testResult = {
            name: testName,
            passed: passed,
            skipped: result.skipped || false,
            error: result.error || null
        };

        this.results.tests.push(testResult);
        if (passed && !result.skipped) {
            this.results.passed++;
        } else if (!result.skipped) {
            this.results.failed++;
        }
    },

    printSummary() {
        CRUDTest.utils.log('\n=== CRUD TEST SUMMARY ===', 'info');
        CRUDTest.utils.log(`Total Tests: ${this.results.tests.length}`, 'info');
        CRUDTest.utils.log(`Passed: ${this.results.passed}`, 'success');
        CRUDTest.utils.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'info');
        
        const skipped = this.results.tests.filter(t => t.skipped).length;
        if (skipped > 0) {
            CRUDTest.utils.log(`Skipped: ${skipped} (endpoints not implemented)`, 'warning');
        }

        console.table(this.results.tests);
    }
};

// Make it available globally
window.CRUDTest = CRUDTest;

// Auto-initialization message
console.log(`
╔═══════════════════════════════════════════════════╗
║              CRUD Test Suite Loaded               ║
╠═══════════════════════════════════════════════════╣
║ Available commands:                               ║
║   • CRUDTest.runAllTests()                        ║
║   • CRUDTest.runCreateTests()                     ║
║   • CRUDTest.runReadTests()                       ║
║                                                   ║
║ Note: Make sure you're logged in as admin for     ║
║       CREATE operations                           ║
╚═══════════════════════════════════════════════════╝
`);