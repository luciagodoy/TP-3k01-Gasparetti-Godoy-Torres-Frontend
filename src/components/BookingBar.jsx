import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DateInput from './DateInput';
import '../styles/booking-bar.css';

const emptyFiltros = { fechaInicio: '', fechaFin: '', categoriaId: '', personas: '' };

export default function BookingBar() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState(emptyFiltros);

  useEffect(() => {
    api.get('/categorias').then((data) => setCategorias(data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/buscar', { state: filtros });
  };

  return (
    <form className="booking-bar" onSubmit={handleSubmit}>
      <div className="booking-bar-field">
        <label>Check In</label>
        <DateInput
          name="fechaInicio"
          value={filtros.fechaInicio}
          onChange={handleChange}
          min={new Date().toISOString().slice(0, 10)}
        />
      </div>
      <div className="booking-bar-field">
        <label>Check Out</label>
        <DateInput
          name="fechaFin"
          value={filtros.fechaFin}
          onChange={handleChange}
          min={filtros.fechaInicio || new Date().toISOString().slice(0, 10)}
        />
      </div>
      <div className="booking-bar-field">
        <label>Categoría</label>
        <select name="categoriaId" value={filtros.categoriaId} onChange={handleChange}>
          <option value="">Todas</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>{categoria.denominacion}</option>
          ))}
        </select>
      </div>
      <div className="booking-bar-field">
        <label>Huéspedes</label>
        <input
          type="number"
          name="personas"
          min="1"
          placeholder="1"
          value={filtros.personas}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="booking-bar-submit">Buscar Habitaciones</button>
    </form>
  );
}
