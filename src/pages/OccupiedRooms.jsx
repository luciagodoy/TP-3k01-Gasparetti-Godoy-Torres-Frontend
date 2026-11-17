import { useState } from 'react';
import { reservationService } from '../services/resources';
import { RESERVATION_STATUS } from '../models';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

const STAY_LABELS = {
  [RESERVATION_STATUS.CHECKED_IN]: 'Con check-in',
  [RESERVATION_STATUS.PENDING]: 'Esperando check-in',
};

const FILTER_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: RESERVATION_STATUS.CHECKED_IN, label: STAY_LABELS[RESERVATION_STATUS.CHECKED_IN] },
  { value: RESERVATION_STATUS.PENDING, label: STAY_LABELS[RESERVATION_STATUS.PENDING] },
];

export default function OccupiedRooms() {
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: stays, loading, refetch } = useQuery(
    '/reservations/occupied-today',
    () => reservationService.occupiedToday(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const visibleStays = stays.filter((stay) => (statusFilter ? stay.status === statusFilter : true));
  const checkedInCount = stays.filter((stay) => stay.status === RESERVATION_STATUS.CHECKED_IN).length;
  const pendingCount = stays.length - checkedInCount;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Habitaciones ocupadas hoy</h2>
        <button className="btn btn-secondary" onClick={() => { setError(null); refetch(); }} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && <div role="alert" className="alert alert-error">{error}</div>}

      <div className="list-container">
        <div className="list-header">
          <h3>
            {stays.length} {stays.length === 1 ? 'habitación' : 'habitaciones'}
            {' '}({checkedInCount} con check-in, {pendingCount} esperando check-in)
          </h3>
          <div className="filter-row">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrar por situación del check-in">
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Habitación</th>
              <th>Piso</th>
              <th>Categoría</th>
              <th>Huésped</th>
              <th>Estadía</th>
              <th>Situación</th>
            </tr>
          </thead>
          <tbody>
            {visibleStays.map((stay) => (
              <tr key={stay.id}>
                <td>{stay.room?.number ?? stay.roomId}</td>
                <td>{stay.room?.floor ?? '-'}</td>
                <td>{stay.room?.category?.name ?? '-'}</td>
                <td>{stay.guest?.user?.username ?? stay.guestId}</td>
                <td>{stay.startDate} → {stay.endDate}</td>
                <td>
                  <span className={`badge badge-${stay.status}`}>{STAY_LABELS[stay.status] ?? stay.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && visibleStays.length === 0 && <p>No hay habitaciones ocupadas para este filtro.</p>}
      </div>
    </div>
  );
}
