import React from 'react';
import styled from 'styled-components';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'date';
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hasError?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.hasError ? '#dc3545' : '#ccc'};
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: ${props => props.hasError ? '#dc3545' : '#034991'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(220, 53, 69, 0.2)' : 'rgba(3, 73, 145, 0.2)'};
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 0.875rem;
`;

export const Input: React.FC<InputProps> = ({
  error,
  hasError,
  ...props
}) => {
  return (
    <InputWrapper>
      <StyledInput
        hasError={hasError || !!error}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};