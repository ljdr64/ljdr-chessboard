import React from 'react';
import Piece from '../Piece';
import './styles.css';

const squareSize = 50;

type PiecePosition = {
  piece: string;
  translate: string;
};

const createPiecePositions = (
  pieces: string[],
  row: number
): PiecePosition[] => {
  return pieces.map((piece, index) => ({
    piece: piece,
    translate: `translate(${index * squareSize}px, ${row * squareSize}px)`,
  }));
};

const whitePiecesMajor: string[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
const whitePiecesPawns: string[] = Array(8).fill('P');

const whitePiecePositions: PiecePosition[] = [
  ...createPiecePositions(whitePiecesMajor, 7),
  ...createPiecePositions(whitePiecesPawns, 6),
];

const blackPiecesMajor: string[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
const blackPiecesPawns: string[] = Array(8).fill('p');

const blackPiecePositions: PiecePosition[] = [
  ...createPiecePositions(blackPiecesMajor, 0),
  ...createPiecePositions(blackPiecesPawns, 1),
];

const ChessBoard: React.FC = () => {
  return (
    <div className="bg-board">
      {whitePiecePositions.map((pos, index) => (
        <div
          className="bg-piece"
          key={index}
          style={{ transform: pos.translate }}
        >
          <Piece piece={pos.piece} />
        </div>
      ))}
      {blackPiecePositions.map((pos, index) => (
        <div
          className="bg-piece"
          key={index + 16}
          style={{ transform: pos.translate }}
        >
          <Piece piece={pos.piece} />
        </div>
      ))}
    </div>
  );
};

export default ChessBoard;
