import { useEffect, useId, useState } from 'react';
import { cityService, provinceService } from '../services/resources';
import useQuery from '../hooks/useQuery';

// Cascading selector: province first, then city (with text autocomplete).
// Reports the chosen cityId to the parent through onChange; '' while there is no valid city.
export default function LocationSelector({ cityId, onChange }) {
  const datalistId = useId();
  const provinceSelectId = useId();
  const cityInputId = useId();
  const [provinceId, setProvinceId] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const { data: provinces } = useQuery('/provinces', () => provinceService.list(), {
    initialData: [],
  });

  // When editing an existing guest only the city id arrives: that one city is
  // fetched to learn its province and prefill the text, instead of downloading
  // the whole country to look for it.
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

  // Cities are requested per province: the whole country is ~3900 rows (~1 MB)
  // and this screen is public.
  const { data: provinceCities } = useQuery(
    `/cities?provinceId=${provinceId}`,
    () => cityService.list({ provinceId }),
    { initialData: [], enabled: Boolean(provinceId) }
  );

  // Derived instead of cleared in an effect: without a province there are no
  // cities to offer, and the cached list must not reappear.
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
