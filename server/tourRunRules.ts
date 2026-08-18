export type TourDepartureStatus = "draft" | "ready" | "in_progress" | "completed" | "cancelled";

const allowedTransitions: Record<TourDepartureStatus, TourDepartureStatus[]> = {
  draft: ["ready", "cancelled"],
  ready: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function assertTourOwned(departureOwnerId: number, requestOwnerId: number) {
  if (departureOwnerId !== requestOwnerId) throw new Error("Salida no encontrada");
}

export function assertManualDepartureTransition(input: {
  currentStatus: TourDepartureStatus;
  nextStatus: TourDepartureStatus;
  confirmation: string;
  guideAssigned: boolean;
  stopCount: number;
  openIncidentCount: number;
  reason?: string;
}) {
  if (!allowedTransitions[input.currentStatus].includes(input.nextStatus)) {
    throw new Error("La transición de estado no está permitida");
  }
  const expectedConfirmation = `CONFIRMAR ${input.nextStatus.toUpperCase()}`;
  if (input.confirmation.trim().toUpperCase() !== expectedConfirmation) {
    throw new Error(`Escribe ${expectedConfirmation} para confirmar la decisión humana`);
  }
  if (input.nextStatus === "ready" && !input.guideAssigned) {
    throw new Error("Asigna un guía antes de preparar la salida");
  }
  if (input.nextStatus === "ready" && input.stopCount < 1) {
    throw new Error("Registra al menos una parada antes de preparar la salida");
  }
  if (input.nextStatus === "completed" && input.openIncidentCount > 0) {
    throw new Error("Resuelve las incidencias abiertas antes de completar la salida");
  }
  if (input.nextStatus === "cancelled" && (input.reason?.trim().length ?? 0) < 5) {
    throw new Error("Escribe un motivo de al menos cinco caracteres para cancelar la salida");
  }
}
