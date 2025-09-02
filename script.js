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
  let gameOver = false;
  let lastStarter = null;

  function start(player1Name, player2Name) {
    gameboard.clear();
    displayController.clearBoard();
    player1 = createPlayer(player1Name, "X");
    player2 = createPlayer(player2Name, "O");
    currentPlayer = player1;
    lastStarter = player1;
  }

  function getCurrentPlayer() {
    return currentPlayer;
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  }

  function newRound() {
    gameboard.clear();
    currentPlayer = lastStarter === player1 ? player2 : player1; // new
    lastStarter = currentPlayer; // new
    gameOver = false;
  }

  function getWinner() {
    const status = { continue: true, winner: null };
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
        status.continue = false;
        status.winner = cellA;
        gameOver = true;
        return status;
      }
    }
    const full = board.every((row) => row.every((cell) => cell != ""));
    if (full) {
      status.continue = false;
      status.winner = "draw";
      gameOver = true;
    }
    return status;
  }

  function end(status) {
    gameboard.displayBoard();
    if (status.winner != "draw") {
      displayController.showStatus(`Winner is: ${status.winner === "X" ? player1.name : player2.name} "${status.winner}"`);
      return;
    }
    displayController.showStatus("No space left on the board. DRAW!");
  }

  function isGameOver() {
    return gameOver;
  }
  return { start, getCurrentPlayer, switchPlayer, newRound, getWinner, end };
})();

const displayController = (function () {
  const board = document.querySelector("#board");
  const cells = document.querySelectorAll(".cell");
  const inputPlayer1 = document.querySelector("#inputPlayer1");
  const btnPlayer1 = document.querySelector("#btnPlayer1");
  const inputPlayer2 = document.querySelector("#inputPlayer2");
  const btnPlayer2 = document.querySelector("#btnPlayer2");
  const gameInfo = document.querySelector(".divGameInfo");
  const btnStartGame = document.querySelector("#btnStartGame");
  const btnNextRound = document.querySelector("#btnNextRound");

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
      game.start(name1, name2);
      showStatus(`${game.getCurrentPlayer().name}'s turn`);
      btnStartGame.classList.add("hidden");
    } else {
      showStatus("Please enter both names to start the game.");
    }
  });

  btnNextRound.addEventListener("click", () => {
    game.newRound();
    clearBoard();
    showStatus(`${game.getCurrentPlayer().name}'s turn`);
    btnNextRound.classList.add("hidden");
  })

  function checkInput(e) {
    const targetId = e.target.id;
    let valid = false;
    if (targetId === "btnPlayer1") {
      const value = inputPlayer1.value.trim();
      if (value) {
        if (setPlayer1Name(value)) {
          inputPlayer1.disabled = true;
          btnPlayer1.disabled = true;
          valid = true;
        }
      }
    }
    if (targetId === "btnPlayer2") {
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

    const row = cell.dataset.row;
    const col = cell.dataset.col;

    const player = game.getCurrentPlayer();
    if(!player) return
    const success = gameboard.setCell(row, col, player);
    if (success) {
      cell.textContent = player.sign;
      game.switchPlayer();
      const status = game.getWinner();
      if (!status.continue) {
        game.end(status);
        btnNextRound.classList.remove("hidden")
      }
      else {
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
    if(value) {
      player1Name = value;
      return true;
    }
    return false; 
  }

  function setPlayer2Name(input) {
    const value = input.trim();
    if(value) {
      player2Name = value;
      return true;
    }
    return false;
  }

  function showStatus(message) {
    gameInfo.textContent = message;
  }
  return { clearBoard, showStatus };
})();