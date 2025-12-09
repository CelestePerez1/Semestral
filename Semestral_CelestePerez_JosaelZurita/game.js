// =========================
// CONFIGURACIÓN DEL JUEGO
// =========================

const defaultConfig = {
    game_title: "🎮 Memorama Turístico de Coclé",
    game_subtitle: "Encuentra las parejas de íconos turísticos",
    instructions: "Haz clic en las cartas para voltearlas y encuentra todas las parejas. ¡Hazlo en el menor tiempo posible!",
    scores_title: "🏆 Mejores Tiempos",
    primary_color: "#667eea",
    secondary_color: "#764ba2",
    accent_color: "#11998e",
    success_color: "#38ef7d",
    card_color: "#f093fb"
};

const gameIcons = ['🏖️', '⛰️', '🌊', '🌺', '⛪', '🎭', '🌴', '☀️'];

let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    time: 0,
    timer: null,
    isPaused: false,
    isGameActive: false
};

let allScores = [];


// =========================
// DATA SDK
// =========================

const dataHandler = {
    onDataChanged(data) {
        allScores = data.filter(r => r.type === 'score');
        renderScores();
    }
};

async function initDataSDK() {
    const initResult = await window.dataSdk.init(dataHandler);
    if (!initResult.isOk) console.error("Error al inicializar Data SDK");
}


// =========================
// CONFIG SDK (editable)
// =========================

async function onConfigChange(config) {
    document.documentElement.style.setProperty('--primary-color', config.primary_color || defaultConfig.primary_color);
    document.documentElement.style.setProperty('--secondary-color', config.secondary_color || defaultConfig.secondary_color);

    document.getElementById('gameTitle').textContent = config.game_title || defaultConfig.game_title;
    document.getElementById('gameSubtitle').textContent = config.game_subtitle || defaultConfig.game_subtitle;
    document.getElementById('gameInstructions').textContent = config.instructions || defaultConfig.instructions;
    document.getElementById('scoresTitle').textContent = config.scores_title || defaultConfig.scores_title;
}

if (window.elementSdk) {
    window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities: (config) => ({
            recolorables: [
                { get: () => config.primary_color, set: (v) => { config.primary_color = v; window.elementSdk.setConfig({ primary_color: v }); }},
                { get: () => config.secondary_color, set: (v) => { config.secondary_color = v; window.elementSdk.setConfig({ secondary_color: v }); }},
                { get: () => config.accent_color, set: (v) => { config.accent_color = v; window.elementSdk.setConfig({ accent_color: v }); }}
            ]
        }),
        mapToEditPanelValues: (config) => new Map([
            ['game_title', config.game_title],
            ['game_subtitle', config.game_subtitle],
            ['instructions', config.instructions],
            ['scores_title', config.scores_title]
        ])
    });
}


// =========================
// FUNCIONES PRINCIPALES
// =========================

function initGame() {
    const gameBoard = document.getElementById('gameBoard');
    const doubledIcons = [...gameIcons, ...gameIcons];

    gameState.cards = doubledIcons.sort(() => Math.random() - 0.5);
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.time = 0;
    gameState.isPaused = false;
    gameState.isGameActive = true;

    gameBoard.innerHTML = gameState.cards.map((icon, index) => `
        <div class="game-card" data-index="${index}" onclick="flipCard(${index})">
            <span class="card-icon">${icon}</span>
        </div>
    `).join('');

    updateStats();

    if (gameState.timer) clearInterval(gameState.timer);

    gameState.timer = setInterval(() => {
        if (!gameState.isPaused && gameState.isGameActive) {
            gameState.time++;
            document.getElementById('gameTime').textContent = gameState.time;
        }
    }, 1000);

    document.getElementById('pauseBtn').textContent = '⏸️ Pausar';
}

function updateStats() {
    document.getElementById('gameMoves').textContent = gameState.moves;
    document.getElementById('gamePairs').textContent = gameState.matchedPairs;
    document.getElementById('gameTime').textContent = gameState.time;
}

function flipCard(index) {
    if (!gameState.isGameActive || gameState.isPaused) return;

    const card = document.querySelector(`[data-index="${index}"]`);

    if (card.classList.contains('flipped') ||
        card.classList.contains('matched') ||
        gameState.flippedCards.length === 2) return;

    card.classList.add('flipped');
    gameState.flippedCards.push({ index, icon: gameState.cards[index], element: card });

    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateStats();
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [card1, card2] = gameState.flippedCards;

    if (card1.icon === card2.icon) {
        card1.element.classList.add('matched');
        card1.element.classList.remove('flipped');

        card2.element.classList.add('matched');
        card2.element.classList.remove('flipped');

        gameState.matchedPairs++;
        updateStats();

        if (gameState.matchedPairs === gameIcons.length) {
            gameState.isGameActive = false;
            clearInterval(gameState.timer);
            setTimeout(showVictory, 500);
        }
    } else {
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
    }

    gameState.flippedCards = [];
}

function showVictory() {
    document.getElementById('finalTime').textContent = gameState.time;
    document.getElementById('finalMoves').textContent = gameState.moves;
    document.getElementById('victoryModal').style.display = 'flex';
    document.getElementById('playerName').focus();
}

async function saveScore(event) {
    event.preventDefault();

    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) return;

    if (allScores.length >= 999) {
        showNotification("⚠️ Límite de puntuaciones alcanzado.");
        return;
    }

    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Guardando...';

    const result = await window.dataSdk.create({
        id: "score-" + Date.now(),
        type: "score",
        playerName,
        gameScore: gameState.matchedPairs,
        gameTime: gameState.time,
        gameMoves: gameState.moves,
        createdAt: new Date().toISOString()
    });

    btn.disabled = false;
    btn.textContent = "💾 Guardar Puntuación";

    if (result.isOk) {
        document.getElementById('victoryModal').style.display = 'none';
        document.getElementById('nameForm').reset();
        showNotification("✅ ¡Puntuación guardada!");
    } else {
        showNotification("❌ Error al guardar puntuación.");
    }
}

function renderScores() {
    const scoresList = document.getElementById('scoresList');

    if (allScores.length === 0) {
        scoresList.innerHTML = `<div class="empty-scores">No hay puntuaciones aún. ¡Sé el primero!</div>`;
        return;
    }

    const sortedScores = [...allScores]
        .sort((a, b) => a.gameTime === b.gameTime ? a.gameMoves - b.gameMoves : a.gameTime - b.gameTime)
        .slice(0, 10);

    const medals = ['🥇', '🥈', '🥉'];

    scoresList.innerHTML = sortedScores.map((score, index) => `
        <div class="score-item">
            <div class="score-rank">${medals[index] || (index + 1) + '.'}</div>
            <div class="score-info">
                <div class="score-name">${score.playerName}</div>
                <div class="score-details">${score.gameMoves} movimientos • ${new Date(score.createdAt).toLocaleDateString("es-ES")}</div>
            </div>
            <div class="score-time">${score.gameTime}s</div>
        </div>
    `).join('');
}

function resetGame() {
    if (gameState.timer) clearInterval(gameState.timer);
    initGame();
    showNotification("🎮 ¡Nuevo juego iniciado!");
}

function pauseGame() {
    const btn = document.getElementById('pauseBtn');

    if (!gameState.isGameActive) return;

    gameState.isPaused = !gameState.isPaused;

    if (gameState.isPaused) {
        btn.textContent = "▶️ Reanudar";
        btn.classList.add("btn-secondary");
        showNotification("⏸️ Juego pausado");
    } else {
        btn.textContent = "⏸️ Pausar";
        btn.classList.remove("btn-secondary");
        showNotification("▶️ Juego reanudado");
    }
}


// =========================
// UTILIDADES
// =========================

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 2000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = "fadeOut 0.3s";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


// =========================
// INICIALIZACIÓN
// =========================

document.getElementById('victoryModal').addEventListener('click', (e) => {
    if (e.target === victoryModal) victoryModal.style.display = 'none';
});

window.addEventListener("DOMContentLoaded", async () => {
    await initDataSDK();
    initGame();
});
