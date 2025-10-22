import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewMode = 'standard' | 'wide';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

interface ViewModeProviderProps {
  children: ReactNode;
}

export const ViewModeProvider: React.FC<ViewModeProviderProps> = ({ children }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // Recuperar desde localStorage o usar 'standard' por defecto
    const savedMode = localStorage.getItem('viewMode');
    return (savedMode === 'wide' || savedMode === 'standard') ? savedMode : 'standard';
  });

  useEffect(() => {
    // Guardar en localStorage cuando cambie
    console.log('ViewMode changed to:', viewMode);
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const setViewMode = (mode: ViewMode) => {
    console.log('setViewMode called with:', mode);
    setViewModeState(mode);
  };

  const toggleViewMode = () => {
    setViewModeState(prev => prev === 'standard' ? 'wide' : 'standard');
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = (): ViewModeContextType => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode debe ser usado dentro de ViewModeProvider');
  }
  return context;
};
