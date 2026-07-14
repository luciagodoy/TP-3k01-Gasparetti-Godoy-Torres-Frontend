import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    puesto: '',
    estado: 'activo',
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEmpleados = async () => {
    setError(null);
    try {
      const response = await api.get('/empleados');
      setEmpleados(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ nombre: '', apellido: '', email: '', telefono: '', puesto: '', estado: 'activo' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.nombre || !formData.apellido || !formData.email || !formData.puesto) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/empleados/${editingId}`, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          puesto: formData.puesto,
          estado: formData.estado,
        });
        setMessage('Empleado actualizado correctamente.');
      } else {
        await api.post('/empleados', {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          puesto: formData.puesto,
        });
        setMessage('Empleado creado correctamente.');
      }
      resetForm();
      fetchEmpleados();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (empleado) => {
    setFormData({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      telefono: empleado.telefono || '',
      puesto: empleado.puesto || '',
      estado: empleado.estado || 'activo',
    });
    setEditingId(empleado.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/empleados/${id}`);
      setMessage('Empleado eliminado correctamente.');
      fetchEmpleados();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Empleados</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : editingId ? 'Editar Empleado' : '+ Nuevo Empleado'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Carlos" />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="López" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="carlos@hotel.com" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="987654321" />
            </div>
            <div className="form-group">
              <label>Puesto</label>
              <input type="text" name="puesto" value={formData.puesto} onChange={handleChange} placeholder="Recepcionista" />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select name="estado" value={formData.estado} onChange={handleChange}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <h3>Empleados</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Puesto</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.nombre} {emp.apellido}</td>
                <td>{emp.email}</td>
                <td>{emp.puesto}</td>
                <td>{emp.telefono}</td>
                <td><span className={`badge badge-${emp.estado}`}>{emp.estado}</span></td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(emp)}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(emp.id)} disabled={loading}>
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
