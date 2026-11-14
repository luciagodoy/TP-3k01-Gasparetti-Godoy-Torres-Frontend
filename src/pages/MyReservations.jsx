import { useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import DateInput from '../components/DateInput';
import '../styles/pages.scss';

export default function MyReservations() {
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: reservations, refetch: fetchMyReservations } = useQuery(
    '/reservations/mine',
    () => reservationService.mine(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const startEditing = (reservation) => {
    setError(null);
    setMessage(null);
    setEditing({ id: reservation.id, startDate: reservation.startDate, endDate: reservation.endDate });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditing((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editing.startDate || !editing.endDate) {
      setError('Elegí las dos fechas.');
      return;
    }
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const updated = await reservationService.updateMine(editing.id, {
        startDate: editing.startDate,
        endDate: editing.endDate,
      });
      setMessage(`Reserva modificada. Nuevo total del alojamiento: $${updated.totalAmount.toFixed(2)}.`);
      setEditing(null);
      fetchMyReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('¿Cancelar esta reserva? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await reservationService.cancel(id);
      setMessage('Reserva cancelada correctamente.');
      fetchMyReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Mis Reservas</h2>
        <Link className="btn btn-primary" to="/search">+ Nueva Reserva</Link>
      </div>

      {message && <div role="status" className="alert alert-success">{message}</div>}
      {error && <div role="alert" className="alert alert-error">{error}</div>}

      {reservations.length === 0 && <p>Todavía no tenés reservas.</p>}

      <div className="room-grid">
        {reservations.map((reservation) => {
          const amenities = reservation.consumedAmenities;

          return (
            <div className="room-card" key={reservation.id}>
              <div className="room-card-body">
                <h3 className="room-card-title">
                  {reservation.room?.category?.name || 'Habitación'} N° {reservation.room?.number}
                </h3>
                {editing?.id === reservation.id ? (
                  <>
                    <div className="form-group">
                      <label htmlFor={`edit-start-${reservation.id}`}>Fecha de Inicio</label>
                      <DateInput id={`edit-start-${reservation.id}`} name="startDate" value={editing.startDate} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`edit-end-${reservation.id}`}>Fecha de Fin</label>
                      <DateInput id={`edit-end-${reservation.id}`} name="endDate" value={editing.endDate} onChange={handleEditChange} min={editing.startDate || undefined} />
                    </div>
                    <p className="field-hint">El total se vuelve a calcular con la tarifa de las fechas nuevas.</p>
                  </>
                ) : (
                  <p className="room-card-meta">{reservation.startDate} → {reservation.endDate}</p>
                )}
                <p>
                  <span className={`badge badge-${reservation.status}`}>{reservation.status}</span>
                </p>
                {amenities.length > 0 && (
                  <div>
                    <strong>Servicios:</strong>
                    <ul>
                      {amenities.map((line) => (
                        <li key={line.id}>
                          {line.amenityName} × {line.quantity} — ${line.totalAmount.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="room-card-price">Total: ${reservation.total.toFixed(2)}</p>
                <div className="room-card-footer">
                  {reservation.canBeCancelled && editing?.id === reservation.id && (
                    <>
                      <button className="btn btn-small btn-success" onClick={handleSaveEdit} disabled={loading}>
                        Guardar
                      </button>
                      <button className="btn btn-small" onClick={() => setEditing(null)} disabled={loading}>
                        Descartar
                      </button>
                    </>
                  )}
                  {reservation.canBeCancelled && editing?.id !== reservation.id && (
                    <button className="btn btn-small" onClick={() => startEditing(reservation)} disabled={loading}>
                      Modificar fechas
                    </button>
                  )}
                  {reservation.canBeCancelled && (
                    <button className="btn btn-small btn-danger" onClick={() => handleCancel(reservation.id)} disabled={loading}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
