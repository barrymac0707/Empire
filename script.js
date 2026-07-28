const homeForm = document.getElementById('home-form');
const setupForm = document.getElementById('setup-form');
const setupMessage = document.getElementById('setup-message');
const entryForm = document.getElementById('entry-form');
const entryInput = document.getElementById('secret-input');
const playerCountInput = document.getElementById('player-count');
const entryMessage = document.getElementById('entry-message');
const entryProgress = document.getElementById('entry-progress');
const readyButton = document.getElementById('ready-btn');
const shuffleButton = document.getElementById('shuffle-btn');
const nextNameButton = document.getElementById('next-name-btn');
const playAgainButton = document.getElementById('play-again-btn');
const revealProgress = document.getElementById('reveal-progress');
const revealText = document.getElementById('reveal-text');

const screens = {
  home: document.getElementById('home-screen'),
  setup: document.getElementById('setup-screen'),
  entry: document.getElementById('entry-screen'),
  pass: document.getElementById('pass-screen'),
  shuffle: document.getElementById('shuffle-screen'),
  reveal: document.getElementById('reveal-screen'),
  end: document.getElementById('end-screen')
};

const state = {
  totalPlayers: 0,
  currentPlayer: 1,
  secrets: [],
  shuffledSecrets: [],
  revealIndex: 0
};

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}

function setStatus(element, message, type = '') {
  element.textContent = message;
  element.className = `status-message${type ? ` ${type}` : ''}`;
}

function clearStatus(element) {
  if (!element) {
    return;
  }
  element.textContent = '';
  element.className = 'status-message';
}

function setButtonsDisabled(disabled) {
  document.querySelectorAll('button').forEach((button) => {
    button.disabled = disabled;
  });
}

function transitionTo(screenName, callback, delay = 220) {
  setButtonsDisabled(true);
  window.setTimeout(() => {
    showScreen(screenName);
    if (callback) {
      callback();
    }
    setButtonsDisabled(false);
  }, delay);
}

function updateEntryProgress() {
  entryProgress.textContent = `Player ${state.currentPlayer} of ${state.totalPlayers}`;
}

function updateRevealProgress() {
  revealProgress.textContent = `${state.revealIndex + 1} of ${state.shuffledSecrets.length}`;
}

function resetGame() {
  state.totalPlayers = 0;
  state.currentPlayer = 1;
  state.secrets = [];
  state.shuffledSecrets = [];
  state.revealIndex = 0;
  homeForm.reset();
  setupForm.reset();
  entryForm.reset();
  clearStatus(setupMessage);
  clearStatus(entryMessage);
  revealText.textContent = '—';
  showScreen('home');
}

function startGame(event) {
  event.preventDefault();
  state.totalPlayers = 0;
  state.currentPlayer = 1;
  state.secrets = [];
  state.shuffledSecrets = [];
  state.revealIndex = 0;

  transitionTo('setup', () => {
    playerCountInput.focus();
    clearStatus(setupMessage);
  });
}

function submitPlayerCount(event) {
  event.preventDefault();
  const rawValue = playerCountInput.value.trim();

  if (!rawValue) {
    setStatus(setupMessage, 'Please choose a player count to begin.', 'error');
    playerCountInput.focus();
    return;
  }

  const playerCount = Number(rawValue);

  if (!Number.isInteger(playerCount) || playerCount < 3) {
    setStatus(setupMessage, 'Please choose a player count of 3 or more.', 'error');
    playerCountInput.focus();
    return;
  }

  state.totalPlayers = playerCount;
  setupForm.reset();
  updateEntryProgress();
  transitionTo('entry', () => {
    entryInput.focus();
    clearStatus(entryMessage);
  });
}

function submitSecret(event) {
  event.preventDefault();
  const value = entryInput.value.trim();

  if (!value) {
    setStatus(entryMessage, 'Please add a secret name to continue.', 'error');
    entryInput.focus();
    return;
  }

  state.secrets.push(value);
  entryForm.reset();

  if (state.currentPlayer < state.totalPlayers) {
    state.currentPlayer += 1;
    updateEntryProgress();
    transitionTo('pass', () => {
      clearStatus(entryMessage);
    });
  } else {
    transitionTo('shuffle', () => {
      clearStatus(entryMessage);
    });
  }
}

function continueToEntry() {
  updateEntryProgress();
  transitionTo('entry', () => {
    entryInput.focus();
    clearStatus(entryMessage);
  });
}

function fisherYatesShuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function beginReveal() {
  state.shuffledSecrets = fisherYatesShuffle(state.secrets);
  state.revealIndex = 0;
  revealText.textContent = state.shuffledSecrets[0];
  updateRevealProgress();
  transitionTo('reveal', () => {
    nextNameButton.focus();
  });
}

function revealNextName() {
  const nextIndex = state.revealIndex + 1;

  if (nextIndex >= state.shuffledSecrets.length) {
    transitionTo('end', () => {}, 800);
    return;
  }

  state.revealIndex = nextIndex;
  revealText.textContent = state.shuffledSecrets[state.revealIndex];
  updateRevealProgress();

  if (state.revealIndex === state.shuffledSecrets.length - 1) {
    window.setTimeout(() => {
      transitionTo('end', () => {}, 0);
    }, 900);
  }
}

homeForm.addEventListener('submit', startGame);
setupForm.addEventListener('submit', submitPlayerCount);
entryForm.addEventListener('submit', submitSecret);
readyButton.addEventListener('click', continueToEntry);
shuffleButton.addEventListener('click', beginReveal);
nextNameButton.addEventListener('click', revealNextName);
playAgainButton.addEventListener('click', resetGame);

entryInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    entryForm.requestSubmit();
  }
});

playerCountInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    setupForm.requestSubmit();
  }
});

resetGame();
