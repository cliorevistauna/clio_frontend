import React from 'react';
import styled from 'styled-components';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale/es';

// Registrar locale en español
registerLocale('es', es);

interface DateInputProps {
  value: string; // Formato DD-MM-YYYY
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const InputWrapper = styled.div`
  position: relative;
  width: 100%;

  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container {
    width: 100%;
  }
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 8px 12px;
  padding-right: 35px;
  border: 1px solid ${props => props.hasError ? '#dc3545' : '#ced4da'};
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#007bff'};
    box-shadow: 0 0 0 0.2rem ${props => props.hasError ? 'rgba(220, 53, 69, 0.25)' : 'rgba(0, 123, 255, 0.25)'};
  }

  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
`;

const CalendarIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6c757d;
  font-size: 16px;
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
`;

/**
 * Input de fecha con calendario
 * - Formato DD-MM-YYYY para Costa Rica
 * - Calendario visual para seleccionar fecha
 * - Convierte internamente entre DD-MM-YYYY y Date object
 */
export const DateInput: React.FC<DateInputProps> = React.memo(({
  value,
  onChange,
  disabled = false,
  required = false,
  error
}) => {
  // Convertir DD-MM-YYYY a Date object
  const stringToDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    const parts = dateString.split('-');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    // Validar que la fecha sea válida
    if (
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== year
    ) {
      return null;
    }

    return date;
  };

  // Convertir Date object a DD-MM-YYYY
  const dateToString = (date: Date | null): string => {
    if (!date) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const selectedDate = stringToDate(value);

  const handleChange = (date: Date | null) => {
    onChange(dateToString(date));
  };

  return (
    <InputWrapper>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="dd-MM-yyyy"
        locale="es"
        disabled={disabled}
        customInput={
          <StyledInput
            hasError={!!error}
            placeholder="DD-MM-YYYY"
          />
        }
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        yearDropdownItemNumber={100}
        scrollableYearDropdown
      />
      <CalendarIcon>📅</CalendarIcon>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
});
