export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES');
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const isDateAfter = (date1: string, date2: string): boolean => {
  return new Date(date1) > new Date(date2);
};

export const isDateBefore = (date1: string, date2: string): boolean => {
  return new Date(date1) < new Date(date2);
};