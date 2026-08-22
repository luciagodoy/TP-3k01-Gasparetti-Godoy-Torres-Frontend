import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import crestLogo from '../assets/crest-logo-simple.png';
import '../styles/layout.css';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/buscar', label: 'Buscar Habitaciones' },
    ...(user?.role === 'admin'
      ? [
          { to: '/reservas', label: 'Reservas' },
          { to: '/habitaciones', label: 'Habitaciones' },
          { to: '/huespedes', label: 'Huéspedes' },
          { to: '/categorias', label: 'Categorías' },
          { to: '/checkin', label: 'Check-in/out' },
        ]
      : []),
    ...(user ? [{ to: '/mis-reservas', label: 'Mis Reservas' }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="main-layout">
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <img src={crestLogo} alt="" className="navbar-crest" />
            <h1>Gestión Hotelera</h1>
          </Link>
          <nav className="navbar-menu">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link${item.to === '/buscar' ? ' nav-link-solid' : ''}${isActive ? ' active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="navbar-auth">
            {user ? (
              <>
                <span>Hola, {user.username}</span>
                <button className="btn btn-small" onClick={handleLogout}>Cerrar sesión</button>
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link nav-link-solid${isActive ? ' active' : ''}`}
              >
                Iniciar sesión
              </NavLink>
            )}
          </div>
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
