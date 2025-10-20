import React from 'react';
import { useViewMode } from '../contexts/ViewModeContext';
import './ViewToggle.css';

export const ViewToggle: React.FC = () => {
  const { viewMode, setViewMode } = useViewMode();

  const handleStandardClick = () => {
    console.log('Cambiando a vista estándar');
    setViewMode('standard');
  };

  const handleWideClick = () => {
    console.log('Cambiando a vista ampliada');
    setViewMode('wide');
  };

  console.log('ViewToggle rendered, current mode:', viewMode);

  return (
    <div className="view-toggle-container">
      <button
        className={`view-toggle-btn ${viewMode === 'standard' ? 'active' : ''}`}
        onClick={handleStandardClick}
        aria-label="Vista estándar"
        type="button"
      >
        Vista Estándar
      </button>
      <span className="view-toggle-separator">|</span>
      <button
        className={`view-toggle-btn ${viewMode === 'wide' ? 'active' : ''}`}
        onClick={handleWideClick}
        aria-label="Vista ampliada"
        type="button"
      >
        <svg
          className="view-toggle-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        Vista Ampliada
      </button>
    </div>
  );
};
