import React from 'react';
import styled from 'styled-components';

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
  return (
    <LayoutContainer className={className}>
      {children}
    </LayoutContainer>
  );
};