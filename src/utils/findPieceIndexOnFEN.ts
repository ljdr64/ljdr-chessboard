/**
 * Finds the index of a piece on the FEN string based on pixel coordinates,
 * taking into account the board orientation and square size.
 *
 * @param fen - The FEN string representing the current state of the chessboard.
 * @param coords - A tuple [x, y], representing the pixel coordinates of the top-left corner of the square.
 * @param orientation - The board orientation ('white' or 'black'). Determines how the board is visualized.
 * @param squareSize - The size of each square on the chessboard, in pixels.
 * @returns The index of the piece in the FEN string that corresponds to the square at the given pixel coordinates. Returns -1 if no piece is found.
 */
export const findPieceIndexOnFEN = (
  fen: string,
  coords: [number, number],
  orientation: string,
  squareSize: number
): number => {
  let row = 0;
  let col = 0;
  const DIGITS = '0123456789';

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

      if (coords[0] === x && coords[1] === y) {
        return i;
      }
      col += 1;
    }
  }
  return -1;
};
