import { useState, useCallback, useEffect } from "react";
import { ResearcherSearchResult } from "../types";
import { researcherService } from "../../researchers/services";
import { thematicLinesService, ThematicLine } from "../../thematic-lines/services/thematicLinesService";
import { languagesService, Language } from "../../languages/services";

interface SearchFilter {
  id: string;
  type: string;
  value: string;
  label: string;
}

interface UseAuthorSearchProps {
  articleThematicLines?: number[];
  excludedIds?: number[];
}

export const useAuthorSearch = ({ articleThematicLines = [], excludedIds = [] }: UseAuthorSearchProps) => {
  const [keywordSearch, setKeywordSearch] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [searchResults, setSearchResults] = useState<ResearcherSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [thematicLines, setThematicLines] = useState<ThematicLine[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [lines, langs] = await Promise.all([
          thematicLinesService.getThematicLines(false),
          languagesService.getLanguages()
        ]);
        setThematicLines(lines);
        setLanguages(langs);

        if (articleThematicLines.length > 0) {
          const preloadedFilters = articleThematicLines
            .map(lineId => {
              const line = lines.find(l => l.id === lineId);
              if (line) {
                return {
                  id: `línea_temática-${line.id}`,
                  type: 'línea_temática',
                  value: line.id.toString(),
                  label: `Línea: ${line.nombre}`
                };
              }
              return null;
            })
            .filter(f => f !== null) as SearchFilter[];

          setSearchFilters(preloadedFilters);
        }
      } catch (error) {
        console.error("Error al cargar filtros:", error);
      }
    };
    loadFilters();
  }, [articleThematicLines]);

  const addFilter = useCallback((term: string) => {
    let filterType = 'país';
    let filterValue = term;
    let filterLabel = `País: ${term}`;

    const idiomaMatch = languages.find(l =>
      l.nombre.toLowerCase().includes(term.toLowerCase()) ||
      term.toLowerCase().includes(l.nombre.toLowerCase())
    );

    if (idiomaMatch) {
      filterType = 'idioma';
      filterValue = idiomaMatch.id.toString();
      filterLabel = `Idioma: ${idiomaMatch.nombre}`;
    } else {
      const lineaMatch = thematicLines.find(l =>
        l.nombre.toLowerCase().includes(term.toLowerCase()) ||
        term.toLowerCase().includes(l.nombre.toLowerCase())
      );

      if (lineaMatch) {
        filterType = 'línea_temática';
        filterValue = lineaMatch.id.toString();
        filterLabel = `Línea: ${lineaMatch.nombre}`;
      }
    }

    const filterId = `${filterType}-${filterValue}`;

    setSearchFilters(prev => [...prev, {
      id: filterId,
      type: filterType,
      value: filterValue,
      label: filterLabel
    }]);
  }, [thematicLines, languages]);

  const removeFilter = useCallback((id: string) => {
    setSearchFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  const search = useCallback(async () => {
    if (searchFilters.length === 0 && !keywordSearch.trim()) {
      alert("Por favor, agregue al menos un criterio de búsqueda o palabra clave.");
      return;
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
      const researchers = await researcherService.search(searchKeyword, advancedFilters);

      const results: ResearcherSearchResult[] = researchers.map(r => {
        const nameParts = r.name.trim().split(' ');
        const apellido2 = nameParts.length > 2 ? nameParts[nameParts.length - 1] : '';
        const apellido1 = nameParts.length > 1 ? nameParts[nameParts.length - 2] : nameParts[0] || '';
        const nombre = nameParts.length > 2 ? nameParts.slice(0, nameParts.length - 2).join(' ') : '';

        return {
          id: parseInt(r.id),
          orcid: r.orcid,
          nombre: nombre,
          apellido1: apellido1,
          apellido2: apellido2,
          afiliacion: r.affiliation,
          grado_academico: r.academicDegree,
          pais: r.country,
          lugar_trabajo: '',
          correo: r.email,
          telefono: r.phones.mobile || r.phones.home || r.phones.university || '',
          lineas_tematicas: r.thematicLines,
          idiomas: Array.isArray(r.languages) ? r.languages : [],
          estado: r.status === 'active' ? 'activo' : 'inactivo'
        };
      });

      const filteredResults = results.filter(r => !excludedIds.includes(r.id));
      setSearchResults(filteredResults);

      if (filteredResults.length === 0) {
        if (results.length > 0 && excludedIds.length > 0) {
          alert("No se encontraron autores disponibles. Los investigadores encontrados ya están seleccionados como evaluadores.");
        } else {
          alert("No se encontraron autores con los criterios ingresados.");
        }
      }
    } catch (error) {
      console.error("Error al buscar autores:", error);
      alert("Error al buscar autores. Por favor, intente nuevamente.");
    } finally {
      setIsSearching(false);
    }
  }, [searchFilters, keywordSearch, excludedIds]);

  const reset = useCallback(() => {
    setKeywordSearch("");
    setFilterTerm("");
    setSearchFilters([]);
    setSearchResults([]);
  }, []);

  return {
    keywordSearch,
    setKeywordSearch,
    filterTerm,
    setFilterTerm,
    searchFilters,
    addFilter,
    removeFilter,
    searchResults,
    isSearching,
    search,
    reset
  };
};
