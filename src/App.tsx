import React from 'react';

import './App.css';

import { ConfigContainer } from './containers/ConfigContainer';
import { WorldContainer } from './containers/WorldContainer';

const App = () => {
    return (
        <div className="flex-container-column">
            <div className="flex-item"><WorldContainer /></div>
            <div className="flex-item"><ConfigContainer /></div>
        </div>
    );
}

export default App;
