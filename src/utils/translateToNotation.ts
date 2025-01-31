/**
 * Converts a `translate(x, y)` CSS transformation into chess algebraic notation.
 * @param translate - A string in the format `translate(xpx, ypx)`.
 * @param squareSize - The size of each square in pixels.
 * @param orientation - The board orientation, either 'white' or 'black'.
 * @returns A string representing the square in algebraic notation (e.g., 'e2').
 */
export const translateToNotation = (
  translate: string,
  squareSize: number,
  orientation: string
): string => {
  // Extract x and y values from the translate string
  const match = translate.match(/translate\((-?\d+)px, (-?\d+)px\)/);
  if (!match) return ''; // Return an empty string if the format is invalid

  let col = parseInt(match[1], 10) / squareSize;
  let row = parseInt(match[2], 10) / squareSize;

  // If the board is oriented for black, invert the column and row
  if (orientation === 'black') {
    col = 7 - col;
    row = 7 - row;
  }

  const file = String.fromCharCode('a'.charCodeAt(0) + col); // Convert column index to letter ('a'-'h')
  const rank = (8 - row).toString(); // Convert row index to rank ('1'-'8')

  return `${file}${rank}`;
};
