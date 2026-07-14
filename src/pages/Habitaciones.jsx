import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function Habitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    categoriaId: '',
    capacidad: 1,
    precioNoche: '',
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHabitaciones = async () => {
    setError(null);
    try {
      const response = await api.get('/habitaciones');
      setHabitaciones(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategorias = async () => {
    setError(null);
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchHabitaciones();
    fetchCategorias();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacidad' ? Number(value) : value,
    }));
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const numberValue = typeof value === 'string' ? Number(value) : value;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);
  };

  const resetForm = () => {
    setFormData({ numero: '', categoriaId: '', capacidad: 1, precioNoche: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.numero || !formData.categoriaId || !formData.capacidad || !formData.precioNoche) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/habitaciones/${editingId}`, {
          numero: formData.numero,
          categoriaId: Number(formData.categoriaId),
          capacidad: formData.capacidad,
          precioNoche: parseFloat(formData.precioNoche),
        });
        setMessage('Habitación actualizada correctamente.');
      } else {
        await api.post('/habitaciones', {
          numero: formData.numero,
          categoriaId: Number(formData.categoriaId),
          capacidad: formData.capacidad,
          precioNoche: parseFloat(formData.precioNoche),
        });
        setMessage('Habitación creada correctamente.');
      }
      resetForm();
      fetchHabitaciones();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (habitacion) => {
    setFormData({
      numero: habitacion.numero,
      categoriaId: habitacion.categoriaId,
      capacidad: habitacion.capacidad,
      precioNoche: habitacion.precioNoche,
    });
    setEditingId(habitacion.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/habitaciones/${id}`);
      setMessage('Habitación eliminada correctamente.');
      fetchHabitaciones();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Habitaciones</h2>
        <button className="btn btn-primary" onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}>
          {showForm ? 'Cancelar' : editingId ? 'Editar Habitación' : '+ Nueva Habitación'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Número de Habitación</label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="Ej: 101"
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select name="categoriaId" value={formData.categoriaId} onChange={handleInputChange}>
                <option value="">Seleccionar categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Capacidad</label>
              <input
                type="number"
                name="capacidad"
                min="1"
                value={formData.capacidad}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Precio por Noche</label>
              <input
                type="number"
                step="0.01"
                name="precioNoche"
                value={formData.precioNoche}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <h3>Habitaciones</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Categoría</th>
              <th>Capacidad</th>
              <th>Precio/Noche</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.map((hab) => (
              <tr key={hab.id}>
                <td>{hab.numero}</td>
                <td>{hab.CategoriaHabitacion ? hab.CategoriaHabitacion.nombre : hab.categoriaId}</td>
                <td>{hab.capacidad} personas</td>
                <td>{formatPrice(hab.precioNoche)}</td>
                <td><span className={`badge badge-${hab.estado}`}>{hab.estado}</span></td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(hab)}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(hab.id)} disabled={loading}>
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
