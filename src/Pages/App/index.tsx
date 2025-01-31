import React from 'react';
import ChessBoard from '../../Components/ChessBoard';

import './styles.css';

const App: React.FC = () => {
  return (
    <div className="board-main">
      <div className="board-container">
        <ChessBoard
          id={'board-1'}
          orientation={'white'}
          turnColor={'white'}
          check={true}
          lastMove={['e2', 'e4']}
          coordinates={true}
          animation={{ enabled: true, duration: 2000 }}
          draggable={{
            distance: 3,
            showGhost: true,
            deleteOnDropOff: true,
          }}
          events={{
            moves: [
              'd2safasfd4',
              'c2c4',
              'd7d5',
              'casd2csda4',
              'g1f3',
              'g8f6',
              'esdf7e6',
              'g1sfdsf3',
              'd5sdfsdc4',
              'd2d4',
            ],
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
