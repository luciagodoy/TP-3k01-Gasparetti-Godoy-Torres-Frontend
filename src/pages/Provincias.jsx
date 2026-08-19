import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = { nombre: '' };

export default function Provincias() {
  const [provincias, setProvincias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchProvincias = async () => {
    setError(null);
    try {
      const data = await api.get('/provincias');
      setProvincias(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProvincias();
  }, []);

  const filteredProvincias = provincias.filter((provincia) =>
    searchTerm ? provincia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const handleChange = (e) => {
    setFormData({ nombre: e.target.value });
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

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido.');
      return;
    }

    setLoading(true);
    try {
      const payload = { nombre: formData.nombre.trim() };
      if (editingId) {
        await api.put(`/provincias/${editingId}`, payload);
        setMessage('Provincia actualizada correctamente.');
      } else {
        await api.post('/provincias', payload);
        setMessage('Provincia creada correctamente.');
      }
      resetForm();
      fetchProvincias();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (provincia) => {
    setFormData({ nombre: provincia.nombre });
    setEditingId(provincia.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/provincias/${id}`);
      setMessage('Provincia eliminada correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchProvincias();
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
              <label>Nombre</label>
              <input type="text" value={formData.nombre} onChange={handleChange} placeholder="Ej: Córdoba" />
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
            {filteredProvincias.map((provincia) => (
              <tr
                key={provincia.id}
                className={selected?.id === provincia.id ? 'selected-row' : ''}
                onClick={() => setSelected(provincia)}
              >
                <td>{provincia.id}</td>
                <td>{provincia.nombre}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(provincia); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(provincia.id); }} disabled={loading}>
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
            <p><strong>Nombre:</strong> {selected.nombre}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
