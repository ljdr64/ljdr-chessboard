import React, { useEffect, useRef, useState } from 'react';

import { createPiece } from '../../utils/createPiece';
import { getPieceClass } from '../../utils/getPieceClass';

import './styles.css';

interface Piece {
  color: 'white' | 'black';
  role: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
}

interface EmptyPiece {
  color: '';
  role: '';
}

interface GameState {
  pieces: Map<string, Piece | EmptyPiece>;
  orientation: 'white' | 'black';
  turnColor: 'white' | 'black';
  coordinates: boolean;
  ranksPosition: 'left' | 'right';
  autoCastle: boolean;
  viewOnly: boolean;
  highlight: {
    lastMove: boolean;
    check: boolean;
  };
  movable: {
    free: boolean;
    color: 'both' | 'white' | 'black';
    showDests: boolean;
  };
}

const state: GameState = {
  pieces: new Map(),
  orientation: 'white',
  turnColor: 'white',
  coordinates: true,
  ranksPosition: 'right',
  autoCastle: true,
  viewOnly: false,
  highlight: {
    lastMove: true,
    check: true,
  },
  movable: {
    free: true,
    color: 'both',
    showDests: true,
  },
};

const DIGITS = '0123456789';
const squareSize = 50;
const transitionDuration = '0.2s';

const initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
let fenPosition = initialFEN.split(' ')[0];
const fenTurn = initialFEN.split(' ')[1];

const mapToRange = (num: number): number[] => {
  const adjustedNum = num + squareSize / 2;
  const coords = Math.floor(adjustedNum / squareSize);
  const result = coords * squareSize;
  return [coords, Math.min(Math.max(result, 0), squareSize * 7)];
};

const updateFENForTake = (fen: string, index: number): string => {
  const updatedFEN = fen.slice(0, index) + '1' + fen.slice(index + 1);

  return updatedFEN.replace(/1+/g, (match: string) => {
    return match.length.toString();
  });
};

const ChessBoard: React.FC = () => {
  const pieceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState('');
  const pieceRefsCurrent = pieceRefs.current;

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
    event.stopPropagation();

    if (
      index === -1 &&
      draggedIndex !== null &&
      pieceRefs.current[draggedIndex]
    ) {
      const offsetX = event.clientX - squareSize / 2;
      const offsetY = event.clientY - squareSize / 2;
      const newX = mapToRange(offsetX);
      const newY = mapToRange(offsetY);
      const draggedPiece = pieceRefs.current[draggedIndex];
      draggedPiece.classList.add('animate');
      draggedPiece.style.transitionDuration = transitionDuration;
      draggedPiece.style.transform = `translate(${newX[1]}px, ${newY[1]}px)`;

      if (draggedPiece) {
        const handleTransitionEnd = () => {
          draggedPiece.removeEventListener(
            'transitionend',
            handleTransitionEnd
          );

          setTimeout(() => {
            draggedPiece.classList.remove('animate');
            draggedPiece.style.transitionDuration = '';
          }, 0);
          setDraggedIndex(null);
        };
        draggedPiece.addEventListener('transitionend', handleTransitionEnd);
      }
    } else {
      const pieceDiv = pieceRefs.current[index];
      if (pieceDiv) {
        setLastMove(pieceDiv.style.transform.toString());
        if (draggedIndex === null || draggedIndex === index) {
          setIsDragging(true);
          setDraggedIndex(index);
          const offsetX = event.clientX - squareSize / 2;
          const offsetY = event.clientY - squareSize / 2;
          pieceDiv.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          pieceDiv.classList.add('drag');
        } else if (pieceRefs.current[draggedIndex]) {
          const draggedPiece = pieceRefs.current[draggedIndex];

          pieceDiv.classList.add('fade');
          draggedPiece.classList.add('animate');
          draggedPiece.style.transitionDuration = transitionDuration;
          draggedPiece.style.transform = pieceDiv.style.transform;

          if (draggedPiece) {
            const handleTransitionEnd = () => {
              draggedPiece.removeEventListener(
                'transitionend',
                handleTransitionEnd
              );

              fenPosition = updateFENForTake(fenPosition, index);
              setTimeout(() => {
                pieceDiv.classList.remove('fade');
                draggedPiece.classList.remove('animate');
                draggedPiece.style.transitionDuration = '';
              }, 0);
              setDraggedIndex(null);
            };
            draggedPiece.addEventListener('transitionend', handleTransitionEnd);
          }
        }
      }
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

            Object.keys(pieceRefsCurrent).forEach((key) => {
              const pieceRef = pieceRefsCurrent[key];
              if (pieceRef?.style?.transform) {
                if (
                  pieceRef.style.transform ===
                    `translate(${newX[1]}px, ${newY[1]}px)` &&
                  draggedIndex !== parseInt(key, 10)
                ) {
                  fenPosition = updateFENForTake(
                    fenPosition,
                    parseInt(key, 10)
                  );
                  setDraggedIndex(null);
                }
              }
            });
            if (lastMove !== `translate(${newX[1]}px, ${newY[1]}px)`) {
              setDraggedIndex(null);
            }

            pieceDiv.style.transform = `translate(${newX[1]}px, ${newY[1]}px)`;
            pieceDiv.classList.remove('drag');
          }
        }
      }
    }
    setIsDragging(false);
  };

  return (
    <div
      className="ljdr-board"
      onMouseDown={(event) => handleMouseDown(-1, event)}
    >
      {(() => {
        const pieces: JSX.Element[] = [];
        let row = 0;
        let col = 0;
        state.turnColor = fenTurn === 'w' ? 'white' : 'black';

        for (let i = 0; i < fenPosition.length; i++) {
          const char = fenPosition[i];

          if (char === '/') {
            row += 1;
            col = 0;
          } else if (DIGITS.includes(char)) {
            col += parseInt(char);
          } else {
            const x = col * squareSize;
            const y = row * squareSize;
            const columnLetter = String.fromCharCode(97 + col);
            const rowNumber = 8 - row;
            const square = `${columnLetter}${rowNumber}`;
            const piece = createPiece(char);
            state.pieces.set(square, piece);

            pieces.push(
              <div
                className={`ljdr-piece ${getPieceClass(char)}`}
                key={`${char}-${row}-${col}`}
                ref={(el) => (pieceRefs.current[i] = el)}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                onMouseDown={(event) => handleMouseDown(i, event)}
                onMouseUp={handleMouseUp}
              ></div>
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
