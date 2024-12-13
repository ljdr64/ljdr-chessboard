/**
 * Converts chess algebraic notation to translate CSS transformations.
 * @param moves - Array of chess moves in algebraic notation (e.g., ['e2', 'e4']).
 * @param squareSize - Size of each square in pixels.
 * @param orientation - The orientation of the board, either 'white' or 'black'.
 * @returns Array of strings with `translate(x, y)` transformations or the input array if it is ['', ''].
 */
export const notationToTranslate = (
  moves: string[],
  squareSize: number,
  orientation: string
): string[] => {
  // Check if moves is exactly ['', '']
  if (moves[0] === '' && moves[1] === '') {
    return moves; // Return the same array if it's ['', '']
  }

  return moves.map((move) => {
    let col = move.charCodeAt(0) - 'a'.charCodeAt(0); // Convert letter to numeric column
    let row = 8 - parseInt(move[1], 10); // Convert chess row to array index

    // If orientation is 'black', reverse the col and row
    if (orientation === 'black') {
      col = 7 - col; // Reverse column
      row = 7 - row; // Reverse row
    }

    const translateX = col * squareSize;
    const translateY = row * squareSize;
    return `translate(${translateX}px, ${translateY}px)`;
  });
};
