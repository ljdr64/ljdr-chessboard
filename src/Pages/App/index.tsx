import React from 'react';
import ChessBoard from '../../Components/ChessBoard';

import './styles.css';

const App: React.FC = () => {
  const draggableConfigBoard1 = {
    distance: 3,
    showGhost: false,
    deleteOnDropOff: true,
  };
  const draggableConfigBoard2 = {
    distance: 3,
    autoDistance: false,
  };

  return (
    <div className="board-main">
      <div className="board-container">
        <ChessBoard id={'board-1'} draggable={draggableConfigBoard1} />
      </div>
      <div className="board-container">
        <ChessBoard id={'board-2'} draggable={draggableConfigBoard2} />
      </div>
    </div>
  );
};

export default App;
