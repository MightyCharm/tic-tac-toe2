const gameboard = (function () {
  // min: 0/0 max 2/2
  const board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];

  function getBoard() {
    // returns a copy of board, so nothing can be changed
    return board.map((row) => row.slice());
  }

  function displayBoard() {
    const board = gameboard.getBoard();
    for (let i = 0; i < board.length; i++) {
      console.log(board[i]);
    }
  }

  function setCell(row, column, player) {
    if (board[row][column] === "") {
      board[row][column] = player.sign;
      return true;
    }
    return false;
  }

  function clear() {
    board.forEach((row) => {
      row.fill("");
    });
  }
  return { getBoard, displayBoard, setCell, clear };
})();

function createPlayer(name, sign) {
  return { name, sign };
}

const game = (function () {
  let player1, player2, currentPlayer;
  let isRoundOver = false;
  let lastStarter = null;
  let round = 0;
  const score = { player1: 0, player2: 0, draw: 0 };
  let winningCondition = null;

  function start(player1Name, player2Name, win) {
    gameboard.clear();
    displayController.clearBoard();
    player1 = createPlayer(player1Name, "X");
    player2 = createPlayer(player2Name, "O");
    currentPlayer = player1;
    lastStarter = player1;
    setWinningCondition(win);
    incrementRound();
  }

  function getCurrentPlayer() {
    return currentPlayer;
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  }

  function newRound() {
    gameboard.clear();
    incrementRound();
    currentPlayer = lastStarter === player1 ? player2 : player1;
    lastStarter = currentPlayer;
    isRoundOver = false;
  }

  function checkForWinner() {
    const board = gameboard.getBoard();
    const pattern = [
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ], // row1
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ], // row2
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ], // row3
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ], // column1
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ], // column2
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ], // column3
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ], // cross1
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ], // cross2
    ];
    // check rows
    for (let i = 0; i < pattern.length; i++) {
      const [a, b, c] = pattern[i];
      const cellA = board[a[0]][a[1]];
      const cellB = board[b[0]][b[1]];
      const cellC = board[c[0]][c[1]];
      if (cellA != "" && cellA === cellB && cellB === cellC) {
        return cellA;
      }
    }
    const full = board.every((row) => row.every((cell) => cell != ""));
    if (full) return "draw";

    return null;
  }

  function announceRoundResult(winner) {
    if (winner === "draw") {
      displayController.showStatus("No space left on the board. DRAW!");
      return;
    }

    displayController.showStatus(
      `Winner is: ${winner === "X" ? player1.name : player2.name} "${winner}"`
    );
  }

  function wonGame(winner) {
     displayController.showStatus(
      `Game Over! ${winner === "X" ? player1.name : player2.name} "${winner}" won the game`
    );
  }

  function hasRoundEnded() {
    return isRoundOver;
  }

  function setRoundOver() {
    isRoundOver = true;
  }

  function resetRoundOver() {
    isRoundOver = false;
  }

  function resetRounds() {
    round = 0;
  }

  function incrementRound() {
    round++;
  }

  function getRound() {
    return round;
  }

  function setScore(winner) {
    if (winner === "X") {
      score.player1++;
    } else if (winner === "O") {
      score.player2++;
    } else {
      score.draw++;
    }
  }

  function getScore() {
    return { ...score };
  }

  function resetScore() {
    score.player1 = 0;
    score.player2 = 0;
    score.draw = 0;
  }

  function resetLastStarter() {
    lastStarter = null;
  }

  function resetGame() {
    resetScore();
    resetRounds();
    resetRoundOver();
    resetLastStarter();
    gameboard.clear();
  }

  function setWinningCondition(win) {
    winningCondition = win;
  }

  function getWinningCondition() {
    return winningCondition;
  }

  function matchWon() {
    console.log("check if winning condition was reached, return true false");
    const winCondition = getWinningCondition();
    const scores = getScore();
    const score1 = scores.player1;
    const score2 = scores.player2;
    if(score1 === winCondition || score2 === winCondition) {
      return true;
    }
    return false;
  }

  return {
    start,
    getCurrentPlayer,
    switchPlayer,
    newRound,
    checkForWinner,
    announceRoundResult,
    hasRoundEnded,
    setRoundOver,
    getRound,
    setScore,
    getScore,
    resetGame,
    getWinningCondition,
    matchWon,
    wonGame,
  };
})();

const displayController = (function () {
  const board = document.querySelector("#board");
  const cells = document.querySelectorAll(".cell");
  const inputPlayer1 = document.querySelector("#input-player-1");
  const btnPlayer1 = document.querySelector("#btn-player-1");
  const inputPlayer2 = document.querySelector("#input-player-2");
  const btnPlayer2 = document.querySelector("#btn-player-2");
  const gameInfo = document.querySelector(".game-info");
  const btnStartGame = document.querySelector("#btn-start-game");
  const btnNextRound = document.querySelector("#btn-next-round");
  const btnResetGame = document.querySelector("#btn-restart-game");
  const scorePlayer1 = document.querySelector("#score-player-1");
  const scoreDraw = document.querySelector("#score-draw");
  const scorePlayer2 = document.querySelector("#score-player-2");
  const rounds = document.querySelector("#rounds");
  const scoreWin = document.querySelector("#score-win");

  let player1Name = null;
  let player2Name = null;

  btnPlayer1.addEventListener("click", (e) => checkInput(e));

  btnPlayer2.addEventListener("click", (e) => checkInput(e));

  board.addEventListener("click", (e) => {
    checkBoard(e);
  });

  btnStartGame.addEventListener("click", () => {
    const name1 = getPlayer1Name();
    const name2 = getPlayer2Name();
    if (name1 != null && name2 != null) {
      const conditionToWin = parseInt(scoreWin.value) || 3;
      game.start(name1, name2, conditionToWin);
      displayRound(game.getRound()); // new
      showStatus(`${game.getCurrentPlayer().name}'s turn`);
      btnStartGame.classList.add("hidden");
    } else {
      showStatus("Please enter both names to start the game.");
    }
  });

  btnNextRound.addEventListener("click", () => {
    game.newRound();
    clearBoard();
    displayRound(game.getRound()); // new
    showStatus(`${game.getCurrentPlayer().name}'s turn`);
    btnNextRound.classList.add("hidden");
    btnResetGame.classList.add("hidden");
  });

  btnResetGame.addEventListener("click", () => {
    game.resetGame();
    resetUI();
  });

  function checkInput(e) {
    const targetId = e.target.id;
    let valid = false;
    if (targetId === "btn-player-1") {
      const value = inputPlayer1.value.trim();
      if (value) {
        if (setPlayer1Name(value)) {
          inputPlayer1.disabled = true;
          btnPlayer1.disabled = true;
          valid = true;
        }
      }
    }
    if (targetId === "btn-player-2") {
      const value = inputPlayer2.value.trim();
      if (value) {
        if (setPlayer2Name(value)) {
          inputPlayer2.disabled = true;
          btnPlayer2.disabled = true;
          valid = true;
        }
      }
    }
  }

  function checkBoard(e) {
    const cell = e.target;
    if (!cell.classList.contains("cell")) return;
    if (game.hasRoundEnded()) return;

    const row = cell.dataset.row;
    const col = cell.dataset.col;

    const player = game.getCurrentPlayer();
    if (!player) return;
    const success = gameboard.setCell(row, col, player);
    if (success) {
      cell.textContent = player.sign;
      game.switchPlayer();
      const winnerRound = game.checkForWinner();
      if (winnerRound) {
        game.setRoundOver();
        game.setScore(winnerRound);
        displayScore();
        game.announceRoundResult(winnerRound);

        if (game.matchWon()) {
          game.wonGame(winnerRound);
          btnResetGame.classList.remove("hidden");
        } else {
          btnNextRound.classList.remove("hidden");
          btnResetGame.classList.remove("hidden");
        }
      } else {
        showStatus(`${game.getCurrentPlayer().name}'s turn`);
      }
    }
  }

  function clearBoard() {
    cells.forEach((cell) => {
      cell.textContent = "";
    });
  }

  function getPlayer1Name() {
    return player1Name;
  }

  function getPlayer2Name() {
    return player2Name;
  }

  function setPlayer1Name(input) {
    const value = input.trim();
    if (value) {
      player1Name = value;
      return true;
    }
    return false;
  }

  function setPlayer2Name(input) {
    const value = input.trim();
    if (value) {
      player2Name = value;
      return true;
    }
    return false;
  }

  function showStatus(message) {
    gameInfo.textContent = message;
  }

  function displayRound(round) {
    rounds.textContent = round;
  }

  function displayScore() {
    const score = game.getScore();
    scorePlayer1.textContent = score.player1;
    scoreDraw.textContent = score.draw;
    scorePlayer2.textContent = score.player2;
  }

  function resetUI() {
    clearBoard();
    displayScore();
    displayRound(game.getRound());
    resetPlayerInputs();
    resetPlayerNames();
    btnResetGame.classList.add("hidden");
    btnNextRound.classList.add("hidden");
    btnStartGame.classList.remove("hidden");
    showStatus("Please enter both names to start the game.");
  }

  function resetPlayerInputs() {
    inputPlayer1.disabled = false;
    inputPlayer2.disabled = false;
    btnPlayer1.disabled = false;
    btnPlayer2.disabled = false;

    inputPlayer1.value = "";
    inputPlayer2.value = "";
  }

  function resetPlayerNames() {
    player1Name = null;
    player2Name = null;
  }

  return { clearBoard, showStatus, displayRound, displayScore, resetUI };
})();
