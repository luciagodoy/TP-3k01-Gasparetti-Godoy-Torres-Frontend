import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import '../styles/pages.css';

const ROLES = ['huesped', 'empleado', 'admin'];

export default function Usuarios() {
  const { user: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    const searchValue = `${usuario.username || ''} ${usuario.email || ''} ${usuario.role || ''}`.toLowerCase();
    return searchTerm ? searchValue.includes(searchTerm.toLowerCase()) : true;
  });

  const handleRoleChange = async (id, username, role) => {
    const confirmado = window.confirm(
      `Estás a punto de cambiar el rol de "${username}" a "${role}". ¿Estás seguro?`
    );
    if (!confirmado) return;

    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.put(`/usuarios/${id}`, { role });
      setMessage('Rol actualizado correctamente.');
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
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

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
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.username}</td>
                <td>{usuario.email}</td>
                <td>
                  {usuario.id === usuarioActual?.id ? (
                    <span title="No podés cambiar tu propio rol">{usuario.role}</span>
                  ) : (
                    <select
                      value={usuario.role}
                      onChange={(e) => handleRoleChange(usuario.id, usuario.username, e.target.value)}
                      disabled={loading}
                    >
                      {ROLES.map((rol) => (
                        <option key={rol} value={rol}>{rol}</option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
