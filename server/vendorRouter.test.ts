import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const vendorDb = vi.hoisted(() => ({ listVendorDashboard: vi.fn(), createVendor: vi.fn(), createServiceRequest: vi.fn(), createVendorQuote: vi.fn(), decideQuoteManually: vi.fn() }));
vi.mock("./vendorDb", () => vendorDb);
import { appRouter } from "./routers";

function context(ownerId = 91): TrpcContext { return { user: { id: ownerId, openId: `vendor-${ownerId}`, name: "Operador", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] }; }
describe("vendor router", () => {
  beforeEach(() => Object.values(vendorDb).forEach(mock => mock.mockReset()));
  it("passes the authenticated owner into vendor and request creation", async () => { vendorDb.createVendor.mockResolvedValue({ id: 1 }); vendorDb.createServiceRequest.mockResolvedValue({ id: 2 }); const caller = appRouter.createCaller(context(91)); await caller.vendor.createVendor({ name: "Proveedor real", category: "Plomería" }); await caller.vendor.createRequest({ vendorId: 1, title: "Fuga", location: "Mérida", description: "Revisión" }); expect(vendorDb.createVendor).toHaveBeenCalledWith(91, { name: "Proveedor real", category: "Plomería" }); expect(vendorDb.createServiceRequest).toHaveBeenCalledWith(91, { vendorId: 1, title: "Fuga", location: "Mérida", description: "Revisión" }); });
  it("keeps written confirmation and decision with the authenticated owner", async () => { vendorDb.decideQuoteManually.mockResolvedValue({ id: 3, status: "accepted" }); const caller = appRouter.createCaller(context(92)); await caller.vendor.decideQuoteManually({ quoteId: 3, decision: "accepted", confirmation: "ACEPTAR" }); expect(vendorDb.decideQuoteManually).toHaveBeenCalledWith(92, 3, "accepted", "ACEPTAR"); });
});
