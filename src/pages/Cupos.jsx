import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function Cupos() {
  const [cupos, setCupos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ servicioId: '', cantidad: 1, disponibles: 1 });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCupos = async () => {
    setError(null);
    try {
      const response = await api.get('/cupos');
      setCupos(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

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
    fetchCupos();
    fetchServicios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['cantidad', 'disponibles'].includes(name) ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData({ servicioId: '', cantidad: 1, disponibles: 1 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.servicioId || formData.cantidad <= 0 || formData.disponibles < 0) {
      setError('Completa todos los campos requeridos y utiliza valores válidos.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/cupos/${editingId}`, {
          servicioId: Number(formData.servicioId),
          cantidad: formData.cantidad,
          disponibles: formData.disponibles,
        });
        setMessage('Cupo actualizado correctamente.');
      } else {
        await api.post('/cupos', {
          servicioId: Number(formData.servicioId),
          cantidad: formData.cantidad,
          disponibles: formData.disponibles,
        });
        setMessage('Cupo creado correctamente.');
      }
      resetForm();
      fetchCupos();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cupo) => {
    setFormData({
      servicioId: cupo.servicioId || '',
      cantidad: cupo.cantidad,
      disponibles: cupo.disponibles,
    });
    setEditingId(cupo.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/cupos/${id}`);
      setMessage('Cupo eliminado correctamente.');
      fetchCupos();
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
        <button className="btn btn-primary" onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}>
          {showForm ? 'Cancelar' : editingId ? 'Editar Cupo' : '+ Nuevo Cupo'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Servicio</label>
              <select name="servicioId" value={formData.servicioId} onChange={handleChange}>
                <option value="">Seleccionar servicio</option>
                {servicios.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad total</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                min="1"
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Disponibles</label>
              <input
                type="number"
                name="disponibles"
                value={formData.disponibles}
                min="0"
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <h3>Cupos</h3>
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
            {cupos.map((cupo) => (
              <tr key={cupo.id}>
                <td>{cupo.id}</td>
                <td>{cupo.Servicio ? cupo.Servicio.nombre : cupo.servicioId}</td>
                <td>{cupo.cantidad}</td>
                <td>{cupo.disponibles}</td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(cupo)}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(cupo.id)} disabled={loading}>
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
