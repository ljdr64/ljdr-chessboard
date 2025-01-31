import { pieceToFEN } from './pieceToFEN';

/**
 * Converts a board map back into a FEN string representation.
 *
 * @param boardMap - An object mapping chess squares (e.g., 'e4') to their respective piece roles and colors.
 * @returns The corresponding FEN string representing the chessboard state.
 */
export const boardMapToFEN = (
  boardMap: Record<string, { role: string; color: string }>
): string => {
  let fen = '';
  for (let row = 8; row >= 1; row--) {
    let emptyCount = 0;
    for (let col = 0; col < 8; col++) {
      const file = String.fromCharCode('a'.charCodeAt(0) + col);
      const square = `${file}${row}`;
      const piece = boardMap[square];
      if (piece) {
        if (emptyCount > 0) {
          fen += emptyCount.toString();
          emptyCount = 0;
        }
        fen += pieceToFEN(piece);
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
