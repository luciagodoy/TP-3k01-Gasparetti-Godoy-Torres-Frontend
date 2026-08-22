import { useEffect, useId, useMemo, useState } from 'react';
import api from '../services/api';

// Selector en cascada: primero provincia, después ciudad (con autocompletar por texto).
// Avisa al padre el ciudadId elegido mediante onChange; '' si todavía no hay una ciudad válida.
export default function SelectorUbicacion({ ciudadId, onChange }) {
  const datalistId = useId();
  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [provinciaId, setProvinciaId] = useState('');
  const [busquedaCiudad, setBusquedaCiudad] = useState('');

  useEffect(() => {
    api.get('/provincias').then((data) => setProvincias(data || [])).catch(() => {});
    api.get('/ciudades').then((data) => setCiudades(data || [])).catch(() => {});
  }, []);

  // Si el padre ya trae un ciudadId (ej: editando un huésped existente), una vez
  // que cargan las ciudades preseleccionamos su provincia y el texto de búsqueda.
  useEffect(() => {
    if (!ciudadId || ciudades.length === 0) return;
    const ciudadActual = ciudades.find((c) => c.id === Number(ciudadId));
    if (ciudadActual) {
      setProvinciaId(String(ciudadActual.provinciaId));
      setBusquedaCiudad(ciudadActual.nombre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciudadId, ciudades.length]);

  const ciudadesDeProvincia = useMemo(
    () => ciudades.filter((c) => String(c.provinciaId) === provinciaId),
    [ciudades, provinciaId]
  );

  const handleProvinciaChange = (e) => {
    setProvinciaId(e.target.value);
    setBusquedaCiudad('');
    onChange('');
  };

  const handleCiudadInput = (e) => {
    const texto = e.target.value;
    setBusquedaCiudad(texto);
    const encontrada = ciudadesDeProvincia.find((c) => c.nombre === texto);
    onChange(encontrada ? encontrada.id : '');
  };

  return (
    <>
      <div className="form-group">
        <label>Provincia</label>
        <select value={provinciaId} onChange={handleProvinciaChange}>
          <option value="">Seleccionar provincia</option>
          {provincias.map((provincia) => (
            <option key={provincia.id} value={provincia.id}>
              {provincia.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Ciudad</label>
        <input
          type="text"
          list={datalistId}
          value={busquedaCiudad}
          onChange={handleCiudadInput}
          placeholder={provinciaId ? 'Escribí para buscar...' : 'Elegí primero una provincia'}
          disabled={!provinciaId}
        />
        <datalist id={datalistId}>
          {ciudadesDeProvincia.map((ciudad) => (
            <option key={ciudad.id} value={ciudad.nombre} />
          ))}
        </datalist>
      </div>
    </>
  );
}
