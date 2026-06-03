const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

let grid = [];
let score = 0;
let bestScore = 0;
let gameOver = false;
let hasWon = false;
let gameStartTime = 0;
let currentScore = 0;
let isPaused = false;
let gameTimer = null;
let currentDifficulty = 'normal';
let currentTheme = 'dark';
let moveHistory = [];

const difficulties = {
    easy: { name: '简单', newTileChance: 0.95, mergeBonus: 1 },
    normal: { name: '普通', newTileChance: 0.9, mergeBonus: 1 },
    hard: { name: '困难', newTileChance: 0.8, mergeBonus: 1.5 }
};

const themes = {
    dark: { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', accent: '#e94560' },
    light: { bg: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)', accent: '#e94560' },
    ocean: { bg: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)', accent: '#023e8a' },
    candy: { bg: 'linear-gradient(135deg, #ff6b9d 0%, #c084fc 50%, #a78bfa 100%)', accent: '#be185d' }
};

let achievements = {
    '2048': false,
    '10000': false,
    'speed': false,
    'streak': false,
    'perfect': false
};

let leaderboard = [];
let sortBy = 'score';

function initGame() {
    grid = [];
    score = 0;
    gameOver = false;
    hasWon = false;
    gameStartTime = Date.now();
    moveHistory = [];
    isPaused = false;
    
    updateStatus('准备开始');
    updatePauseButton(false);
    
    for (let i = 0; i < CELL_COUNT; i++) {
        grid.push(0);
    }
    
    addRandomTile();
    addRandomTile();
    updateUI();
    startTimer();
}

function startGame() {
    initGame();
    updateStatus('游戏中');
    document.getElementById('start-btn').disabled = true;
    document.getElementById('pause-btn').disabled = false;
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseTimer();
        updateStatus('已暂停');
        document.getElementById('pause-btn').innerHTML = '▶️ 继续';
    } else {
        resumeTimer();
        updateStatus('游戏中');
        document.getElementById('pause-btn').innerHTML = '⏸️ 暂停';
    }
}

function restartGame() {
    stopTimer();
    document.getElementById('start-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    initGame();
}

function updateStatus(text) {
    document.getElementById('game-status-text').textContent = text;
}

function updatePauseButton(enabled) {
    document.getElementById('pause-btn').disabled = !enabled;
}

function startTimer() {
    stopTimer();
    gameTimer = setInterval(updateTime, 1000);
}

function pauseTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function resumeTimer() {
    startTimer();
}

function stopTimer() {
    pauseTimer();
    document.getElementById('game-time').textContent = '00:00';
}

function updateTime() {
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('game-time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function addRandomTile() {
    const emptyCells = grid.map((val, idx) => val === 0 ? idx : -1).filter(idx => idx !== -1);
    if (emptyCells.length === 0) return false;
    
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const difficulty = difficulties[currentDifficulty];
    grid[randomIndex] = Math.random() < difficulty.newTileChance ? 2 : 4;
    return true;
}

function clearTileContainer() {
    const container = document.getElementById('tile-container');
    container.innerHTML = '';
}

function renderGrid() {
    clearTileContainer();
    const container = document.getElementById('tile-container');
    
    grid.forEach((value, index) => {
        if (value !== 0) {
            const tile = document.createElement('div');
            tile.className = `tile tile-${value}`;
            tile.textContent = value;
            tile.style.gridColumn = ((index % GRID_SIZE) + 1).toString();
            tile.style.gridRow = (Math.floor(index / GRID_SIZE) + 1).toString();
            container.appendChild(tile);
        }
    });
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('best-score').textContent = bestScore;
}

function updateUI() {
    renderGrid();
    updateScoreDisplay();
}

function getIndex(row, col) {
    return row * GRID_SIZE + col;
}

function slide(row) {
    let arr = row.filter(val => val !== 0);
    let scoreGain = 0;
    
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            const difficulty = difficulties[currentDifficulty];
            scoreGain += Math.floor(arr[i] * difficulty.mergeBonus);
            checkAchievements(arr[i]);
            arr.splice(i + 1, 1);
        }
    }
    
    while (arr.length < GRID_SIZE) {
        arr.push(0);
    }
    
    return { arr, scoreGain };
}

function checkAchievements(value) {
    if (value >= 2048 && !achievements['2048']) {
        unlockAchievement('2048', '首次通关', '获得2048方块');
    }
    if (score >= 10000 && !achievements['10000']) {
        unlockAchievement('10000', '满分挑战', '获得10000分');
    }
    if (value >= 2048 && !achievements['speed']) {
        const elapsed = (Date.now() - gameStartTime) / 1000 / 60;
        if (elapsed < 1) {
            unlockAchievement('speed', '速度之王', '在1分钟内获得2048');
        }
    }
    if (value >= 4096 && !achievements['perfect']) {
        unlockAchievement('perfect', '完美大师', '获得4096方块');
    }
}

function unlockAchievement(id, title, description) {
    achievements[id] = true;
    localStorage.setItem(`achievement_${id}`, 'true');
    document.getElementById(`achievement-${id}`)?.classList.add('unlocked');
    showAchievementUnlock(title, description, id);
}

function showAchievementUnlock(title, description, iconId) {
    const icons = {
        '2048': '🎯',
        '10000': '⭐',
        'speed': '⚡',
        'streak': '🎖',
        'perfect': '👑'
    };
    
    document.getElementById('unlock-icon').textContent = icons[iconId] || '🎯';
    document.getElementById('unlock-title').textContent = title;
    document.getElementById('unlock-description').textContent = description;
    document.getElementById('achievement-unlock-modal').classList.add('active');
}

function closeAchievementUnlock() {
    document.getElementById('achievement-unlock-modal').classList.remove('active');
}

function move(direction) {
    if (gameOver || isPaused) return false;
    
    let moved = false;
    let totalScoreGain = 0;
    
    const oldGrid = [...grid];
    
    if (direction === 'left') {
        for (let row = 0; row < GRID_SIZE; row++) {
            const startIdx = row * GRID_SIZE;
            const rowArr = grid.slice(startIdx, startIdx + GRID_SIZE);
            const result = slide(rowArr);
            
            if (arraysEqual(rowArr, result.arr)) {
                continue;
            }
            
            moved = true;
            totalScoreGain += result.scoreGain;
            
            for (let col = 0; col < GRID_SIZE; col++) {
                grid[startIdx + col] = result.arr[col];
            }
        }
    } else if (direction === 'right') {
        for (let row = 0; row < GRID_SIZE; row++) {
            const startIdx = row * GRID_SIZE;
            const rowArr = grid.slice(startIdx, startIdx + GRID_SIZE).reverse();
            const result = slide(rowArr);
            
            if (arraysEqual(rowArr, result.arr)) {
                continue;
            }
            
            moved = true;
            totalScoreGain += result.scoreGain;
            
            for (let col = 0; col < GRID_SIZE; col++) {
                grid[startIdx + col] = result.arr.reverse()[col];
            }
        }
    } else if (direction === 'up') {
        for (let col = 0; col < GRID_SIZE; col++) {
            const colArr = [];
            for (let row = 0; row < GRID_SIZE; row++) {
                colArr.push(grid[getIndex(row, col)]);
            }
            
            const result = slide(colArr);
            
            if (arraysEqual(colArr, result.arr)) {
                continue;
            }
            
            moved = true;
            totalScoreGain += result.scoreGain;
            
            for (let row = 0; row < GRID_SIZE; row++) {
                grid[getIndex(row, col)] = result.arr[row];
            }
        }
    } else if (direction === 'down') {
        for (let col = 0; col < GRID_SIZE; col++) {
            const colArr = [];
            for (let row = GRID_SIZE - 1; row >= 0; row--) {
                colArr.push(grid[getIndex(row, col)]);
            }
            
            const result = slide(colArr);
            
            if (arraysEqual(colArr, result.arr)) {
                continue;
            }
            
            moved = true;
            totalScoreGain += result.scoreGain;
            
            for (let row = GRID_SIZE - 1; row >= 0; row--) {
                grid[getIndex(row, col)] = result.arr[GRID_SIZE - 1 - row];
            }
        }
    }
    
    if (moved) {
        moveHistory.push({ direction, oldGrid: [...oldGrid], newGrid: [...grid] });
        score += totalScoreGain;
        currentScore = score;
        
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore.toString());
        }
        
        addRandomTile();
        updateUI();
        
        checkGameOver();
    }
    
    return moved;
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function checkGameOver() {
    if (grid.includes(0)) return;
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const current = grid[getIndex(row, col)];
            
            if (col < GRID_SIZE - 1 && current === grid[getIndex(row, col + 1)]) {
                return;
            }
            if (row < GRID_SIZE - 1 && current === grid[getIndex(row + 1, col)]) {
                return;
            }
        }
    }
    
    gameOver = true;
    stopTimer();
    updateStatus('游戏结束');
    showGameOver();
}

function showGameOver() {
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-modal').classList.add('active');
}

function closeGameOver() {
    document.getElementById('game-over-modal').classList.remove('active');
    document.getElementById('start-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
}

function saveScoreAndClose() {
    const playerName = document.getElementById('player-name').value || '匿名玩家';
    
    const record = {
        name: playerName,
        score: score,
        time: new Date().toLocaleString('zh-CN'),
        timestamp: Date.now(),
        difficulty: currentDifficulty
    };
    
    leaderboard.push(record);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    
    closeGameOver();
    showShare();
}

function updateStreak() {
    let streak = parseInt(localStorage.getItem('gameStreak') || '0');
    streak++;
    localStorage.setItem('gameStreak', streak.toString());
    
    if (streak >= 10 && !achievements['streak']) {
        unlockAchievement('streak', '坚持就是胜利', '连续玩10局');
    }
}

function newGame() {
    updateStreak();
    startGame();
}

document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            move('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            move('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            move('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            move('right');
            break;
        case 'Escape':
            e.preventDefault();
            if (!gameOver) togglePause();
            break;
    }
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (gameOver || isPaused) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipe = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipe) {
            move(deltaX > 0 ? 'right' : 'left');
        }
    } else {
        if (Math.abs(deltaY) > minSwipe) {
            move(deltaY > 0 ? 'down' : 'up');
        }
    }
});

function showLeaderboard() {
    loadLeaderboard();
    renderLeaderboard();
    document.getElementById('leaderboard-modal').classList.add('active');
}

function closeLeaderboard() {
    document.getElementById('leaderboard-modal').classList.remove('active');
}

function loadLeaderboard() {
    const saved = localStorage.getItem('leaderboard');
    leaderboard = saved ? JSON.parse(saved) : [];
}

function renderLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    
    const sorted = [...leaderboard].sort((a, b) => {
        if (sortBy === 'score') {
            return b.score - a.score;
        } else {
            return b.timestamp - a.timestamp;
        }
    });
    
    sorted.forEach((record, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${index < 3 ? `podium-${index + 1}` : ''}`;
        item.innerHTML = `
            <span class="leaderboard-rank">${index + 1}</span>
            <span class="leaderboard-name">${record.name}</span>
            <span class="leaderboard-score">${record.score}</span>
            <span class="leaderboard-time">${record.time}</span>
        `;
        list.appendChild(item);
    });
    
    if (sorted.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">暂无记录</p>';
    }
}

function sortLeaderboard(sortType) {
    sortBy = sortType;
    document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderLeaderboard();
}

function clearLeaderboard() {
    if (confirm('确定要清空排行榜吗？')) {
        leaderboard = [];
        localStorage.removeItem('leaderboard');
        renderLeaderboard();
    }
}

function showAchievements() {
    loadAchievements();
    document.getElementById('achievements-modal').classList.add('active');
}

function closeAchievements() {
    document.getElementById('achievements-modal').classList.remove('active');
}

function loadAchievements() {
    Object.keys(achievements).forEach(id => {
        const saved = localStorage.getItem(`achievement_${id}`);
        if (saved === 'true') {
            achievements[id] = true;
            document.getElementById(`achievement-${id}`)?.classList.add('unlocked');
        }
    });
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

function showShare() {
    document.getElementById('share-score-value').textContent = score;
    document.getElementById('share-textarea').value = `我在2048游戏中获得了${score}分！难度：${difficulties[currentDifficulty].name}。快来挑战我吧！🎮`;
    document.getElementById('share-modal').classList.add('active');
}

function closeShare() {
    document.getElementById('share-modal').classList.remove('active');
}

function copyToClipboard() {
    const textarea = document.getElementById('share-textarea');
    textarea.select();
    
    navigator.clipboard.writeText(textarea.value).then(() => {
        const success = document.getElementById('copy-success');
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 2000);
    });
}

function generateScreenshot() {
    alert('截图功能：按 Ctrl+Shift+A (Windows) 或 Cmd+Shift+4 (Mac) 截取游戏画面分享！');
}

function shareGame() {
    showShare();
}

function setDifficulty(level) {
    currentDifficulty = level;
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    localStorage.setItem('difficulty', level);
}

function setTheme(theme) {
    currentTheme = theme;
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const themeData = themes[theme];
    document.body.style.background = themeData.bg;
    
    localStorage.setItem('theme', theme);
    
    updateThemeColors(theme);
}

function updateThemeColors(theme) {
    const accentColors = {
        dark: '#e94560',
        light: '#e94560',
        ocean: '#023e8a',
        candy: '#be185d'
    };
    
    const accent = accentColors[theme];
    
    document.querySelectorAll('.game-header h1').forEach(el => {
        el.style.color = accent;
        el.style.textShadow = `0 0 10px ${accent}40`;
    });
    
    document.querySelectorAll('.score-box').forEach(el => {
        el.style.border = `1px solid ${accent}40`;
    });
}

let tutorialStep = 1;

function showTutorial() {
    document.getElementById('tutorial-modal').classList.add('active');
    tutorialStep = 1;
    updateTutorial();
}

function closeTutorial() {
    if (document.getElementById('dont-show-tutorial').checked) {
        localStorage.setItem('showTutorial', 'false');
    }
    document.getElementById('tutorial-modal').classList.remove('active');
}

function prevTutorial() {
    if (tutorialStep > 1) {
        tutorialStep--;
        updateTutorial();
    }
}

function nextTutorial() {
    if (tutorialStep < 3) {
        tutorialStep++;
        updateTutorial();
    }
}

function updateTutorial() {
    document.querySelectorAll('.tutorial-step').forEach(step => step.classList.remove('active'));
    document.querySelectorAll('.tutorial-dot').forEach(dot => dot.classList.remove('active'));
    
    document.getElementById(`tutorial-step-${tutorialStep}`).classList.add('active');
    document.querySelector(`.tutorial-dot[data-step="${tutorialStep}"]`).classList.add('active');
    
    document.getElementById('prev-tutorial').style.display = tutorialStep === 1 ? 'none' : 'block';
    document.getElementById('next-tutorial').style.display = tutorialStep === 3 ? 'none' : 'block';
}

function loadBestScore() {
    const saved = localStorage.getItem('bestScore');
    if (saved) {
        bestScore = parseInt(saved);
    }
}

function loadSettings() {
    const savedDifficulty = localStorage.getItem('difficulty');
    if (savedDifficulty && difficulties[savedDifficulty]) {
        currentDifficulty = savedDifficulty;
        document.querySelector(`.difficulty-btn[data-level="${savedDifficulty}"]`)?.classList.add('active');
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
        currentTheme = savedTheme;
        document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`)?.classList.add('active');
        setTheme(savedTheme);
    }
}

function loadingComplete() {
    document.getElementById('loading-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    const showTut = localStorage.getItem('showTutorial');
    if (showTut !== 'false') {
        setTimeout(showTutorial, 500);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadBestScore();
    loadAchievements();
    loadLeaderboard();
    loadSettings();
    
    const loadingBar = document.querySelector('.loading-progress');
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(loadingComplete, 300);
        }
        loadingBar.style.width = `${progress}%`;
    }, 100);
});