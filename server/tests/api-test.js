/**
 * Comprehensive API Testing Script
 * Tests all Coach ManLaw API endpoints
 *
 * Usage: node tests/api-test.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

let authToken = '';
let userId = '';
let sessionId = '';
let lessonId = '';
let actionId = '';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function apiCall(method, endpoint, data = null, requiresAuth = false) {
  const url = `${BASE_URL}${endpoint}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(requiresAuth && authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (response.ok) {
      log(`✓ ${method} ${endpoint}`, 'green');
      return { success: true, data: result, status: response.status };
    } else {
      log(`✗ ${method} ${endpoint} - ${result.error || result.message}`, 'red');
      return { success: false, error: result.error || result.message, status: response.status };
    }
  } catch (error) {
    log(`✗ ${method} ${endpoint} - ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testHealthEndpoints() {
  section('1. Testing Health & Status Endpoints');

  await apiCall('GET', '/health');
  await apiCall('GET', '/test');
}

async function testAuthenticationFlow() {
  section('2. Testing Authentication Flow');

  // Register new user
  log('\nRegistering new user...', 'yellow');
  const registerData = {
    fullName: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'test123456'
  };

  const registerResult = await apiCall('POST', '/auth/register', registerData);

  if (registerResult.success) {
    authToken = registerResult.data.token;
    userId = registerResult.data.user._id;
    log(`User ID: ${userId}`, 'blue');
    log(`Token: ${authToken.substring(0, 20)}...`, 'blue');
  } else {
    log('Failed to register user. Tests may fail.', 'red');
    return false;
  }

  // Test /auth/me
  log('\nTesting /auth/me...', 'yellow');
  await apiCall('GET', '/auth/me', null, true);

  // Test /auth/verify
  log('\nTesting /auth/verify...', 'yellow');
  await apiCall('GET', '/auth/verify', null, true);

  return true;
}

async function testBTSSAssessment() {
  section('3. Testing BTSS Assessment');

  log('\nSubmitting BTSS assessment...', 'yellow');
  const btssData = {
    userId,
    mindsetMysteryScore: 65,
    moneyMovesScore: 45,
    legacyMissionScore: 55,
    movementMomentumScore: 70,
    assessmentType: 'self',
    notes: 'Initial assessment via API test'
  };

  const btssResult = await apiCall('POST', '/btss/assess', btssData, true);

  if (btssResult.success) {
    log(`Overall BTSS: ${btssResult.data.btssScore.overallBTSS}`, 'blue');
    log(`Weakest Leg: ${btssResult.data.btssScore.weakestLeg}`, 'blue');
    log(`Table Stability: ${btssResult.data.btssScore.tableStability}`, 'blue');
  }

  // Get latest BTSS
  log('\nGetting latest BTSS score...', 'yellow');
  await apiCall('GET', `/btss/${userId}`, null, true);

  // Get BTSS breakdown
  log('\nGetting BTSS breakdown...', 'yellow');
  await apiCall('GET', `/btss/breakdown/${userId}`, null, true);

  // Get BTSS history
  log('\nGetting BTSS history...', 'yellow');
  await apiCall('GET', `/btss/history/${userId}`, null, true);
}

async function testCheckInFlow() {
  section('4. Testing Check-In Flow');

  log('\nStarting daily check-in...', 'yellow');
  const checkInData = {
    userId,
    sessionType: 'daily'
  };

  const checkInResult = await apiCall('POST', '/coach/check-in', checkInData, true);

  if (checkInResult.success) {
    sessionId = checkInResult.data.session.sessionId;
    log(`Session ID: ${sessionId}`, 'blue');
    log(`Check-in Streak: ${checkInResult.data.user.checkInStreak}`, 'blue');
  }

  // Get active session
  log('\nGetting active session...', 'yellow');
  await apiCall('GET', `/coach/check-in/active/${userId}`, null, true);
}

async function testChatWithCoach() {
  section('5. Testing AI Coach Chat');

  if (!sessionId) {
    log('No active session. Skipping chat test.', 'yellow');
    return;
  }

  const messages = [
    "Hello Coach ManLaw! I want to build my first million.",
    "I'm struggling with my mindset today. How can I overcome limiting beliefs?",
    "What's the first step I should take with my Money Moves?"
  ];

  for (const message of messages) {
    log(`\nSending message: "${message.substring(0, 50)}..."`, 'yellow');
    const chatResult = await apiCall('POST', '/coach/chat', {
      sessionId,
      userId,
      message
    }, true);

    if (chatResult.success) {
      log(`Coach Response: ${chatResult.data.response.substring(0, 100)}...`, 'blue');
      if (chatResult.data.scripture) {
        log(`Scripture: ${chatResult.data.scripture.reference}`, 'blue');
      }
    }

    // Small delay between messages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testActionItems() {
  section('6. Testing Action Items');

  log('\nCreating action item...', 'yellow');
  const actionData = {
    userId,
    description: 'Complete money mindset lesson from Coach ManLaw',
    linkedLeg: 'Money Moves',
    priority: 'high',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  const actionResult = await apiCall('POST', '/coach/action', actionData, true);

  if (actionResult.success) {
    actionId = actionResult.data._id;
    log(`Action ID: ${actionId}`, 'blue');
  }

  // Get active actions
  log('\nGetting active actions...', 'yellow');
  await apiCall('GET', `/coach/actions/${userId}`, null, true);

  // Update action status
  if (actionId) {
    log('\nUpdating action to completed...', 'yellow');
    await apiCall('PUT', `/coach/action/${actionId}`, {
      status: 'completed',
      outcome: 'Learned about compound interest and wealth multiplication',
      impactRating: 5
    }, true);
  }
}

async function testWinsTracking() {
  section('7. Testing Wins Tracking');

  log('\nRecording a win...', 'yellow');
  const winData = {
    userId,
    description: 'Completed first BTSS assessment and identified weakest leg!',
    linkedLeg: 'Mindset Mystery',
    significance: 'medium'
  };

  await apiCall('POST', '/coach/win', winData, true);

  // Get recent wins
  log('\nGetting recent wins...', 'yellow');
  await apiCall('GET', `/coach/wins/${userId}?limit=5`, null, true);
}

async function testLessonLibrary() {
  section('8. Testing Lesson Library');

  log('\nGetting all lessons...', 'yellow');
  const lessonsResult = await apiCall('GET', '/lessons?limit=5', null, false);

  if (lessonsResult.success && lessonsResult.data.length > 0) {
    lessonId = lessonsResult.data[0]._id;
    log(`Found ${lessonsResult.data.length} lessons`, 'blue');
  }

  // Get recommended lessons
  log('\nGetting recommended lessons...', 'yellow');
  await apiCall('GET', `/lessons/recommended/${userId}`, null, true);

  // Get lessons by leg
  log('\nGetting Money Moves lessons...', 'yellow');
  await apiCall('GET', '/lessons/leg/2', null, false);
}

async function testStatistics() {
  section('9. Testing Statistics & Reports');

  log('\nGetting user stats...', 'yellow');
  await apiCall('GET', `/coach/stats/${userId}`, null, true);

  log('\nGetting conversation history...', 'yellow');
  await apiCall('GET', `/coach/chat/history/${userId}?limit=5`, null, true);
}

async function testErrorHandling() {
  section('10. Testing Error Handling');

  log('\nTesting invalid endpoints...', 'yellow');
  await apiCall('GET', '/nonexistent');

  log('\nTesting unauthorized access...', 'yellow');
  authToken = ''; // Clear token
  await apiCall('GET', `/coach/user/${userId}`, null, true);

  log('\nTesting invalid data...', 'yellow');
  await apiCall('POST', '/btss/assess', {
    userId: 'invalid',
    mindsetMysteryScore: 150 // Invalid score
  }, true);
}

async function runAllTests() {
  console.clear();
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║         Coach ManLaw API - Comprehensive Test Suite       ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nBase URL: ${BASE_URL}\n`, 'yellow');

  const startTime = Date.now();

  try {
    await testHealthEndpoints();

    const authSuccess = await testAuthenticationFlow();
    if (!authSuccess) {
      log('\n\nAuthentication failed. Stopping tests.', 'red');
      return;
    }

    await testBTSSAssessment();
    await testCheckInFlow();
    await testChatWithCoach();
    await testActionItems();
    await testWinsTracking();
    await testLessonLibrary();
    await testStatistics();
    await testErrorHandling();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    section('Test Summary');
    log(`✓ All tests completed in ${duration} seconds`, 'green');
    log(`✓ User ID: ${userId}`, 'green');
    log(`✓ Auth Token: ${authToken ? 'Valid' : 'Invalid'}`, authToken ? 'green' : 'red');

  } catch (error) {
    log(`\n\nTest suite failed with error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('This script requires Node.js 18+ with native fetch support');
  console.error('Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
