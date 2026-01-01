/**
 * ZYRO - CEO or Minion Quiz
 * Zero2Billionaires Ecosystem
 *
 * Interactive personality quiz for entrepreneurs
 */

class ZyroQuizEngine {
    constructor(config, pointsCallback = null) {
        this.config = config;
        this.pointsCallback = pointsCallback;
        this.currentQuiz = null;
        this.completedQuizzes = [];
    }

    /**
     * Initialize quiz engine
     */
    initialize() {
        this.loadHistory();
        return {
            availableQuizzes: this.getAvailableQuizzes(),
            completedCount: this.completedQuizzes.length,
            points: this.completedQuizzes.length * this.config.QUIZ_TEMPLATES[0]?.rewards?.complete || 50
        };
    }

    /**
     * Get list of available quizzes
     */
    getAvailableQuizzes() {
        return this.config.QUIZ_TEMPLATES.map(quiz => ({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            questionCount: quiz.questions.length,
            estimatedTime: `${Math.ceil(quiz.questions.length * 0.5)} min`,
            resultTypes: Object.keys(quiz.results).length
        }));
    }

    /**
     * Start a new quiz
     */
    startQuiz(quizId) {
        const template = this.config.QUIZ_TEMPLATES.find(q => q.id === quizId);

        if (!template) {
            return {
                success: false,
                message: 'Quiz not found'
            };
        }

        this.currentQuiz = {
            id: Date.now(),
            templateId: quizId,
            title: template.title,
            questions: template.questions,
            results: template.results,
            currentQuestionIndex: 0,
            answers: [],
            score: 0,
            traits: {},
            completed: false,
            startedAt: new Date().toISOString(),
            completedAt: null
        };

        return {
            success: true,
            quiz: {
                id: this.currentQuiz.id,
                title: this.currentQuiz.title,
                totalQuestions: this.currentQuiz.questions.length
            },
            firstQuestion: this.getCurrentQuestion(),
            message: 'Quiz started! Answer honestly!'
        };
    }

    /**
     * Get current question
     */
    getCurrentQuestion() {
        if (!this.currentQuiz) return null;

        const index = this.currentQuiz.currentQuestionIndex;
        if (index >= this.currentQuiz.questions.length) {
            return null; // Quiz finished
        }

        const question = this.currentQuiz.questions[index];

        return {
            questionNumber: index + 1,
            totalQuestions: this.currentQuiz.questions.length,
            question: question.question,
            options: question.options.map((opt, i) => ({
                index: i,
                text: opt.text
                // Don't reveal points or traits yet
            })),
            progress: Math.round((index / this.currentQuiz.questions.length) * 100)
        };
    }

    /**
     * Answer current question
     */
    answerQuestion(optionIndex) {
        if (!this.currentQuiz) {
            return {
                success: false,
                message: 'No active quiz. Start one first!'
            };
        }

        const currentIndex = this.currentQuiz.currentQuestionIndex;
        const question = this.currentQuiz.questions[currentIndex];

        if (!question) {
            return {
                success: false,
                message: 'No current question'
            };
        }

        if (optionIndex < 0 || optionIndex >= question.options.length) {
            return {
                success: false,
                message: 'Invalid option'
            };
        }

        const selectedOption = question.options[optionIndex];

        // Record answer
        this.currentQuiz.answers.push({
            questionIndex: currentIndex,
            question: question.question,
            selectedOption: selectedOption.text,
            optionIndex: optionIndex,
            points: selectedOption.points,
            trait: selectedOption.trait
        });

        // Update score and traits
        this.currentQuiz.score += selectedOption.points;
        const trait = selectedOption.trait;
        this.currentQuiz.traits[trait] = (this.currentQuiz.traits[trait] || 0) + 1;

        // Move to next question
        this.currentQuiz.currentQuestionIndex++;

        const isFinished = this.currentQuiz.currentQuestionIndex >= this.currentQuiz.questions.length;

        if (isFinished) {
            return this.completeQuiz();
        } else {
            return {
                success: true,
                answered: true,
                nextQuestion: this.getCurrentQuestion(),
                progress: Math.round((this.currentQuiz.currentQuestionIndex / this.currentQuiz.questions.length) * 100)
            };
        }
    }

    /**
     * Complete the quiz and calculate results
     */
    completeQuiz() {
        if (!this.currentQuiz) {
            return {
                success: false,
                message: 'No active quiz'
            };
        }

        // Calculate result type
        const resultType = this.calculateResultType();
        const result = this.currentQuiz.results[resultType];

        if (!result) {
            console.error('Result type not found:', resultType);
            return {
                success: false,
                message: 'Error calculating result'
            };
        }

        // Mark as completed
        this.currentQuiz.completed = true;
        this.currentQuiz.completedAt = new Date().toISOString();
        this.currentQuiz.resultType = resultType;
        this.currentQuiz.result = result;

        // Calculate detailed analysis
        const analysis = this.generateAnalysis();
        this.currentQuiz.analysis = analysis;

        // Save to history
        this.completedQuizzes.push({
            ...this.currentQuiz
        });
        this.saveHistory();

        // Award points
        const points = this.config.HUSTLE_MADLIBS.rewards?.complete || 50;
        if (this.pointsCallback) {
            this.pointsCallback(points, 'Quiz completed');
        }

        return {
            success: true,
            completed: true,
            result: {
                type: resultType,
                title: result.title,
                description: result.description,
                emoji: result.emoji,
                score: this.currentQuiz.score,
                maxScore: this.getMaxScore(),
                percentage: Math.round((this.currentQuiz.score / this.getMaxScore()) * 100)
            },
            analysis: analysis,
            points: points,
            message: this.getResultMessage(resultType),
            canShare: true
        };
    }

    /**
     * Calculate result type based on score
     */
    calculateResultType() {
        const score = this.currentQuiz.score;
        const results = this.currentQuiz.results;

        // Find matching result based on score range
        for (const [type, result] of Object.entries(results)) {
            const [min, max] = result.score;
            if (score >= min && score <= max) {
                return type;
            }
        }

        // Fallback to middle result
        return Object.keys(results)[Math.floor(Object.keys(results).length / 2)];
    }

    /**
     * Get maximum possible score
     */
    getMaxScore() {
        return this.currentQuiz.questions.reduce((total, question) => {
            const maxPoints = Math.max(...question.options.map(opt => opt.points));
            return total + maxPoints;
        }, 0);
    }

    /**
     * Generate detailed analysis
     */
    generateAnalysis() {
        const traits = this.currentQuiz.traits;
        const totalAnswers = this.currentQuiz.answers.length;

        // Calculate trait percentages
        const traitPercentages = {};
        for (const [trait, count] of Object.entries(traits)) {
            traitPercentages[trait] = Math.round((count / totalAnswers) * 100);
        }

        // Get dominant trait
        const dominantTrait = Object.entries(traits)
            .sort((a, b) => b[1] - a[1])[0];

        // Generate strengths and areas for improvement
        const strengths = this.getStrengths(traitPercentages);
        const improvements = this.getImprovements(traitPercentages);
        const recommendations = this.getRecommendations(this.currentQuiz.resultType);

        return {
            traitBreakdown: traitPercentages,
            dominantTrait: dominantTrait ? {
                name: dominantTrait[0],
                percentage: traitPercentages[dominantTrait[0]]
            } : null,
            strengths: strengths,
            improvements: improvements,
            recommendations: recommendations,
            nextSteps: this.getNextSteps(this.currentQuiz.resultType)
        };
    }

    /**
     * Get strengths based on traits
     */
    getStrengths(traitPercentages) {
        const strengths = [];

        if (traitPercentages.ceo >= 60) {
            strengths.push('🎯 Natural leadership abilities');
            strengths.push('💪 Strong decision-making skills');
            strengths.push('🚀 Entrepreneurial mindset');
        }

        if (traitPercentages.hustler >= 40) {
            strengths.push('⚡ Great work ethic');
            strengths.push('🔥 Resilience and persistence');
            strengths.push('💼 Action-oriented approach');
        }

        if (traitPercentages.minion >= 50) {
            strengths.push('🤝 Team player mentality');
            strengths.push('📋 Strong execution skills');
            strengths.push('🎓 Willingness to learn');
        }

        return strengths.length > 0 ? strengths : ['💫 Developing your unique strengths'];
    }

    /**
     * Get areas for improvement
     */
    getImprovements(traitPercentages) {
        const improvements = [];

        if (traitPercentages.minion >= 70) {
            improvements.push('Build more confidence in decision-making');
            improvements.push('Take calculated risks');
            improvements.push('Develop leadership skills');
        }

        if (traitPercentages.ceo >= 80) {
            improvements.push('Remember to delegate effectively');
            improvements.push('Stay connected with team needs');
            improvements.push('Balance vision with execution');
        }

        if (traitPercentages.hustler >= 60) {
            improvements.push('Work smarter, not just harder');
            improvements.push('Build systems for efficiency');
            improvements.push('Balance hustle with strategy');
        }

        return improvements.length > 0 ? improvements : ['Keep learning and growing'];
    }

    /**
     * Get recommendations based on result type
     */
    getRecommendations(resultType) {
        const recommendations = {
            minion: [
                'Start with small side hustles to build confidence',
                'Find a mentor in the Z2B community',
                'Take the ZYRO Daily Challenges to develop entrepreneurial habits',
                'Focus on skill-building courses'
            ],
            hustler: [
                'Channel your energy into one focused business idea',
                'Use BENOWN to create content and build your brand',
                'Connect with ZYRA to start capturing leads',
                'Join Z2B masterminds for accountability'
            ],
            boss: [
                'Scale your existing business with Z2B tools',
                'Start mentoring others in the community',
                'Build passive income streams',
                'Document your journey for others to learn from'
            ],
            ceo: [
                'Launch your own coaching or consulting business',
                'Build a team and start delegating',
                'Create your own products or courses',
                'Share your expertise through Z2B platform'
            ]
        };

        return recommendations[resultType] || recommendations.hustler;
    }

    /**
     * Get next steps
     */
    getNextSteps(resultType) {
        const steps = {
            minion: [
                '1. Complete all ZYRO games this week',
                '2. Watch 3 Z2B success stories',
                '3. Join the Z2B Discord community',
                '4. Start your first side hustle idea',
                '5. Retake this quiz in 30 days'
            ],
            hustler: [
                '1. Define your #1 business idea',
                '2. Create content with BENOWN',
                '3. Set up lead capture with ZYRA',
                '4. Make your first sale',
                '5. Share your wins in the community'
            ],
            boss: [
                '1. Automate one aspect of your business',
                '2. Hire your first team member or VA',
                '3. Scale to $10K/month revenue',
                '4. Document your systems',
                '5. Help others reach their first $1K'
            ],
            ceo: [
                '1. Build a 7-figure business plan',
                '2. Create a personal brand',
                '3. Launch your own coaching program',
                '4. Speak at Z2B events',
                '5. Impact 1000+ aspiring entrepreneurs'
            ]
        };

        return steps[resultType] || steps.hustler;
    }

    /**
     * Get result message
     */
    getResultMessage(resultType) {
        const messages = {
            minion: "Don't worry - every CEO started here! Time to level up! 💪",
            hustler: "You've got the spirit! Now channel that energy! 🔥",
            boss: "You're doing great! Keep building! 🚀",
            ceo: "Natural-born leader! Time to dominate! 👑"
        };

        return messages[resultType] || "Great job completing the quiz!";
    }

    /**
     * Get quiz history
     */
    getHistory(limit = 10) {
        return this.completedQuizzes
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, limit);
    }

    /**
     * Get quiz by ID
     */
    getQuizById(quizId) {
        return this.completedQuizzes.find(q => q.id === quizId);
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const completed = this.completedQuizzes.length;

        if (completed === 0) {
            return {
                totalCompleted: 0,
                averageScore: 0,
                mostCommonResult: null,
                improvement: null
            };
        }

        const avgScore = Math.round(
            this.completedQuizzes.reduce((sum, q) => sum + q.score, 0) / completed
        );

        const resultCounts = {};
        this.completedQuizzes.forEach(q => {
            resultCounts[q.resultType] = (resultCounts[q.resultType] || 0) + 1;
        });

        const mostCommon = Object.entries(resultCounts)
            .sort((a, b) => b[1] - a[1])[0];

        // Check for improvement (first vs last quiz)
        const firstQuiz = this.completedQuizzes[this.completedQuizzes.length - 1];
        const lastQuiz = this.completedQuizzes[0];
        const improvement = lastQuiz.score > firstQuiz.score;

        return {
            totalCompleted: completed,
            averageScore: avgScore,
            mostCommonResult: mostCommon ? {
                type: mostCommon[0],
                count: mostCommon[1]
            } : null,
            improvement: improvement,
            firstScore: firstQuiz.score,
            latestScore: lastQuiz.score,
            scoreChange: lastQuiz.score - firstQuiz.score
        };
    }

    /**
     * Compare quiz results over time
     */
    getProgressComparison() {
        if (this.completedQuizzes.length < 2) {
            return {
                available: false,
                message: 'Take the quiz at least twice to see progress'
            };
        }

        const quizzes = this.completedQuizzes
            .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

        const first = quizzes[0];
        const latest = quizzes[quizzes.length - 1];

        return {
            available: true,
            first: {
                date: first.completedAt,
                result: first.resultType,
                score: first.score
            },
            latest: {
                date: latest.completedAt,
                result: latest.resultType,
                score: latest.score
            },
            improvement: {
                score: latest.score - first.score,
                percentage: Math.round(((latest.score - first.score) / first.score) * 100),
                leveledUp: this.getResultLevel(latest.resultType) > this.getResultLevel(first.resultType)
            }
        };
    }

    /**
     * Get result level (for comparison)
     */
    getResultLevel(resultType) {
        const levels = { minion: 1, hustler: 2, boss: 3, ceo: 4 };
        return levels[resultType] || 0;
    }

    /**
     * Generate shareable content
     */
    generateShareContent(quizId, platform = 'instagram') {
        const quiz = this.getQuizById(quizId);
        if (!quiz) return null;

        const result = quiz.result;
        const hook = `🎯 I just took the ${quiz.title}!`;

        const templates = {
            instagram: {
                format: `${hook}\n\n${result.emoji} Result: ${result.title}\n\n"${result.description}"\n\n💯 Score: ${quiz.score}/${this.getMaxScoreForQuiz(quiz)}\n\n#CEOorMinion #ZYRO #Z2B #EntrepreneurLife\n\nTake the quiz: ${this.config.SOCIAL_SHARING?.shareURL || 'zero2billionaires.com/zyro'}`,
                visual: `${result.emoji} ${result.title}`
            },
            tiktok: {
                format: `POV: You just found out your entrepreneur personality type 🎭\n\nI'm a ${result.title}! ${result.emoji}\n\nWhat are you? 👇\n\n#CEOorMinion #ZYRO #Entrepreneur`,
                visual: result.title
            },
            twitter: {
                format: `${result.emoji} Just discovered I'm a ${result.title}!\n\nTook the CEO or Minion Quiz and scored ${quiz.score} points.\n\nWhat's your entrepreneur type?\n\n#ZYRO #Z2B`,
                charCount: null
            },
            facebook: {
                format: `${hook}\n\n${result.emoji} My Result: ${result.title}\n\n${result.description}\n\nScore: ${quiz.score}/${this.getMaxScoreForQuiz(quiz)}\n\nFind out your entrepreneur personality: ${this.config.SOCIAL_SHARING?.shareURL || 'zero2billionaires.com/zyro'}`
            }
        };

        const content = templates[platform] || templates.instagram;

        if (platform === 'twitter') {
            content.charCount = content.format.length;
            content.withinLimit = content.charCount <= 280;
        }

        return content;
    }

    /**
     * Get max score for a specific quiz
     */
    getMaxScoreForQuiz(quiz) {
        return quiz.questions.reduce((total, question) => {
            const maxPoints = Math.max(...question.options.map(opt => opt.points));
            return total + maxPoints;
        }, 0);
    }

    /**
     * Reset current quiz
     */
    reset() {
        this.currentQuiz = null;
        return {
            success: true,
            message: 'Quiz reset. Start a new one!'
        };
    }

    /**
     * Get current progress
     */
    getCurrentProgress() {
        if (!this.currentQuiz) {
            return {
                active: false,
                message: 'No active quiz'
            };
        }

        const answered = this.currentQuiz.answers.length;
        const total = this.currentQuiz.questions.length;
        const progress = Math.round((answered / total) * 100);

        return {
            active: true,
            quiz: {
                id: this.currentQuiz.id,
                title: this.currentQuiz.title
            },
            answered: answered,
            total: total,
            progress: progress,
            remaining: total - answered,
            currentScore: this.currentQuiz.score,
            currentQuestion: this.getCurrentQuestion()
        };
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('zyro_quiz_history', JSON.stringify(this.completedQuizzes));
        } catch (e) {
            console.error('Failed to save quiz history:', e);
        }
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('zyro_quiz_history');
            if (saved) {
                this.completedQuizzes = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load quiz history:', e);
            this.completedQuizzes = [];
        }
    }

    /**
     * Clear all history
     */
    clearHistory() {
        this.completedQuizzes = [];
        this.currentQuiz = null;
        try {
            localStorage.removeItem('zyro_quiz_history');
        } catch (e) {
            console.error('Failed to clear history:', e);
        }
    }

    /**
     * Export quiz data
     */
    export() {
        return {
            exportedAt: new Date().toISOString(),
            total: this.completedQuizzes.length,
            quizzes: this.completedQuizzes,
            statistics: this.getStatistics(),
            progress: this.getProgressComparison()
        };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.ZyroQuizEngine = ZyroQuizEngine;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZyroQuizEngine;
}
