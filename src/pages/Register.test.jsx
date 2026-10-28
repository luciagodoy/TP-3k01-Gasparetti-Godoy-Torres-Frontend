import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import { guestService } from '../services/resources';

vi.mock('../services/resources', () => ({ guestService: { register: vi.fn() } }));

// El selector real pide provincias y ciudades a la API; acá alcanza con elegir una ciudad.
vi.mock('../components/LocationSelector', () => ({
  default: ({ onChange, error }) => (
    <div>
      <button type="button" onClick={() => onChange(7)}>
        Elegir Rosario
      </button>
      {error && <p>{error}</p>}
    </div>
  ),
}));

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const fillValidForm = () => {
  type('Usuario', 'ana.perez');
  type('Email', 'ana@example.com');
  type('Contraseña', 'clave123');
  type('Repetir contraseña', 'clave123');
  type('Documento de Identidad', '30111222');
  fireEvent.click(screen.getByRole('button', { name: 'Elegir Rosario' }));
};

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

describe('Register', () => {
  beforeEach(() => {
    guestService.register.mockReset();
  });

  it('marks every required field and does not call the API when the form is empty', () => {
    renderRegister();

    submit();

    expect(screen.getByRole('alert')).toHaveTextContent('Revisá los campos marcados.');
    expect(screen.getByText('Ingresá un nombre de usuario.')).toBeInTheDocument();
    expect(screen.getByText('Ingresá tu email.')).toBeInTheDocument();
    expect(screen.getByText('Elegí tu provincia y ciudad.')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Usuario')).toHaveFocus();
    expect(guestService.register).not.toHaveBeenCalled();
  });

  it('says when the passwords do not match', () => {
    renderRegister();
    fillValidForm();
    type('Repetir contraseña', 'clave124');

    submit();

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    expect(screen.getByLabelText('Repetir contraseña')).toHaveAttribute('aria-invalid', 'true');
    expect(guestService.register).not.toHaveBeenCalled();
  });

  it('shows the server message next to each field already taken', async () => {
    guestService.register.mockRejectedValue(
      Object.assign(new Error('La cuenta ya existe: Revisá los campos marcados.'), {
        status: 409,
        fields: { email: 'Ya existe una cuenta con ese email.' },
      })
    );
    renderRegister();
    fillValidForm();

    submit();

    expect(await screen.findByText('Ya existe una cuenta con ese email.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveFocus();
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('aria-invalid', 'false');
  });

  it('sends the trimmed data without the password confirmation', async () => {
    guestService.register.mockResolvedValue({ message: 'ok' });
    renderRegister();
    fillValidForm();
    type('Usuario', '  ana.perez  ');

    submit();

    expect(await screen.findByRole('status')).toHaveTextContent('Cuenta creada correctamente');
    expect(guestService.register).toHaveBeenCalledWith({
      username: 'ana.perez',
      email: 'ana@example.com',
      password: 'clave123',
      phone: null,
      documentNumber: '30111222',
      cityId: 7,
      country: 'Argentina',
    });
  });
});
