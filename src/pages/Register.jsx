import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { guestService } from '../services/resources';
import crestLogo from '../assets/crest-logo.png';
import LocationSelector from '../components/LocationSelector';
import '../styles/pages.scss';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  phone: '',
  documentNumber: '',
  cityId: '',
  country: 'Argentina',
};

export default function Register() {
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

    if (!formData.username || !formData.email || !formData.password || !formData.documentNumber || !formData.cityId) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      await guestService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        documentNumber: formData.documentNumber,
        cityId: Number(formData.cityId),
        country: formData.country,
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
        <img src={crestLogo} alt="" className="page-crest" />
        <h2>Crear Cuenta</h2>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-username">Usuario</label>
            <input id="register-username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de usuario" />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input id="register-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="juan@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Contraseña</label>
            <input id="register-password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" />
          </div>
          <div className="form-group">
            <label htmlFor="register-phone">Teléfono</label>
            <input id="register-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="123456789" />
          </div>
          <div className="form-group">
            <label htmlFor="register-document">Documento de Identidad</label>
            <input id="register-document" type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} placeholder="12345678" />
          </div>
          <LocationSelector
            cityId={formData.cityId}
            onChange={(cityId) => setFormData((prev) => ({ ...prev, cityId }))}
          />
          <div className="form-group">
            <label htmlFor="register-country">País</label>
            <input id="register-country" type="text" name="country" value={formData.country} onChange={handleChange} placeholder="País" />
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
