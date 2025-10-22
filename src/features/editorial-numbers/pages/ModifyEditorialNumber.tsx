import React, { useState, useEffect, useCallback } from "react";
import { HeaderWithToggle } from "../../../shared/components/HeaderWithToggle";
import { editorialNumberService } from "../services";
import { EditorialNumber, UpdateEditorialNumberRequest } from "../types";
import {
  backendToFrontendDate,
  frontendToBackendDate,
  isValidFrontendDateFormat,
  getCurrentDateFrontend
} from "../../../shared/utils/dateUtils";
import { EditorialNumberSearchTab } from "../components/EditorialNumberSearchTab";
import { EditorialNumberTableTab } from "../components/EditorialNumberTableTab";
import { EditorialNumberForm } from "../components/EditorialNumberForm";
import { useViewMode } from "../../../shared/contexts/ViewModeContext";

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
 * RF-009: Modificación de Números Editoriales
 * Vista con pestañas: Búsqueda específica y tabla con todos los números
 */
const ModifyEditorialNumber: React.FC = () => {
  const { viewMode } = useViewMode();
  const [activeTab, setActiveTab] = useState<'search' | 'table'>('search');

  const [searchNumero, setSearchNumero] = useState("");
  const [searchAnio, setSearchAnio] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [allEditorialNumbers, setAllEditorialNumbers] = useState<EditorialNumber[]>([]);
  const [filteredNumbers, setFilteredNumbers] = useState<EditorialNumber[]>([]);
  const [tableFilter, setTableFilter] = useState("");
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedEditorial, setSelectedEditorial] = useState<EditorialNumber | null>(null);
  const [searchResults, setSearchResults] = useState<EditorialNumber[]>([]);
  const [numero, setNumero] = useState("");
  const [anio, setAnio] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [usarHoyInicio, setUsarHoyInicio] = useState(false);
  const [usarHoyFin, setUsarHoyFin] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const [confirmation, setConfirmation] = useState<{
    editorialId: number;
    editorialName: string;
    newStatus: 'activo' | 'inactivo';
  } | null>(null);

  const handleUsarHoyInicio = useCallback((checked: boolean) => {
    setUsarHoyInicio(checked);
    if (checked) {
      setFechaInicio(getCurrentDateFrontend());
    } else {
      setFechaInicio("");
    }
  }, []);

  const handleUsarHoyFin = useCallback((checked: boolean) => {
    setUsarHoyFin(checked);
    if (checked) {
      setFechaFin(getCurrentDateFrontend());
    } else {
      setFechaFin("");
    }
  }, []);

  const clearForm = useCallback(() => {
    setSelectedEditorial(null);
    setNumero("");
    setAnio("");
    setFechaInicio("");
    setFechaFin("");
    setComentarios("");
    setUsarHoyInicio(false);
    setUsarHoyFin(false);
  }, []);

  const preloadForm = useCallback((editorial: EditorialNumber) => {
    setSelectedEditorial(editorial);
    setNumero(editorial.numero.toString());
    setAnio(editorial.anio.toString());
    setFechaInicio(editorial.fecha_inicio ? backendToFrontendDate(editorial.fecha_inicio) : "");
    setFechaFin(editorial.fecha_final ? backendToFrontendDate(editorial.fecha_final) : "");
    setComentarios(editorial.comentarios || "");
    setUsarHoyInicio(false);
    setUsarHoyFin(false);
  }, []);

  const loadAllEditorialNumbers = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      const numbers = await editorialNumberService.getAll({ includeInactive: showInactive });
      setAllEditorialNumbers(numbers);
      setFilteredNumbers(numbers);
    } catch (error) {
      console.error('Error al cargar periodos de publicación:', error);
      alert('Error al cargar los periodos de publicación.');
    } finally {
      setIsLoadingTable(false);
    }
  }, [showInactive]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchNumero) {
      alert("Ingrese el periodo a buscar.");
      return;
    }

    const numeroInt = parseInt(searchNumero);
    if (isNaN(numeroInt) || numeroInt <= 0) {
      alert("Ingrese un periodo válido.");
      return;
    }

    setIsSearching(true);
    try {
      const anioInt = searchAnio ? parseInt(searchAnio) : undefined;
      const results = await editorialNumberService.searchByNumber(numeroInt, anioInt);

      if (results.length === 0) {
        alert("No se encontraron periodos con esos criterios.");
        clearForm();
        setSearchResults([]);
      } else if (results.length === 1) {
        preloadForm(results[0]);
        setSearchResults([]);
        alert(`Periodo ${results[0].numero}-${results[0].anio} cargado exitosamente.`);
      } else {
        setSearchResults(results);
        alert(`Se encontraron ${results.length} resultados. Seleccione uno de la lista.`);
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
      alert("Error al buscar el periodo.");
      clearForm();
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchNumero, searchAnio, clearForm, preloadForm]);

  const selectEditorialForEdit = useCallback((editorial: EditorialNumber) => {
    preloadForm(editorial);
    setSearchResults([]);
  }, [preloadForm]);

  const cancelEdit = useCallback(() => {
    clearForm();
    setSearchResults([]);
    if (activeTab === 'table') {
      loadAllEditorialNumbers();
    }
  }, [activeTab, clearForm, loadAllEditorialNumbers]);

  const executeStatusChange = useCallback(async () => {
    if (!confirmation || !selectedEditorial) return;

    setIsChangingStatus(true);
    const action = confirmation.newStatus === 'activo' ? 'activar' : 'inactivar';

    try {
      await editorialNumberService.updateStatus(confirmation.editorialId, confirmation.newStatus);

      alert(`Periodo ${confirmation.editorialName} ${action === 'activar' ? 'activado' : 'inactivado'} exitosamente.`);

      setSelectedEditorial({ ...selectedEditorial, estado: confirmation.newStatus });

      if (activeTab === 'table' && allEditorialNumbers.length > 0) {
        loadAllEditorialNumbers();
      }
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);
      const errorMessage = error?.message || `Error al ${action} el periodo.`;
      alert(errorMessage);
    } finally {
      setIsChangingStatus(false);
      setConfirmation(null);
    }
  }, [confirmation, selectedEditorial, activeTab, allEditorialNumbers, loadAllEditorialNumbers]);

  const handleUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEditorial) {
      alert("Primero debe buscar un periodo para modificar.");
      return;
    }

    if (!numero || !anio || !fechaInicio || !fechaFin) {
      alert("Debe completar todos los campos obligatorios.");
      return;
    }

    const numeroInt = parseInt(numero);
    const anioInt = parseInt(anio);

    if (isNaN(numeroInt) || numeroInt <= 0) {
      alert("El periodo debe ser un valor positivo.");
      return;
    }

    if (isNaN(anioInt) || anioInt < 1990 || anioInt > new Date().getFullYear() + 10) {
      alert("Ingrese un año válido.");
      return;
    }

    if (!isValidFrontendDateFormat(fechaInicio) || !isValidFrontendDateFormat(fechaFin)) {
      alert("Las fechas deben estar en formato DD-MM-YYYY.");
      return;
    }

    const fechaInicioBackend = frontendToBackendDate(fechaInicio);
    const fechaFinBackend = frontendToBackendDate(fechaFin);

    if (new Date(fechaInicioBackend) >= new Date(fechaFinBackend)) {
      alert("La fecha de inicio debe ser anterior a la fecha de finalización.");
      return;
    }

    setIsUpdating(true);
    try {
      const conflictingNumber = await editorialNumberService.checkDateOverlap(
        fechaInicioBackend,
        fechaFinBackend,
        selectedEditorial.id
      );

      if (conflictingNumber) {
        alert(
          `Las fechas se solapan con el periodo ${conflictingNumber.numero}-${conflictingNumber.anio} ` +
          `(vigente desde ${backendToFrontendDate(conflictingNumber.fecha_inicio || '')} hasta ${backendToFrontendDate(conflictingNumber.fecha_final || '')}).\n\n` +
          `No pueden existir dos periodos de publicación vigentes simultáneamente.\n` +
          `Por favor, ajuste las fechas para evitar el solapamiento.`
        );
        setIsUpdating(false);
        return;
      }
      const updateRequest: UpdateEditorialNumberRequest = {
        id: selectedEditorial.id,
        numero: numeroInt,
        anio: anioInt,
        fecha_inicio: fechaInicioBackend,
        fecha_final: fechaFinBackend,
        comentarios: comentarios || "",
      };

      await editorialNumberService.update(updateRequest);

      alert("Periodo modificado exitosamente.");

      clearForm();
      setSearchNumero("");
      setSearchAnio("");

      if (activeTab === 'table' && allEditorialNumbers.length > 0) {
        loadAllEditorialNumbers();
      }

    } catch (error: any) {
      console.error("Error al modificar periodo:", error);
      const errorMessage = error?.message || "Error al modificar el periodo.";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [selectedEditorial, numero, anio, fechaInicio, fechaFin, comentarios, activeTab, allEditorialNumbers, clearForm, loadAllEditorialNumbers]);

  useEffect(() => {
    if (allEditorialNumbers.length > 0) {
      loadAllEditorialNumbers();
    }
  }, [showInactive, allEditorialNumbers.length, loadAllEditorialNumbers]);

  useEffect(() => {
    if (!tableFilter.trim()) {
      setFilteredNumbers(allEditorialNumbers);
    } else {
      const filtered = allEditorialNumbers.filter(editorial => {
        const searchTerm = tableFilter.toLowerCase();
        return (
          editorial.numero.toString().includes(searchTerm) ||
          editorial.anio.toString().includes(searchTerm) ||
          editorial.estado.toLowerCase().includes(searchTerm) ||
          (editorial.comentarios && editorial.comentarios.toLowerCase().includes(searchTerm)) ||
          (editorial.fecha_inicio && editorial.fecha_inicio.includes(searchTerm)) ||
          (editorial.fecha_final && editorial.fecha_final.includes(searchTerm))
        );
      });
      setFilteredNumbers(filtered);
    }
  }, [tableFilter, allEditorialNumbers]);

  const selectFromTable = useCallback((editorial: EditorialNumber) => {
    preloadForm(editorial);
  }, [preloadForm]);

  const totalPages = Math.ceil(filteredNumbers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNumbers = filteredNumbers.slice(startIndex, endIndex);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const renderSearchTab = () => {
    if (selectedEditorial) {
      return (
        <EditorialNumberForm
          selectedEditorial={selectedEditorial}
          numero={numero}
          anio={anio}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          comentarios={comentarios}
          usarHoyInicio={usarHoyInicio}
          usarHoyFin={usarHoyFin}
          isUpdating={isUpdating}
          isChangingStatus={isChangingStatus}
          confirmation={confirmation}
          onNumeroChange={setNumero}
          onAnioChange={setAnio}
          onFechaInicioChange={setFechaInicio}
          onFechaFinChange={setFechaFin}
          onComentariosChange={setComentarios}
          onUsarHoyInicioChange={handleUsarHoyInicio}
          onUsarHoyFinChange={handleUsarHoyFin}
          onSubmit={handleUpdate}
          onCancel={cancelEdit}
          onStatusChange={(newStatus) => setConfirmation({
            editorialId: selectedEditorial.id,
            editorialName: `${selectedEditorial.numero}-${selectedEditorial.anio}`,
            newStatus
          })}
          onConfirmationCancel={() => setConfirmation(null)}
          onConfirmationAccept={executeStatusChange}
        />
      );
    }

    return (
      <EditorialNumberSearchTab
        searchNumero={searchNumero}
        searchAnio={searchAnio}
        isSearching={isSearching}
        searchResults={searchResults}
        onSearchNumeroChange={setSearchNumero}
        onSearchAnioChange={setSearchAnio}
        onSearch={handleSearch}
        onSelectEditorial={selectEditorialForEdit}
      />
    );
  };

  const renderTableTab = () => {
    if (selectedEditorial) {
      return (
        <EditorialNumberForm
          selectedEditorial={selectedEditorial}
          numero={numero}
          anio={anio}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          comentarios={comentarios}
          usarHoyInicio={usarHoyInicio}
          usarHoyFin={usarHoyFin}
          isUpdating={isUpdating}
          isChangingStatus={isChangingStatus}
          confirmation={confirmation}
          onNumeroChange={setNumero}
          onAnioChange={setAnio}
          onFechaInicioChange={setFechaInicio}
          onFechaFinChange={setFechaFin}
          onComentariosChange={setComentarios}
          onUsarHoyInicioChange={handleUsarHoyInicio}
          onUsarHoyFinChange={handleUsarHoyFin}
          onSubmit={handleUpdate}
          onCancel={cancelEdit}
          onStatusChange={(newStatus) => setConfirmation({
            editorialId: selectedEditorial.id,
            editorialName: `${selectedEditorial.numero}-${selectedEditorial.anio}`,
            newStatus
          })}
          onConfirmationCancel={() => setConfirmation(null)}
          onConfirmationAccept={executeStatusChange}
        />
      );
    }

    return (
      <EditorialNumberTableTab
        allEditorialNumbers={allEditorialNumbers}
        filteredNumbers={filteredNumbers}
        tableFilter={tableFilter}
        showInactive={showInactive}
        isLoadingTable={isLoadingTable}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        currentNumbers={currentNumbers}
        onTableFilterChange={setTableFilter}
        onShowInactiveChange={setShowInactive}
        onLoadEditorialNumbers={loadAllEditorialNumbers}
        onSelectEditorial={selectFromTable}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    );
  };

  const handleTabChange = (tab: 'search' | 'table') => {
    setActiveTab(tab);
    clearForm();
    setSearchResults([]);
    setSearchNumero("");
    setSearchAnio("");
  };

  return (
    <div className={`app-layout ${viewMode === 'wide' ? 'wide-layout' : ''}`}>
      <HeaderWithToggle onLogout={() => console.log("Logout")} />

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

export default ModifyEditorialNumber;
