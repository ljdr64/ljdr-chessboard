interface Piece {
  color: 'white' | 'black';
  role: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
}

interface Empty {
  color: '';
  role: '';
}

/**
 * Creates a chess piece based on the character provided.
 * @param char - A character representing the piece type ('k', 'q', 'r', 'b', 'n', 'p') and color (uppercase for white, lowercase for black).
 * @returns A Piece object or an empty object if the character does not represent a valid piece.
 */
export const createPiece = (char: string): Piece | Empty => {
  let role: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  let color: 'white' | 'black';

  switch (char) {
    case 'k':
      role = 'king';
      color = 'black';
      break;
    case 'K':
      role = 'king';
      color = 'white';
      break;
    case 'q':
      role = 'queen';
      color = 'black';
      break;
    case 'Q':
      role = 'queen';
      color = 'white';
      break;
    case 'r':
      role = 'rook';
      color = 'black';
      break;
    case 'R':
      role = 'rook';
      color = 'white';
      break;
    case 'b':
      role = 'bishop';
      color = 'black';
      break;
    case 'B':
      role = 'bishop';
      color = 'white';
      break;
    case 'n':
      role = 'knight';
      color = 'black';
      break;
    case 'N':
      role = 'knight';
      color = 'white';
      break;
    case 'p':
      role = 'pawn';
      color = 'black';
      break;
    case 'P':
      role = 'pawn';
      color = 'white';
      break;
    default:
      return { color: '', role: '' };
  }

  return { color, role };
};
