import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import DateInput from '../components/DateInput';
import '../styles/pages.css';
import '../styles/rooms.css';

function GaleriaImagenes({ imagenes, alt }) {
  const [indice, setIndice] = useState(0);

  if (!imagenes || imagenes.length === 0) {
    return <div className="room-card-image-placeholder">Sin imagen</div>;
  }

  const anterior = (e) => {
    e.stopPropagation();
    setIndice((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const siguiente = (e) => {
    e.stopPropagation();
    setIndice((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="room-card-gallery">
      <img className="room-card-image" src={imagenes[indice]} alt={alt} />
      {imagenes.length > 1 && (
        <>
          <button className="room-card-gallery-nav prev" onClick={anterior} type="button" aria-label="Foto anterior">‹</button>
          <button className="room-card-gallery-nav next" onClick={siguiente} type="button" aria-label="Foto siguiente">›</button>
          <div className="room-card-gallery-dots">
            {imagenes.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`room-card-gallery-dot${i === indice ? ' active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setIndice(i); }}
                aria-label={`Ver foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
