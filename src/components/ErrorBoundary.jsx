import { Component } from 'react';
import { Link } from 'react-router-dom';

// Sin un error boundary, cualquier excepción al renderizar una página deja la
// app entera en blanco (React desmonta todo el árbol). Tiene que ser un class
// component: getDerivedStateFromError / componentDidCatch no existen en hooks.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado al renderizar:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Algo salió mal</h2>
        </div>

        <div className="alert alert-error">
          No pudimos mostrar esta sección. Podés reintentar o volver al inicio.
        </div>

        <div className="error-boundary-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => this.setState({ error: null })}
          >
            Reintentar
          </button>
          <Link to="/" className="btn btn-secondary">Volver al inicio</Link>
        </div>
      </div>
    );
  }
}
