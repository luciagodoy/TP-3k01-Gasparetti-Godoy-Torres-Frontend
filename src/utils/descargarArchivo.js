// Ofrece un Blob (por ejemplo, el comprobante en PDF del check-out) como
// descarga, sin abrir otra pestaña.
export default function descargarArchivo(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  // Se libera después: revocarla en el mismo tick puede cortar la descarga en
  // algunos navegadores antes de que arranque.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
