import React, { useState } from "react";
import { HeaderWithToggle } from "../../../shared/components/HeaderWithToggle";
import { thematicLinesService } from "../services/thematicLinesService";
import { useViewMode } from "../../../shared/contexts/ViewModeContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import "./ThematicLines.css";

const CreateThematicLine: React.FC = () => {
  const { viewMode } = useViewMode();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("Por favor ingrese el nombre de la línea temática");
      return;
    }

    setIsSubmitting(true);
    try {
      await thematicLinesService.createThematicLine({
        nombre: nombre.trim()
      });

      alert("Línea temática creada exitosamente");
      setNombre(""); // Limpiar el campo para permitir registrar otra línea
    } catch (error: any) {
      console.error("Error al crear línea temática:", error);
      const errorMessage = error.message || "Error al crear línea temática";
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
              <label>Nombre de la Línea Temática *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese el nombre de la línea temática"
                required
                maxLength={150}
                disabled={isSubmitting}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ flex: 1 }}>
                {isSubmitting ? "Registrando..." : "Registrar"}
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.DASHBOARD)}
                disabled={isSubmitting}
                className="submit-btn"
                style={{
                  flex: 1,
                  backgroundColor: '#6c757d'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#5a6268';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d';
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateThematicLine;