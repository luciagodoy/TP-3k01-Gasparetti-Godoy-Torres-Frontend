import { useState } from 'react';
import { roomCategoryService } from '../services/resources';
import { useAuth } from '../context/useAuth';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

const emptyForm = { name: '', description: '', capacity: 1, imageUrls: '', pricePerNight: '' };

// Public page: anyone can browse the categories; staff can also edit them
// (POST/PUT/DELETE /room-categories are auth.staff on the backend).
export default function RoomCategories() {
  const { user } = useAuth();
  const canEdit = Boolean(user?.isStaff);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data: categories, refetch: fetchCategories } = useQuery(
    '/room-categories',
    () => roomCategoryService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'capacity' ? Number(value) : value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.name.trim() || !formData.capacity) {
      setError('Denominación y capacidad de personas son requeridas.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        capacity: formData.capacity,
        // One URL per line in the textarea.
        imageUrls: formData.imageUrls.split('\n').map((url) => url.trim()).filter(Boolean),
        pricePerNight: parseFloat(formData.pricePerNight) || 0,
      };
      if (editingId) {
        await roomCategoryService.update(editingId, payload);
        setMessage('Categoría actualizada correctamente.');
      } else {
        await roomCategoryService.create(payload);
        setMessage('Categoría creada correctamente.');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      capacity: category.capacity,
      imageUrls: category.imageUrls.join('\n'),
      pricePerNight: category.pricePerNight ?? 0,
    });
    setEditingId(category.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await roomCategoryService.remove(id);
      setMessage('Categoría eliminada correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Categorías</h2>
      </div>

      {message && <div role="status" className="alert alert-success">{message}</div>}
      {error && <div role="alert" className="alert alert-error">{error}</div>}

      {canEdit && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="category-name">Denominación</label>
              <input id="category-name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Estándar" />
            </div>
            <div className="form-group">
              <label htmlFor="category-description">Descripción</label>
              <textarea
                id="category-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción breve de la categoría"
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="category-capacity">Capacidad de personas</label>
              <input id="category-capacity" type="number" name="capacity" min="1" value={formData.capacity} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="category-images">URLs de imágenes (una por línea)</label>
              <textarea
                id="category-images"
                name="imageUrls"
                value={formData.imageUrls}
                onChange={handleChange}
                placeholder={'https://...\nhttps://...'}
                rows={4}
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="category-price">Precio por noche</label>
              <input id="category-price" type="number" step="0.01" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange} placeholder="0.00" />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar categoría' : 'Guardar categoría'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-small" onClick={resetForm}>
                Cancelar edición
              </button>
            )}
          </form>
        </div>
      )}

      <div className="list-container">
        <h3>Categorías</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Denominación</th>
              <th>Descripción</th>
              <th>Capacidad</th>
              <th>Precio/Noche</th>
              <th>Imágenes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className={selected?.id === category.id ? 'selected-row' : ''}
                onClick={() => setSelected(category)}
              >
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                <td>{category.capacity}</td>
                <td>${(category.pricePerNight ?? 0).toFixed(2)}</td>
                <td>
                  {category.imageUrls.length ? (
                    <div className="table-thumbnail">
                      <img src={category.imageUrls[0]} alt={category.name} />
                      {category.imageUrls.length > 1 && <span>+{category.imageUrls.length - 1}</span>}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); setSelected(category); }}>
                    Ver detalle
                  </button>
                  {canEdit && (
                    <>
                      <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(category); }}>
                        Editar
                      </button>
                      <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }} disabled={loading}>
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle de la categoría</h4>
            <p><strong>Denominación:</strong> {selected.name}</p>
            <p><strong>Descripción:</strong> {selected.description || '-'}</p>
            <p><strong>Capacidad:</strong> hasta {selected.capacity} personas</p>
            <p><strong>Precio por noche:</strong> ${(selected.pricePerNight ?? 0).toFixed(2)}</p>
            <p><strong>Imágenes:</strong> {selected.imageUrls.length}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
