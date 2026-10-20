import { useState } from 'react';

// Photo carousel of a room category card.
export default function ImageGallery({ images, alt }) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="room-card-image-placeholder">Sin imagen</div>;
  }

  // stopPropagation: the gallery lives inside clickable cards.
  const previous = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const next = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="room-card-gallery">
      <img className="room-card-image" src={images[index]} alt={alt} />
      {images.length > 1 && (
        <>
          <button className="room-card-gallery-nav prev" onClick={previous} type="button" aria-label="Foto anterior">‹</button>
          <button className="room-card-gallery-nav next" onClick={next} type="button" aria-label="Foto siguiente">›</button>
          <div className="room-card-gallery-dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`room-card-gallery-dot${i === index ? ' active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                aria-label={`Ver foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
