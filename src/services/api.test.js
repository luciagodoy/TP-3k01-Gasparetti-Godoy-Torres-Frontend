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

  it('usa el código HTTP como mensaje si el JSON no trae error ni message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(500, {})));

    const err = await rejectionOf(api.get('/rooms'));

    expect(err.message).toBe('HTTP Error: 500');
  });
});

describe('api: sesión, red y respuestas sin cuerpo', () => {
  // `api` es una única instancia compartida: el token y el callback de un test no deben
  // llegar al siguiente.
  afterEach(() => {
    api.clearAuthToken();
    api.onUnauthorized(undefined);
    vi.unstubAllGlobals();
  });

  // AuthContext registra este callback para cerrar la sesión cuando el token vence.
  it('avisa la sesión vencida con un 401', async () => {
    const onUnauthorized = vi.fn();
    api.onUnauthorized(onUnauthorized);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { error: 'Token inválido' })));

    const err = await rejectionOf(api.get('/reservations/mine'));

    expect(err.status).toBe(401);
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  // Un 403 es una sesión válida sin permiso para esa acción: no debe cerrar la sesión.
  it('no cierra la sesión con un 403', async () => {
    const onUnauthorized = vi.fn();
    api.onUnauthorized(onUnauthorized);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(403, { error: 'Acceso denegado' })));

    const err = await rejectionOf(api.get('/users'));

    expect(err.status).toBe(403);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('manda el token en cada pedido y deja de mandarlo al cerrar la sesión', async () => {
    // api.js reutiliza el mismo objeto de headers: se copian en el momento de cada pedido.
    const sentHeaders = [];
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, options) => {
      sentHeaders.push({ ...options.headers });
      return Promise.resolve(jsonResponse(200, []));
    }));

    api.setAuthToken('token-de-prueba');
    await api.get('/reservations/mine');
    api.clearAuthToken();
    await api.get('/rooms');

    expect(sentHeaders[0].Authorization).toBe('Bearer token-de-prueba');
    expect(sentHeaders[1].Authorization).toBeUndefined();
  });

  it('envía el método y el cuerpo en JSON, y devuelve el JSON de la respuesta', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { id: 9 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.post('/reservations', { roomId: 12 });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/reservations$/);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ roomId: 12 });
    expect(result).toEqual({ id: 9 });
  });

  // Un borrado responde 204 sin cuerpo: leerlo como JSON fallaría aunque se haya borrado.
  it('devuelve null en un 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(api.delete('/reservations/7')).resolves.toBeNull();
  });

  // Si fetch ni siquiera llega al servidor (backend caído, sin internet, CORS).
  it('marca el error de red y conserva la causa', async () => {
    const cause = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause));

    const err = await rejectionOf(api.get('/rooms'));

    expect(err.isNetworkError).toBe(true);
    expect(err.message).toMatch(/No pudimos conectarnos con el servidor/);
    expect(err.cause).toBe(cause);
    expect(err.status).toBeUndefined();
  });

  it('devuelve el comprobante como Blob', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('%PDF-1.4', { status: 200, headers: { 'Content-Type': 'application/pdf' } }),
    ));

    const receipt = await api.getFile('/reservations/7/receipt');

    expect(receipt).toBeInstanceOf(Blob);
    expect(await receipt.text()).toBe('%PDF-1.4');
  });
});
