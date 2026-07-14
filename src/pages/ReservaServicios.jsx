import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function ReservaServicios() {
  const [reservaServicios, setReservaServicios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cupos, setCupos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ reservaId: '', cupoId: '', cantidad: 1, precioUnitario: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReservaServicios = async () => {
    setError(null);
    try {
      const response = await api.get('/reserva-servicios');
      setReservaServicios(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchReservas = async () => {
    setError(null);
    try {
      const response = await api.get('/reservas');
      setReservas(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCupos = async () => {
    setError(null);
    try {
      const response = await api.get('/cupos');
      setCupos(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchReservaServicios();
    fetchReservas();
    fetchCupos();
  }, []);

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') return '';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['cantidad'].includes(name) ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData({ reservaId: '', cupoId: '', cantidad: 1, precioUnitario: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.reservaId || !formData.cupoId || formData.cantidad <= 0 || formData.precioUnitario === '') {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        reservaId: Number(formData.reservaId),
        cupoId: Number(formData.cupoId),
        cantidad: formData.cantidad,
        precioUnitario: Number(formData.precioUnitario),
      };

      if (editingId) {
        await api.put(`/reserva-servicios/${editingId}`, payload);
        setMessage('Servicio de reserva actualizado correctamente.');
      } else {
        await api.post('/reserva-servicios', payload);
        setMessage('Servicio de reserva creado correctamente.');
      }
      resetForm();
      fetchReservaServicios();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reservaServicio) => {
    setFormData({
      reservaId: reservaServicio.reservaId || '',
      cupoId: reservaServicio.cupoId || '',
      cantidad: reservaServicio.cantidad,
      precioUnitario: reservaServicio.precioUnitario || '',
    });
    setEditingId(reservaServicio.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/reserva-servicios/${id}`);
      setMessage('Servicio de reserva eliminado correctamente.');
      fetchReservaServicios();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Servicios en Reservas</h2>
        <button className="btn btn-primary" onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}>
          {showForm ? 'Cancelar' : editingId ? 'Editar Servicio' : '+ Nuevo Servicio'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Reserva</label>
              <select name="reservaId" value={formData.reservaId} onChange={handleChange}>
                <option value="">Seleccionar reserva</option>
                {reservas.map((reserva) => (
                  <option key={reserva.id} value={reserva.id}>
                    {`#${reserva.id} - ${reserva.numeroReserva || reserva.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cupo</label>
              <select name="cupoId" value={formData.cupoId} onChange={handleChange}>
                <option value="">Seleccionar cupo</option>
                {cupos.map((cupo) => (
                  <option key={cupo.id} value={cupo.id}>
                    {`#${cupo.id} - ${cupo.Servicio ? cupo.Servicio.nombre : cupo.servicioId}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                min="1"
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Precio unitario</label>
              <input
                type="number"
                step="0.01"
                name="precioUnitario"
                value={formData.precioUnitario}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <h3>Servicios de Reservas</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Reserva</th>
              <th>Cupo</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Monto Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservaServicios.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.Reserva ? `#${item.Reserva.id}` : item.reservaId}</td>
                <td>{item.Cupo ? item.Cupo.id : item.cupoId}</td>
                <td>{item.cantidad}</td>
                <td>{formatPrice(item.precioUnitario)}</td>
                <td>{formatPrice(item.montoTotal)}</td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(item)}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(item.id)} disabled={loading}>
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
