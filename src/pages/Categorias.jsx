import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

const emptyForm = { denominacion: '', descripcion: '', capacidadPersonas: 1 };

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    const loadCategorias = async () => {
      setError(null);
      try {
        const data = await api.get('/categorias');
        setCategorias(data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    loadCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacidadPersonas' ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.denominacion.trim() || !formData.capacidadPersonas) {
      setError('Denominación y capacidad de personas son requeridas.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        denominacion: formData.denominacion.trim(),
        descripcion: formData.descripcion.trim() || null,
        capacidadPersonas: formData.capacidadPersonas,
      };
      if (editingId) {
        await api.put(`/categorias/${editingId}`, payload);
        setMessage('Categoría actualizada correctamente.');
      } else {
        await api.post('/categorias', payload);
        setMessage('Categoría creada correctamente.');
      }
      resetForm();
      fetchCategorias();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoria) => {
    setFormData({
      denominacion: categoria.denominacion,
      descripcion: categoria.descripcion || '',
      capacidadPersonas: categoria.capacidadPersonas,
    });
    setEditingId(categoria.id);
  };

  const handleDelete = async (id) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.delete(`/categorias/${id}`);
      setMessage('Categoría eliminada correctamente.');
      fetchCategorias();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Categorías</h2>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Denominación</label>
            <input
              type="text"
              name="denominacion"
              value={formData.denominacion}
              onChange={handleChange}
              placeholder="Ej: Estándar"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción breve de la categoría"
            ></textarea>
          </div>
          <div className="form-group">
            <label>Capacidad de personas</label>
            <input
              type="number"
              name="capacidadPersonas"
              min="1"
              value={formData.capacidadPersonas}
              onChange={handleChange}
            />
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

      <div className="list-container">
        <h3>Categorías</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Denominación</th>
              <th>Descripción</th>
              <th>Capacidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.id}</td>
                <td>{categoria.denominacion}</td>
                <td>{categoria.descripcion || '-'}</td>
                <td>{categoria.capacidadPersonas}</td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(categoria)}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(categoria.id)} disabled={loading}>
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
