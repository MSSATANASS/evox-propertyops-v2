export type TurnoverStatus = "planned" | "in_progress" | "released" | "cancelled";
export type ChecklistStatus = "pending" | "done" | "skipped";

export function assertTurnoverOwned(turnoverOwnerId: number, requestOwnerId: number) {
  if (turnoverOwnerId !== requestOwnerId) throw new Error("Cambio de ocupación no encontrado");
}

export function assertManualRelease(input: { status: TurnoverStatus; confirmation: string; checklistStatuses: ChecklistStatus[]; openIncidentCount: number }) {
  if (input.status === "released" || input.status === "cancelled") throw new Error("El cambio de ocupación ya está cerrado");
  if (input.confirmation.trim().toUpperCase() !== "LIBERAR") throw new Error("Escribe LIBERAR para confirmar la liberación humana");
  if (!input.checklistStatuses.length) throw new Error("Agrega y revisa al menos un punto del checklist antes de liberar");
  if (input.checklistStatuses.some(status => status === "pending")) throw new Error("Completa o marca como omitido cada punto del checklist antes de liberar");
  if (input.openIncidentCount > 0) throw new Error("Resuelve las incidencias abiertas antes de liberar la unidad");
}
