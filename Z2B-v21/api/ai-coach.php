<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';
require_once '../includes/auth.php';

class AICoach {
    private $db;
    private $member_id;

    // Personality traits configuration
    private $personalities = [
        'humor' => ['humor' => 0.8, 'empathy' => 0.6, 'spiritual' => 0.3, 'analytical' => 0.4],
        'wisdom' => ['humor' => 0.2, 'empathy' => 0.9, 'spiritual' => 0.5, 'analytical' => 0.7],
        'faith' => ['humor' => 0.3, 'empathy' => 0.7, 'spiritual' => 0.9, 'analytical' => 0.6],
        'strategy' => ['humor' => 0.2, 'empathy' => 0.4, 'spiritual' => 0.1, 'analytical' => 0.95],
        'hybrid' => ['humor' => 0.6, 'empathy' => 0.8, 'spiritual' => 0.6, 'analytical' => 0.8]
    ];

    public function __construct($database) {
        $this->db = $database;
        $this->member_id = $_SESSION['member_id'] ?? null;
    }

    public function processMessage($input) {
        if (!$this->member_id) {
            return ['error' => 'Authentication required'];
        }

        $message = $input['message'] ?? '';
        $context = $input['context'] ?? 'general';
        $module = $input['module'] ?? null;

        // Get member's progress
        $progress = $this->getMemberProgress();

        // Analyze message sentiment and intent
        $analysis = $this->analyzeMessage($message);

        // Generate hybrid personality response
        $response = $this->generateHybridResponse($message, $analysis, $progress, $context);

        // Save conversation
        $this->saveConversation($message, $response, $analysis);

        // Update progress if needed
        $this->updateProgress($module, $context);

        return [
            'success' => true,
            'response' => $response,
            'progress' => $progress,
            'personality_blend' => $this->getPersonalityBlend($analysis),
            'next_steps' => $this->getNextSteps($progress)
        ];
    }

    private function generateHybridResponse($message, $analysis, $progress, $context) {
        $responses = [];

        // Base response structure
        $baseResponse = $this->getBaseResponse($context, $analysis['intent']);

        // Add humor for motivation
        if ($analysis['needs_motivation'] || $analysis['sentiment'] < 0.5) {
            $responses[] = $this->getHumorResponse($context);
        }

        // Add wisdom for deep questions
        if ($analysis['complexity'] > 0.7 || $context == 'mindset') {
            $responses[] = $this->getWisdomResponse($context);
        }

        // Add spiritual insight for purpose/vision questions
        if ($analysis['spiritual_context'] || $context == 'legacy') {
            $responses[] = $this->getFaithResponse($context);
        }

        // Add tactical advice for business strategy
        if ($context == 'business' || $context == 'marketing' || $analysis['needs_tactics']) {
            $responses[] = $this->getStrategyResponse($context);
        }

        // Blend responses based on personality weights
        $blendedResponse = $this->blendResponses($responses, $analysis);

        // Add progress-specific guidance
        $blendedResponse .= $this->getProgressGuidance($progress);

        return $blendedResponse;
    }

    private function getHumorResponse($context) {
        $responses = [
            'motivation' => "Listen here, future millionaire! 😄 You know what separates the successful from the struggling? It ain't talent - it's showing up when you don't feel like it! From living in poverty to hosting success - the difference? I kept swinging even when I was striking out!",
            'fear' => "Oh, you scared? Good! That means you're about to do something that matters! Fear is just False Evidence Appearing Real. Being broke forever scared me, and that fear pushed me to where I am today!",
            'business' => "Let me tell you something about business - it's like dating. You gotta make them want you before they buy from you! Stop trying to sell and start trying to serve. The money follows the value, not the other way around!"
        ];
        return $responses[$context] ?? $responses['motivation'];
    }

    private function getWisdomResponse($context) {
        $responses = [
            'mindset' => "Let's examine this through the lens of principle-centered leadership. Your current challenge isn't just about external success - it's about aligning your actions with your deepest values. Begin with the end in mind: What legacy do you want to leave?",
            'relationships' => "Seek first to understand, then to be understood. The quality of your business relationships directly correlates with your ability to create win-win scenarios. Trust is the foundation of all sustainable success.",
            'habits' => "You're not your habits - you're the programmer of your habits. Private victories precede public victories. Master yourself first, then you can master your market."
        ];
        return $responses[$context] ?? $responses['mindset'];
    }

    private function getFaithResponse($context) {
        $responses = [
            'purpose' => "Your business isn't just a business - it's a ministry. When you understand that wealth is a tool for kingdom impact, everything changes. Biblical wealth comes from solving problems at scale. What problem has God uniquely equipped you to solve?",
            'wealth' => "Money is a defense, but wisdom is a defense also. The Bible says the wealth of the wicked is stored up for the righteous. Position yourself as a problem solver and watch how provision follows purpose.",
            'legacy' => "You're not building a business, you're building a legacy. Your children's children should benefit from the decisions you make today. That's kingdom thinking - generational impact through marketplace ministry."
        ];
        return $responses[$context] ?? $responses['purpose'];
    }

    private function getStrategyResponse($context) {
        $responses = [
            'strategy' => "Let's look at the data: Your conversion rate is X%, your average order value is Y, and your customer acquisition cost is Z. To scale, we need to optimize these three levers systematically. Here's the exact framework...",
            'marketing' => "Stop guessing, start testing. Run 10 different hooks, measure the click-through rates, double down on winners, cut the losers. Marketing is math, not magic. Your offer needs to be so good people feel stupid saying no.",
            'scaling' => "You don't have a revenue problem, you have a systems problem. Document every process, delegate what you can, delete what doesn't matter, and do only what moves the needle. Scale happens through leverage, not effort."
        ];
        return $responses[$context] ?? $responses['strategy'];
    }

    private function blendResponses($responses, $analysis) {
        if (empty($responses)) {
            return "I understand your question. Let me help you with that...";
        }

        // Combine responses with smooth transitions
        $blended = "";
        $transitions = [
            "Now, here's the thing...",
            "But let me add this...",
            "And from another angle...",
            "Here's what else you need to know..."
        ];

        foreach ($responses as $index => $response) {
            if ($index > 0 && $index < count($responses)) {
                $blended .= " " . $transitions[$index % count($transitions)] . " ";
            }
            $blended .= $response;
        }

        return $blended;
    }

    private function getMemberProgress() {
        $sql = "SELECT * FROM ai_coaching_progress WHERE member_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id]);
        $progress = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$progress) {
            // Initialize progress for new member
            $this->initializeProgress();
            return $this->getMemberProgress();
        }

        return $progress;
    }

    private function initializeProgress() {
        $sql = "INSERT INTO ai_coaching_progress (member_id, program_day, current_phase)
                VALUES (?, 1, 'foundation')";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id]);
    }

    private function analyzeMessage($message) {
        // Simple sentiment and intent analysis
        $analysis = [
            'sentiment' => 0.5,
            'intent' => 'general',
            'complexity' => 0.5,
            'needs_motivation' => false,
            'needs_tactics' => false,
            'spiritual_context' => false
        ];

        // Check for keywords indicating different needs
        $motivationKeywords = ['scared', 'fear', 'worried', 'can\'t', 'difficult', 'hard', 'stuck'];
        $tacticsKeywords = ['how to', 'strategy', 'plan', 'steps', 'process', 'framework'];
        $spiritualKeywords = ['purpose', 'why', 'meaning', 'faith', 'God', 'legacy', 'impact'];

        $messageLower = strtolower($message);

        foreach ($motivationKeywords as $keyword) {
            if (strpos($messageLower, $keyword) !== false) {
                $analysis['needs_motivation'] = true;
                $analysis['sentiment'] -= 0.1;
            }
        }

        foreach ($tacticsKeywords as $keyword) {
            if (strpos($messageLower, $keyword) !== false) {
                $analysis['needs_tactics'] = true;
                $analysis['complexity'] += 0.1;
            }
        }

        foreach ($spiritualKeywords as $keyword) {
            if (strpos($messageLower, $keyword) !== false) {
                $analysis['spiritual_context'] = true;
            }
        }

        // Detect intent
        if (strpos($messageLower, '?') !== false) {
            $analysis['intent'] = 'question';
        } elseif (strpos($messageLower, 'help') !== false || strpos($messageLower, 'need') !== false) {
            $analysis['intent'] = 'help';
        }

        return $analysis;
    }

    private function saveConversation($message, $response, $analysis) {
        $sql = "INSERT INTO ai_conversations
                (member_id, message_type, message, personality_used, sentiment_score, session_id)
                VALUES
                (?, 'user', ?, NULL, ?, ?),
                (?, 'ai', ?, 'hybrid', ?, ?)";

        $sessionId = session_id();
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $this->member_id, $message, $analysis['sentiment'], $sessionId,
            $this->member_id, $response, 0.8, $sessionId
        ]);
    }

    private function updateProgress($module, $context) {
        if (!$module) return;

        $sql = "UPDATE ai_coaching_progress
                SET modules_completed = modules_completed + 1,
                    engagement_score = engagement_score + 5,
                    last_interaction = NOW()
                WHERE member_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->member_id]);

        // Update specific score based on context
        $scoreField = '';
        switch($context) {
            case 'mindset': $scoreField = 'mindset_score'; break;
            case 'money': $scoreField = 'money_score'; break;
            case 'marketing': $scoreField = 'marketing_score'; break;
            case 'management': $scoreField = 'management_score'; break;
        }

        if ($scoreField) {
            $sql = "UPDATE ai_coaching_progress
                    SET $scoreField = $scoreField + 10
                    WHERE member_id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$this->member_id]);
        }
    }

    private function getProgressGuidance($progress) {
        $day = $progress['program_day'];
        $phase = $progress['current_phase'];

        $guidance = "\n\n📊 **Your Progress Update:**\n";
        $guidance .= "Day $day of your 90-day transformation | Phase: " . ucfirst($phase) . "\n";

        if ($day < 30) {
            $guidance .= "🎯 Focus Area: Building your foundation. Master the basics before advancing.";
        } elseif ($day < 60) {
            $guidance .= "⚡ Focus Area: Transformation phase. Time to implement and see results.";
        } elseif ($day < 90) {
            $guidance .= "🚀 Focus Area: Mastery phase. Refine, optimize, and scale what's working.";
        } else {
            $guidance .= "👑 Focus Area: Legacy phase. You're ready to teach and lead others.";
        }

        return $guidance;
    }

    private function getNextSteps($progress) {
        $steps = [];

        // Based on scores, recommend next modules
        if ($progress['mindset_score'] < 50) {
            $steps[] = "Complete Mindset Mastery Module 1: Breaking Limiting Beliefs";
        }
        if ($progress['money_score'] < 50) {
            $steps[] = "Start Money Moves Module 1: Financial Literacy Fundamentals";
        }
        if ($progress['marketing_score'] < 50) {
            $steps[] = "Begin Marketing Magic Module 1: Understanding Your Market";
        }
        if ($progress['management_score'] < 50) {
            $steps[] = "Explore Management Mastery Module 1: Self-Management First";
        }

        return $steps;
    }

    private function getPersonalityBlend($analysis) {
        $blend = [];

        if ($analysis['needs_motivation']) {
            $blend['Humor'] = "40%";
        }
        if ($analysis['spiritual_context']) {
            $blend['Faith'] = "30%";
        }
        if ($analysis['needs_tactics']) {
            $blend['Strategy'] = "50%";
        }
        if ($analysis['complexity'] > 0.6) {
            $blend['Wisdom'] = "35%";
        }

        // Normalize to 100%
        if (empty($blend)) {
            $blend = [
                'Humor' => '25%',
                'Wisdom' => '25%',
                'Faith' => '25%',
                'Strategy' => '25%'
            ];
        }

        return $blend;
    }

    private function getBaseResponse($context, $intent) {
        // Default response templates
        $templates = [
            'greeting' => "Hey there, legacy builder! Ready to transform your life today? 🚀",
            'question' => "Great question! Let me break this down for you...",
            'help' => "I'm here to help you succeed. Let's tackle this together...",
            'general' => "I understand. Here's what you need to know..."
        ];

        return $templates[$intent] ?? $templates['general'];
    }
}

// Process request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $coach = new AICoach($db);
    $response = $coach->processMessage($input);
    echo json_encode($response);
} else {
    echo json_encode(['error' => 'Method not allowed']);
}