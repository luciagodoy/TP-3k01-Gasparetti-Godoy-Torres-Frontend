import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  amenityQuotaService, roomService, amenityPriceService, reservationService,
  reservationAmenityService, amenityService, pricingService,
} from '../services/resources';
import { Reservation } from '../models';
import '../styles/pages.scss';

export default function BookRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId, startDate, endDate } = location.state || {};

  const [step, setStep] = useState('confirm');
  const [room, setRoom] = useState(null);
  const [quote, setQuote] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [activeAmenity, setActiveAmenity] = useState(null);
  const [quotas, setQuotas] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [quotaId, setQuotaId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedLines, setAddedLines] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // The price is dynamic (occupancy and lead time), so it always comes from the
  // backend; the page never computes it.
  const loadQuote = async (categoryId) => {
    const [found] = await pricingService.quote({ categoryId, startDate, endDate });
    setQuote(found ?? null);
  };

  useEffect(() => {
    if (!roomId || !startDate || !endDate) {
      navigate('/search', { replace: true });
      return;
    }
    const fetchRoomAndPrice = async () => {
      try {
        const found = await roomService.get(roomId);
        setRoom(found);
        await loadQuote(found.categoryId);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchRoomAndPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nights = Reservation.calculateNights(startDate, endDate);

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      // expectedTotal: if the price changed since it was shown, the API answers
      // 409 instead of charging a different amount.
      setReservation(await reservationService.createMine({ roomId, startDate, endDate, expectedTotal: quote.total }));
      setAmenities(await amenityService.list());
      setStep('amenities');
    } catch (err) {
      if (err.status === 409) {
        // Show the new price and let the guest confirm again.
        await loadQuote(room.categoryId).catch(() => {});
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAmenity = async (amenity) => {
    setError(null);
    setActiveAmenity(amenity);
    setQuotaId('');
    setQuantity(1);
    try {
      const [quotaList, priceList] = await Promise.all([
        amenityQuotaService.list({ amenityId: amenity.id }),
        amenityPriceService.list({ amenityId: amenity.id, current: true }),
      ]);
      setQuotas(quotaList.filter((quota) => quota.hasAvailability));
      setCurrentPrice(priceList?.[0] || null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddAmenity = async () => {
    if (!quotaId || !quantity) {
      setError('Selecciona un cupo y una cantidad.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const line = await reservationAmenityService.createMine({
        reservationId: reservation.id,
        quotaId: Number(quotaId),
        quantity: Number(quantity),
      });
      // The created line does not include the quota, so the name comes from the selected amenity.
      setAddedLines((prev) => [...prev, { line, amenityName: activeAmenity.name }]);
      setActiveAmenity(null);
      setQuotas([]);
      setCurrentPrice(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const amenitiesTotal = addedLines.reduce((sum, { line }) => sum + line.totalAmount, 0);

  if (!roomId || !startDate || !endDate) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Confirmar Reserva</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {step === 'confirm' && (
        <div className="form-container">
          {room ? (
            <>
              <h3>{room.category?.name}</h3>
              <p>Habitación N° {room.number} · Piso {room.floor}</p>
              <p>Check-in: {startDate} · Check-out: {endDate} ({nights} {nights === 1 ? 'noche' : 'noches'})</p>
              {quote ? (
                <>
                  <p className="room-card-price">Total: ${quote.total.toFixed(2)}</p>
                  {quote.isAdjusted && (
                    <>
                      <p className="field-hint">El precio de cada noche varía según la ocupación y la anticipación de la reserva:</p>
                      <ul className="price-breakdown">
                        {quote.nights.map((night) => (
                          <li key={night.date}>
                            <span>
                              {night.date}
                              {night.adjustmentSummary && <small> ({night.adjustmentSummary})</small>}
                            </span>
                            <strong>${night.price.toFixed(2)}</strong>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              ) : (
                <p>Calculando precio...</p>
              )}
              <button className="btn btn-success" onClick={handleConfirm} disabled={loading || !quote}>
                {loading ? 'Confirmando...' : 'Confirmar reserva'}
              </button>
            </>
          ) : (
            <p>Cargando habitación...</p>
          )}
        </div>
      )}

      {step === 'amenities' && (
        <>
          <div className="alert alert-success">Reserva creada correctamente. ¿Querés agregar servicios adicionales?</div>

          <div className="list-container">
            <h3>Servicios disponibles</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {amenities.map((amenity) => (
                  <tr key={amenity.id}>
                    <td>{amenity.name}</td>
                    <td>{amenity.description || '-'}</td>
                    <td>
                      <button className="btn btn-small" onClick={() => handleShowAmenity(amenity)}>
                        Ver opciones
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activeAmenity && (
            <div className="form-container">
              <h4>{activeAmenity.name}</h4>
              {currentPrice ? (
                <p>Precio actual: ${currentPrice.price.toFixed(2)} por unidad</p>
              ) : (
                <p>Este servicio no tiene un precio vigente configurado.</p>
              )}
              {quotas.length === 0 ? (
                <p>No hay disponibilidad para este servicio en este momento.</p>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="book-quota">Cupo</label>
                    <select id="book-quota" value={quotaId} onChange={(e) => setQuotaId(e.target.value)}>
                      <option value="">Seleccionar</option>
                      {quotas.map((quota) => (
                        <option key={quota.id} value={quota.id}>
                          Cupo #{quota.id} ({quota.available} disponibles)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="book-quantity">Cantidad</label>
                    <input id="book-quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                  </div>
                  <button className="btn btn-success" onClick={handleAddAmenity} disabled={loading || !currentPrice}>
                    {loading ? 'Agregando...' : 'Agregar'}
                  </button>
                </>
              )}
              <button className="btn btn-small" onClick={() => setActiveAmenity(null)} style={{ marginLeft: '0.5rem' }}>
                Cancelar
              </button>
            </div>
          )}

          {addedLines.length > 0 && (
            <div className="list-container">
              <h3>Servicios agregados</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {addedLines.map(({ line, amenityName }) => (
                    <tr key={line.id}>
                      <td>{amenityName}</td>
                      <td>{line.quantity}</td>
                      <td>${line.unitPrice.toFixed(2)}</td>
                      <td>${line.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p><strong>Total servicios: ${amenitiesTotal.toFixed(2)}</strong></p>
            </div>
          )}

          <div className="page-header" style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={() => setStep('done')}>
              {addedLines.length > 0 ? 'Finalizar' : 'Finalizar sin agregar servicios'}
            </button>
          </div>
        </>
      )}

      {step === 'done' && (
        <div className="details-card">
          <h3>¡Reserva confirmada!</h3>
          <p>Tu reserva N° {reservation?.id} fue creada correctamente.</p>
          <p><strong>Total alojamiento:</strong> ${(reservation?.totalAmount ?? 0).toFixed(2)}</p>
          {addedLines.length > 0 && <p><strong>Total servicios:</strong> ${amenitiesTotal.toFixed(2)}</p>}
          <Link className="btn btn-primary" to="/my-reservations">Ver mis reservas</Link>
        </div>
      )}
    </div>
  );
}
