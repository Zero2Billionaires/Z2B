const axios = require('axios');

const DID_API_KEY = 'emVybzJiaWxsaW9uYWlyZXNAZ21haWwuY29t:ukcyB3Jw1Vg9P1falbuez';
const DID_API_URL = 'https://api.d-id.com';

async function checkProviders() {
    try {
        const response = await axios.get(
            `${DID_API_URL}/tts/voices`,
            {
                headers: {
                    'Authorization': `Basic ${DID_API_KEY}`
                }
            }
        );

        console.log('Analyzing Voice Providers...\n');

        // Group by provider
        const providers = {};
        response.data.forEach(voice => {
            const provider = voice.provider_id || voice.provider || 'unknown';
            if (!providers[provider]) providers[provider] = [];
            providers[provider].push(voice);
        });

        // Show provider summary
        console.log('Available Providers:');
        Object.keys(providers).forEach(provider => {
            console.log(`  ${provider}: ${providers[provider].length} voices`);
        });

        // Show sample voice from first provider
        const firstProvider = Object.keys(providers)[0];
        console.log(`\nSample voice from "${firstProvider}":`);
        const sampleVoice = providers[firstProvider][0];
        console.log(JSON.stringify(sampleVoice, null, 2));

        // Find a good male voice
        console.log('\nSearching for male professional voices...');
        const maleVoices = response.data.filter(v =>
            (v.name && v.name.toLowerCase().includes('male')) ||
            (v.voice_id && (v.voice_id.toLowerCase().includes('male') || v.voice_id.toLowerCase().includes('adam') || v.voice_id.toLowerCase().includes('drew')))
        );

        if (maleVoices.length > 0) {
            console.log(`Found ${maleVoices.length} male voices:`);
            maleVoices.slice(0, 3).forEach(v => {
                console.log(`  - ${v.voice_id || v.name} (${v.provider_id || 'unknown'})`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkProviders();
