import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Las notificaciones flotan arriba de la pantalla (position: fixed), en una pila compartida
// fuera del contenido de la página: se ven aunque el usuario haya bajado o tenga zoom.
const STACK_ID = 'notice-stack';
const SUCCESS_HIDE_MS = 6000;

function getStack() {
  let stack = document.getElementById(STACK_ID);
  if (!stack) {
    stack = document.createElement('div');
    stack.id = STACK_ID;
    stack.className = 'notice-stack';
    document.body.appendChild(stack);
  }
  return stack;
}

/**
 * Aviso flotante. Sin `children` no se muestra, así las páginas lo dejan siempre montado:
 * `<Notice type="error" onClose={() => setError(null)}>{error}</Notice>`.
 * Los errores quedan hasta que se cierran (hay que poder leerlos); los de éxito se van solos.
 * @param {{ type?: 'error' | 'success', id?: string, onClose?: () => void, autoHideMs?: number | null, children?: import('react').ReactNode }} props
 */
export default function Notice({ type = 'error', id, onClose, autoHideMs, children }) {
  const hideAfter = autoHideMs !== undefined ? autoHideMs : type === 'success' ? SUCCESS_HIDE_MS : null;

  // Las páginas pasan onClose como función nueva en cada render: con una ref, el temporizador
  // no se reinicia en cada render, sólo cuando cambia el mensaje.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!children || !hideAfter) return undefined;
    const timer = setTimeout(() => onCloseRef.current?.(), hideAfter);
    return () => clearTimeout(timer);
  }, [children, hideAfter]);

  if (!children) return null;

  return createPortal(
    <div id={id} role={type === 'error' ? 'alert' : 'status'} className={`alert alert-${type} notice`}>
      <span className="notice-text">{children}</span>
      {onClose && (
        <button type="button" className="notice-close" aria-label="Cerrar aviso" onClick={onClose}>
          ×
        </button>
      )}
    </div>,
    getStack()
  );
}
