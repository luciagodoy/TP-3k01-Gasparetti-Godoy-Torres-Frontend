import { useEffect, useId, useState } from 'react';
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
  }, []);

  // Editando un huésped existente sólo llega el id de la ciudad: la pedimos
  // puntualmente para saber a qué provincia pertenece y precargar el texto, en
  // vez de bajar el país entero para buscarla.
  useEffect(() => {
    if (!ciudadId || provinciaId) return;
    api.get(`/ciudades/${ciudadId}`)
      .then((ciudad) => {
        if (!ciudad?.provinciaId) return;
        setProvinciaId(String(ciudad.provinciaId));
        setBusquedaCiudad(ciudad.nombre);
      })
      .catch(() => {});
  }, [ciudadId, provinciaId]);

  // Las ciudades se piden filtradas por provincia: el listado completo del país
  // son ~3900 filas (~1 MB) y esta pantalla es pública.
  useEffect(() => {
    if (!provinciaId) {
      setCiudades([]);
      return;
    }
    api.get(`/ciudades?provinciaId=${provinciaId}`)
      .then((data) => setCiudades(data || []))
      .catch(() => {});
  }, [provinciaId]);

  const handleProvinciaChange = (e) => {
    setProvinciaId(e.target.value);
    setBusquedaCiudad('');
    onChange('');
  };

  const handleCiudadInput = (e) => {
    const texto = e.target.value;
    setBusquedaCiudad(texto);
    const encontrada = ciudades.find((c) => c.nombre === texto);
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
          {ciudades.map((ciudad) => (
            <option key={ciudad.id} value={ciudad.nombre} />
          ))}
        </datalist>
      </div>
    </>
  );
}
