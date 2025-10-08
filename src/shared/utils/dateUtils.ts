/**
 * Utilidades para manejo de fechas en formato de Costa Rica (DD-MM-YYYY)
 * El frontend siempre muestra DD-MM-YYYY
 * El backend siempre recibe YYYY-MM-DD
 */

/**
 * Convierte fecha de formato backend (YYYY-MM-DD) a formato frontend (DD-MM-YYYY)
 * @param backendDate Fecha en formato YYYY-MM-DD
 * @returns Fecha en formato DD-MM-YYYY
 */
export const backendToFrontendDate = (backendDate: string): string => {
  if (!backendDate) return '';

  const [year, month, day] = backendDate.split('-');
  return `${day}-${month}-${year}`;
};

/**
 * Convierte fecha de formato frontend (DD-MM-YYYY) a formato backend (YYYY-MM-DD)
 * @param frontendDate Fecha en formato DD-MM-YYYY
 * @returns Fecha en formato YYYY-MM-DD
 */
export const frontendToBackendDate = (frontendDate: string): string => {
  if (!frontendDate) return '';

  const [day, month, year] = frontendDate.split('-');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha actual en formato frontend (DD-MM-YYYY)
 * @returns Fecha actual en formato DD-MM-YYYY
 */
export const getCurrentDateFrontend = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Obtiene la fecha actual en formato backend (YYYY-MM-DD)
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export const getCurrentDateBackend = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Valida que una fecha tenga formato DD-MM-YYYY
 * @param date Fecha a validar
 * @returns true si el formato es válido
 */
export const isValidFrontendDateFormat = (date: string): boolean => {
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  if (!regex.test(date)) return false;

  const [day, month, year] = date.split('-').map(Number);

  // Validar rangos básicos
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  // Validar que la fecha sea válida (considerando meses con menos días)
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getFullYear() === year &&
         dateObj.getMonth() === month - 1 &&
         dateObj.getDate() === day;
};

/**
 * Valida que una fecha tenga formato YYYY-MM-DD
 * @param date Fecha a validar
 * @returns true si el formato es válido
 */
export const isValidBackendDateFormat = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(date);
};

// ============================================
// Funciones legacy (mantener por compatibilidad)
// ============================================

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  // Si viene en formato YYYY-MM-DD, convertir a DD-MM-YYYY
  if (isValidBackendDateFormat(dateString)) {
    return backendToFrontendDate(dateString);
  }
  return dateString;
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES');
};

export const getCurrentDate = (): string => {
  return getCurrentDateBackend();
};

export const isDateAfter = (date1: string, date2: string): boolean => {
  return new Date(date1) > new Date(date2);
};

export const isDateBefore = (date1: string, date2: string): boolean => {
  return new Date(date1) < new Date(date2);
};