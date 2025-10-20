import { useState, useCallback } from "react";
import { Researcher } from "../types";
import { researcherService } from "../services";

export interface SearchFilter {
  id: string;
  type: string;
  value: string;
  label: string;
}

export const useResearcherSearch = () => {
  const [keywordSearch, setKeywordSearch] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Researcher[]>([]);

  const handleAddFilter = useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    thematicLines: Array<{ id: number; nombre: string }>,
    languages: Array<{ id: number; nombre: string }>
  ) => {
    if (e.key === 'Enter' && filterTerm.trim()) {
      e.preventDefault();
      const term = filterTerm.trim();

      let filterType = 'país';
      let filterValue = term;
      let filterLabel = `País: ${term}`;

      // Prioridad 1: Buscar coincidencia EXACTA en idiomas
      const idiomaExactMatch = languages.find(l =>
        l.nombre.toLowerCase() === term.toLowerCase()
      );

      // Prioridad 2: Buscar coincidencia EXACTA en líneas temáticas
      const lineaExactMatch = thematicLines.find(l =>
        l.nombre.toLowerCase() === term.toLowerCase()
      );

      // Prioridad 3: Buscar coincidencia PARCIAL en líneas temáticas (más común)
      const lineaPartialMatch = thematicLines.find(l =>
        l.nombre.toLowerCase().includes(term.toLowerCase()) ||
        term.toLowerCase().includes(l.nombre.toLowerCase())
      );

      // Prioridad 4: Buscar coincidencia PARCIAL en idiomas
      const idiomaPartialMatch = languages.find(l =>
        l.nombre.toLowerCase().includes(term.toLowerCase()) ||
        term.toLowerCase().includes(l.nombre.toLowerCase())
      );

      // Aplicar coincidencia en orden de prioridad
      if (idiomaExactMatch) {
        filterType = 'idioma';
        filterValue = idiomaExactMatch.id.toString();
        filterLabel = `Idioma: ${idiomaExactMatch.nombre}`;
      } else if (lineaExactMatch) {
        filterType = 'línea_temática';
        filterValue = lineaExactMatch.id.toString();
        filterLabel = `Línea: ${lineaExactMatch.nombre}`;
      } else if (lineaPartialMatch) {
        filterType = 'línea_temática';
        filterValue = lineaPartialMatch.id.toString();
        filterLabel = `Línea: ${lineaPartialMatch.nombre}`;
      } else if (idiomaPartialMatch) {
        filterType = 'idioma';
        filterValue = idiomaPartialMatch.id.toString();
        filterLabel = `Idioma: ${idiomaPartialMatch.nombre}`;
      }
      // Si no encuentra ninguna coincidencia, se queda como país (default)

      const filterId = `${filterType}-${filterValue}`;

      setSearchFilters(prev => [...prev, {
        id: filterId,
        type: filterType,
        value: filterValue,
        label: filterLabel
      }]);

      setFilterTerm("");
    }
  }, [filterTerm]);

  const handleRemoveFilter = useCallback((id: string) => {
    setSearchFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleSearch = useCallback(async () => {
    if (searchFilters.length === 0 && !keywordSearch.trim()) {
      return { success: false, message: "Agregue al menos un criterio de búsqueda o palabra clave." };
    }

    setIsSearching(true);
    try {
      const advancedFilters: any = {};

      for (const filter of searchFilters) {
        if (filter.type === 'idioma') {
          advancedFilters.idiomas = parseInt(filter.value);
        } else if (filter.type === 'línea_temática') {
          advancedFilters.lineas_tematicas = parseInt(filter.value);
        } else if (filter.type === 'país') {
          advancedFilters.pais = filter.value;
        }
      }

      const searchKeyword = keywordSearch.trim() || undefined;
      const filtersWithInactive = {
        ...advancedFilters,
        includeInactive: true
      };

      const results = await researcherService.search(searchKeyword, filtersWithInactive);
      setSearchResults(results);

      return { success: true, results };
    } catch (error) {
      console.error("Error en búsqueda:", error);
      setSearchResults([]);
      return { success: false, message: "Error al buscar el autor o evaluador." };
    } finally {
      setIsSearching(false);
    }
  }, [searchFilters, keywordSearch]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchFilters([]);
    setKeywordSearch("");
    setFilterTerm("");
  }, []);

  return {
    keywordSearch,
    setKeywordSearch,
    filterTerm,
    setFilterTerm,
    searchFilters,
    handleAddFilter,
    handleRemoveFilter,
    isSearching,
    searchResults,
    setSearchResults,
    handleSearch,
    clearSearch
  };
};
