// game.js — professional memory game script (Hindi commented)

/* -------------------------
   CONFIG / ASSETS
   ------------------------- */
const icons = ['🍎','🍌','🍇','🍓','🍒','🍍','🥝','🍉']; // 8 icons -> 16 cards
let cardValues = [];

const board = document.getElementById('game-board');
const movesSpan = document.getElementById('moves');
const matchesSpan = document.getElementById('matches');
const restartBtn = document.getElementById('restart');

const loadingScreen = document.getElementById('loading-screen');
const winPopup = document.getElementById('win-popup');
const winMessage = document.getElementById('win-message');
const playAgainBtn = document.getElementById('play-again');

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let gameStarted = false; // to prevent clicks during auto-start / loading

/* -------------------------
   WebAudio: small sound helpers
   ------------------------- */
const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;

function playTone(freq = 440, length = 0.08, type = 'sine', gain = 0.08) {
  if (!audioCtx) return;
  const ctx = audioCtx;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + length);
  o.stop(ctx.currentTime + length + 0.02);
}

function playFlipSound() { playTone(820, 0.05, 'triangle', 0.06); }
function playMatchSound() { playTone(560, 0.12, 'sine', 0.12); playTone(880, 0.06, 'sine', 0.06); }
function playWrongSound() { playTone(220, 0.12, 'sawtooth', 0.12); }
function playWinSound() {
  playTone(880, 0.06, 'sine', 0.08);
  setTimeout(()=> playTone(990, 0.06, 'sine', 0.08), 90);
  setTimeout(()=> playTone(1180, 0.12, 'sine', 0.12), 200);
}

/* -------------------------
   UTILS
   ------------------------- */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* -------------------------
   BUILD / RENDER BOARD
   ------------------------- */
function initGame() {
  // reset state
  firstCard = null;
  secondCard = null;
  lockBoard = true; // temporarily lock during setup / autoshow
  moves = 0;
  matches = 0;
  updateStats();

  // prepare card values
  cardValues = [...icons, ...icons];
  shuffle(cardValues);

  board.innerHTML = '';

  // create cards
  cardValues.forEach((val, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = val;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-back">?</div>
        <div class="card-front">${val}</div>
      </div>
    `;

    card.addEventListener('click', () => onCardClicked(card));

    board.appendChild(card);
  });

  // hide popup properly
  hideWinPopup();

  // small delay then auto-start animation + unlock
  setTimeout(() => {
    autoRevealAnimation().then(() => {
      lockBoard = false;
      gameStarted = true;
    });
  }, 400);
}

/* -------------------------
   AUTO-REVEAL (brief "show" at start)
   ------------------------- */
async function autoRevealAnimation() {
  const cards = Array.from(board.querySelectorAll('.card'));
  lockBoard = true;
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    setTimeout(() => c.classList.add('flipped'), i * 50);
    setTimeout(() => c.classList.remove('flipped'), 400 + i * 30);
  }
  await new Promise(r => setTimeout(r, 850));
}

/* -------------------------
   CARD CLICK HANDLING
   ------------------------- */
function onCardClicked(card) {
  if (!gameStarted) return;
  if (lockBoard) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  playFlipSound();

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  updateStats();
  lockBoard = true;

  setTimeout(checkForMatch, 420);
}

function checkForMatch() {
  if (!firstCard || !secondCard) {
    resetTurn();
    return;
  }

  const isMatch = firstCard.dataset.value === secondCard.dataset.value;

  if (isMatch) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    pulseElement(firstCard);
    pulseElement(secondCard);

    matches++;
    playMatchSound();
    updateStats();
    resetTurn();
    checkWin();
  } else {
    playWrongSound();
    shakeElement(firstCard);
    shakeElement(secondCard);

    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn();
    }, 700);
  }
}

/* -------------------------
   TURN / STATS / WIN
   ------------------------- */
function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function updateStats() {
  movesSpan.textContent = `Moves: ${moves}`;
  matchesSpan.textContent = `Matches: ${matches}`;
}

function checkWin() {
  if (matches === icons.length) {
    lockBoard = true;
    setTimeout(() => showWinPopup(), 350);
  }
}

/* -------------------------
   UI Anim helpers
   ------------------------- */
function shakeElement(el) {
  if (!el) return;
  if (el.animate) {
    el.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(8px)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(4px)' },
      { transform: 'translateX(0)' }
    ], { duration: 500, easing: 'ease-in-out' });
  } else {
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 520);
  }
}

function pulseElement(el) {
  if (!el) return;
  if (el.animate) {
    el.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.06)' },
      { transform: 'scale(1)' }
    ], { duration: 360, easing: 'ease-out' });
  } else {
    el.style.transform = 'scale(1.05)';
    setTimeout(() => el.style.transform = '', 360);
  }
}

/* -------------------------
   WIN POPUP
   ------------------------- */
function showWinPopup() {
  playWinSound();
  winMessage.textContent = `🎉 बढ़िया! आपने जीत लिया — Moves: ${moves}`;

  winPopup.style.display = 'flex';
  winPopup.style.pointerEvents = 'auto';
  winPopup.style.opacity = '1';

  lightweightConfetti();
}

function hideWinPopup() {
  winPopup.style.display = 'none';
  winPopup.style.pointerEvents = 'none';
}

/* -------------------------
   lightweight confetti
   ------------------------- */
function lightweightConfetti() {
  const num = 18;
  for (let i = 0; i < num; i++) {
    const c = document.createElement('div');
    c.style.position = 'fixed';
    c.style.zIndex = 10000;
    c.style.left = `${50 + (Math.random() - 0.5) * 60}%`;
    c.style.top = `${30 + Math.random() * 10}%`;
    c.style.pointerEvents = 'none';
    c.style.fontSize = `${12 + Math.random() * 18}px`;
    c.style.opacity = '0.95';
    const emojis = ['✨','🎉','🥳','🟢','🔵','🟣','🟡','❤️'];
    c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(c);
    const dx = (Math.random() - 0.5) * 200;
    const dy = 200 + Math.random() * 300;
    c.animate([
      { transform: `translateY(0) translateX(0) rotate(0deg)`, opacity: 1 },
      { transform: `translateY(${dy}px) translateX(${dx}px) rotate(${(Math.random()*720-360)}deg)`, opacity: 0 }
    ], { duration: 1000 + Math.random() * 800, easing: 'cubic-bezier(.2,.9,.2,1)' })
    setTimeout(()=> c.remove(), 1700 + Math.random()*800);
  }
}

/* -------------------------
   LOADING SCREEN
   ------------------------- */
function fadeOutLoading() {
  if (!loadingScreen) return Promise.resolve();
  return new Promise(resolve => {
    loadingScreen.style.transition = 'opacity 0.6s ease';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      resolve();
    }, 650);
  });
}

/* -------------------------
   BIND UI BUTTONS
   ------------------------- */
restartBtn.addEventListener('click', () => {
  restartBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: 180 });
  gameStarted = false;
  initGame();
});

playAgainBtn.addEventListener('click', () => {
  hideWinPopup();
  gameStarted = false;
  initGame();
});

/* -------------------------
   BOOTSTRAP
   ------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  await fadeOutLoading();
  initGame();
});

/* -------------------------
   Keyboard shortcut
   ------------------------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') {
    gameStarted = false;
    initGame();
  }
});
