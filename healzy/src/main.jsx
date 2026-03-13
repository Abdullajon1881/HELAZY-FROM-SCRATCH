import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './app/styles/globals.css';
import { useUIStore } from './features/ui/store';

// Apply saved theme on load
const theme = useUIStore.getState().theme || 'light';
document.documentElement.setAttribute('data-theme', theme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

