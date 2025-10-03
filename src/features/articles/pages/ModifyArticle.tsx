import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";
import { useAuth } from "../../auth/hooks";
import { ROUTES } from "../../../shared/constants";
import { articleService } from "../services";
import { Article } from "../types";
import "./ModifyArticle.css";

/**
 * Página para buscar y seleccionar un artículo para modificar
 * Similar al patrón de ModifyResearcher
 */
const ModifyArticle: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Error during logout:', error);
      navigate(ROUTES.LOGIN);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("Por favor, ingrese un término de búsqueda (título, procedencia, etc.)");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await articleService.getAll({ search: searchTerm });
      setSearchResults(results);

      if (results.length === 0) {
        alert("No se encontraron artículos con ese criterio.");
      }
    } catch (error) {
      console.error("Error al buscar artículos:", error);
      alert("Error al buscar artículos. Por favor, intente nuevamente.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectArticle = (articleId: number) => {
    navigate(`/articles/${articleId}/edit`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'recibido':
        return 'badge-recibido';
      case 'asignado':
        return 'badge-asignado';
      case 'aceptado':
        return 'badge-aceptado';
      case 'rechazado':
        return 'badge-rechazado';
      case 'publicado':
        return 'badge-publicado';
      default:
        return 'badge-default';
    }
  };

  const formatEstado = (estado: string) => {
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  return (
    <div className="app-layout">
      <PageHeader onLogout={handleLogout} />

      <main className="main-content">
        <div className="form-container">

          <div className="search-section">
            <div className="form-group">
              <label>Búsqueda por Título o Procedencia</label>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Ingrese título, procedencia del artículo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSearching}
                  style={{ flex: 1, padding: '10px', fontSize: '16px' }}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSearching ? 'not-allowed' : 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  {isSearching ? "Buscando..." : "Buscar"}
                </button>
              </div>
              <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                💡 Busca por título del artículo o procedencia
              </small>
            </div>

            {hasSearched && searchResults.length > 0 && (
              <div className="results-section" style={{ marginTop: '30px' }}>
                <h3>Resultados de la búsqueda ({searchResults.length})</h3>
                <div className="table-responsive">
                  <table className="articles-table">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Procedencia</th>
                        <th>Estado</th>
                        <th>Fecha Recepción</th>
                        <th>Número Editorial</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((article) => (
                        <tr key={article.id}>
                          <td style={{ maxWidth: '300px' }}>
                            <strong>{article.titulo}</strong>
                          </td>
                          <td>{article.procedencia}</td>
                          <td>
                            <span className={`badge ${getEstadoBadgeClass(article.estado)}`}>
                              {formatEstado(article.estado)}
                            </span>
                          </td>
                          <td>{new Date(article.fecha_recepcion).toLocaleDateString('es-ES')}</td>
                          <td>
                            {article.numero_editorial_info
                              ? `${article.numero_editorial_info.numero}-${article.numero_editorial_info.anio}`
                              : 'Sin asignar'}
                          </td>
                          <td>
                            <button
                              onClick={() => handleSelectArticle(article.id)}
                              className="btn-edit"
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Actualizar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {hasSearched && searchResults.length === 0 && !isSearching && (
              <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <p>No se encontraron artículos con ese criterio de búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModifyArticle;
