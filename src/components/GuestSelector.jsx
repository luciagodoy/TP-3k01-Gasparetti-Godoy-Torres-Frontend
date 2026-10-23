import { useEffect, useId, useRef, useState } from 'react';
import '../styles/guest-selector.scss';

const guestsLabel = (count) => `${count} ${count === 1 ? 'huésped' : 'huéspedes'}`;
export default function GuestSelector({ id, name, value, onChange, max = 10 }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const moreRef = useRef(null);
  const lessRef = useRef(null);
  const panelId = useId();
  const count = Math.max(1, Number(value) || 1);

  useEffect(() => {
    if (!open) return undefined;
    moreRef.current?.focus();
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const change = (delta) => {
    const next = count + delta;
    onChange({ target: { name, value: next } });
    if (next <= 1) moreRef.current?.focus();
    if (next >= max) lessRef.current?.focus();
  };

  return (
    <div className="guest-selector" ref={containerRef}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className="guest-selector-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <svg className="guest-selector-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
        </svg>
        <span className="guest-selector-summary">1 habitación · {guestsLabel(count)}</span>
      </button>

      {open && (
        <div id={panelId} className="guest-selector-panel" role="dialog" aria-label="Número de huéspedes">
          <p className="guest-selector-room">Habitación 1</p>
          <div className="guest-selector-row">
            <span className="guest-selector-row-label">Huéspedes</span>
            <div className="guest-selector-stepper">
              <button
                ref={lessRef}
                type="button"
                className="guest-selector-step"
                aria-label="Quitar un huésped"
                onClick={() => change(-1)}
                disabled={count <= 1}
              >
                −
              </button>
              <output className="guest-selector-count" aria-live="polite">{count}</output>
              <button
                ref={moreRef}
                type="button"
                className="guest-selector-step"
                aria-label="Agregar un huésped"
                onClick={() => change(1)}
                disabled={count >= max}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
