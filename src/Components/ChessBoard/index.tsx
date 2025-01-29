import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ChessGameProps,
  defaultId,
  defaultFEN,
  defaultSquareSize,
  defaultDraggable,
  defaultOrientation,
  defaultTurnColor,
  defaultCheck,
  defaultLastMove,
  defaultCoordinates,
  defaultAnimation,
  defaultEvents,
} from './props';
import { getPieceClass } from '../../utils/getPieceClass';
import { getTranslateCoords } from '../../utils/getTranslateCoords';
import { coordsToTranslate } from '../../utils/coordsToTranslate';
import { notationToTranslate } from '../../utils/notationToTranslate';
import { notationToCoords } from '../../utils/notationToCoords';
import { findPieceOnFEN } from '../../utils/findPieceOnFEN';
import { findPieceIndexOnFEN } from '../../utils/findPieceIndexOnFEN';
import { animateMove } from '../../utils/animateMove';

import './styles.css';

const mapToRange = (num: number, squareSize: number): number[] => {
  const adjustedNum = num + squareSize / 2;
  const coords = Math.floor(adjustedNum / squareSize);
  const result = coords * squareSize;
  return [coords, Math.min(Math.max(result, 0), squareSize * 7)];
};

const updateFENForTake = (fen: string, index: number): string => {
  const updatedFEN = fen.slice(0, index) + '1' + fen.slice(index + 1);
  return updatedFEN;
};

const ChessBoard: React.FC<ChessGameProps> = ({
  id = defaultId,
  fen = defaultFEN,
  orientation = defaultOrientation,
  turnColor = defaultTurnColor,
  check = defaultCheck,
  lastMove = defaultLastMove,
  coordinates = defaultCoordinates,
  squareSize = defaultSquareSize,
  animation = defaultAnimation,
  draggable = defaultDraggable,
  events = defaultEvents,
}) => {
  const animationConfig = { ...defaultAnimation, ...animation };
  const draggableConfig = { ...defaultDraggable, ...draggable };
  const eventsConfig = { ...defaultEvents, ...events };

  const pieceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const selectRef = useRef<HTMLDivElement | null>(null);
  const checkRef = useRef<HTMLDivElement | null>(null);
  const lastMoveToRef = useRef<HTMLDivElement | null>(null);
  const lastMoveFromRef = useRef<HTMLDivElement | null>(null);
  const lastAnimationRef = useRef<{
    index: number;
    startPos: [number, number];
    endPos: [number, number];
    cancel: () => void;
  } | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [fenPosition, setFenPosition] = useState(fen.split(' ')[0]);
  const [lastFenPosition, setLastFenPosition] = useState(fen.split(' ')[0]);
  const [positionLastMove, setPositionLastMove] = useState(() => {
    if (eventsConfig.moves) {
      if (eventsConfig.moves.length >= 1) {
        const eventsLastMove = eventsConfig.moves.slice(-1)[0];
        const from = eventsLastMove.slice(0, 2);
        const to = eventsLastMove.slice(-2);
        const [eventsFrom, eventsTo] = notationToTranslate(
          [from, to],
          squareSize,
          orientation
        );
        return { from: eventsFrom, to: eventsTo };
      }
    }

    const [defaultFrom, defaultTo] = notationToTranslate(
      lastMove,
      squareSize,
      orientation
    );
    return { from: defaultFrom, to: defaultTo };
  });
  const [positionSelect, setPositionSelect] = useState('');
  const [positionCheck, setPositionCheck] = useState(() => {
    if (eventsConfig.moves) {
      if (eventsConfig.moves.length >= 1) {
        return '';
      }
    }

    if (check === 'white' || (check === true && turnColor === 'white')) {
      return coordsToTranslate(
        findPieceOnFEN(fen, 'K', orientation, squareSize)
      );
    } else if (check === 'black' || (check === true && turnColor === 'black')) {
      return coordsToTranslate(
        findPieceOnFEN(fen, 'k', orientation, squareSize)
      );
    }
    return '';
  });
  const [isSelect, setIsSelect] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchStarted, setIsTouchStarted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [lastTranslate, setLastTranslate] = useState('');
  const [lastAnimation, setLastAnimation] = useState<{
    index: number;
    startPos: [number, number];
    endPos: [number, number];
    cancel: () => void;
  } | null>(null);
  const [lastOffset, setLastOffset] = useState([0, 0]);
  const [lastMoveType, setLastMoveType] = useState<'select' | 'drag'>('drag');

  const ranks = [1, 2, 3, 4, 5, 6, 7, 8];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const pieceRefsCurrent = pieceRefs.current;
  const DIGITS = '0123456789';

  const ranksRef = useRef(null);
  const filesRef = useRef(null);

  let distancePassed = false;
  let isPieceTakenByDrag = false;
  let isCheck = false;

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

  useEffect(() => {
    const eventsLastMove = eventsConfig.moves?.slice(-1)[0];
    const from = eventsLastMove?.slice(0, 2);
    const to = eventsLastMove?.slice(-2);
    if (from && to) {
      const initialIndex = findPieceIndexOnFEN(
        fenPosition,
        notationToCoords(from, squareSize, orientation),
        orientation,
        squareSize
      );
      const initialStartPos: [number, number] = notationToCoords(
        from,
        squareSize,
        orientation
      );
      const initialEndPos: [number, number] = notationToCoords(
        to,
        squareSize,
        orientation
      );

      setDraggedIndex(initialIndex);
      setLastAnimation({
        index: initialIndex,
        startPos: initialStartPos,
        endPos: initialEndPos,
        cancel: () => {},
      });
      setTimeout(() => {
        pieceRefs.current[initialIndex]?.classList.add('animate');
      }, 0);

      if (lastAnimationRef.current) {
        lastAnimationRef.current.cancel();
      }
      lastAnimationRef.current = animateMove(
        initialIndex,
        pieceRefs.current[initialIndex],
        initialStartPos,
        initialEndPos,
        animationConfig.duration,
        () => {
          setTimeout(() => {
            if (pieceRefs.current[initialIndex]) {
              pieceRefs.current[initialIndex].classList.remove('animate');
            }
          }, 0);
          lastAnimationRef.current = null;
        },
        () => {
          setTimeout(() => {
            if (pieceRefs.current[initialIndex]) {
              pieceRefs.current[initialIndex].classList.remove('animate');
            }
          }, 0);
          lastAnimationRef.current = null;
        }
      );
    }

    return () => {
      if (lastAnimationRef.current) {
        lastAnimationRef.current.cancel();
        lastAnimationRef.current = null;
      }
    };
  }, []);

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

        if (animationConfig.enabled && animationConfig.duration > 0) {
          if (lastAnimation) {
            lastAnimation.cancel();
          }
          if (lastAnimationRef.current !== null) {
            lastAnimationRef.current.cancel();
          }
          draggedPiece.classList.add('animate');
          const currentAnimation = animateMove(
            draggedIndex,
            draggedPiece,
            getTranslateCoords(draggedPiece.style.transform),
            getTranslateCoords(`translate(${newX[1]}px, ${newY[1]}px)`),
            animationConfig.duration,
            () => {
              setTimeout(() => {
                draggedPiece.classList.remove('animate');
              }, 0);
              setLastAnimation(null);
              if (
                typeof lastAnimation?.index === 'number' &&
                positionLastMove.to === `translate(${newX[1]}px, ${newY[1]}px)`
              ) {
                setFenPosition(
                  updateFENForTake(lastFenPosition, lastAnimation.index)
                );
              }
            },
            () => {
              setTimeout(() => {
                draggedPiece.classList.remove('animate');
              }, 0);
              if (
                typeof lastAnimation?.index === 'number' &&
                positionLastMove.to === `translate(${newX[1]}px, ${newY[1]}px)`
              ) {
                setFenPosition(
                  updateFENForTake(lastFenPosition, lastAnimation?.index)
                );
              }
            }
          );
          setLastAnimation(currentAnimation);
        } else {
          draggedPiece.style.transform = `translate(${newX[1]}px, ${newY[1]}px)`;
          setDraggedIndex(null);
        }

        setPositionSelect('');
        setPositionCheck('');
        setIsSelect((prev) => !prev);
        setPositionLastMove({
          from: lastTranslate,
          to: `translate(${newX[1]}px, ${newY[1]}px)`,
        });

        if (positionLastMove.to === `translate(${newX[1]}px, ${newY[1]}px)`) {
          if (typeof lastAnimation?.index === 'number') {
            setLastFenPosition((prev) =>
              updateFENForTake(prev, lastAnimation?.index)
            );
            const lastPiece = pieceRefs.current[lastAnimation?.index];
            if (lastPiece) {
              lastPiece.classList.add('fade');
            }
          }
        }

        lastMoveToRef.current?.classList.remove('select');
        lastMoveFromRef.current?.classList.remove('select');
        checkRef.current?.classList.remove('select');
        if (draggableConfig.autoDistance) {
          setLastMoveType('select');
        }
      }
    } else {
      const pieceDiv = pieceRefs.current[index];
      if (
        draggedIndex !== null &&
        lastAnimation &&
        index === -1 &&
        boardRef.current &&
        lastMoveToRef.current
      ) {
        const draggedPiece = pieceRefs.current[draggedIndex];
        const boardDiv = boardRef.current;
        const rectBoard = boardDiv.getBoundingClientRect();
        const x = event.clientX - rectBoard.left;
        const y = event.clientY - rectBoard.top;

        if (
          x <= lastAnimation?.endPos[0] + squareSize &&
          x >= lastAnimation?.endPos[0] &&
          y <= lastAnimation?.endPos[1] + squareSize &&
          y >= lastAnimation?.endPos[1]
        ) {
          setIsDragging(true);
          setDraggedIndex(draggedIndex);
          setLastAnimation(null);
          lastAnimation.cancel();
          if (lastAnimationRef.current !== null) {
            lastAnimationRef.current.cancel();
          }
          setIsSelect(true);
          lastMoveToRef.current.classList.add('select');
          setLastTranslate(coordsToTranslate(lastAnimation?.endPos));
          if (draggableConfig.enabled && draggedPiece) {
            draggedPiece.classList.add('drag');
          }
        }
      }
      // select - from = to (piece selected)
      if (pieceDiv) {
        setLastTranslate(pieceDiv.style.transform.toString());
        if (
          draggedIndex === null ||
          draggedIndex === index ||
          (draggedIndex !== index && !isSelect)
        ) {
          setIsDragging(true);
          if (pieceDiv.style.transform === checkRef.current?.style.transform) {
            isCheck = true;
            checkRef.current.classList.add('select');
          }

          if (
            draggedIndex !== null &&
            lastAnimation &&
            lastMoveToRef.current &&
            pieceDiv.style.transform === lastMoveToRef.current.style.transform
          ) {
            const draggedPiece = pieceRefs.current[draggedIndex];

            setDraggedIndex(draggedIndex);
            setFenPosition(updateFENForTake(fenPosition, index));
            lastAnimation.cancel();
            if (lastAnimationRef.current !== null) {
              lastAnimationRef.current.cancel();
            }
            setIsSelect((prev) => !prev);
            lastMoveToRef.current.classList.add('select');
            draggedPiece?.classList.add('drag');
          } else {
            setDraggedIndex(index);
            const position = getTranslateCoords(pieceDiv.style.transform);
            const rect = pieceDiv.getBoundingClientRect();

            if (draggableConfig.enabled) {
              if (position) {
                const offsetX =
                  position[0] + eventType.clientX - rect.left - squareSize / 2;
                const offsetY =
                  position[1] + eventType.clientY - rect.top - squareSize / 2;
                setLastOffset([offsetX, offsetY]);
                if (
                  draggableConfig.distance === 0 ||
                  (draggableConfig.autoDistance && lastMoveType === 'drag')
                ) {
                  pieceDiv.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                }
              }
              pieceDiv.classList.add('drag');
            }

            if (position) {
              const newX = mapToRange(position[0], squareSize);
              const newY = mapToRange(position[1], squareSize);

              setIsSelect((prev) => !prev);
              if (
                positionLastMove.from ===
                `translate(${newX[1]}px, ${newY[1]}px)`
              ) {
                lastMoveFromRef.current?.classList.add('select');
              } else if (
                positionLastMove.to === `translate(${newX[1]}px, ${newY[1]}px)`
              ) {
                lastMoveToRef.current?.classList.add('select');
              } else if (!isCheck) {
                setPositionSelect(`translate(${newX[1]}px, ${newY[1]}px)`);
              }

              if (ghostRef.current) {
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
            }
          }
        } else if (pieceRefs.current[draggedIndex]) {
          // select - from: piece - to: piece
          if (isSelect) {
            const draggedPiece = pieceRefs.current[draggedIndex];

            pieceDiv.classList.add('fade');
            if (
              lastAnimation?.endPos[0] ===
                getTranslateCoords(pieceDiv.style.transform)[0] &&
              lastAnimation?.endPos[1] ===
                getTranslateCoords(pieceDiv.style.transform)[1]
            ) {
              if (typeof lastAnimation?.index === 'number') {
                const lastPiece = pieceRefs?.current[lastAnimation?.index];
                {
                  lastPiece?.classList.add('fade');
                }
                setLastFenPosition(
                  updateFENForTake(lastFenPosition, lastAnimation?.index)
                );
              }
            }

            if (animationConfig.enabled && animationConfig.duration > 0) {
              if (lastAnimation) {
                lastAnimation.cancel();
              }
              if (lastAnimationRef.current !== null) {
                lastAnimationRef.current.cancel();
              }
              draggedPiece.classList.add('animate');
              const currentAnimation = animateMove(
                draggedIndex,
                draggedPiece,
                getTranslateCoords(draggedPiece.style.transform),
                getTranslateCoords(pieceDiv.style.transform),
                animationConfig.duration,
                () => {
                  if (lastAnimation) {
                    if (
                      lastAnimation?.index &&
                      currentAnimation?.endPos[0] ===
                        lastAnimation?.endPos[0] &&
                      currentAnimation?.endPos[1] === lastAnimation?.endPos[1]
                    ) {
                      setFenPosition(
                        updateFENForTake(
                          updateFENForTake(
                            lastFenPosition,
                            lastAnimation?.index
                          ),
                          index
                        )
                      );
                    } else {
                      setFenPosition(updateFENForTake(lastFenPosition, index));
                    }
                  } else {
                    setFenPosition(updateFENForTake(lastFenPosition, index));
                  }
                  setTimeout(() => {
                    pieceDiv.classList.remove('fade');
                    draggedPiece.classList.remove('animate');
                  }, 0);
                  setLastAnimation(null);
                },
                () => {
                  if (lastAnimation) {
                    if (
                      lastAnimation?.index &&
                      currentAnimation?.endPos[0] ===
                        lastAnimation?.endPos[0] &&
                      currentAnimation?.endPos[1] === lastAnimation?.endPos[1]
                    ) {
                      setFenPosition(
                        updateFENForTake(
                          updateFENForTake(
                            lastFenPosition,
                            lastAnimation?.index
                          ),
                          index
                        )
                      );
                    } else {
                      setFenPosition(updateFENForTake(lastFenPosition, index));
                    }
                  } else {
                    setFenPosition(updateFENForTake(lastFenPosition, index));
                  }
                  setTimeout(() => {
                    pieceDiv.classList.remove('fade');
                    draggedPiece.classList.remove('animate');
                  }, 0);
                  setLastAnimation(null);
                }
              );
              setLastAnimation(currentAnimation);
            } else {
              draggedPiece.style.transform = pieceDiv.style.transform;
              setFenPosition(updateFENForTake(fenPosition, index));
              setDraggedIndex(null);
            }

            setLastFenPosition((prev) => updateFENForTake(prev, index));
            setPositionSelect('');
            setPositionCheck('');
            setIsSelect((prev) => !prev);
            setPositionLastMove({
              from: lastTranslate,
              to: pieceDiv.style.transform,
            });
            lastMoveToRef.current?.classList.remove('select');
            lastMoveFromRef.current?.classList.remove('select');
            checkRef.current?.classList.remove('select');

            if (draggableConfig.autoDistance) {
              setLastMoveType('select');
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

    if (draggableConfig.enabled) {
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

              if (distancePassed) {
                pieceDiv.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
              } else {
                if (
                  Math.hypot(lastOffset[0] - offsetX, lastOffset[1] - offsetY) >
                    draggableConfig.distance ||
                  (draggableConfig.autoDistance && lastMoveType === 'drag')
                ) {
                  pieceDiv.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                  distancePassed = true;
                }
              }
            }
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
        if (position) {
          {
            const newX = mapToRange(position[0], squareSize);
            const newY = mapToRange(position[1], squareSize);

            if (
              position[0] < -squareSize / 2 ||
              position[1] < -squareSize / 2 ||
              position[0] > squareSize * 7 + squareSize / 2 ||
              position[1] > squareSize * 7 + squareSize / 2
            ) {
              if (draggableConfig.deleteOnDropOff) {
                setFenPosition(updateFENForTake(fenPosition, draggedIndex));
              }
              if (ghostRef.current) {
                ghostRef.current.style.visibility = 'hidden';
              }
              pieceDiv.style.transform = lastTranslate;
              setDraggedIndex(null);
              setPositionSelect('');
              setIsSelect(false);
              lastMoveToRef.current?.classList.remove('select');
              lastMoveFromRef.current?.classList.remove('select');
              checkRef.current?.classList.remove('select');
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
                    isPieceTakenByDrag = true;

                    if (lastAnimation) {
                      lastAnimation.cancel();
                      if (lastAnimationRef.current !== null) {
                        lastAnimationRef.current.cancel();
                      }
                      if (pieceRef.style.transform === positionLastMove.to) {
                        if (typeof lastAnimation?.index === 'number') {
                          setFenPosition(
                            updateFENForTake(
                              lastFenPosition,
                              lastAnimation?.index
                            )
                          );
                          setLastFenPosition(
                            updateFENForTake(
                              lastFenPosition,
                              lastAnimation?.index
                            )
                          );
                        }
                      } else {
                        setFenPosition(
                          updateFENForTake(lastFenPosition, parseInt(key, 10))
                        );
                        setLastFenPosition(
                          updateFENForTake(lastFenPosition, parseInt(key, 10))
                        );
                      }
                    } else {
                      setFenPosition(
                        updateFENForTake(fenPosition, parseInt(key, 10))
                      );
                      setLastFenPosition(
                        updateFENForTake(fenPosition, parseInt(key, 10))
                      );
                    }

                    setLastAnimation(null);
                    setDraggedIndex(null);
                    setLastMoveType('drag');
                  }
                }
              });
              if (lastTranslate !== `translate(${newX[1]}px, ${newY[1]}px)`) {
                setDraggedIndex(null);
              }

              // drag - from: piece - to: empty
              pieceDiv.style.transform = `translate(${newX[1]}px, ${newY[1]}px)`;
              if (lastTranslate !== pieceDiv.style.transform) {
                if (!isPieceTakenByDrag) {
                  if (lastAnimation) {
                    lastAnimation.cancel();
                    setLastAnimation(null);
                  }
                  if (lastAnimationRef.current !== null) {
                    lastAnimationRef.current.cancel();
                  }
                  if (
                    pieceDiv.style.transform === positionLastMove.to &&
                    typeof lastAnimation?.index === 'number'
                  ) {
                    pieceDiv.style.transform = `translate(${newX[1]}px, ${newY[1]}px)`;
                    if (draggedIndex !== lastAnimation?.index) {
                      setFenPosition(
                        updateFENForTake(lastFenPosition, lastAnimation?.index)
                      );
                      setLastFenPosition(
                        updateFENForTake(lastFenPosition, lastAnimation?.index)
                      );
                    }
                  }
                }
                setPositionSelect('');
                setPositionCheck('');
                setIsSelect(false);
                setLastMoveType('drag');
                setPositionLastMove({
                  from: lastTranslate,
                  to: pieceDiv.style.transform,
                });
                lastMoveToRef.current?.classList.remove('select');
                lastMoveFromRef.current?.classList.remove('select');
                checkRef.current?.classList.remove('select');
              }

              if (!isSelect) {
                lastMoveToRef.current?.classList.remove('select');
                lastMoveFromRef.current?.classList.remove('select');
                checkRef.current?.classList.remove('select');
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
          {positionCheck && (
            <div
              className="ljdr-square ljdr-check"
              ref={checkRef}
              style={{
                transform: positionCheck,
              }}
            ></div>
          )}
          {positionSelect && (
            <div
              className="ljdr-square select"
              ref={selectRef}
              style={{
                transform: positionSelect,
              }}
            ></div>
          )}
          {positionLastMove.from && positionLastMove.to && (
            <>
              <div
                className="ljdr-square ljdr-last-move"
                ref={lastMoveToRef}
                style={{
                  transform: positionLastMove.to,
                }}
              ></div>
              <div
                className="ljdr-square ljdr-last-move"
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

            for (let i = 0; i < fenPosition.length; i++) {
              const char = fenPosition[i];

              if (char === '/') {
                row += 1;
                col = 0;
              } else if (DIGITS.includes(char)) {
                col += parseInt(char);
              } else {
                let x = 0;
                let y = 0;
                if (orientation === 'white') {
                  x = col * squareSize;
                  y = row * squareSize;
                } else if (orientation === 'black') {
                  x = (7 - col) * squareSize;
                  y = (7 - row) * squareSize;
                }

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
        {coordinates && (
          <>
            <div className="coords ranks" ref={ranksRef}>
              {ranks.map((rank) => (
                <div className="coord" key={rank}>
                  {orientation === 'white'
                    ? rank
                    : orientation === 'black'
                    ? 9 - rank
                    : ''}
                </div>
              ))}
            </div>
            <div className="coords files" ref={filesRef}>
              {files.map((file, index) => (
                <div className="coord" key={file}>
                  {orientation === 'white'
                    ? file
                    : orientation === 'black'
                    ? files[7 - index]
                    : ''}
                </div>
              ))}
            </div>
          </>
        )}
        {draggableConfig.showGhost && (
          <div
            className="ljdr-ghost"
            ref={ghostRef}
            style={{
              visibility: 'hidden',
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default memo(ChessBoard);
