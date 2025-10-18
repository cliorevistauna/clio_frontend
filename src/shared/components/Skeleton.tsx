import React from 'react';

type SkeletonVariant = 'table' | 'form' | 'card' | 'page' | 'text' | 'circle';

interface SkeletonProps {
  variant: SkeletonVariant;
  rows?: number;
  fields?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const styles = {
  skeleton: {
    backgroundColor: '#e0e0e0',
    backgroundImage: 'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 50%, #e0e0e0 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px'
  },
  tableContainer: {
    width: '100%',
    padding: '20px'
  },
  tableRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  tableCell: {
    flex: 1,
    height: '40px'
  },
  formContainer: {
    width: '100%',
    padding: '20px'
  },
  formField: {
    marginBottom: '20px'
  },
  formLabel: {
    width: '150px',
    height: '16px',
    marginBottom: '8px'
  },
  formInput: {
    width: '100%',
    height: '40px'
  },
  cardContainer: {
    padding: '20px',
    width: '100%'
  },
  cardHeader: {
    width: '60%',
    height: '24px',
    marginBottom: '16px'
  },
  cardLine: {
    width: '100%',
    height: '16px',
    marginBottom: '12px'
  },
  cardLineShort: {
    width: '80%',
    height: '16px'
  },
  pageContainer: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '20px'
  },
  pageHeader: {
    width: '100%',
    height: '60px',
    marginBottom: '20px'
  },
  pageContent: {
    flex: 1,
    width: '100%'
  },
  text: {
    width: '100%',
    height: '16px'
  },
  circle: {
    borderRadius: '50%'
  }
};

// Añadir la animación CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;
if (!document.head.querySelector('style[data-skeleton-animation]')) {
  styleSheet.setAttribute('data-skeleton-animation', 'true');
  document.head.appendChild(styleSheet);
}

/**
 * Componente Skeleton para estados de carga
 * Proporciona diferentes variantes para diferentes tipos de contenido
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant,
  rows = 5,
  fields = 8,
  width,
  height,
  className
}) => {
  const baseStyle = {
    ...styles.skeleton,
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {})
  };

  const renderTable = () => (
    <div style={styles.tableContainer}>
      {/* Header row */}
      <div style={styles.tableRow}>
        {[...Array(4)].map((_, i) => (
          <div
            key={`header-${i}`}
            style={{ ...baseStyle, ...styles.tableCell, height: '40px' }}
          />
        ))}
      </div>
      {/* Data rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} style={styles.tableRow}>
          {[...Array(4)].map((_, cellIndex) => (
            <div
              key={`cell-${rowIndex}-${cellIndex}`}
              style={{ ...baseStyle, ...styles.tableCell }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  const renderForm = () => (
    <div style={styles.formContainer}>
      {[...Array(fields)].map((_, i) => (
        <div key={`field-${i}`} style={styles.formField}>
          <div style={{ ...baseStyle, ...styles.formLabel }} />
          <div style={{ ...baseStyle, ...styles.formInput }} />
        </div>
      ))}
    </div>
  );

  const renderCard = () => (
    <div style={styles.cardContainer}>
      <div style={{ ...baseStyle, ...styles.cardHeader }} />
      <div style={{ ...baseStyle, ...styles.cardLine }} />
      <div style={{ ...baseStyle, ...styles.cardLine }} />
      <div style={{ ...baseStyle, ...styles.cardLineShort }} />
    </div>
  );

  const renderPage = () => (
    <div style={styles.pageContainer}>
      <div style={{ ...baseStyle, ...styles.pageHeader }} />
      <div style={{ ...baseStyle, ...styles.pageContent }} />
    </div>
  );

  const renderText = () => (
    <div style={{ ...baseStyle, ...styles.text }} className={className} />
  );

  const renderCircle = () => (
    <div
      style={{
        ...baseStyle,
        ...styles.circle,
        width: width || '40px',
        height: height || '40px'
      }}
      className={className}
    />
  );

  switch (variant) {
    case 'table':
      return renderTable();
    case 'form':
      return renderForm();
    case 'card':
      return renderCard();
    case 'page':
      return renderPage();
    case 'text':
      return renderText();
    case 'circle':
      return renderCircle();
    default:
      return renderText();
  }
};
