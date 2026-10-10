import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Désactiver complètement tous les logs, avertissements et erreurs dans la console du navigateur
console.log = () => {};
console.warn = () => {};
console.error = () => {};
console.info = () => {};
console.debug = () => {};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
