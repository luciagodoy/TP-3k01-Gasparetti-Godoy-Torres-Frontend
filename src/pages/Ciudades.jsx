import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function Ciudades() {
  const [ciudades, setCiudades] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', provinciaId: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCiudades = async () => {
    setError(null);
    try {
      const response = await api.get('/ciudades');
      setCiudades(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

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
    fetchCiudades();
    fetchProvincias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ nombre: '', provinciaId: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.nombre.trim() || !formData.provinciaId) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/ciudades/${editingId}`, {
          nombre: formData.nombre.trim(),
          provinciaId: Number(formData.provinciaId),
        });
        setMessage('Ciudad actualizada correctamente.');
      } else {
        await api.post('/ciudades', {
          nombre: formData.nombre.trim(),
          provinciaId: Number(formData.provinciaId),
        });
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
    setFormData({ nombre: ciudad.nombre, provinciaId: ciudad.provinciaId || '' });
    setEditingId(ciudad.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/ciudades/${id}`);
      setMessage('Ciudad eliminada correctamente.');
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
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : editingId ? 'Editar Ciudad' : '+ Nueva Ciudad'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre de la Ciudad</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Buenos Aires"
              />
            </div>
            <div className="form-group">
              <label>Provincia</label>
              <select name="provinciaId" value={formData.provinciaId} onChange={handleChange}>
                <option value="">Seleccionar provincia</option>
                {provincias.map((provincia) => (
                  <option key={provincia.id} value={provincia.id}>
                    {provincia.nombre}
                  </option>
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
        <h3>Ciudades</h3>
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
            {ciudades.map((ciudad) => (
              <tr key={ciudad.id}>
                <td>{ciudad.id}</td>
                <td>{ciudad.nombre}</td>
                <td>{ciudad.Provincia ? ciudad.Provincia.nombre : ciudad.provinciaId}</td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(ciudad)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(ciudad.id)}
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
