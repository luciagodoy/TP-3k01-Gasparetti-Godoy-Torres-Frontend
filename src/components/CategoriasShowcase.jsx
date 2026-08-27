import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GaleriaImagenes from './GaleriaImagenes';
import '../styles/rooms.css';

export default function CategoriasShowcase() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    api.get('/categorias').then((data) => setCategorias(data || [])).catch(() => {});
  }, []);

  if (categorias.length === 0) return null;

  const handleReservar = (categoria) => {
    navigate('/buscar', { state: { categoriaId: String(categoria.id) } });
  };

  return (
    <section className="categorias-showcase">
      <div className="categorias-showcase-header">
        <span className="eyebrow">Nuestras categorías</span>
        <h2>Habitaciones y suites</h2>
      </div>
      <div className="room-grid">
        {categorias.map((categoria) => (
          <div className="room-card" key={categoria.id}>
            <GaleriaImagenes imagenes={categoria.imagenesUrl} alt={categoria.denominacion} />
            <div className="room-card-body">
              <h3 className="room-card-title">{categoria.denominacion}</h3>
              <p className="room-card-meta">Hasta {categoria.capacidadPersonas} personas</p>
              {categoria.descripcion && <p className="room-card-meta">{categoria.descripcion}</p>}
              <p className="room-card-price">${Number(categoria.precioNoche ?? 0).toFixed(0)} / noche</p>
              <div className="room-card-footer">
                <button className="btn btn-success" onClick={() => handleReservar(categoria)}>
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
