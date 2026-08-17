import { describe, expect, it } from "vitest";
import { assertManualQuoteDecision, assertVendorOwned } from "./vendorRules";

describe("vendor rules", () => {
  it("requires a matching written confirmation before a human decision", () => { expect(() => assertManualQuoteDecision({ currentStatus: "pending", decision: "accepted", confirmation: "ACEPTAR" })).not.toThrow(); expect(() => assertManualQuoteDecision({ currentStatus: "pending", decision: "rejected", confirmation: "ACEPTAR" })).toThrow("RECHAZAR"); });
  it("rejects cross-user vendor operations", () => { expect(() => assertVendorOwned(20, 21)).toThrow("no pertenece"); });
});
