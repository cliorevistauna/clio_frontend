import React from 'react';
import styled from 'styled-components';

interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  className?: string;
  error?: string;
}

const FieldWrapper = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const RequiredIndicator = styled.span`
  color: #dc3545;
  margin-left: 0.25rem;
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
`;

export const FormField = React.memo<FormFieldProps>(({
  children,
  label,
  required = false,
  className,
  error
}) => {
  return (
    <FieldWrapper className={className}>
      {label && (
        <Label>
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </Label>
      )}
      {children}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FieldWrapper>
  );
});