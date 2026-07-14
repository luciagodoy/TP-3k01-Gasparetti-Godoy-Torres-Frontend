import { useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function CheckIn() {
  const [checkInData, setCheckInData] = useState({
    reservaId: '',
    fechaEntrada: '',
    notasEspeciales: '',
  });
  const [checkOutId, setCheckOutId] = useState('');
  const [reservaInfo, setReservaInfo] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckInChange = (e) => {
    const { name, value } = e.target;
    setCheckInData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!checkInData.reservaId) {
      setError('Debes ingresar el ID de la reserva para hacer check-in.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/reservas/${checkInData.reservaId}/checkin`, {});
      setMessage('Check-in procesado correctamente.');
      setCheckInData({ reservaId: '', fechaEntrada: '', notasEspeciales: '' });
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

    if (!checkOutId) {
      setError('Debes ingresar el ID de la reserva para buscarla.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/reservas/${checkOutId}`);
      setReservaInfo(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOutSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!checkOutId) {
      setError('Debes ingresar el ID de la reserva para hacer check-out.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/reservas/${checkOutId}/checkout`, {});
      setMessage('Check-out procesado correctamente.');
      setReservaInfo(null);
      setCheckOutId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!reservaInfo) return 0;
    let total = Number(reservaInfo.montoTotal || 0);
    if (reservaInfo.ReservaServicios) {
      total += reservaInfo.ReservaServicios.reduce(
        (sum, item) => sum + Number(item.montoTotal || 0),
        0
      );
    }
    return total;
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
              name="reservaId"
              value={checkInData.reservaId}
              onChange={handleCheckInChange}
              placeholder="Ej: 1"
            />
          </div>
          <div className="form-group">
            <label>Fecha de Entrada</label>
            <input
              type="date"
              name="fechaEntrada"
              value={checkInData.fechaEntrada}
              onChange={handleCheckInChange}
            />
          </div>
          <div className="form-group">
            <label>Notas Especiales</label>
            <textarea
              name="notasEspeciales"
              value={checkInData.notasEspeciales}
              onChange={handleCheckInChange}
              placeholder="Anotaciones sobre la entrada"
            ></textarea>
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
            <p><strong>Huésped:</strong> {reservaInfo.Huesped ? `${reservaInfo.Huesped.nombre} ${reservaInfo.Huesped.apellido}` : reservaInfo.huespedId}</p>
            <p><strong>Habitación:</strong> {reservaInfo.Habitacion ? reservaInfo.Habitacion.numero : reservaInfo.habitacionId}</p>
            <p><strong>Entrada:</strong> {new Date(reservaInfo.fechaEntrada).toLocaleDateString()}</p>
            <p><strong>Salida:</strong> {new Date(reservaInfo.fechaSalida).toLocaleDateString()}</p>
            <p><strong>Monto base:</strong> ${reservaInfo.montoTotal}</p>
            {reservaInfo.ReservaServicios && reservaInfo.ReservaServicios.length > 0 && (
              <div>
                <h5>Servicios agregados</h5>
                <ul>
                  {reservaInfo.ReservaServicios.map((item) => (
                    <li key={item.id}>
                      Servicio ID {item.cupoId}, Cantidad: {item.cantidad}, Total: ${item.montoTotal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p><strong>Total a pagar:</strong> ${calculateTotal()}</p>
            <button className="btn btn-primary" onClick={handleCheckOutSubmit} disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Check-out'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
