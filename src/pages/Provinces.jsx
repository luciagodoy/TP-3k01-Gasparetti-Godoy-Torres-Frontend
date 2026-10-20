import { useState } from 'react';
import { provinceService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

const emptyForm = { name: '' };

export default function Provinces() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: provinces, refetch: fetchProvinces } = useQuery(
    '/provinces',
    () => provinceService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredProvinces = provinces.filter((province) =>
    searchTerm ? province.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
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
      const payload = { name: formData.name.trim() };
      if (editingId) {
        await provinceService.update(editingId, payload);
        setMessage('Provincia actualizada correctamente.');
      } else {
        await provinceService.create(payload);
        setMessage('Provincia creada correctamente.');
      }
      resetForm();
      fetchProvinces();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (province) => {
    setFormData({ name: province.name });
    setEditingId(province.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta provincia? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await provinceService.remove(id);
      setMessage('Provincia eliminada correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchProvinces();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Provincias</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nueva Provincia'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="province-name">Nombre</label>
              <input id="province-name" type="text" value={formData.name} onChange={handleChange} placeholder="Ej: Córdoba" />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Provincias</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre"
              aria-label="Buscar provincia por nombre"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProvinces.map((province) => (
              <tr
                key={province.id}
                className={selected?.id === province.id ? 'selected-row' : ''}
                onClick={() => setSelected(province)}
              >
                <td>{province.id}</td>
                <td>{province.name}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(province); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(province.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle de la provincia</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Nombre:</strong> {selected.name}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
