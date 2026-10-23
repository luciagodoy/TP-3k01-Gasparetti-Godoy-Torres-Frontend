import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { pricingService, roomCategoryService, roomService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import { useAuth } from '../context/useAuth';
import CategorySelector from '../components/CategorySelector';
import DateInput from '../components/DateInput';
import GuestSelector from '../components/GuestSelector';
import ImageGallery from '../components/ImageGallery';
import { largestCapacity } from '../models';
import '../styles/pages.scss';
import '../styles/rooms.scss';

const searchFilters = ({ startDate, endDate, categoryId, people }) => ({
  startDate, endDate, categoryId, people,
});

const today = () => new Date().toISOString().slice(0, 10);

export default function SearchRooms() {
  const location = useLocation();
  const [filters, setFilters] = useState(() => ({
    startDate: '',
    endDate: '',
    categoryId: '',
    people: '',
    ...(location.state || {}),
  }));
  const [error, setError] = useState(null);
  const { user, guest } = useAuth();
  const navigate = useNavigate();


  const [query, setQuery] = useState(() => ({
    filters: searchFilters(location.state || {}),
    id: 0,
  }));

  const { data: categories } = useQuery('/room-categories', () => roomCategoryService.list(), {
    initialData: [],
    onError: (err) => setError(err.message),
  });

  const { data: rooms, loading } = useQuery(
    `rooms:${query.id}:${JSON.stringify(query.filters)}`,
    () => roomService.list(query.filters),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const { startDate: searchedStart, endDate: searchedEnd } = query.filters;
  const hasDates = Boolean(searchedStart && searchedEnd);
  const { data: quotes } = useQuery(
    `quotes:${query.id}:${searchedStart}:${searchedEnd}`,
    () => pricingService.quote({ startDate: searchedStart, endDate: searchedEnd }),
    { initialData: [], enabled: hasDates, onError: (err) => setError(err.message) }
  );
  const quoteByCategory = new Map(quotes.map((quote) => [quote.categoryId, quote]));

  const search = () => {
    setError(null);
    setQuery((prev) => ({ filters: searchFilters(filters), id: prev.id + 1 }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleBook = (group) => {
    // El huésped reserva "una habitación de esta categoría": se le asigna la primera
    // disponible del grupo, igual que en un hotel real no se elige el número exacto.
    const selection = {
      roomId: group.rooms[0].id,
      startDate: searchedStart,
      endDate: searchedEnd,
    };

    if (!user) {
      navigate('/login', { state: { from: { pathname: '/book', state: selection } } });
      return;
    }
    if (!guest) {
      setError('Tu cuenta no tiene un perfil de huésped asociado.');
      return;
    }
    navigate('/book', { state: selection });
  };

  // Agrupa por categoría las habitaciones encontradas.
  const groupsByCategory = rooms.reduce((groups, room) => {
    const categoryId = room.category?.id;
    if (!categoryId) return groups;
    if (!groups[categoryId]) {
      groups[categoryId] = { category: room.category, rooms: [] };
    }
    groups[categoryId].rooms.push(room);
    return groups;
  }, {});
  const groups = Object.values(groupsByCategory);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Buscar Habitaciones</h2>
      </div>

      {error && <div role="alert" className="alert alert-error">{error}</div>}

      <div className="room-filters">
        <div className="form-group">
          <label htmlFor="search-start">Fecha de Inicio</label>
          <DateInput id="search-start" name="startDate" value={filters.startDate} onChange={handleFilterChange} min={today()} />
        </div>
        <div className="form-group">
          <label htmlFor="search-end">Fecha de Fin</label>
          <DateInput id="search-end" name="endDate" value={filters.endDate} onChange={handleFilterChange} min={filters.startDate || today()} />
        </div>
        <div className="form-group">
          <label id="search-category-label">Categoría</label>
          <CategorySelector
            id="search-category"
            labelId="search-category-label"
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
            categories={categories}
          />
        </div>
        <div className="form-group">
          <label htmlFor="search-people">Número de huéspedes</label>
          <GuestSelector id="search-people" name="people" value={filters.people} onChange={handleFilterChange} max={largestCapacity(categories)} />
        </div>
        <button className="btn btn-primary" onClick={search} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      <div className="room-grid">
        {groups.map((group) => {
          const quote = hasDates ? quoteByCategory.get(group.category.id) : null;
          return (
          <div className="room-card" key={group.category.id}>
            <ImageGallery images={group.category.imageUrls} alt={group.category.name} />
            <div className="room-card-body">
              <h3 className="room-card-title">{group.category.name}</h3>
              <p className="room-card-meta">
                {hasDates
                  ? `${group.rooms.length} disponible${group.rooms.length === 1 ? '' : 's'} para esas fechas`
                  : `${group.rooms.length} ${group.rooms.length === 1 ? 'habitación' : 'habitaciones'} en total`}
              </p>
              <p className="room-card-meta">Hasta {group.category.capacity} personas</p>
              {group.category.description && <p className="room-card-meta">{group.category.description}</p>}
              {quote ? (
                <>
                  <p className="room-card-price">
                    ${quote.total.toFixed(2)} por {quote.nights.length} {quote.nights.length === 1 ? 'noche' : 'noches'}
                  </p>
                  <p className="room-card-meta">
                    Promedio ${quote.averagePerNight.toFixed(2)} / noche
                    {quote.isAdjusted && ' · tarifa según ocupación y antelación'}
                  </p>
                </>
              ) : (
                <p className="room-card-price">Desde ${(group.category.pricePerNight ?? 0).toFixed(2)} / noche</p>
              )}
              <div className="room-card-footer">
                <span className="button-hint" title={hasDates ? undefined : 'Elegí las fechas de entrada y salida y tocá Buscar para poder reservar.'}>
                  <button
                    className="btn btn-success"
                    onClick={() => handleBook(group)}
                    disabled={!hasDates}
                  >
                    Reservar
                  </button>
                </span>
              </div>
            </div>
          </div>
          );
        })}
        {!loading && groups.length === 0 && <p>No se encontraron habitaciones disponibles.</p>}
      </div>
    </div>
  );
}
