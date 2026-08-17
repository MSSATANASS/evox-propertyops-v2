import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const turnoverDb = vi.hoisted(() => ({
  listTurnoverDashboard: vi.fn(), createTurnoverUnit: vi.fn(), createTurnover: vi.fn(), addTurnoverChecklistItem: vi.fn(), updateTurnoverChecklistItem: vi.fn(), addTurnoverEvidence: vi.fn(), addTurnoverIncident: vi.fn(), resolveTurnoverIncident: vi.fn(), releaseTurnoverManually: vi.fn(), saveTurnoverDiscoveryCandidate: vi.fn(), reviewTurnoverDiscoveryCandidate: vi.fn(),
}));
vi.mock("./turnoverDb", () => turnoverDb);
import { appRouter } from "./routers";

function context(ownerId = 81): TrpcContext {
  return { user: { id: ownerId, openId: `owner-${ownerId}`, name: "Operador", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("turnover router", () => {
  beforeEach(() => { Object.values(turnoverDb).forEach(mock => mock.mockReset()); });
  it("scopes dashboard and unit creation to the authenticated owner", async () => {
    turnoverDb.listTurnoverDashboard.mockResolvedValue({ units: [], turnovers: [], checklist: [], evidence: [], incidents: [], events: [] });
    turnoverDb.createTurnoverUnit.mockResolvedValue({ id: 1 });
    const caller = appRouter.createCaller(context(81));
    await caller.turnover.dashboard();
    await caller.turnover.createUnit({ name: "Casa Centro", zone: "Centro", unitType: "Casa" });
    expect(turnoverDb.listTurnoverDashboard).toHaveBeenCalledWith(81);
    expect(turnoverDb.createTurnoverUnit).toHaveBeenCalledWith(81, { name: "Casa Centro", zone: "Centro", unitType: "Casa" });
  });
  it("keeps the manual release confirmation and ownership in the backend contract", async () => {
    turnoverDb.releaseTurnoverManually.mockResolvedValue({ id: 5, status: "released" });
    const caller = appRouter.createCaller(context(82));
    await caller.turnover.releaseManually({ turnoverId: 5, confirmation: "LIBERAR" });
    expect(turnoverDb.releaseTurnoverManually).toHaveBeenCalledWith(82, 5, "LIBERAR");
  });
  it("keeps public candidates isolated and requires explicit human review", async () => {
    turnoverDb.saveTurnoverDiscoveryCandidate.mockResolvedValue({ id: 19, status: "discovered" });
    turnoverDb.reviewTurnoverDiscoveryCandidate.mockResolvedValue({ id: 19, status: "reviewed" });
    const caller = appRouter.createCaller(context(83));
    const candidate = { query: "alojamiento Mérida Yucatán", externalId: "place-123", name: "Referencia pública", address: "Centro, Mérida", category: "hotel" };
    await caller.turnover.saveDiscoveryCandidate(candidate);
    await caller.turnover.reviewDiscoveryCandidate({ candidateId: 19, status: "reviewed" });
    expect(turnoverDb.saveTurnoverDiscoveryCandidate).toHaveBeenCalledWith(83, candidate);
    expect(turnoverDb.reviewTurnoverDiscoveryCandidate).toHaveBeenCalledWith(83, 19, "reviewed");
  });
});
