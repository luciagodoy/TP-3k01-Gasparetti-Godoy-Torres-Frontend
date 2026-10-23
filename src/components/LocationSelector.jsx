import { useEffect, useId, useState } from 'react';
import { cityService, provinceService } from '../services/resources';
import useQuery from '../hooks/useQuery';

// Selector en cascada: primero la provincia, después la ciudad (con autocompletado de texto).
// Informa al padre el cityId elegido por onChange; '' mientras no haya una ciudad válida.
export default function LocationSelector({ cityId, onChange }) {
  const datalistId = useId();
  const provinceSelectId = useId();
  const cityInputId = useId();
  const [provinceId, setProvinceId] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const { data: provinces } = useQuery('/provinces', () => provinceService.list(), {
    initialData: [],
  });

  // Al editar un huésped existente sólo llega el id de la ciudad: se pide esa
  // ciudad para conocer su provincia y precargar el texto, en vez de descargar
  // todo el país para buscarla.
  useEffect(() => {
    if (!cityId || provinceId) return;
    cityService.get(cityId)
      .then((city) => {
        if (!city?.provinceId) return;
        setProvinceId(String(city.provinceId));
        setCitySearch(city.name);
      })
      .catch(() => {});
  }, [cityId, provinceId]);

  // Las ciudades se piden por provincia

  const { data: provinceCities } = useQuery(
    `/cities?provinceId=${provinceId}`,
    () => cityService.list({ provinceId }),
    { initialData: [], enabled: Boolean(provinceId) }
  );

  const cities = provinceId ? provinceCities : [];

  const handleProvinceChange = (e) => {
    setProvinceId(e.target.value);
    setCitySearch('');
    onChange('');
  };

  const handleCityInput = (e) => {
    const text = e.target.value;
    setCitySearch(text);
    const match = cities.find((city) => city.name === text);
    onChange(match ? match.id : '');
  };

  return (
    <>
      <div className="form-group">
        <label htmlFor={provinceSelectId}>Provincia</label>
        <select id={provinceSelectId} value={provinceId} onChange={handleProvinceChange}>
          <option value="">Seleccionar provincia</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor={cityInputId}>Ciudad</label>
        <input
          id={cityInputId}
          type="text"
          list={datalistId}
          value={citySearch}
          onChange={handleCityInput}
          placeholder={provinceId ? 'Escribí para buscar...' : 'Elegí primero una provincia'}
          disabled={!provinceId}
        />
        <datalist id={datalistId}>
          {cities.map((city) => (
            <option key={city.id} value={city.name} />
          ))}
        </datalist>
      </div>
    </>
  );
}
