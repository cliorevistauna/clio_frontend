import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const StyledButton = styled.button<ButtonProps>`
  padding: ${props => {
    switch (props.size) {
      case 'small': return '0.5rem 1rem';
      case 'large': return '1rem 2rem';
      default: return '0.75rem 1.5rem';
    }
  }};

  font-size: ${props => {
    switch (props.size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};

  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: ${props => props.size === 'small' ? 'auto' : '120px'};

  background: ${props => {
    switch (props.variant) {
      case 'secondary': return '#6c757d';
      case 'danger': return '#dc3545';
      default: return '#034991';
    }
  }};

  color: white;

  &:hover:not(:disabled) {
    background: ${props => {
      switch (props.variant) {
        case 'secondary': return '#5a6268';
        case 'danger': return '#c82333';
        default: return '#023670';
      }
    }};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  ...props
}) => {
  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
    >
      {loading ? 'Cargando...' : children}
    </StyledButton>
  );
};