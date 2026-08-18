import { describe, expect, it } from "vitest";
import { assertManualDepartureTransition } from "./tourRunRules";

describe("reglas de TourRun", () => {
  it("exige guía, una parada y confirmación escrita antes de preparar una salida", () => {
    expect(() => assertManualDepartureTransition({ currentStatus: "draft", nextStatus: "ready", confirmation: "CONFIRMAR READY", guideAssigned: false, stopCount: 1, openIncidentCount: 0 })).toThrow("Asigna un guía");
    expect(() => assertManualDepartureTransition({ currentStatus: "draft", nextStatus: "ready", confirmation: "CONFIRMAR READY", guideAssigned: true, stopCount: 0, openIncidentCount: 0 })).toThrow("al menos una parada");
    expect(() => assertManualDepartureTransition({ currentStatus: "draft", nextStatus: "ready", confirmation: "LISTO", guideAssigned: true, stopCount: 1, openIncidentCount: 0 })).toThrow("Escribe CONFIRMAR READY");
  });

  it("impide completar con incidencias abiertas y exige motivo al cancelar", () => {
    expect(() => assertManualDepartureTransition({ currentStatus: "in_progress", nextStatus: "completed", confirmation: "CONFIRMAR COMPLETED", guideAssigned: true, stopCount: 1, openIncidentCount: 1 })).toThrow("Resuelve las incidencias");
    expect(() => assertManualDepartureTransition({ currentStatus: "ready", nextStatus: "cancelled", confirmation: "CONFIRMAR CANCELLED", guideAssigned: true, stopCount: 1, openIncidentCount: 0, reason: "no" })).toThrow("motivo");
  });

  it("solo permite las transiciones declaradas", () => {
    expect(() => assertManualDepartureTransition({ currentStatus: "draft", nextStatus: "completed", confirmation: "CONFIRMAR COMPLETED", guideAssigned: true, stopCount: 1, openIncidentCount: 0 })).toThrow("no está permitida");
  });
});
