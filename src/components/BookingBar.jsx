import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomCategoryService } from '../services/resources';
import CategorySelector from './CategorySelector';
import DateInput from './DateInput';
import GuestSelector from './GuestSelector';
import { largestCapacity } from '../models';
import '../styles/booking-bar.scss';

const emptyFilters = { startDate: '', endDate: '', categoryId: '', people: '' };

export default function BookingBar() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    roomCategoryService.list().then((data) => setCategories(data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/search', { state: filters });
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form className="booking-bar" onSubmit={handleSubmit}>
      <div className="booking-bar-field">
        <label htmlFor="booking-start-date">Check In</label>
        <DateInput id="booking-start-date" name="startDate" value={filters.startDate} onChange={handleChange} min={today} />
      </div>
      <div className="booking-bar-field">
        <label htmlFor="booking-end-date">Check Out</label>
        <DateInput
          id="booking-end-date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          min={filters.startDate || today}
        />
      </div>
      <div className="booking-bar-field">
        <label id="booking-category-label">Categoría</label>
        <CategorySelector
          id="booking-category"
          labelId="booking-category-label"
          name="categoryId"
          value={filters.categoryId}
          onChange={handleChange}
          categories={categories}
        />
      </div>
      <div className="booking-bar-field">
        <label htmlFor="booking-people">Número de huéspedes</label>
        <GuestSelector id="booking-people" name="people" value={filters.people} onChange={handleChange} max={largestCapacity(categories)} />
      </div>
      <button type="submit" className="booking-bar-submit">Buscar Habitaciones</button>
    </form>
  );
}
