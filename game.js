

// card icons
const icons = ['🍎','🍌','🍇','🍓','🍒','🍍','🥝','🍉']; // 8 आइकन = 8 pairs = 16 कार्ड
let cardValues = [];

// DOM elements
const board = document.getElementById('game-board');
const movesSpan = document.getElementById('moves');
const matchesSpan = document.getElementById('matches');
const restartBtn = document.getElementById('restart');

let firstCard = null;
let secondCard = null;
let lockBoard = false; // checking the match
let moves = 0;
let matches = 0;

// Fisher-Yates shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// बोर्ड बनाओ
function initGame() {
  // सेटअप वैल्यूज़
  cardValues = [...icons, ...icons]; // duplicate to make pairs
  shuffle(cardValues);

  board.innerHTML = ''; 
  moves = 0;
  matches = 0;
  updateStats();

  // हर कार्ड DOM बनाओ
  cardValues.forEach((val, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = val; // कार्ड की पहचान

    // inner structure (front + back)
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-back">?</div>
        <div class="card-front">${val}</div>
      </div>
    `;

    // क्लिक हैंडलर
    card.addEventListener('click', () => onCardClicked(card));

    board.appendChild(card);
  });
}

// कार्ड क्लिक करने पर
function onCardClicked(card) {
  if (lockBoard) return;            // ब्लॉक हो तो कुछ न करें
  if (card === firstCard) return;   // वही कार्ड दो बार क्लिक न हो

  card.classList.add('flipped');    // कार्ड को पलटो (face-up)

  if (!firstCard) {
    // पहला कार्ड चुना गया
    firstCard = card;
    return;
  }

  // दूसरा कार्ड चुना गया
  secondCard = card;
  moves++;
  updateStats();
  lockBoard = true;

  checkForMatch();
}

// मैच चेक करो
function checkForMatch() {
  const isMatch = firstCard.dataset.value === secondCard.dataset.value;

  if (isMatch) {
    // मैच हो गया: दोनों को matched क्लास दे दो
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matches++;
    resetTurn();
    updateStats();
    checkWin();
  } else {
    // मैच नहीं: थोड़ी देर के बाद दोनों को वापस पलटा (face-down)
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn();
    }, 800);
  }
}

// टर्न रिसेट करो
function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// stats अपडेट
function updateStats() {
  movesSpan.textContent = `Moves: ${moves}`;
  matchesSpan.textContent = `Matches: ${matches}`;
}

// गेम जीतने पर
function checkWin() {
  if (matches === icons.length) {
    setTimeout(() => {
      alert(`🎉 बढ़िया! आप जीत गए। Moves: ${moves}`);
    }, 200);
  }
}

// restart बटन
restartBtn.addEventListener('click', () => initGame());

// पहली बार शुरू करो
initGame();
