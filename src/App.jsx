import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import Habitaciones from './pages/Habitaciones';
import Huespedes from './pages/Huespedes';
import Servicios from './pages/Servicios';
import CheckIn from './pages/CheckIn';
import Empleados from './pages/Empleados';
import Categorias from './pages/Categorias';
import Cupos from './pages/Cupos';
import PrecioServicios from './pages/PrecioServicios';
import ReservaServicios from './pages/ReservaServicios';
import './styles/global.css';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="habitaciones" element={<Habitaciones />} />
          <Route path="huespedes" element={<Huespedes />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="cupos" element={<Cupos />} />
          <Route path="precio-servicios" element={<PrecioServicios />} />
          <Route path="reserva-servicios" element={<ReservaServicios />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
