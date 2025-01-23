/**
 * Finds the position of a specific piece on the chessboard based on the FEN notation,
 * taking into account the board orientation and square size.
 *
 * @param fen - The FEN string representing the current state of the chessboard.
 * @param piece - The piece to find (e.g., 'k' for black king, 'K' for white king, etc.).
 * @param orientation - The board orientation ('white' or 'black'). Determines how coordinates are calculated.
 * @param squareSize - The size of each square on the chessboard, in pixels.
 * @returns A tuple [x, y], where x and y are the pixel coordinates of the top-left corner of the square containing the piece. Returns [0, 0] if the piece is not found.
 */

export const findPieceOnFEN = (
  fen: string,
  piece: string,
  orientation: string,
  squareSize: number
): [number, number] => {
  let row = 0;
  let col = 0;
  const DIGITS = '0123456789';
  console.log(fen);

  for (let i = 0; i < fen.length; i++) {
    const char = fen[i];

    if (char === '/') {
      row += 1;
      col = 0;
    } else if (DIGITS.includes(char)) {
      col += parseInt(char);
    } else {
      let x = 0;
      let y = 0;
      if (orientation === 'white') {
        x = col * squareSize;
        y = row * squareSize;
      } else if (orientation === 'black') {
        x = (7 - col) * squareSize;
        y = (7 - row) * squareSize;
      }

      if (char === piece) {
        return [x, y];
      }
      col += 1;
    }
  }
  return [0, 0];
};
