import React, { useState } from "react";

interface ThematicLineSelector {
  selected: string[];
  onChange: (values: string[]) => void;
}

const staticLineasTematicas = [
  "Historia Contemporánea",
  "Historia de Costa Rica",
  "Ciencia Política",
  "Educación",
  "Filosofía",
  "Arte y Cultura",
];

const LineaTematicaSelector: React.FC<ThematicLineSelector> = ({ selected, onChange }) => {
  const [search, setSearch] = useState("");

  const filteredOptions = staticLineasTematicas.filter(
    (linea) =>
      linea.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(linea)
  );

  const addLinea = (linea: string) => {
    onChange([...selected, linea]);
    setSearch("");
  };

  const removeLinea = (linea: string) => {
    onChange(selected.filter((l) => l !== linea));
  };

  return (
    <div className="linea-selector">
      <label>Línea(s) Temática(s)</label>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar línea temática..."
      />

      {search && (
        <ul className="options-list">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((linea) => (
              <li key={linea} onClick={() => addLinea(linea)}>
                {linea}
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
    </div>
  );
};

export default LineaTematicaSelector;
