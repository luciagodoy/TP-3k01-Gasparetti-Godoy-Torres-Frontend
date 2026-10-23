// Ofrece un Blob (p. ej. el comprobante PDF del check-out) como descarga sin
// abrir otra pestaña.
export default function downloadFile(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Se revoca después: revocarlo en el mismo tick puede cancelar la descarga en
  // algunos navegadores antes de que empiece.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
