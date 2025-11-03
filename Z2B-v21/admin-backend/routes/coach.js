const express = require('express');
const router = express.Router();

// Coach Manlaw - Claude API Proxy
// This prevents exposing API keys on the frontend

router.post('/chat', async (req, res) => {
    try {
        const { systemPrompt, userMessage } = req.body;

        if (!systemPrompt || !userMessage) {
            return res.status(400).json({
                error: 'Missing required fields: systemPrompt and userMessage'
            });
        }

        // Get Claude API key from environment
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            console.error('⚠️ ANTHROPIC_API_KEY not set in environment variables');
            return res.status(500).json({
                error: 'AI service not configured. Please contact support.'
            });
        }

        // Call Anthropic Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userMessage
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Claude API error:', response.status, errorData);
            return res.status(response.status).json({
                error: errorData.error?.message || 'AI service error'
            });
        }

        const data = await response.json();

        // Return the Claude response
        res.json(data);

    } catch (error) {
        console.error('Coach chat error:', error);
        res.status(500).json({
            error: 'Failed to process coaching request'
        });
    }
});

// Activity response endpoint (for structured activities)
router.post('/activity-response', async (req, res) => {
    try {
        const { activity, userInput, context } = req.body;

        // For now, just pass through to the main chat endpoint
        // You can add activity-specific logic here later
        const systemPrompt = `You are Coach Manlaw, a supportive business coach helping entrepreneurs build their legacy.

Activity Context: ${activity}
${context ? `Additional Context: ${context}` : ''}

Provide encouraging, actionable feedback on the user's response.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2048,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userInput
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                error: errorData.error?.message || 'AI service error'
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Activity response error:', error);
        res.status(500).json({
            error: 'Failed to process activity response'
        });
    }
});

module.exports = router;
