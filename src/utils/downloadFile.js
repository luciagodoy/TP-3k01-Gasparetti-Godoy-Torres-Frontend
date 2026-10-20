// Offers a Blob (e.g. the check-out PDF receipt) as a download without opening
// another tab.
export default function downloadFile(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoked later: revoking in the same tick can cancel the download in some
  // browsers before it starts.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
