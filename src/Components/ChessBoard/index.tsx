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

interface ChessGameProps {
  initialFEN: string;
  squareSize: number;
  transitionDuration: string;
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

const mapToRange = (num: number, squareSize: number): number[] => {
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

const ChessBoard: React.FC<ChessGameProps> = ({
  initialFEN,
  squareSize,
  transitionDuration,
}) => {
  const pieceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const ghostRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const lastMoveToRef = useRef<HTMLDivElement>(null);
  const lastMoveFromRef = useRef<HTMLDivElement>(null);

  const [fenPosition, setFenPosition] = useState(initialFEN.split(' ')[0]);
  const [positionLastMove, setPositionLastMove] = useState({
    from: '',
    to: '',
  });
  const [positionSelect, setPositionSelect] = useState('');
  const [isSelect, setIsSelect] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState('');

  const pieceRefsCurrent = pieceRefs.current;

  const fenTurn = initialFEN.split(' ')[1];
  const DIGITS = '0123456789';

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
      pieceRefs.current[draggedIndex] &&
      isSelect
    ) {
      // select - from: piece - to: empty
      const pieceDiv = pieceRefs.current[draggedIndex];
      const piecePos = {
        posX: pieceDiv.offsetLeft + squareSize / 2,
        posY: pieceDiv.offsetTop + squareSize / 2,
      };

      const offsetX = event.clientX - piecePos.posX + window.scrollX;
      const offsetY = event.clientY - piecePos.posY + window.scrollY;

      const newX = mapToRange(offsetX, squareSize);
      const newY = mapToRange(offsetY, squareSize);
      const draggedPiece = pieceRefs.current[draggedIndex];
      draggedPiece.classList.add('animate');
      draggedPiece.style.transitionDuration = transitionDuration;
      draggedPiece.style.transform = `translate(${newX[1]}px, ${newY[1]}px)`;

      setPositionSelect('');
      setIsSelect((prev) => !prev);
      setPositionLastMove({ from: lastMove, to: draggedPiece.style.transform });
      if (lastMoveToRef.current) {
        lastMoveToRef.current.classList.remove('select');
      }

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
      // select - from = to (piece selected)
      const pieceDiv = pieceRefs.current[index];
      if (pieceDiv) {
        setLastMove(pieceDiv.style.transform.toString());
        if (
          draggedIndex === null ||
          draggedIndex === index ||
          (draggedIndex !== index && !isSelect)
        ) {
          setIsDragging(true);
          setDraggedIndex(index);
          const piecePos = {
            posX: pieceDiv.offsetLeft + squareSize / 2,
            posY: pieceDiv.offsetTop + squareSize / 2,
          };

          const newX = event.clientX - piecePos.posX + window.scrollX;
          const newY = event.clientY - piecePos.posY + window.scrollY;
          pieceDiv.style.transform = `translate(${newX}px, ${newY}px)`;

          pieceDiv.classList.add('drag');
          const regex = /translate\((-?\d+)px, (-?\d+)px\)/;
          const position = pieceDiv.style.transform.match(regex);
          if (position && ghostRef.current) {
            const newX = mapToRange(parseInt(position[1], 10), squareSize);
            const newY = mapToRange(parseInt(position[2], 10), squareSize);

            setIsSelect((prev) => !prev);
            if (
              lastMoveToRef.current &&
              positionLastMove.to === `translate(${newX[1]}px, ${newY[1]}px)`
            ) {
              lastMoveToRef.current.classList.add('select');
            } else {
              setPositionSelect(`translate(${newX[1]}px, ${newY[1]}px)`);
            }

            ghostRef.current.style.visibility = 'visible';
            ghostRef.current.style.transform = `translate(${newX[1]}px, ${newY[1]}px)`;
            if (ghostRef.current.classList.length > 2) {
              const firstOldClass = ghostRef.current.classList[1];
              const secondOldClass = ghostRef.current.classList[2];
              ghostRef.current.classList.replace(
                firstOldClass,
                pieceDiv.classList[1]
              );
              ghostRef.current.classList.replace(
                secondOldClass,
                pieceDiv.classList[2]
              );
            } else {
              ghostRef.current.classList.add(pieceDiv.classList[1]);
              ghostRef.current.classList.add(pieceDiv.classList[2]);
            }
          }
        } else if (pieceRefs.current[draggedIndex]) {
          // select - from: piece - to: piece
          if (isSelect) {
            const draggedPiece = pieceRefs.current[draggedIndex];

            pieceDiv.classList.add('fade');
            draggedPiece.classList.add('animate');
            draggedPiece.style.transitionDuration = transitionDuration;
            draggedPiece.style.transform = pieceDiv.style.transform;

            setPositionSelect('');
            setIsSelect((prev) => !prev);
            setPositionLastMove({
              from: lastMove,
              to: draggedPiece.style.transform,
            });
            if (lastMoveToRef.current) {
              lastMoveToRef.current.classList.remove('select');
            }

            if (draggedPiece) {
              const handleTransitionEnd = () => {
                draggedPiece.removeEventListener(
                  'transitionend',
                  handleTransitionEnd
                );

                setFenPosition(updateFENForTake(fenPosition, index));
                setTimeout(() => {
                  pieceDiv.classList.remove('fade');
                  draggedPiece.classList.remove('animate');
                  draggedPiece.style.transitionDuration = '';
                }, 0);
                setDraggedIndex(null);
              };
              draggedPiece.addEventListener(
                'transitionend',
                handleTransitionEnd
              );
            }
          } else {
            setDraggedIndex(null);
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
            const newX = mapToRange(parseInt(position[1], 10), squareSize);
            const newY = mapToRange(parseInt(position[2], 10), squareSize);
            console.log(parseInt(position[1], 10), parseInt(position[2], 10));

            if (
              parseInt(position[1], 10) < 0 - squareSize / 2 ||
              parseInt(position[2], 10) < 0 - squareSize / 2 ||
              parseInt(position[1], 10) >
                squareSize * 7 + window.scrollX + squareSize / 2 ||
              parseInt(position[2], 10) >
                squareSize * 7 + window.scrollY + squareSize / 2
            ) {
              if (ghostRef.current) {
                ghostRef.current.style.visibility = 'hidden';
              }
              pieceDiv.style.transform = lastMove;
              setDraggedIndex(null);
              setPositionSelect('');
              setIsSelect(false);
              if (lastMoveToRef.current) {
                lastMoveToRef.current.classList.remove('select');
              }
            } else {
              Object.keys(pieceRefsCurrent).forEach((key) => {
                const pieceRef = pieceRefsCurrent[key];
                if (pieceRef?.style?.transform) {
                  if (
                    pieceRef.style.transform ===
                      `translate(${newX[1]}px, ${newY[1]}px)` &&
                    draggedIndex !== parseInt(key, 10)
                  ) {
                    // drag - from: piece - to: piece
                    setFenPosition(
                      updateFENForTake(fenPosition, parseInt(key, 10))
                    );
                    setDraggedIndex(null);
                  }
                }
              });
              if (lastMove !== `translate(${newX[1]}px, ${newY[1]}px)`) {
                setDraggedIndex(null);
              }

              // drag - from: piece - to: empty
              pieceDiv.style.transform = `translate(${newX[1]}px, ${newY[1]}px)`;
              if (lastMove !== pieceDiv.style.transform) {
                setPositionSelect('');
                setIsSelect(false);
                setPositionLastMove({
                  from: lastMove,
                  to: pieceDiv.style.transform,
                });
                if (lastMoveToRef.current) {
                  lastMoveToRef.current.classList.remove('select');
                }
              }

              if (!isSelect) {
                if (lastMoveToRef.current) {
                  lastMoveToRef.current.classList.remove('select');
                }
                setPositionSelect('');
              }

              if (ghostRef.current) {
                ghostRef.current.style.visibility = 'hidden';
              }
            }

            pieceDiv.classList.remove('drag');
          }
        }
      }
    }
    setIsDragging(false);
  };

  return (
    <div
      className="ljdr-container"
      style={{
        width: `${squareSize * 8}px`,
        height: `${squareSize * 8}px`,
      }}
    >
      <div
        className="ljdr-board"
        style={{
          width: `${squareSize * 8}px`,
          height: `${squareSize * 8}px`,
        }}
        onMouseDown={(event) => handleMouseDown(-1, event)}
      >
        {positionSelect && (
          <div
            className="select"
            ref={selectRef}
            style={{
              width: `${squareSize}px`,
              height: `${squareSize}px`,
              transform: positionSelect,
            }}
          ></div>
        )}
        {positionLastMove.from && positionLastMove.to && (
          <>
            <div
              className="ljdr-last-move"
              ref={lastMoveToRef}
              style={{
                width: `${squareSize}px`,
                height: `${squareSize}px`,
                transform: positionLastMove.to,
              }}
            ></div>
            <div
              className="ljdr-last-move"
              ref={lastMoveFromRef}
              style={{
                width: `${squareSize}px`,
                height: `${squareSize}px`,
                transform: positionLastMove.from,
              }}
            ></div>
          </>
        )}
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
                    width: `${squareSize}px`,
                    height: `${squareSize}px`,
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
      <div
        className="ljdr-ghost"
        ref={ghostRef}
        style={{
          width: `${squareSize}px`,
          height: `${squareSize}px`,
          visibility: 'hidden',
        }}
      ></div>
    </div>
  );
};

export default ChessBoard;
