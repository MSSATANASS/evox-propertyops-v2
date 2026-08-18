import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const tourRunDb = vi.hoisted(() => ({
  listTourRunDashboard: vi.fn(), createTourGuide: vi.fn(), createTourDeparture: vi.fn(), addTourStop: vi.fn(), addTourParticipant: vi.fn(), addTourEvidence: vi.fn(), addTourIncident: vi.fn(), resolveTourIncident: vi.fn(), transitionTourDepartureManually: vi.fn(),
}));
vi.mock("./tourRunDb", () => tourRunDb);
import { appRouter } from "./routers";

function context(ownerId = 91): TrpcContext {
  return { user: { id: ownerId, openId: `tour-owner-${ownerId}`, name: "Operador", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("router de TourRun", () => {
  beforeEach(() => { Object.values(tourRunDb).forEach(mock => mock.mockReset()); });
  it("aísla dashboard, guía y salida por el usuario autenticado", async () => {
    tourRunDb.listTourRunDashboard.mockResolvedValue({ guides: [], departures: [], stops: [], participants: [], incidents: [], evidence: [], events: [] });
    tourRunDb.createTourGuide.mockResolvedValue({ id: 1 });
    tourRunDb.createTourDeparture.mockResolvedValue({ id: 2, status: "draft" });
    const caller = appRouter.createCaller(context(91));
    await caller.tourRun.dashboard();
    await caller.tourRun.createGuide({ name: "Guía de prueba", phone: "9990000000" });
    await caller.tourRun.createDeparture({ title: "Ruta Puuc", routeLabel: "Mérida · Uxmal", guideId: 1 });
    expect(tourRunDb.listTourRunDashboard).toHaveBeenCalledWith(91);
    expect(tourRunDb.createTourGuide).toHaveBeenCalledWith(91, { name: "Guía de prueba", phone: "9990000000" });
    expect(tourRunDb.createTourDeparture).toHaveBeenCalledWith(91, { title: "Ruta Puuc", routeLabel: "Mérida · Uxmal", guideId: 1 });
  });

  it("preserva la confirmación escrita y el motivo en la transición crítica", async () => {
    tourRunDb.transitionTourDepartureManually.mockResolvedValue({ id: 7, status: "cancelled" });
    const caller = appRouter.createCaller(context(92));
    await caller.tourRun.transitionManually({ departureId: 7, nextStatus: "cancelled", confirmation: "CONFIRMAR CANCELLED", reason: "Lluvia intensa" });
    expect(tourRunDb.transitionTourDepartureManually).toHaveBeenCalledWith(92, { departureId: 7, nextStatus: "cancelled", confirmation: "CONFIRMAR CANCELLED", reason: "Lluvia intensa" });
  });
});
