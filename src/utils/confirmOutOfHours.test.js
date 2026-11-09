import { describe, it, expect, vi, afterEach } from 'vitest';
import confirmOutOfHours from './confirmOutOfHours';

const apiError = (status, code, message = 'Check-in anticipado: El check-in es desde las 15:00.') =>
  Object.assign(new Error(message), { status, code });

describe('confirmOutOfHours', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends once and does not ask when the backend accepts it', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    const send = vi.fn().mockResolvedValue('ok');

    expect(await confirmOutOfHours(send)).toBe('ok');
    expect(send).toHaveBeenCalledTimes(1);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asks and retries with the confirmation when the check-in is early', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const send = vi.fn().mockRejectedValueOnce(apiError(409, 'EARLY_CHECK_IN')).mockResolvedValueOnce('ok');

    expect(await confirmOutOfHours(send)).toBe('ok');
    expect(confirm.mock.calls[0][0]).toContain('¿Registrar el check-in anticipado?');
    expect(send).toHaveBeenLastCalledWith({ early: true });
  });

  it('retries a late check-out with late: true', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const send = vi.fn().mockRejectedValueOnce(apiError(409, 'LATE_CHECK_OUT')).mockResolvedValueOnce('ok');

    await confirmOutOfHours(send);

    expect(send).toHaveBeenLastCalledWith({ late: true });
  });

  it('returns null and does not retry when the staff says no', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const send = vi.fn().mockRejectedValueOnce(apiError(409, 'EARLY_CHECK_IN'));

    expect(await confirmOutOfHours(send)).toBeNull();
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('rethrows any other error without asking', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    const send = vi.fn().mockRejectedValue(apiError(400, undefined, 'La estadía ya terminó'));

    await expect(confirmOutOfHours(send)).rejects.toThrow('La estadía ya terminó');
    expect(confirm).not.toHaveBeenCalled();
  });
});
