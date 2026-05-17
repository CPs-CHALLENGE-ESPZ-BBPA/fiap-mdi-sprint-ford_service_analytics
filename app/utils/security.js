// Strips HTML tags and injection patterns from user input (XSS/command injection prevention)
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Allows only alphanumeric + hyphen — safe for use in URL path segments (FIPE API params)
export const sanitizeApiParam = (param) => {
  if (typeof param !== 'string') return '';
  return param.replace(/[^a-zA-Z0-9\-]/g, '');
};

export const validateEmail = (email) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);

export const validatePositiveNumber = (val) => {
  const n = parseFloat(String(val).replace(',', '.'));
  return !isNaN(n) && n > 0 && isFinite(n);
};

const SAFE_ERRORS = {
  network: 'Erro de conexão. Tente novamente mais tarde.',
  auth:    'Credenciais inválidas.',
  save:    'Não foi possível salvar. Tente novamente.',
  load:    'Não foi possível carregar os dados.',
  generic: 'Ocorreu um erro inesperado. Tente novamente.',
};

// Returns a user-facing message that never exposes stack traces or internal details
export const safeError = (context = 'generic') =>
  SAFE_ERRORS[context] || SAFE_ERRORS.generic;
