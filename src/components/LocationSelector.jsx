import { useEffect, useId, useState } from 'react';
import { cityService, provinceService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import { FieldError } from './FormField';

// Selector en cascada: primero la provincia, después la ciudad (con autocompletado de texto).
// Informa al padre el cityId elegido por onChange; '' mientras no haya una ciudad válida.
// `error` (opcional) marca el control que falta completar.
export default function LocationSelector({ cityId, onChange, error }) {
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

  // Sin distinguir mayúsculas ni espacios de más: "rosario " es Rosario.
  const findCity = (list, text) => {
    const wanted = text.trim().toLowerCase();
    return list.find((city) => city.name.toLowerCase() === wanted);
  };

  // Si la ciudad se escribió (o pegó) antes de que llegara la lista de la provincia, se
  // busca de nuevo cuando llega; si no, quedaba escrita pero sin elegir.
  useEffect(() => {
    if (cityId || !citySearch) return;
    const match = findCity(provinceCities, citySearch);
    if (match) onChange(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCities]);

  const handleProvinceChange = (e) => {
    setProvinceId(e.target.value);
    setCitySearch('');
    onChange('');
  };

  const handleCityInput = (e) => {
    const text = e.target.value;
    setCitySearch(text);
    const match = findCity(cities, text);
    onChange(match ? match.id : '');
  };

  // El error se muestra en el control que falta completar: la provincia si no hay ninguna
  // elegida, si no la ciudad.
  const errorId = `${cityInputId}-error`;
  const provinceError = error && !provinceId ? error : null;
  const cityError = error && provinceId ? error : null;
  const errorProps = (fieldError) => ({
    'aria-invalid': Boolean(fieldError),
    'aria-describedby': fieldError ? errorId : undefined,
  });

  return (
    <>
      <div className={`form-group${provinceError ? ' has-error' : ''}`}>
        <label htmlFor={provinceSelectId}>Provincia</label>
        <select id={provinceSelectId} value={provinceId} onChange={handleProvinceChange} {...errorProps(provinceError)}>
          <option value="">Seleccionar provincia</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
        <FieldError id={errorId}>{provinceError}</FieldError>
      </div>
      <div className={`form-group${cityError ? ' has-error' : ''}`}>
        <label htmlFor={cityInputId}>Ciudad</label>
        <input
          id={cityInputId}
          type="text"
          list={datalistId}
          value={citySearch}
          onChange={handleCityInput}
          placeholder={provinceId ? 'Escribí para buscar...' : 'Elegí primero una provincia'}
          disabled={!provinceId}
          {...errorProps(cityError)}
        />
        <datalist id={datalistId}>
          {cities.map((city) => (
            <option key={city.id} value={city.name} />
          ))}
        </datalist>
        <FieldError id={errorId}>{cityError}</FieldError>
      </div>
    </>
  );
}
