export const validateEmail = (email: string): string => {
  if (!email) return "El correo electrónico es requerido";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Formato de correo electrónico inválido";
  }

  return "";
};

export const validatePassword = (password: string): string => {
  if (!password) return "La contraseña es requerida";

  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }

  return "";
};

export const validateRequired = (value: any, fieldName: string): string => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} es requerido`;
  }
  return "";
};

export const validateDate = (dateString: string): string => {
  if (!dateString) return "La fecha es requerida";

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return "Formato de fecha inválido (YYYY-MM-DD)";
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  return "";
};

export const validateOrcid = (orcid: string, required: boolean = false): string => {
  if (!orcid) {
    return required ? "ORCID es requerido" : "";
  }

  const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
  if (!orcidRegex.test(orcid)) {
    return "Formato de ORCID inválido (####-####-####-###X)";
  }

  return "";
};

export const validatePhone = (phone: string): string => {
  if (!phone) return "";

  const phoneRegex = /^\+?[\d\s\-()]+$/;
  if (!phoneRegex.test(phone)) {
    return "Formato de teléfono inválido";
  }

  return "";
};