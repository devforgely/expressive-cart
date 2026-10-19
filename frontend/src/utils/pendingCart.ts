const PENDING_CART_KEY = 'pendingCartItem';

export type PendingCartItem = {
  productId: string;
  quantity: number;
};

type ClaimResult =
  | { type: 'item'; item: PendingCartItem }
  | { type: 'none' }
  | { type: 'busy' };

let addingPending = false;

export function savePendingCartItem(item: PendingCartItem) {
  sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify({
    productId: String(item.productId),
    quantity: item.quantity
  }));
}

export function hasPendingCartItem() {
  return Boolean(sessionStorage.getItem(PENDING_CART_KEY));
}

export function claimPendingCartItem(): ClaimResult {
  if (addingPending) {
    return { type: 'busy' };
  }

  const raw = sessionStorage.getItem(PENDING_CART_KEY);
  if (!raw) {
    return { type: 'none' };
  }

  sessionStorage.removeItem(PENDING_CART_KEY);
  addingPending = true;

  try {
    const parsed = JSON.parse(raw) as PendingCartItem;
    const quantity = Number(parsed?.quantity);
    if (!parsed?.productId || !Number.isInteger(quantity) || quantity < 1) {
      addingPending = false;
      return { type: 'none' };
    }

    return {
      type: 'item',
      item: {
        productId: String(parsed.productId),
        quantity
      }
    };
  } catch {
    addingPending = false;
    return { type: 'none' };
  }
}

export function finishPendingCartItem(restore?: PendingCartItem) {
  addingPending = false;
  if (restore) {
    savePendingCartItem(restore);
  }
}
