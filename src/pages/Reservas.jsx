import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = {
  habitacionId: '',
  huespedId: '',
  fechaInicio: '',
  fechaFin: '',
  montoTotal: '',
};

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [huespedes, setHuespedes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [selectedReserva, setSelectedReserva] = useState(null);

  const fetchReservas = async () => {
    setError(null);
    try {
      const data = await api.get('/reservas');
      setReservas(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchHuespedes = async () => {
    setError(null);
    try {
      const data = await api.get('/huespedes');
      setHuespedes(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchHabitaciones = async () => {
    setError(null);
    try {
      const data = await api.get('/habitaciones');
      setHabitaciones(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchReservas();
    fetchHuespedes();
    fetchHabitaciones();
  }, []);

  const filteredReservas = reservas.filter((r) => {
    const searchValue = `${r.id} ${r.huesped?.usuario?.username || r.huespedId || ''} ${r.habitacion?.numero || r.habitacionId || ''} ${r.estado || ''}`.toLowerCase();
    const matchesSearch = searchTerm ? searchValue.includes(searchTerm.toLowerCase()) : true;
    const matchesEstado = estadoFiltro ? r.estado === estadoFiltro : true;
    return matchesSearch && matchesEstado;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.habitacionId || !formData.huespedId || !formData.fechaInicio || !formData.fechaFin || !formData.montoTotal) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reservas', {
        habitacionId: Number(formData.habitacionId),
        huespedId: Number(formData.huespedId),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        montoTotal: parseFloat(formData.montoTotal),
      });
      setMessage('Reserva creada correctamente.');
      setFormData(emptyForm);
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
      setMessage('Reserva eliminada correctamente.');
      fetchReservas();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nombreHuesped = (huespedId) => {
    const huesped = huespedes.find((h) => h.id === huespedId);
    return huesped ? huesped.usuario?.username || `#${huespedId}` : huespedId;
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
              <label>Habitación</label>
              <select name="habitacionId" value={formData.habitacionId} onChange={handleInputChange}>
                <option value="">Seleccionar habitación</option>
                {habitaciones.map((hab) => (
                  <option key={hab.id} value={hab.id}>
                    {hab.numero} {hab.categoria ? `- ${hab.categoria.denominacion}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Huésped</label>
              <select name="huespedId" value={formData.huespedId} onChange={handleInputChange}>
                <option value="">Seleccionar huésped</option>
                {huespedes.map((huesped) => (
                  <option key={huesped.id} value={huesped.id}>
                    {huesped.usuario?.username} ({huesped.documentoIdentidad})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Fecha de Inicio</label>
              <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Fecha de Fin</label>
              <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Monto Total</label>
              <input
                type="number"
                step="0.01"
                name="montoTotal"
                value={formData.montoTotal}
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
        <div className="list-header">
          <h3>Reservas</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, huésped, habitación o estado"
            />
            <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="check-in">Check-in</option>
              <option value="check-out">Check-out</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Huésped</th>
              <th>Habitación</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservas.map((reserva) => (
              <tr key={reserva.id} onClick={() => setSelectedReserva(reserva)} className={selectedReserva?.id === reserva.id ? 'selected-row' : ''}>
                <td>{reserva.id}</td>
                <td>{nombreHuesped(reserva.huespedId)}</td>
                <td>{reserva.habitacion ? reserva.habitacion.numero : reserva.habitacionId}</td>
                <td>{new Date(reserva.fechaInicio).toLocaleDateString()}</td>
                <td>{new Date(reserva.fechaFin).toLocaleDateString()}</td>
                <td>
                  <span className={`badge badge-${reserva.estado}`}>{reserva.estado}</span>
                </td>
                <td>{reserva.montoTotal ? `$${reserva.montoTotal}` : '-'}</td>
                <td>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(reserva.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedReserva && (
          <div className="details-card">
            <h4>Detalle de la reserva seleccionada</h4>
            <p><strong>ID:</strong> {selectedReserva.id}</p>
            <p><strong>Huésped:</strong> {selectedReserva.huesped?.usuario?.username ?? selectedReserva.huespedId}</p>
            <p><strong>Habitación:</strong> {selectedReserva.habitacion ? selectedReserva.habitacion.numero : selectedReserva.habitacionId}</p>
            <p><strong>Inicio:</strong> {new Date(selectedReserva.fechaInicio).toLocaleDateString()}</p>
            <p><strong>Fin:</strong> {new Date(selectedReserva.fechaFin).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> {selectedReserva.estado}</p>
            <p><strong>Monto total:</strong> ${selectedReserva.montoTotal}</p>
            <button className="btn btn-secondary" onClick={() => setSelectedReserva(null)}>
              Cerrar detalle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
