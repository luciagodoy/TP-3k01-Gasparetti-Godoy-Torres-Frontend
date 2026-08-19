import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = { cantidad: 1, servicioId: '' };

export default function Cupos() {
  const [cupos, setCupos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchCupos = async () => {
    setError(null);
    try {
      const data = await api.get('/cupos');
      setCupos(data || []);
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
    fetchCupos();
    fetchServicios();
  }, []);

  const filteredCupos = cupos.filter((cupo) =>
    searchTerm ? (cupo.servicio?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'cantidad' ? Number(value) : value }));
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

    if (!formData.cantidad || !formData.servicioId) {
      setError('Cantidad y servicio son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = { cantidad: formData.cantidad, servicioId: Number(formData.servicioId) };
      if (editingId) {
        await api.put(`/cupos/${editingId}`, payload);
        setMessage('Cupo actualizado correctamente.');
      } else {
        await api.post('/cupos', payload);
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
    setFormData({ cantidad: cupo.cantidad, servicioId: cupo.servicioId ?? cupo.servicio?.id ?? '' });
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
      if (selected?.id === id) setSelected(null);
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
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Cupo'}
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
              <label>Cantidad total</label>
              <input type="number" name="cantidad" min="1" value={formData.cantidad} onChange={handleChange} />
            </div>
            {editingId && (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '-0.6rem', marginBottom: '1rem' }}>
                Al cambiar la cantidad, la disponibilidad se ajusta proporcionalmente (no se puede bajar por debajo de lo ya consumido).
              </p>
            )}
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Cupos</h3>
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
              <th>Cantidad</th>
              <th>Disponibles</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCupos.map((cupo) => (
              <tr
                key={cupo.id}
                className={selected?.id === cupo.id ? 'selected-row' : ''}
                onClick={() => setSelected(cupo)}
              >
                <td>{cupo.id}</td>
                <td>{cupo.servicio?.nombre || '-'}</td>
                <td>{cupo.cantidad}</td>
                <td>{cupo.disponibles}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(cupo); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(cupo.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del cupo</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Servicio:</strong> {selected.servicio?.nombre || '-'}</p>
            <p><strong>Cantidad total:</strong> {selected.cantidad}</p>
            <p><strong>Disponibles:</strong> {selected.disponibles}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
