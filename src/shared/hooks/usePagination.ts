import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook para manejar paginación de listas
 * @param items - Array de items a paginar
 * @param defaultItemsPerPage - Cantidad de items por página (default: 10)
 * @returns Objeto con datos de paginación y funciones de control
 */
export const usePagination = <T>(
  items: T[],
  defaultItemsPerPage: number = 10
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    return { totalPages, startIndex, endIndex, currentItems };
  }, [items, currentPage, itemsPerPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationData.totalPages)));
  }, [paginationData.totalPages]);

  const changeItemsPerPage = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  return {
    ...paginationData,
    currentPage,
    itemsPerPage,
    goToPage,
    changeItemsPerPage
  };
};
