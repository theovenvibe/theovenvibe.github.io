export interface DeliveryAvailability {
  available: boolean;
  reason?: string | null;
  message?: string | null;
  until?: string | null;
}

const reasons: Record<string, string> = {
  vehicle: 'Vehicle breakdown', staff: 'No delivery staff', health: 'Delivery person unwell',
  capacity: 'Delivery capacity full', weather: 'Unsafe weather or roads',
  temporary: 'Delivery temporarily unavailable', other: 'Delivery temporarily unavailable',
};

export function deliveryPaused(value?: DeliveryAvailability | null, now = Date.now()): boolean {
  if (!value || value.available !== false) return false;
  if (value.until && Number.isFinite(Date.parse(value.until)) && Date.parse(value.until) <= now) return false;
  return true;
}

export function deliveryPauseMessage(value: DeliveryAvailability): string {
  const reason = value.message?.trim() || (value.reason ? reasons[value.reason] : '') || 'Delivery temporarily unavailable';
  const end = value.until && Number.isFinite(Date.parse(value.until))
    ? ' Delivery resumes ' + new Date(value.until).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
    }) + '.'
    : ' Delivery will return when the kitchen confirms it is available.';
  return reason.replace(/[.!?]+$/, '') + '. Pickup orders are welcome.' + end;
}
