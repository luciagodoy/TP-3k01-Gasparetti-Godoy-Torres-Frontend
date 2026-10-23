import { useState } from 'react';
import { roomCategoryService, roomService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';
const ROOM_STATUS_OPTIONS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'ocupada', label: 'Ocupada' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
];

const emptyForm = { number: '', floor: '', categoryId: '', status: 'disponible' };

export default function Rooms() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: rooms, refetch: fetchRooms } = useQuery(
    '/rooms',
    () => roomService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const { data: categories } = useQuery(
    '/room-categories',
    () => roomCategoryService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredRooms = rooms.filter((room) => {
    const searchValue = `${room.number} ${room.floor} ${room.status} ${room.category?.name || ''}`.toLowerCase();
    const matchesSearch = searchTerm ? searchValue.includes(searchTerm.toLowerCase()) : true;
    const matchesStatus = statusFilter ? room.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e) => {
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

    if (!formData.number || formData.floor === '' || !formData.categoryId) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        number: Number(formData.number),
        floor: Number(formData.floor),
        categoryId: Number(formData.categoryId),
        status: formData.status,
      };
      if (editingId) {
        await roomService.update(editingId, payload);
        setMessage('Habitación actualizada correctamente.');
      } else {
        await roomService.create(payload);
        setMessage('Habitación creada correctamente.');
      }
      resetForm();
      fetchRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setFormData({
      number: room.number,
      floor: room.floor,
      categoryId: room.categoryId,
      status: room.status,
    });
    setEditingId(room.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta habitación? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await roomService.remove(id);
      setMessage('Habitación eliminada correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchRooms();
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
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nueva Habitación'}
        </button>
      </div>

      {message && <div role="status" className="alert alert-success">{message}</div>}
      {error && <div role="alert" className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="room-number">Número de Habitación</label>
              <input id="room-number" type="number" name="number" value={formData.number} onChange={handleInputChange} placeholder="Ej: 101" />
            </div>
            <div className="form-group">
              <label htmlFor="room-floor">Piso</label>
              <input id="room-floor" type="number" name="floor" value={formData.floor} onChange={handleInputChange} placeholder="Ej: 1" />
            </div>
            <div className="form-group">
              <label htmlFor="room-category">Categoría</label>
              <select id="room-category" name="categoryId" value={formData.categoryId} onChange={handleInputChange}>
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} (hasta {category.capacity} personas)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="room-status">Estado</label>
              <select id="room-status" name="status" value={formData.status} onChange={handleInputChange}>
                {ROOM_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
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
              aria-label="Buscar habitación por número, categoría o estado"
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrar por estado">
              <option value="">Todos los estados</option>
              {ROOM_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
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
            {filteredRooms.map((room) => (
              <tr
                key={room.id}
                className={selected?.id === room.id ? 'selected-row' : ''}
                onClick={() => setSelected(room)}
              >
                <td>{room.number}</td>
                <td>{room.floor}</td>
                <td>{room.category ? room.category.name : room.categoryId}</td>
                <td><span className={`badge badge-${room.status}`}>{room.status}</span></td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); setSelected(room); }}>
                    Ver detalle
                  </button>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(room); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(room.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selected && (
          <div className="details-card">
            <h4>Detalle de la habitación seleccionada</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Número:</strong> {selected.number}</p>
            <p><strong>Piso:</strong> {selected.floor}</p>
            <p><strong>Categoría:</strong> {selected.category?.name || selected.categoryId}</p>
            <p><strong>Estado:</strong> {selected.status}</p>
            <p><strong>Capacidad:</strong> {selected.category?.capacity ?? '-'}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>
              Cerrar detalle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
