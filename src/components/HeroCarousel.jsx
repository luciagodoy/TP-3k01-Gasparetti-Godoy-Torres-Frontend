import { useEffect, useState } from 'react';

// Crossfade automático entre fotos, apiladas absolutamente detrás del
// contenido del hero (ver .hero-carousel en dashboard.css).
export default function HeroCarousel({ images, intervalMs = 6000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <div className="hero-carousel" aria-hidden="true">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`hero-carousel-slide${i === index ? ' active' : ''}`}
        />
      ))}
      <div className="hero-carousel-overlay" />
    </div>
  );
}
