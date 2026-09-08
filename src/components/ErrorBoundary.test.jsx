import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

function ComponenteQueExplota() {
  throw new Error('fallo de prueba');
}

const renderConRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React loguea el error capturado por consola; lo silenciamos para que la
    // salida de los tests no parezca un fallo real.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza los hijos cuando no hay error', () => {
    renderConRouter(
      <ErrorBoundary>
        <p>contenido normal</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('contenido normal')).toBeInTheDocument();
  });

  it('muestra el fallback en vez de tumbar la app cuando un hijo lanza', () => {
    renderConRouter(
      <ErrorBoundary>
        <ComponenteQueExplota />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
