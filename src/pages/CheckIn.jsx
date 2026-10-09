import { useState } from 'react';
import { huespedService, reservaService } from '../services/recursos';
import descargarArchivo from '../utils/descargarArchivo';
import '../styles/pages.scss';

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
      await reservaService.checkIn(checkInId);
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
      const reserva = await reservaService.obtener(checkOutId);
      setReservaInfo(reserva);
      if (reserva?.huespedId) {
        try {
          const huesped = await huespedService.obtener(reserva.huespedId);
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
      const comprobante = await reservaService.checkOut(checkOutId);
      descargarArchivo(comprobante, `comprobante-reserva-${checkOutId}.pdf`);
      setMessage('Check-out procesado correctamente. Se descargó el comprobante.');
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
            {/* Las fechas se muestran tal cual ('YYYY-MM-DD'): new Date('2026-11-01')
                las toma como medianoche UTC y en Argentina (UTC-3) mostraba el día anterior. */}
            <p><strong>Inicio:</strong> {reservaInfo.fechaInicio}</p>
            <p><strong>Fin:</strong> {reservaInfo.fechaFin} ({reservaInfo.noches} {reservaInfo.noches === 1 ? 'noche' : 'noches'})</p>
            <p><strong>Estado:</strong> {reservaInfo.estado}</p>
            <p><strong>Monto alojamiento:</strong> ${reservaInfo.montoTotal.toFixed(2)}</p>
            {!reservaInfo.puedeHacerCheckOut && (
              <p className="field-hint">Sólo se puede hacer check-out de una reserva con check-in registrado.</p>
            )}
            <button
              className="btn btn-primary"
              onClick={handleCheckOutSubmit}
              disabled={loading || !reservaInfo.puedeHacerCheckOut}
            >
              {loading ? 'Procesando...' : 'Confirmar Check-out'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
