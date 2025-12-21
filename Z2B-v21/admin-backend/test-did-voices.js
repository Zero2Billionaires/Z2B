const axios = require('axios');

const DID_API_KEY = 'emVybzJiaWxsaW9uYWlyZXNAZ21haWwuY29t:ukcyB3Jw1Vg9P1falbuez';
const DID_API_URL = 'https://api.d-id.com';

console.log('Checking Available Voices for Your Plan...\n');

async function checkVoices() {
    try {
        const response = await axios.get(
            `${DID_API_URL}/tts/voices`,
            {
                headers: {
                    'Authorization': `Basic ${DID_API_KEY}`
                }
            }
        );

        console.log('✅ Available Voices:', response.data.length);
        console.log('\nFirst 5 voices:');
        response.data.slice(0, 5).forEach(voice => {
            console.log(`  - ${voice.voice_id} (${voice.provider_id || voice.name})`);
        });

        // Check if Microsoft voices are available
        const microsoftVoices = response.data.filter(v =>
            v.provider_id === 'microsoft' || v.voice_id?.includes('Neural')
        );
        console.log(`\n✅ Microsoft Neural Voices: ${microsoftVoices.length}`);

    } catch (error) {
        console.error('❌ Failed to get voices');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data);
    }
}

checkVoices();
