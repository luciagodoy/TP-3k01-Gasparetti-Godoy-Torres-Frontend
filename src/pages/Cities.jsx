import { useState } from 'react';
import { cityService, provinceService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

const emptyForm = { name: '', provinceId: '' };

export default function Cities() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: cities, refetch: fetchCities } = useQuery(
    '/cities',
    () => cityService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const { data: provinces } = useQuery(
    '/provinces',
    () => provinceService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredCities = cities.filter((city) => {
    const value = `${city.name} ${city.province?.name || ''}`.toLowerCase();
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

    if (!formData.name.trim() || !formData.provinceId) {
      setError('Nombre y provincia son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: formData.name.trim(), provinceId: Number(formData.provinceId) };
      if (editingId) {
        await cityService.update(editingId, payload);
        setMessage('Ciudad actualizada correctamente.');
      } else {
        await cityService.create(payload);
        setMessage('Ciudad creada correctamente.');
      }
      resetForm();
      fetchCities();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (city) => {
    setFormData({ name: city.name, provinceId: city.provinceId ?? city.province?.id ?? '' });
    setEditingId(city.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta ciudad? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await cityService.remove(id);
      setMessage('Ciudad eliminada correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchCities();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Ciudades</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nueva Ciudad'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="city-name">Nombre</label>
              <input id="city-name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Río Cuarto" />
            </div>
            <div className="form-group">
              <label htmlFor="city-province">Provincia</label>
              <select id="city-province" name="provinceId" value={formData.provinceId} onChange={handleChange}>
                <option value="">Seleccionar provincia</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>{province.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Ciudades</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ciudad o provincia"
              aria-label="Buscar por ciudad o provincia"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Provincia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCities.map((city) => (
              <tr
                key={city.id}
                className={selected?.id === city.id ? 'selected-row' : ''}
                onClick={() => setSelected(city)}
              >
                <td>{city.id}</td>
                <td>{city.name}</td>
                <td>{city.province?.name || '-'}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(city); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(city.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle de la ciudad</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Nombre:</strong> {selected.name}</p>
            <p><strong>Provincia:</strong> {selected.province?.name || '-'}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
