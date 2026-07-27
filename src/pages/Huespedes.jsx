import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  telefono: '',
  documentoIdentidad: '',
  ciudad: '',
  provincia: '',
  pais: 'Argentina',
};

export default function Huespedes() {
  const [huespedes, setHuespedes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchHuespedes = async () => {
    setError(null);
    try {
      const data = await api.get('/huespedes');
      setHuespedes(data || []);
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

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (editingId) {
      // Solo se pueden editar los datos de perfil; usuario/email/password no se tocan aquí.
      if (!formData.documentoIdentidad || !formData.ciudad || !formData.provincia) {
        setError('Completa todos los campos requeridos.');
        return;
      }
      setLoading(true);
      try {
        await api.put(`/huespedes/${editingId}`, {
          telefono: formData.telefono || null,
          documentoIdentidad: formData.documentoIdentidad,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
          pais: formData.pais,
        });
        setMessage('Huésped actualizado correctamente.');
        resetForm();
        fetchHuespedes();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!formData.username || !formData.email || !formData.password || !formData.documentoIdentidad || !formData.ciudad || !formData.provincia) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/huespedes/registro', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || null,
        documentoIdentidad: formData.documentoIdentidad,
        ciudad: formData.ciudad,
        provincia: formData.provincia,
        pais: formData.pais,
      });
      setMessage('Huésped creado correctamente.');
      resetForm();
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
      username: huesped.usuario?.username || '',
      email: huesped.usuario?.email || '',
      password: '',
      telefono: huesped.telefono || '',
      documentoIdentidad: huesped.documentoIdentidad,
      ciudad: huesped.ciudad || '',
      provincia: huesped.provincia || '',
      pais: huesped.pais || 'Argentina',
    });
    setEditingId(huesped.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Huéspedes</h2>
        <button className="btn btn-primary" onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}>
          {showForm ? 'Cancelar' : '+ Nuevo Huésped'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {!editingId && (
              <>
                <div className="form-group">
                  <label>Usuario</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Nombre de usuario" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="juan@example.com" />
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Contraseña" />
                </div>
              </>
            )}
            <div className="form-group">
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="123456789" />
            </div>
            <div className="form-group">
              <label>Documento de Identidad</label>
              <input type="text" name="documentoIdentidad" value={formData.documentoIdentidad} onChange={handleInputChange} placeholder="12345678" />
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} placeholder="Ciudad" />
            </div>
            <div className="form-group">
              <label>Provincia</label>
              <input type="text" name="provincia" value={formData.provincia} onChange={handleInputChange} placeholder="Provincia" />
            </div>
            <div className="form-group">
              <label>País</label>
              <input type="text" name="pais" value={formData.pais} onChange={handleInputChange} placeholder="País" />
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
              <th>Usuario</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Documento</th>
              <th>Ciudad / Provincia / País</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {huespedes.map((huesped) => (
              <tr key={huesped.id}>
                <td>{huesped.usuario?.username}</td>
                <td>{huesped.usuario?.email}</td>
                <td>{huesped.telefono || '-'}</td>
                <td>{huesped.documentoIdentidad}</td>
                <td>{huesped.ciudad} / {huesped.provincia} / {huesped.pais}</td>
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
