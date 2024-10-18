import React from 'react';
import ChessBoard from '../../Components/ChessBoard';

const App: React.FC = () => {
  const initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const squareSize = 60;
  const transitionDuration = '0.2s';
  return (
    <>
      <div
        style={{ width: 'fit-content', height: 'fit-content', padding: '20px' }}
      >
        <ChessBoard
          initialFEN={initialFEN}
          squareSize={squareSize}
          transitionDuration={transitionDuration}
        />
      </div>
      <div
        style={{ width: 'fit-content', height: 'fit-content', padding: '20px' }}
      >
        <ChessBoard
          initialFEN={initialFEN}
          squareSize={squareSize}
          transitionDuration={transitionDuration}
        />
      </div>
    </>
  );
};

export default App;
