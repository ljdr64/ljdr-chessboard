import React from 'react';
import ChessBoard from '../../Components/ChessBoard';

import './styles.css';

const App: React.FC = () => {
  return (
    <div className="board-main">
      <div className="board-container">
        <ChessBoard
          id={'board-1'}
          orientation="white"
          lastMove={['e2', 'e3']}
          coordinates={false}
          animation={{ enabled: true, duration: 500 }}
          draggable={{
            distance: 3,
            showGhost: false,
            deleteOnDropOff: true,
          }}
        />
      </div>
      <div className="board-container">
        <ChessBoard
          id={'board-2'}
          draggable={{
            distance: 5,
            autoDistance: false,
          }}
        />
      </div>
    </div>
  );
};

export default App;
