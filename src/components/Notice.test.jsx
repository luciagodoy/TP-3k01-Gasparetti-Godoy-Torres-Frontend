import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Notice from './Notice';

describe('Notice', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el error fuera del contenido de la página, en la pila flotante', () => {
    const { container } = render(<Notice type="error">No se pudo guardar.</Notice>);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('No se pudo guardar.');
    expect(container).not.toContainElement(alert);
    expect(alert.closest('#notice-stack')).toHaveClass('notice-stack');
  });

  it('no muestra nada sin mensaje', () => {
    render(<Notice type="error">{null}</Notice>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('se cierra con el botón', () => {
    const onClose = vi.fn();
    render(<Notice type="error" onClose={onClose}>Falló</Notice>);

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('el aviso de éxito se va solo, aunque la página se vuelva a renderizar', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const { rerender } = render(<Notice type="success" onClose={() => onClose()}>Guardado</Notice>);

    act(() => vi.advanceTimersByTime(3000));
    // Un render con una función onClose nueva no reinicia el temporizador.
    rerender(<Notice type="success" onClose={() => onClose()}>Guardado</Notice>);
    act(() => vi.advanceTimersByTime(3000));

    expect(screen.getByRole('status')).toHaveTextContent('Guardado');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('el error no se va solo', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Notice type="error" onClose={onClose}>Falló</Notice>);

    act(() => vi.advanceTimersByTime(60000));

    expect(onClose).not.toHaveBeenCalled();
  });
});
