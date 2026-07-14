import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function Huespedes() {
  const [huespedes, setHuespedes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documentoId: '',
    ciudad: '',
    provincia: '',
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchHuespedes = async () => {
    setError(null);
    try {
      const response = await api.get('/huespedes');
      setHuespedes(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchHuespedes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.nombre || !formData.apellido || !formData.email || !formData.documentoId || !formData.ciudad || !formData.provincia) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/huespedes/${editingId}`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          documentoId: formData.documentoId,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
        });
        setMessage('Huésped actualizado correctamente.');
      } else {
        await api.post('/huespedes', {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          documentoId: formData.documentoId,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
        });
        setMessage('Huésped creado correctamente.');
      }

      setFormData({ nombre: '', apellido: '', email: '', telefono: '', documentoId: '', ciudad: '', provincia: '' });
      setShowForm(false);
      setEditingId(null);
      fetchHuespedes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/huespedes/${id}`);
      setMessage('Huésped eliminado correctamente.');
      fetchHuespedes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (huesped) => {
    setFormData({
      nombre: huesped.nombre,
      apellido: huesped.apellido,
      email: huesped.email,
      telefono: huesped.telefono || '',
      documentoId: huesped.documentoId,
      ciudad: huesped.ciudad || '',
      provincia: huesped.provincia || '',
    });
    setEditingId(huesped.id);
    setShowForm(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Huéspedes</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Huésped'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre" />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} placeholder="Apellido" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="juan@example.com" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="123456789" />
            </div>
            <div className="form-group">
              <label>Documento de Identidad</label>
              <input type="text" name="documentoId" value={formData.documentoId} onChange={handleInputChange} placeholder="12345678" />
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} placeholder="Ciudad" />
            </div>
            <div className="form-group">
              <label>Provincia</label>
              <input type="text" name="provincia" value={formData.provincia} onChange={handleInputChange} placeholder="Provincia" />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <h3>Huéspedes</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Documento</th>
              <th>Ciudad / Provincia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {huespedes.map((huesped) => (
              <tr key={huesped.id}>
                <td>{huesped.nombre} {huesped.apellido}</td>
                <td>{huesped.email}</td>
                <td>{huesped.telefono}</td>
                <td>{huesped.documentoId}</td>
                <td>{huesped.ciudad} / {huesped.provincia}</td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(huesped)}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(huesped.id)} disabled={loading}>
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
