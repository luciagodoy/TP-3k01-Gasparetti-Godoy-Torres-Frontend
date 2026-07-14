import { Link } from 'react-router-dom';
import '../styles/pages.css';

export default function NotFound() {
  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
        <h2>Página no encontrada</h2>
        <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link to="/" className="btn btn-primary">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
