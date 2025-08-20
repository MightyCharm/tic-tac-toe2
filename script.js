// 2.
// - You’re going to store the gameboard as an array inside of a Gameboard object
// - Your players are also going to be stored in objects
// - object to control the flow of the game itself
// 2.1
// - have as little global code as possible
// - tucking as much as you can inside factories
// - if only single instance of something is need, like gameboard, displayControlle...)
//   wrap factory inside IIFE (module pattern)
// 2.2
// - think carefully about where each bit of logic should reside.
// - each little piece of functionality should be able to fit in
//   the game, player or gameboard objects. 
// - take care to put them in “logical” places.
// 2.3 building a house from the inside out
// 3.
// - getting a working game in the console first
// - make sure to include logic that checks when the game is over
// - avoid thinking about DOM and your HTML/CSS until game is working
// - make sure the game is running smoothly


// 4. one you have a working game -> create object that will handle display/DOM logic....

const gameboard = (function() {
    // min: 0/0 max 2/2
    const board = 
    [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];

    const getBoard = () => {
        // returns a copy of board, so nothing can be changed
        return board.slice();
    }

    const setCell = ((row, column, playerSign) => {
        if(row === undefined ||  column === undefined || playerSign === undefined) {
            console.log("missing-input");
            return;
        }
        if( (row < 0 || row > 2) || (column < 0 || column > 2)) {
            console.log("invalid-coords");
            return;
        }
        if(board[row][column] === "") {
            board[row][column] = playerSign;
            console.log("success");
            return;
        }
        console.log("cell-taken"); 
    })

    return { getBoard, setCell };
})();

function createPlayer(name, sign) {
    
    return { name, sign};
}

const player1 = createPlayer("Player1", "X");
const player2 = createPlayer("Player2", "O");
console.log(player1);
console.log(player2);


gameboard.setCell(1, 1, "X");
console.log(gameboard.getBoard());
gameboard.setCell(2, 1, "O");
console.log(gameboard.getBoard());
gameboard.setCell(1, 1, "X")

gameboard.setCell(5, 5, 'X');
gameboard.setCell();

