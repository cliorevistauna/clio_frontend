import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";
import { thematicLinesService } from "../services/thematicLinesService";
import "./ThematicLines.css";

const CreateThematicLine: React.FC = () => {
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
      setNombre("");
      navigate(-1); // Go back to previous page
    } catch (error: any) {
      console.error("Error al crear línea temática:", error);
      const errorMessage = error.message || "Error al crear línea temática";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <PageHeader />
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

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateThematicLine;