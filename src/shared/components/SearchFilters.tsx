import React from 'react';

export interface SearchFilter {
  id: string;
  type: 'thematic_line' | 'language' | 'country' | 'custom';
  value: string;
  label: string;
}

interface SearchFiltersProps {
  filters: SearchFilter[];
  onRemoveFilter: (filterId: string) => void;
  className?: string;
}

const styles = {
  filtersContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginTop: '10px',
    marginBottom: '10px'
  },
  filterBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500' as const,
    transition: 'all 0.2s ease'
  },
  filterBadgeThematicLine: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    border: '1px solid #90caf9'
  },
  filterBadgeLanguage: {
    backgroundColor: '#f3e5f5',
    color: '#6a1b9a',
    border: '1px solid #ce93d8'
  },
  filterBadgeCountry: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
    border: '1px solid #ffb74d'
  },
  filterBadgeCustom: {
    backgroundColor: '#f5f5f5',
    color: '#424242',
    border: '1px solid #bdbdbd'
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    padding: '0',
    marginLeft: '4px',
    lineHeight: '1',
    transition: 'transform 0.2s ease'
  },
  filterLabel: {
    fontSize: '11px',
    opacity: 0.8,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginRight: '4px'
  },
  emptyState: {
    fontSize: '13px',
    color: '#6c757d',
    fontStyle: 'italic' as const
  }
};

const getFilterTypeLabel = (type: SearchFilter['type']): string => {
  switch (type) {
    case 'thematic_line':
      return 'Línea Temática';
    case 'language':
      return 'Idioma';
    case 'country':
      return 'País';
    case 'custom':
      return 'Filtro';
    default:
      return 'Filtro';
  }
};

const getFilterStyle = (type: SearchFilter['type']) => {
  switch (type) {
    case 'thematic_line':
      return styles.filterBadgeThematicLine;
    case 'language':
      return styles.filterBadgeLanguage;
    case 'country':
      return styles.filterBadgeCountry;
    case 'custom':
    default:
      return styles.filterBadgeCustom;
  }
};

/**
 * Componente reutilizable para mostrar y gestionar filtros de búsqueda
 * Soporta diferentes tipos de filtros con estilos diferenciados
 */
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onRemoveFilter,
  className
}) => {
  if (filters.length === 0) {
    return (
      <div style={styles.emptyState}>
        No hay filtros activos
      </div>
    );
  }

  return (
    <div className={className} style={styles.filtersContainer}>
      {filters.map((filter) => (
        <span
          key={filter.id}
          style={{
            ...styles.filterBadge,
            ...getFilterStyle(filter.type)
          }}
        >
          <span style={styles.filterLabel}>
            {getFilterTypeLabel(filter.type)}:
          </span>
          <span>{filter.label}</span>
          <button
            onClick={() => onRemoveFilter(filter.id)}
            style={styles.removeButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label={`Eliminar filtro ${filter.label}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
};
