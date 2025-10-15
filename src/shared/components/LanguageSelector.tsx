import React, { useState, useEffect } from "react";
import { languagesService, Language } from "../services";

interface LanguageSelectorProps {
  selected: number[];
  onChange: (values: number[]) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selected, onChange }) => {
  const [search, setSearch] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar idiomas al montar el componente
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setLoading(true);
        console.log("Loading languages in selector...");
        const languages = await languagesService.getLanguages();
        console.log("Languages loaded successfully:", languages);
        setAvailableLanguages(languages);
      } catch (error: any) {
        console.error("Error al cargar idiomas en selector:", error);
        console.error("Error details:", error.message || error);
        // Fallback to empty array if error
        setAvailableLanguages([]);
      } finally {
        setLoading(false);
      }
    };

    loadLanguages();
  }, []);

  const filteredOptions = availableLanguages.filter(
    (lang) =>
      lang.nombre.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(lang.id)
  );

  const addLanguage = (langId: number) => {
    onChange([...selected, langId]);
    setSearch("");
  };

  const removeLanguage = (langId: number) => {
    onChange(selected.filter((id) => id !== langId));
  };

  const getLanguageName = (langId: number): string => {
    const lang = availableLanguages.find(l => l.id === langId);
    return lang ? lang.nombre : `ID: ${langId}`;
  };

  if (loading) {
    return (
      <div className="linea-selector">
        <label>Idioma(s)</label>
        <div>Cargando idiomas...</div>
      </div>
    );
  }

  return (
    <div className="linea-selector">
      <label>Idioma(s)</label>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar idioma..."
        disabled={availableLanguages.length === 0}
      />

      {search && (
        <ul className="options-list">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((lang) => (
              <li key={lang.id} onClick={() => addLanguage(lang.id)}>
                {lang.nombre}
              </li>
            ))
          ) : (
            <li className="no-results">No se encontraron resultados</li>
          )}
        </ul>
      )}

      <div className="selected-items">
        {selected.map((langId) => (
          <span key={langId} className="selected-chip">
            {getLanguageName(langId)}
            <button onClick={() => removeLanguage(langId)}>x</button>
          </span>
        ))}
      </div>

      {availableLanguages.length === 0 && !loading && (
        <div className="no-lines-available">
          <em>No hay idiomas disponibles. Contacte al administrador.</em>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
