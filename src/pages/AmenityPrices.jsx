import { useState } from 'react';
import { amenityPriceService, amenityService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import DateInput from '../components/DateInput';
import '../styles/pages.scss';

const emptyForm = { amenityId: '', price: '', validFrom: '', validTo: '' };

export default function AmenityPrices() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: prices, refetch: fetchPrices } = useQuery(
    '/amenity-prices',
    () => amenityPriceService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const { data: amenities } = useQuery(
    '/amenities',
    () => amenityService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredPrices = prices.filter((price) =>
    searchTerm ? (price.amenity?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (!formData.amenityId || !formData.price || !formData.validFrom) {
      setError('Servicio, precio y fecha de inicio de vigencia son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amenityId: Number(formData.amenityId),
        price: parseFloat(formData.price),
        validFrom: formData.validFrom,
        validTo: formData.validTo || null,
      };
      if (editingId) {
        await amenityPriceService.update(editingId, payload);
        setMessage('Precio actualizado correctamente.');
      } else {
        await amenityPriceService.create(payload);
        setMessage('Precio creado correctamente.');
      }
      resetForm();
      fetchPrices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (price) => {
    setFormData({
      amenityId: price.amenityId ?? price.amenity?.id ?? '',
      price: price.price,
      validFrom: price.validFrom,
      validTo: price.validTo || '',
    });
    setEditingId(price.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este precio? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await amenityPriceService.remove(id);
      setMessage('Precio eliminado correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchPrices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Precios de Servicios</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Precio'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="price-amenity">Servicio</label>
              <select id="price-amenity" name="amenityId" value={formData.amenityId} onChange={handleChange}>
                <option value="">Seleccionar servicio</option>
                {amenities.map((amenity) => (
                  <option key={amenity.id} value={amenity.id}>{amenity.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="price-value">Precio</label>
              <input id="price-value" type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label htmlFor="price-valid-from">Vigente desde</label>
              <DateInput id="price-valid-from" name="validFrom" value={formData.validFrom} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="price-valid-to">Vigente hasta (opcional)</label>
              <DateInput id="price-valid-to" name="validTo" value={formData.validTo} onChange={handleChange} min={formData.validFrom || undefined} />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Precios</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por servicio"
              aria-label="Buscar precio por servicio"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Servicio</th>
              <th>Precio</th>
              <th>Vigente desde</th>
              <th>Vigente hasta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrices.map((price) => (
              <tr
                key={price.id}
                className={selected?.id === price.id ? 'selected-row' : ''}
                onClick={() => setSelected(price)}
              >
                <td>{price.id}</td>
                <td>{price.amenity?.name || '-'}</td>
                <td>${price.price.toFixed(2)}</td>
                <td>{price.validFrom}</td>
                <td>{price.validTo || 'Sin límite'}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(price); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(price.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del precio</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Servicio:</strong> {selected.amenity?.name || '-'}</p>
            <p><strong>Precio:</strong> ${selected.price.toFixed(2)}</p>
            <p><strong>Vigente desde:</strong> {selected.validFrom}</p>
            <p><strong>Vigente hasta:</strong> {selected.validTo || 'Sin límite'}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
