import { useEffect, useRef, useState } from 'react';
import '../styles/datepicker.css';

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const pad = (n) => String(n).padStart(2, '0');

const parseISO = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
};

const toISO = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

const formatDisplay = (iso) => {
  const parsed = parseISO(iso);
  return parsed ? `${pad(parsed.d)}/${pad(parsed.m)}/${parsed.y}` : '';
};

// 0 = lunes ... 6 = domingo, para que la grilla empiece la semana en lunes.
const primerDiaSemana = (y, m) => (new Date(y, m - 1, 1).getDay() + 6) % 7;

const diasEnMes = (y, m) => new Date(y, m, 0).getDate();

// Selector de fecha propio: al abrirse muestra únicamente los días del mes
// activo (celdas vacías para el desfasaje inicial, nada de días de meses
// vecinos) y expone el valor seleccionado formateado dd/mm/yyyy.
export default function DateInput({ name, value, onChange, min, max, placeholder = 'dd/mm/yyyy' }) {
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);
  const today = new Date();
  const [viewYear, setViewYear] = useState(selected?.y ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.m ?? today.getMonth() + 1);
  const containerRef = useRef(null);

  useEffect(() => {
    if (selected) {
      setViewYear(selected.y);
      setViewMonth(selected.m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const selectDay = (d) => {
    onChange({ target: { name, value: toISO(viewYear, viewMonth, d) } });
    setOpen(false);
  };

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const totalDias = diasEnMes(viewYear, viewMonth);
  const offset = primerDiaSemana(viewYear, viewMonth);
  const celdas = [...Array(offset).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];

  const isDisabled = (d) => {
    const iso = toISO(viewYear, viewMonth, d);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  return (
    <div className="date-input" ref={containerRef}>
      <button type="button" className="date-input-trigger" onClick={() => setOpen((o) => !o)}>
        {value ? formatDisplay(value) : <span className="date-input-placeholder">{placeholder}</span>}
      </button>

      {open && (
        <div className="date-input-popup">
          <div className="date-input-header">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Mes anterior">‹</button>
            <span>{MESES[viewMonth - 1]} {viewYear}</span>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Mes siguiente">›</button>
          </div>
          <div className="date-input-weekdays">
            {DIAS_SEMANA.map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="date-input-grid">
            {celdas.map((d, i) => (
              d === null ? (
                <span key={`empty-${i}`} className="date-input-cell empty" />
              ) : (
                <button
                  type="button"
                  key={d}
                  className={`date-input-cell${selected && selected.y === viewYear && selected.m === viewMonth && selected.d === d ? ' selected' : ''}`}
                  onClick={() => selectDay(d)}
                  disabled={isDisabled(d)}
                >
                  {d}
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
