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

    expect(screen.getByText(/completa usuario y contraseña/i)).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  // Regression: "Reservar" without a session sends to the login with the
  // selection in state.from.state. navigate(from) dropped that state, /book
  // started without room or dates and sent the user back to /search.
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
