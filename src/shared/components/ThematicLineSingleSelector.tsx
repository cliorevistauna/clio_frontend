import React, { useState, useEffect } from "react";
import { thematicLinesService, ThematicLine } from "../../features/thematic-lines/services/thematicLinesService";

interface ThematicLineSingleSelectorProps {
  selectedId: number | null;
  onChange: (lineaId: number | null) => void;
  label?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
}

const ThematicLineSingleSelector: React.FC<ThematicLineSingleSelectorProps> = React.memo(({
  selectedId,
  onChange,
  label = "Línea Temática",
  includeAllOption = true,
  allOptionLabel = "Todas las líneas temáticas"
}) => {
  const [search, setSearch] = useState("");
  const [availableLines, setAvailableLines] = useState<ThematicLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Cargar líneas temáticas al montar el componente
  useEffect(() => {
    const loadThematicLines = async () => {
      try {
        setLoading(true);
        const lines = await thematicLinesService.getThematicLines(false); // Solo líneas activas
        setAvailableLines(lines);
      } catch (error: any) {
        console.error("Error al cargar líneas temáticas:", error);
        setAvailableLines([]);
      } finally {
        setLoading(false);
      }
    };

    loadThematicLines();
  }, []);

  // Filtrar opciones según búsqueda
  const filteredOptions = availableLines.filter((line) =>
    line.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Obtener nombre de la línea seleccionada
  const getSelectedLineName = (): string => {
    if (selectedId === null) {
      return includeAllOption ? allOptionLabel : "";
    }
    const line = availableLines.find(l => l.id === selectedId);
    return line ? line.nombre : `ID: ${selectedId}`;
  };

  // Seleccionar una línea
  const selectLine = (lineaId: number | null) => {
    onChange(lineaId);
    setSearch("");
    setShowDropdown(false);
  };

  // Manejar clic en el input
  const handleInputClick = () => {
    setShowDropdown(!showDropdown);
  };

  // Manejar cambio en búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!showDropdown) {
      setShowDropdown(true);
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.thematic-line-single-selector')) {
        setShowDropdown(false);
        setSearch("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="form-group">
        <label>{label}</label>
        <div style={{ padding: '8px', color: '#6c757d' }}>Cargando líneas temáticas...</div>
      </div>
    );
  }

  return (
    <div className="form-group thematic-line-single-selector" style={{ position: 'relative' }}>
      <label>{label}</label>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={search || getSelectedLineName()}
          onChange={handleSearchChange}
          onClick={handleInputClick}
          placeholder={includeAllOption ? allOptionLabel : "Seleccione una línea temática..."}
          disabled={availableLines.length === 0}
          style={{
            width: '100%',
            padding: '8px 35px 8px 8px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        />

        {/* Icono dropdown */}
        <span
          onClick={handleInputClick}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            color: '#6c757d',
            fontSize: '12px'
          }}
        >
          ▼
        </span>
      </div>

      {/* Dropdown de opciones */}
      {showDropdown && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '250px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            marginTop: '4px',
            padding: 0,
            listStyle: 'none',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}
        >
          {/* Opción "Todas" */}
          {includeAllOption && (
            <li
              onClick={() => selectLine(null)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                backgroundColor: selectedId === null ? '#e7f3ff' : 'white',
                fontWeight: selectedId === null ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => {
                if (selectedId !== null) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedId !== null) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              {allOptionLabel}
            </li>
          )}

          {/* Opciones de líneas temáticas */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((line) => (
              <li
                key={line.id}
                onClick={() => selectLine(line.id)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  backgroundColor: selectedId === line.id ? '#e7f3ff' : 'white',
                  fontWeight: selectedId === line.id ? 'bold' : 'normal'
                }}
                onMouseEnter={(e) => {
                  if (selectedId !== line.id) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedId !== line.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {line.nombre}
              </li>
            ))
          ) : (
            <li
              style={{
                padding: '10px 12px',
                color: '#6c757d',
                fontStyle: 'italic',
                textAlign: 'center'
              }}
            >
              No se encontraron resultados
            </li>
          )}
        </ul>
      )}

      {availableLines.length === 0 && !loading && (
        <small style={{ display: 'block', marginTop: '4px', color: '#dc3545' }}>
          No hay líneas temáticas disponibles. Contacte al administrador.
        </small>
      )}
    </div>
  );
});

export default ThematicLineSingleSelector;
