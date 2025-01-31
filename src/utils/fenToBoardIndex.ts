/**
 * Maps each square on the chessboard to its corresponding index in the FEN string.
 *
 * @param fen - The FEN string representing the current state of the chessboard.
 * @returns An object mapping chess squares (e.g., 'e4') to their respective indices in the FEN string.
 */
export const fenToBoardIndex = (fen: string): Record<string, number> => {
  const fenPieces = fen.split(' ')[0];
  const boardIndex: Record<string, number> = {};
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
      boardIndex[square] = i;
      col += 1;
    }
  }
  return boardIndex;
};
