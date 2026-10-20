import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../context/authContextObject';
import { ADMIN_ROLES, ROLES, STAFF_ROLES } from '../models';

function renderWithAuth(authValue, { roles } = {}) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/login" element={<div>Página de login</div>} />
          <Route element={<ProtectedRoute roles={roles} />}>
            <Route path="/private" element={<div>Contenido privado</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when nobody is logged in', () => {
    renderWithAuth({ user: null, loading: false });
    expect(screen.getByText('Página de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('shows the protected content to a logged-in user when no role is required', () => {
    renderWithAuth({ user: { username: 'ana', role: ROLES.GUEST }, loading: false });
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('blocks access when the user role is not allowed', () => {
    renderWithAuth({ user: { username: 'ana', role: ROLES.GUEST }, loading: false }, { roles: [ROLES.ADMIN] });
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
    expect(screen.getByText(/Acceso restringido/i)).toBeInTheDocument();
  });

  it('allows access when the user role is in the allowed list', () => {
    renderWithAuth({ user: { username: 'root', role: ROLES.ADMIN }, loading: false }, { roles: [ROLES.ADMIN] });
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  // Regression: the management pages required roles={['admin']} and an employee,
  // whom the backend does authorize (auth.staff), could not open any of them.
  it('lets an employee into the staff pages', () => {
    renderWithAuth({ user: { username: 'emp', role: ROLES.EMPLOYEE }, loading: false }, { roles: STAFF_ROLES });
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('keeps an employee out of the admin-only pages', () => {
    renderWithAuth({ user: { username: 'emp', role: ROLES.EMPLOYEE }, loading: false }, { roles: ADMIN_ROLES });
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
    expect(screen.getByText(/Acceso restringido/i)).toBeInTheDocument();
  });
});
