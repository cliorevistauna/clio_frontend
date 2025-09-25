import React, { useState } from "react";
import PageHeader from "../../../shared/components/PageHeader";
import { CurrentEditorialNumberDisplay } from "../../editorial-numbers/components";

/**
 * RF-010: Ejemplo de formulario que muestra automáticamente el número editorial vigente
 */
const CreateArticle: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Artículo creado:", { title, content });
    alert("Artículo creado (ejemplo - no implementado completamente)");
  };

  return (
    <div className="app-layout">
      <PageHeader onLogout={() => console.log("Logout")} />

      <main className="main-content">
        <div className="form-container">
          <h2>Registrar Artículo</h2>

          {/* RF-010: Mostrar número editorial vigente precargado automáticamente */}
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '5px'
          }}>
            <CurrentEditorialNumberDisplay showLabel={true} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título del Artículo *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contenido</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>

            <button type="submit" className="submit-btn">
              Registrar Artículo
            </button>
          </form>

          <div style={{ marginTop: '20px', color: '#6c757d', fontSize: '14px' }}>
            <strong>Nota:</strong> Este formulario demuestra la implementación del RF-010.
            El número de publicación vigente se carga automáticamente y se actualiza
            en tiempo real durante la sesión activa.
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateArticle;