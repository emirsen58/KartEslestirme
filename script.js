console.log("script.js loaded");
console.log("script.js loaded");
const emojis = ['🐶', '🍕', '🚗', '💡', '🌈', '🎈', '📚', '🎮', '🐱', '🍔', '🚀', '⚽', '🎵', '👑', '🧩', '🌟', '🍩', '🐸', '🎲', '🧁', '🌍', '📷', '🦄', '🍉', '🕹️', '🐠', '🍓', '🧸', '📱', '🏆', '🦋', '🎯'];
let board = [];
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let timer;
let seconds = 0;
let level = 4;

const gameBoard = document.getElementById("gameBoard");
const movesSpan = document.getElementById("moves");
const timerSpan = document.getElementById("timer");
const bestScoreSpan = document.getElementById("bestScore");

const flipSound = new Audio("assets/sounds/flip.mp3");
const matchSound = new Audio("assets/sounds/match.mp3");
const failSound = new Audio("assets/sounds/fail.mp3");

function startGame() {
  console.log("startGame called");
  level = parseInt(document.getElementById("level").value);
  const totalCards = level * level;

  const emojiSet = [...emojis].slice(0, Math.floor(totalCards / 2));
  board = shuffle([...emojiSet, ...emojiSet]);

  // If odd number of cards, add one unmatched card at the end
  if (totalCards % 2 !== 0) {
    board.push("❓"); // unmatched card emoji
  }

  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${level}, 1fr)`;
  gameBoard.style.gridTemplateRows = `repeat(${level}, 1fr)`;

  // Dynamically set board size based on level and card size
  const cardSize = 60; // px
  const gap = 5; // px
  const boardSize = level * cardSize + (level - 1) * gap;
  gameBoard.style.width = `${boardSize}px`;
  gameBoard.style.height = `${boardSize}px`;

  board.forEach((emoji, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    if (emoji === "❓") {
      card.classList.add("unmatched");
    }
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    card.innerText = "";  // Hide emoji initially
    card.addEventListener("click", handleCardClick);
    gameBoard.appendChild(card);
  });

  flippedCards = [];
  matchedCount = 0;
  moves = 0;
  seconds = 0;
  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);
  updateStats();
  updateBestScoreDisplay();
}

function handleCardClick(e) {
  const card = e.currentTarget;
  if (card.classList.contains("unmatched")) return; // Ignore unmatched card clicks
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
  if (flippedCards.length === 2) return;

  // flipSound.play();
  card.classList.add("flipped");
  card.innerText = card.dataset.emoji;
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    updateStats();
    const [first, second] = flippedCards;
    if (first.dataset.emoji === second.dataset.emoji) {
      // matchSound.play();
      first.classList.add("matched");
      second.classList.add("matched");
      flippedCards = [];
      matchedCount += 2;
      if (matchedCount === board.length - (board.includes("❓") ? 1 : 0)) endGame();
    } else {
      // failSound.play();
      setTimeout(() => {
        first.classList.remove("flipped");
        second.classList.remove("flipped");
        first.innerText = "";
        second.innerText = "";
        flippedCards = [];
      }, 1000);
    }
  }
}

function endGame() {
  clearInterval(timer);
  saveBestScore();
  alert(`🎉 Tebrikler! Hamle: ${moves}, Süre: ${formatTime(seconds)}`);
}

function restartGame() {
  startGame();
}

document.getElementById("startBtn").addEventListener("click", startGame);

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updateTimer() {
  seconds++;
  timerSpan.innerText = formatTime(seconds);
}

function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateStats() {
  movesSpan.innerText = moves;
  timerSpan.innerText = formatTime(seconds);
}

function saveBestScore() {
  const key = `bestScore${level}`;
  const current = { moves, time: seconds };
  const saved = JSON.parse(localStorage.getItem(key));
  if (!saved || current.moves < saved.moves || (current.moves === saved.moves && current.time < saved.time)) {
    localStorage.setItem(key, JSON.stringify(current));
  }
}

function updateBestScoreDisplay() {
  const key = `bestScore${level}`;
  const saved = JSON.parse(localStorage.getItem(key));
  bestScoreSpan.innerText = saved ? `${saved.moves} hamle, ${formatTime(saved.time)}` : "-";
}
