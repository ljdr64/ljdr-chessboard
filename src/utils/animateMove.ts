/**
 * Animates the movement of a chess piece from one position to another using the translate property.
 * The animation uses an ease-in-out effect.
 *
 * @param pieceDiv - The reference to the chess piece element (HTMLDivElement) that will be moved. It can be null if not yet assigned.
 * @param startPos - The starting position of the piece as an array [x, y].
 * @param endPos - The target position of the piece as an array [x, y].
 * @param duration - The duration of the animation in milliseconds.
 * @param onFinish - A callback function that is called when the animation finishes.
 */
export const animateMove = (
  pieceDiv: HTMLDivElement | null,
  startPos: [number, number],
  endPos: [number, number],
  duration: number,
  onFinish?: () => void
) => {
  if (!pieceDiv) return;

  let startTime: number;

  // Ease-in-out function for smoother transition
  const easeInOut = (t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  // Animation function to move the piece
  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;

    const progress = (timestamp - startTime) / duration; // Movement progress (from 0 to 1)
    const easedProgress = easeInOut(progress); // Apply easing function

    if (progress < 1) {
      // Calculate the new position based on eased progress
      const newX = startPos[0] + (endPos[0] - startPos[0]) * easedProgress;
      const newY = startPos[1] + (endPos[1] - startPos[1]) * easedProgress;

      // Apply the new position
      if (pieceDiv) {
        pieceDiv.style.transform = `translate(${newX}px, ${newY}px)`;
      }

      requestAnimationFrame(animate); // Continue animating
    } else {
      // When progress reaches 1, apply the final position
      if (pieceDiv) {
        pieceDiv.style.transform = `translate(${endPos[0]}px, ${endPos[1]}px)`;
      }
      onFinish?.(); // Call the callback function when the animation finishes
    }
  };

  // Start the animation
  requestAnimationFrame(animate);
};
