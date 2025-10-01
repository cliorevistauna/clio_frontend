import React, { useState } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import LanguageSelector from "../../../shared/components/LanguageSelector";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import { useAuth } from "../../auth/hooks";

const CreateResearcher: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [orcid, setOrcid] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [afiliacion, setAfiliacion] = useState("");
  const [gradoAcademico, setGradoAcademico] = useState("");
  const [pais, setPais] = useState("");
  const [lugarTrabajo, setLugarTrabajo] = useState("");
  const [correo, setCorreo] = useState("");
  const [idiomas, setIdiomas] = useState<number[]>([]);
  const [lineasTematicas, setLineasTematicas] = useState<number[]>([]);
  const [telefono, setTelefono] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Error during logout:', error);
      navigate(ROUTES.LOGIN);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Esta funcionalidad no está implementada en este momento.");
  };

  return (
    <div className="app-layout">
      {/* Header fijo arriba */}
      <PageHeader onLogout={handleLogout} />

      {/* Contenido principal */}
      <main className="main-content">
        <div className="form-container">
          <h2>Formulario de Registro</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ORCID *</label>
              <input
                type="text"
                value={orcid}
                onChange={(e) => setOrcid(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Primer Apellido *</label>
              <input
                type="text"
                value={apellido1}
                onChange={(e) => setApellido1(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Segundo Apellido *</label>
              <input
                type="text"
                value={apellido2}
                onChange={(e) => setApellido2(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Afiliación Institucional</label>
              <input
                type="text"
                value={afiliacion}
                onChange={(e) => setAfiliacion(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Grado Académico</label>
              <input
                type="text"
                value={gradoAcademico}
                onChange={(e) => setGradoAcademico(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>País</label>
              <input
                type="text"
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Lugar de Trabajo</label>
              <input
                type="text"
                value={lugarTrabajo}
                onChange={(e) => setLugarTrabajo(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico *</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <LanguageSelector selected={idiomas} onChange={setIdiomas} />
            </div>

            <div className="form-group">
              <ThematicLineSelector selected={lineasTematicas} onChange={setLineasTematicas} />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
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

export default CreateResearcher;