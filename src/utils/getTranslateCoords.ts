/**
 * Extracts the x and y coordinates from a translate string.
 * @param translateString - A string representing a CSS translate value, e.g., 'translate(240px, 360px)'
 * @returns An array containing the x and y coordinates as numbers.
 */
export const getTranslateCoords = (
  translateString: string
): [number, number] => {
  // Split the translate string once and store the result in a variable
  const splitValues = translateString.split('px');

  // Extract the x and y coordinates as floats from the split values
  const numX = parseFloat(splitValues[0].split('(')[1]);
  const numY = parseFloat(splitValues[1].split(' ')[1]);

  return [numX, numY];
};
