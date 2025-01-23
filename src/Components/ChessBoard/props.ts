export interface ChessGameProps {
  id?: string;
  fen?: string;
  orientation?: string;
  turnColor?: string;
  check?: string | boolean;
  lastMove?: string[];
  coordinates?: boolean;
  squareSize?: number;
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  draggable?: {
    enabled?: boolean;
    distance?: number;
    autoDistance?: boolean;
    showGhost?: boolean;
    deleteOnDropOff?: boolean;
  };
}

export const defaultId = 'default-id';
export const defaultFEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export const defaultOrientation = 'white';
export const defaultTurnColor = 'white';
export const defaultCheck = false;
export const defaultLastMove = ['', ''];
export const defaultCoordinates = true;
export const defaultSquareSize = 60;
export const defaultAnimation = {
  enabled: true,
  duration: 200,
};
export const defaultDraggable = {
  enabled: true,
  distance: 3,
  autoDistance: true,
  showGhost: true,
  deleteOnDropOff: false,
};
