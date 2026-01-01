/**
 * ZYRO - SideGig Bingo
 * Zero2Billionaires Ecosystem
 *
 * Gamified task board with bingo mechanics
 */

class ZyroSideGigBingo {
    constructor(config, pointsCallback = null) {
        this.config = config;
        this.pointsCallback = pointsCallback; // Callback to award points
        this.board = null;
        this.completedTasks = [];
        this.bingos = [];
        this.boardId = null;
        this.createdAt = null;
        this.lastUpdated = null;
    }

    /**
     * Initialize bingo board
     */
    initialize(boardId = 'default') {
        this.boardId = boardId;
        this.loadBoard();

        if (!this.board) {
            this.createNewBoard();
        }

        return {
            board: this.board,
            completed: this.completedTasks.length,
            total: 25,
            progress: Math.round((this.completedTasks.length / 25) * 100),
            bingos: this.bingos.length,
            canReset: this.completedTasks.length === 25
        };
    }

    /**
     * Create a new bingo board
     */
    createNewBoard() {
        const tasks = this.config.SIDEGIG_BINGO.tasks;

        // Create 5x5 grid
        this.board = [];
        let taskIndex = 0;

        for (let row = 0; row < 5; row++) {
            const boardRow = [];
            for (let col = 0; col < 5; col++) {
                const task = tasks[taskIndex];
                boardRow.push({
                    id: `${row}-${col}`,
                    row: row,
                    col: col,
                    text: task.text,
                    points: task.points,
                    icon: task.icon,
                    category: task.category || 'general',
                    isFreeSpace: task.text.includes('FREE SPACE'),
                    completed: task.text.includes('FREE SPACE'), // Free space auto-completed
                    completedAt: task.text.includes('FREE SPACE') ? new Date().toISOString() : null,
                    proofUrl: null
                });
                taskIndex++;
            }
            this.board.push(boardRow);
        }

        // Mark free space as completed
        const freeSpace = this.board[2][2]; // Center square
        if (freeSpace.isFreeSpace) {
            this.completedTasks.push(freeSpace.id);
        }

        this.createdAt = new Date().toISOString();
        this.lastUpdated = new Date().toISOString();
        this.bingos = [];

        this.saveBoard();
    }

    /**
     * Get task by ID
     */
    getTask(taskId) {
        const [row, col] = taskId.split('-').map(Number);
        return this.board[row][col];
    }

    /**
     * Complete a task
     */
    completeTask(taskId, proofData = {}) {
        const task = this.getTask(taskId);

        if (!task) {
            return {
                success: false,
                message: 'Task not found'
            };
        }

        if (task.completed) {
            return {
                success: false,
                message: 'Task already completed!'
            };
        }

        if (task.isFreeSpace) {
            return {
                success: false,
                message: 'Free space is already complete!'
            };
        }

        // Mark as completed
        task.completed = true;
        task.completedAt = new Date().toISOString();
        task.proofUrl = proofData.url || null;
        task.proofNote = proofData.note || null;

        this.completedTasks.push(taskId);
        this.lastUpdated = new Date().toISOString();

        // Calculate points
        const points = task.points;

        // Check for new bingos
        const newBingos = this.checkForBingos();
        const bingoBonus = newBingos.length * this.config.SIDEGIG_BINGO.rewards.bingo;

        // Check for full board
        const fullBoardBonus = this.isFullBoard()
            ? this.config.SIDEGIG_BINGO.rewards.fullBoard
            : 0;

        const totalPoints = points + bingoBonus + fullBoardBonus;

        // Award points via callback
        if (this.pointsCallback) {
            this.pointsCallback(totalPoints, 'Bingo task completed');
        }

        // Save board
        this.saveBoard();

        return {
            success: true,
            task: task,
            points: points,
            bingoBonus: bingoBonus,
            fullBoardBonus: fullBoardBonus,
            totalPoints: totalPoints,
            newBingos: newBingos,
            isFullBoard: this.isFullBoard(),
            completedCount: this.completedTasks.length,
            message: this.getCompletionMessage(newBingos, this.isFullBoard())
        };
    }

    /**
     * Uncomplete a task (for testing/correction)
     */
    uncompleteTask(taskId) {
        const task = this.getTask(taskId);

        if (!task || task.isFreeSpace) {
            return { success: false, message: 'Cannot uncomplete this task' };
        }

        task.completed = false;
        task.completedAt = null;
        task.proofUrl = null;
        task.proofNote = null;

        this.completedTasks = this.completedTasks.filter(id => id !== taskId);
        this.lastUpdated = new Date().toISOString();

        // Re-check bingos
        this.bingos = [];
        this.checkForBingos();

        this.saveBoard();

        return { success: true, message: 'Task unmarked' };
    }

    /**
     * Check for bingos (rows, columns, diagonals)
     */
    checkForBingos() {
        const newBingos = [];

        // Check rows
        for (let row = 0; row < 5; row++) {
            if (this.isRowComplete(row)) {
                const bingoId = `row-${row}`;
                if (!this.bingos.find(b => b.id === bingoId)) {
                    const bingo = {
                        id: bingoId,
                        type: 'row',
                        index: row,
                        completedAt: new Date().toISOString()
                    };
                    this.bingos.push(bingo);
                    newBingos.push(bingo);
                }
            }
        }

        // Check columns
        for (let col = 0; col < 5; col++) {
            if (this.isColumnComplete(col)) {
                const bingoId = `col-${col}`;
                if (!this.bingos.find(b => b.id === bingoId)) {
                    const bingo = {
                        id: bingoId,
                        type: 'column',
                        index: col,
                        completedAt: new Date().toISOString()
                    };
                    this.bingos.push(bingo);
                    newBingos.push(bingo);
                }
            }
        }

        // Check diagonal (top-left to bottom-right)
        if (this.isDiagonalComplete(true)) {
            const bingoId = 'diag-1';
            if (!this.bingos.find(b => b.id === bingoId)) {
                const bingo = {
                    id: bingoId,
                    type: 'diagonal',
                    index: 1,
                    completedAt: new Date().toISOString()
                };
                this.bingos.push(bingo);
                newBingos.push(bingo);
            }
        }

        // Check diagonal (top-right to bottom-left)
        if (this.isDiagonalComplete(false)) {
            const bingoId = 'diag-2';
            if (!this.bingos.find(b => b.id === bingoId)) {
                const bingo = {
                    id: bingoId,
                    type: 'diagonal',
                    index: 2,
                    completedAt: new Date().toISOString()
                };
                this.bingos.push(bingo);
                newBingos.push(bingo);
            }
        }

        return newBingos;
    }

    /**
     * Check if a row is complete
     */
    isRowComplete(row) {
        return this.board[row].every(task => task.completed);
    }

    /**
     * Check if a column is complete
     */
    isColumnComplete(col) {
        for (let row = 0; row < 5; row++) {
            if (!this.board[row][col].completed) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if a diagonal is complete
     */
    isDiagonalComplete(topLeftToBottomRight) {
        for (let i = 0; i < 5; i++) {
            const row = i;
            const col = topLeftToBottomRight ? i : 4 - i;
            if (!this.board[row][col].completed) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if full board is complete
     */
    isFullBoard() {
        return this.completedTasks.length === 25;
    }

    /**
     * Get completion message
     */
    getCompletionMessage(newBingos, isFullBoard) {
        if (isFullBoard) {
            return "🎉 FULL BOARD! You're a hustle legend! Time to celebrate!";
        } else if (newBingos.length > 1) {
            return `🔥 ${newBingos.length} BINGOS! You're on fire!`;
        } else if (newBingos.length === 1) {
            return `🎯 BINGO! ${newBingos[0].type.toUpperCase()} complete!`;
        } else {
            return `✅ Task complete! ${25 - this.completedTasks.length} to go!`;
        }
    }

    /**
     * Get board statistics
     */
    getStatistics() {
        const totalTasks = 25;
        const completedCount = this.completedTasks.length;
        const progress = Math.round((completedCount / totalTasks) * 100);

        // Calculate category breakdown
        const categoryStats = {};
        this.board.flat().forEach(task => {
            const cat = task.category;
            if (!categoryStats[cat]) {
                categoryStats[cat] = { total: 0, completed: 0 };
            }
            categoryStats[cat].total++;
            if (task.completed) {
                categoryStats[cat].completed++;
            }
        });

        // Calculate total points earned
        const pointsEarned = this.board.flat()
            .filter(task => task.completed)
            .reduce((sum, task) => sum + task.points, 0);

        const bingoPoints = this.bingos.length * this.config.SIDEGIG_BINGO.rewards.bingo;
        const fullBoardPoints = this.isFullBoard() ? this.config.SIDEGIG_BINGO.rewards.fullBoard : 0;
        const totalPoints = pointsEarned + bingoPoints + fullBoardPoints;

        return {
            totalTasks: totalTasks,
            completed: completedCount,
            remaining: totalTasks - completedCount,
            progress: progress,
            bingos: this.bingos.length,
            bingoDetails: this.getBingoDetails(),
            isFullBoard: this.isFullBoard(),
            categoryBreakdown: categoryStats,
            pointsEarned: pointsEarned,
            bingoBonus: bingoPoints,
            fullBoardBonus: fullBoardPoints,
            totalPoints: totalPoints,
            createdAt: this.createdAt,
            lastUpdated: this.lastUpdated,
            daysActive: this.getDaysActive()
        };
    }

    /**
     * Get bingo details
     */
    getBingoDetails() {
        return this.bingos.map(bingo => {
            let description;
            if (bingo.type === 'row') {
                description = `Row ${bingo.index + 1}`;
            } else if (bingo.type === 'column') {
                description = `Column ${bingo.index + 1}`;
            } else if (bingo.type === 'diagonal') {
                description = bingo.index === 1 ? 'Diagonal ↘' : 'Diagonal ↙';
            }

            return {
                ...bingo,
                description: description
            };
        });
    }

    /**
     * Get days active
     */
    getDaysActive() {
        if (!this.createdAt) return 0;

        const created = new Date(this.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Get tasks by category
     */
    getTasksByCategory(category) {
        return this.board.flat().filter(task => task.category === category);
    }

    /**
     * Get incomplete tasks
     */
    getIncompleteTasks() {
        return this.board.flat().filter(task => !task.completed && !task.isFreeSpace);
    }

    /**
     * Get completed tasks
     */
    getCompletedTasks() {
        return this.board.flat().filter(task => task.completed && !task.isFreeSpace);
    }

    /**
     * Get next recommended task
     */
    getRecommendedTask() {
        const incomplete = this.getIncompleteTasks();
        if (incomplete.length === 0) return null;

        // Prioritize tasks that could complete a bingo
        const strategic = incomplete.filter(task => {
            // Check if completing this task would complete a row
            const rowTasks = this.board[task.row].filter(t => !t.completed);
            if (rowTasks.length === 1 && rowTasks[0].id === task.id) return true;

            // Check if completing this task would complete a column
            const colTasks = [];
            for (let r = 0; r < 5; r++) {
                if (!this.board[r][task.col].completed) {
                    colTasks.push(this.board[r][task.col]);
                }
            }
            if (colTasks.length === 1 && colTasks[0].id === task.id) return true;

            return false;
        });

        if (strategic.length > 0) {
            return {
                task: strategic[0],
                reason: 'Completes a bingo!'
            };
        }

        // Otherwise, recommend easiest task (lowest points = usually easiest)
        incomplete.sort((a, b) => a.points - b.points);
        return {
            task: incomplete[0],
            reason: 'Easy win!'
        };
    }

    /**
     * Reset board
     */
    resetBoard() {
        if (this.isFullBoard()) {
            // Award completion badge
            const stats = this.getStatistics();

            this.createNewBoard();

            return {
                success: true,
                message: 'Board reset! Start a new challenge!',
                previousStats: stats
            };
        } else {
            return {
                success: false,
                message: 'Complete the full board before resetting!'
            };
        }
    }

    /**
     * Save board to localStorage
     */
    saveBoard() {
        try {
            const data = {
                boardId: this.boardId,
                board: this.board,
                completedTasks: this.completedTasks,
                bingos: this.bingos,
                createdAt: this.createdAt,
                lastUpdated: this.lastUpdated
            };

            localStorage.setItem(`zyro_bingo_${this.boardId}`, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save bingo board:', e);
        }
    }

    /**
     * Load board from localStorage
     */
    loadBoard() {
        try {
            const saved = localStorage.getItem(`zyro_bingo_${this.boardId}`);
            if (saved) {
                const data = JSON.parse(saved);
                this.board = data.board;
                this.completedTasks = data.completedTasks || [];
                this.bingos = data.bingos || [];
                this.createdAt = data.createdAt;
                this.lastUpdated = data.lastUpdated;
            }
        } catch (e) {
            console.error('Failed to load bingo board:', e);
        }
    }

    /**
     * Export board data
     */
    exportBoard() {
        return {
            boardId: this.boardId,
            board: this.board,
            statistics: this.getStatistics(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Get shareable progress
     */
    getShareableProgress() {
        const stats = this.getStatistics();

        return {
            message: `🎯 My ZYRO Bingo Progress:\n\n` +
                `✅ ${stats.completed}/25 tasks complete (${stats.progress}%)\n` +
                `🔥 ${stats.bingos} bingos!\n` +
                `💰 ${stats.totalPoints} points earned\n\n` +
                `Join me: ${this.config.SOCIAL_SHARING?.shareURL || 'zero2billionaires.com/zyro'}`,
            hashtags: ['#SideGigBingo', '#ZYRO', '#Z2B', '#HustleMode'],
            progress: stats.progress,
            visual: this.generateProgressVisual()
        };
    }

    /**
     * Generate visual progress representation
     */
    generateProgressVisual() {
        let visual = '';
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                visual += this.board[row][col].completed ? '✅' : '⬜';
            }
            visual += '\n';
        }
        return visual;
    }

    /**
     * Get task hints
     */
    getTaskHints(taskId) {
        const task = this.getTask(taskId);
        if (!task) return null;

        const hints = {
            'Follow Z2B on TikTok': {
                steps: ['Open TikTok app', 'Search @Zero2Billionaires', 'Hit Follow'],
                url: 'https://tiktok.com/@zero2billionaires'
            },
            'Watch Z2B YouTube video': {
                steps: ['Open YouTube', 'Search Zero2Billionaires', 'Watch any video'],
                url: 'https://youtube.com/@zero2billionaires'
            },
            'Join Z2B Discord': {
                steps: ['Get Discord app', 'Use invite link', 'Introduce yourself'],
                url: 'https://discord.gg/z2b'
            },
            'Share Idea Roulette result': {
                steps: ['Spin Idea Roulette', 'Screenshot your result', 'Share on social media'],
                url: null
            }
            // Add more hints as needed
        };

        return hints[task.text] || {
            steps: ['Complete the task', 'Take a screenshot if needed', 'Mark as complete!'],
            url: null
        };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.ZyroSideGigBingo = ZyroSideGigBingo;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZyroSideGigBingo;
}
