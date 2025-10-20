import React, { useState, useCallback } from "react";
import ThematicLineSelector from "../../../shared/components/ThematicLineSelector";
import LanguageSelector from "../../../shared/components/LanguageSelector";
import { researcherService } from "../../researchers/services";
import { ResearcherSearchResult } from "../types";

interface AuthorCreateTabProps {
  onAuthorCreated: (author: ResearcherSearchResult) => void;
  onCancel: () => void;
}

const AuthorCreateTab: React.FC<AuthorCreateTabProps> = ({ onAuthorCreated, onCancel }) => {
  const [orcid, setOrcid] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [afiliacion, setAfiliacion] = useState("");
  const [gradoAcademico, setGradoAcademico] = useState("");
  const [pais, setPais] = useState("");
  const [lugarTrabajo, setLugarTrabajo] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [idiomas, setIdiomas] = useState<number[]>([]);
  const [lineasTematicas, setLineasTematicas] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orcid || !nombre || !apellido1 || !apellido2 || !correo) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      alert("Formato de correo inválido.");
      return;
    }

    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
    if (!orcidRegex.test(orcid)) {
      alert("El ORCID debe tener el formato: 0000-0000-0000-0000");
      return;
    }

    setIsCreating(true);
    try {
      const newResearcher = await researcherService.create({
        orcid,
        nombre,
        apellido1,
        apellido2,
        affiliation: afiliacion,
        academicDegree: gradoAcademico,
        country: pais,
        workPlace: lugarTrabajo,
        email: correo,
        phones: {
          mobile: telefono,
          home: '',
          university: ''
        },
        thematicLines: lineasTematicas,
        languages: idiomas,
        status: 'active'
      });

      alert("Autor creado exitosamente.");

      const newAuthor: ResearcherSearchResult = {
        id: parseInt(newResearcher.id),
        orcid: newResearcher.orcid,
        nombre: nombre,
        apellido1: apellido1,
        apellido2: apellido2,
        afiliacion: afiliacion,
        grado_academico: gradoAcademico,
        pais: pais,
        lugar_trabajo: lugarTrabajo,
        correo: correo,
        telefono: telefono,
        lineas_tematicas: lineasTematicas,
        idiomas: idiomas,
        estado: 'activo'
      };

      onAuthorCreated(newAuthor);
    } catch (error: any) {
      console.error("Error al crear autor:", error);

      let errorMessage = "Error al crear el autor.";
      if (error?.details && typeof error.details === 'object') {
        const details = error.details;
        if (details.orcid && Array.isArray(details.orcid)) {
          errorMessage = details.orcid[0];
        } else if (details.correo && Array.isArray(details.correo)) {
          errorMessage = details.correo[0];
        } else if (details.message) {
          errorMessage = details.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [orcid, nombre, apellido1, apellido2, correo, afiliacion, gradoAcademico, pais, lugarTrabajo, telefono, lineasTematicas, idiomas, onAuthorCreated]);

  return (
    <div className="create-section">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>ORCID *</label>
            <input
              type="text"
              value={orcid}
              onChange={(e) => setOrcid(e.target.value)}
              placeholder="0000-0000-0000-0000"
              required
              disabled={isCreating}
            />
          </div>

          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Primer Apellido *</label>
            <input
              type="text"
              value={apellido1}
              onChange={(e) => setApellido1(e.target.value)}
              required
              disabled={isCreating}
            />
          </div>

          <div className="form-group">
            <label>Segundo Apellido *</label>
            <input
              type="text"
              value={apellido2}
              onChange={(e) => setApellido2(e.target.value)}
              required
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Afiliación Institucional</label>
            <input
              type="text"
              value={afiliacion}
              onChange={(e) => setAfiliacion(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="form-group">
            <label>Grado Académico</label>
            <input
              type="text"
              value={gradoAcademico}
              onChange={(e) => setGradoAcademico(e.target.value)}
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>País</label>
            <input
              type="text"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="form-group">
            <label>Lugar de Trabajo</label>
            <input
              type="text"
              value={lugarTrabajo}
              onChange={(e) => setLugarTrabajo(e.target.value)}
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Correo Electrónico *</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              disabled={isCreating}
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="form-group">
          <ThematicLineSelector
            selected={lineasTematicas}
            onChange={setLineasTematicas}
          />
        </div>

        <div className="form-group">
          <LanguageSelector
            selected={idiomas}
            onChange={setIdiomas}
          />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancelar
          </button>
          <button type="submit" className="submit-btn" disabled={isCreating}>
            {isCreating ? "Creando..." : "Crear y Seleccionar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthorCreateTab;
