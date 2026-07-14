import { Outlet, NavLink } from 'react-router-dom';
import '../styles/layout.css';

export default function MainLayout() {
  const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/reservas', label: 'Reservas' },
    { to: '/habitaciones', label: 'Habitaciones' },
    { to: '/huespedes', label: 'Huéspedes' },
    { to: '/servicios', label: 'Servicios' },
    { to: '/empleados', label: 'Empleados' },
    { to: '/categorias', label: 'Categorías' },
  ];

  return (
    <div className="main-layout">
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1>🏨 Gestión Hotelera</h1>
          </div>
          <nav className="navbar-menu">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2026 TP DSW - Hotel Management System</p>
      </footer>
    </div>
  );
}
