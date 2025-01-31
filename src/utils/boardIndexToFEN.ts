/**
 * Generates a FEN string from a given board representation.
 *
 * @param boardMap - An object mapping squares (e.g., 'e4') to piece characters (e.g., 'P', 'n').
 * @returns The generated FEN string representing the chessboard state.
 */
export const boardIndexToFEN = (boardMap: Record<string, string>): string => {
  let fen = '';
  for (let row = 8; row >= 1; row--) {
    let emptyCount = 0;
    for (let col = 0; col < 8; col++) {
      const file = String.fromCharCode('a'.charCodeAt(0) + col);
      const square = `${file}${row}`;
      const piece = boardMap[square] || '';
      if (piece) {
        if (emptyCount > 0) {
          fen += emptyCount.toString();
          emptyCount = 0;
        }
        fen += piece;
      } else {
        emptyCount++;
      }
    }
    if (emptyCount > 0) {
      fen += emptyCount.toString();
    }
    if (row > 1) {
      fen += '/';
    }
  }
  return fen;
};
