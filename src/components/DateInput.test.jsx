import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DateInput from './DateInput';

const props = { id: 'fecha', name: 'fecha', value: '2026-11-20', onChange: vi.fn() };

describe('DateInput deshabilitado', () => {
  it('no abre el calendario', () => {
    render(<DateInput {...props} disabled />);

    fireEvent.click(screen.getByRole('button', { name: '20/11/2026' }));

    expect(screen.queryByRole('button', { name: 'Mes anterior' })).not.toBeInTheDocument();
  });

  // Antes el calendario quedaba abierto "oculto" y reaparecía solo al volver a habilitarse.
  it('al deshabilitarse con el calendario abierto, lo cierra', () => {
    const { rerender } = render(<DateInput {...props} />);
    fireEvent.click(screen.getByRole('button', { name: '20/11/2026' }));
    expect(screen.getByRole('button', { name: 'Mes anterior' })).toBeInTheDocument();

    rerender(<DateInput {...props} disabled />);
    rerender(<DateInput {...props} />);

    expect(screen.queryByRole('button', { name: 'Mes anterior' })).not.toBeInTheDocument();
  });

  it('vincula la descripción con aria-describedby', () => {
    render(
      <>
        <p id="motivo">No se puede cambiar.</p>
        <DateInput {...props} disabled describedBy="motivo" />
      </>
    );

    expect(screen.getByRole('button', { name: '20/11/2026' })).toHaveAccessibleDescription('No se puede cambiar.');
  });
});
