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

  const { data: reservations, refetch: fetchReservations } = useQuery(
    '/reservations',
    () => reservationService.list(),
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
                onClick={() => setSelected(reservation)}
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
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); setSelected(reservation); }}>
                    Ver detalle
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(reservation.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selected && (
          <div className="details-card">
            <h4>Detalle de la reserva seleccionada</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Huésped:</strong> {guestName(selected.guestId)}</p>
            <p><strong>Habitación:</strong> {selected.room ? selected.room.number : selected.roomId}</p>
            <p><strong>Inicio:</strong> {selected.startDate}</p>
            <p><strong>Fin:</strong> {selected.endDate} ({selected.nights} {selected.nights === 1 ? 'noche' : 'noches'})</p>
            <p><strong>Estado:</strong> {selected.status}</p>
            <p><strong>Monto total:</strong> ${selected.totalAmount.toFixed(2)}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>
              Cerrar detalle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
