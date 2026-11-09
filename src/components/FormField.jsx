import { useId } from 'react';

function AlertIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12a1 1 0 0 1 1 1v3.5a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 8.5a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Mensaje de error de un campo. Lo usa FormField y cualquier control que no sea un input
// simple (p. ej. LocationSelector).
export function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="field-error">
      <AlertIcon />
      <span>{children}</span>
    </p>
  );
}

// Campo de formulario con su label y su mensaje de error. Con error, el campo se marca con
// borde rojo, aria-invalid y aria-describedby, para que el lector de pantalla lea el mensaje.
// `invalid` marca el campo sin mensaje propio, y `describedBy` apunta a un mensaje compartido
// (p. ej. "usuario o contraseña incorrectos" vale para los dos campos del login).
export default function FormField({ id, label, error, hint, invalid = false, describedBy: sharedMessageId, ...inputProps }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const isInvalid = invalid || Boolean(error);
  const describedBy =
    [error && errorId, hint && !error && hintId, isInvalid && sharedMessageId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`form-group${isInvalid ? ' has-error' : ''}`}>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-invalid={isInvalid} aria-describedby={describedBy} {...inputProps} />
      {hint && !error && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
