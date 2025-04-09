class ChessGame {
    constructor() {
        this.board = [];
        this.selectedPiece = null;
        this.currentTurn = 'white';
        this.initializeBoard();
        this.createBoard();
        this.placePieces();
    }

    initializeBoard() {
        for (let i = 0; i < 8; i++) {
            this.board[i] = new Array(8).fill(null);
        }
    }

    createBoard() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                chessboard.appendChild(square);
            }
        }
    }

    placePieces() {
        // Place pawns
        for (let col = 0; col < 8; col++) {
            this.board[1][col] = { type: 'pawn', color: 'black' };
            this.board[6][col] = { type: 'pawn', color: 'white' };
        }

        // Place rooks
        this.board[0][0] = { type: 'rook', color: 'black' };
        this.board[0][7] = { type: 'rook', color: 'black' };
        this.board[7][0] = { type: 'rook', color: 'white' };
        this.board[7][7] = { type: 'rook', color: 'white' };

        // Place knights
        this.board[0][1] = { type: 'knight', color: 'black' };
        this.board[0][6] = { type: 'knight', color: 'black' };
        this.board[7][1] = { type: 'knight', color: 'white' };
        this.board[7][6] = { type: 'knight', color: 'white' };

        // Place bishops
        this.board[0][2] = { type: 'bishop', color: 'black' };
        this.board[0][5] = { type: 'bishop', color: 'black' };
        this.board[7][2] = { type: 'bishop', color: 'white' };
        this.board[7][5] = { type: 'bishop', color: 'white' };

        // Place queens
        this.board[0][3] = { type: 'queen', color: 'black' };
        this.board[7][3] = { type: 'queen', color: 'white' };

        // Place kings
        this.board[0][4] = { type: 'king', color: 'black' };
        this.board[7][4] = { type: 'king', color: 'white' };

        this.updateBoardDisplay();
    }

    getPieceSymbol(piece) {
        if (!piece) return '';
        const symbols = {
            king: { white: '♔', black: '♚' },
            queen: { white: '♕', black: '♛' },
            rook: { white: '♖', black: '♜' },
            bishop: { white: '♗', black: '♝' },
            knight: { white: '♘', black: '♞' },
            pawn: { white: '♙', black: '♟' }
        };
        return symbols[piece.type][piece.color];
    }

    updateBoardDisplay() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.board[row][col];
            square.textContent = this.getPieceSymbol(piece);
        });
    }

    handleSquareClick(row, col) {
        const piece = this.board[row][col];
        
        if (this.selectedPiece) {
            if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.selectedPiece = null;
                this.clearHighlights();
                this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
                document.getElementById('current-turn').textContent = this.currentTurn.charAt(0).toUpperCase() + this.currentTurn.slice(1);
            } else {
                this.selectedPiece = null;
                this.clearHighlights();
            }
        } else if (piece && piece.color === this.currentTurn) {
            this.selectedPiece = { row, col, ...piece };
            this.highlightValidMoves(row, col);
        }
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;

        if (this.board[toRow][toCol] && this.board[toRow][toCol].color === piece.color) {
            return false;
        }

        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        switch (piece.type) {
            case 'pawn':
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
            case 'rook':
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case 'knight':
                return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
            case 'bishop':
                return rowDiff === colDiff && this.isPathClear(fromRow, fromCol, toRow, toCol);
            case 'queen':
                return (rowDiff === colDiff || fromRow === toRow || fromCol === toCol) && 
                       this.isPathClear(fromRow, fromCol, toRow, toCol);
            case 'king':
                return rowDiff <= 1 && colDiff <= 1;
            default:
                return false;
        }
    }

    isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);

        if (colDiff === 0) {
            if (rowDiff === direction && !this.board[toRow][toCol]) {
                return true;
            }
            if (fromRow === startRow && rowDiff === 2 * direction && 
                !this.board[toRow][toCol] && !this.board[fromRow + direction][fromCol]) {
                return true;
            }
        } else if (colDiff === 1 && rowDiff === direction && 
                   this.board[toRow][toCol] && this.board[toRow][toCol].color !== color) {
            return true;
        }

        return false;
    }

    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        return (fromRow === toRow || fromCol === toCol) && 
               this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
        const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
        
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol]) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        this.updateBoardDisplay();
    }

    highlightValidMoves(row, col) {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const toRow = parseInt(square.dataset.row);
            const toCol = parseInt(square.dataset.col);
            if (this.isValidMove(row, col, toRow, toCol)) {
                square.classList.add('valid-move');
            }
        });
    }

    clearHighlights() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('valid-move');
        });
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new ChessGame();
}); 