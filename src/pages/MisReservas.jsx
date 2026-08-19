import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/pages.css';

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMisReservas = async () => {
    setError(null);
    try {
      const data = await api.get('/reservas/mias');
      setReservas(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchMisReservas();
  }, []);

  const handleCancelar = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.post(`/reservas/${id}/cancelar`, {});
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
          const servicios = reserva.serviciosConsumidos || [];
          const totalServicios = servicios.reduce((sum, l) => sum + Number(l.montoTotal), 0);
          const total = Number(reserva.montoTotal) + totalServicios;

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
                          {linea.cupo?.servicio?.nombre} × {linea.cantidad} — ${Number(linea.montoTotal).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="room-card-price">Total: ${total.toFixed(2)}</p>
                <div className="room-card-footer">
                  {reserva.estado === 'pendiente' && (
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
