#!/usr/bin/env node
/**
 * Coach Manlaw - Command Line Interface
 * Direct access without browser CORS issues
 *
 * Usage: node coach-cli.js
 */

const readline = require('readline');
const https = require('https');

const API_KEY = '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';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n========================================');
console.log('  🤖 COACH MANLAW - CLI Version');
console.log('  Your 24/7 AI Business Coach');
console.log('========================================\n');
console.log('💡 Type your questions and press Enter');
console.log('💡 Type "exit" or "quit" to end session');
console.log('💡 Type "clear" to clear screen\n');
console.log('========================================\n');

const conversationHistory = [];

function callClaudeAPI(userMessage) {
    return new Promise((resolve, reject) => {
        const systemPrompt = `You are Coach Manlaw, a powerhouse AI billionaire coach for the Zero2Billionaires (Z2B) platform.

YOUR PERSONALITY FRAMEWORK (Coach Manlaw DNA):
- 15% Biblical Principles - Grounded wisdom from Proverbs, Matthew, Philippians
- 10% Humor & Wit - Lighthearted observations that cut through overwhelm
- 25% Deep Psychology - Understanding human behavior, habits, beliefs, mental models
- 25% Visionary Leadership - Helping Legacy Builders see 10x beyond their vision
- 25% Strategic Business Execution - Actionable steps, systems, frameworks

YOUR MISSION:
Transform employees into Legacy Builders who build Billionaire Mindsets, Money Systems, Movements, and Legacies.

THE FOUR LEGS OF A BILLIONAIRE TABLE:
1. 🧠 Mindset Mystery - Identity transformation, belief systems, vision clarity
2. 💸 Money Moves - Financial intelligence, wealth multiplication, marketing mastery
3. ⚙️ Legacy Missions - Scalable systems, automation, purpose-driven business
4. 🌍 Momentum Movement - Impact creation, influence amplification, community building

Respond as Coach Manlaw would - sharp, strategic, faith-filled, funny when appropriate, and always actionable!`;

        const postData = JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [{
                role: 'user',
                content: systemPrompt + '\n\nUser: ' + userMessage
            }]
        });

        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        resolve(response.content[0].text);
                    } catch (e) {
                        reject(new Error('Failed to parse response'));
                    }
                } else {
                    reject(new Error(`API Error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

function askQuestion() {
    rl.question('You: ', async (input) => {
        const message = input.trim();

        if (!message) {
            askQuestion();
            return;
        }

        if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
            console.log('\n👋 Keep building your legacy! See you next time.\n');
            rl.close();
            return;
        }

        if (message.toLowerCase() === 'clear') {
            console.clear();
            console.log('\n🤖 Coach Manlaw is ready!\n');
            askQuestion();
            return;
        }

        // Show thinking indicator
        process.stdout.write('\n🤔 Coach Manlaw is thinking...\n');

        try {
            const response = await callClaudeAPI(message);

            console.log('\n' + '='.repeat(60));
            console.log('Coach Manlaw:');
            console.log('='.repeat(60));
            console.log(response);
            console.log('='.repeat(60) + '\n');

            conversationHistory.push({ user: message, coach: response });

        } catch (error) {
            console.log('\n❌ Error:', error.message);
            console.log('💡 Please check your internet connection and API key.\n');
        }

        askQuestion();
    });
}

// Start the conversation
askQuestion();
