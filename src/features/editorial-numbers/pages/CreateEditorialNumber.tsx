import React, { useState } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import "./CreateEditorialNumber.css";

const CreateEditorialNumber: React.FC = () => {
  const [numero, setNumero] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comentarios, setComentarios] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas front-end
    if (!numero || !fechaInicio || !fechaFin) {
      alert("Debe completar todos los campos obligatorios.");
      return;
    }

    // Ejemplo de validación de fecha simple
    const regexFecha = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexFecha.test(fechaInicio) || !regexFecha.test(fechaFin)) {
      alert("Ingrese una fecha válida (formato DD/MM/AAAA).");
      return;
    }

    console.log({
      numero,
      fechaInicio,
      fechaFin,
      comentarios,
    });

    alert("Número editorial creado exitosamente.");
  };

  return (
    <div className="app-layout">
      {/* Header fijo arriba */}
      <PageHeader onLogout={() => console.log("Logout")} />

      {/* Contenido principal */}
      <main className="main-content">
        <div className="form-container">
          <h2>Creación de Números Editoriales</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Número Editorial *</label>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Fecha de Inicio *</label>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Fecha de Finalización *</label>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Comentarios</label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={3}
              />
            </div>

            <button type="submit" className="submit-btn">
              Crear Número Editorial
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateEditorialNumber;