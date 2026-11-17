import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  Reservation.fromJSON({ guestId: 3, guest: { id: 3, user: { username: 'ana' } }, ...changes });

// Hoy (en los tests) es el 18/11/2026.
const RESERVATIONS = [
  // Estadía en curso: 5 noches por $100.000 (tarifa pactada de $20.000 por noche).
  reservation({ id: 1, status: 'check-in', roomId: 12, room: { id: 12, number: 204 }, startDate: '2026-11-15', endDate: '2026-11-20', totalAmount: '100000.00' }),
  // Pendiente: 2 noches por $60.000.
  reservation({ id: 2, status: 'pendiente', roomId: 13, room: { id: 13, number: 305 }, startDate: '2026-11-25', endDate: '2026-11-27', totalAmount: '60000.00' }),
];

const editRow = async (roomNumber) => {
  const row = (await screen.findByRole('cell', { name: String(roomNumber) })).closest('tr');
  fireEvent.click(within(row).getByRole('button', { name: 'Editar' }));
};

// Abre el calendario de la fecha de fin (muestra el mes de la fecha actual) y devuelve el botón del día.
const endDay = (day) => {
  fireEvent.click(screen.getByLabelText('Fecha de Fin'));
  return screen.getByRole('button', { name: String(day) });
};

const amountField = () => screen.getByLabelText('Monto Total (opcional)');

describe('Reservations: editar una reserva', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-18T12:00:00-03:00'));
    reservationService.list.mockResolvedValue(RESERVATIONS);
    guestService.list.mockResolvedValue([]);
    roomService.list.mockResolvedValue([
      { id: 12, number: 204 },
      { id: 13, number: 305 },
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // El backend rechaza cambiar la habitación (ROOM_CHANGE_DURING_STAY) o el inicio
  // (START_DATE_DURING_STAY) de una estadía en curso: el formulario no los ofrece.
  it('en una estadía en curso sólo deja cambiar la fecha de salida, y explica por qué', async () => {
    render(<Reservations />);
    await editRow(204);

    expect(screen.getByLabelText('Habitación')).toBeDisabled();
    expect(screen.getByLabelText('Fecha de Inicio')).toBeDisabled();
    expect(screen.getByLabelText('Fecha de Fin')).not.toBeDisabled();
    // El motivo está vinculado a los campos bloqueados (lo lee el lector de pantalla).
    expect(screen.getByLabelText('Habitación')).toHaveAccessibleDescription(/sólo se puede cambiar la fecha de salida/);
    expect(screen.getByLabelText('Fecha de Inicio')).toHaveAccessibleDescription(/sólo se puede cambiar la fecha de salida/);
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

  it('en una estadía en curso no deja poner la salida en un día que ya pasó', async () => {
    render(<Reservations />);
    await editRow(204);

    expect(endDay(17)).toBeDisabled();
    expect(screen.getByRole('button', { name: '18' })).not.toBeDisabled();
  });

  // El backend no recotiza el alojamiento al cambiar fechas: sin esto, extender la estadía
  // reenviaba el monto viejo y las noches nuevas no se cobraban.
  it('al extender la estadía recalcula el monto con la tarifa pactada y lo guarda', async () => {
    reservationService.update.mockResolvedValue(RESERVATIONS[0]);
    render(<Reservations />);
    await editRow(204);

    fireEvent.click(endDay(22));
    expect(amountField()).toHaveValue(140000);

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(reservationService.update).toHaveBeenCalledWith(1, {
      roomId: 12,
      startDate: '2026-11-15',
      endDate: '2026-11-22',
      totalAmount: 140000,
    });
  });

  it('respeta el monto que el staff escribió a mano', async () => {
    render(<Reservations />);
    await editRow(204);

    fireEvent.change(amountField(), { target: { value: '150000' } });
    fireEvent.click(endDay(22));

    expect(amountField()).toHaveValue(150000);
  });

  it('muestra el rechazo del backend en la notificación', async () => {
    reservationService.update.mockRejectedValue(
      new Error('La estadía está en curso: No se puede cambiar la habitación de una reserva con check-in.')
    );
    render(<Reservations />);
    await editRow(204);

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No se puede cambiar la habitación de una reserva con check-in.');
  });
});
