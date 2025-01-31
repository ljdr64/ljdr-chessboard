/**
 * Converts piece role and color to its corresponding FEN character.
 *
 * @param piece - An object containing piece role and color.
 * @returns The corresponding FEN character.
 */
export const pieceToFEN = (piece: { role: string; color: string }): string => {
  const roleMap: Record<string, string> = {
    pawn: 'p',
    knight: 'n',
    bishop: 'b',
    rook: 'r',
    queen: 'q',
    king: 'k',
  };
  const fenChar = roleMap[piece.role.toLowerCase()] || '?';
  return piece.color === 'white'
    ? fenChar.toUpperCase()
    : fenChar.toLowerCase();
};
