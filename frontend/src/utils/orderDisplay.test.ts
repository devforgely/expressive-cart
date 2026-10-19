import { paymentLabel, statusColor, statusLabel } from "./orderDisplay";

describe("order display", () => {
  it("labels a paid card payment", () => {
    expect(statusLabel("paid")).toBe("Paid");
    expect(statusColor("paid")).toBe("success");
    expect(paymentLabel({ cardBrand: "visa", cardLast4: "4242" })).toBe("Visa •••• 4242");
  });

  it("leaves the card line empty when the last four digits were not stored", () => {
    expect(paymentLabel({ cardBrand: "visa", cardLast4: null })).toBe("");
  });
});
