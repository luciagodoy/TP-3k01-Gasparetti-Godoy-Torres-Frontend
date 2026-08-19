import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = { nombre: '', provinciaId: '' };

export default function Ciudades() {
  const [ciudades, setCiudades] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchCiudades = async () => {
    setError(null);
    try {
      const data = await api.get('/ciudades');
      setCiudades(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProvincias = async () => {
    try {
      const data = await api.get('/provincias');
      setProvincias(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCiudades();
    fetchProvincias();
  }, []);

  const filteredCiudades = ciudades.filter((ciudad) => {
    const value = `${ciudad.nombre} ${ciudad.provincia?.nombre || ''}`.toLowerCase();
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

    if (!formData.nombre.trim() || !formData.provinciaId) {
      setError('Nombre y provincia son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = { nombre: formData.nombre.trim(), provinciaId: Number(formData.provinciaId) };
      if (editingId) {
        await api.put(`/ciudades/${editingId}`, payload);
        setMessage('Ciudad actualizada correctamente.');
      } else {
        await api.post('/ciudades', payload);
        setMessage('Ciudad creada correctamente.');
      }
      resetForm();
      fetchCiudades();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ciudad) => {
    setFormData({ nombre: ciudad.nombre, provinciaId: ciudad.provinciaId ?? ciudad.provincia?.id ?? '' });
    setEditingId(ciudad.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/ciudades/${id}`);
      setMessage('Ciudad eliminada correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchCiudades();
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
              <label>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Río Cuarto" />
            </div>
            <div className="form-group">
              <label>Provincia</label>
              <select name="provinciaId" value={formData.provinciaId} onChange={handleChange}>
                <option value="">Seleccionar provincia</option>
                {provincias.map((provincia) => (
                  <option key={provincia.id} value={provincia.id}>{provincia.nombre}</option>
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
            {filteredCiudades.map((ciudad) => (
              <tr
                key={ciudad.id}
                className={selected?.id === ciudad.id ? 'selected-row' : ''}
                onClick={() => setSelected(ciudad)}
              >
                <td>{ciudad.id}</td>
                <td>{ciudad.nombre}</td>
                <td>{ciudad.provincia?.nombre || '-'}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(ciudad); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(ciudad.id); }} disabled={loading}>
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
            <p><strong>Nombre:</strong> {selected.nombre}</p>
            <p><strong>Provincia:</strong> {selected.provincia?.nombre || '-'}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
