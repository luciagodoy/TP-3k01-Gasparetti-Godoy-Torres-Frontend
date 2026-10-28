import { useState } from 'react';
import { guestService, reservationService } from '../services/resources';
import confirmOutOfHours from '../utils/confirmOutOfHours';
import downloadFile from '../utils/downloadFile';
import '../styles/pages.scss';

export default function CheckInOut() {
  const [checkInId, setCheckInId] = useState('');
  const [checkOutId, setCheckOutId] = useState('');
  const [reservation, setReservation] = useState(null);
  const [guest, setGuest] = useState(null);
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
      const done = await confirmOutOfHours((flags) => reservationService.checkIn(checkInId, flags));
      if (!done) {
        setError('No se registró el check-in.');
        return;
      }
      setMessage('Check-in procesado correctamente.');
      setCheckInId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFindReservation = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setReservation(null);
    setGuest(null);

    if (!checkOutId) {
      setError('Debes ingresar el ID de la reserva para buscarla.');
      return;
    }

    setLoading(true);
    try {
      const found = await reservationService.get(checkOutId);
      setReservation(found);
      if (found?.guestId) {
        try {
          setGuest(await guestService.get(found.guestId));
        } catch {
          setGuest(null);
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
      const receipt = await confirmOutOfHours((flags) => reservationService.checkOut(checkOutId, flags));
      if (!receipt) {
        setError('No se registró el check-out.');
        return;
      }
      downloadFile(receipt, `comprobante-reserva-${checkOutId}.pdf`);
      setMessage('Check-out procesado correctamente. Se descargó el comprobante.');
      setReservation(null);
      setGuest(null);
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

      {message && <div role="status" className="alert alert-success">{message}</div>}
      {error && <div role="alert" className="alert alert-error">{error}</div>}

      <div className="form-container">
        <h3>Procesar Check-in</h3>
        <form onSubmit={handleCheckInSubmit}>
          <div className="form-group">
            <label htmlFor="check-in-id">ID de Reserva</label>
            <input
              id="check-in-id"
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
        <form onSubmit={handleFindReservation}>
          <div className="form-group">
            <label htmlFor="check-out-id">ID de Reserva</label>
            <input
              id="check-out-id"
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

        {reservation && (
          <div className="details-card">
            <h4>Detalle de Reserva</h4>
            <p><strong>ID:</strong> {reservation.id}</p>
            <p><strong>Huésped:</strong> {guest ? guest.user?.username : reservation.guestId}</p>
            <p><strong>Habitación:</strong> {reservation.room ? reservation.room.number : reservation.roomId}</p>
            <p><strong>Inicio:</strong> {reservation.startDate}</p>
            <p><strong>Fin:</strong> {reservation.endDate} ({reservation.nights} {reservation.nights === 1 ? 'noche' : 'noches'})</p>
            <p><strong>Estado:</strong> {reservation.status}</p>
            <p><strong>Monto alojamiento:</strong> ${reservation.totalAmount.toFixed(2)}</p>
            {!reservation.canCheckOut && (
              <p className="field-hint">Sólo se puede hacer check-out de una reserva con check-in registrado.</p>
            )}
            <p className="field-hint">El check-in es desde las 15:00 del día de inicio y el check-out hasta las 10:00 del día de salida. Fuera de horario se pide confirmación.</p>
            <button
              className="btn btn-primary"
              onClick={handleCheckOutSubmit}
              disabled={loading || !reservation.canCheckOut}
            >
              {loading ? 'Procesando...' : 'Confirmar Check-out'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
