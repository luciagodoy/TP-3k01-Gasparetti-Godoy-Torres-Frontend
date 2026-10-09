import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/recursos';
import { useAuth } from '../context/useAuth';
import crestLogo from '../assets/crest-logo.png';
import '../styles/pages.scss';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.username || !formData.password) {
      setError('Completa usuario y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const { token, usuario } = await authService.login(formData);
      await login(token, usuario);
      // navigate() toma del destino sólo pathname/search/hash: el state hay que
      // pasarlo aparte. Sin esto se perdía, por ejemplo, la habitación y las
      // fechas elegidas al tocar "Reservar" sin sesión, y /reservar devolvía a /buscar.
      const from = location.state?.from;
      navigate(from ?? '/', { replace: true, state: from?.state });
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
        <h2>Iniciar Sesión</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario o Email</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Usuario o email" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" />
          </div>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>¿No tenés cuenta?</p>
        <Link to="/registro" className="btn btn-secondary">
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
