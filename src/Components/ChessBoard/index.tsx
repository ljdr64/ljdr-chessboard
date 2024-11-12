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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState('');

  const pieceRefsCurrent = pieceRefs.current;

  const fenTurn = initialFEN.split(' ')[1];
  const DIGITS = '0123456789';
  const regex = /translate\((-?\d+)px, (-?\d+)px\)/;

  const ranksRef = useRef(null);
  const filesRef = useRef(null);

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

      const position = pieceDiv.style.transform.match(regex);
      const rect = pieceDiv.getBoundingClientRect();

      if (position) {
        const offsetX =
          parseInt(position[1], 10) +
          event.clientX -
          rect.left -
          squareSize / 2;
        const offsetY =
          parseInt(position[2], 10) + event.clientY - rect.top - squareSize / 2;
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

          const regex = /translate\((-?\d+)px, (-?\d+)px\)/;
          const position = pieceDiv.style.transform.match(regex);
          const rect = pieceDiv.getBoundingClientRect();

          if (position) {
            const offsetX =
              parseInt(position[1], 10) +
              event.clientX -
              rect.left -
              squareSize / 2;
            const offsetY =
              parseInt(position[2], 10) +
              event.clientY -
              rect.top -
              squareSize / 2;
            pieceDiv.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          }

          pieceDiv.classList.add('drag');
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
        const position = pieceDiv.style.transform.match(regex);
        const rect = pieceDiv.getBoundingClientRect();

        if (position) {
          if (isDragging) {
            const offsetX =
              parseInt(position[1], 10) +
              event.clientX -
              rect.left -
              squareSize / 2;
            const offsetY =
              parseInt(position[2], 10) +
              event.clientY -
              rect.top -
              squareSize / 2;
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
        const position = pieceDiv.style.transform.match(regex);
        if (position) {
          {
            const newX = mapToRange(parseInt(position[1], 10), squareSize);
            const newY = mapToRange(parseInt(position[2], 10), squareSize);

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
          onMouseDown={(event) => handleMouseDown(-1, event)}
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
          className="coords ranks"
          ref={ranksRef}
          style={{
            fontSize: `${squareSize * 0.2}px`,
            marginTop: `${-squareSize * 0.35}px`,
            width: `${squareSize * 0.15}px`,
            height: `${squareSize * 8}px`,
          }}
        >
          <div className="coord">1</div>
          <div className="coord">2</div>
          <div className="coord">3</div>
          <div className="coord">4</div>
          <div className="coord">5</div>
          <div className="coord">6</div>
          <div className="coord">7</div>
          <div className="coord">8</div>
        </div>
        <div
          className="coords files"
          ref={filesRef}
          style={{
            fontSize: `${squareSize * 0.2}px`,
            marginTop: `${squareSize * 7.75}px`,
            marginLeft: `${squareSize * 0.38}px`,
            width: `${squareSize * 8}px`,
            height: `${squareSize * 0.25}px`,
          }}
        >
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

export default ChessBoard;
