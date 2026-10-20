import { useState } from 'react';
import { amenityService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

const emptyForm = { name: '', description: '' };

export default function Amenities() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: amenities, refetch: fetchAmenities } = useQuery(
    '/amenities',
    () => amenityService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredAmenities = amenities.filter((amenity) => {
    const value = `${amenity.name} ${amenity.description || ''}`.toLowerCase();
    return searchTerm ? value.includes(searchTerm.toLowerCase()) : true;
  });

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

    if (!formData.name.trim()) {
      setError('El nombre es requerido.');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: formData.name.trim(), description: formData.description.trim() || null };
      if (editingId) {
        await amenityService.update(editingId, payload);
        setMessage('Servicio actualizado correctamente.');
      } else {
        await amenityService.create(payload);
        setMessage('Servicio creado correctamente.');
      }
      resetForm();
      fetchAmenities();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (amenity) => {
    setFormData({ name: amenity.name, description: amenity.description || '' });
    setEditingId(amenity.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este servicio? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await amenityService.remove(id);
      setMessage('Servicio eliminado correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchAmenities();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Servicios</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
        </button>
      </div>

      {message && <div role="status" className="alert alert-success">{message}</div>}
      {error && <div role="alert" className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="amenity-name">Nombre</label>
              <input id="amenity-name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Desayuno buffet" />
            </div>
            <div className="form-group">
              <label htmlFor="amenity-description">Descripción</label>
              <textarea id="amenity-description" name="description" value={formData.description} onChange={handleChange} placeholder="Descripción breve del servicio"></textarea>
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Servicios</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción"
              aria-label="Buscar servicio por nombre o descripción"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAmenities.map((amenity) => (
              <tr
                key={amenity.id}
                className={selected?.id === amenity.id ? 'selected-row' : ''}
                onClick={() => setSelected(amenity)}
              >
                <td>{amenity.id}</td>
                <td>{amenity.name}</td>
                <td>{amenity.description || '-'}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); setSelected(amenity); }}>
                    Ver detalle
                  </button>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(amenity); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(amenity.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del servicio</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Nombre:</strong> {selected.name}</p>
            <p><strong>Descripción:</strong> {selected.description || '-'}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
