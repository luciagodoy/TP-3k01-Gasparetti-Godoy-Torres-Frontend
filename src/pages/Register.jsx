import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { guestService } from '../services/resources';
import FormField from '../components/FormField';
import LocationSelector from '../components/LocationSelector';
import { hasErrors, PASSWORD_MIN, USERNAME_MAX, USERNAME_MIN, validateRegistration } from '../utils/accountRules';
import crestLogo from '../assets/crest-logo.png';
import '../styles/pages.scss';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  documentNumber: '',
  cityId: '',
  country: 'Argentina',
};

// En el orden del formulario: al fallar, el foco va al primer campo con error.
const FIELD_IDS = {
  username: 'register-username',
  email: 'register-email',
  password: 'register-password',
  confirmPassword: 'register-confirm-password',
  phone: 'register-phone',
  documentNumber: 'register-document',
  country: 'register-country',
};

const focusFirstInvalid = (errors) => {
  const first = Object.keys(FIELD_IDS).find((name) => errors[name]);
  if (first) document.getElementById(FIELD_IDS[first])?.focus();
};

export default function Register() {
  const [formData, setFormData] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleChange = (e) => updateField(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setMessage(null);

    const errors = validateRegistration(formData);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      setFormError('Revisá los campos marcados.');
      focusFirstInvalid(errors);
      return;
    }

    setLoading(true);
    try {
      await guestService.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || null,
        documentNumber: formData.documentNumber.trim(),
        cityId: Number(formData.cityId),
        country: formData.country.trim(),
      });
      setMessage('Cuenta creada correctamente. Ya podés iniciar sesión.');
      setFormData(emptyForm);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      // 400 con formato inválido o 409 con usuario/email/documento repetido: el servidor
      // dice qué campo falló. Cualquier otro error (red, límite de intentos) va arriba.
      const serverErrors = err.fields ?? {};
      setFieldErrors(serverErrors);
      setFormError(err.message);
      focusFirstInvalid(serverErrors);
    } finally {
      setLoading(false);
    }
  };

  const field = (name) => ({
    id: FIELD_IDS[name],
    name,
    value: formData[name],
    onChange: handleChange,
    error: fieldErrors[name],
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <img src={crestLogo} alt="" className="page-crest" />
        <h2>Crear Cuenta</h2>
      </div>

      {message && (
        <div role="status" className="alert alert-success">
          {message}
        </div>
      )}
      {formError && (
        <div role="alert" className="alert alert-error">
          {formError}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            {...field('username')}
            label="Usuario"
            type="text"
            placeholder="Nombre de usuario"
            autoComplete="username"
            hint={`De ${USERNAME_MIN} a ${USERNAME_MAX} caracteres: letras, números, punto, guion o guion bajo.`}
          />
          <FormField {...field('email')} label="Email" type="email" placeholder="juan@example.com" autoComplete="email" />
          <FormField
            {...field('password')}
            label="Contraseña"
            type="password"
            placeholder="Contraseña"
            autoComplete="new-password"
            hint={`Al menos ${PASSWORD_MIN} caracteres, con letras y números.`}
          />
          <FormField
            {...field('confirmPassword')}
            label="Repetir contraseña"
            type="password"
            placeholder="Repetí la contraseña"
            autoComplete="new-password"
          />
          <FormField {...field('phone')} label="Teléfono (opcional)" type="tel" placeholder="341 555-1234" autoComplete="tel" />
          <FormField
            {...field('documentNumber')}
            label="Documento de Identidad"
            type="text"
            placeholder="12345678"
            hint="Sin puntos ni espacios."
          />
          <LocationSelector
            cityId={formData.cityId}
            onChange={(cityId) => updateField('cityId', cityId)}
            error={fieldErrors.cityId}
          />
          <FormField {...field('country')} label="País" type="text" placeholder="País" autoComplete="country-name" />
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="form-prompt">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
