/**
 * Validates and filters an array of chess moves.
 *
 * A valid move follows the format `[a-h][1-8][a-h][1-8]` (e.g., "e2e4").
 *
 * @param {string[]} moves - The array of chess moves to validate.
 * @returns {string[]} An array containing only the valid moves.
 */
export const validateMoves = (moves: string[]): string[] => {
  return moves.filter((move) => /^[a-h][1-8][a-h][1-8]$/.test(move));
};
