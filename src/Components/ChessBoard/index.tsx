import React, { memo, useEffect, useRef, useState } from 'react';

import { createPiece } from '../../utils/createPiece';
import { getPieceClass } from '../../utils/getPieceClass';
import { getTranslateCoords } from '../../utils/getTranslateCoords';

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
  id: string;
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
  id,
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
  const [isTouchStarted, setIsTouchStarted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState('');

  const pieceRefsCurrent = pieceRefs.current;

  const fenTurn = initialFEN.split(' ')[1];
  const DIGITS = '0123456789';

  const boardRef = useRef(null);
  const ranksRef = useRef(null);
  const filesRef = useRef(null);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp as EventListener);
      window.addEventListener('mousemove', handleMouseMove as EventListener, {
        passive: false,
      });
      window.addEventListener('touchend', handleTouchEnd as EventListener);
      window.addEventListener('touchmove', handleTouchMove as EventListener, {
        passive: false,
      });
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp as EventListener);
      window.removeEventListener('mousemove', handleMouseMove as EventListener);
      window.removeEventListener('touchend', handleTouchEnd as EventListener);
      window.removeEventListener('touchmove', handleTouchMove as EventListener);
    };
  }, [isDragging]);

  const handleMouseDown = (index: number, event: any) => {
    event.stopPropagation();

    let eventType;
    if (event.type === 'mousedown') {
      eventType = event;
      setIsTouchStarted(false);
    } else if (event.type === 'touchstart') {
      eventType = event.touches[0];
      setIsTouchStarted(true);
    }
    if (event.type === 'mousedown' && isTouchStarted) return;

    if (
      index === -1 &&
      draggedIndex !== null &&
      pieceRefs.current[draggedIndex] &&
      isSelect
    ) {
      // select - from: piece - to: empty
      const pieceDiv = pieceRefs.current[draggedIndex];

      const position = getTranslateCoords(pieceDiv.style.transform);
      const rect = pieceDiv.getBoundingClientRect();

      if (position) {
        const offsetX =
          position[0] + eventType.clientX - rect.left - squareSize / 2;
        const offsetY =
          position[1] + eventType.clientY - rect.top - squareSize / 2;
        const newX = mapToRange(offsetX, squareSize);
        const newY = mapToRange(offsetY, squareSize);
        const draggedPiece = pieceRefs.current[draggedIndex];
        draggedPiece.classList.add('animate');
        draggedPiece.style.transitionDuration = transitionDuration;
        draggedPiece.style.transform = `translate(${newX[1]}px, ${newY[1]}px)`;

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

            setTimeout(() => {
              draggedPiece.classList.remove('animate');
              draggedPiece.style.transitionDuration = '';
            }, 0);
            setDraggedIndex(null);
          };
          draggedPiece.addEventListener('transitionend', handleTransitionEnd);
        }
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

          const position = getTranslateCoords(pieceDiv.style.transform);
          const rect = pieceDiv.getBoundingClientRect();

          if (position) {
            const offsetX =
              position[0] + eventType.clientX - rect.left - squareSize / 2;
            const offsetY =
              position[1] + eventType.clientY - rect.top - squareSize / 2;
            pieceDiv.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          }

          pieceDiv.classList.add('drag');
          if (position && ghostRef.current) {
            const newX = mapToRange(position[0], squareSize);
            const newY = mapToRange(position[1], squareSize);

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

  const handleMouseMove = (event: any) => {
    let eventType;

    if (event.type === 'mousemove') {
      eventType = event;
    } else if (event.type === 'touchmove') {
      eventType = event.touches[0];
    }

    if (draggedIndex !== null) {
      const pieceDiv = pieceRefs.current[draggedIndex];
      if (pieceDiv) {
        const position = getTranslateCoords(pieceDiv.style.transform);
        const rect = pieceDiv.getBoundingClientRect();

        if (position) {
          if (isDragging) {
            const offsetX =
              position[0] + eventType.clientX - rect.left - squareSize / 2;
            const offsetY =
              position[1] + eventType.clientY - rect.top - squareSize / 2;
            pieceDiv.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          }
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    if (draggedIndex !== null) {
      const pieceDiv = pieceRefs.current[draggedIndex];
      if (pieceDiv) {
        const position = getTranslateCoords(pieceDiv.style.transform);
        const pieceRect = pieceDiv.getBoundingClientRect();
        const isPieceOutOfBounds =
          pieceRect.top < 0 ||
          pieceRect.left < 0 ||
          pieceRect.bottom > window.innerHeight ||
          pieceRect.right > window.innerWidth;
        if (position) {
          {
            const newX = mapToRange(position[0], squareSize);
            const newY = mapToRange(position[1], squareSize);

            if (
              position[0] < 0 - squareSize / 2 ||
              position[1] < 0 - squareSize / 2 ||
              position[0] > squareSize * 7 + squareSize / 2 ||
              position[1] > squareSize * 7 + squareSize / 2 ||
              isPieceOutOfBounds
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

  const handleTouchStart = (index: number, event: any) => {
    handleMouseDown(index, event);
  };

  const handleTouchMove = (event: any) => {
    handleMouseMove(event);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  return (
    <div id={id} className="ljdr-wrap">
      <div
        className="ljdr-container"
        style={{
          width: `${squareSize * 8}px`,
          height: `${squareSize * 8}px`,
        }}
      >
        <div
          className="ljdr-board"
          ref={boardRef}
          onMouseDown={(event) => handleMouseDown(-1, event)}
          onTouchStart={(event) => handleTouchStart(-1, event)}
        >
          {positionSelect && (
            <div
              className="select"
              ref={selectRef}
              style={{
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
                  transform: positionLastMove.to,
                }}
              ></div>
              <div
                className="ljdr-last-move"
                ref={lastMoveFromRef}
                style={{
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
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    onMouseDown={(event) => handleMouseDown(i, event)}
                    onTouchStart={(event) => handleTouchStart(i, event)}
                  ></div>
                );

                col += 1;
              }
            }

            return pieces;
          })()}
        </div>
        <div className="coords ranks" ref={ranksRef}>
          <div className="coord">1</div>
          <div className="coord">2</div>
          <div className="coord">3</div>
          <div className="coord">4</div>
          <div className="coord">5</div>
          <div className="coord">6</div>
          <div className="coord">7</div>
          <div className="coord">8</div>
        </div>
        <div className="coords files" ref={filesRef}>
          <div className="coord">a</div>
          <div className="coord">b</div>
          <div className="coord">c</div>
          <div className="coord">d</div>
          <div className="coord">e</div>
          <div className="coord">f</div>
          <div className="coord">g</div>
          <div className="coord">h</div>
        </div>
        <div
          className="ljdr-ghost"
          ref={ghostRef}
          style={{
            visibility: 'hidden',
          }}
        ></div>
      </div>
    </div>
  );
};

export default memo(ChessBoard);
