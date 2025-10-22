import React, { useState, useEffect } from "react";
import { HeaderWithToggle } from "../../../shared/components/HeaderWithToggle";
import { editorialNumberService } from "../services";
import { CreateEditorialNumberRequest } from "../types";
import { DateInput } from "../../../shared/components/ui";
import {
  getCurrentDateFrontend,
  frontendToBackendDate,
  backendToFrontendDate,
  isValidFrontendDateFormat
} from "../../../shared/utils/dateUtils";
import { useViewMode } from "../../../shared/contexts/ViewModeContext";

const CreateEditorialNumber: React.FC = () => {
  const { viewMode } = useViewMode();
  const [numero, setNumero] = useState("");
  const [anio, setAnio] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usarHoyInicio, setUsarHoyInicio] = useState(false);
  const [usarHoyFin, setUsarHoyFin] = useState(false);

  // RF-008: El año vigente debe cargarse automáticamente
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setAnio(currentYear.toString());
  }, []);

  // Manejar cambio de checkbox "Hoy" para fecha de inicio
  const handleUsarHoyInicio = (checked: boolean) => {
    setUsarHoyInicio(checked);
    if (checked) {
      setFechaInicio(getCurrentDateFrontend());
    } else {
      setFechaInicio("");
    }
  };

  // Manejar cambio de checkbox "Hoy" para fecha de fin
  const handleUsarHoyFin = (checked: boolean) => {
    setUsarHoyFin(checked);
    if (checked) {
      setFechaFin(getCurrentDateFrontend());
    } else {
      setFechaFin("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas front-end
    if (!numero || !anio || !fechaInicio || !fechaFin) {
      alert("Debe completar todos los campos obligatorios.");
      return;
    }

    // Validar que número y año sean números válidos
    const numeroInt = parseInt(numero);
    const anioInt = parseInt(anio);

    if (isNaN(numeroInt) || numeroInt <= 0) {
      alert("El número debe ser un valor positivo.");
      return;
    }

    if (isNaN(anioInt) || anioInt < 1990 || anioInt > new Date().getFullYear() + 10) {
      alert("Ingrese un año válido.");
      return;
    }

    // Validar formato de fecha (DD-MM-YYYY en frontend)
    if (!isValidFrontendDateFormat(fechaInicio) || !isValidFrontendDateFormat(fechaFin)) {
      alert("Las fechas deben estar en formato DD-MM-YYYY.");
      return;
    }

    // Convertir fechas a formato backend para comparación
    const fechaInicioBackend = frontendToBackendDate(fechaInicio);
    const fechaFinBackend = frontendToBackendDate(fechaFin);

    // Validar que la fecha de inicio sea anterior a la de fin
    if (new Date(fechaInicioBackend) >= new Date(fechaFinBackend)) {
      alert("La fecha de inicio debe ser anterior a la fecha de finalización.");
      return;
    }

    setIsLoading(true);

    try {
      // Validar solapamiento de fechas antes de enviar
      const conflictingNumber = await editorialNumberService.checkDateOverlap(
        fechaInicioBackend,
        fechaFinBackend
      );

      if (conflictingNumber) {
        alert(
          `Las fechas se solapan con el periodo ${conflictingNumber.numero}-${conflictingNumber.anio} ` +
          `(vigente desde ${backendToFrontendDate(conflictingNumber.fecha_inicio || '')} hasta ${backendToFrontendDate(conflictingNumber.fecha_final || '')}).\n\n` +
          `No pueden existir dos periodos de publicación vigentes simultáneamente.\n` +
          `Por favor, ajuste las fechas para evitar el solapamiento.`
        );
        setIsLoading(false);
        return;
      }
      const request: CreateEditorialNumberRequest = {
        numero: numeroInt,
        anio: anioInt,
        fecha_inicio: fechaInicioBackend, // Enviar en formato YYYY-MM-DD al backend
        fecha_final: fechaFinBackend, // Enviar en formato YYYY-MM-DD al backend
        comentarios: comentarios || "",
      };

      await editorialNumberService.create(request);

      alert("Periodo creado exitosamente.");

      // Limpiar el formulario
      setNumero("");
      setAnio(new Date().getFullYear().toString()); // Mantener el año actual
      setFechaInicio("");
      setFechaFin("");
      setComentarios("");
      setUsarHoyInicio(false);
      setUsarHoyFin(false);

    } catch (error: any) {
      console.error("Error al crear el periodo:", error);

      // RF-008: Mostrar mensaje específico para número editorial duplicado
      let errorMessage = "Error al crear el periodo.";

      if (error?.details && typeof error.details === 'object') {
        // Verificar si es error de validación de unicidad
        const details = error.details;
        if (details.non_field_errors && Array.isArray(details.non_field_errors)) {
          const uniqueError = details.non_field_errors.find((err: string) =>
            err.includes('numero') && err.includes('anio')
          );
          if (uniqueError) {
            errorMessage = "Este periodo ya existe.";
          }
        }

        // Verificar otros errores de validación
        if (details.numero && Array.isArray(details.numero) && details.numero.length > 0) {
          errorMessage = details.numero[0];
        } else if (details.anio && Array.isArray(details.anio) && details.anio.length > 0) {
          errorMessage = details.anio[0];
        } else if (details.message) {
          errorMessage = details.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`app-layout ${viewMode === 'wide' ? 'wide-layout' : ''}`}>
      {/* Header fijo arriba */}
      <HeaderWithToggle onLogout={() => console.log("Logout")} />

      {/* Contenido principal */}
      <main className="main-content">
        <div className="form-container">
          <h2>Formulario de Registro</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Periodo *</label>
              <input
                type="number"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                min="1"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Año *</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                min="1990"
                max={new Date().getFullYear() + 10}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Fecha de Inicio *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <DateInput
                    value={fechaInicio}
                    onChange={setFechaInicio}
                    disabled={isLoading || usarHoyInicio}
                    required
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0, whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={usarHoyInicio}
                    onChange={(e) => handleUsarHoyInicio(e.target.checked)}
                    disabled={isLoading}
                  />
                  Hoy
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Fecha de Finalización *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <DateInput
                    value={fechaFin}
                    onChange={setFechaFin}
                    disabled={isLoading || usarHoyFin}
                    required
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0, whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={usarHoyFin}
                    onChange={(e) => handleUsarHoyFin(e.target.checked)}
                    disabled={isLoading}
                  />
                  Hoy
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Comentarios</label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={3}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateEditorialNumber;