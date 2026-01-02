// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI elements
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const modeEl  = document.getElementById("mode");
const redeemBtn = document.getElementById("redeemBtn");
const startBtn  = document.getElementById("startBtn");
const pauseBtn  = document.getElementById("pauseBtn");

// Grid setup
const box = 20;
const gridSize = 400 / box; // 20

// Game state
let snake, direction, queuedDirection, food, enemySnake, enemyDirection;
let godMode, timeLeft, score;
let gameInterval = null;
let timerInterval = null;
let paused = false;
let running = false;

// Utils
function randGridPos() {
  return Math.floor(Math.random() * gridSize) * box;
}

function spawnFoodAvoiding(occupiedCells) {
  // Try multiple times to avoid spawning on occupied cells
  for (let i = 0; i < 100; i++) {
    const fx = randGridPos();
    const fy = randGridPos();
    const conflict = occupiedCells.some(c => c.x === fx && c.y === fy);
    if (!conflict) return { x: fx, y: fy };
  }
  // Fallback (rare)
  return { x: 0, y: 0 };
}

function cellsOccupied() {
  return [...snake, ...enemySnake];
}

function updateHUD() {
  timerEl.innerText = "Masa: " + timeLeft + "s";
  scoreEl.innerText = "Skor: " + score;
  modeEl.innerText  = "Mode: " + (godMode ? "God Mode" : "Normal");
}

function gameOver(message) {
  stopLoops();
  running = false;
  alert(message);
}

function stopLoops() {
  if (gameInterval) clearInterval(gameInterval);
  if (timerInterval) clearInterval(timerInterval);
  gameInterval = null;
  timerInterval = null;
}

function startLoops() {
  stopLoops();
  gameInterval = setInterval(draw, 100);
  timerInterval = setInterval(updateTimer, 1000);
}

function resetGame() {
  // Player snake center-ish
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  queuedDirection = "RIGHT";
  score = 0;

  // Enemy snake (AI) corner-ish
  enemySnake = [{ x: 5 * box, y: 5 * box }];
  enemyDirection = "DOWN";

  godMode = false;
  timeLeft = 300; // 5 min
  paused = false;
  running = true;

  // Spawn food avoiding both snakes
  food = spawnFoodAvoiding(cellsOccupied());

  updateHUD();
  startLoops();
}

// Input handling (prevent 180° turns and double inputs per tick)
document.addEventListener("keydown", (event) => {
  if (!running || paused) return;
  const k = event.key;
  if (k === "ArrowLeft"  && direction !== "RIGHT") queuedDirection = "LEFT";
  if (k === "ArrowUp"    && direction !== "DOWN")  queuedDirection = "UP";
  if (k === "ArrowRight" && direction !== "LEFT")  queuedDirection = "RIGHT";
  if (k === "ArrowDown"  && direction !== "UP")    queuedDirection = "DOWN";
});

// Redeem code
redeemBtn.addEventListener("click", () => {
  const input = document.getElementById("redeemInput");
  const code = input.value.trim();
  if (code === "kingmod") {
    godMode = true;
    updateHUD();
    alert("✅ God Mode Aktif!");
    input.value = "";
  } else {
    alert("❌ Kod salah!");
  }
});

// Start / Reset
startBtn.addEventListener("click", () => {
  resetGame();
});

// Pause / Resume
pauseBtn.addEventListener("click", () => {
  if (!running) return;
  paused = !paused;
  if (paused) {
    stopLoops();
  } else {
    startLoops();
  }
});

// Timer tick
function updateTimer() {
  timeLeft--;
  timerEl.innerText = "Masa: " + timeLeft + "s";
  if (timeLeft <= 0) {
    gameOver("⏰ Masa habis! Game Over.");
  }
}

// Enemy AI (simple wall-bounce + occasional random turns)
function moveEnemy() {
  let ex = enemySnake[0].x;
  let ey = enemySnake[0].y;

  // Random small chance to change direction
  if (Math.random() < 0.05) {
    const dirs = ["UP", "DOWN", "LEFT", "RIGHT"];
    enemyDirection = dirs[Math.floor(Math.random() * dirs.length)];
  }

  if (enemyDirection === "DOWN") ey += box;
  if (enemyDirection === "UP") ey -= box;
  if (enemyDirection === "LEFT") ex -= box;
  if (enemyDirection === "RIGHT") ex += box;

  // Bounce at edges
  if (ey >= 400) enemyDirection = "UP";
  if (ey < 0)    enemyDirection = "DOWN";
  if (ex >= 400) enemyDirection = "LEFT";
  if (ex < 0)    enemyDirection = "RIGHT";

  enemySnake[0] = { x: ex, y: ey };
}

// Draw loop
function draw() {
  // Apply queuedDirection once per tick
  direction = queuedDirection;

  // Clear
  ctx.clearRect(0, 0, 400, 400);

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // Move player
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;
  if (direction === "LEFT")  snakeX -= box;
  if (direction === "UP")    snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN")  snakeY += box;

  // Eat check
  if (snakeX === food.x && snakeY === food.y) {
    score += 10;
    // Spawn new food not colliding with snakes
    food = spawnFoodAvoiding(cellsOccupied());
    updateHUD();
  } else {
    snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY };

  // Collisions (walls / self) unless godMode
  const hitWall = snakeX < 0 || snakeY < 0 || snakeX >= 400 || snakeY >= 400;
  const hitSelf = snake.some(seg => seg.x === newHead.x && seg.y === newHead.y);

  if (!godMode && (hitWall || hitSelf)) {
    gameOver("Game Over!");
    return;
  }

  // Collision with enemy head (always fatal)
  if (snakeX === enemySnake[0].x && snakeY === enemySnake[0].y) {
    gameOver("Game Over! Kena ular musuh.");
    return;
  }

  // Add new head
  snake.unshift(newHead);

  // Move enemy
  moveEnemy();

  // Draw player snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i === 0) ? "#00f" : "#0ff";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw enemy snake (single segment for now)
  for (let i = 0; i < enemySnake.length; i++) {
    ctx.fillStyle = (i === 0) ? "green" : "lime";
    ctx.fillRect(enemySnake[i].x, enemySnake[i].y, box, box);
  }
}

// Auto start first run
resetGame();