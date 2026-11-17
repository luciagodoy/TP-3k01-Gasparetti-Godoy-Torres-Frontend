import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Reservations from './Reservations';
import { Reservation } from '../models';
import { guestService, reservationService, roomService } from '../services/resources';

vi.mock('../services/resources', () => ({
  reservationService: { list: vi.fn(), get: vi.fn(), update: vi.fn(), create: vi.fn(), remove: vi.fn() },
  guestService: { list: vi.fn() },
  roomService: { list: vi.fn() },
}));

const reservation = (changes) =>
  Reservation.fromJSON({
    startDate: '2026-11-15',
    endDate: '2026-11-20',
    totalAmount: '100000.00',
    guestId: 3,
    guest: { id: 3, user: { username: 'ana' } },
    ...changes,
  });

const RESERVATIONS = [
  reservation({ id: 1, status: 'check-in', roomId: 12, room: { id: 12, number: 204 } }),
  reservation({ id: 2, status: 'pendiente', roomId: 13, room: { id: 13, number: 305 } }),
];

const editRow = async (roomNumber) => {
  const row = (await screen.findByRole('cell', { name: String(roomNumber) })).closest('tr');
  fireEvent.click(within(row).getByRole('button', { name: 'Editar' }));
};

describe('Reservations: editar una reserva', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reservationService.list.mockResolvedValue(RESERVATIONS);
    guestService.list.mockResolvedValue([]);
    roomService.list.mockResolvedValue([
      { id: 12, number: 204 },
      { id: 13, number: 305 },
    ]);
  });

  // El backend rechaza cambiar la habitación (ROOM_CHANGE_DURING_STAY) o el inicio
  // (START_DATE_DURING_STAY) de una estadía en curso: el formulario no los ofrece.
  it('en una estadía en curso sólo deja cambiar la fecha de salida', async () => {
    render(<Reservations />);
    await editRow(204);

    expect(screen.getByText(/La estadía está en curso: sólo se puede cambiar la fecha de salida/)).toBeInTheDocument();
    expect(screen.getByLabelText('Habitación')).toBeDisabled();
    expect(screen.getByLabelText('Fecha de Inicio')).toBeDisabled();
    expect(screen.getByLabelText('Fecha de Fin')).not.toBeDisabled();
  });

  it('en una reserva pendiente deja cambiar habitación y fechas', async () => {
    render(<Reservations />);
    await editRow(305);

    expect(screen.queryByText(/La estadía está en curso/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Habitación')).not.toBeDisabled();
    expect(screen.getByLabelText('Fecha de Inicio')).not.toBeDisabled();
  });

  it('al pasar de una estadía en curso a una pendiente se vuelven a habilitar los campos', async () => {
    render(<Reservations />);
    await editRow(204);
    await editRow(305);

    expect(screen.getByLabelText('Habitación')).not.toBeDisabled();
    expect(screen.getByLabelText('Fecha de Inicio')).not.toBeDisabled();
  });

  it('una reserva nueva no hereda el bloqueo de la estadía en curso que se estaba editando', async () => {
    render(<Reservations />);
    await editRow(204);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Nueva Reserva' }));

    expect(screen.getByLabelText('Habitación')).not.toBeDisabled();
    expect(screen.getByLabelText('Fecha de Inicio')).not.toBeDisabled();
  });

  it('guarda la nueva salida de una estadía en curso con la misma habitación e inicio', async () => {
    reservationService.update.mockResolvedValue(RESERVATIONS[0]);
    render(<Reservations />);
    await editRow(204);

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(reservationService.update).toHaveBeenCalledWith(1, expect.objectContaining({ roomId: 12, startDate: '2026-11-15' }));
  });
});
