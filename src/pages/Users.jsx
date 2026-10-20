import { useState } from 'react';
import { userService } from '../services/resources';
import { ROLES } from '../models';
import useQuery from '../hooks/useQuery';
import { useAuth } from '../context/useAuth';
import '../styles/pages.scss';

const emptyForm = { username: '', email: '', password: '', role: ROLES.GUEST };

export default function Users() {
  const { user: currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: users, refetch: fetchUsers } = useQuery(
    '/users',
    () => userService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredUsers = users.filter((user) => {
    const value = `${user.username} ${user.email} ${user.role}`.toLowerCase();
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
        await userService.update(editingId, {
          username: formData.username.trim(),
          email: formData.email.trim(),
          role: formData.role,
          // An empty password field means "keep the current one".
          ...(formData.password ? { password: formData.password } : {}),
        });
        setMessage('Usuario actualizado correctamente.');
        resetForm();
        fetchUsers();
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
      await userService.create({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      setMessage('Usuario creado correctamente.');
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({ username: user.username, email: user.email, password: '', role: user.role });
    setEditingId(user.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      setError('No podés eliminar tu propia cuenta.');
      return;
    }
    if (!window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await userService.remove(id);
      setMessage('Usuario eliminado correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchUsers();
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
              <label htmlFor="user-username">Usuario</label>
              <input id="user-username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de usuario" />
            </div>
            <div className="form-group">
              <label htmlFor="user-email">Email</label>
              <input id="user-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="usuario@example.com" />
            </div>
            <div className="form-group">
              <label htmlFor="user-password">{editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
              <input id="user-password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder={editingId ? 'Dejar en blanco para no cambiarla' : 'Contraseña'} />
            </div>
            <div className="form-group">
              <label htmlFor="user-role">Rol</label>
              <select id="user-role" name="role" value={formData.role} onChange={handleChange}>
                <option value={ROLES.GUEST}>Huésped</option>
                <option value={ROLES.EMPLOYEE}>Empleado</option>
                <option value={ROLES.ADMIN}>Admin</option>
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
              aria-label="Buscar usuario por nombre, email o rol"
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
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className={selected?.id === user.id ? 'selected-row' : ''}
                onClick={() => setSelected(user)}
              >
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td><span className="badge badge-check-in">{user.role}</span></td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(user); }}>
                    Editar
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
                    disabled={loading || user.id === currentUser?.id}
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
