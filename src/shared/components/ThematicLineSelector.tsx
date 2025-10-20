import React, { useState, useEffect } from "react";
import { thematicLinesService, ThematicLine } from "../../features/thematic-lines/services/thematicLinesService";

interface ThematicLineSelector {
  selected: number[];
  onChange: (values: number[]) => void;
}

const LineaTematicaSelector: React.FC<ThematicLineSelector> = React.memo(({ selected, onChange }) => {
  const [search, setSearch] = useState("");
  const [availableLines, setAvailableLines] = useState<ThematicLine[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar líneas temáticas al montar el componente
  useEffect(() => {
    const loadThematicLines = async () => {
      try {
        setLoading(true);
        console.log("Loading thematic lines in selector...");
        // Cargar TODAS las líneas (activas e inactivas) para poder mostrar nombres de líneas inactivas ya asociadas
        const lines = await thematicLinesService.getThematicLines(true); // Include inactive lines
        console.log("Thematic lines loaded successfully:", lines);
        setAvailableLines(lines);
      } catch (error: any) {
        console.error("Error al cargar líneas temáticas en selector:", error);
        console.error("Error details:", error.message || error);
        // Fallback to empty array if error
        setAvailableLines([]);
      } finally {
        setLoading(false);
      }
    };

    loadThematicLines();
  }, []);

  // Filtrar solo líneas ACTIVAS para mostrar en el dropdown de búsqueda
  const filteredOptions = availableLines.filter(
    (line) =>
      line.estado === true && // Solo líneas activas pueden ser agregadas
      line.nombre.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(line.id)
  );

  const addLinea = (lineaId: number) => {
    onChange([...selected, lineaId]);
    setSearch("");
  };

  const removeLinea = (lineaId: number) => {
    onChange(selected.filter((id) => id !== lineaId));
  };

  const getLineaInfo = (lineaId: number): { nombre: string; isInactive: boolean } => {
    const line = availableLines.find(l => l.id === lineaId);
    if (line) {
      return {
        nombre: line.nombre,
        isInactive: !line.estado
      };
    }
    return {
      nombre: `ID: ${lineaId}`,
      isInactive: false
    };
  };

  if (loading) {
    return (
      <div className="linea-selector">
        <label>Línea(s) Temática(s)</label>
        <div>Cargando líneas temáticas...</div>
      </div>
    );
  }

  return (
    <div className="linea-selector">
      <label>Línea(s) Temática(s)</label>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar línea temática..."
        disabled={availableLines.length === 0}
      />

      {search && (
        <ul className="options-list">
          {filteredOptions.length > 0 ? (
            <>
              <li className="select-header" style={{ fontWeight: 'bold', cursor: 'default', backgroundColor: '#f8f9fa', listStyle: 'none' }}>
                Seleccione:
              </li>
              {filteredOptions.map((line) => (
                <li key={line.id} onClick={() => addLinea(line.id)}>
                  {line.nombre}
                </li>
              ))}
            </>
          ) : (
            <li className="no-results">No se encontraron resultados</li>
          )}
        </ul>
      )}

      <div className="selected-items">
        {selected.map((lineaId) => {
          const lineaInfo = getLineaInfo(lineaId);
          return (
            <span
              key={lineaId}
              className="selected-chip"
              style={lineaInfo.isInactive ? {
                backgroundColor: '#f8d7da',
                borderColor: '#f5c6cb',
                color: '#721c24'
              } : undefined}
              title={lineaInfo.isInactive ? 'Esta línea temática está inactiva' : undefined}
            >
              {lineaInfo.nombre}
              {lineaInfo.isInactive && ' (Inactiva)'}
              <button onClick={() => removeLinea(lineaId)}>x</button>
            </span>
          );
        })}
      </div>

      {availableLines.length === 0 && !loading && (
        <div className="no-lines-available">
          <em>No hay líneas temáticas disponibles. Contacte al administrador.</em>
        </div>
      )}
    </div>
  );
});

export default LineaTematicaSelector;
