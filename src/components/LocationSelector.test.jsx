import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LocationSelector from './LocationSelector';
import { cityService, provinceService } from '../services/resources';

vi.mock('../services/resources', () => ({
  provinceService: { list: vi.fn() },
  cityService: { list: vi.fn(), get: vi.fn() },
}));

const PROVINCES = [
  { id: 1, name: 'Buenos Aires' },
  { id: 2, name: 'Mendoza' },
];
const CITIES = {
  1: [{ id: 10, name: 'San Martín', provinceId: 1 }],
  2: [{ id: 20, name: 'San Martín', provinceId: 2 }],
};

describe('LocationSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    provinceService.list.mockResolvedValue(PROVINCES);
  });

  it('elige la ciudad sin distinguir mayúsculas ni espacios', async () => {
    cityService.list.mockImplementation(({ provinceId }) => Promise.resolve(CITIES[provinceId]));
    const onChange = vi.fn();
    render(<LocationSelector cityId="" onChange={onChange} />);

    await screen.findByRole('option', { name: 'Buenos Aires' });
    fireEvent.change(screen.getByLabelText('Provincia'), { target: { value: '1' } });
    await waitFor(() => expect(cityService.list).toHaveBeenCalledWith({ provinceId: '1' }));
    await waitFor(() => expect(screen.getByLabelText('Ciudad')).not.toBeDisabled());

    fireEvent.change(screen.getByLabelText('Ciudad'), { target: { value: ' san martín ' } });
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('no elige una ciudad homónima de la provincia anterior mientras carga la nueva', async () => {
    let resolveMendoza;
    cityService.list.mockImplementation(({ provinceId }) =>
      provinceId === '2'
        ? new Promise((resolve) => {
            resolveMendoza = resolve;
          })
        : Promise.resolve(CITIES[provinceId])
    );
    const onChange = vi.fn();
    render(<LocationSelector cityId="" onChange={onChange} />);

    await screen.findByRole('option', { name: 'Buenos Aires' });
    fireEvent.change(screen.getByLabelText('Provincia'), { target: { value: '1' } });
    // Espera a que la lista de Buenos Aires esté cargada (las opciones del datalist).
    await waitFor(() => expect(document.querySelector('datalist option[value="San Martín"]')).not.toBeNull());

    // Cambia a Mendoza y escribe antes de que llegue la lista: la de Buenos Aires sigue en memoria.
    fireEvent.change(screen.getByLabelText('Provincia'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Ciudad'), { target: { value: 'San Martín' } });
    expect(onChange).not.toHaveBeenCalledWith(10);
    expect(onChange).toHaveBeenLastCalledWith('');

    // Cuando llega la lista de Mendoza, se elige la ciudad correcta.
    resolveMendoza(CITIES[2]);
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(20));
  });
});
