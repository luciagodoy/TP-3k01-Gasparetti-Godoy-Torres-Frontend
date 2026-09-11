import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Categorias from './pages/Categorias';
import Login from './pages/Login';
import Registro from './pages/Registro';
import BuscarHabitaciones from './pages/BuscarHabitaciones';
import NotFound from './pages/NotFound';
import './styles/global.css';
import './App.css';

// Las páginas detrás de sesión se cargan bajo demanda: quien entra sin loguearse
// (o como huésped) no puede llegar a ellas, así que no tiene sentido que pague
// su descarga en la primera visita junto con la landing.
const Reservas = lazy(() => import('./pages/Reservas'));
const Habitaciones = lazy(() => import('./pages/Habitaciones'));
const Huespedes = lazy(() => import('./pages/Huespedes'));
const CheckIn = lazy(() => import('./pages/CheckIn'));
const Servicios = lazy(() => import('./pages/Servicios'));
const Empleados = lazy(() => import('./pages/Empleados'));
const Provincias = lazy(() => import('./pages/Provincias'));
const Ciudades = lazy(() => import('./pages/Ciudades'));
const Cupos = lazy(() => import('./pages/Cupos'));
const PrecioServicios = lazy(() => import('./pages/PrecioServicios'));
const ReservaServicios = lazy(() => import('./pages/ReservaServicios'));
const Usuarios = lazy(() => import('./pages/Usuarios'));
const MisReservas = lazy(() => import('./pages/MisReservas'));
const Reservar = lazy(() => import('./pages/Reservar'));

function CargandoPagina() {
  return <div className="page-container">Cargando...</div>;
}

function App() {
  return (
    <Router>
      <Suspense fallback={<CargandoPagina />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="buscar" element={<BuscarHabitaciones />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Registro />} />
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="reservas" element={<Reservas />} />
              <Route path="habitaciones" element={<Habitaciones />} />
              <Route path="huespedes" element={<Huespedes />} />
              <Route path="checkin" element={<CheckIn />} />
              <Route path="servicios" element={<Servicios />} />
              <Route path="empleados" element={<Empleados />} />
              <Route path="provincias" element={<Provincias />} />
              <Route path="ciudades" element={<Ciudades />} />
              <Route path="cupos" element={<Cupos />} />
              <Route path="precios-servicio" element={<PrecioServicios />} />
              <Route path="reserva-servicios" element={<ReservaServicios />} />
              <Route path="usuarios" element={<Usuarios />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="mis-reservas" element={<MisReservas />} />
              <Route path="reservar" element={<Reservar />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
