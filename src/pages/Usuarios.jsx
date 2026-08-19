import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import '../styles/pages.css';

const emptyForm = { username: '', email: '', password: '', role: 'huesped' };

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchUsuarios = async () => {
    setError(null);
    try {
      const data = await api.get('/usuarios');
      setUsuarios(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter((usuario) => {
    const value = `${usuario.username} ${usuario.email} ${usuario.role}`.toLowerCase();
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

    if (editingId) {
      if (!formData.username.trim() || !formData.email.trim()) {
        setError('Usuario y email son requeridos.');
        return;
      }
      setLoading(true);
      try {
        await api.put(`/usuarios/${editingId}`, {
          username: formData.username.trim(),
          email: formData.email.trim(),
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
        });
        setMessage('Usuario actualizado correctamente.');
        resetForm();
        fetchUsuarios();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      setError('Usuario, email y contraseña son requeridos.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/usuarios', {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      setMessage('Usuario creado correctamente.');
      resetForm();
      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario) => {
    setFormData({ username: usuario.username, email: usuario.email, password: '', role: usuario.role });
    setEditingId(usuario.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      setError('No podés eliminar tu propia cuenta.');
      return;
    }
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/usuarios/${id}`);
      setMessage('Usuario eliminado correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Usuario</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de usuario" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="usuario@example.com" />
            </div>
            <div className="form-group">
              <label>{editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={editingId ? 'Dejar en blanco para no cambiarla' : 'Contraseña'} />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="huesped">Huésped</option>
                <option value="empleado">Empleado</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Usuarios</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuario, email o rol"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map((usuario) => (
              <tr
                key={usuario.id}
                className={selected?.id === usuario.id ? 'selected-row' : ''}
                onClick={() => setSelected(usuario)}
              >
                <td>{usuario.username}</td>
                <td>{usuario.email}</td>
                <td><span className="badge badge-check-in">{usuario.role}</span></td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(usuario); }}>
                    Editar
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={(e) => { e.stopPropagation(); handleDelete(usuario.id); }}
                    disabled={loading || usuario.id === currentUser?.id}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del usuario</h4>
            <p><strong>Usuario:</strong> {selected.username}</p>
            <p><strong>Email:</strong> {selected.email}</p>
            <p><strong>Rol:</strong> {selected.role}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
