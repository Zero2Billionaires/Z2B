const axios = require('axios');

const DID_API_KEY = 'emVybzJiaWxsaW9uYWlyZXNAZ21haWwuY29t:ukcyB3Jw1Vg9P1falbuez';
const DID_API_URL = 'https://api.d-id.com';

console.log('Testing D-ID Talks Endpoint...\n');

async function testTalks() {
    try {
        const response = await axios.post(
            `${DID_API_URL}/talks`,
            {
                source_url: 'https://create-images-results.d-id.com/google-oauth2%7C116509038806242942084/upl_1_zs67cjEXQ2bFJcKp0vsMY/image.jpeg',
                script: {
                    type: 'text',
                    input: 'Hello, this is a test video from VIDZIE.',
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

        console.log('✅ SUCCESS!');
        console.log('Talk ID:', response.data.id);
        console.log('Status:', response.data.status);
        console.log('\nFull Response:');
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ FAILED!');
        console.error('Status:', error.response?.status);
        console.error('Error:', JSON.stringify(error.response?.data, null, 2));

        if (error.response?.status === 402) {
            console.log('\n💡 This means: Payment/Credits issue');
        } else if (error.response?.status === 403) {
            console.log('\n💡 This means: Forbidden - API key issue');
        } else if (error.response?.status === 400) {
            console.log('\n💡 This means: Bad request - Check request format');
        }
    }
}

testTalks();
