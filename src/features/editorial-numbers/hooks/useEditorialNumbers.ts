import { useState, useEffect, useCallback } from 'react';
import { EditorialNumber, CreateEditorialNumberRequest, UpdateEditorialNumberRequest } from '../types';
import { PaginationParams } from '../../../shared/types';
import { editorialNumberService } from '../services';

export const useEditorialNumbers = (params?: PaginationParams) => {
  const [editorialNumbers, setEditorialNumbers] = useState<EditorialNumber[]>([]);
  const [currentEditorialNumber, setCurrentEditorialNumber] = useState<EditorialNumber | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEditorialNumbers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await editorialNumberService.getAll(params);
      setEditorialNumbers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading editorial numbers');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  const fetchCurrentEditorialNumber = useCallback(async () => {
    try {
      const current = await editorialNumberService.getCurrentEditorialNumber();
      setCurrentEditorialNumber(current);
    } catch (err) {
      console.error('Error fetching current editorial number:', err);
      setCurrentEditorialNumber(null);
    }
  }, []);

  useEffect(() => {
    fetchEditorialNumbers();
    fetchCurrentEditorialNumber();
  }, [fetchEditorialNumbers, fetchCurrentEditorialNumber]);

  const createEditorialNumber = useCallback(async (data: CreateEditorialNumberRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const newEditorialNumber = await editorialNumberService.create(data);
      setEditorialNumbers(prev => [newEditorialNumber, ...prev]);

      return newEditorialNumber;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating editorial number';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEditorialNumber = useCallback(async (data: UpdateEditorialNumberRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedEditorialNumber = await editorialNumberService.update(data);
      setEditorialNumbers(prev =>
        prev.map(en => en.id === data.id ? updatedEditorialNumber : en)
      );

      if (currentEditorialNumber?.id === data.id) {
        setCurrentEditorialNumber(updatedEditorialNumber);
      }

      return updatedEditorialNumber;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating editorial number';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentEditorialNumber]);

  const deleteEditorialNumber = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      await editorialNumberService.delete(id);
      setEditorialNumbers(prev => prev.filter(en => en.id !== id));

      if (currentEditorialNumber?.id === id) {
        setCurrentEditorialNumber(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting editorial number';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentEditorialNumber]);

  return {
    editorialNumbers,
    currentEditorialNumber,
    isLoading,
    error,
    createEditorialNumber,
    updateEditorialNumber,
    deleteEditorialNumber,
    refetch: fetchEditorialNumbers,
  };
};