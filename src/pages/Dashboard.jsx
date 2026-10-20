import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import HeroCarousel from '../components/HeroCarousel';
import BookingBar from '../components/BookingBar';
import CategoryShowcase from '../components/CategoryShowcase';
import heroSuite from '../assets/hero/hero-suite.jpg';
import heroResort from '../assets/hero/hero-resort.jpg';
import heroPool from '../assets/hero/hero-pool.jpg';
import '../styles/dashboard.scss';

const heroImages = [heroSuite, heroResort, heroPool];

export default function Dashboard() {
  const { user } = useAuth();
  const isStaff = Boolean(user?.isStaff);
  const isAdmin = Boolean(user?.isAdmin);

  const menuItems = [
    ...(user
      ? [{ title: 'Mis Reservas', path: '/my-reservations', description: 'Ver y gestionar tus reservas' }]
      : []),
    ...(isStaff
      ? [
          { title: 'Reservas', path: '/reservations', description: 'Gestionar reservas' },
          { title: 'Habitaciones', path: '/rooms', description: 'Administrar habitaciones' },
          { title: 'Huéspedes', path: '/guests', description: 'Gestionar huéspedes' },
          { title: 'Categorías', path: '/room-categories', description: 'Categorías de habitación' },
          { title: 'Check-in/out', path: '/check-in', description: 'Entrada y salida' },
          { title: 'Servicios', path: '/amenities', description: 'Servicios adicionales del hotel' },
          { title: 'Cupos', path: '/amenity-quotas', description: 'Disponibilidad de los servicios' },
          { title: 'Precios de Servicios', path: '/amenity-prices', description: 'Vigencia y precio de cada servicio' },
          { title: 'Consumos de Servicio', path: '/reservation-amenities', description: 'Servicios agregados a una reserva' },
          { title: 'Tarifas Dinámicas', path: '/pricing-rules', description: 'Precio según ocupación y antelación' },
        ]
      : []),
    ...(isAdmin
      ? [
          { title: 'Empleados', path: '/employees', description: 'Personal del hotel' },
          { title: 'Usuarios', path: '/users', description: 'Cuentas y roles de acceso' },
        ]
      : []),
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <HeroCarousel images={heroImages} />
        <div className="hero-content">
          <span className="eyebrow">Bienvenido</span>
          <h2>Una estadía a tu manera</h2>
          <div className="hero-actions">
            <Link to="/my-reservations" className="btn btn-hero-secondary">Mis Reservas</Link>
          </div>
        </div>
      </div>

      <BookingBar />

      {!isStaff && <CategoryShowcase />}

      <div className="menu-grid">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} className="menu-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
