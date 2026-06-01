
// 2048游戏逻辑
class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore2048')) || 0;
        this.gameWon = false;
        this.tutorialStep = 1;
        this.startTime = Date.now();
        this.gamesPlayed = parseInt(localStorage.getItem('gamesPlayed2048')) || 0;
        this.achievements = JSON.parse(localStorage.getItem('achievements2048')) || {};
        this.leaderboard = JSON.parse(localStorage.getItem('leaderboard2048')) || [];
        this.sortBy = 'score';
        
        this.init();
    }

    init() {
        this.setupGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.updateScoreDisplay();
        this.setupEventListeners();
        this.checkTutorial();
    }

    setupGrid() {
        this.grid = [];
        for (let i = 0; i &lt; 4; i++) {
            this.grid[i] = [];
            for (let j = 0; j &lt; 4; j++) {
                this.grid[i][j] = 0;
            }
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i &lt; 4; i++) {
            for (let j = 0; j &lt; 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length &gt; 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() &lt; 0.9 ? 2 : 4;
            this.renderGrid();
        }
    }

    renderGrid() {
        const container = document.getElementById('tile-container');
        container.innerHTML = '';
        
        for (let i = 0; i &lt; 4; i++) {
            for (let j = 0; j &lt; 4; j++) {
                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.textContent = this.grid[i][j];
                    tile.style.left = `calc(${j * 25}% + ${j * 12}px)`;
                    tile.style.top = `calc(${i * 25}% + ${i * 12}px)`;
                    container.appendChild(tile);
                }
            }
        }
    }

    move(direction) {
        let moved = false;
        const oldGrid = JSON.stringify(this.grid);
        
        switch(direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.checkGameState();
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i &lt; 4; i++) {
            const row = this.grid[i].filter(val =&gt; val !== 0);
            const newRow = [];
            
            for (let j = 0; j &lt; row.length; j++) {
                if (row[j] === row[j + 1]) {
                    newRow.push(row[j] * 2);
                    this.score += row[j] * 2;
                    j++;
                } else {
                    newRow.push(row[j]);
                }
            }
            
            while (newRow.length &lt; 4) {
                newRow.push(0);
            }
            
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i &lt; 4; i++) {
            const row = this.grid[i].filter(val =&gt; val !== 0);
            const newRow = [];
            
            for (let j = row.length - 1; j &gt;= 0; j--) {
                if (row[j] === row[j - 1]) {
                    newRow.unshift(row[j] * 2);
                    this.score += row[j] * 2;
                    j--;
                } else {
                    newRow.unshift(row[j]);
                }
            }
            
            while (newRow.length &lt; 4) {
                newRow.unshift(0);
            }
            
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j &lt; 4; j++) {
            const col = [];
            for (let i = 0; i &lt; 4; i++) {
                if (this.grid[i][j] !== 0) {
                    col.push(this.grid[i][j]);
                }
            }
            
            const newCol = [];
            for (let i = 0; i &lt; col.length; i++) {
                if (col[i] === col[i + 1]) {
                    newCol.push(col[i] * 2);
                    this.score += col[i] * 2;
                    i++;
                } else {
                    newCol.push(col[i]);
                }
            }
            
            while (newCol.length &lt; 4) {
                newCol.push(0);
            }
            
            for (let i = 0; i &lt; 4; i++) {
                if (this.grid[i][j] !== newCol[i]) {
                    moved = true;
                }
                this.grid[i][j] = newCol[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j &lt; 4; j++) {
            const col = [];
            for (let i = 0; i &lt; 4; i++) {
                if (this.grid[i][j] !== 0) {
                    col.push(this.grid[i][j]);
                }
            }
            
            const newCol = [];
            for (let i = col.length - 1; i &gt;= 0; i--) {
                if (col[i] === col[i - 1]) {
                    newCol.unshift(col[i] * 2);
                    this.score += col[i] * 2;
                    i--;
                } else {
                    newCol.unshift(col[i]);
                }
            }
            
            while (newCol.length &lt; 4) {
                newCol.unshift(0);
            }
            
            for (let i = 0; i &lt; 4; i++) {
                if (this.grid[i][j] !== newCol[i]) {
                    moved = true;
                }
                this.grid[i][j] = newCol[i];
            }
        }
        return moved;
    }

    checkGameState() {
        this.updateScoreDisplay();
        
        // 检查是否达到2048
        if (!this.gameWon) {
            for (let i = 0; i &lt; 4; i++) {
                for (let j = 0; j &lt; 4; j++) {
                    if (this.grid[i][j] === 2048) {
                        this.gameWon = true;
                        this.unlockAchievement('firstWin');
                        this.checkSpeedAchievement();
                        break;
                    }
                }
            }
        }
        
        // 检查满分成就
        if (this.score &gt;= 10000) {
            this.unlockAchievement('highScore');
        }
        
        // 检查游戏结束
        if (this.isGameOver()) {
            this.gamesPlayed++;
            localStorage.setItem('gamesPlayed2048', this.gamesPlayed);
            
            if (this.gamesPlayed &gt;= 10) {
                this.unlockAchievement('persistent');
            }
            
            this.showGameOver();
        }
    }

    isGameOver() {
        // 检查是否有空格
        for (let i = 0; i &lt; 4; i++) {
            for (let j = 0; j &lt; 4; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否可以合并
        for (let i = 0; i &lt; 4; i++) {
            for (let j = 0; j &lt; 4; j++) {
                if (j &lt; 3 &amp;&amp; this.grid[i][j] === this.grid[i][j + 1]) {
                    return false;
                }
                if (i &lt; 3 &amp;&amp; this.grid[i][j] === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }
        
        return true;
    }

    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        
        if (this.score &gt; this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore2048', this.bestScore);
        }
        
        document.getElementById('best-score').textContent = this.bestScore;
    }

    showGameOver() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('gameover-modal').classList.add('active');
    }

    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) =&gt; {
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });

        // 触摸控制
        let startX, startY;
        const gameScreen = document.getElementById('game-screen');
        
        gameScreen.addEventListener('touchstart', (e) =&gt; {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        gameScreen.addEventListener('touchend', (e) =&gt; {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;
            
            if (Math.abs(diffX) &gt; Math.abs(diffY)) {
                if (diffX &gt; 30) this.move('right');
                else if (diffX &lt; -30) this.move('left');
            } else {
                if (diffY &gt; 30) this.move('down');
                else if (diffY &lt; -30) this.move('up');
            }
        });
    }

    // 教程相关
    checkTutorial() {
        if (!localStorage.getItem('tutorialSeen2048')) {
            setTimeout(() =&gt; {
                document.getElementById('tutorial-modal').classList.add('active');
            }, 1000);
        }
    }

    // 成就相关
    unlockAchievement(id) {
        if (!this.achievements[id]) {
            this.achievements[id] = true;
            localStorage.setItem('achievements2048', JSON.stringify(this.achievements));
            this.showAchievementNotification(id);
            this.updateAchievementsDisplay();
        }
    }

    checkSpeedAchievement() {
        const elapsedTime = (Date.now() - this.startTime) / 1000;
        if (elapsedTime &lt;= 60) {
            this.unlockAchievement('speedKing');
        }
    }

    showAchievementNotification(id) {
        const achievementNames = {
            'firstWin': '首次通关 - 获得2048方块！',
            'highScore': '满分挑战 - 获得10000分！',
            'speedKing': '速度之王 - 1分钟内获得2048！',
            'persistent': '坚持就是胜利 - 连续玩10局！'
        };
        
        document.getElementById('achievement-desc').textContent = achievementNames[id];
        const notification = document.getElementById('achievement-notification');
        notification.classList.add('show');
        
        setTimeout(() =&gt; {
            notification.classList.remove('show');
        }, 3000);
    }

    updateAchievementsDisplay() {
        const achievementItems = document.querySelectorAll('.achievement-item');
        const achievementIds = ['firstWin', 'highScore', 'speedKing', 'persistent'];
        
        achievementItems.forEach((item, index) =&gt; {
            if (this.achievements[achievementIds[index]]) {
                item.classList.add('unlocked');
            }
        });
    }

    // 排行榜相关
    addToLeaderboard(name) {
        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.leaderboard.push({
            name: name || '匿名玩家',
            score: this.score,
            time: gameTime,
            date: new Date().toLocaleDateString()
        });
        
        this.leaderboard.sort((a, b) =&gt; {
            if (this.sortBy === 'score') {
                return b.score - a.score;
            } else {
                return a.time - b.time;
            }
        });
        
        this.leaderboard = this.leaderboard.slice(0, 10);
        localStorage.setItem('leaderboard2048', JSON.stringify(this.leaderboard));
    }

    renderLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '';
        
        if (this.leaderboard.length === 0) {
            list.innerHTML = '&lt;p style="text-align: center; color: #8f7a66;"&gt;暂无记录，快来创造历史吧！&lt;/p&gt;';
            return;
        }
        
        this.leaderboard.sort((a, b) =&gt; {
            if (this.sortBy === 'score') {
                return b.score - a.score;
            } else {
                return a.time - b.time;
            }
        });
        
        this.leaderboard.forEach((entry, index) =&gt; {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            let rankClass = '';
            if (index === 0) rankClass = 'first';
            else if (index === 1) rankClass = 'second';
            else if (index === 2) rankClass = 'third';
            
            item.innerHTML = `
                &lt;div class="leaderboard-rank ${rankClass}"&gt;${index + 1}&lt;/div&gt;
                &lt;div class="leaderboard-info"&gt;
                    &lt;div class="leaderboard-name"&gt;${entry.name}&lt;/div&gt;
                    &lt;div class="leaderboard-stats"&gt;${entry.time}秒 · ${entry.date}&lt;/div&gt;
                &lt;/div&gt;
                &lt;div class="leaderboard-score"&gt;${entry.score}&lt;/div&gt;
            `;
            
            list.appendChild(item);
        });
    }
}

// 全局变量
let game;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () =&gt; {
    simulateLoading();
    setTimeout(() =&gt; {
        document.getElementById('loading-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        game = new Game2048();
    }, 2000);
});

// 加载动画
function simulateLoading() {
    let progress = 0;
    const loadingProgress = document.querySelector('.loading-progress');
    
    const interval = setInterval(() =&gt; {
        progress += Math.random() * 15 + 5;
        if (progress &gt;= 100) {
            progress = 100;
            clearInterval(interval);
        }
        loadingProgress.style.width = progress + '%';
    }, 200);
}

// 游戏控制函数
function newGame() {
    document.getElementById('gameover-modal').classList.remove('active');
    game = new Game2048();
}

function restartGame() {
    newGame();
}

function saveAndRestart() {
    const name = document.getElementById('player-name').value;
    game.addToLeaderboard(name);
    restartGame();
}

// 弹窗控制
function showLeaderboard() {
    game.renderLeaderboard();
    document.getElementById('leaderboard-modal').classList.add('active');
}

function closeLeaderboard() {
    document.getElementById('leaderboard-modal').classList.remove('active');
}

function sortLeaderboard(by) {
    game.sortBy = by;
    document.querySelectorAll('.sort-btn').forEach(btn =&gt; btn.classList.remove('active'));
    event.target.classList.add('active');
    game.renderLeaderboard();
}

function clearLeaderboard() {
    if (confirm('确定要清空排行榜吗？')) {
        game.leaderboard = [];
        localStorage.removeItem('leaderboard2048');
        game.renderLeaderboard();
    }
}

function showAchievements() {
    game.updateAchievementsDisplay();
    document.getElementById('achievements-modal').classList.add('active');
}

function closeAchievements() {
    document.getElementById('achievements-modal').classList.remove('active');
}

function showResume() {
    document.getElementById('resume-modal').classList.add('active');
}

function closeResume() {
    document.getElementById('resume-modal').classList.remove('active');
}

function showHelp() {
    document.getElementById('help-modal').classList.add('active');
}

function closeHelp() {
    document.getElementById('help-modal').classList.remove('active');
}

// 教程控制
function prevTutorial() {
    if (game.tutorialStep &gt; 1) {
        document.getElementById(`tutorial-step-${game.tutorialStep}`).classList.remove('active');
        game.tutorialStep--;
        document.getElementById(`tutorial-step-${game.tutorialStep}`).classList.add('active');
        updateTutorialDots();
    }
}

function nextTutorial() {
    if (game.tutorialStep &lt; 3) {
        document.getElementById(`tutorial-step-${game.tutorialStep}`).classList.remove('active');
        game.tutorialStep++;
        document.getElementById(`tutorial-step-${game.tutorialStep}`).classList.add('active');
        updateTutorialDots();
    }
}

function updateTutorialDots() {
    document.querySelectorAll('.tutorial-dot').forEach((dot, index) =&gt; {
        dot.classList.toggle('active', index + 1 === game.tutorialStep);
    });
}

function closeTutorial() {
    if (document.getElementById('dont-show-tutorial').checked) {
        localStorage.setItem('tutorialSeen2048', 'true');
    }
    document.getElementById('tutorial-modal').classList.remove('active');
}

// 分享功能
function shareGame() {
    const score = document.getElementById('score').textContent;
    const text = `我在2048游戏中获得了${score}分！快来挑战我吧！ https://214412412.github.io/cloud-computing/`;
    
    if (navigator.share) {
        navigator.share({
            title: '2048游戏',
            text: text,
            url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(text).then(() =&gt; {
            alert('分享内容已复制到剪贴板！');
        }).catch(() =&gt; {
            alert(text);
        });
    }
}
