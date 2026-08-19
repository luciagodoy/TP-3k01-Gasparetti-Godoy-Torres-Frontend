import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import Habitaciones from './pages/Habitaciones';
import Huespedes from './pages/Huespedes';
import CheckIn from './pages/CheckIn';
import Categorias from './pages/Categorias';
import Login from './pages/Login';
import Registro from './pages/Registro';
import BuscarHabitaciones from './pages/BuscarHabitaciones';
import Reservar from './pages/Reservar';
import MisReservas from './pages/MisReservas';
import NotFound from './pages/NotFound';
import './styles/global.css';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="buscar" element={<BuscarHabitaciones />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="habitaciones" element={<Habitaciones />} />
          <Route path="huespedes" element={<Huespedes />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="categorias" element={<Categorias />} />
          <Route element={<ProtectedRoute />}>
            <Route path="mis-reservas" element={<MisReservas />} />
            <Route path="reservar" element={<Reservar />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
