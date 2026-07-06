// Game State Variables
let gameState = {
    gameMode: 'single', // 'single' or 'multi'
    initialMin: 1,
    initialMax: 100,
    currentMin: 1,
    currentMax: 100,
    targetNumber: null,
    useLimit: true,
    maxAttempts: 10,
    attemptsLeft: 10,
    players: [],
    currentPlayerIndex: 0,
    history: [],
    isGameOver: false
};

// DOM Elements - Screens
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');

// DOM Elements - Setup Form
const setupForm = document.getElementById('setup-form');
const minRangeInput = document.getElementById('min-range');
const maxRangeInput = document.getElementById('max-range');
const btnModeSingle = document.getElementById('btn-mode-single');
const btnModeMulti = document.getElementById('btn-mode-multi');
const multiplayerSettings = document.getElementById('multiplayer-settings');
const playerListContainer = document.getElementById('player-list-container');
const btnAddPlayer = document.getElementById('btn-add-player');
const toggleLimit = document.getElementById('toggle-limit');
const limitInputWrapper = document.getElementById('limit-input-wrapper');
const maxAttemptsInput = document.getElementById('max-attempts');

// DOM Elements - Game Screen
const btnGiveUp = document.getElementById('btn-give-up');
const turnBadge = document.getElementById('turn-badge');
const currentPlayerName = document.getElementById('current-player-name');
const attemptsBadge = document.getElementById('attempts-badge');
const attemptsLeftDisplay = document.getElementById('attempts-left');
const totalAttemptsDisplay = document.getElementById('total-attempts');
const currentMinDisplay = document.getElementById('current-min-display');
const currentMaxDisplay = document.getElementById('current-max-display');
const rangeFill = document.getElementById('range-fill');
const gaugeMarkerMin = document.getElementById('gauge-marker-min');
const gaugeMarkerMax = document.getElementById('gauge-marker-max');
const feedbackDisplay = document.getElementById('feedback-display');
const feedbackArrow = document.getElementById('feedback-arrow');
const feedbackText = document.getElementById('feedback-text');
const guessForm = document.getElementById('guess-form');
const guessInput = document.getElementById('guess-input');
const historyList = document.getElementById('history-list');
const historyCount = document.getElementById('history-count');

// DOM Elements - Helper Buttons
const btnHelperMin = document.getElementById('btn-helper-min');
const btnHelperMid = document.getElementById('btn-helper-mid');
const btnHelperMax = document.getElementById('btn-helper-max');
const btnHelperClear = document.getElementById('btn-helper-clear');

// DOM Elements - Game Over Screen
const gameOverIcon = document.getElementById('game-over-icon');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverSubtitle = document.getElementById('game-over-subtitle');
const revealTargetNumber = document.getElementById('reveal-target-number');
const statWinnerLabel = document.getElementById('stat-winner-label');
const statWinner = document.getElementById('stat-winner');
const statAttempts = document.getElementById('stat-attempts');
const summaryHistoryList = document.getElementById('summary-history-list');
const btnRestartSame = document.getElementById('btn-restart-same');
const btnGoSetup = document.getElementById('btn-go-setup');

/* ========================================================
   SETUP SCREEN EVENT LISTENERS & LOGIC
   ======================================================== */

// Handle Mode Switching
btnModeSingle.addEventListener('click', () => {
    setGameMode('single');
});

btnModeMulti.addEventListener('click', () => {
    setGameMode('multi');
});

function setGameMode(mode) {
    gameState.gameMode = mode;
    if (mode === 'single') {
        btnModeSingle.classList.add('active');
        btnModeMulti.classList.remove('active');
        multiplayerSettings.classList.add('hidden');
    } else {
        btnModeSingle.classList.remove('active');
        btnModeMulti.classList.add('active');
        multiplayerSettings.classList.remove('hidden');
        // Ensure we have at least 2 player inputs
        initializePlayerInputs();
    }
}

// Add/Remove Players in Multiplayer Settings
let playerCount = 0;
function initializePlayerInputs() {
    playerListContainer.innerHTML = '';
    playerCount = 0;
    addPlayerRow('플레이어 1');
    addPlayerRow('플레이어 2');
}

function addPlayerRow(defaultValue = '') {
    playerCount++;
    const row = document.createElement('div');
    row.className = 'player-input-row';
    row.id = `player-row-${playerCount}`;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    wrapper.style.flex = '1';
    
    const prefix = document.createElement('span');
    prefix.className = 'input-prefix';
    prefix.textContent = `P${playerCount}`;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `플레이어 ${playerCount} 이름`;
    input.value = defaultValue || `플레이어 ${playerCount}`;
    input.required = true;
    input.maxLength = 10;
    input.className = 'player-name-input';
    
    wrapper.appendChild(prefix);
    wrapper.appendChild(input);
    row.appendChild(wrapper);
    
    // Add remove button only if we have more than 2 players
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-player';
    removeBtn.innerHTML = '❌';
    removeBtn.title = '플레이어 제거';
    removeBtn.addEventListener('click', () => {
        if (document.querySelectorAll('.player-input-row').length > 2) {
            row.remove();
            reorderPlayerLabels();
        } else {
            alert('멀티 플레이는 최소 2명의 참가자가 필요합니다.');
        }
    });
    
    row.appendChild(removeBtn);
    playerListContainer.appendChild(row);
}

btnAddPlayer.addEventListener('click', () => {
    const currentRows = document.querySelectorAll('.player-input-row').length;
    if (currentRows >= 8) {
        alert('최대 8명까지 참가할 수 있습니다.');
        return;
    }
    addPlayerRow();
});

function reorderPlayerLabels() {
    const rows = document.querySelectorAll('.player-input-row');
    playerCount = 0;
    rows.forEach((row, index) => {
        playerCount++;
        row.id = `player-row-${playerCount}`;
        const prefix = row.querySelector('.input-prefix');
        if (prefix) prefix.textContent = `P${playerCount}`;
    });
}

// Toggle Attempt Limits
toggleLimit.addEventListener('change', (e) => {
    gameState.useLimit = e.target.checked;
    if (gameState.useLimit) {
        limitInputWrapper.classList.remove('hidden');
    } else {
        limitInputWrapper.classList.add('hidden');
    }
});

// Setup Form Submission -> Start Game
setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const min = parseInt(minRangeInput.value, 10);
    const max = parseInt(maxRangeInput.value, 10);
    
    // Validations
    if (isNaN(min) || isNaN(max)) {
        alert('숫자를 입력해주세요.');
        return;
    }
    if (min >= max) {
        alert('최대값(MAX)은 최소값(MIN)보다 커야 합니다.');
        return;
    }
    if (max - min < 1) {
        alert('범위의 크기는 최소 2 이상이어야 합니다.');
        return;
    }
    
    gameState.initialMin = min;
    gameState.initialMax = max;
    
    // Multiplayer Names
    if (gameState.gameMode === 'multi') {
        const nameInputs = document.querySelectorAll('.player-name-input');
        const names = [];
        let hasEmpty = false;
        
        nameInputs.forEach(input => {
            const val = input.value.trim();
            if (!val) hasEmpty = true;
            names.push(val || `플레이어`);
        });
        
        if (hasEmpty) {
            alert('모든 플레이어의 이름을 입력해주세요.');
            return;
        }
        gameState.players = names;
    } else {
        gameState.players = ['도전자'];
    }
    
    // Limit Attempts Settings
    if (gameState.useLimit) {
        const maxAtt = parseInt(maxAttemptsInput.value, 10);
        if (isNaN(maxAtt) || maxAtt < 1) {
            alert('최대 시도 횟수는 1회 이상이어야 합니다.');
            return;
        }
        gameState.maxAttempts = maxAtt;
    } else {
        gameState.maxAttempts = null;
    }
    
    startGame();
});

/* ========================================================
   GAME PLAY SCREEN LOGIC
   ======================================================== */

function startGame() {
    // Generate Target Number
    const rangeSize = gameState.initialMax - gameState.initialMin + 1;
    gameState.targetNumber = Math.floor(Math.random() * rangeSize) + gameState.initialMin;
    
    // Reset range bounds
    gameState.currentMin = gameState.initialMin;
    gameState.currentMax = gameState.initialMax;
    
    // Reset limits & state
    gameState.attemptsLeft = gameState.maxAttempts;
    gameState.currentPlayerIndex = 0;
    gameState.history = [];
    gameState.isGameOver = false;
    
    // Update Gameplay Badge / Status Displays
    if (gameState.gameMode === 'multi') {
        turnBadge.classList.remove('hidden');
        updateCurrentPlayerBadge();
    } else {
        turnBadge.classList.add('hidden');
    }
    
    if (gameState.useLimit) {
        attemptsBadge.classList.remove('hidden');
        attemptsLeftDisplay.textContent = gameState.attemptsLeft;
        totalAttemptsDisplay.textContent = gameState.maxAttempts;
    } else {
        attemptsBadge.classList.add('hidden');
    }
    
    // Reset Range Visuals
    updateVisualRangeDisplay();
    
    // Reset Feedback Box
    feedbackDisplay.className = 'feedback-container idle';
    feedbackArrow.textContent = '❓';
    feedbackText.textContent = '범위 안의 숫자를 추측해 보세요!';
    
    // Reset History
    historyList.innerHTML = '<div class="history-placeholder">아직 기록이 없습니다. 먼저 맞춰보세요!</div>';
    historyCount.textContent = '0';
    
    // Clear & Focus Guess Input
    guessInput.value = '';
    guessInput.min = gameState.initialMin;
    guessInput.max = gameState.initialMax;
    
    // Screen Navigation
    setupScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    setTimeout(() => {
        guessInput.focus();
    }, 100);
}

function updateCurrentPlayerBadge() {
    currentPlayerName.textContent = gameState.players[gameState.currentPlayerIndex];
}

function updateVisualRangeDisplay() {
    // Labels
    currentMinDisplay.textContent = gameState.currentMin;
    currentMaxDisplay.textContent = gameState.currentMax;
    
    // Calculate percentages for visual track gauge
    const totalSpan = gameState.initialMax - gameState.initialMin;
    if (totalSpan <= 0) return;
    
    const leftPercent = ((gameState.currentMin - gameState.initialMin) / totalSpan) * 100;
    const rightPercent = ((gameState.initialMax - gameState.currentMax) / totalSpan) * 100;
    
    // Set styles of range-fill
    rangeFill.style.left = `${leftPercent}%`;
    rangeFill.style.right = `${rightPercent}%`;
    
    // Position markers
    gaugeMarkerMin.style.left = `${leftPercent}%`;
    gaugeMarkerMax.style.left = `${100 - rightPercent}%`;
}

// Keypad Helpers Click Listeners
btnHelperMin.addEventListener('click', () => {
    guessInput.value = gameState.currentMin;
    guessInput.focus();
});

btnHelperMax.addEventListener('click', () => {
    guessInput.value = gameState.currentMax;
    guessInput.focus();
});

btnHelperMid.addEventListener('click', () => {
    guessInput.value = Math.floor((gameState.currentMin + gameState.currentMax) / 2);
    guessInput.focus();
});

btnHelperClear.addEventListener('click', () => {
    guessInput.value = '';
    guessInput.focus();
});

// Give Up Button Action
btnGiveUp.addEventListener('click', () => {
    if (confirm('진행 중인 게임을 종료하고 처음 화면으로 돌아가시겠습니까?')) {
        gameScreen.classList.remove('active');
        setupScreen.classList.add('active');
    }
});

// Guess Submission Event
guessForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (gameState.isGameOver) return;
    
    const guessValue = guessInput.value.trim();
    if (guessValue === '') return;
    
    const guess = parseInt(guessValue, 10);
    
    // Input Validations
    if (isNaN(guess)) {
        triggerShakeInput();
        return;
    }
    
    // Check if outside global initial bounds
    if (guess < gameState.initialMin || guess > gameState.initialMax) {
        alert(`범위 오류: 숫자는 설정한 전체 범위(${gameState.initialMin} ~ ${gameState.initialMax}) 내여야 합니다!`);
        triggerShakeInput();
        return;
    }
    
    // Check if outside current active narrowed bounds
    if (guess < gameState.currentMin || guess > gameState.currentMax) {
        alert(`힌트 적용 오류: 이미 좁혀진 범위(${gameState.currentMin} ~ ${gameState.currentMax}) 바깥의 수입니다. 다른 수를 선택해 보세요!`);
        triggerShakeInput();
        return;
    }
    
    processGuess(guess);
});

function triggerShakeInput() {
    guessInput.classList.add('shake');
    guessInput.focus();
    setTimeout(() => {
        guessInput.classList.remove('shake');
    }, 400);
}

function processGuess(guess) {
    let result = ''; // 'UP', 'DOWN', 'CORRECT'
    const player = gameState.players[gameState.currentPlayerIndex];
    
    if (guess < gameState.targetNumber) {
        result = 'UP';
        gameState.currentMin = Math.max(gameState.currentMin, guess + 1);
    } else if (guess > gameState.targetNumber) {
        result = 'DOWN';
        gameState.currentMax = Math.min(gameState.currentMax, guess - 1);
    } else {
        result = 'CORRECT';
    }
    
    // Log history
    const historyItem = {
        index: gameState.history.length + 1,
        player: player,
        guess: guess,
        result: result
    };
    gameState.history.push(historyItem);
    
    // Add to history UI
    addHistoryItemToUI(historyItem);
    
    // Decrement attempts
    if (gameState.useLimit) {
        gameState.attemptsLeft--;
        attemptsLeftDisplay.textContent = gameState.attemptsLeft;
    }
    
    // Apply game rules based on results
    if (result === 'CORRECT') {
        triggerGameOver(true);
    } else {
        // Update range visuals since min/max might have changed
        updateVisualRangeDisplay();
        
        // Show feedback indicator
        updateFeedbackUI(result, guess);
        
        // Check if out of attempts
        if (gameState.useLimit && gameState.attemptsLeft <= 0) {
            triggerGameOver(false);
        } else {
            // Next Player turn
            if (gameState.gameMode === 'multi') {
                gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
                updateCurrentPlayerBadge();
            }
            // Clear input for next guess
            guessInput.value = '';
            guessInput.focus();
        }
    }
}

function updateFeedbackUI(result, guess) {
    feedbackDisplay.className = `feedback-container ${result.toLowerCase()}`;
    
    if (result === 'UP') {
        feedbackArrow.textContent = '⬆️';
        feedbackText.textContent = `UP! ${guess}보다 큽니다.`;
    } else if (result === 'DOWN') {
        feedbackArrow.textContent = '⬇️';
        feedbackText.textContent = `DOWN! ${guess}보다 작습니다.`;
    }
}

function addHistoryItemToUI(item) {
    // Remove placeholder on first guess
    if (gameState.history.length === 1) {
        historyList.innerHTML = '';
    }
    
    const div = document.createElement('div');
    div.className = 'history-item';
    
    let resultBadgeText = item.result;
    let badgeClass = item.result.toLowerCase();
    
    if (item.result === 'CORRECT') {
        resultBadgeText = '정답 🎉';
    }
    
    const showPlayer = gameState.gameMode === 'multi' ? `<span class="history-player">${item.player}</span>` : '';
    
    div.innerHTML = `
        <div class="history-item-left">
            <span class="history-index">${item.index}</span>
            ${showPlayer}
            <span class="history-guess">${item.guess}</span>
        </div>
        <span class="history-badge ${badgeClass}">${resultBadgeText}</span>
    `;
    
    // Insert at top of list
    historyList.insertBefore(div, historyList.firstChild);
    historyCount.textContent = gameState.history.length;
}

/* ========================================================
   GAME OVER SCREEN LOGIC
   ======================================================= */

function triggerGameOver(isWin) {
    gameState.isGameOver = true;
    
    // Display updates
    if (isWin) {
        gameOverIcon.textContent = '🎉';
        gameOverTitle.textContent = '축하합니다!';
        
        const winner = gameState.history[gameState.history.length - 1].player;
        if (gameState.gameMode === 'multi') {
            gameOverSubtitle.textContent = `정답을 맞히셨습니다. ${winner}의 승리!`;
            statWinnerLabel.textContent = '우승자';
            statWinner.textContent = winner;
        } else {
            gameOverSubtitle.textContent = '정답을 맞히셨습니다.';
            statWinnerLabel.textContent = '도전자';
            statWinner.textContent = '도전자';
        }
    } else {
        gameOverIcon.textContent = '😢';
        gameOverTitle.textContent = '아쉽게 실패했습니다!';
        gameOverSubtitle.textContent = '주어진 기회를 모두 사용하셨습니다.';
        
        statWinnerLabel.textContent = '승리자';
        statWinner.textContent = '컴퓨터 🤖';
    }
    
    revealTargetNumber.textContent = gameState.targetNumber;
    statAttempts.textContent = `${gameState.history.length}회`;
    
    // Populate compact history list
    summaryHistoryList.innerHTML = '';
    // Reverse logic since history UI inserts at top, let's clone elements from historyList
    const historyItems = historyList.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        const clone = item.cloneNode(true);
        summaryHistoryList.appendChild(clone);
    });
    
    if (gameState.history.length === 0) {
        summaryHistoryList.innerHTML = '<div class="history-placeholder">기록이 없습니다.</div>';
    }
    
    // Switch Screen
    gameScreen.classList.remove('active');
    gameOverScreen.classList.add('active');
}

// Restart Same Settings Action
btnRestartSame.addEventListener('click', () => {
    startGame();
});

// Return to Setup Screen Action
btnGoSetup.addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    setupScreen.classList.add('active');
});
