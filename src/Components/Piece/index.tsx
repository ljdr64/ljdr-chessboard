import React from 'react';

interface PieceProps {
  piece: string;
  onClick?: () => void;
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

const Piece: React.FC<PieceProps> = React.memo(({ piece, onClick }) => {
  const symbolId = getSymbolId(piece);

  if (!symbolId) {
    return null;
  }

  const svgUrl = `/assets/svg/pieces/${symbolId}.svg`;

  return (
    <div onClick={onClick}>
      <img src={svgUrl} alt={`${symbolId} piece`} width="50" height="50" />
    </div>
  );
});

Piece.displayName = 'Piece';

export default Piece;
