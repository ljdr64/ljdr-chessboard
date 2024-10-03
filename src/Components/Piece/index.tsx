import React from 'react';
import '../ChessBoard/styles.css';

interface PieceProps {
  piece: string;
}

const getSymbolId = (piece: string): string | null => {
  const normalizedPiece = piece.toLowerCase();
  if (
    normalizedPiece === 'k' ||
    normalizedPiece === 'q' ||
    normalizedPiece === 'r' ||
    normalizedPiece === 'b' ||
    normalizedPiece === 'n' ||
    normalizedPiece === 'p'
  ) {
    return piece === piece.toLowerCase()
      ? `Chess_${normalizedPiece}dt45`
      : `Chess_${normalizedPiece}lt45`;
  }
  return null;
};

const Piece: React.FC<PieceProps> = React.memo(({ piece }) => {
  const symbolId = getSymbolId(piece);

  if (!symbolId) {
    return null;
  }

  const svgUrl = `/assets/svg/pieces/${symbolId}.svg`;

  return <img src={svgUrl} alt={`${symbolId} piece`} width="50" height="50" />;
});

Piece.displayName = 'Piece';

export default Piece;
