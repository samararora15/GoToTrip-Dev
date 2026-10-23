import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { getUpiConfig } from '@/utils/checkoutConfig'

export function UPIPaymentBlock({ screenshotFile, onScreenshotChange, error }) {
  const { upiId, qrImageUrl } = getUpiConfig()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg text-foreground">Pay via UPI</h3>
        <p className="mt-2 text-sm text-muted">
          Pay the exact total shown in your review step, then upload a clear screenshot of the
          successful payment.
        </p>
      </div>

      {upiId ? (
        <div className="rounded-md border border-border bg-surface p-4">
          <p className="text-xs text-muted">UPI ID</p>
          <p className="mt-1 font-medium text-foreground select-all">{upiId}</p>
        </div>
      ) : (
        <p className="text-sm text-red-700">
          UPI ID is not configured. Add <code className="text-foreground">VITE_UPI_ID</code> to
          your <code className="text-foreground">.env</code> file.
        </p>
      )}

      {qrImageUrl ? (
        <div>
          <p className="text-sm font-medium text-foreground">Scan QR code</p>
          <img
            src={qrImageUrl}
            alt="UPI QR code for payment"
            className="mt-3 max-w-[220px] rounded-md border border-border bg-white p-2"
          />
        </div>
      ) : null}

      <div>
        <Label htmlFor="payment-screenshot" required>
          Payment screenshot
        </Label>
        <Input
          id="payment-screenshot"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          aria-required="true"
          className="mt-2 cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1 file:text-sm file:text-foreground"
          onChange={(e) => onScreenshotChange(e.target.files?.[0] ?? null)}
        />
        {screenshotFile ? (
          <p className="mt-2 text-xs text-muted">Selected: {screenshotFile.name}</p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      </div>
    </div>
  )
}
