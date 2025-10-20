import React from 'react';
import styled from 'styled-components';

interface TextAreaProps {
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  hasError?: boolean;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

const TextAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StyledTextArea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.hasError ? '#dc3545' : '#ccc'};
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

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

export const TextArea: React.FC<TextAreaProps> = React.memo(({
  error,
  hasError,
  rows = 3,
  ...props
}) => {
  return (
    <TextAreaWrapper>
      <StyledTextArea
        hasError={hasError || !!error}
        rows={rows}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </TextAreaWrapper>
  );
});