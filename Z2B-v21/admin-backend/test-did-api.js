const axios = require('axios');

// D-ID API Configuration
const DID_API_KEY = process.env.DID_API_KEY || 'emVybzJiaWxsaW9uYWlyZXNAZ21haWwuY29t:ukcyB3Jw1Vg9P1falbuez';
const DID_API_URL = 'https://api.d-id.com';

console.log('Testing D-ID API...');
console.log('API Key:', DID_API_KEY.substring(0, 20) + '...');
console.log('');

// Test 1: Check account/credits
async function testAccount() {
    console.log('TEST 1: Checking D-ID Account...');
    try {
        const response = await axios.get(
            `${DID_API_URL}/credits`,
            {
                headers: {
                    'Authorization': `Basic ${DID_API_KEY}`
                }
            }
        );
        console.log('✅ Account Status:', response.data);
        console.log('');
        return true;
    } catch (error) {
        console.error('❌ Account Check Failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data || error.message);
        console.log('');
        return false;
    }
}

// Test 2: List available voices
async function testVoices() {
    console.log('TEST 2: Fetching Available Voices...');
    try {
        const response = await axios.get(
            `${DID_API_URL}/tts/voices`,
            {
                headers: {
                    'Authorization': `Basic ${DID_API_KEY}`
                }
            }
        );
        console.log('✅ Available Voices:', response.data.length || 'Unknown');
        console.log('Sample voices:', response.data.slice(0, 3).map(v => v.voice_id || v));
        console.log('');
        return true;
    } catch (error) {
        console.error('❌ Voices Check Failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data || error.message);
        console.log('');
        return false;
    }
}

// Test 3: Simple talk creation (if credits available)
async function testTalkCreation() {
    console.log('TEST 3: Testing Video Generation...');
    try {
        const response = await axios.post(
            `${DID_API_URL}/talks`,
            {
                source_url: 'https://create-images-results.d-id.com/google-oauth2%7C116509038806242942084/upl_1_zs67cjEXQ2bFJcKp0vsMY/image.jpeg',
                script: {
                    type: 'text',
                    input: 'Hello, this is a test.',
                    provider: {
                        type: 'microsoft',
                        voice_id: 'en-US-GuyNeural'
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Basic ${DID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ Talk Created Successfully!');
        console.log('Talk ID:', response.data.id);
        console.log('Status:', response.data.status);
        console.log('');
        return true;
    } catch (error) {
        console.error('❌ Talk Creation Failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data || error.message);
        console.log('');
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('='.repeat(60));
    console.log('D-ID API TEST SUITE');
    console.log('='.repeat(60));
    console.log('');

    const accountOk = await testAccount();
    const voicesOk = await testVoices();

    let talkOk = false;
    if (accountOk) {
        talkOk = await testTalkCreation();
    } else {
        console.log('⚠️ Skipping talk creation test due to account issues');
        console.log('');
    }

    console.log('='.repeat(60));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log('Account Check:', accountOk ? '✅ PASSED' : '❌ FAILED');
    console.log('Voices Check:', voicesOk ? '✅ PASSED' : '❌ FAILED');
    console.log('Talk Creation:', talkOk ? '✅ PASSED' : '❌ FAILED');
    console.log('');

    if (!accountOk) {
        console.log('🔧 SOLUTION:');
        console.log('Your D-ID API key is invalid or expired.');
        console.log('');
        console.log('To fix:');
        console.log('1. Go to https://www.d-id.com/');
        console.log('2. Sign in to your account');
        console.log('3. Go to API Settings');
        console.log('4. Generate a new API key');
        console.log('5. Update DID_API_KEY in Railway environment variables');
        console.log('6. Format: your_email:your_api_key');
        console.log('');
    } else if (!talkOk) {
        console.log('🔧 POSSIBLE ISSUES:');
        console.log('- Account may have no credits');
        console.log('- API rate limit reached');
        console.log('- D-ID service issue');
        console.log('');
        console.log('Check your D-ID dashboard for credit balance.');
        console.log('');
    } else {
        console.log('✅ ALL TESTS PASSED!');
        console.log('Your D-ID API key is working correctly.');
        console.log('');
    }

    console.log('='.repeat(60));
}

runTests().catch(console.error);
