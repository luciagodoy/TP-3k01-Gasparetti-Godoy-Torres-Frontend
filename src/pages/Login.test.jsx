import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import { AuthContext } from '../context/authContextObject';
import { authService } from '../services/recursos';

vi.mock('../services/recursos', () => ({ authService: { login: vi.fn() } }));

function MostrarState() {
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
  it('muestra un error y no intenta loguear si el formulario está incompleto', () => {
    const login = vi.fn();
    renderLogin(login);

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(screen.getByText(/completa usuario y contraseña/i)).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  // Regresión: "Reservar" sin sesión manda al login con la selección en
  // state.from.state. navigate(from) descartaba ese state, /reservar arrancaba
  // sin habitación ni fechas y devolvía al usuario a /buscar.
  it('después de iniciar sesión vuelve a la página de origen conservando su state', async () => {
    authService.login.mockResolvedValue({ token: 't', usuario: { id: 1, username: 'ana', role: 'huesped' } });
    const seleccion = { habitacionId: 5, fechaInicio: '2026-11-01', fechaFin: '2026-11-03' };

    render(
      <AuthContext.Provider value={{ login: vi.fn() }}>
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/reservar', state: seleccion } } }]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reservar" element={<MostrarState />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Usuario o email'), { target: { value: 'ana' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'clave123' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(JSON.parse((await screen.findByTestId('state')).textContent)).toEqual(seleccion);
  });
});
