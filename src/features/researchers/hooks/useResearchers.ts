import { useState, useEffect, useCallback } from 'react';
import { Researcher, CreateResearcherRequest, UpdateResearcherRequest, ThematicLine } from '../types';
import { PaginationParams } from '../../../shared/types';
import { researcherService } from '../services';

export const useResearchers = (params?: PaginationParams) => {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResearchers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await researcherService.getAll(params);
      setResearchers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading researchers');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchResearchers();
  }, [fetchResearchers]);

  const createResearcher = useCallback(async (data: CreateResearcherRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const newResearcher = await researcherService.create(data);
      setResearchers(prev => [newResearcher, ...prev]);

      return newResearcher;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating researcher';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateResearcher = useCallback(async (data: UpdateResearcherRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const { id, ...updateData } = data;
      const updatedResearcher = await researcherService.update(id, updateData);
      setResearchers(prev =>
        prev.map(r => r.id === id ? updatedResearcher : r)
      );

      return updatedResearcher;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating researcher';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteResearcher = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await researcherService.delete(id);
      setResearchers(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting researcher';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    researchers,
    isLoading,
    error,
    createResearcher,
    updateResearcher,
    deleteResearcher,
    refetch: fetchResearchers,
  };
};

export const useThematicLines = () => {
  const [thematicLines, setThematicLines] = useState<ThematicLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThematicLines = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await researcherService.getThematicLines();
      setThematicLines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading thematic lines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActiveThematicLines = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await researcherService.getActiveThematicLines();
      setThematicLines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading active thematic lines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThematicLines();
  }, [fetchThematicLines]);

  return {
    thematicLines,
    isLoading,
    error,
    fetchActiveOnly: fetchActiveThematicLines,
    refetch: fetchThematicLines,
  };
};