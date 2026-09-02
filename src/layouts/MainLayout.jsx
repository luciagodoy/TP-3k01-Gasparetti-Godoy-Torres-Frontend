import { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import crestLogo from '../assets/crest-logo-simple.png';
import '../styles/layout.css';

const GESTION_LINKS = [
  { to: '/reservas', label: 'Reservas' },
  { to: '/habitaciones', label: 'Habitaciones' },
  { to: '/huespedes', label: 'Huéspedes' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/checkin', label: 'Check-in/out' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const [gestionOpen, setGestionOpen] = useState(false);
  const gestionRef = useRef(null);

  useEffect(() => {
    setGestionOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (gestionRef.current && !gestionRef.current.contains(e.target)) {
        setGestionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            {!isAdmin && (
              <NavLink
                to="/buscar"
                className={({ isActive }) => `nav-link nav-link-solid${isActive ? ' active' : ''}`}
              >
                Buscar Habitaciones
              </NavLink>
            )}

            {!isAdmin && user && (
              <NavLink
                to="/mis-reservas"
                className={({ isActive }) => `nav-link nav-link-solid${isActive ? ' active' : ''}`}
              >
                Mis Reservas
              </NavLink>
            )}

            {isAdmin && (
              <div className={`nav-dropdown${gestionOpen ? ' open' : ''}`} ref={gestionRef}>
                <button
                  type="button"
                  className="nav-link nav-link-solid nav-dropdown-trigger"
                  onClick={() => setGestionOpen((prev) => !prev)}
                  aria-expanded={gestionOpen}
                  aria-haspopup="true"
                >
                  Gestión <span className="nav-dropdown-caret">▾</span>
                </button>
                <div className="nav-dropdown-menu">
                  {GESTION_LINKS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
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
        <div className="footer-brand">
          <img src={crestLogo} alt="" className="footer-crest" />
          <span className="footer-wordmark">Gestión Hotelera</span>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h3>Explorar</h3>
            <Link to="/">Inicio</Link>
            <Link to="/buscar">Buscar Habitaciones</Link>
            <Link to="/categorias">Categorías</Link>
          </div>

          <div className="footer-column">
            <h3>Cuenta</h3>
            {user ? (
              <Link to="/mis-reservas">Mis Reservas</Link>
            ) : (
              <>
                <Link to="/login">Iniciar Sesión</Link>
                <Link to="/registro">Crear Cuenta</Link>
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
