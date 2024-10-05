import React, { useEffect, useRef, useState } from 'react';
import Piece from '../Piece';

import './styles.css';

const DIGITS = '0123456789';
const squareSize = 50;

const initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const fen = initialFEN;

const mapToRange = (num: number): number[] => {
  const adjustedNum = num + squareSize / 2;
  const coords = Math.floor(adjustedNum / squareSize);
  const result = coords * squareSize;
  return [coords, Math.min(Math.max(result, 0), squareSize * 7)];
};

const ChessBoard: React.FC = () => {
  const pieceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
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
      pieceDiv.style.zIndex = '';
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
            const newX = mapToRange(parseInt(position[1], 10));
            const newY = mapToRange(parseInt(position[2], 10));

            pieceDiv.style.transform = `translate(${newX[1]}px, ${newY[1]}px)`;
            pieceDiv.style.zIndex = '0';
          }
        }
      }
    }
    setIsDragging(false);
    setDraggedIndex(null);
  };

  return (
    <div className="cg-board">
      {(() => {
        const pieces: JSX.Element[] = [];
        let row = 0;
        let col = 0;

        for (let i = 0; i < fen.length; i++) {
          const char = fen[i];

          if (char === ' ') {
            break;
          } else if (char === '/') {
            row += 1;
            col = 0;
          } else if (DIGITS.includes(char)) {
            col += parseInt(char);
          } else {
            const x = col * squareSize;
            const y = row * squareSize;

            pieces.push(
              <div
                className="cg-container-piece"
                key={`${char}-${row}-${col}`}
                ref={(el) => (pieceRefs.current[i] = el)}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                onMouseDown={(event) => handleMouseDown(i, event)}
                onMouseUp={handleMouseUp}
              >
                <div className={`cg-piece ${char}`}>
                  <Piece piece={char} />
                </div>
              </div>
            );

            col += 1;
          }
        }

        return pieces;
      })()}
    </div>
  );
};

export default ChessBoard;
