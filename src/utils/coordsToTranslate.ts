/**
 * Converts an array of two numbers into a CSS translate string.
 *
 * @param coords - An array of two numbers [x, y] representing the coordinates.
 * @returns A string in the format `translate(xpx, ypx)`.
 * @throws If the array does not contain exactly two numbers.
 */
export const coordsToTranslate = (coords: [number, number]): string => {
  if (coords.length !== 2) {
    throw new Error('The input array must have exactly two numbers.');
  }
  const [x, y] = coords;
  return `translate(${x}px, ${y}px)`;
};
