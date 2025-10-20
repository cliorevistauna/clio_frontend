import React, { useState } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import LanguageSelector from "../../../shared/components/LanguageSelector";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import { useAuth } from "../../auth/hooks";
import { researcherService } from "../services/researcherService";
import { CreateResearcherRequest } from "../types/Researcher";

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

    // Validaciones básicas
    if (!nombre || !apellido1 || !apellido2 || !correo) {
      alert("Por favor, complete todos los campos obligatorios (Nombre, Apellidos y Correo).");
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      alert("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    // Validar formato ORCID si se proporciona
    if (orcid) {
      const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
      if (!orcidRegex.test(orcid)) {
        alert("El ORCID debe tener el formato: 0000-0000-0000-0000");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const createRequest: CreateResearcherRequest = {
        orcid,
        nombre,
        apellido1,
        apellido2,
        affiliation: afiliacion,
        academicDegree: gradoAcademico,
        country: pais,
        workPlace: lugarTrabajo,
        email: correo,
        thematicLines: lineasTematicas,
        languages: idiomas,
        phones: {
          mobile: telefono,
        },
        status: "active",
      };

      await researcherService.create(createRequest);

      alert("Investigador registrado exitosamente.");

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
      setIdiomas([]);
      setLineasTematicas([]);
      setTelefono("");

    } catch (error: any) {
      console.error("Error al registrar investigador:", error);

      let errorMessage = "Error al registrar el investigador.";
      if (error?.details && typeof error.details === 'object') {
        const details = error.details;
        if (details.orcid && Array.isArray(details.orcid)) {
          errorMessage = details.orcid[0];
        } else if (details.correo && Array.isArray(details.correo)) {
          errorMessage = details.correo[0];
        } else if (details.nombre && Array.isArray(details.nombre)) {
          errorMessage = details.nombre[0];
        } else if (details.non_field_errors && Array.isArray(details.non_field_errors)) {
          errorMessage = details.non_field_errors[0];
        } else if (details.message) {
          errorMessage = details.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
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
          <h2>Formulario de Registro</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ORCID</label>
              <input
                type="text"
                value={orcid}
                onChange={(e) => setOrcid(e.target.value)}
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