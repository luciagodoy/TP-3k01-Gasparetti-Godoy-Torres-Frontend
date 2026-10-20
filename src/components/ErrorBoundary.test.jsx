import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

function ExplodingComponent() {
  throw new Error('test failure');
}

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs the caught error to the console; silence it so the test
    // output does not look like a real failure.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the children when there is no error', () => {
    renderWithRouter(
      <ErrorBoundary>
        <p>contenido normal</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('contenido normal')).toBeInTheDocument();
  });

  it('shows the fallback instead of crashing the app when a child throws', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ExplodingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
