import { useState } from 'react';

export default function GaleriaImagenes({ imagenes, alt }) {
  const [indice, setIndice] = useState(0);

  if (!imagenes || imagenes.length === 0) {
    return <div className="room-card-image-placeholder">Sin imagen</div>;
  }

  const anterior = (e) => {
    e.stopPropagation();
    setIndice((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const siguiente = (e) => {
    e.stopPropagation();
    setIndice((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="room-card-gallery">
      <img className="room-card-image" src={imagenes[indice]} alt={alt} />
      {imagenes.length > 1 && (
        <>
          <button className="room-card-gallery-nav prev" onClick={anterior} type="button" aria-label="Foto anterior">‹</button>
          <button className="room-card-gallery-nav next" onClick={siguiente} type="button" aria-label="Foto siguiente">›</button>
          <div className="room-card-gallery-dots">
            {imagenes.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`room-card-gallery-dot${i === indice ? ' active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setIndice(i); }}
                aria-label={`Ver foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
