import { describe, it, expect } from 'vitest';
import { Reservation, User } from '.';

// Forma real de GET /reservations/mine: los DECIMAL de MySQL llegan como strings.
const reservationJson = (changes = {}) => ({
  id: 7,
  startDate: '2026-11-01',
  endDate: '2026-11-04',
  status: 'pendiente',
  totalAmount: '150000.00',
  guestId: 3,
  roomId: 12,
  room: { id: 12, number: 204, floor: 2, categoryId: 1, category: { id: 1, name: 'Suite', pricePerNight: '50000.00' } },
  consumedAmenities: [
    { id: 1, quantity: 2, unitPrice: '3000.00', totalAmount: '6000.00', quota: { id: 4, amenity: { id: 2, name: 'Spa' } } },
    { id: 2, quantity: 1, unitPrice: '1500.50', totalAmount: '1500.50' },
  ],
  ...changes,
});

describe('Reservation', () => {
  it('converts amounts that arrive as strings into numbers', () => {
    const reservation = Reservation.fromJSON(reservationJson());
    expect(reservation.totalAmount).toBe(150000);
    expect(reservation.room.category.pricePerNight).toBe(50000);
    expect(reservation.consumedAmenities[1].totalAmount).toBe(1500.5);
  });

  it('builds the relations as instances of their models', () => {
    const reservation = Reservation.fromJSON(reservationJson());
    expect(reservation).toBeInstanceOf(Reservation);
    expect(reservation.consumedAmenities[0].amenityName).toBe('Spa');
    expect(reservation.guest).toBeNull();
  });

  it('computes the total as lodging + consumed amenities', () => {
    const reservation = Reservation.fromJSON(reservationJson());
    expect(reservation.amenitiesTotal).toBeCloseTo(7500.5);
    expect(reservation.total).toBeCloseTo(157500.5);
  });

  it('counts nights without shifting a day because of the time zone', () => {
    expect(Reservation.fromJSON(reservationJson()).nights).toBe(3);
    expect(Reservation.calculateNights('2026-03-31', '2026-04-01')).toBe(1);
    expect(Reservation.calculateNights(undefined, '2026-04-01')).toBe(0);
  });

  it('only a pending reservation can be cancelled or checked in', () => {
    const pending = Reservation.fromJSON(reservationJson());
    const checkedIn = Reservation.fromJSON(reservationJson({ status: 'check-in' }));
    expect(pending.canBeCancelled).toBe(true);
    expect(pending.canCheckIn).toBe(true);
    expect(pending.canCheckOut).toBe(false);
    expect(checkedIn.canBeCancelled).toBe(false);
    expect(checkedIn.canCheckOut).toBe(true);
  });

  it('listFromJSON tolerates an empty response', () => {
    expect(Reservation.listFromJSON(null)).toEqual([]);
  });
});

describe('User', () => {
  it('tells staff (employee or admin) apart from guests, like the backend auth.staff', () => {
    expect(User.fromJSON({ id: 1, role: 'empleado' }).isStaff).toBe(true);
    expect(User.fromJSON({ id: 2, role: 'admin' }).isStaff).toBe(true);
    expect(User.fromJSON({ id: 3, role: 'huesped' }).isStaff).toBe(false);
    expect(User.fromJSON({ id: 2, role: 'admin' }).isAdmin).toBe(true);
    expect(User.fromJSON({ id: 1, role: 'empleado' }).isAdmin).toBe(false);
  });
});
