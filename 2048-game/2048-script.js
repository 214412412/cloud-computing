const GRID_SIZE = 4;
let grid = [];
let score = 0;
let bestScore = 0;
let gameOver = false;
let hasWon = false;
let gameStartTime = 0;
let currentTutorialStep = 1;
let achievements = {
  firstWin: false,
  perfectScore: false,
  speedKing: false,
  persistent: false
};
let gameCount = 0;

function init() {
  loadBestScore();
  loadAchievements();
  loadLeaderboard();
  loadGameCount();
  showLoadingScreen();
}

function showLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  const gameScreen = document.getElementById('game-screen');
  
  loadingScreen.classList.add('active');
  gameScreen.classList.remove('active');
  
  setTimeout(() => {
    loadingScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    if (!localStorage.getItem('hideTutorial')) {
      showTutorial();
    } else {
      newGame();
    }
  }, 2000);
}

function newGame() {
  grid = createEmptyGrid();
  score = 0;
  gameOver = false;
  hasWon = false;
  gameStartTime = Date.now();
  gameCount++;
  saveGameCount();
  
  addRandomTile();
  addRandomTile();
  updateUI();
}

function createEmptyGrid() {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
}

function addRandomTile() {
  const emptyCells = [];
  
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === 0) {
        emptyCells.push({ row: i, col: j });
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    addTileElement(randomCell.row, randomCell.col, grid[randomCell.row][randomCell.col]);
  }
}

function addTileElement(row, col, value) {
  const tileContainer = document.getElementById('tile-container');
  const tile = document.createElement('div');
  tile.className = `tile tile-${value} tile-new`;
  tile.textContent = value;
  tile.style.left = `${col * (100 / GRID_SIZE) + (col * 10) / (GRID_SIZE - 1)}%`;
  tile.style.top = `${row * (100 / GRID_SIZE) + (row * 10) / (GRID_SIZE - 1)}%`;
  tile.style.width = `${(100 - (GRID_SIZE - 1) * 2.5) / GRID_SIZE}%`;
  tile.style.height = `${(100 - (GRID_SIZE - 1) * 2.5) / GRID_SIZE}%`;
  tileContainer.appendChild(tile);
}

function clearTiles() {
  const tileContainer = document.getElementById('tile-container');
  tileContainer.innerHTML = '';
}

function updateUI() {
  document.getElementById('score').textContent = score;
  document.getElementById('best-score').textContent = bestScore;
  
  clearTiles();
  
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] !== 0) {
        addTileElement(i, j, grid[i][j]);
      }
    }
  }
  
  if (gameOver) {
    showGameOver();
  }
}

function move(direction) {
  if (gameOver) return;
  
  let moved = false;
  let newGrid = createEmptyGrid();
  
  switch (direction) {
    case 'up':
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = grid.map(row => row[col]);
        const merged = mergeLine(column);
        merged.forEach((value, row) => {
          newGrid[row][col] = value;
        });
        if (JSON.stringify(column) !== JSON.stringify(merged)) {
          moved = true;
        }
      }
      break;
    case 'down':
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = grid.map(row => row[col]).reverse();
        const merged = mergeLine(column);
        merged.reverse().forEach((value, row) => {
          newGrid[row][col] = value;
        });
        if (JSON.stringify(grid.map(row => row[col])) !== JSON.stringify(merged.reverse())) {
          moved = true;
        }
      }
      break;
    case 'left':
      for (let row = 0; row < GRID_SIZE; row++) {
        const line = grid[row];
        const merged = mergeLine(line);
        merged.forEach((value, col) => {
          newGrid[row][col] = value;
        });
        if (JSON.stringify(line) !== JSON.stringify(merged)) {
          moved = true;
        }
      }
      break;
    case 'right':
      for (let row = 0; row < GRID_SIZE; row++) {
        const line = grid[row].reverse();
        const merged = mergeLine(line);
        merged.reverse().forEach((value, col) => {
          newGrid[row][col] = value;
        });
        if (JSON.stringify(grid[row]) !== JSON.stringify(merged.reverse())) {
          moved = true;
        }
      }
      break;
  }
  
  if (moved) {
    grid = newGrid;
    addRandomTile();
    checkGameState();
    updateUI();
  }
}

function mergeLine(line) {
  let filtered = line.filter(val => val !== 0);
  let merged = [];
  
  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      const newValue = filtered[i] * 2;
      merged.push(newValue);
      score += newValue;
      
      if (newValue === 2048 && !hasWon) {
        hasWon = true;
        checkAchievements();
      }
      
      if (score >= 10000 && !achievements.perfectScore) {
        achievements.perfectScore = true;
        saveAchievements();
        showAchievementNotification('满分挑战');
      }
      
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }
  
  while (merged.length < GRID_SIZE) {
    merged.push(0);
  }
  
  return merged;
}

function checkGameState() {
  if (score > bestScore) {
    bestScore = score;
    saveBestScore();
  }
  
  if (hasWon) {
    checkAchievements();
  }
  
  if (!canMove()) {
    gameOver = true;
    checkAchievements();
  }
}

function canMove() {
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === 0) return true;
      
      if (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) return true;
      if (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) return true;
    }
  }
  return false;
}

function checkAchievements() {
  if (hasWon && !achievements.firstWin) {
    achievements.firstWin = true;
    saveAchievements();
    showAchievementNotification('首次通关');
    
    const gameTime = (Date.now() - gameStartTime) / 1000;
    if (gameTime <= 60 && !achievements.speedKing) {
      achievements.speedKing = true;
      saveAchievements();
      setTimeout(() => showAchievementNotification('速度之王'), 500);
    }
  }
  
  if (gameCount >= 10 && !achievements.persistent) {
    achievements.persistent = true;
    saveAchievements();
    showAchievementNotification('坚持就是胜利');
  }
}

function showAchievementNotification(name) {
  const notification = document.getElementById('achievement-notification');
  const desc = document.getElementById('achievement-desc');
  
  const achievementDescriptions = {
    '首次通关': '获得2048方块',
    '满分挑战': '获得10000分',
    '速度之王': '在1分钟内获得2048',
    '坚持就是胜利': '连续玩10局'
  };
  
  desc.textContent = achievementDescriptions[name] || name;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2500);
}

function showGameOver() {
  const modal = document.getElementById('gameover-modal');
  document.getElementById('final-score').textContent = score;
  modal.classList.add('active');
}

function saveAndRestart() {
  const playerName = document.getElementById('player-name').value || '匿名玩家';
  const gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
  
  saveToLeaderboard(playerName, score, gameTime);
  
  const modal = document.getElementById('gameover-modal');
  modal.classList.remove('active');
  
  newGame();
}

function restartGame() {
  const modal = document.getElementById('gameover-modal');
  modal.classList.remove('active');
  newGame();
}

// 排行榜功能
function saveToLeaderboard(name, score, time) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  leaderboard.push({
    name: name,
    score: score,
    time: time,
    date: new Date().toLocaleString()
  });
  
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function loadLeaderboard() {
  return JSON.parse(localStorage.getItem('leaderboard') || '[]');
}

function showLeaderboard() {
  const modal = document.getElementById('leaderboard-modal');
  const list = document.getElementById('leaderboard-list');
  const leaderboard = loadLeaderboard();
  
  list.innerHTML = '';
  
  if (leaderboard.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">暂无记录</p>';
  } else {
    leaderboard.forEach((item, index) => {
      const li = document.createElement('div');
      li.className = 'leaderboard-item';
      li.innerHTML = `
        <div class="leaderboard-rank">${index + 1}</div>
        <div class="leaderboard-name">${item.name}</div>
        <div>
          <div class="leaderboard-score">${item.score}</div>
          <div class="leaderboard-time">${formatTime(item.time)} · ${item.date}</div>
        </div>
      `;
      list.appendChild(li);
    });
  }
  
  modal.classList.add('active');
}

function closeLeaderboard() {
  const modal = document.getElementById('leaderboard-modal');
  modal.classList.remove('active');
}

function clearLeaderboard() {
  if (confirm('确定要清空排行榜吗？')) {
    localStorage.removeItem('leaderboard');
    showLeaderboard();
  }
}

function sortLeaderboard(type) {
  const leaderboard = loadLeaderboard();
  
  if (type === 'score') {
    leaderboard.sort((a, b) => b.score - a.score);
  } else {
    leaderboard.sort((a, b) => a.time - b.time);
  }
  
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  showLeaderboard();
  
  document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 成就功能
function saveAchievements() {
  localStorage.setItem('achievements', JSON.stringify(achievements));
}

function loadAchievements() {
  const saved = localStorage.getItem('achievements');
  if (saved) {
    achievements = JSON.parse(saved);
  }
}

function showAchievements() {
  const modal = document.getElementById('achievements-modal');
  const list = document.getElementById('achievements-list');
  
  const achievementList = [
    { id: 'firstWin', name: '首次通关', desc: '获得2048方块', icon: '🎯' },
    { id: 'perfectScore', name: '满分挑战', desc: '获得10000分', icon: '⭐' },
    { id: 'speedKing', name: '速度之王', desc: '在1分钟内获得2048', icon: '⚡' },
    { id: 'persistent', name: '坚持就是胜利', desc: '连续玩10局', icon: '🎖' }
  ];
  
  list.innerHTML = '';
  
  achievementList.forEach(item => {
    const div = document.createElement('div');
    div.className = `achievement-item ${achievements[item.id] ? 'unlocked' : ''}`;
    div.innerHTML = `
      <div class="achievement-icon">${item.icon}</div>
      <div class="achievement-info">
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
      </div>
    `;
    list.appendChild(div);
  });
  
  modal.classList.add('active');
}

function closeAchievements() {
  const modal = document.getElementById('achievements-modal');
  modal.classList.remove('active');
}

// 简历功能
function showResume() {
  const modal = document.getElementById('resume-modal');
  modal.classList.add('active');
}

function closeResume() {
  const modal = document.getElementById('resume-modal');
  modal.classList.remove('active');
}

// 帮助功能
function showHelp() {
  const modal = document.getElementById('help-modal');
  modal.classList.add('active');
}

function closeHelp() {
  const modal = document.getElementById('help-modal');
  modal.classList.remove('active');
}

// 分享功能
function shareGame() {
  const text = `我在2048游戏中获得了 ${score} 分！快来挑战我吧！🎮`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('分享内容已复制到剪贴板！');
    }).catch(() => {
      fallbackShare(text);
    });
  } else {
    fallbackShare(text);
  }
}

function fallbackShare(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    alert('分享内容已复制到剪贴板！');
  } catch (err) {
    alert('复制失败，请手动复制：\n' + text);
  }
  
  document.body.removeChild(textarea);
}

// 教程功能
function showTutorial() {
  currentTutorialStep = 1;
  updateTutorial();
  document.getElementById('tutorial-modal').classList.add('active');
}

function updateTutorial() {
  document.querySelectorAll('.tutorial-step').forEach((step, index) => {
    step.classList.toggle('active', index + 1 === currentTutorialStep);
  });
  
  document.querySelectorAll('.tutorial-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index + 1 === currentTutorialStep);
  });
  
  document.getElementById('prev-tutorial').style.display = currentTutorialStep === 1 ? 'none' : 'block';
  document.getElementById('next-tutorial').style.display = currentTutorialStep === 3 ? 'none' : 'block';
}

function nextTutorial() {
  if (currentTutorialStep < 3) {
    currentTutorialStep++;
    updateTutorial();
  }
}

function prevTutorial() {
  if (currentTutorialStep > 1) {
    currentTutorialStep--;
    updateTutorial();
  }
}

function closeTutorial() {
  if (document.getElementById('dont-show-tutorial').checked) {
    localStorage.setItem('hideTutorial', 'true');
  }
  
  document.getElementById('tutorial-modal').classList.remove('active');
  newGame();
}

// 保存/加载功能
function saveBestScore() {
  localStorage.setItem('bestScore', bestScore.toString());
}

function loadBestScore() {
  const saved = localStorage.getItem('bestScore');
  if (saved) {
    bestScore = parseInt(saved, 10);
  }
}

function saveGameCount() {
  localStorage.setItem('gameCount', gameCount.toString());
}

function loadGameCount() {
  const saved = localStorage.getItem('gameCount');
  if (saved) {
    gameCount = parseInt(saved, 10);
  }
}

// 键盘事件
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
  }
});

// 触摸事件
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (gameOver) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  const minSwipeDistance = 30;
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (Math.abs(deltaX) > minSwipeDistance) {
      move(deltaX > 0 ? 'right' : 'left');
    }
  } else {
    if (Math.abs(deltaY) > minSwipeDistance) {
      move(deltaY > 0 ? 'down' : 'up');
    }
  }
}, { passive: true });

// 关闭弹窗事件
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});

// 初始化
document.addEventListener('DOMContentLoaded', init);