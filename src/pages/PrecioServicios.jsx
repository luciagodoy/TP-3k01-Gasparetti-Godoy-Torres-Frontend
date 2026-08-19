import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = { servicioId: '', precio: '', fechaVigenciaDesde: '', fechaVigenciaHasta: '' };

export default function PrecioServicios() {
  const [precios, setPrecios] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchPrecios = async () => {
    setError(null);
    try {
      const data = await api.get('/precios-servicio');
      setPrecios(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchServicios = async () => {
    try {
      const data = await api.get('/servicios');
      setServicios(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPrecios();
    fetchServicios();
  }, []);

  const filteredPrecios = precios.filter((precio) =>
    searchTerm ? (precio.servicio?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

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

    if (!formData.servicioId || !formData.precio || !formData.fechaVigenciaDesde) {
      setError('Servicio, precio y fecha de inicio de vigencia son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        servicioId: Number(formData.servicioId),
        precio: parseFloat(formData.precio),
        fechaVigenciaDesde: formData.fechaVigenciaDesde,
        fechaVigenciaHasta: formData.fechaVigenciaHasta || null,
      };
      if (editingId) {
        await api.put(`/precios-servicio/${editingId}`, payload);
        setMessage('Precio actualizado correctamente.');
      } else {
        await api.post('/precios-servicio', payload);
        setMessage('Precio creado correctamente.');
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
      servicioId: precio.servicioId ?? precio.servicio?.id ?? '',
      precio: precio.precio,
      fechaVigenciaDesde: precio.fechaVigenciaDesde,
      fechaVigenciaHasta: precio.fechaVigenciaHasta || '',
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
      await api.delete(`/precios-servicio/${id}`);
      setMessage('Precio eliminado correctamente.');
      if (selected?.id === id) setSelected(null);
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
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Precio'}
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
                  <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Precio</label>
              <input type="number" step="0.01" name="precio" value={formData.precio} onChange={handleChange} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Vigente desde</label>
              <input type="date" name="fechaVigenciaDesde" value={formData.fechaVigenciaDesde} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Vigente hasta (opcional)</label>
              <input type="date" name="fechaVigenciaHasta" value={formData.fechaVigenciaHasta} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Precios</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por servicio"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Servicio</th>
              <th>Precio</th>
              <th>Vigente desde</th>
              <th>Vigente hasta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrecios.map((precio) => (
              <tr
                key={precio.id}
                className={selected?.id === precio.id ? 'selected-row' : ''}
                onClick={() => setSelected(precio)}
              >
                <td>{precio.id}</td>
                <td>{precio.servicio?.nombre || '-'}</td>
                <td>${Number(precio.precio).toFixed(2)}</td>
                <td>{precio.fechaVigenciaDesde}</td>
                <td>{precio.fechaVigenciaHasta || 'Sin límite'}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(precio); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(precio.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del precio</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Servicio:</strong> {selected.servicio?.nombre || '-'}</p>
            <p><strong>Precio:</strong> ${Number(selected.precio).toFixed(2)}</p>
            <p><strong>Vigente desde:</strong> {selected.fechaVigenciaDesde}</p>
            <p><strong>Vigente hasta:</strong> {selected.fechaVigenciaHasta || 'Sin límite'}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
