import { useState } from 'react';
import { guestService, reservationService, roomService } from '../services/resources';
import { RESERVATION_STATUS } from '../models';
import useQuery from '../hooks/useQuery';
import DateInput from '../components/DateInput';
import '../styles/pages.scss';

const STATUS_OPTIONS = [
  { value: RESERVATION_STATUS.PENDING, label: 'Pendiente' },
  { value: RESERVATION_STATUS.CHECKED_IN, label: 'Check-in' },
  { value: RESERVATION_STATUS.CHECKED_OUT, label: 'Check-out' },
  { value: RESERVATION_STATUS.CANCELLED, label: 'Cancelada' },
];

const emptyForm = { roomId: '', guestId: '', startDate: '', endDate: '', totalAmount: '' };
export default function Reservations() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [range, setRange] = useState({ from: '', to: '' });

  // El rango de fechas lo filtra el backend (GET /reservations?startDate=&endDate=
  // devuelve las reservas que se superponen con él). Sólo aplica con ambas fechas.
  const hasRange = Boolean(range.from && range.to);
  const rangeFilters = hasRange ? { startDate: range.from, endDate: range.to } : undefined;

  const { data: reservations, refetch: fetchReservations } = useQuery(
    `/reservations?${hasRange ? `${range.from}:${range.to}` : ''}`,
    () => reservationService.list(rangeFilters),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const { data: guests } = useQuery(
    '/guests',
    () => guestService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const { data: rooms } = useQuery(
    '/rooms',
    () => roomService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  // El listado de reservas no incluye al huésped, así que el nombre sale de los
  // huéspedes ya cargados para el formulario.
  const guestName = (guestId) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest ? guest.user?.username || `#${guestId}` : guestId;
  };

  const filteredReservations = reservations.filter((reservation) => {
    const searchValue = `${reservation.id} ${guestName(reservation.guestId) || ''} ${reservation.room?.number || reservation.roomId || ''} ${reservation.status || ''}`.toLowerCase();
    const matchesSearch = searchTerm ? searchValue.includes(searchTerm.toLowerCase()) : true;
    const matchesStatus = statusFilter ? reservation.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.roomId || !formData.guestId || !formData.startDate || !formData.endDate) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      await reservationService.create({
        roomId: Number(formData.roomId),
        guestId: Number(formData.guestId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        // Vacío = el backend aplica la tarifa dinámica; con un valor = precio pactado.
        ...(formData.totalAmount !== '' && { totalAmount: parseFloat(formData.totalAmount) }),
      });
      setMessage('Reserva creada correctamente.');
      setFormData(emptyForm);
      setShowForm(false);
      fetchReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setRange((prev) => ({ ...prev, [name]: value }));
  };

  // El detalle se pide al backend: trae la reserva con el huésped completo
  // (cuenta y ubicación), la habitación con su categoría y los servicios
  // consumidos, nada de lo cual viene en el listado.
  const handleSelect = async (id) => {
    setError(null);
    try {
      setSelected(await reservationService.get(id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta reserva? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await reservationService.remove(id);
      setMessage('Reserva eliminada correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Reservas</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva Reserva'}
        </button>
      </div>

      {message && <div role="status" className="alert alert-success">{message}</div>}
      {error && <div role="alert" className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleCreateReservation}>
            <div className="form-group">
              <label htmlFor="reservation-room">Habitación</label>
              <select id="reservation-room" name="roomId" value={formData.roomId} onChange={handleInputChange}>
                <option value="">Seleccionar habitación</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.number} {room.category ? `- ${room.category.name}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="reservation-guest">Huésped</label>
              <select id="reservation-guest" name="guestId" value={formData.guestId} onChange={handleInputChange}>
                <option value="">Seleccionar huésped</option>
                {guests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.user?.username} ({guest.documentNumber})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="reservation-start">Fecha de Inicio</label>
              <DateInput id="reservation-start" name="startDate" value={formData.startDate} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="reservation-end">Fecha de Fin</label>
              <DateInput id="reservation-end" name="endDate" value={formData.endDate} onChange={handleInputChange} min={formData.startDate || undefined} />
            </div>
            <div className="form-group">
              <label htmlFor="reservation-amount">Monto Total (opcional)</label>
              <input
                id="reservation-amount"
                type="number"
                step="0.01"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                placeholder="Vacío = tarifa dinámica"
              />
              <p className="field-hint">Si lo dejás vacío se cobra la tarifa del día según ocupación y antelación.</p>
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Reservas</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, huésped, habitación o estado"
              aria-label="Buscar reserva por ID, huésped, habitación o estado"
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrar por estado">
              <option value="">Todos los estados</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-row">
            <div className="form-group">
              <label htmlFor="reservation-range-from">Desde</label>
              <DateInput id="reservation-range-from" name="from" value={range.from} onChange={handleRangeChange} />
            </div>
            <div className="form-group">
              <label htmlFor="reservation-range-to">Hasta</label>
              <DateInput id="reservation-range-to" name="to" value={range.to} onChange={handleRangeChange} min={range.from || undefined} />
            </div>
            {(range.from || range.to) && (
              <button type="button" className="btn btn-small" onClick={() => setRange({ from: '', to: '' })}>
                Limpiar fechas
              </button>
            )}
          </div>
          {(range.from || range.to) && !hasRange && (
            <p className="field-hint">Elegí las dos fechas para filtrar por rango.</p>
          )}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Huésped</th>
              <th>Habitación</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((reservation) => (
              <tr
                key={reservation.id}
                onClick={() => handleSelect(reservation.id)}
                className={selected?.id === reservation.id ? 'selected-row' : ''}
              >
                <td>{reservation.id}</td>
                <td>{guestName(reservation.guestId)}</td>
                <td>{reservation.room ? reservation.room.number : reservation.roomId}</td>
                <td>{reservation.startDate}</td>
                <td>{reservation.endDate}</td>
                <td>
                  <span className={`badge badge-${reservation.status}`}>{reservation.status}</span>
                </td>
                <td>{reservation.totalAmount ? `$${reservation.totalAmount.toFixed(2)}` : '-'}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleSelect(reservation.id); }}>
                    Ver detalle
                  </button>
                  <span title={reservation.canBeDeleted ? undefined : 'La estadía está en curso: hacé el check-out antes de eliminarla.'}>
                    <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(reservation.id); }} disabled={loading || !reservation.canBeDeleted}>
                      Eliminar
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selected && (
          <div className="details-card">
            <h4>Reserva N° {selected.id}</h4>
            <p><strong>Estado:</strong> <span className={`badge badge-${selected.status}`}>{selected.status}</span></p>
            <p><strong>Inicio:</strong> {selected.startDate}</p>
            <p><strong>Fin:</strong> {selected.endDate} ({selected.nights} {selected.nights === 1 ? 'noche' : 'noches'})</p>
            <p>
              <strong>Habitación:</strong> N° {selected.room ? selected.room.number : selected.roomId}
              {selected.room && ` · Piso ${selected.room.floor}`}
              {selected.room?.category && ` · ${selected.room.category.name}`}
            </p>
            <p><strong>Alojamiento:</strong> ${(selected.totalAmount ?? 0).toFixed(2)}</p>
            {selected.consumedAmenities.length > 0 && (
              <>
                <p><strong>Servicios consumidos:</strong></p>
                <ul>
                  {selected.consumedAmenities.map((line) => (
                    <li key={line.id}>
                      {line.amenityName ?? `Cupo #${line.quotaId}`} × {line.quantity} — ${(line.totalAmount ?? 0).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p><strong>Total:</strong> ${selected.total.toFixed(2)}</p>

            <h4>Huésped</h4>
            {selected.guest ? (
              <>
                <p><strong>Usuario:</strong> {selected.guest.user?.username ?? '-'}</p>
                <p><strong>Email:</strong> {selected.guest.user?.email ?? '-'}</p>
                <p><strong>Documento:</strong> {selected.guest.documentNumber}</p>
                <p><strong>Teléfono:</strong> {selected.guest.phone || '-'}</p>
                <p><strong>Ubicación:</strong> {selected.guest.city?.fullName ?? '-'}, {selected.guest.country}</p>
              </>
            ) : (
              <p>{guestName(selected.guestId)}</p>
            )}
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>
              Cerrar detalle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
