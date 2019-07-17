import React from 'react';
import './App.css';
import GameBoard from './components/GameBoard';

const App: React.FC = (): JSX.Element => {
    return (
        <div className="App">
            <GameBoard />
        </div>
    );
};

export default App;
