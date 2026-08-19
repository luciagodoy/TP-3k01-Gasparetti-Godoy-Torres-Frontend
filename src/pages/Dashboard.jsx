import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  const menuItems = [
    { title: 'Buscar Habitaciones', path: '/buscar', description: 'Explorar y reservar' },
    ...(user
      ? [{ title: 'Mis Reservas', path: '/mis-reservas', description: 'Ver y gestionar tus reservas' }]
      : []),
    ...(user?.role === 'admin'
      ? [
          { title: 'Reservas', path: '/reservas', description: 'Gestionar reservas' },
          { title: 'Habitaciones', path: '/habitaciones', description: 'Administrar habitaciones' },
          { title: 'Huéspedes', path: '/huespedes', description: 'Gestionar huéspedes' },
          { title: 'Categorías', path: '/categorias', description: 'Categorías de habitación' },
          { title: 'Check-in/out', path: '/checkin', description: 'Entrada y salida' },
          { title: 'Servicios', path: '/servicios', description: 'Servicios adicionales del hotel' },
          { title: 'Cupos', path: '/cupos', description: 'Disponibilidad de los servicios' },
          { title: 'Precios de Servicios', path: '/precios-servicio', description: 'Vigencia y precio de cada servicio' },
          { title: 'Consumos de Servicio', path: '/reserva-servicios', description: 'Servicios agregados a una reserva' },
          { title: 'Provincias', path: '/provincias', description: 'Provincias registradas' },
          { title: 'Ciudades', path: '/ciudades', description: 'Ciudades registradas' },
          { title: 'Empleados', path: '/empleados', description: 'Personal del hotel' },
          { title: 'Usuarios', path: '/usuarios', description: 'Cuentas y roles de acceso' },
        ]
      : []),
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <span className="eyebrow">Bienvenido</span>
        <h2>Una estadía a tu manera</h2>
        <p>Explorá habitaciones, reservá en minutos y gestioná tu estadía de principio a fin.</p>
        <div className="hero-actions">
          <Link to="/buscar" className="btn btn-primary">Buscar Habitaciones</Link>
          <Link to="/mis-reservas" className="btn btn-secondary">Mis Reservas</Link>
        </div>
      </div>

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
