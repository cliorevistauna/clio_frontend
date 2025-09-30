import React, { useState } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import { useAuth } from "../../auth/hooks";
import { researcherService } from "../services";
import { CreateResearcherRequest } from "../types";

const CreateAuthor: React.FC = () => {
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
  const [lineas, setLineas] = useState<string[]>([]);
  const [idioma, setIdioma] = useState("");
  const [telefono, setTelefono] = useState("");
  const [estado, setEstado] = useState("activo");
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

    // Validaciones básicas
    if (!orcid || !nombre || !apellido1 || !apellido2 || !correo) {
      alert("Debe completar todos los campos obligatorios (ORCID, nombre, apellidos y correo).");
      return;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      alert("Formato de correo inválido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const authorData: CreateResearcherRequest = {
        orcid,
        name: `${nombre} ${apellido1} ${apellido2}`,
        affiliation: afiliacion,
        academicDegree: gradoAcademico,
        country: pais,
        email: correo,
        languages: idioma,
        phones: {
          mobile: telefono,
          home: '',
          university: ''
        },
        status: estado === 'activo' ? 'active' : estado === 'inactivo' ? 'inactive' : 'pending',
        thematicLines: lineas,
      };

      console.log("Creando autor:", authorData);

      const response = await researcherService.create(authorData);
      console.log("Autor creado:", response);

      alert("Autor creado exitosamente.");

      // Limpiar formulario
      setOrcid("");
      setNombre("");
      setApellido1("");
      setApellido2("");
      setAfiliacion("");
      setGradoAcademico("");
      setPais("");
      setLugarTrabajo("");
      setCorreo("");
      setLineas([]);
      setIdioma("");
      setTelefono("");
      setEstado("activo");

    } catch (error) {
      console.error("Error al registrar autor:", error);
      alert("Error al registrar el autor. Por favor, intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Header fijo arriba */}
      <PageHeader onLogout={handleLogout} />

      {/* Contenido principal */}
      <main className="main-content">
        <div className="form-container">
          <h2>Creación de Autor</h2>
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
              <ThematicLineSelector selected={lineas} onChange={setLineas} />
            </div>

            <div className="form-group">
              <label>Idioma(s)</label>
              <input
                type="text"
                value={idioma}
                onChange={(e) => setIdioma(e.target.value)}
                disabled={isSubmitting}
              />
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

            <div className="form-group">
              <label>Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} disabled={isSubmitting}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Autor"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateAuthor;