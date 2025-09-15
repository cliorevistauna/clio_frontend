import React, { useState } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import "./CreateResearcher.css";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";

const CreateResearcher: React.FC = () => {
  const [orcid, setOrcid] = useState("");
  const [nombre, setNombre] = useState("");
  const [afiliacion, setAfiliacion] = useState("");
  const [grado, setGrado] = useState("");
  const [pais, setPais] = useState("");
  const [correo, setCorreo] = useState("");
  const [correoAlt, setCorreoAlt] = useState("");
  const [lineas, setLineas] = useState<string[]>([]);
  const [idiomas, setIdiomas] = useState("");
  const [celular, setCelular] = useState("");
  const [casa, setCasa] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [estado, setEstado] = useState("activo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!orcid || !nombre || !afiliacion || !grado || !pais || !correo) {
      alert("Debe completar todos los campos obligatorios.");
      return;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo) || (correoAlt && !regexCorreo.test(correoAlt))) {
      alert("Formato de correo inválido.");
      return;
    }

    console.log({
      orcid,
      nombre,
      afiliacion,
      grado,
      pais,
      correo,
      correoAlt,
      lineas,
      idiomas,
      celular,
      casa,
      universidad,
      estado,
    });

    alert("Autor/Evaluador creado exitosamente.");
  };

  return (
    <div className="app-layout">
      {/* Header fijo arriba */}
      <PageHeader onLogout={() => console.log("Logout")} />

      {/* Contenido principal */}
      <main className="main-content">
        <div className="form-container">
          <h2>Creación de Autores y Evaluadores</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ORCID *</label>
              <input type="text" value={orcid} onChange={(e) => setOrcid(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Nombre y Apellidos *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Afiliación Institucional *</label>
              <input type="text" value={afiliacion} onChange={(e) => setAfiliacion(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Grado Académico *</label>
              <input type="text" value={grado} onChange={(e) => setGrado(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>País *</label>
              <input type="text" value={pais} onChange={(e) => setPais(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Correo Electrónico *</label>
              <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Correo Alternativo</label>
              <input type="email" value={correoAlt} onChange={(e) => setCorreoAlt(e.target.value)} />
            </div>

            <div className="form-group">
              <ThematicLineSelector selected={lineas} onChange={setLineas} />
            </div>

            <div className="form-group">
              <label>Idioma(s)</label>
              <input type="text" value={idiomas} onChange={(e) => setIdiomas(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Teléfono Celular</label>
              <input type="text" value={celular} onChange={(e) => setCelular(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Teléfono de Casa</label>
              <input type="text" value={casa} onChange={(e) => setCasa(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Teléfono Universidad</label>
              <input type="text" value={universidad} onChange={(e) => setUniversidad(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Estado del Evaluador</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            <button type="submit" className="submit-btn">
              Crear Autor/Evaluador
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateResearcher;