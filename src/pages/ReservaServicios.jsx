import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = { reservaId: '', cupoId: '', cantidad: 1, precioUnitario: '' };

export default function ReservaServicios() {
  const [lineas, setLineas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cupos, setCupos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchLineas = async () => {
    setError(null);
    try {
      const data = await api.get('/reserva-servicios');
      setLineas(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchReservas = async () => {
    try {
      const data = await api.get('/reservas');
      setReservas(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCupos = async () => {
    try {
      const data = await api.get('/cupos');
      setCupos(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchLineas();
    fetchReservas();
    fetchCupos();
  }, []);

  const filteredLineas = lineas.filter((linea) => {
    const value = `${linea.reservaId} ${linea.cupo?.servicio?.nombre || ''}`.toLowerCase();
    return searchTerm ? value.includes(searchTerm.toLowerCase()) : true;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'cantidad' ? Number(value) : value }));
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
      if (!formData.cantidad || !formData.precioUnitario) {
        setError('Cantidad y precio unitario son requeridos.');
        return;
      }
      setLoading(true);
      try {
        await api.put(`/reserva-servicios/${editingId}`, {
          cantidad: formData.cantidad,
          precioUnitario: parseFloat(formData.precioUnitario),
        });
        setMessage('Consumo actualizado correctamente.');
        resetForm();
        fetchLineas();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!formData.reservaId || !formData.cupoId || !formData.cantidad || !formData.precioUnitario) {
      setError('Reserva, cupo, cantidad y precio unitario son requeridos.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reserva-servicios', {
        reservaId: Number(formData.reservaId),
        cupoId: Number(formData.cupoId),
        cantidad: formData.cantidad,
        precioUnitario: parseFloat(formData.precioUnitario),
      });
      setMessage('Consumo registrado correctamente.');
      resetForm();
      fetchLineas();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (linea) => {
    setFormData({
      reservaId: linea.reservaId,
      cupoId: linea.cupoId,
      cantidad: linea.cantidad,
      precioUnitario: linea.precioUnitario,
    });
    setEditingId(linea.id);
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
      setMessage('Consumo eliminado correctamente (cupo liberado).');
      if (selected?.id === id) setSelected(null);
      fetchLineas();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reservaLabel = (reserva) =>
    `#${reserva.id} - Habitación ${reserva.habitacion?.numero ?? reserva.habitacionId} (${reserva.fechaInicio} a ${reserva.fechaFin})`;

  const cupoLabel = (cupo) =>
    `${cupo.servicio?.nombre || `Servicio #${cupo.servicioId}`} - ${cupo.disponibles}/${cupo.cantidad} disponibles`;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Consumos de Servicio</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Consumo'}
        </button>
      </div>

      <p style={{ color: 'var(--muted)', marginTop: '-1rem', marginBottom: '1.5rem' }}>
        Los huéspedes agregan servicios a su propia reserva desde "Reservar". Esta pantalla es para
        que el personal registre o corrija consumos manualmente.
      </p>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {!editingId && (
              <>
                <div className="form-group">
                  <label>Reserva</label>
                  <select name="reservaId" value={formData.reservaId} onChange={handleChange}>
                    <option value="">Seleccionar reserva</option>
                    {reservas.map((reserva) => (
                      <option key={reserva.id} value={reserva.id}>{reservaLabel(reserva)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cupo</label>
                  <select name="cupoId" value={formData.cupoId} onChange={handleChange}>
                    <option value="">Seleccionar cupo</option>
                    {cupos.map((cupo) => (
                      <option key={cupo.id} value={cupo.id}>{cupoLabel(cupo)}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className="form-group">
              <label>Cantidad</label>
              <input type="number" name="cantidad" min="1" value={formData.cantidad} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Precio unitario</label>
              <input type="number" step="0.01" name="precioUnitario" value={formData.precioUnitario} onChange={handleChange} placeholder="0.00" />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Consumos</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por reserva o servicio"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Reserva</th>
              <th>Servicio</th>
              <th>Cantidad</th>
              <th>P. Unitario</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredLineas.map((linea) => (
              <tr
                key={linea.id}
                className={selected?.id === linea.id ? 'selected-row' : ''}
                onClick={() => setSelected(linea)}
              >
                <td>#{linea.reservaId}</td>
                <td>{linea.cupo?.servicio?.nombre || '-'}</td>
                <td>{linea.cantidad}</td>
                <td>${Number(linea.precioUnitario).toFixed(2)}</td>
                <td>${Number(linea.montoTotal).toFixed(2)}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(linea); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(linea.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del consumo</h4>
            <p><strong>Reserva:</strong> #{selected.reservaId}</p>
            <p><strong>Servicio:</strong> {selected.cupo?.servicio?.nombre || '-'}</p>
            <p><strong>Cantidad:</strong> {selected.cantidad}</p>
            <p><strong>Precio unitario:</strong> ${Number(selected.precioUnitario).toFixed(2)}</p>
            <p><strong>Total:</strong> ${Number(selected.montoTotal).toFixed(2)}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
