import { describe, it, expect } from 'vitest';
import { Reserva, User } from '.';

// Forma real de GET /reservas/mias: los DECIMAL de MySQL llegan como string.
const jsonReserva = (cambios = {}) => ({
  id: 7,
  fechaInicio: '2026-11-01',
  fechaFin: '2026-11-04',
  estado: 'pendiente',
  montoTotal: '150000.00',
  huespedId: 3,
  habitacionId: 12,
  habitacion: { id: 12, numero: 204, piso: 2, categoriaId: 1, categoria: { id: 1, denominacion: 'Suite', precioNoche: '50000.00' } },
  serviciosConsumidos: [
    { id: 1, cantidad: 2, precioUnitario: '3000.00', montoTotal: '6000.00', cupo: { id: 4, servicio: { id: 2, nombre: 'Spa' } } },
    { id: 2, cantidad: 1, precioUnitario: '1500.50', montoTotal: '1500.50' },
  ],
  ...cambios,
});

describe('Reserva', () => {
  it('convierte los montos que llegan como string a número', () => {
    const reserva = Reserva.fromJSON(jsonReserva());
    expect(reserva.montoTotal).toBe(150000);
    expect(reserva.habitacion.categoria.precioNoche).toBe(50000);
    expect(reserva.serviciosConsumidos[1].montoTotal).toBe(1500.5);
  });

  it('arma las relaciones como instancias de sus modelos', () => {
    const reserva = Reserva.fromJSON(jsonReserva());
    expect(reserva).toBeInstanceOf(Reserva);
    expect(reserva.serviciosConsumidos[0].nombreServicio).toBe('Spa');
    expect(reserva.huesped).toBeNull();
  });

  it('calcula el total como alojamiento + servicios consumidos', () => {
    const reserva = Reserva.fromJSON(jsonReserva());
    expect(reserva.totalServicios).toBeCloseTo(7500.5);
    expect(reserva.total).toBeCloseTo(157500.5);
  });

  it('cuenta las noches sin correrse un día por la zona horaria', () => {
    expect(Reserva.fromJSON(jsonReserva()).noches).toBe(3);
    expect(Reserva.calcularNoches('2026-03-31', '2026-04-01')).toBe(1);
    expect(Reserva.calcularNoches(undefined, '2026-04-01')).toBe(0);
  });

  it('sólo permite cancelar o hacer check-in de una reserva pendiente', () => {
    const pendiente = Reserva.fromJSON(jsonReserva());
    const conCheckIn = Reserva.fromJSON(jsonReserva({ estado: 'check-in' }));
    expect(pendiente.puedeCancelarse).toBe(true);
    expect(pendiente.puedeHacerCheckIn).toBe(true);
    expect(pendiente.puedeHacerCheckOut).toBe(false);
    expect(conCheckIn.puedeCancelarse).toBe(false);
    expect(conCheckIn.puedeHacerCheckOut).toBe(true);
  });

  it('listaDesdeJSON tolera una respuesta vacía', () => {
    expect(Reserva.listaDesdeJSON(null)).toEqual([]);
  });
});

describe('User', () => {
  it('distingue staff (empleado o admin) de huésped, igual que auth.staff del backend', () => {
    expect(User.fromJSON({ id: 1, role: 'empleado' }).esStaff).toBe(true);
    expect(User.fromJSON({ id: 2, role: 'admin' }).esStaff).toBe(true);
    expect(User.fromJSON({ id: 3, role: 'huesped' }).esStaff).toBe(false);
    expect(User.fromJSON({ id: 2, role: 'admin' }).esAdmin).toBe(true);
    expect(User.fromJSON({ id: 1, role: 'empleado' }).esAdmin).toBe(false);
  });
});
