import { useState, useEffect } from "react";
import {
  thematicLinesService,
  ThematicLine,
  CreateThematicLineRequest,
  UpdateThematicLineRequest
} from "../services/thematicLinesService";

export const useThematicLines = (includeInactive: boolean = false) => {
  const [thematicLines, setThematicLines] = useState<ThematicLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThematicLines = async () => {
    try {
      setLoading(true);
      const lines = await thematicLinesService.getThematicLines(includeInactive);
      setThematicLines(lines);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar líneas temáticas");
      console.error("Error al cargar líneas temáticas:", err);
    } finally {
      setLoading(false);
    }
  };

  const createThematicLine = async (data: CreateThematicLineRequest): Promise<boolean> => {
    try {
      const newLine = await thematicLinesService.createThematicLine(data);
      setThematicLines(prev => [...prev, newLine]);
      alert("Línea temática creada exitosamente");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.nombre?.[0] ||
                          "Error al crear línea temática";
      alert(errorMessage);
      return false;
    }
  };

  const updateThematicLine = async (id: number, data: UpdateThematicLineRequest): Promise<boolean> => {
    try {
      const updatedLine = await thematicLinesService.updateThematicLine(id, data);
      setThematicLines(prev =>
        prev.map(line => line.id === id ? updatedLine : line)
      );
      alert("Línea temática actualizada exitosamente");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.nombre?.[0] ||
                          "Error al actualizar línea temática";
      alert(errorMessage);
      return false;
    }
  };

  const deactivateThematicLine = async (id: number): Promise<boolean> => {
    try {
      const result = await thematicLinesService.deactivateThematicLine(id);
      setThematicLines(prev =>
        prev.map(line => line.id === id ? result.thematic_line : line)
      );
      alert("Línea temática desactivada exitosamente");
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Error al desactivar línea temática";
      alert(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    fetchThematicLines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeInactive]);

  return {
    thematicLines,
    loading,
    error,
    createThematicLine,
    updateThematicLine,
    deactivateThematicLine,
    refreshThematicLines: fetchThematicLines
  };
};