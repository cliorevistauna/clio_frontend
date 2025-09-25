import React, { useState, useEffect } from "react";
import { thematicLinesService, ThematicLine } from "../../features/thematic-lines/services/thematicLinesService";

interface ThematicLineSelector {
  selected: string[];
  onChange: (values: string[]) => void;
}

const LineaTematicaSelector: React.FC<ThematicLineSelector> = ({ selected, onChange }) => {
  const [search, setSearch] = useState("");
  const [availableLines, setAvailableLines] = useState<ThematicLine[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar líneas temáticas al montar el componente
  useEffect(() => {
    const loadThematicLines = async () => {
      try {
        setLoading(true);
        console.log("Loading thematic lines in selector...");
        const lines = await thematicLinesService.getThematicLines(false); // Only active lines
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

  const filteredOptions = availableLines.filter(
    (line) =>
      line.nombre.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(line.nombre)
  );

  const addLinea = (linea: string) => {
    onChange([...selected, linea]);
    setSearch("");
  };

  const removeLinea = (linea: string) => {
    onChange(selected.filter((l) => l !== linea));
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
            filteredOptions.map((line) => (
              <li key={line.id} onClick={() => addLinea(line.nombre)}>
                {line.nombre}
              </li>
            ))
          ) : (
            <li className="no-results">No se encontraron resultados</li>
          )}
        </ul>
      )}

      <div className="selected-items">
        {selected.map((linea) => (
          <span key={linea} className="selected-chip">
            {linea}
            <button onClick={() => removeLinea(linea)}>x</button>
          </span>
        ))}
      </div>

      {availableLines.length === 0 && !loading && (
        <div className="no-lines-available">
          <em>No hay líneas temáticas disponibles. Contacte al administrador.</em>
        </div>
      )}
    </div>
  );
};

export default LineaTematicaSelector;
