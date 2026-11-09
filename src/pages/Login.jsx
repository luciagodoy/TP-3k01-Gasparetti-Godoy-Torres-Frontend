import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/resources';
import { useAuth } from '../context/useAuth';
import FormField from '../components/FormField';
import { hasErrors, validateLogin } from '../utils/accountRules';
import crestLogo from '../assets/crest-logo.png';
import '../styles/pages.scss';

const FIELD_IDS = { username: 'login-username', password: 'login-password' };
const FORM_ERROR_ID = 'login-error';

const focusField = (name) => document.getElementById(FIELD_IDS[name])?.focus();

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  // Credenciales incorrectas: se marcan los dos campos, porque la API no dice cuál falló.
  const [badCredentials, setBadCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setBadCredentials(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setBadCredentials(false);

    const errors = validateLogin(formData);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      setFormError('Completá usuario y contraseña.');
      focusField(Object.keys(errors)[0]);
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await authService.login(formData);
      await login(token, user);
      // navigate() sólo toma pathname/search/hash del destino: el state hay que
      // pasarlo aparte. Sin esto, la habitación y las fechas elegidas al tocar
      // "Reservar" sin sesión se perdían y /book mandaba de vuelta a /search.
      const from = location.state?.from;
      navigate(from ?? '/', { replace: true, state: from?.state });
    } catch (err) {
      if (err.status === 401) {
        setBadCredentials(true);
        setFormError('El usuario o la contraseña no son correctos.');
        focusField('password');
      } else {
        setFieldErrors(err.fields ?? {});
        setFormError(err.message);
      }
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

      {formError && (
        <div id={FORM_ERROR_ID} role="alert" className="alert alert-error">
          {formError}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id={FIELD_IDS.username}
            label="Usuario o Email"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Usuario o email"
            autoComplete="username"
            error={fieldErrors.username}
            invalid={badCredentials}
            describedBy={FORM_ERROR_ID}
          />
          <FormField
            id={FIELD_IDS.password}
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
            autoComplete="current-password"
            error={fieldErrors.password}
            invalid={badCredentials}
            describedBy={FORM_ERROR_ID}
          />
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
