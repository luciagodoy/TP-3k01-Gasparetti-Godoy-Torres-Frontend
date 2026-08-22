import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import DateInput from '../components/DateInput';
import '../styles/pages.css';
import '../styles/rooms.css';

export default function BuscarHabitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({ fechaInicio: '', fechaFin: '', categoriaId: '', personas: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, huesped } = useAuth();
  const navigate = useNavigate();

  const fetchCategorias = async () => {
    try {
      const data = await api.get('/categorias');
      setCategorias(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const buscar = async () => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
      if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
      if (filtros.personas) params.append('personas', filtros.personas);
      const query = params.toString();
      const data = await api.get(`/habitaciones${query ? `?${query}` : ''}`);
      setHabitaciones(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleReservar = (habitacion) => {
    const seleccion = {
      habitacionId: habitacion.id,
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin,
    };

    if (!user) {
      navigate('/login', { state: { from: { pathname: '/reservar', state: seleccion } } });
      return;
    }
    if (!huesped) {
      setError('Tu cuenta no tiene un perfil de huésped asociado.');
      return;
    }
    navigate('/reservar', { state: seleccion });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Buscar Habitaciones</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="room-filters">
        <div className="form-group">
          <label>Fecha de Inicio</label>
          <DateInput name="fechaInicio" value={filtros.fechaInicio} onChange={handleFiltroChange} min={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="form-group">
          <label>Fecha de Fin</label>
          <DateInput name="fechaFin" value={filtros.fechaFin} onChange={handleFiltroChange} min={filtros.fechaInicio || new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="form-group">
          <label>Categoría</label>
          <select name="categoriaId" value={filtros.categoriaId} onChange={handleFiltroChange}>
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>{categoria.denominacion}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Personas</label>
          <input type="number" name="personas" min="1" value={filtros.personas} onChange={handleFiltroChange} />
        </div>
        <button className="btn btn-primary" onClick={buscar} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      <div className="room-grid">
        {habitaciones.map((hab) => (
          <div className="room-card" key={hab.id}>
            {hab.categoria?.imagenUrl ? (
              <img className="room-card-image" src={hab.categoria.imagenUrl} alt={hab.categoria?.denominacion} />
            ) : (
              <div className="room-card-image-placeholder">Sin imagen</div>
            )}
            <div className="room-card-body">
              <h3 className="room-card-title">{hab.categoria?.denominacion || 'Habitación'}</h3>
              <p className="room-card-meta">Habitación N° {hab.numero} · Piso {hab.piso}</p>
              <p className="room-card-meta">Hasta {hab.categoria?.capacidadPersonas} personas</p>
              {hab.categoria?.descripcion && <p className="room-card-meta">{hab.categoria.descripcion}</p>}
              <p className="room-card-price">${hab.categoria?.precioNoche ?? 0} / noche</p>
              <div className="room-card-footer">
                <button
                  className="btn btn-success"
                  onClick={() => handleReservar(hab)}
                  disabled={!filtros.fechaInicio || !filtros.fechaFin}
                >
                  Reservar
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && habitaciones.length === 0 && <p>No se encontraron habitaciones disponibles.</p>}
      </div>
    </div>
  );
}
