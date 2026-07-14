import { Link } from 'react-router-dom';
import '../styles/dashboard.css';

export default function Dashboard() {
  const menuItems = [
    { title: 'Reservas', icon: '📅', path: '/reservas', description: 'Gestionar reservas' },
    { title: 'Habitaciones', icon: '🛏️', path: '/habitaciones', description: 'Administrar habitaciones' },
    { title: 'Huéspedes', icon: '👥', path: '/huespedes', description: 'Gestionar huéspedes' },
    { title: 'Servicios', icon: '🛎️', path: '/servicios', description: 'Servicios adicionales' },
    { title: 'Check-in/out', icon: '🚪', path: '/checkin', description: 'Entrada y salida' },
    { title: 'Empleados', icon: '👔', path: '/empleados', description: 'Personal del hotel' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Bienvenido al Sistema de Gestión Hotelera</h2>
        <p>Selecciona una opción para comenzar</p>
      </div>

      <div className="menu-grid">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} className="menu-card">
            <div className="menu-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
