import { describe, it, expect } from 'vitest';
import { validateLogin, validateRegistration } from './accountRules';

const valid = {
  username: 'ana.perez',
  email: 'ana@example.com',
  password: 'clave123',
  confirmPassword: 'clave123',
  phone: '',
  documentNumber: '30111222',
  cityId: 7,
};

describe('validateRegistration', () => {
  it('accepts a complete form', () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it.each([
    ['a short username', { username: 'ab' }, 'username', 'El usuario debe tener entre 3 y 30 caracteres.'],
    ['a username with spaces', { username: 'ana perez' }, 'username', 'Usá sólo letras, números, punto, guion o guion bajo.'],
    ['an email without domain', { email: 'ana@' }, 'email', 'El email no tiene un formato válido.'],
    ['a short password', { password: 'abc1', confirmPassword: 'abc1' }, 'password', 'La contraseña debe tener al menos 8 caracteres.'],
    ['a password without numbers', { password: 'abcdefgh', confirmPassword: 'abcdefgh' }, 'password', 'La contraseña debe combinar letras y números.'],
    ['a document with dots', { documentNumber: '30.111.222' }, 'documentNumber', 'El documento debe tener entre 6 y 15 letras o números, sin puntos ni espacios.'],
    ['a phone with letters', { phone: 'llamame' }, 'phone', 'El teléfono sólo puede tener números, espacios, +, - y paréntesis.'],
  ])('rejects %s', (_case, change, field, message) => {
    expect(validateRegistration({ ...valid, ...change })).toEqual({ [field]: message });
  });
});

describe('validateLogin', () => {
  it('asks for both fields, ignoring blank usernames', () => {
    expect(validateLogin({ username: '   ', password: '' })).toEqual({
      username: 'Ingresá tu usuario o email.',
      password: 'Ingresá tu contraseña.',
    });
  });
});
