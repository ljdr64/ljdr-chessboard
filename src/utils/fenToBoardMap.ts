import { createPiece } from './createPiece';

/**
 * Maps each square on the chessboard to its corresponding piece details based on the FEN string.
 *
 * @param fen - The FEN string representing the current state of the chessboard.
 * @returns An object mapping chess squares (e.g., 'e4') to their respective piece roles and colors.
 */
export const fenToBoardMap = (
  fen: string
): Record<string, { role: string; color: string }> => {
  const fenPieces = fen.split(' ')[0];
  const boardMap: Record<string, { role: string; color: string }> = {};
  let row = 0;
  let col = 0;
  const DIGITS = '0123456789';

  for (let i = 0; i < fenPieces.length; i++) {
    const char = fenPieces[i];

    if (char === '/') {
      row += 1;
      col = 0;
    } else if (DIGITS.includes(char)) {
      col += parseInt(char);
    } else {
      const file = String.fromCharCode('a'.charCodeAt(0) + col); // Convert column index to file ('a'-'h')
      const rank = (8 - row).toString(); // Convert row index to rank ('1'-'8')
      const square = `${file}${rank}`;
      boardMap[square] = createPiece(char);
      col += 1;
    }
  }
  return boardMap;
};
