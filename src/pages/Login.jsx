import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/resources';
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
      const { token, user } = await authService.login(formData);
      await login(token, user);
      // navigate() only takes pathname/search/hash from the target: the state
      // has to be passed separately. Without this, the room and dates chosen
      // when pressing "Reservar" logged out were lost and /book sent back to /search.
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

      {error && (
        <div id="login-error" role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-username">Usuario o Email</label>
            <input
              id="login-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Usuario o email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="form-prompt">¿No tenés cuenta?</p>
        <Link to="/register" className="btn btn-secondary">
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
