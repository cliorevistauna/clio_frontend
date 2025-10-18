import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import { useAuth } from "../../auth/hooks";
import { researcherService } from "../services";
import { Researcher } from "../types";
import { thematicLinesService, ThematicLine } from "../../thematic-lines/services/thematicLinesService";
import { languagesService, Language } from "../../../shared/services";
import { useResearcherSearch } from "../hooks/useResearcherSearch";
import { useResearcherForm } from "../hooks/useResearcherForm";
import { ResearcherSearchTab } from "../components/ResearcherSearchTab";
import { ResearcherTableTab } from "../components/ResearcherTableTab";
import { ResearcherEditForm } from "../components/ResearcherEditForm";

const styles = {
  activeTabButton: {
    padding: '12px 24px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    borderBottom: '2px solid #007bff',
    cursor: 'pointer' as const,
    fontSize: '14px',
    fontWeight: 'bold' as const,
    transition: 'all 0.3s ease'
  },
  inactiveTabButton: {
    padding: '12px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#007bff',
    borderBottom: '2px solid transparent',
    cursor: 'pointer' as const,
    fontSize: '14px',
    fontWeight: 'bold' as const,
    transition: 'all 0.3s ease'
  },
  tabButtonContainer: {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '2px solid #dee2e6'
  }
};

/**
 * RF-020: Modificar Investigadores
 * Vista con pestañas: Búsqueda específica y tabla con todos los investigadores
 */
const ModifyResearcher: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'search' | 'table'>('search');

  const [thematicLines, setThematicLines] = useState<ThematicLine[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  const [allAuthors, setAllAuthors] = useState<Researcher[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Researcher[]>([]);
  const [tableFilter, setTableFilter] = useState("");
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const searchHook = useResearcherSearch();
  const formHook = useResearcherForm();

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [lines, langs] = await Promise.all([
          thematicLinesService.getThematicLines(false),
          languagesService.getLanguages()
        ]);
        setThematicLines(lines);
        setLanguages(langs);
      } catch (error) {
        console.error("Error al cargar filtros:", error);
      }
    };
    loadFilters();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Error during logout:', error);
      navigate(ROUTES.LOGIN);
    }
  };

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await searchHook.handleSearch();

    if (!result.success) {
      alert(result.message);
      formHook.clearForm();
      searchHook.setSearchResults([]);
    } else if (result.results) {
      if (result.results.length === 0) {
        alert("No se encuentra autor o evaluador bajo estos filtros.");
        formHook.clearForm();
        searchHook.setSearchResults([]);
      } else if (result.results.length === 1) {
        formHook.loadResearcher(result.results[0]);
        searchHook.setSearchResults([]);
        alert(`${result.results[0].name} cargado exitosamente.`);
      } else {
        alert(`Se encontraron ${result.results.length} resultados. Seleccione uno de la lista.`);
      }
    }
  }, [searchHook, formHook]);

  const selectAuthorForEdit = useCallback((author: Researcher) => {
    formHook.loadResearcher(author);
    searchHook.setSearchResults([]);
  }, [formHook, searchHook]);

  const cancelEdit = useCallback(() => {
    formHook.clearForm();
    searchHook.clearSearch();
    if (activeTab === 'table') {
      loadAllAuthors();
    }
  }, [formHook, searchHook, activeTab]);

  const handleUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await formHook.handleUpdate(() => {
      searchHook.clearSearch();
      if (activeTab === 'table' && allAuthors.length > 0) {
        loadAllAuthors();
      }
    });

    alert(result.message);
  }, [formHook, searchHook, activeTab, allAuthors]);

  const loadAllAuthors = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      const authors = await researcherService.getAll({ includeInactive: showInactive });
      setAllAuthors(authors);
      setFilteredAuthors(authors);
    } catch (error) {
      console.error('Error al cargar los autores y evaluadores:', error);
      alert('Error al cargar los autores y evaluadores.');
    } finally {
      setIsLoadingTable(false);
    }
  }, [showInactive]);

  useEffect(() => {
    if (allAuthors.length > 0) {
      loadAllAuthors();
    }
  }, [showInactive]);

  useEffect(() => {
    if (!tableFilter.trim()) {
      setFilteredAuthors(allAuthors);
    } else {
      const filtered = allAuthors.filter(author => {
        const searchTerm = tableFilter.toLowerCase();
        return (
          (author.name && author.name.toLowerCase().includes(searchTerm)) ||
          (author.orcid && author.orcid.toLowerCase().includes(searchTerm)) ||
          (author.email && author.email.toLowerCase().includes(searchTerm)) ||
          (author.affiliation && author.affiliation.toLowerCase().includes(searchTerm)) ||
          (author.country && author.country.toLowerCase().includes(searchTerm)) ||
          (author.status && author.status.toLowerCase().includes(searchTerm))
        );
      });
      setFilteredAuthors(filtered);
    }
  }, [tableFilter, allAuthors]);

  const selectFromTable = useCallback((author: Researcher) => {
    formHook.loadResearcher(author);
  }, [formHook]);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const renderSearchTab = () => {
    if (formHook.selectedAuthor) {
      return (
        <ResearcherEditForm
          selectedAuthor={formHook.selectedAuthor}
          formState={formHook.formState}
          isUpdating={formHook.isUpdating}
          onFieldChange={formHook.updateField}
          onSubmit={handleUpdate}
          onCancel={cancelEdit}
        />
      );
    }

    return (
      <ResearcherSearchTab
        keywordSearch={searchHook.keywordSearch}
        filterTerm={searchHook.filterTerm}
        searchFilters={searchHook.searchFilters}
        searchResults={searchHook.searchResults}
        isSearching={searchHook.isSearching}
        thematicLines={thematicLines}
        languages={languages}
        onKeywordChange={searchHook.setKeywordSearch}
        onFilterTermChange={searchHook.setFilterTerm}
        onAddFilter={(e) => searchHook.handleAddFilter(e, thematicLines, languages)}
        onRemoveFilter={searchHook.handleRemoveFilter}
        onSearch={handleSearch}
        onSelectAuthor={selectAuthorForEdit}
      />
    );
  };

  const renderTableTab = () => {
    if (formHook.selectedAuthor) {
      return (
        <ResearcherEditForm
          selectedAuthor={formHook.selectedAuthor}
          formState={formHook.formState}
          isUpdating={formHook.isUpdating}
          onFieldChange={formHook.updateField}
          onSubmit={handleUpdate}
          onCancel={cancelEdit}
        />
      );
    }

    return (
      <ResearcherTableTab
        allAuthors={allAuthors}
        filteredAuthors={filteredAuthors}
        tableFilter={tableFilter}
        showInactive={showInactive}
        isLoadingTable={isLoadingTable}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onTableFilterChange={setTableFilter}
        onShowInactiveChange={setShowInactive}
        onLoadAuthors={loadAllAuthors}
        onSelectAuthor={selectFromTable}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    );
  };

  const handleTabChange = (tab: 'search' | 'table') => {
    setActiveTab(tab);
    formHook.clearForm();
    searchHook.clearSearch();
  };

  return (
    <div className="app-layout">
      <PageHeader onLogout={handleLogout} />

      <main className="main-content">
        <div className="form-container">
          <div style={styles.tabButtonContainer}>
            <button
              onClick={() => handleTabChange('search')}
              style={activeTab === 'search' ? styles.activeTabButton : styles.inactiveTabButton}
              onMouseOver={(e) => {
                if (activeTab !== 'search') {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'search') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Buscar Uno Específico
            </button>
            <button
              onClick={() => handleTabChange('table')}
              style={activeTab === 'table' ? styles.activeTabButton : styles.inactiveTabButton}
              onMouseOver={(e) => {
                if (activeTab !== 'table') {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== 'table') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Ver Todos en Tabla
            </button>
          </div>

          {activeTab === 'search' ? renderSearchTab() : renderTableTab()}
        </div>
      </main>
    </div>
  );
};

export default ModifyResearcher;
