import React from 'react';
import styled from 'styled-components';

interface FormContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const Container = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormCard = styled.div`
  margin-top: 35px;
  background: var(--color-white);
  padding: 50px;
  border-radius: var(--border-radius-md);
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-md);

  @media (max-width: 600px) {
    padding: var(--spacing-lg);
    margin-top: 20px;
  }
`;

const Logo = styled.img`
  display: block;
  margin: 0 auto 2rem auto;
  max-width: 280px;
  height: auto;

  @media (max-width: 600px) {
    max-width: 200px;
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h2`
  margin-bottom: var(--spacing-lg);
  text-align: center;
  color: var(--color-primary);
  font-size: 1.5rem;
  font-weight: 600;
`;

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  title,
  className
}) => {
  return (
    <Container className={className}>
      <FormCard>
        <Logo src="/logo-welcome.png" alt="Clio Logo" />
        {title && <Title>{title}</Title>}
        {children}
      </FormCard>
    </Container>
  );
};