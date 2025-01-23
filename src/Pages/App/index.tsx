import React from 'react';
import ChessBoard from '../../Components/ChessBoard';

import './styles.css';

const App: React.FC = () => {
  return (
    <div className="board-main">
      <div className="board-container">
        <ChessBoard
          id={'board-1'}
          orientation={'black'}
          turnColor={'white'}
          check={true}
          lastMove={['e2', 'e3']}
          coordinates={true}
          animation={{ enabled: true, duration: 2000 }}
          draggable={{
            distance: 3,
            showGhost: true,
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
