import React from 'react';
import ReactDOM from 'react-dom/client';
import BotComponent from './BotComponent';
import './globals.css';

const renderMyComponent = (elementId, props) => {
    const container = document.getElementById(elementId);
    const root = ReactDOM.createRoot(container);
    root.render(<BotComponent {...props}  />);

};

export { renderMyComponent };