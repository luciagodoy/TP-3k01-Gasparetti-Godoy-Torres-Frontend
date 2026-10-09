import { useState } from 'react';
import { Link } from 'react-router-dom';
import { reservaService } from '../services/recursos';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

export default function MisReservas() {
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: reservas, refetch: fetchMisReservas } = useQuery(
    '/reservas/mias',
    () => reservaService.mias(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Cancelar esta reserva? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await reservaService.cancelar(id);
      setMessage('Reserva cancelada correctamente.');
      fetchMisReservas();
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
        <Link className="btn btn-primary" to="/buscar">+ Nueva Reserva</Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {reservas.length === 0 && <p>Todavía no tenés reservas.</p>}

      <div className="room-grid">
        {reservas.map((reserva) => {
          const servicios = reserva.serviciosConsumidos;

          return (
            <div className="room-card" key={reserva.id}>
              <div className="room-card-body">
                <h3 className="room-card-title">
                  {reserva.habitacion?.categoria?.denominacion || 'Habitación'} N° {reserva.habitacion?.numero}
                </h3>
                <p className="room-card-meta">{reserva.fechaInicio} → {reserva.fechaFin}</p>
                <p>
                  <span className={`badge badge-${reserva.estado}`}>{reserva.estado}</span>
                </p>
                {servicios.length > 0 && (
                  <div>
                    <strong>Servicios:</strong>
                    <ul>
                      {servicios.map((linea) => (
                        <li key={linea.id}>
                          {linea.nombreServicio} × {linea.cantidad} — ${linea.montoTotal.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="room-card-price">Total: ${reserva.total.toFixed(2)}</p>
                <div className="room-card-footer">
                  {reserva.puedeCancelarse && (
                    <button className="btn btn-small btn-danger" onClick={() => handleCancelar(reserva.id)} disabled={loading}>
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
