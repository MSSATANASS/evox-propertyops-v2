export type QuoteStatus = "pending" | "accepted" | "rejected";

export function assertManualQuoteDecision(input: { currentStatus: QuoteStatus; decision: "accepted" | "rejected"; confirmation: string }) {
  if (input.currentStatus !== "pending") throw new Error("La cotización ya cuenta con una decisión humana");
  const expected = input.decision === "accepted" ? "ACEPTAR" : "RECHAZAR";
  if (input.confirmation.trim().toUpperCase() !== expected) throw new Error(`Escribe ${expected} para confirmar la decisión humana`);
}

export function assertVendorOwned(vendorOwnerId: number, ownerId: number) {
  if (vendorOwnerId !== ownerId) throw new Error("El proveedor no pertenece al usuario autenticado");
}
