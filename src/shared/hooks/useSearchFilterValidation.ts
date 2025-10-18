import { useState, useCallback } from 'react';

export interface SearchFilterValidationState {
  isOpen: boolean;
  filterTerm: string;
  onAddFilter: (() => void) | null;
  onSearch: (() => void) | null;
}

/**
 * Hook personalizado para validar filtros sin guardar antes de realizar una búsqueda.
 *
 * @returns Estado del diálogo y función de validación
 *
 * @example
 * ```tsx
 * const { dialogState, validateAndSearch, handleConfirm, handleCancel } = useSearchFilterValidation();
 *
 * // En el JSX
 * <ConfirmDialog
 *   isOpen={dialogState.isOpen}
 *   message={`Tiene filtros sin guardar: "${dialogState.filterTerm}"\n\n¿Desea guardarlos antes de buscar?`}
 *   confirmText="Sí"
 *   cancelText="No"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 *
 * // Al hacer búsqueda
 * const handleSearch = () => {
 *   validateAndSearch(filterTerm, () => addFilter(filterTerm), () => performSearch());
 * };
 * ```
 */
export const useSearchFilterValidation = () => {
  const [dialogState, setDialogState] = useState<SearchFilterValidationState>({
    isOpen: false,
    filterTerm: '',
    onAddFilter: null,
    onSearch: null
  });

  /**
   * Valida si hay filtros sin guardar y muestra el diálogo de confirmación
   *
   * @param filterTerm - Texto del filtro sin guardar
   * @param onAddFilter - Callback para agregar el filtro
   * @param onSearch - Callback para realizar la búsqueda
   */
  const validateAndSearch = useCallback((
    filterTerm: string,
    onAddFilter: () => void,
    onSearch: () => void
  ) => {
    if (filterTerm.trim()) {
      // Mostrar diálogo de confirmación
      setDialogState({
        isOpen: true,
        filterTerm: filterTerm.trim(),
        onAddFilter,
        onSearch
      });
    } else {
      // Si no hay filtro sin guardar, realizar búsqueda directamente
      onSearch();
    }
  }, []);

  /**
   * Maneja la confirmación del usuario (Sí)
   */
  const handleConfirm = useCallback(() => {
    if (dialogState.onAddFilter) {
      dialogState.onAddFilter();
    }
    if (dialogState.onSearch) {
      dialogState.onSearch();
    }
    setDialogState({ isOpen: false, filterTerm: '', onAddFilter: null, onSearch: null });
  }, [dialogState]);

  /**
   * Maneja la cancelación del usuario (No)
   */
  const handleCancel = useCallback(() => {
    if (dialogState.onSearch) {
      dialogState.onSearch();
    }
    setDialogState({ isOpen: false, filterTerm: '', onAddFilter: null, onSearch: null });
  }, [dialogState]);

  return {
    dialogState,
    validateAndSearch,
    handleConfirm,
    handleCancel
  };
};
