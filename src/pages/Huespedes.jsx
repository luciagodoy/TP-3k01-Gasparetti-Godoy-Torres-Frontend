import { useEffect, useState } from 'react';
import api from '../services/api';
import SelectorUbicacion from '../components/SelectorUbicacion';
import '../styles/pages.css';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  telefono: '',
  documentoIdentidad: '',
  ciudadId: '',
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHuesped, setSelectedHuesped] = useState(null);

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

  const filteredHuespedes = huespedes.filter((huesped) => {
    const searchValue = `${huesped.usuario?.username || ''} ${huesped.usuario?.email || ''} ${huesped.documentoIdentidad || ''} ${huesped.ciudad?.nombre || ''}`.toLowerCase();
    return searchTerm ? searchValue.includes(searchTerm.toLowerCase()) : true;
  });

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
      if (!formData.documentoIdentidad || !formData.ciudadId) {
        setError('Completa todos los campos requeridos.');
        return;
      }
      setLoading(true);
      try {
        await api.put(`/huespedes/${editingId}`, {
          telefono: formData.telefono || null,
          documentoIdentidad: formData.documentoIdentidad,
          ciudadId: Number(formData.ciudadId),
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

    if (!formData.username || !formData.email || !formData.password || !formData.documentoIdentidad || !formData.ciudadId) {
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
        ciudadId: Number(formData.ciudadId),
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
      ciudadId: huesped.ciudadId ?? huesped.ciudad?.id ?? '',
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
            <SelectorUbicacion
              ciudadId={formData.ciudadId}
              onChange={(ciudadId) => setFormData((prev) => ({ ...prev, ciudadId }))}
            />
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
        <div className="list-header">
          <h3>Huéspedes</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email, documento o ciudad"
            />
          </div>
        </div>
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
            {filteredHuespedes.map((huesped) => (
              <tr key={huesped.id}>
                <td>{huesped.usuario?.username}</td>
                <td>{huesped.usuario?.email}</td>
                <td>{huesped.telefono || '-'}</td>
                <td>{huesped.documentoIdentidad}</td>
                <td>{huesped.ciudad?.nombre} / {huesped.ciudad?.provincia?.nombre} / {huesped.pais}</td>
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
        {selectedHuesped && (
          <div className="details-card">
            <h4>Detalle del huésped seleccionado</h4>
            <p><strong>ID:</strong> {selectedHuesped.id}</p>
            <p><strong>Usuario:</strong> {selectedHuesped.usuario?.username}</p>
            <p><strong>Email:</strong> {selectedHuesped.usuario?.email}</p>
            <p><strong>Teléfono:</strong> {selectedHuesped.telefono || '-'}</p>
            <p><strong>Documento:</strong> {selectedHuesped.documentoIdentidad}</p>
            <p><strong>Ciudad:</strong> {selectedHuesped.ciudad?.nombre}</p>
            <p><strong>Provincia:</strong> {selectedHuesped.ciudad?.provincia?.nombre}</p>
            <p><strong>País:</strong> {selectedHuesped.pais}</p>
            <button className="btn btn-secondary" onClick={() => setSelectedHuesped(null)}>
              Cerrar detalle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
