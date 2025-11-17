// CRUD_test.js - Basic CRUD Operations Test

async function runCRUDTests() {
    console.log('🚀 Starting CRUD Operations Test...');
    
    try {
        // Test 1: READ - Fetch players
        console.log('\n📖 TEST 1: READ Operation');
        await testReadOperation();
        
        // Test 2: READ - Fetch teams
        console.log('\n📖 TEST 2: READ Teams Operation');
        await testTeamsReadOperation();
        
        // Test 3: READ - Fetch dashboard stats
        console.log('\n📖 TEST 3: READ Dashboard Stats');
        await testDashboardStats();
        
        // Test 4: SEARCH Operation
        console.log('\n🔍 TEST 4: SEARCH Operation');
        await testSearchOperation();
        
        console.log('\n✅ ALL CRUD TESTS COMPLETED!');
        
    } catch (error) {
        console.error('❌ CRUD Tests Failed:', error);
    }
}

async function testReadOperation() {
    try {
        const response = await fetch('/api/players?limit=5');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const players = await response.json();
        console.log(`✅ READ Players: Success - Found ${players.length} players`);
        console.log('📋 Sample Players:', players.slice(0, 2));
        return true;
    } catch (error) {
        console.error('❌ READ Players Failed:', error);
        return false;
    }
}

async function testTeamsReadOperation() {
    try {
        const response = await fetch('/api/teams?limit=5');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const teams = await response.json();
        console.log(`✅ READ Teams: Success - Found ${teams.length} teams`);
        console.log('📋 Sample Teams:', teams.slice(0, 2));
        return true;
    } catch (error) {
        console.error('❌ READ Teams Failed:', error);
        return false;
    }
}

async function testDashboardStats() {
    try {
        const response = await fetch('/api/stats/dashboard');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const stats = await response.json();
        console.log('✅ READ Dashboard Stats: Success');
        console.log('📊 Stats Summary:', {
            players: stats.players,
            teams: stats.teams,
            leagues: stats.leagues,
            dataPoints: stats.dataPoints
        });
        return true;
    } catch (error) {
        console.error('❌ READ Dashboard Stats Failed:', error);
        return false;
    }
}

async function testSearchOperation() {
    try {
        // Test search with a common term
        const response = await fetch('/api/search/messi');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const results = await response.json();
        console.log('✅ SEARCH Operation: Success');
        console.log('🔍 Search Results Structure:', {
            players: results.players?.length || 0,
            teams: results.teams?.length || 0
        });
        return true;
    } catch (error) {
        console.error('❌ SEARCH Operation Failed:', error);
        return false;
    }
}

// Utility function to test individual endpoints
window.testEndpoint = async function(endpoint) {
    console.log(`🧪 Testing endpoint: ${endpoint}`);
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log(`✅ ${endpoint}: Success`, data);
        return data;
    } catch (error) {
        console.error(`❌ ${endpoint}: Failed`, error);
        return null;
    }
}

// Export functions for manual testing in console
window.CRUDTester = {
    runAllTests: runCRUDTests,
    testPlayers: testReadOperation,
    testTeams: testTeamsReadOperation,
    testStats: testDashboardStats,
    testSearch: testSearchOperation,
    testEndpoint: window.testEndpoint
};

console.log('💡 Manual testing available:');
console.log('   - CRUDTester.runAllTests()');
console.log('   - CRUDTester.testPlayers()');
console.log('   - CRUDTester.testTeams()');
console.log('   - CRUDTester.testStats()');
console.log('   - CRUDTester.testSearch()');
console.log('   - testEndpoint("/api/your-endpoint")');