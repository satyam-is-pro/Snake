const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 400;
canvas.height = 400;

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval;
let gameStarted = false;
let bestScore = localStorage.getItem('snakeBestScore') || 0;
document.getElementById('bestScore').textContent = bestScore;

function drawGame() {
    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();
    checkCollision();
}

function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for(let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        // Snake body gradient
        const gradient = ctx.createLinearGradient(
            segment.x * gridSize,
            segment.y * gridSize,
            (segment.x + 1) * gridSize,
            (segment.y + 1) * gridSize
        );
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#45a049');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(76, 175, 80, 0.5)';
        ctx.shadowBlur = 5;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Snake head
        if (index === 0) {
            ctx.fillStyle = '#66bb6a';
            ctx.shadowBlur = 10;
            ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 4, gridSize - 8, gridSize - 8);
        }
    });
    ctx.shadowBlur = 0; // Reset shadow for other drawings
}

function drawFood() {
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = 'rgba(255, 68, 68, 0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/3,
        food.y * gridSize + gridSize/3,
        gridSize/6,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        generateFood();
    }
}

function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false;
    
    // Check if final score beats the previous best score
    const previousBest = localStorage.getItem('snakeBestScore') || 0;
    const isNewHighScore = score > previousBest;
    
    // Show game over screen
    const existingOverlay = document.querySelector('.celebration-overlay');
    if (!existingOverlay) {
        const overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';
        overlay.innerHTML = `
            <div class="celebration-content">
                <h1>${isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER'}</h1>
                <p>Score: ${score}</p>
                <p>Best: ${Math.max(score, previousBest)}</p>
                <button onclick="startGame()">Play Again</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // Update best score and show confetti only if it's a new record
    if (isNewHighScore) {
        bestScore = score;
        localStorage.setItem('snakeBestScore', bestScore);
        document.getElementById('bestScore').textContent = bestScore;
        createConfetti();
    }
}

function startGame() {
    // Remove any existing overlay
    const overlay = document.querySelector('.celebration-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    
    if (!gameStarted) {
        snake = [{ x: 10, y: 10 }];
        dx = 1;
        dy = 0;
        score = 0;
        scoreElement.textContent = score;
        generateFood();
        gameStarted = true;
        gameInterval = setInterval(drawGame, 150);
    }
}

document.addEventListener('keydown', (event) => {
    if (!gameStarted) return;
    
    switch (event.key) {
        case 'ArrowUp':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
}); 