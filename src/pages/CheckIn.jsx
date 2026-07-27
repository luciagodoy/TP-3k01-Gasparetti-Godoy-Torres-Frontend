import { useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function CheckIn() {
  const [checkInId, setCheckInId] = useState('');
  const [checkOutId, setCheckOutId] = useState('');
  const [reservaInfo, setReservaInfo] = useState(null);
  const [huespedInfo, setHuespedInfo] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!checkInId) {
      setError('Debes ingresar el ID de la reserva para hacer check-in.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/reservas/${checkInId}`, { estado: 'check-in' });
      setMessage('Check-in procesado correctamente.');
      setCheckInId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarReserva = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setReservaInfo(null);
    setHuespedInfo(null);

    if (!checkOutId) {
      setError('Debes ingresar el ID de la reserva para buscarla.');
      return;
    }

    setLoading(true);
    try {
      const reserva = await api.get(`/reservas/${checkOutId}`);
      setReservaInfo(reserva);
      if (reserva?.huespedId) {
        try {
          const huesped = await api.get(`/huespedes/${reserva.huespedId}`);
          setHuespedInfo(huesped);
        } catch {
          setHuespedInfo(null);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOutSubmit = async () => {
    setMessage(null);
    setError(null);

    if (!checkOutId) {
      setError('Debes ingresar el ID de la reserva para hacer check-out.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/reservas/${checkOutId}`, { estado: 'check-out' });
      setMessage('Check-out procesado correctamente.');
      setReservaInfo(null);
      setHuespedInfo(null);
      setCheckOutId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Check-in / Check-out</h2>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container">
        <h3>Procesar Check-in</h3>
        <form onSubmit={handleCheckInSubmit}>
          <div className="form-group">
            <label>ID de Reserva</label>
            <input
              type="text"
              value={checkInId}
              onChange={(e) => setCheckInId(e.target.value)}
              placeholder="Ej: 1"
            />
          </div>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar Check-in'}
          </button>
        </form>
      </div>

      <div className="form-container">
        <h3>Procesar Check-out</h3>
        <form onSubmit={handleBuscarReserva}>
          <div className="form-group">
            <label>ID de Reserva</label>
            <input
              type="text"
              value={checkOutId}
              onChange={(e) => setCheckOutId(e.target.value)}
              placeholder="Ej: 1"
            />
          </div>
          <button type="submit" className="btn btn-secondary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar Reserva'}
          </button>
        </form>

        {reservaInfo && (
          <div className="details-card">
            <h4>Detalle de Reserva</h4>
            <p><strong>ID:</strong> {reservaInfo.id}</p>
            <p><strong>Huésped:</strong> {huespedInfo ? huespedInfo.usuario?.username : reservaInfo.huespedId}</p>
            <p><strong>Habitación:</strong> {reservaInfo.habitacion ? reservaInfo.habitacion.numero : reservaInfo.habitacionId}</p>
            <p><strong>Inicio:</strong> {new Date(reservaInfo.fechaInicio).toLocaleDateString()}</p>
            <p><strong>Fin:</strong> {new Date(reservaInfo.fechaFin).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> {reservaInfo.estado}</p>
            <p><strong>Monto total:</strong> ${reservaInfo.montoTotal}</p>
            <button className="btn btn-primary" onClick={handleCheckOutSubmit} disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Check-out'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
