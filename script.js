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
const box = 15; // kecilkan saiz
const gridSize = 400 / box;

let snake, direction, queuedDirection, food;
let timeLeft, score;
let gameInterval = null;
let timerInterval = null;
let running = false;
let godMode = false; // default OFF, aktif bila redeem

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
}

function startLoops() {
  stopLoops();
  let speed = Math.max(50, 150 - snake.length * 2); 
  gameInterval = setInterval(draw, speed);
  timerInterval = setInterval(updateTimer, 1000);
}

function resetGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  queuedDirection = "RIGHT";
  score = 0;
  timeLeft = 300;
  running = true;
  food = spawnFoodAvoiding(snake);
  updateHUD();
  startLoops();
}

// Kawalan A,W,S,D
document.addEventListener("keydown", (event) => {
  if (!running) return;
  const k = event.key.toLowerCase();
  if (k === "a") queuedDirection = "LEFT";
  else if (k === "w") queuedDirection = "UP";
  else if (k === "d") queuedDirection = "RIGHT";
  else if (k === "s") queuedDirection = "DOWN";
});

// Redeem code
redeemBtn.addEventListener("click", () => {
  const input = document.getElementById("redeemInput");
  const code = input.value.trim();
  if (code === "kingmod") {
    godMode = true;
    alert("✅ Redeem berjaya! God Mode aktif.");
    updateHUD();
    input.value = "";
  } else {
    alert("❌ Kod salah!");
  }
});

// Start game
startBtn.addEventListener("click", () => {
  document.getElementById("menu").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  const input = document.getElementById("redeemInput");
  if (input) input.blur();
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

  // Wrap-around dinding
  if (snakeX < 0) snakeX = 400 - box;
  if (snakeX >= 400) snakeX = 0;
  if (snakeY < 0) snakeY = 400 - box;
  if (snakeY >= 400) snakeY = 0;

  // Eat check
  if (snakeX === food.x && snakeY === food.y) {
    score += 10;
    food = spawnFoodAvoiding(snake);
    updateHUD();
    startLoops(); // restart loop dengan speed baru
  } else {
    snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY };

  // Collision check kalau bukan God Mode
  if (!godMode) {
    const hitSelf = snake.some((seg, i) => i !== 0 && seg.x === newHead.x && seg.y === newHead.y);
    if (hitSelf) {
      gameOver("Game Over! Ular makan diri sendiri.");
      return;
    }
  }

  snake.unshift(newHead);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i === 0) ? "#00f" : "#0ff";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }
}