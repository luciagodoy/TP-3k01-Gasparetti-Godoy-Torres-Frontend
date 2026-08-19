import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { AuthContext } from '../context/authContextObject';

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
});
