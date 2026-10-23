export function getUpiConfig() {
  return {
    upiId: import.meta.env.VITE_UPI_ID?.trim() || '',
    qrImageUrl: import.meta.env.VITE_UPI_QR_IMAGE_URL?.trim() || '',
  }
}
