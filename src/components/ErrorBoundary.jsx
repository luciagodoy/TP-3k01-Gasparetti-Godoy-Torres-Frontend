import { Component } from 'react';
import { Link } from 'react-router-dom';

// Without an error boundary, any exception while rendering a page leaves the
// whole app blank (React unmounts the entire tree). It has to be a class
// component: getDerivedStateFromError / componentDidCatch have no hook version.
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
