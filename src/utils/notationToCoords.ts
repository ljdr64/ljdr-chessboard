/**
 * Converts chess algebraic notation to CSS translate coordinates.
 * @param move - Single chess move in algebraic notation (e.g., 'e2').
 * @param squareSize - Size of each square in pixels.
 * @param orientation - The orientation of the board, either 'white' or 'black'.
 * @returns An array with the [x, y] coordinates for `translate(x, y)` transformations.
 */
export const notationToCoords = (
  move: string,
  squareSize: number,
  orientation: string
): [number, number] => {
  if (!move || move.length !== 2) {
    throw new Error('Invalid move notation. Expected a string like "e2".');
  }

  // Convert the column (file) to a numeric index (0 for 'a', 7 for 'h')
  let col = move.charCodeAt(0) - 'a'.charCodeAt(0);
  // Convert the row (rank) to a numeric index (0 for bottom, 7 for top)
  let row = 8 - parseInt(move[1], 10);

  if (orientation === 'black') {
    // Reverse the column and row if the board is oriented for black
    col = 7 - col;
    row = 7 - row;
  }

  const x = col * squareSize;
  const y = row * squareSize;

  return [x, y];
};
