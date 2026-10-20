import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomCategoryService } from '../services/resources';
import ImageGallery from './ImageGallery';
import '../styles/rooms.scss';

export default function CategoryShowcase() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    roomCategoryService.list().then((data) => setCategories(data || [])).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  const handleBook = (category) => {
    navigate('/search', { state: { categoryId: String(category.id) } });
  };

  return (
    <section className="category-showcase">
      <div className="category-showcase-header">
        <span className="eyebrow">Nuestras categorías</span>
        <h2>Habitaciones y suites</h2>
      </div>
      <div className="room-grid">
        {categories.map((category) => (
          <div className="room-card" key={category.id}>
            <ImageGallery images={category.imageUrls} alt={category.name} />
            <div className="room-card-body">
              <h3 className="room-card-title">{category.name}</h3>
              <p className="room-card-meta">Hasta {category.capacity} personas</p>
              {category.description && <p className="room-card-meta">{category.description}</p>}
              <p className="room-card-price">${(category.pricePerNight ?? 0).toFixed(0)} / noche</p>
              <div className="room-card-footer">
                <button className="btn btn-success" onClick={() => handleBook(category)}>
                  Reservar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
