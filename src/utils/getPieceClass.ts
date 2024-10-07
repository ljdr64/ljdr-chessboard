/**
 * Gets the CSS classes corresponding to a chess piece.
 *
 * @param {string} pieceChar - Character representing the chess piece.
 *                              Can be 'p', 'r', 'n', 'b', 'q', 'k' for
 *                              pawn, rook, knight, bishop, queen, and king
 *                              respectively. Uppercase letters indicate
 *                              white pieces, while lowercase letters
 *                              indicate black pieces.
 * @returns {string} - A string that represents the CSS classes
 *                     for the color and name of the piece, for example:
 *                     "white pawn" or "black rook".
 */
export const getPieceClass = (pieceChar: string): string => {
  const pieceNames: Record<string, string> = {
    p: 'pawn',
    r: 'rook',
    n: 'knight',
    b: 'bishop',
    q: 'queen',
    k: 'king',
  };

  const color = pieceChar === pieceChar.toUpperCase() ? 'white' : 'black';
  const piece = pieceNames[pieceChar.toLowerCase()];
  return `${color} ${piece}`;
};
