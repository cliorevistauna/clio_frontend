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
        {title && <Title>{title}</Title>}
        {children}
      </FormCard>
    </Container>
  );
};