import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import { AuthContext } from '../context/authContextObject';
import { authService } from '../services/resources';

vi.mock('../services/resources', () => ({ authService: { login: vi.fn() } }));

function ShowState() {
  const location = useLocation();
  return <pre data-testid="state">{JSON.stringify(location.state)}</pre>;
}

function renderLogin(login = vi.fn()) {
  render(
    <AuthContext.Provider value={{ login }}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('Login', () => {
  it('shows an error and does not try to log in when the form is incomplete', () => {
    const login = vi.fn();
    renderLogin(login);

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(screen.getByText('Completá usuario y contraseña.')).toBeInTheDocument();
    expect(screen.getByText('Ingresá tu usuario o email.')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario o Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Usuario o Email')).toHaveFocus();
    expect(login).not.toHaveBeenCalled();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('marks both fields when the credentials are wrong, and clears the mark on typing', async () => {
    authService.login.mockRejectedValue(Object.assign(new Error('Credenciales inválidas'), { status: 401 }));
    renderLogin();

    fireEvent.change(screen.getByLabelText('Usuario o Email'), { target: { value: 'ana' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'mala1234' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByText('El usuario o la contraseña no son correctos.')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario o Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'true');

    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'otra1234' } });
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'false');
  });

  it('shows any other server error without breaking the form', async () => {
    authService.login.mockRejectedValue(
      Object.assign(new Error('Demasiados intentos de inicio de sesión. Probá de nuevo en unos minutos.'), { status: 429 })
    );
    renderLogin();

    fireEvent.change(screen.getByLabelText('Usuario o Email'), { target: { value: 'ana' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'clave123' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos');
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeEnabled();
  });
  it('after logging in goes back to the origin page keeping its state', async () => {
    authService.login.mockResolvedValue({ token: 't', user: { id: 1, username: 'ana', role: 'huesped' } });
    const selection = { roomId: 5, startDate: '2026-11-01', endDate: '2026-11-03' };

    render(
      <AuthContext.Provider value={{ login: vi.fn() }}>
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/book', state: selection } } }]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/book" element={<ShowState />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText('Usuario o Email'), { target: { value: 'ana' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'clave123' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(JSON.parse((await screen.findByTestId('state')).textContent)).toEqual(selection);
  });
});
