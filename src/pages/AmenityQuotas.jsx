import { useState } from 'react';
import { amenityQuotaService, amenityService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

const emptyForm = { quantity: 1, amenityId: '' };

export default function AmenityQuotas() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: quotas, refetch: fetchQuotas } = useQuery(
    '/amenity-quotas',
    () => amenityQuotaService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const { data: amenities } = useQuery(
    '/amenities',
    () => amenityService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredQuotas = quotas.filter((quota) =>
    searchTerm ? (quota.amenity?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

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

    if (!formData.quantity || !formData.amenityId) {
      setError('Cantidad y servicio son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = { quantity: formData.quantity, amenityId: Number(formData.amenityId) };
      if (editingId) {
        await amenityQuotaService.update(editingId, payload);
        setMessage('Cupo actualizado correctamente.');
      } else {
        await amenityQuotaService.create(payload);
        setMessage('Cupo creado correctamente.');
      }
      resetForm();
      fetchQuotas();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quota) => {
    setFormData({ quantity: quota.quantity, amenityId: quota.amenityId ?? quota.amenity?.id ?? '' });
    setEditingId(quota.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cupo? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await amenityQuotaService.remove(id);
      setMessage('Cupo eliminado correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchQuotas();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Cupos</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Cupo'}
        </button>
      </div>

      {message && <div role="status" className="alert alert-success">{message}</div>}
      {error && <div role="alert" className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="quota-amenity">Servicio</label>
              <select id="quota-amenity" name="amenityId" value={formData.amenityId} onChange={handleChange}>
                <option value="">Seleccionar servicio</option>
                {amenities.map((amenity) => (
                  <option key={amenity.id} value={amenity.id}>{amenity.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="quota-quantity">Cantidad total</label>
              <input id="quota-quantity" type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} />
            </div>
            {editingId && (
              <p className="field-hint">
                Al cambiar la cantidad, la disponibilidad se ajusta proporcionalmente (no se puede bajar por debajo de lo ya consumido).
              </p>
            )}
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Cupos</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por servicio"
              aria-label="Buscar cupo por servicio"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Servicio</th>
              <th>Cantidad</th>
              <th>Disponibles</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotas.map((quota) => (
              <tr
                key={quota.id}
                className={selected?.id === quota.id ? 'selected-row' : ''}
                onClick={() => setSelected(quota)}
              >
                <td>{quota.id}</td>
                <td>{quota.amenity?.name || '-'}</td>
                <td>{quota.quantity}</td>
                <td>{quota.available}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); setSelected(quota); }}>
                    Ver detalle
                  </button>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(quota); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(quota.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del cupo</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Servicio:</strong> {selected.amenity?.name || '-'}</p>
            <p><strong>Cantidad total:</strong> {selected.quantity}</p>
            <p><strong>Disponibles:</strong> {selected.available}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
