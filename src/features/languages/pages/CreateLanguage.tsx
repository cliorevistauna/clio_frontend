import React, { useState } from "react";
import { HeaderWithToggle } from "../../../shared/components/HeaderWithToggle";
import { languagesService } from "../services/languagesService";
import { useViewMode } from "../../../shared/contexts/ViewModeContext";
import "./Languages.css";

const CreateLanguage: React.FC = () => {
  const { viewMode } = useViewMode();
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("Por favor ingrese el nombre del idioma");
      return;
    }

    setIsSubmitting(true);
    try {
      await languagesService.createLanguage({
        nombre: nombre.trim()
      });

      alert("Idioma creado exitosamente");
      setNombre("");
    } catch (error: any) {
      console.error("Error al crear idioma:", error);
      const errorMessage = error.message || "Error al crear idioma";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`app-layout ${viewMode === 'wide' ? 'wide-layout' : ''}`}>
      <HeaderWithToggle />
      <main className="main-content">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre del Idioma *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese el nombre del idioma"
                required
                maxLength={100}
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateLanguage;
