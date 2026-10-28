// Las mismas reglas que aplica el backend (src/shared/account-rules.ts), para avisar antes de
// enviar. Si cambian allá, hay que cambiarlas acá: el servidor es el que decide.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
export const PASSWORD_MIN = 8;

const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCUMENT_PATTERN = /^[A-Za-z0-9]{6,15}$/;
const PHONE_PATTERN = /^[0-9+()\s-]{6,20}$/;

const trimmed = (value) => (typeof value === 'string' ? value.trim() : '');

// Devuelve { campo: mensaje } con los campos inválidos; vacío si está todo bien.
export function validateRegistration(form) {
  const errors = {};
  const username = trimmed(form.username);
  const email = trimmed(form.email);
  const phone = trimmed(form.phone);
  const documentNumber = trimmed(form.documentNumber);
  const { password = '', confirmPassword = '' } = form;

  if (!username) errors.username = 'Ingresá un nombre de usuario.';
  else if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    errors.username = `El usuario debe tener entre ${USERNAME_MIN} y ${USERNAME_MAX} caracteres.`;
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.username = 'Usá sólo letras, números, punto, guion o guion bajo.';
  }

  if (!email) errors.email = 'Ingresá tu email.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'El email no tiene un formato válido.';

  if (!password) errors.password = 'Ingresá una contraseña.';
  else if (password.length < PASSWORD_MIN) {
    errors.password = `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`;
  } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'La contraseña debe combinar letras y números.';
  }

  // Sólo en el cliente: el servidor recibe una única contraseña.
  if (!confirmPassword) errors.confirmPassword = 'Repetí la contraseña.';
  else if (password && confirmPassword !== password) errors.confirmPassword = 'Las contraseñas no coinciden.';

  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = 'El teléfono sólo puede tener números, espacios, +, - y paréntesis.';
  }

  if (!documentNumber) errors.documentNumber = 'Ingresá tu documento.';
  else if (!DOCUMENT_PATTERN.test(documentNumber)) {
    errors.documentNumber = 'El documento debe tener entre 6 y 15 letras o números, sin puntos ni espacios.';
  }

  if (!form.cityId) errors.cityId = 'Elegí tu provincia y ciudad.';

  return errors;
}

export function validateLogin(form) {
  const errors = {};
  if (!trimmed(form.username)) errors.username = 'Ingresá tu usuario o email.';
  if (!form.password) errors.password = 'Ingresá tu contraseña.';
  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
