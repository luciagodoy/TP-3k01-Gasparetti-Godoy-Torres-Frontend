import { useState } from 'react';
import { amenityQuotaService, reservationService, reservationAmenityService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

const emptyForm = { reservationId: '', quotaId: '', quantity: 1, unitPrice: '' };

export default function ReservationAmenities() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: consumptions, refetch: fetchConsumptions } = useQuery(
    '/reservation-amenities',
    () => reservationAmenityService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const { data: reservations } = useQuery(
    '/reservations',
    () => reservationService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const { data: quotas } = useQuery(
    '/amenity-quotas',
    () => amenityQuotaService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredConsumptions = consumptions.filter((consumption) => {
    const value = `${consumption.reservationId} ${consumption.amenityName || ''}`.toLowerCase();
    return searchTerm ? value.includes(searchTerm.toLowerCase()) : true;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (editingId) {
      if (!formData.quantity || !formData.unitPrice) {
        setError('Cantidad y precio unitario son requeridos.');
        return;
      }
      setLoading(true);
      try {
        await reservationAmenityService.update(editingId, {
          quantity: formData.quantity,
          unitPrice: parseFloat(formData.unitPrice),
        });
        setMessage('Consumo actualizado correctamente.');
        resetForm();
        fetchConsumptions();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!formData.reservationId || !formData.quotaId || !formData.quantity || !formData.unitPrice) {
      setError('Reserva, cupo, cantidad y precio unitario son requeridos.');
      return;
    }

    setLoading(true);
    try {
      await reservationAmenityService.create({
        reservationId: Number(formData.reservationId),
        quotaId: Number(formData.quotaId),
        quantity: formData.quantity,
        unitPrice: parseFloat(formData.unitPrice),
      });
      setMessage('Consumo registrado correctamente.');
      resetForm();
      fetchConsumptions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (consumption) => {
    setFormData({
      reservationId: consumption.reservationId,
      quotaId: consumption.quotaId,
      quantity: consumption.quantity,
      unitPrice: consumption.unitPrice,
    });
    setEditingId(consumption.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este consumo de servicio? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await reservationAmenityService.remove(id);
      setMessage('Consumo eliminado correctamente (cupo liberado).');
      if (selected?.id === id) setSelected(null);
      fetchConsumptions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reservationLabel = (reservation) =>
    `#${reservation.id} - Habitación ${reservation.room?.number ?? reservation.roomId} (${reservation.startDate} a ${reservation.endDate})`;

  const quotaLabel = (quota) =>
    `${quota.amenity?.name || `Servicio #${quota.amenityId}`} - ${quota.available}/${quota.quantity} disponibles`;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Consumos de Servicio</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Consumo'}
        </button>
      </div>

      <p style={{ color: 'var(--muted)', marginTop: '-1rem', marginBottom: '1.5rem' }}>
        Los huéspedes agregan servicios a su propia reserva desde "Reservar". Esta pantalla es para
        que el personal registre o corrija consumos manualmente.
      </p>

      {message && <div role="status" className="alert alert-success">{message}</div>}
      {error && <div role="alert" className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {!editingId && (
              <>
                <div className="form-group">
                  <label htmlFor="consumption-reservation">Reserva</label>
                  <select id="consumption-reservation" name="reservationId" value={formData.reservationId} onChange={handleChange}>
                    <option value="">Seleccionar reserva</option>
                    {reservations.map((reservation) => (
                      <option key={reservation.id} value={reservation.id}>{reservationLabel(reservation)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="consumption-quota">Cupo</label>
                  <select id="consumption-quota" name="quotaId" value={formData.quotaId} onChange={handleChange}>
                    <option value="">Seleccionar cupo</option>
                    {quotas.map((quota) => (
                      <option key={quota.id} value={quota.id}>{quotaLabel(quota)}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="consumption-quantity">Cantidad por día</label>
              <input id="consumption-quantity" type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} />
              <p className="field-hint">El total se calcula como cantidad × precio unitario × noches de la reserva.</p>
            </div>
            <div className="form-group">
              <label htmlFor="consumption-unit-price">Precio unitario</label>
              <input id="consumption-unit-price" type="number" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleChange} placeholder="0.00" />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Consumos</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por reserva o servicio"
              aria-label="Buscar consumo por reserva o servicio"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Reserva</th>
              <th>Servicio</th>
              <th>Cant. por día</th>
              <th>P. Unitario</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredConsumptions.map((consumption) => (
              <tr
                key={consumption.id}
                className={selected?.id === consumption.id ? 'selected-row' : ''}
                onClick={() => setSelected(consumption)}
              >
                <td>#{consumption.reservationId}</td>
                <td>{consumption.amenityName || '-'}</td>
                <td>{consumption.quantity}</td>
                <td>${consumption.unitPrice.toFixed(2)}</td>
                <td>${consumption.totalAmount.toFixed(2)}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); setSelected(consumption); }}>
                    Ver detalle
                  </button>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(consumption); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(consumption.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del consumo</h4>
            <p><strong>Reserva:</strong> #{selected.reservationId}</p>
            <p><strong>Servicio:</strong> {selected.amenityName || '-'}</p>
            <p><strong>Cantidad por día:</strong> {selected.quantity}</p>
            <p><strong>Precio unitario:</strong> ${selected.unitPrice.toFixed(2)}</p>
            <p><strong>Total:</strong> ${selected.totalAmount.toFixed(2)}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
