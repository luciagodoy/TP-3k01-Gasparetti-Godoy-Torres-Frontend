import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomCategoryService } from '../services/resources';
import DateInput from './DateInput';
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
        <label htmlFor="booking-category">Categoría</label>
        <select id="booking-category" name="categoryId" value={filters.categoryId} onChange={handleChange}>
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div className="booking-bar-field">
        <label htmlFor="booking-people">Huéspedes</label>
        <input
          id="booking-people"
          type="number"
          name="people"
          min="1"
          placeholder="1"
          value={filters.people}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="booking-bar-submit">Buscar Habitaciones</button>
    </form>
  );
}
