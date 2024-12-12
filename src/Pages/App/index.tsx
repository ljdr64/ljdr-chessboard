import React from 'react';
import ChessBoard from '../../Components/ChessBoard';

import './styles.css';

const App: React.FC = () => {
  const initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const squareSize = 60;
  const transitionDuration = '0.2s';
  const draggableConfigBoard1 = {
    distance: 120,
    showGhost: false,
    deleteOnDropOff: true,
  };
  const draggableConfigBoard2 = {
    distance: 0,
  };

  return (
    <div className="board-main">
      <div className="board-container">
        <ChessBoard
          id={'board-1'}
          initialFEN={initialFEN}
          squareSize={squareSize}
          transitionDuration={transitionDuration}
          draggable={draggableConfigBoard1}
        />
      </div>
      <div className="board-container">
        <ChessBoard
          id={'board-2'}
          initialFEN={initialFEN}
          squareSize={squareSize}
          transitionDuration={transitionDuration}
          draggable={draggableConfigBoard2}
        />
      </div>
    </div>
  );
};

export default App;
