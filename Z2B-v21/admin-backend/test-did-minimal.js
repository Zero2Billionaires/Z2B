const axios = require('axios');

const DID_API_KEY = 'emVybzJiaWxsaW9uYWlyZXNAZ21haWwuY29t:ukcyB3Jw1Vg9P1falbuez';

console.log('Testing SIMPLEST possible D-ID request...\n');

async function testMinimal() {
    try {
        const response = await axios.post(
            'https://api.d-id.com/talks',
            {
                source_url: 'https://create-images-results.d-id.com/google-oauth2%7C116509038806242942084/upl_1_zs67cjEXQ2bFJcKp0vsMY/image.jpeg',
                script: {
                    type: 'text',
                    input: 'Hello, this is a test.',
                    provider: {
                        type: 'elevenlabs',
                        voice_id: 'Adam'
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

        console.log('✅ SUCCESS WITH ELEVENLABS!');
        console.log('Talk ID:', response.data.id);
        console.log('\n', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ FAILED WITH ELEVENLABS');
        console.error('Status:', error.response?.status);
        console.error('Error:', JSON.stringify(error.response?.data, null, 2));
    }
}

testMinimal();
