import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    habitacionId: '',
    huespedId: '',
    fechaEntrada: '',
    fechaSalida: '',
    cantidadPersonas: 1,
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [huespedes, setHuespedes] = useState([]);

  const fetchReservas = async () => {
    setError(null);
    try {
      const response = await api.get('/reservas');
      setReservas(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

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
    fetchReservas();
    fetchHuespedes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cantidadPersonas' ? Number(value) : value,
    }));
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.habitacionId || !formData.huespedId || !formData.fechaEntrada || !formData.fechaSalida) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reservas', {
        habitacionId: Number(formData.habitacionId),
        huespedId: Number(formData.huespedId),
        fechaEntrada: formData.fechaEntrada,
        fechaSalida: formData.fechaSalida,
        cantidadPersonas: formData.cantidadPersonas,
      });
      setMessage('Reserva creada correctamente.');
      setFormData({ habitacionId: '', huespedId: '', fechaEntrada: '', fechaSalida: '', cantidadPersonas: 1 });
      setShowForm(false);
      fetchReservas();
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
      await api.delete(`/reservas/${id}`);
      setMessage('Reserva cancelada correctamente.');
      fetchReservas();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Reservas</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva Reserva'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleCreateReservation}>
            <div className="form-group">
              <label>ID de Habitación</label>
              <input
                type="number"
                name="habitacionId"
                value={formData.habitacionId}
                onChange={handleInputChange}
                placeholder="Ej: 1"
              />
            </div>
            <div className="form-group">
              <label>Huésped</label>
              <select name="huespedId" value={formData.huespedId} onChange={handleInputChange}>
                <option value="">Seleccionar huésped</option>
                {huespedes.map((huesped) => (
                  <option key={huesped.id} value={huesped.id}>
                    {huesped.nombre} {huesped.apellido} ({huesped.documentoId})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Fecha de Entrada</label>
              <input type="date" name="fechaEntrada" value={formData.fechaEntrada} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Fecha de Salida</label>
              <input type="date" name="fechaSalida" value={formData.fechaSalida} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Cantidad de Personas</label>
              <input
                type="number"
                name="cantidadPersonas"
                value={formData.cantidadPersonas}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <h3>Reservas</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Huésped</th>
              <th>Habitación</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Estado</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => {
              const huesped = reserva.Huesped ? `${reserva.Huesped.nombre} ${reserva.Huesped.apellido}` : reserva.huespedId;
              const habitacion = reserva.Habitacion ? reserva.Habitacion.numero : reserva.habitacionId;
              return (
                <tr key={reserva.id}>
                  <td>{reserva.id}</td>
                  <td>{huesped}</td>
                  <td>{habitacion}</td>
                  <td>{new Date(reserva.fechaEntrada).toLocaleDateString()}</td>
                  <td>{new Date(reserva.fechaSalida).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${reserva.estado}`}>{reserva.estado}</span>
                  </td>
                  <td>{reserva.montoTotal ? `$${reserva.montoTotal}` : '-'}</td>
                  <td>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(reserva.id)} disabled={loading}>
                      Cancelar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
