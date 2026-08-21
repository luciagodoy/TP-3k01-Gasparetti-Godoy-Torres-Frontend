import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SelectorUbicacion from '../components/SelectorUbicacion';
import '../styles/pages.css';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  telefono: '',
  documentoIdentidad: '',
  ciudadId: '',
  pais: 'Argentina',
};

export default function Registro() {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.username || !formData.email || !formData.password || !formData.documentoIdentidad || !formData.ciudadId) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/huespedes/registro', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || null,
        documentoIdentidad: formData.documentoIdentidad,
        ciudadId: Number(formData.ciudadId),
        pais: formData.pais,
      });
      setMessage('Cuenta creada correctamente. Ya podés iniciar sesión.');
      setFormData(emptyForm);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Crear Cuenta</h2>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de usuario" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="juan@example.com" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="123456789" />
          </div>
          <div className="form-group">
            <label>Documento de Identidad</label>
            <input type="text" name="documentoIdentidad" value={formData.documentoIdentidad} onChange={handleChange} placeholder="12345678" />
          </div>
          <SelectorUbicacion
            ciudadId={formData.ciudadId}
            onChange={(ciudadId) => setFormData((prev) => ({ ...prev, ciudadId }))}
          />
          <div className="form-group">
            <label>País</label>
            <input type="text" name="pais" value={formData.pais} onChange={handleChange} placeholder="País" />
          </div>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
