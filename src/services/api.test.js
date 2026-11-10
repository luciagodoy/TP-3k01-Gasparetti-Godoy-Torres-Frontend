import { describe, it, expect, vi, afterEach } from 'vitest';
import api from './api';

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const rejectionOf = (promise) => promise.then(
  () => { throw new Error('se esperaba un error'); },
  (err) => err,
);

describe('api: errores de la API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // confirmOutOfHours reconoce el 409 por `code`; sin él, el staff no puede confirmar un
  // check-out tardío y la habitación queda ocupada.
  it('copia status, code y el mensaje del servidor al error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      jsonResponse(409, { error: 'Check-out tardío', message: 'El check-out era hasta las 10:00.', code: 'LATE_CHECK_OUT' }),
    ));

    const err = await rejectionOf(api.postFile('/reservations/7/check-out', {}));

    expect(err.status).toBe(409);
    expect(err.code).toBe('LATE_CHECK_OUT');
    expect(err.message).toBe('Check-out tardío: El check-out era hasta las 10:00.');
    expect(err.fields).toBeUndefined();
  });

  // Login y Register muestran cada mensaje junto a su campo.
  it('copia los errores por campo de un formulario', async () => {
    const fields = { email: 'Ya existe una cuenta con ese email.' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(409, { error: 'La cuenta ya existe', fields })));

    const err = await rejectionOf(api.post('/guests/register', {}));

    expect(err.status).toBe(409);
    expect(err.fields).toEqual(fields);
    expect(err.code).toBeUndefined();
  });

  it('usa el código HTTP como mensaje si la respuesta no trae JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 })));

    const err = await rejectionOf(api.get('/rooms'));

    expect(err.status).toBe(502);
    expect(err.message).toBe('HTTP Error: 502');
  });
});
