export interface ChessGameProps {
  id?: string;
  fen?: string;
  squareSize?: number;
  transitionDuration?: string;
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
export const defaultSquareSize = 60;
export const defaultTransitionDuration = '0.2s';
export const defaultDraggable = {
  enabled: true,
  distance: 3,
  autoDistance: true,
  showGhost: true,
  deleteOnDropOff: false,
};
