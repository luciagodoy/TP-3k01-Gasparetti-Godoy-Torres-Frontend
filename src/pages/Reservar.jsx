import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/pages.css';

export default function Reservar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { habitacionId, fechaInicio, fechaFin } = location.state || {};

  const [step, setStep] = useState('confirm');
  const [habitacion, setHabitacion] = useState(null);
  const [reserva, setReserva] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [servicioActivo, setServicioActivo] = useState(null);
  const [cupos, setCupos] = useState([]);
  const [precioVigente, setPrecioVigente] = useState(null);
  const [cupoId, setCupoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [lineasAgregadas, setLineasAgregadas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!habitacionId || !fechaInicio || !fechaFin) {
      navigate('/buscar', { replace: true });
      return;
    }
    const fetchHabitacion = async () => {
      try {
        const data = await api.get(`/habitaciones/${habitacionId}`);
        setHabitacion(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchHabitacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const noches = habitacionId && fechaInicio && fechaFin
    ? Math.round((new Date(`${fechaFin}T00:00:00Z`) - new Date(`${fechaInicio}T00:00:00Z`)) / (24 * 60 * 60 * 1000))
    : 0;
  const totalEstimado = habitacion ? noches * (habitacion.categoria?.precioNoche ?? 0) : 0;

  const handleConfirmar = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.post('/reservas/mias', { habitacionId, fechaInicio, fechaFin });
      setReserva(data.reserva);
      const listaServicios = await api.get('/servicios');
      setServicios(listaServicios || []);
      setStep('services');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerServicio = async (servicio) => {
    setError(null);
    setServicioActivo(servicio);
    setCupoId('');
    setCantidad(1);
    try {
      const [cuposData, precioData] = await Promise.all([
        api.get(`/cupos?servicioId=${servicio.id}`),
        api.get(`/precios-servicio?servicioId=${servicio.id}&vigente=true`),
      ]);
      setCupos((cuposData || []).filter((c) => c.disponibles > 0));
      setPrecioVigente(precioData?.[0] || null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAgregarServicio = async () => {
    if (!cupoId || !cantidad) {
      setError('Selecciona un cupo y una cantidad.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const linea = await api.post('/reserva-servicios/mias', {
        reservaId: reserva.id,
        cupoId: Number(cupoId),
        cantidad: Number(cantidad),
      });
      setLineasAgregadas((prev) => [...prev, { ...linea, servicioNombre: servicioActivo.nombre }]);
      setServicioActivo(null);
      setCupos([]);
      setPrecioVigente(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalServicios = lineasAgregadas.reduce((sum, l) => sum + Number(l.montoTotal), 0);

  if (!habitacionId || !fechaInicio || !fechaFin) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Confirmar Reserva</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {step === 'confirm' && (
        <div className="form-container">
          {habitacion ? (
            <>
              <h3>{habitacion.categoria?.denominacion}</h3>
              <p>Habitación N° {habitacion.numero} · Piso {habitacion.piso}</p>
              <p>Check-in: {fechaInicio} · Check-out: {fechaFin} ({noches} {noches === 1 ? 'noche' : 'noches'})</p>
              <p className="room-card-price">Total estimado: ${totalEstimado.toFixed(2)}</p>
              <button className="btn btn-success" onClick={handleConfirmar} disabled={loading}>
                {loading ? 'Confirmando...' : 'Confirmar reserva'}
              </button>
            </>
          ) : (
            <p>Cargando habitación...</p>
          )}
        </div>
      )}

      {step === 'services' && (
        <>
          <div className="alert alert-success">Reserva creada correctamente. ¿Querés agregar servicios adicionales?</div>

          <div className="list-container">
            <h3>Servicios disponibles</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((servicio) => (
                  <tr key={servicio.id}>
                    <td>{servicio.nombre}</td>
                    <td>{servicio.descripcion || '-'}</td>
                    <td>
                      <button className="btn btn-small" onClick={() => handleVerServicio(servicio)}>
                        Ver opciones
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {servicioActivo && (
            <div className="form-container">
              <h4>{servicioActivo.nombre}</h4>
              {precioVigente ? (
                <p>Precio actual: ${Number(precioVigente.precio).toFixed(2)} por unidad</p>
              ) : (
                <p>Este servicio no tiene un precio vigente configurado.</p>
              )}
              {cupos.length === 0 ? (
                <p>No hay disponibilidad para este servicio en este momento.</p>
              ) : (
                <>
                  <div className="form-group">
                    <label>Cupo</label>
                    <select value={cupoId} onChange={(e) => setCupoId(e.target.value)}>
                      <option value="">Seleccionar</option>
                      {cupos.map((cupo) => (
                        <option key={cupo.id} value={cupo.id}>
                          Cupo #{cupo.id} ({cupo.disponibles} disponibles)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cantidad</label>
                    <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                  </div>
                  <button className="btn btn-success" onClick={handleAgregarServicio} disabled={loading || !precioVigente}>
                    {loading ? 'Agregando...' : 'Agregar'}
                  </button>
                </>
              )}
              <button className="btn btn-small" onClick={() => setServicioActivo(null)} style={{ marginLeft: '0.5rem' }}>
                Cancelar
              </button>
            </div>
          )}

          {lineasAgregadas.length > 0 && (
            <div className="list-container">
              <h3>Servicios agregados</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {lineasAgregadas.map((linea) => (
                    <tr key={linea.id}>
                      <td>{linea.servicioNombre}</td>
                      <td>{linea.cantidad}</td>
                      <td>${Number(linea.precioUnitario).toFixed(2)}</td>
                      <td>${Number(linea.montoTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p><strong>Total servicios: ${totalServicios.toFixed(2)}</strong></p>
            </div>
          )}

          <div className="page-header" style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={() => setStep('done')}>
              {lineasAgregadas.length > 0 ? 'Finalizar' : 'Finalizar sin agregar servicios'}
            </button>
          </div>
        </>
      )}

      {step === 'done' && (
        <div className="details-card">
          <h3>¡Reserva confirmada!</h3>
          <p>Tu reserva N° {reserva?.id} fue creada correctamente.</p>
          <p><strong>Total alojamiento:</strong> ${totalEstimado.toFixed(2)}</p>
          {lineasAgregadas.length > 0 && <p><strong>Total servicios:</strong> ${totalServicios.toFixed(2)}</p>}
          <Link className="btn btn-primary" to="/mis-reservas">Ver mis reservas</Link>
        </div>
      )}
    </div>
  );
}
