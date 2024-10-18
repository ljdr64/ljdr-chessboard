import React from 'react';
import ChessBoard from '../../Components/ChessBoard';

const App: React.FC = () => {
  const initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const initialFEN2 =
    'nnnnkbbb/nnnnbbbb/8/8/8/8/NNNNBBBB/NNNNKBBB w KQkq - 0 1';
  const initialFEN3 =
    'qqqqkrrr/qqqqrrrr/8/8/8/8/QQQQRRRR/QQQQKRRR w KQkq - 0 1';
  const squareSize = 50;
  const squareSize2 = 60;
  const squareSize3 = 70;
  const transitionDuration = '0.1s';
  const transitionDuration2 = '0.2s';
  const transitionDuration3 = '0.3s';
  return (
    <>
      <div
        style={{ width: 'fit-content', height: 'fit-content', padding: '20px' }}
      >
        <p style={{ marginBottom: '10px' }}>FEN : {initialFEN}</p>
        <ChessBoard
          initialFEN={initialFEN}
          squareSize={squareSize}
          transitionDuration={transitionDuration}
        />
      </div>
      <div
        style={{ width: 'fit-content', height: 'fit-content', padding: '20px' }}
      >
        <p style={{ marginBottom: '10px' }}>FEN : {initialFEN2}</p>
        <ChessBoard
          initialFEN={initialFEN2}
          squareSize={squareSize2}
          transitionDuration={transitionDuration2}
        />
      </div>
      <div
        style={{ width: 'fit-content', height: 'fit-content', padding: '20px' }}
      >
        <p style={{ marginBottom: '10px' }}>FEN : {initialFEN3}</p>
        <ChessBoard
          initialFEN={initialFEN3}
          squareSize={squareSize3}
          transitionDuration={transitionDuration3}
        />
      </div>
    </>
  );
};

export default App;
