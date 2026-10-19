export function statusLabel(status?: string) {
  const value = (status || "pending").toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function statusColor(status?: string): "success" | "info" | "error" | "warning" {
  switch ((status || "").toLowerCase()) {
    case "paid":
    case "completed":
      return "success";
    case "shipped":
      return "info";
    case "cancelled":
      return "error";
    default:
      return "warning";
  }
}

export function paymentLabel(order: { cardBrand?: string | null; cardLast4?: string | null }) {
  if (!order.cardLast4) return "";
  const brand = order.cardBrand
    ? order.cardBrand.charAt(0).toUpperCase() + order.cardBrand.slice(1)
    : "Card";
  return `${brand} •••• ${order.cardLast4}`;
}
