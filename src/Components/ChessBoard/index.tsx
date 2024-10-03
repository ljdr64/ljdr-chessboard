import React, { useEffect, useRef, useState } from 'react';
import Piece from '../Piece';
import './styles.css';

const squareSize = 50;

type PiecePosition = {
  piece: string;
  translate: string;
};

const mapNumberToRange = (
  x: number,
  y: number,
  squareSize: number
): [number, number] => {
  const mapToRange = (num: number): number => {
    const adjustedNum = num + squareSize / 2;
    const result = Math.floor(adjustedNum / squareSize) * squareSize;
    return Math.min(Math.max(result, 0), squareSize * 7);
  };
  return [mapToRange(x), mapToRange(y)];
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
const blackPiecesMajor: string[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
const blackPiecesPawns: string[] = Array(8).fill('p');

const piecePositions: PiecePosition[] = [
  ...createPiecePositions(whitePiecesMajor, 7),
  ...createPiecePositions(whitePiecesPawns, 6),
  ...createPiecePositions(blackPiecesMajor, 0),
  ...createPiecePositions(blackPiecesPawns, 1),
];

const ChessBoard: React.FC = () => {
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as EventListener, {
        passive: false,
      });
    } else {
      document.removeEventListener(
        'mousemove',
        handleMouseMove as EventListener
      );
    }

    return () => {
      document.removeEventListener(
        'mousemove',
        handleMouseMove as EventListener
      );
    };
  }, [isDragging]);

  const handleMouseDown = (
    index: number,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const pieceDiv = pieceRefs.current[index];
    if (pieceDiv) {
      setIsDragging(true);
      setDraggedIndex(index);
      const offsetX = event.clientX - squareSize / 2;
      const offsetY = event.clientY - squareSize / 2;
      pieceDiv.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      pieceDiv.style.zIndex = '10';
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (draggedIndex !== null) {
      const pieceDiv = pieceRefs.current[draggedIndex];
      if (pieceDiv) {
        const piecePos = {
          posX: pieceDiv.offsetLeft + squareSize / 2,
          posY: pieceDiv.offsetTop + squareSize / 2,
        };
        if (isDragging) {
          const newX = event.clientX - piecePos.posX + window.scrollX;
          const newY = event.clientY - piecePos.posY + window.scrollY;
          pieceDiv.style.transform = `translate(${newX}px, ${newY}px)`;
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    if (draggedIndex !== null) {
      const pieceDiv = pieceRefs.current[draggedIndex];
      const regex = /translate\((-?\d+)px, (-?\d+)px\)/;
      if (pieceDiv) {
        const position = pieceDiv.style.transform.match(regex);
        if (position) {
          {
            const [newX, newY] = mapNumberToRange(
              parseInt(position[1], 10),
              parseInt(position[2], 10),
              squareSize
            );
            pieceDiv.style.transform = `translate(${newX}px, ${newY}px)`;
            pieceDiv.style.zIndex = '0';
          }
        }
      }
    }
    setIsDragging(false);
    setDraggedIndex(null);
  };

  return (
    <div className="bg-board">
      {piecePositions.map((pos, index) => (
        <div
          className="bg-container-piece"
          key={index}
          ref={(el) => (pieceRefs.current[index] = el)}
          style={{ transform: pos.translate }}
          onMouseDown={(event) => handleMouseDown(index, event)}
          onMouseUp={handleMouseUp}
        >
          <div className="bg-piece">
            <Piece piece={pos.piece} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChessBoard;
