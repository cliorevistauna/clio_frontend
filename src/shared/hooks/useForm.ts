import { useState, useCallback } from 'react';
import { FormState, FormErrors } from '../types';

interface UseFormOptions {
  initialValues?: FormState;
  validate?: (values: FormState) => FormErrors;
  onSubmit?: (values: FormState) => void | Promise<void>;
}

export const useForm = (options: UseFormOptions = {}) => {
  const { initialValues = {}, validate, onSubmit } = options;

  const [values, setValues] = useState<FormState>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const validateForm = useCallback(() => {
    if (!validate) return true;

    const formErrors = validate(values);
    setErrors(formErrors);

    return Object.keys(formErrors).length === 0;
  }, [validate, values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    if (!onSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, values]);

  const getFieldProps = useCallback((name: string) => ({
    name,
    value: values[name] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(name, e.target.value);
    },
    error: errors[name],
    hasError: !!errors[name],
  }), [values, errors, setValue]);

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    setFieldError,
    clearErrors,
    reset,
    validateForm,
    handleSubmit,
    getFieldProps,
  };
};