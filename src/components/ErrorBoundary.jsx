import { Component } from 'react';
import { Link } from 'react-router-dom';

// Sin un error boundary, cualquier excepción al renderizar una página deja toda
// la app en blanco (React desmonta el árbol entero). Tiene que ser un componente
// de clase: getDerivedStateFromError / componentDidCatch no tienen versión con hooks.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Algo salió mal</h2>
        </div>

        <div role="alert" className="alert alert-error">
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
