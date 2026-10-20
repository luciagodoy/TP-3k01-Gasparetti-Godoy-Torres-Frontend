import { useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

export default function MyReservations() {
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: reservations, refetch: fetchMyReservations } = useQuery(
    '/reservations/mine',
    () => reservationService.mine(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

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

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

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
                <p className="room-card-meta">{reservation.startDate} → {reservation.endDate}</p>
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
