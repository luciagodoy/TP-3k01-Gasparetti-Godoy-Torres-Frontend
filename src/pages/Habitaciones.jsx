import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = { numero: '', piso: '', categoriaId: '', estadoDisponibilidad: 'disponible' };

export default function Habitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [selectedHabitacion, setSelectedHabitacion] = useState(null);

  const fetchHabitaciones = async () => {
    setError(null);
    try {
      const data = await api.get('/habitaciones');
      setHabitaciones(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategorias = async () => {
    setError(null);
    try {
      const data = await api.get('/categorias');
      setCategorias(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchHabitaciones();
    fetchCategorias();
  }, []);

  const filteredHabitaciones = habitaciones.filter((hab) => {
    const searchValue = `${hab.numero} ${hab.piso} ${hab.estadoDisponibilidad} ${hab.categoria?.denominacion || ''}`.toLowerCase();
    const matchesSearch = searchTerm ? searchValue.includes(searchTerm.toLowerCase()) : true;
    const matchesEstado = estadoFiltro ? hab.estadoDisponibilidad === estadoFiltro : true;
    return matchesSearch && matchesEstado;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'piso' ? Number(value) : value,
    }));
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

    if (!formData.numero || formData.piso === '' || !formData.categoriaId) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        numero: Number(formData.numero),
        piso: Number(formData.piso),
        categoriaId: Number(formData.categoriaId),
        estadoDisponibilidad: formData.estadoDisponibilidad,
      };
      if (editingId) {
        await api.put(`/habitaciones/${editingId}`, payload);
        setMessage('Habitación actualizada correctamente.');
      } else {
        await api.post('/habitaciones', payload);
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
      piso: habitacion.piso,
      categoriaId: habitacion.categoriaId,
      estadoDisponibilidad: habitacion.estadoDisponibilidad,
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
          {showForm ? 'Cancelar' : '+ Nueva Habitación'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Número de Habitación</label>
              <input
                type="number"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="Ej: 101"
              />
            </div>
            <div className="form-group">
              <label>Piso</label>
              <input
                type="number"
                name="piso"
                value={formData.piso}
                onChange={handleInputChange}
                placeholder="Ej: 1"
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select name="categoriaId" value={formData.categoriaId} onChange={handleInputChange}>
                <option value="">Seleccionar categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.denominacion} (hasta {categoria.capacidadPersonas} personas)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select name="estadoDisponibilidad" value={formData.estadoDisponibilidad} onChange={handleInputChange}>
                <option value="disponible">Disponible</option>
                <option value="ocupada">Ocupada</option>
                <option value="mantenimiento">Mantenimiento</option>
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
          <h3>Habitaciones</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, categoría o estado"
            />
            <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Piso</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredHabitaciones.map((hab) => (
              <tr key={hab.id}>
                <td>{hab.numero}</td>
                <td>{hab.piso}</td>
                <td>{hab.categoria ? hab.categoria.denominacion : hab.categoriaId}</td>
                <td><span className={`badge badge-${hab.estadoDisponibilidad}`}>{hab.estadoDisponibilidad}</span></td>
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
        {selectedHabitacion && (
          <div className="details-card">
            <h4>Detalle de la habitación seleccionada</h4>
            <p><strong>ID:</strong> {selectedHabitacion.id}</p>
            <p><strong>Número:</strong> {selectedHabitacion.numero}</p>
            <p><strong>Piso:</strong> {selectedHabitacion.piso}</p>
            <p><strong>Categoría:</strong> {selectedHabitacion.categoria?.denominacion || selectedHabitacion.categoriaId}</p>
            <p><strong>Estado:</strong> {selectedHabitacion.estadoDisponibilidad}</p>
            <p><strong>Capacidad:</strong> {selectedHabitacion.categoria?.capacidadPersonas ?? '-'}</p>
            <button className="btn btn-secondary" onClick={() => setSelectedHabitacion(null)}>
              Cerrar detalle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
