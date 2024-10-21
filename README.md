# Chess Game CLI (Node.js)

This is a simple command-line interface (CLI) chess game for two players, implemented in Node.js.

## Prerequisites

- Node.js (version 12 or higher recommended)

## Installation

1. Clone this repository or download the `chess_game.js` file.

2. No additional libraries are required, as the game uses only Node.js built-in modules.

## Running the Game

1. Open a terminal or command prompt.

2. Navigate to the directory containing the `chess_game.js` file.

3. Run the following command:

   ```
   node chess_game.js
   ```

## How to Play

1. The game starts with Player 1 (White) and alternates between players.

2. On your turn, you can:
   - Enter 'display' to show the current board state
   - Enter 'quit' to forfeit the game
   - Enter 'move' to make a move

3. When making a move:
   - Enter the move in the format 'A2 B4', where A2 is the starting square and B4 is the destination square.
   - The game will check if the move is valid. If not, you'll be prompted to try again.

4. The game continues until one player wins by capturing the opponent's king or a player quits.

## Notes

- The board is displayed with Unicode chess pieces. Make sure your terminal supports Unicode characters for the best experience.
- White pieces are represented by uppercase letters (RNBQKP) and black pieces by lowercase letters (rnbqkp).
- The game implements basic movement rules for each piece but does not include advanced rules like castling, en passant, or pawn promotion.

Enjoy your game of chess!