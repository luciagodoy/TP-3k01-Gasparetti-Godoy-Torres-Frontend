import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import useQuery from '../hooks/useQuery';
import { useAuth } from '../context/useAuth';
import DateInput from '../components/DateInput';
import GaleriaImagenes from '../components/GaleriaImagenes';
import '../styles/pages.css';
import '../styles/rooms.css';

const construirConsulta = (filtros) => {
  const params = new URLSearchParams();
  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
  if (filtros.personas) params.append('personas', filtros.personas);
  const query = params.toString();
  return query ? `?${query}` : '';
};

export default function BuscarHabitaciones() {
  const location = useLocation();
  // Si venimos del buscador de la landing (BookingBar), llega con los filtros
  // ya elegidos en location.state; si no, arranca vacío.
  const [filtros, setFiltros] = useState(() => ({
    fechaInicio: '',
    fechaFin: '',
    categoriaId: '',
    personas: '',
    ...(location.state || {}),
  }));
  const [error, setError] = useState(null);
  const { user, huesped } = useAuth();
  const navigate = useNavigate();

  // La búsqueda vive en la key de useQuery: la carga inicial y el botón
  // "Buscar" recorren el mismo camino, así que no hace falta un efecto de
  // montaje aparte. El id se incrementa en cada click para que volver a buscar
  // con los mismos filtros igual vuelva a pedir los datos.
  const [consulta, setConsulta] = useState(() => ({
    qs: construirConsulta({
      fechaInicio: '',
      fechaFin: '',
      categoriaId: '',
      personas: '',
      ...(location.state || {}),
    }),
    id: 0,
  }));

  const { data: categorias } = useQuery('/categorias', () => api.get('/categorias'), {
    initialData: [],
    onError: (err) => setError(err.message),
  });

  const { data: habitaciones, loading } = useQuery(
    `habitaciones:${consulta.id}:${consulta.qs}`,
    () => api.get(`/habitaciones${consulta.qs}`),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const buscar = () => {
    setError(null);
    setConsulta((prev) => ({ qs: construirConsulta(filtros), id: prev.id + 1 }));
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleReservar = (grupo) => {
    // Se reserva "una habitación de esta categoría" — se asigna la primera disponible del grupo,
    // igual que en un hotel real no elegís el número exacto de habitación al reservar.
    const seleccion = {
      habitacionId: grupo.habitaciones[0].id,
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

  // Agrupamos las habitaciones encontradas por categoría: a los huéspedes les interesa
  // el tipo de habitación y cuántas hay disponibles, no el número de habitación puntual.
  const gruposPorCategoria = habitaciones.reduce((grupos, hab) => {
    const categoriaId = hab.categoria?.id;
    if (!categoriaId) return grupos;
    if (!grupos[categoriaId]) {
      grupos[categoriaId] = { categoria: hab.categoria, habitaciones: [] };
    }
    grupos[categoriaId].habitaciones.push(hab);
    return grupos;
  }, {});
  const listaGrupos = Object.values(gruposPorCategoria);
  const hayFechas = Boolean(filtros.fechaInicio && filtros.fechaFin);

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
        {listaGrupos.map((grupo) => (
          <div className="room-card" key={grupo.categoria.id}>
            <GaleriaImagenes imagenes={grupo.categoria.imagenesUrl} alt={grupo.categoria.denominacion} />
            <div className="room-card-body">
              <h3 className="room-card-title">{grupo.categoria.denominacion}</h3>
              <p className="room-card-meta">
                {hayFechas
                  ? `${grupo.habitaciones.length} disponible${grupo.habitaciones.length === 1 ? '' : 's'} para esas fechas`
                  : `${grupo.habitaciones.length} ${grupo.habitaciones.length === 1 ? 'habitación' : 'habitaciones'} en total`}
              </p>
              <p className="room-card-meta">Hasta {grupo.categoria.capacidadPersonas} personas</p>
              {grupo.categoria.descripcion && <p className="room-card-meta">{grupo.categoria.descripcion}</p>}
              <p className="room-card-price">${grupo.categoria.precioNoche ?? 0} / noche</p>
              <div className="room-card-footer">
                <button
                  className="btn btn-success"
                  onClick={() => handleReservar(grupo)}
                  disabled={!hayFechas}
                >
                  Reservar
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && listaGrupos.length === 0 && <p>No se encontraron habitaciones disponibles.</p>}
      </div>
    </div>
  );
}
