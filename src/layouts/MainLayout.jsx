import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import ErrorBoundary from '../components/ErrorBoundary';
import crestLogo from '../assets/crest-logo-simple.png';
import '../styles/layout.scss';

const MANAGEMENT_LINKS = [
  { to: '/reservations', label: 'Reservas' },
  { to: '/rooms', label: 'Habitaciones' },
  { to: '/guests', label: 'Huéspedes' },
  { to: '/room-categories', label: 'Categorías' },
  { to: '/check-in', label: 'Check-in/out' },
];

const navLinkClass = ({ isActive }) => `nav-link nav-link-solid${isActive ? ' active' : ''}`;

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Employees and admins run the hotel: they get the management menu instead of
  // the guest options (it used to be admin-only, so an employee could reach
  // none of what the backend allows their role).
  const isStaff = Boolean(user?.isStaff);

  const [managementOpen, setManagementOpen] = useState(false);
  const managementRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (managementRef.current && !managementRef.current.contains(e.target)) {
        setManagementOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Closing on navigation happens in each item's onClick, not in an effect on
  // location.pathname: the effect ran on every route change wherever it came
  // from, and left closing at the mercy of render order.
  const closeManagement = ({ returnFocus = false } = {}) => {
    setManagementOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Without this the menu is mouse-only: there was no way to close it or move
  // through it with the keyboard.
  const handleManagementKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeManagement({ returnFocus: true });
      return;
    }

    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();

    // The menu is display:none while closed, so no item can be focused yet:
    // the first arrow opens it and the next one moves.
    if (!managementOpen) {
      setManagementOpen(true);
      return;
    }

    const items = Array.from(managementRef.current?.querySelectorAll('.nav-dropdown-item') || []);
    if (items.length === 0) return;

    const current = items.indexOf(document.activeElement);
    const nextIndex =
      current === -1
        ? (e.key === 'ArrowDown' ? 0 : items.length - 1)
        : (current + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;

    items[nextIndex].focus();
  };

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
            {!isStaff && (
              <NavLink to="/search" className={navLinkClass}>
                Buscar Habitaciones
              </NavLink>
            )}

            {!isStaff && user && (
              <NavLink to="/my-reservations" className={navLinkClass}>
                Mis Reservas
              </NavLink>
            )}

            {isStaff && (
              <div
                className={`nav-dropdown${managementOpen ? ' open' : ''}`}
                ref={managementRef}
                onKeyDown={handleManagementKeyDown}
              >
                <button
                  type="button"
                  ref={triggerRef}
                  className="nav-link nav-link-solid nav-dropdown-trigger"
                  onClick={() => setManagementOpen((prev) => !prev)}
                  aria-expanded={managementOpen}
                  aria-haspopup="menu"
                >
                  Gestión <span className="nav-dropdown-caret">▾</span>
                </button>
                <div className="nav-dropdown-menu" role="menu">
                  {MANAGEMENT_LINKS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      role="menuitem"
                      onClick={() => closeManagement()}
                      className={({ isActive }) => `nav-dropdown-item${isActive ? ' active' : ''}`}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>
          <div className="navbar-auth">
            {user ? (
              <>
                <span>Hola, {user.username}</span>
                <button className="nav-link nav-link-solid" onClick={handleLogout}>Cerrar sesión</button>
              </>
            ) : (
              <>
                <NavLink to="/register" className={navLinkClass}>
                  Registrarse
                </NavLink>
                <NavLink to="/login" className={navLinkClass}>
                  Iniciar sesión
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Keying the boundary by route remounts it on navigation: otherwise, once
            a page fails, the fallback sticks even after changing section. */}
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<div className="page-container">Cargando...</div>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <img src={crestLogo} alt="" className="footer-crest" />
          <span className="footer-wordmark">Gestión Hotelera</span>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h3>Explorar</h3>
            <Link to="/">Inicio</Link>
            <Link to="/search">Buscar Habitaciones</Link>
            <Link to="/room-categories">Categorías</Link>
          </div>

          <div className="footer-column">
            <h3>Cuenta</h3>
            {user ? (
              <Link to="/my-reservations">Mis Reservas</Link>
            ) : (
              <>
                <Link to="/login">Iniciar Sesión</Link>
                <Link to="/register">Crear Cuenta</Link>
              </>
            )}
          </div>

          <div className="footer-column">
            <h3>Contacto</h3>
            <a href="mailto:gestionhotelera2026@gmail.com">gestionhotelera2026@gmail.com</a>
            <span className="footer-address">Zeballos 1341, Rosario, Argentina</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 TP DSW - Hotel Management System</p>
        </div>
      </footer>
    </div>
  );
}
