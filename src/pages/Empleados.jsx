import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = { nombre: '', apellido: '', email: '', telefono: '', puesto: '', estado: 'activo' };

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchEmpleados = async () => {
    setError(null);
    try {
      const data = await api.get('/empleados');
      setEmpleados(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const filteredEmpleados = empleados.filter((empleado) => {
    const value = `${empleado.nombre} ${empleado.apellido} ${empleado.email} ${empleado.puesto}`.toLowerCase();
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

    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim() || !formData.puesto.trim()) {
      setError('Nombre, apellido, email y puesto son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim() || null,
        puesto: formData.puesto.trim(),
        estado: formData.estado,
      };
      if (editingId) {
        await api.put(`/empleados/${editingId}`, payload);
        setMessage('Empleado actualizado correctamente.');
      } else {
        await api.post('/empleados', payload);
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
      puesto: empleado.puesto,
      estado: empleado.estado,
    });
    setEditingId(empleado.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/empleados/${id}`);
      setMessage('Empleado eliminado correctamente.');
      if (selected?.id === id) setSelected(null);
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
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Empleado'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="empleado@hotel.com" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="123456789" />
            </div>
            <div className="form-group">
              <label>Puesto</label>
              <input type="text" name="puesto" value={formData.puesto} onChange={handleChange} placeholder="Ej: Recepcionista" />
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
        <div className="list-header">
          <h3>Empleados</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o puesto"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Puesto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmpleados.map((empleado) => (
              <tr
                key={empleado.id}
                className={selected?.id === empleado.id ? 'selected-row' : ''}
                onClick={() => setSelected(empleado)}
              >
                <td>{empleado.nombre} {empleado.apellido}</td>
                <td>{empleado.email}</td>
                <td>{empleado.telefono || '-'}</td>
                <td>{empleado.puesto}</td>
                <td><span className={`badge badge-${empleado.estado}`}>{empleado.estado}</span></td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(empleado); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(empleado.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del empleado</h4>
            <p><strong>Nombre:</strong> {selected.nombre} {selected.apellido}</p>
            <p><strong>Email:</strong> {selected.email}</p>
            <p><strong>Teléfono:</strong> {selected.telefono || '-'}</p>
            <p><strong>Puesto:</strong> {selected.puesto}</p>
            <p><strong>Estado:</strong> {selected.estado}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
