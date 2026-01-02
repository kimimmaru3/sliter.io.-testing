// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI elements
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const modeEl  = document.getElementById("mode");
const redeemBtn = document.getElementById("redeemBtn");
const startBtn  = document.getElementById("startBtn");

// Grid setup
const box = 20;
const gridSize = 400 / box; // 20

// Game state
let snake, direction, queuedDirection, food;
let timeLeft, score;
let gameInterval = null;
let timerInterval = null;
let running = false;

// Utils
function randGridPos() {
  return Math.floor(Math.random() * gridSize) * box;
}

function spawnFoodAvoiding(occupiedCells) {
  for (let i = 0; i < 100; i++) {
    const fx = randGridPos();
    const fy = randGridPos();
    const conflict = occupiedCells.some(c => c.x === fx && c.y === fy);
    if (!conflict) return { x: fx, y: fy };
  }
  return { x: 0, y: 0 };
}

function updateHUD() {
  timerEl.innerText = "Masa: " + timeLeft + "s";
  scoreEl.innerText = "Skor: " + score;
  modeEl.innerText  = "Mode: God Mode";
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
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  queuedDirection = "RIGHT";
  score = 0;
  timeLeft = 300; // 5 min
  running = true;

  food = spawnFoodAvoiding(snake);

  updateHUD();
  startLoops();
}

// Input handling (A,W,S,D)
document.addEventListener("keydown", (event) => {
  if (!running) return;
  const k = event.key.toLowerCase();
  if (k === "a" && direction !== "RIGHT") queuedDirection = "LEFT";
  if (k === "w" && direction !== "DOWN")  queuedDirection = "UP";
  if (k === "d" && direction !== "LEFT")  queuedDirection = "RIGHT";
  if (k === "s" && direction !== "UP")    queuedDirection = "DOWN";
});

// Redeem code (optional, tapi God Mode sentiasa aktif)
redeemBtn.addEventListener("click", () => {
  const input = document.getElementById("redeemInput");
  const code = input.value.trim();
  if (code === "kingmod") {
    alert("✅ Redeem berjaya! God Mode sentiasa aktif.");
    input.value = "";
  } else {
    alert("❌ Kod salah!");
  }
});

// Start game
startBtn.addEventListener("click", () => {
  document.getElementById("menu").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  resetGame();
});

// Timer tick
function updateTimer() {
  timeLeft--;
  timerEl.innerText = "Masa: " + timeLeft + "s";
  if (timeLeft <= 0) {
    gameOver("🎉 Tahniah! Redeem code adalah kingmod.");
  }
}

// Draw loop
function draw() {
  direction = queuedDirection;
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
    food = spawnFoodAvoiding(snake);
    updateHUD();
  } else {
    snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY };
  snake.unshift(newHead);

  // Draw player snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i === 0) ? "#00f" : "#0ff";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }
}