/**
 * Handles the movement animation of a chess piece and allows for abrupt termination.
 *
 * @param pieceDiv - The reference to the piece element being moved.
 * @param startPos - The starting position of the piece as an array [x, y].
 * @param endPos - The target position of the piece as an array [x, y].
 * @param duration - The duration of the animation in milliseconds.
 * @param onComplete - A callback function to be called when the animation completes successfully.
 * @param onCancel - A callback function to be called when the animation is canceled abruptly.
 *
 * @returns A function that can be called to abruptly finish the animation and set the piece to its final position.
 */
export const animateMove = (
  pieceDiv: HTMLDivElement | null,
  startPos: [number, number],
  endPos: [number, number],
  duration: number,
  onComplete?: () => void,
  onCancel?: () => void
) => {
  if (!pieceDiv) return;

  let startTime: number;
  let animationFrame: number;

  const easeInOut = (t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;

    const progress = (timestamp - startTime) / duration; // Movement progress (from 0 to 1)
    const easedProgress = easeInOut(progress); // Apply easing function

    if (progress < 1) {
      const newX = startPos[0] + (endPos[0] - startPos[0]) * easedProgress;
      const newY = startPos[1] + (endPos[1] - startPos[1]) * easedProgress;

      if (pieceDiv) {
        pieceDiv.style.transform = `translate(${newX}px, ${newY}px)`;
      }

      animationFrame = requestAnimationFrame(animate); // Continue animating
    } else {
      if (pieceDiv) {
        pieceDiv.style.transform = `translate(${endPos[0]}px, ${endPos[1]}px)`;
      }
      onComplete?.();
    }
  };

  animationFrame = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationFrame);
    if (pieceDiv) {
      pieceDiv.style.transform = `translate(${endPos[0]}px, ${endPos[1]}px)`;
    }
    onCancel?.();
  };
};
