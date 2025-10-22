import React from 'react';
import styled from 'styled-components';
import { useViewMode } from '../../contexts/ViewModeContext';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const LayoutContainer = styled.div`
  background-color: var(--color-background);
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

export const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  const { viewMode } = useViewMode();

  // Combinar clases: app-layout + wide-layout (si está en modo wide) + className adicional
  const combinedClassName = `app-layout ${viewMode === 'wide' ? 'wide-layout' : ''} ${className || ''}`.trim();

  console.log('AppLayout - viewMode:', viewMode, 'combinedClassName:', combinedClassName);

  return (
    <LayoutContainer className={combinedClassName}>
      {children}
    </LayoutContainer>
  );
};