import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchServicios = async () => {
    setError(null);
    try {
      const response = await api.get('/servicios');
      setServicios(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.nombre.trim()) {
      setError('El nombre del servicio es requerido.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/servicios/${editingId}`, {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
        });
        setMessage('Servicio actualizado correctamente.');
      } else {
        await api.post('/servicios', {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
        });
        setMessage('Servicio creado correctamente.');
      }
      resetForm();
      fetchServicios();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (servicio) => {
    setFormData({ nombre: servicio.nombre, descripcion: servicio.descripcion || '' });
    setEditingId(servicio.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/servicios/${id}`);
      setMessage('Servicio eliminado correctamente.');
      fetchServicios();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Servicios Adicionales</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : editingId ? 'Editar Servicio' : '+ Nuevo Servicio'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre del Servicio</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Desayuno"
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción del servicio"
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <h3>Servicios Disponibles</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => (
              <tr key={servicio.id}>
                <td>{servicio.nombre}</td>
                <td>{servicio.descripcion || '-'}</td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(servicio)}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(servicio.id)} disabled={loading}>
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
