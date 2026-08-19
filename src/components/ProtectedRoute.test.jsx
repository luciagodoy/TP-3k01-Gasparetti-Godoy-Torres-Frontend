import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../context/authContextObject';

function renderWithAuth(authValue, { roles } = {}) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/privado']}>
        <Routes>
          <Route path="/login" element={<div>Página de login</div>} />
          <Route element={<ProtectedRoute roles={roles} />}>
            <Route path="/privado" element={<div>Contenido privado</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProtectedRoute', () => {
  it('redirige a /login cuando no hay usuario logueado', () => {
    renderWithAuth({ user: null, loading: false });
    expect(screen.getByText('Página de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('muestra el contenido protegido cuando hay un usuario logueado y no se exige un rol', () => {
    renderWithAuth({ user: { username: 'ana', role: 'huesped' }, loading: false });
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('bloquea el acceso cuando el rol del usuario no está permitido', () => {
    renderWithAuth({ user: { username: 'ana', role: 'huesped' }, loading: false }, { roles: ['admin'] });
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
    expect(screen.getByText(/Acceso restringido/i)).toBeInTheDocument();
  });

  it('permite el acceso cuando el rol del usuario está en la lista permitida', () => {
    renderWithAuth({ user: { username: 'root', role: 'admin' }, loading: false }, { roles: ['admin'] });
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});
