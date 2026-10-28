// Fuera de horario (check-in antes de las 15:00 o check-out después de las 10:00) el
// backend responde 409 con un código. Se le pregunta al staff y, si confirma, se repite
// el pedido con la confirmación.
const CONFIRMABLE = {
  EARLY_CHECK_IN: { flag: 'early', question: '¿Registrar el check-in anticipado?' },
  LATE_CHECK_OUT: { flag: 'late', question: '¿Registrar el check-out tardío?' },
};

/**
 * @template T
 * @param {(flags: { early?: boolean, late?: boolean }) => Promise<T>} send
 * @returns {Promise<T | null>} null si el staff no lo confirma.
 */
export default async function confirmOutOfHours(send) {
  try {
    return await send({});
  } catch (err) {
    const confirmable = err.status === 409 ? CONFIRMABLE[err.code] : undefined;
    if (!confirmable) throw err;
    if (!window.confirm(`${err.message}\n\n${confirmable.question}`)) return null;
    return send({ [confirmable.flag]: true });
  }
}
