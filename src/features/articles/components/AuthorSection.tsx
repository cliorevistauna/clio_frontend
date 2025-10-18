import React from "react";
import { ResearcherSearchResult } from "../types";

interface AuthorSectionProps {
  selectedAuthor: ResearcherSearchResult | null;
  isSubmitting: boolean;
  onSelectAuthor: () => void;
}

const styles = {
  buttonFlexContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  primaryButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  authorSelectedContainer: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};

const AuthorSection: React.FC<AuthorSectionProps> = ({
  selectedAuthor,
  isSubmitting,
  onSelectAuthor
}) => {
  return (
    <div className="form-group">
      <label>Autor *</label>
      <div style={styles.buttonFlexContainer}>
        <button
          type="button"
          onClick={onSelectAuthor}
          disabled={isSubmitting}
          style={styles.primaryButton}
        >
          {selectedAuthor ? 'Cambiar Autor' : 'Seleccionar Autor'}
        </button>

        {selectedAuthor && (
          <div style={styles.authorSelectedContainer}>
            <span>
              <strong>{selectedAuthor.nombre} {selectedAuthor.apellido1} {selectedAuthor.apellido2}</strong>
              {' '}- {selectedAuthor.afiliacion}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorSection;
