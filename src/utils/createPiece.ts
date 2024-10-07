interface Piece {
  color: 'white' | 'black';
  role: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
}

interface EmptyPiece {
  color: '';
  role: '';
}

/**
 * Creates a chess piece based on the character provided.
 * @param pieceChar - A character representing the piece type ('k', 'q', 'r', 'b', 'n', 'p') and color (uppercase for white, lowercase for black).
 * @returns A Piece object if the character represents a valid piece, otherwise an EmptyPiece object.
 */
export const createPiece = (pieceChar: string): Piece | EmptyPiece => {
  const pieceNames: Record<
    string,
    'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'
  > = {
    p: 'pawn',
    r: 'rook',
    n: 'knight',
    b: 'bishop',
    q: 'queen',
    k: 'king',
  };

  const color = pieceChar === pieceChar.toUpperCase() ? 'white' : 'black';
  const piece = pieceNames[pieceChar.toLowerCase()];

  if (!piece) {
    return { color: '', role: '' };
  }

  return { color, role: piece };
};
