// Import stylesheets
import './style.css';

const winningPoints = 80;

let activePlayer = null;
let diceNumber = -1;
const player0 = new Player('0');
const player1 = new Player('1');

const playerBoards = document.querySelectorAll('.player-board');
const board = document.querySelector('.board');
const inputs = document.querySelectorAll('.player-title-input');
const playerInfo = document.querySelector('.play-info');
const rollDiceBtn = document.getElementById('rollDice');
const holdBtn = document.getElementById('hold');
const newGameBtn = document.getElementById('newGame');
const diceImg = document.querySelector('#diceResult');
const diceLoadImg = document.querySelector('#diceLoad');
const diceSound = document.getElementById('diceSound');
const countingSound = document.getElementById('countingSound');
const winningSound = document.getElementById('winningSound');

function Player(id) {
  this.id = id;
  this.name;
  this.currentPoints = 0;
  this.totalPoints = 0;
}

Player.prototype.setName = function (name) {
  this.name = name;
};

Player.prototype.getNameToDisplay = function () {
  return this.name || `Giocatore ${+this.id + 1}`;
};

Player.prototype.addCurrentPoints = function (points) {
  this.currentPoints += points;
};

Player.prototype.addTotalPoints = function (points) {
  this.totalPoints += points;
  this.currentPoints = 0;
};

Player.prototype.resetCurrentPoints = function () {
  this.currentPoints = 0;
};

Player.prototype.reset = function () {
  //this.name = null;
  this.currentPoints = 0;
  this.totalPoints = 0;
};

Player.prototype.isWinner = function () {
  return this.totalPoints >= winningPoints;
};

// board functions
const initGame = () => {
  player0.reset();
  player1.reset();
  activePlayer = player0;
  diceNumber = -1;
  updateUI(true);
};

const getPlayer = (active) => {
  return active
    ? activePlayer
    : activePlayer.id === player0.id
    ? player1
    : player0;
};

const getWinner = () => {
  return player0.isWinner() ? player0 : player1.isWinner() ? player1 : null;
};

const wait = (duration) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

const updateDiceUI = (load) => {
  if (load) {
    diceImg.classList.add('hidden');
    diceLoadImg.classList.add('load');
  } else {
    diceImg.classList.remove('hidden');
    diceLoadImg.classList.remove('load');
  }
};

const updateUI = () => {
  const winner = getWinner();

  // update player boards
  playerBoards.forEach(async (board) => {
    const isActive = board.dataset.playerId === activePlayer.id;
    // set active board
    if (isActive && !winner) {
      board.classList.add('player-board-active');
    } else {
      board.classList.remove('player-board-active');
    }

    const player = getPlayer(isActive);

    // update board name
    board.querySelector('.player-title').innerText = player.getNameToDisplay();

    // update player currentPoints
    const currentPointsElm = board
      .querySelectorAll('.points')[1]
      .querySelector('p');
    if (player.currentPoints === 0) {
      currentPointsElm.innerText = '0';
    } else {
      let currentValue1 = +currentPointsElm.innerText;
      for (let i = currentValue1; i < player.currentPoints; i++) {
        currentValue1 += 1;
        await wait(20);
        currentPointsElm.innerText = currentValue1;
      }
    }

    // update player totalPoints
    const totalPointsElm = board
      .querySelectorAll('.points')[0]
      .querySelector('p');

    if (player.totalPoints === 0) {
      totalPointsElm.innerText = '0';
    } else {
      let currentValue = +totalPointsElm.innerText;
      for (let j = currentValue; j < player.totalPoints; j++) {
        currentValue += 1;
        await wait(30);
        totalPointsElm.innerText = currentValue;
      }
    }
  });

  // set playInfo
  if (winner) {
    winningSound.play();
    playerInfo.textContent = `Ha vinto ${winner.getNameToDisplay()}!`;
  } else {
    playerInfo.textContent = `E' il turno di ${activePlayer.getNameToDisplay()}`;
  }

  // update dice image
  let numString = '';
  switch (diceNumber) {
    case 1:
      numString = 'one';
      break;
    case 2:
      numString = 'two';
      break;
    case 3:
      numString = 'three';
      break;
    case 4:
      numString = 'four';
      break;
    case 5:
      numString = 'five';
      break;
    case 6:
      numString = 'six';
      break;
  }
  diceImg.classList.remove(
    'fa-dice-one',
    'fa-dice-two',
    'fa-dice-three',
    'fa-dice-four',
    'fa-dice-five',
    'fa-dice-six'
  );
  diceImg.classList.add(`fa-dice-${numString}`);

  // disable roll dice button
  if (winner) {
    rollDiceBtn.classList.add('btn-disabled');
  } else {
    rollDiceBtn.classList.remove('btn-disabled');
  }

  // disable hold button
  if (diceNumber <= 1) {
    holdBtn.classList.add('btn-disabled');
  } else {
    holdBtn.classList.remove('btn-disabled');
  }
};

const rollDice = async () => {
  const winner = getWinner();
  if (winner) {
    return;
  }

  updateDiceUI(true);
  diceSound.play();

  //const number = Math.floor(Math.random() * 6) + 1;

  const array = new Uint8Array(1);
  self.crypto.getRandomValues(array);
  const number = (array[0] % 6) + 1;

  diceNumber = number;

  console.log('number', diceNumber);

  await wait(400);

  updateDiceUI(false);

  if (diceNumber === 1) {
    activePlayer.resetCurrentPoints();
    switchPlayer();
  } else {
    activePlayer.addCurrentPoints(diceNumber);
  }

  updateUI();
};

const hold = () => {
  if (diceNumber <= 1) {
    return;
  }
  activePlayer.addTotalPoints(activePlayer.currentPoints);
  diceNumber = -1;
  switchPlayer();
  countingSound.play();
  setTimeout(() => countingSound.pause(), 500);
  updateUI();
};

const switchPlayer = () => {
  activePlayer = activePlayer.id === player0.id ? player1 : player0;
};

const togglePlayerTitle = (e) => {
  if (e.target.classList.contains('player-title')) {
    e.target.classList.add('hidden');

    const inputFld = e.target.nextElementSibling;
    inputFld.classList.remove('hidden');
    inputFld.focus();
  } else if (e.target.classList.contains('player-title-input')) {
    e.target.classList.add('hidden');
    e.target.previousElementSibling.classList.remove('hidden');

    const playerId = e.target.parentElement.dataset.playerId;
    const player = player0.id === playerId ? player0 : player1;
    player.setName(e.target.value);

    updateUI();
  }
};

const bindEvents = () => {
  rollDiceBtn.addEventListener('click', rollDice);
  holdBtn.addEventListener('click', hold);
  newGameBtn.addEventListener('click', initGame);
  board.addEventListener('click', togglePlayerTitle);
  inputs.forEach((input) => input.addEventListener('blur', togglePlayerTitle));
};

bindEvents();
initGame();
