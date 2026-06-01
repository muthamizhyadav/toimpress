const PURCHASE_DEDUP_PREFIX = "meta_pixel_purchase_";

export type PurchaseLineItem = {
  id: string | number;
  qty?: number;
  price?: number;
  salePrice?: number;
};

/** Stable id shared with server CAPI `event_id` (sent on order meta as pixelEventId). */
export function buildPixelEventId(orderId: string | number): string {
  return `purchase_${String(orderId)}`;
}

export function buildPurchasePayload(items: PurchaseLineItem[], value: number) {
  return {
    content_ids: items.map((item) => String(item.id)),
    contents: items.map((item) => ({
      id: String(item.id),
      quantity: item.qty ?? 1,
      item_price: item.salePrice ?? item.price ?? 0,
    })),
    value,
    currency: "INR",
  };
}

function purchaseDedupKey(eventId: string): string {
  return `${PURCHASE_DEDUP_PREFIX}${eventId}`;
}

export function wasPurchaseTracked(eventId: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(purchaseDedupKey(eventId)) === "1";
}

export const trackPixel = (
  event: string,
  payload?: Record<string, unknown>,
  eventId?: string,
) => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;

  if (eventId) {
    window.fbq("track", event, payload ?? {}, { eventID: eventId });
  } else {
    window.fbq("track", event, payload ?? {});
  }
};

export type TrackPurchaseInput = {
  eventId: string;
  items: PurchaseLineItem[];
  value: number;
};

/** Browser Purchase with dedup key for Meta Pixel + CAPI matching. Returns false if already sent. */
export function trackPurchase({
  eventId,
  items,
  value,
}: TrackPurchaseInput): boolean {
  if (!eventId || wasPurchaseTracked(eventId)) return false;

  trackPixel("Purchase", buildPurchasePayload(items, value), eventId);

  try {
    sessionStorage.setItem(purchaseDedupKey(eventId), "1");
  } catch {
    /* ignore quota / private mode */
  }

  return true;
}
