import { describe, expect, it } from "vitest";
import { assertManualRelease, assertTurnoverOwned } from "./turnoverRules";

describe("turnover rules", () => {
  it("prevents cross-user access to a turnover", () => {
    expect(() => assertTurnoverOwned(3, 4)).toThrow("Cambio de ocupación no encontrado");
    expect(() => assertTurnoverOwned(3, 3)).not.toThrow();
  });

  it("requires a confirmed checklist and no open incident before manual release", () => {
    expect(() => assertManualRelease({ status: "in_progress", confirmation: "LIBERAR", checklistStatuses: ["done", "skipped"], openIncidentCount: 0 })).not.toThrow();
    expect(() => assertManualRelease({ status: "in_progress", confirmation: "LIBERAR", checklistStatuses: ["pending"], openIncidentCount: 0 })).toThrow("Completa o marca como omitido");
    expect(() => assertManualRelease({ status: "in_progress", confirmation: "LIBERAR", checklistStatuses: ["done"], openIncidentCount: 1 })).toThrow("Resuelve las incidencias");
    expect(() => assertManualRelease({ status: "in_progress", confirmation: "OK", checklistStatuses: ["done"], openIncidentCount: 0 })).toThrow("Escribe LIBERAR");
  });
});
