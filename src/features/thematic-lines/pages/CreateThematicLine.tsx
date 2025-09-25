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

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div>
      <PageHeader />
      <div className="create-form-container">
        <h2>RF-014: Registrar Línea Temática</h2>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre de la Línea Temática *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingrese el nombre de la línea temática"
              required
              maxLength={150}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateThematicLine;