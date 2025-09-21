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
  background: #fff;
  padding: 50px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.1);

  @media (max-width: 600px) {
    padding: 1.5rem;
    margin-top: 20px;
  }
`;

const Logo = styled.img`
  display: block;
  margin: 0 auto 2rem auto;
  max-width: 180px;
  height: auto;

  @media (max-width: 600px) {
    max-width: 140px;
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  text-align: center;
  color: #034991;
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
        <Logo src="/logo.png" alt="Clio Logo" />
        {title && <Title>{title}</Title>}
        {children}
      </FormCard>
    </Container>
  );
};