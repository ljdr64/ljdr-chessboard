import React from 'react';
import ChessBoard from '../../Components/ChessBoard';

import './styles.css';

const App: React.FC = () => {
  const initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const squareSize = 60;
  const transitionDuration = '0.2s';
  return (
    <div className="board-main">
      <div className="board-container">
        <ChessBoard
          id={'board-1'}
          initialFEN={initialFEN}
          squareSize={squareSize}
          transitionDuration={transitionDuration}
        />
      </div>
      <div className="board-container">
        <ChessBoard
          id={'board-2'}
          initialFEN={initialFEN}
          squareSize={squareSize}
          transitionDuration={transitionDuration}
        />
      </div>
    </div>
  );
};

export default App;
