import { useState, useEffect } from "react";
import { languagesService } from "../services/languagesService";
import { Language, CreateLanguageRequest, UpdateLanguageRequest } from "../types";

export const useLanguages = (includeInactive: boolean = false) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const langs = await languagesService.getLanguages(includeInactive);
      setLanguages(langs);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar idiomas");
      console.error("Error al cargar idiomas:", err);
    } finally {
      setLoading(false);
    }
  };

  const createLanguage = async (data: CreateLanguageRequest): Promise<boolean> => {
    try {
      const newLanguage = await languagesService.createLanguage(data);
      setLanguages(prev => [...prev, newLanguage]);
      alert("Idioma creado exitosamente");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.nombre?.[0] ||
                          err.response?.data?.codigo_iso?.[0] ||
                          "Error al crear idioma";
      alert(errorMessage);
      return false;
    }
  };

  const updateLanguage = async (id: number, data: UpdateLanguageRequest): Promise<boolean> => {
    try {
      const updatedLanguage = await languagesService.updateLanguage(id, data);
      setLanguages(prev =>
        prev.map(lang => lang.id === id ? updatedLanguage : lang)
      );
      alert("Idioma actualizado exitosamente");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.nombre?.[0] ||
                          err.response?.data?.codigo_iso?.[0] ||
                          "Error al actualizar idioma";
      alert(errorMessage);
      return false;
    }
  };

  const deactivateLanguage = async (id: number): Promise<boolean> => {
    try {
      const result = await languagesService.deactivateLanguage(id);
      setLanguages(prev =>
        prev.map(lang => lang.id === id ? result.language : lang)
      );
      alert("Idioma desactivado exitosamente");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Error al desactivar idioma";
      alert(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeInactive]);

  return {
    languages,
    loading,
    error,
    createLanguage,
    updateLanguage,
    deactivateLanguage,
    refreshLanguages: fetchLanguages
  };
};
