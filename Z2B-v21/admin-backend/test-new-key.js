const axios = require('axios');

const NEW_KEY = 'emVybzJiaWxsaW9uYWlyZXNAZ21haWwuY29t:O9P1fb-BLiQR1As71WIK0';

console.log('Testing NEW API Key for video generation...\n');

async function testNewKey() {
    try {
        console.log('Attempting to create talk with ElevenLabs voice...');
        const response = await axios.post(
            'https://api.d-id.com/talks',
            {
                source_url: 'https://create-images-results.d-id.com/google-oauth2%7C116509038806242942084/upl_1_zs67cjEXQ2bFJcKp0vsMY/image.jpeg',
                script: {
                    type: 'text',
                    input: 'Hello! This is a test with the new API key.',
                    provider: {
                        type: 'elevenlabs',
                        voice_id: 'Adam'
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Basic ${NEW_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('\n🎉 SUCCESS! Video generation works!');
        console.log('Talk ID:', response.data.id);
        console.log('Status:', response.data.status);
        console.log('\nThe NEW API key is working!\n');

    } catch (error) {
        console.error('\n❌ FAILED');
        console.error('Status:', error.response?.status);
        console.error('Error:', JSON.stringify(error.response?.data, null, 2));

        if (error.response?.status === 500) {
            console.log('\n⚠️ Still getting 500 error.');
            console.log('This might mean Lite plan does NOT support API access.');
            console.log('Only Studio access may be available on Lite plan.\n');
        }
    }
}

testNewKey();
