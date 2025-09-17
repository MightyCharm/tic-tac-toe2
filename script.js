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

  function setCell(row, column, sign) {
    if (board[row][column] === "") {
      board[row][column] = sign;
      return true;
    }
    return false;
  }

  function clear() {
    board.forEach((row) => {
      row.fill("");
    });
  }
  return { getBoard, setCell, clear };
})();

function createPlayer(name, sign) {
  return { name, sign };
}

const game = (function () {
  let player1, player2, currentPlayer;
  let isRoundOver = false;
  let lastStarter = null;
  let round = 1;
  const score = { player1: 0, player2: 0, draw: 0 };
  let winningCondition = null;
  let loserOfGame = null;

  function start(player1Name, player2Name, win) {
    gameboard.clear();
    displayController.clearBoardCells();
    player1 = createPlayer(player1Name, "X");
    player2 = createPlayer(player2Name, "O");
    currentPlayer = player1;
    lastStarter = player1;
    setWinningCondition(win);
  }

  function getPlayers() {
    return [player1, player2];
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
    resetRoundOver();
    currentPlayer = lastStarter === player1 ? player2 : player1;
    lastStarter = currentPlayer;
  }

  function getRoundResult() {
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
    for (let i = 0; i < pattern.length; i++) {
      const [a, b, c] = pattern[i];
      const cellA = board[a[0]][a[1]];
      const cellB = board[b[0]][b[1]];
      const cellC = board[c[0]][c[1]];
      if (cellA != "" && cellA === cellB && cellB === cellC) {
        return { winner: cellA, pattern: [a, b, c] };
      }
    }
    const full = board.every((row) => row.every((cell) => cell != ""));
    if (full) return "draw";

    return null;
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
    round = 1;
  }

  function incrementRound() {
    round++;
  }

  function getRound() {
    return round;
  }

  function updateScore(winner) {
    if (winner === "X") {
      score.player1++;
    } else if (winner === "O") {
      score.player2++;
    } else {
      score.draw++;
    }
  }

  function getMatchScore() {
    return { ...score };
  }

  function resetPlayers() {
    player1 = null;
    player2 = null;
    currentPlayer = null;
  }

  function resetScore() {
    score.player1 = 0;
    score.player2 = 0;
    score.draw = 0;
  }

  function resetLastStarter() {
    lastStarter = null;
  }

  function rematchGame() {
    console.log("rematchGame");
    resetScore();
    resetRounds();
    resetRoundOver();
    gameboard.clear();
    currentPlayer = loserOfGame;
    loserOfGame = null;
  }

  function resetGame() {
    resetPlayers();
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

  function matchWon(winner) {
    const winCondition = getWinningCondition();
    const scores = getMatchScore();
    console.log(winner);
    const playerScore = winner === player1.sign ? scores.player1 : scores.player2;
    return playerScore === winCondition;
  }

  function tryMove(r, c) {
    const row = r;
    const col = c;
    const result = {
      currentPlayer: getCurrentPlayer(),
      nextPlayer: null,
      validMove: false,
      winnerRound: null,
      winnerGame: false,
    };
    if (result.currentPlayer) {
      const isSet = gameboard.setCell(row, col, result.currentPlayer.sign);
      result.validMove = isSet;
      result.winnerRound = getRoundResult();
    }
    return result;
  }

  function play(row, col) {
    const result = tryMove(row, col);
    if (result.validMove) {
      if (result.winnerRound === null) {
        switchPlayer();
        result.nextPlayer = currentPlayer;
      } else if (result.winnerRound === "draw") {
        updateScore(result.winnerRound);
        game.setRoundOver();
      } else {
        updateScore(result.winnerRound.winner);
        result.winnerGame = matchWon(result.winnerRound.winner);
        if(result.winnerGame) {
          loserOfGame = result.winnerRound.winner === player1.sign ? player2 : player1;
        }
        game.setRoundOver();
      }
    }
    return result;
  }

  return {
    start,
    getPlayers,
    getCurrentPlayer,
    switchPlayer,
    newRound,
    getRoundResult,
    hasRoundEnded,
    setRoundOver,
    getRound,
    updateScore,
    getMatchScore,
    rematchGame,
    resetGame,
    getWinningCondition,
    matchWon,
    tryMove,
    play,
  };
})();

const displayController = (function () {
  const board = document.querySelector("#board");
  const cells = document.querySelectorAll(".cell");
  const inputPlayer1 = document.querySelector("#player-input-1");
  const inputPlayer2 = document.querySelector("#player-input-2");
  const gameInfo = document.querySelector(".game-info");
  const btnNewGame = document.querySelector("#btn-new-game");
  const btnNextRound = document.querySelector("#btn-next-round");
  const btnRematch = document.querySelector("#btn-rematch");
  const scorePlayer1 = document.querySelector("#score-player-1");
  const scoreDraw = document.querySelector("#score-draw");
  const scorePlayer2 = document.querySelector("#score-player-2");
  const rounds = document.querySelector("#rounds");
  const scoreWin = document.querySelector("#score-win");
  const headerPlayer1 = document.querySelector("#player-1-header");
  const headerPlayer2 = document.querySelector("#player-2-header");
  const body = document.querySelector("body");
  const playerForm1 = document.querySelector("#player-form-1");
  const playerForm2 = document.querySelector("#player-form-2");

  let isCooldown = false;
  const sounds = {
    button: new Audio("sound/button-click.wav"),
    cell: new Audio("sound/cell-click.wav"),
    invalidCellClick: new Audio("sound/cell-click-invalid.wav"),
    win: new Audio("sound/win.wav"),
    draw: new Audio("sound/draw.wav"),
  };

  board.addEventListener("click", (e) => {
    handleCellClick(e);
  });

  btnNewGame.addEventListener("click", () => {
    playSound(sounds.button);
    if (game.getCurrentPlayer()) {
      game.resetGame();
      resetUIForNewGame();
    }
    const name1 = inputPlayer1.value.trim();
    const name2 = inputPlayer2.value.trim();
    if (name1 != "" && name2 != "") {
      const conditionToWin = parseInt(scoreWin.value) || 3;
      game.start(name1, name2, conditionToWin);
      displayRound(game.getRound());
      displayMessage(`${game.getCurrentPlayer().name}'s turn`);
      btnNewGame.classList.add("hidden");
      disableInputs();
      const result = { nextPlayer: game.getCurrentPlayer() };
      highlightPlayer(result);
    } else {
      displayMessage("Please enter both names to start the game.");
    }
  });

  btnNextRound.addEventListener("click", () => {
    playSound(sounds.button);
    removeHighlightWinningCells();
    game.newRound();
    clearBoardCells();
    displayRound(game.getRound());
    displayMessage(`${game.getCurrentPlayer().name}'s turn`);
    btnNextRound.classList.add("hidden");
    const result = { nextPlayer: game.getCurrentPlayer() };
    highlightPlayer(result);
  });

  btnRematch.addEventListener("click", () => {
    playSound(sounds.button);
    game.rematchGame();
    resetUIForRematch();
    const result = { nextPlayer: game.getCurrentPlayer() };
    highlightPlayer(result);
  });

  board.addEventListener("mouseover", (e) => {
    previewSign(e);
  });

  board.addEventListener("mouseout", (e) => {
    resetPreview(e);
  });

  function highlightPlayer(result) {
    if (result.nextPlayer) {
      if (result.nextPlayer.sign === game.getPlayers()[0].sign) {
        body.classList.add("active-border-left");
        body.classList.remove("active-border-right");
        headerPlayer1.classList.add("active");
        headerPlayer2.classList.remove("active");
        playerForm1.classList.add("active");
        playerForm2.classList.remove("active");
      } else {
        body.classList.remove("active-border-left");
        body.classList.add("active-border-right");
        headerPlayer1.classList.remove("active");
        headerPlayer2.classList.add("active");
        playerForm1.classList.remove("active");
        playerForm2.classList.add("active");
      }
    }
  }

  function clearHighlightPlayer() {
    body.classList.remove("active-border-left", "active-border-right");
    headerPlayer1.classList.remove("active");
    headerPlayer2.classList.remove("active");
    playerForm1.classList.remove("active");
    playerForm2.classList.remove("active");
  }

  function handleCellClick(e) {
    const cell = e.target;
    if (!cell.classList.contains("cell")) return;

    if (isCooldown) {
      playSound(sounds.invalidCellClick);
      return;
    }
    isCooldown = true;
    setTimeout(() => {
      isCooldown = false;
    }, 300);

    if (game.hasRoundEnded()) {
      playSound(sounds.invalidCellClick);
      cell.classList.add("animation-shake");
      setTimeout(() => cell.classList.remove("animation-shake"), 300);
      return;
    }
    if (!game.getCurrentPlayer()) {
      playSound(sounds.invalidCellClick);
      cell.classList.add("animation-shake");
      setTimeout(() => cell.classList.remove("animation-shake"), 300);
      return;
    }

    const row = cell.dataset.row;
    const col = cell.dataset.col;
    const result = game.play(row, col);
    highlightPlayer(result);

    playSound(sounds.cell);

    if (result.validMove) {
      removePreviewTag(cell);
      cell.textContent = result.currentPlayer.sign;
      if (result.winnerRound === null) {
        displayMessage(`${game.getCurrentPlayer().name}'s turn`);
      } else if (result.winnerRound === "draw") {
        playSound(sounds.draw);
        displayScore();
        btnNextRound.classList.remove("hidden");
        displayMessage(formatResultMessage(result.winnerRound));
      } else {
        playSound(sounds.win);
        displayScore();
        displayMessage(formatResultMessage(result.winnerRound.winner));
        highlightWinningCells(result.winnerRound.pattern);
        if (!result.winnerGame) {
          btnNextRound.classList.remove("hidden");
        } else {
          displayGameOver(result.winnerRound.winner);
          btnNewGame.classList.remove("hidden");
          btnRematch.classList.remove("hidden");
        }
      }
    } else {
      playSound(sounds.invalidCellClick);
      cell.classList.add("animation-shake");
      setTimeout(() => cell.classList.remove("animation-shake"), 300);
    }
  }

  function previewSign(e) {
    const cell = e.target;
    if (!cell.classList.contains("cell")) return;
    if (game.hasRoundEnded()) return;
    const player = game.getCurrentPlayer();
    if (!player) return;

    if (cell.textContent != "") return;
    cell.classList.add("preview");
    cell.textContent = player.sign;
  }

  function resetPreview(e) {
    const cell = e.target;
    if (!cell.classList.contains("cell")) return;
    if (game.hasRoundEnded()) return;
    if (cell.classList.contains("preview")) {
      cell.classList.remove("preview");
      cell.textContent = "";
    }
  }

  function removePreviewTag(cell) {
    if (cell.classList.contains("preview")) {
      cell.classList.remove("preview");
    }
  }

  function clearBoardCells() {
    cells.forEach((cell) => {
      cell.textContent = "";
    });
  }

  function displayMessage(message) {
    gameInfo.textContent = message;
  }

  function displayRound(round) {
    rounds.textContent = round;
  }

  function displayScore() {
    const score = game.getMatchScore();
    scorePlayer1.textContent = score.player1;
    scoreDraw.textContent = score.draw;
    scorePlayer2.textContent = score.player2;
  }

  function formatResultMessage(winner) {
    if (winner === "draw") {
      return "No space left on the board. DRAW!";
    }
    return `Winner is: ${
      winner === "X" ? game.getPlayers()[0].name : game.getPlayers()[1].name
    } "${winner}"`;
  }

  function displayGameOver(winner) {
    const resultMessage = formatResultMessage(winner);
    displayMessage(`Game over!" ${resultMessage}`);
  }

  function resetUIForRematch() {
    removeHighlightWinningCells();
    clearBoardCells();
    displayScore();
    displayRound(game.getRound());
    displayMessage("New Match started!");
    btnRematch.classList.add("hidden");
    btnNewGame.classList.add("hidden");
  }

  function resetUIForNewGame() {
    console.log("resetUIForNewGame");
    removeHighlightWinningCells();
    clearBoardCells();
    displayScore();
    displayRound(game.getRound());
    resetPlayerInputs();
    enableInputs();
    clearHighlightPlayer();
    displayMessage("Please enter both names to start the game.");
    btnRematch.classList.add("hidden");
  }

  function resetPlayerInputs() {
    inputPlayer1.value = "";
    inputPlayer2.value = "";
  }

  function enableInputs() {
    inputPlayer1.disabled = false;
    inputPlayer2.disabled = false;
  }

  function disableInputs() {
    inputPlayer1.disabled = true;
    inputPlayer2.disabled = true;
  }

  function highlightWinningCells(pattern) {
    cells.forEach((cell) => {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      for (let i = 0; i < pattern.length; i++) {
        if (row === pattern[i][0] && col === pattern[i][1]) {
          cell.classList.add("highlight");
        }
      }
    });
  }

  function removeHighlightWinningCells() {
    cells.forEach((cell) => {
      cell.classList.remove("highlight");
    });
  }

  function playSound(sound) {
    sound.currentTime = 0;
    sound.volume = 0.5;
    sound.play();
  }

  return {
    clearBoardCells,
    displayMessage,
    displayRound,
    displayScore,
  };
})();
