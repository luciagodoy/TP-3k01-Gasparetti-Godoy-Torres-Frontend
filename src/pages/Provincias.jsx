import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function Provincias() {
  const [provincias, setProvincias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProvincias = async () => {
    setError(null);
    try {
      const response = await api.get('/provincias');
      setProvincias(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProvincias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ nombre: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.nombre.trim()) {
      setError('El nombre de la provincia es requerido.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/provincias/${editingId}`, {
          nombre: formData.nombre.trim(),
        });
        setMessage('Provincia actualizada correctamente.');
      } else {
        await api.post('/provincias', {
          nombre: formData.nombre.trim(),
        });
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
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/provincias/${id}`);
      setMessage('Provincia eliminada correctamente.');
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
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : editingId ? 'Editar Provincia' : '+ Nueva Provincia'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre de la Provincia</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Córdoba"
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <h3>Provincias</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {provincias.map((provincia) => (
              <tr key={provincia.id}>
                <td>{provincia.id}</td>
                <td>{provincia.nombre}</td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(provincia)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(provincia.id)}
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
