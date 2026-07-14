import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/pages.css';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.nombre.trim()) {
      setError('El nombre de la categoría es requerido.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/categorias', {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      });
      setMessage('Categoría creada correctamente.');
      setFormData({ nombre: '', descripcion: '' });
      fetchCategorias();
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
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
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
            />
          </div>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar categoría'}
          </button>
        </form>
      </div>

      <div className="list-container">
        <h3>Categorías</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.id}</td>
                <td>{categoria.nombre}</td>
                <td>{categoria.descripcion || '-'}</td>
                <td>
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
