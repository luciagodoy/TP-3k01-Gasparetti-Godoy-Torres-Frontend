import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = { nombre: '', descripcion: '' };

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchServicios = async () => {
    setError(null);
    try {
      const data = await api.get('/servicios');
      setServicios(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const filteredServicios = servicios.filter((servicio) => {
    const value = `${servicio.nombre} ${servicio.descripcion || ''}`.toLowerCase();
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

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido.');
      return;
    }

    setLoading(true);
    try {
      const payload = { nombre: formData.nombre.trim(), descripcion: formData.descripcion.trim() || null };
      if (editingId) {
        await api.put(`/servicios/${editingId}`, payload);
        setMessage('Servicio actualizado correctamente.');
      } else {
        await api.post('/servicios', payload);
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
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/servicios/${id}`);
      setMessage('Servicio eliminado correctamente.');
      if (selected?.id === id) setSelected(null);
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
        <h2>Gestión de Servicios</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Desayuno buffet" />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción breve del servicio"></textarea>
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Servicios</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredServicios.map((servicio) => (
              <tr
                key={servicio.id}
                className={selected?.id === servicio.id ? 'selected-row' : ''}
                onClick={() => setSelected(servicio)}
              >
                <td>{servicio.id}</td>
                <td>{servicio.nombre}</td>
                <td>{servicio.descripcion || '-'}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(servicio); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(servicio.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del servicio</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Nombre:</strong> {selected.nombre}</p>
            <p><strong>Descripción:</strong> {selected.descripcion || '-'}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
