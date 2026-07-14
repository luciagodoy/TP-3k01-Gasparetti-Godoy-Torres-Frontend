import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function PrecioServicios() {
  const [precios, setPrecios] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ servicioId: '', precio: '', fechaVigenciaDesde: '', fechaVigenciaHasta: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPrecios = async () => {
    setError(null);
    try {
      const response = await api.get('/precio-servicios');
      setPrecios(response.data || []);
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
    fetchPrecios();
    fetchServicios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ servicioId: '', precio: '', fechaVigenciaDesde: '', fechaVigenciaHasta: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') return '';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.servicioId || formData.precio === '' || !formData.fechaVigenciaDesde) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        servicioId: Number(formData.servicioId),
        precio: Number(formData.precio),
        fechaVigenciaDesde: formData.fechaVigenciaDesde,
        fechaVigenciaHasta: formData.fechaVigenciaHasta || null,
      };

      if (editingId) {
        await api.put(`/precio-servicios/${editingId}`, payload);
        setMessage('Precio de servicio actualizado correctamente.');
      } else {
        await api.post('/precio-servicios', payload);
        setMessage('Precio de servicio creado correctamente.');
      }
      resetForm();
      fetchPrecios();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (precio) => {
    setFormData({
      servicioId: precio.servicioId || '',
      precio: precio.precio || '',
      fechaVigenciaDesde: precio.fechaVigenciaDesde ? precio.fechaVigenciaDesde.split('T')[0] : '',
      fechaVigenciaHasta: precio.fechaVigenciaHasta ? precio.fechaVigenciaHasta.split('T')[0] : '',
    });
    setEditingId(precio.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/precio-servicios/${id}`);
      setMessage('Precio de servicio eliminado correctamente.');
      fetchPrecios();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Precios de Servicios</h2>
        <button className="btn btn-primary" onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}>
          {showForm ? 'Cancelar' : editingId ? 'Editar Precio' : '+ Nuevo Precio'}
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
              <label>Precio</label>
              <input
                type="number"
                step="0.01"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Vigencia desde</label>
              <input type="date" name="fechaVigenciaDesde" value={formData.fechaVigenciaDesde} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Vigencia hasta</label>
              <input type="date" name="fechaVigenciaHasta" value={formData.fechaVigenciaHasta} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <h3>Precios de Servicios</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Servicio</th>
              <th>Precio</th>
              <th>Vigencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {precios.map((precio) => (
              <tr key={precio.id}>
                <td>{precio.id}</td>
                <td>{precio.Servicio ? precio.Servicio.nombre : precio.servicioId}</td>
                <td>{formatPrice(precio.precio)}</td>
                <td>
                  {precio.fechaVigenciaDesde ? new Date(precio.fechaVigenciaDesde).toLocaleDateString() : '-'}
                  {' - '}
                  {precio.fechaVigenciaHasta ? new Date(precio.fechaVigenciaHasta).toLocaleDateString() : 'Indefinido'}
                </td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(precio)}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(precio.id)} disabled={loading}>
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
