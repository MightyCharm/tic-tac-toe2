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
  return { getBoard, displayBoard, setCell };
})();

function createPlayer(name, sign) {
  return { name, sign };
}

const game = (function () {
  const player1 = createPlayer("Sebastian", "X");
  const player2 = createPlayer("Otto", "O");
  let currentPlayer = player1;

  function play() {
    const rowInput = prompt("Which row do you want to place your sign (0-2)?");
    const columnInput = prompt(
      "Which column do you want to place your sign (0-2)?"
    );
    if (rowInput === "q" || columnInput === "q") {
      return "quit";
    }
    const row = Number(rowInput);
    const column = Number(columnInput);
    const isValid = isValidInput(row, column);
    let isSet;
    if (isValid) {
      isSet = gameboard.setCell(row, column, currentPlayer);
    }
    if (!isSet) {
      return "input-not-set";
    }
    currentPlayer = currentPlayer === player1 ? player2 : player1;
    return "input-set";
  }

  function isValidInput(rowInput, columnInput) {
    const row = Number(rowInput);
    const column = Number(columnInput);
    if (isNaN(row)) {
      return false;
    }
    if (isNaN(column)) {
      return false;
    }
    if (row > 2 || row < 0) return false;
    if (column > 2 || column < 0) return false;
    return true;
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
      ] // cross2
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
        return status;
      }
    }
    const full = board.every(row => row.every(cell => cell != ""));
    if(full) {
      status.continue = false;
      status.winner = "draw";
    }
    return status;
  }

  function end(status) {
    gameboard.displayBoard();
    if (status.winner != "draw") {
      alert(`Winner is: ${status.winner === "X" ? player1.name : player2.name}`);
      return;
    }
    alert("No space left on the board. DRAW!");
  }
  return { play, getWinner, end };
})();

// game loop instead of recursion, only needed for first step, get game running in console
alert("Tic Tac Toe. Game starts, have fun!");
while (true) {
  // play round
  gameboard.displayBoard();
  const action = game.play();
  if (action === "quit") {
    break;
  }
  if (action === "input-set") {
    const status = game.getWinner(); // returns  const status = {continue: true, winner: ""}
    if (!status.continue) {
      game.end(status);
      break;
    }
  }
}
alert("Game Over.\nHave a nice day, bye!");