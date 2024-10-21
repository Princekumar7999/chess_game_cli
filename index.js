import readlineSync from 'readline-sync';
import chalk from 'chalk';

class ChessPiece {
  constructor(type, color) {
    this.type = type;
    this.color = color;
  }

  toString() {
    const pieceSymbols = {
      'K': '♔',
      'Q': '♕',
      'R': '♖',
      'B': '♗',
      'N': '♘',
      'P': '♙'
    };

    const symbol = pieceSymbols[this.type];
    return this.color === 'white' ? chalk.white(symbol) : chalk.gray(symbol);
  }
}

class ChessBoard {
  constructor() {
    this.board = Array(8).fill().map(() => Array(8).fill(null));
    this.initializeBoard();
  }

  initializeBoard() {
    // Set up pawns
    for (let i = 0; i < 8; i++) {
      this.board[1][i] = new ChessPiece('P', 'white');
      this.board[6][i] = new ChessPiece('P', 'black');
    }

    // Set up other pieces
    const pieceOrder = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    for (let i = 0; i < 8; i++) {
      this.board[0][i] = new ChessPiece(pieceOrder[i], 'white');
      this.board[7][i] = new ChessPiece(pieceOrder[i], 'black');
    }
  }

  display() {
    console.log('   A  B  C  D  E  F  G  H');
    for (let i = 7; i >= 0; i--) {
      let row = `${i + 1} `;
      for (let j = 0; j < 8; j++) {
        const piece = this.board[i][j];
        const isBlackSquare = (i + j) % 2 === 1;
        const background = isBlackSquare ? chalk.bgGray : chalk.bgWhite;
        row += background(piece ? ` ${piece.toString()} ` : '   ');
      }
      console.log(row + ` ${i + 1}`);
    }
    console.log('   A  B  C  D  E  F  G  H');
  }

  isValidMove(from, to, currentPlayer) {
    if (!this.isValidSquare(from) || !this.isValidSquare(to)) {
      return false;
    }

    const [fromRow, fromCol] = this.squareToCoordinates(from);
    const piece = this.board[fromRow][fromCol];

    if (!piece || piece.color !== currentPlayer) {
      return false;
    }

    // Check if there are any captures available
    const captures = this.getAvailableCaptures(currentPlayer);
    if (captures.length > 0) {
      return captures.some(capture => 
        capture.from === from && capture.to === to
      );
    }

    return this.isValidPieceMove(from, to, piece);
  }

  isValidPieceMove(from, to, piece) {
    const [fromRow, fromCol] = this.squareToCoordinates(from);
    const [toRow, toCol] = this.squareToCoordinates(to);

    switch (piece.type) {
      case 'P':
        return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
      case 'R':
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
      case 'N':
        return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
      case 'B':
        return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
      case 'Q':
        return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
      case 'K':
        return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
      default:
        return false;
    }
  }

  isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
    const direction = color === 'white' ? 1 : -1;
    const startRow = color === 'white' ? 1 : 6;

    // Basic one square forward move
    if (fromCol === toCol && toRow === fromRow + direction && !this.board[toRow][toCol]) {
      return true;
    }

    // Initial two square move
    if (fromRow === startRow && fromCol === toCol && 
        toRow === fromRow + 2 * direction && 
        !this.board[fromRow + direction][toCol] && 
        !this.board[toRow][toCol]) {
      return true;
    }

    // Capture moves
    if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction) {
      return this.board[toRow][toCol] !== null;
    }

    return false;
  }

  isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    return this.isPathClear(fromRow, fromCol, toRow, toCol);
  }

  isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
    return this.isPathClear(fromRow, fromCol, toRow, toCol);
  }

  isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return this.isValidRookMove(fromRow, fromCol, toRow, toCol) ||
           this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
  }

  isValidKingMove(fromRow, fromCol, toRow, toCol) {
    return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
  }

  isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowDirection = fromRow === toRow ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
    const colDirection = fromCol === toCol ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);

    let currentRow = fromRow + rowDirection;
    let currentCol = fromCol + colDirection;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.board[currentRow][currentCol]) return false;
      currentRow += rowDirection;
      currentCol += colDirection;
    }

    return true;
  }

  getAvailableCaptures(currentPlayer) {
    const captures = [];

    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = this.board[fromRow][fromCol];
        if (piece && piece.color === currentPlayer) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              const targetPiece = this.board[toRow][toCol];
              if (targetPiece && targetPiece.color !== currentPlayer) {
                const from = this.coordinatesToSquare(fromRow, fromCol);
                const to = this.coordinatesToSquare(toRow, toCol);
                if (this.isValidPieceMove(from, to, piece)) {
                  captures.push({ from, to });
                }
              }
            }
          }
        }
      }
    }

    return captures;
  }

  makeMove(from, to) {
    const [fromRow, fromCol] = this.squareToCoordinates(from);
    const [toRow, toCol] = this.squareToCoordinates(to);

    this.board[toRow][toCol] = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = null;
  }

  squareToCoordinates(square) {
    const col = square.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
    const row = parseInt(square[1]) - 1;
    return [row, col];
  }

  coordinatesToSquare(row, col) {
    const colLetter = String.fromCharCode('a'.charCodeAt(0) + col);
    return `${colLetter}${row + 1}`;
  }

  isValidSquare(square) {
    if (square.length !== 2) return false;
    const col = square[0].toLowerCase();
    const row = square[1];
    return col >= 'a' && col <= 'h' && row >= '1' && row <= '8';
  }

  countPieces(color) {
    let count = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col]?.color === color) {
          count++;
        }
      }
    }
    return count;
  }
}

class AntiChessGame {
  constructor() {
    this.board = new ChessBoard();
    this.currentPlayer = 'white';
  }

  play() {
    console.log('\nWelcome to Anti-Chess!');
    console.log('Commands:');
    console.log('- Enter move in format "a2 a4"');
    console.log('- Type "display" to show the board');
    console.log('- Type "quit" to forfeit the game\n');

    while (true) {
      this.board.display();
      console.log(`\n${this.currentPlayer}'s turn`);

      const input = readlineSync.question('Enter your move: ').toLowerCase();

      if (input === 'quit') {
        console.log(`${this.currentPlayer} forfeits. ${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`);
        break;
      }

      if (input === 'display') {
        continue;
      }

      const [from, to] = input.split(' ');
      if (!from || !to) {
        console.log('Invalid input format. Use format "a2 a4"');
        continue;
      }

      if (!this.board.isValidMove(from, to, this.currentPlayer)) {
        const captures = this.board.getAvailableCaptures(this.currentPlayer);
        if (captures.length > 0) {
          console.log('Capture is mandatory! Available captures:');
          captures.forEach(capture => {
            console.log(`${capture.from} ${capture.to}`);
          });
        } else {
          console.log('Invalid move. Try again.');
        }
        continue;
      }

      this.board.makeMove(from, to);

      const whitePieces = this.board.countPieces('white');
      const blackPieces = this.board.countPieces('black');

      if (whitePieces === 0) {
        console.log('White wins by losing all pieces!');
        break;
      }
      if (blackPieces === 0) {
        console.log('Black wins by losing all pieces!');
        break;
      }

      this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    }
  }
}

// Start the game
new AntiChessGame().play();
