// Fecha del hotel, igual que `today()` del backend (src/shared/dates.ts): las reglas de
// check-in y de vencimiento se cuentan en la hora de Argentina, no en la del navegador.
export const HOTEL_TIME_ZONE = 'America/Argentina/Buenos_Aires';

// 'en-CA' formatea como YYYY-MM-DD, que se compara bien como string.
const hotelDate = new Intl.DateTimeFormat('en-CA', { timeZone: HOTEL_TIME_ZONE });

/** @param {Date} [now] @returns {import('../models/types').IsoDate} */
export const hotelToday = (now = new Date()) => hotelDate.format(now);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Suma días a una fecha 'YYYY-MM-DD' (en UTC, para que la zona horaria no corra un día). */
export const addDays = (date, days) =>
  new Date(new Date(`${date}T00:00:00Z`).getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);

// 'YYYY-MM-DD' -> 'DD/MM/YYYY', como los mensajes del backend.
export const displayDate = (date) => (date ? date.split('-').reverse().join('/') : '');
