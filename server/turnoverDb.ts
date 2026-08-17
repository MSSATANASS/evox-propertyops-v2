import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { evoxModuleEvents, turnoverChecklistItems, turnoverDiscoveryCandidates, turnoverEvidence, turnoverIncidents, turnovers, turnoverUnits } from "../drizzle/schema";
import { getDb } from "./db";
import { assertManualRelease, assertTurnoverOwned, ChecklistStatus, TurnoverStatus } from "./turnoverRules";

async function databaseOrThrow() {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible");
  return db as ReturnType<typeof drizzle>;
}

async function appendTurnoverEvent(ownerId: number, entityType: string, entityId: number, action: string, metadata?: Record<string, unknown>) {
  const db = await databaseOrThrow();
  await db.insert(evoxModuleEvents).values({ ownerId, actorId: ownerId, module: "turnover", entityType, entityId, action, metadata: metadata ? JSON.stringify(metadata) : null });
}

async function ownedUnit(ownerId: number, unitId: number) {
  const db = await databaseOrThrow();
  const unit = (await db.select().from(turnoverUnits).where(and(eq(turnoverUnits.id, unitId), eq(turnoverUnits.ownerId, ownerId))).limit(1))[0];
  if (!unit) throw new Error("Unidad no encontrada");
  return unit;
}

async function ownedTurnover(ownerId: number, turnoverId: number) {
  const db = await databaseOrThrow();
  const turnover = (await db.select().from(turnovers).where(and(eq(turnovers.id, turnoverId), eq(turnovers.ownerId, ownerId))).limit(1))[0];
  if (!turnover) throw new Error("Cambio de ocupación no encontrado");
  assertTurnoverOwned(turnover.ownerId, ownerId);
  return turnover;
}

export async function listTurnoverDashboard(ownerId: number) {
  const db = await databaseOrThrow();
  const [units, turnoverRows, checklist, evidence, incidents, events, candidates] = await Promise.all([
    db.select().from(turnoverUnits).where(eq(turnoverUnits.ownerId, ownerId)).orderBy(desc(turnoverUnits.updatedAt)),
    db.select().from(turnovers).where(eq(turnovers.ownerId, ownerId)).orderBy(desc(turnovers.updatedAt)),
    db.select().from(turnoverChecklistItems).where(eq(turnoverChecklistItems.ownerId, ownerId)).orderBy(desc(turnoverChecklistItems.createdAt)),
    db.select().from(turnoverEvidence).where(eq(turnoverEvidence.ownerId, ownerId)).orderBy(desc(turnoverEvidence.createdAt)),
    db.select().from(turnoverIncidents).where(eq(turnoverIncidents.ownerId, ownerId)).orderBy(desc(turnoverIncidents.createdAt)),
    db.select().from(evoxModuleEvents).where(and(eq(evoxModuleEvents.ownerId, ownerId), eq(evoxModuleEvents.module, "turnover"))).orderBy(desc(evoxModuleEvents.createdAt)).limit(30),
    db.select().from(turnoverDiscoveryCandidates).where(eq(turnoverDiscoveryCandidates.ownerId, ownerId)).orderBy(desc(turnoverDiscoveryCandidates.createdAt)).limit(30),
  ]);
  return { units, turnovers: turnoverRows, checklist, evidence, incidents, events, candidates };
}

export async function saveTurnoverDiscoveryCandidate(ownerId: number, input: { query: string; externalId: string; name: string; address?: string; mapsUrl?: string; websiteUrl?: string; category?: string; latitude?: string; longitude?: string }) {
  const db = await databaseOrThrow();
  const existing = (await db.select().from(turnoverDiscoveryCandidates).where(and(eq(turnoverDiscoveryCandidates.ownerId, ownerId), eq(turnoverDiscoveryCandidates.source, "google_places"), eq(turnoverDiscoveryCandidates.externalId, input.externalId))).limit(1))[0];
  if (existing) return existing;
  const result = await db.insert(turnoverDiscoveryCandidates).values({ ownerId, source: "google_places", query: input.query, externalId: input.externalId, name: input.name, address: input.address || null, mapsUrl: input.mapsUrl || null, websiteUrl: input.websiteUrl || null, category: input.category || null, latitude: input.latitude || null, longitude: input.longitude || null });
  const candidate = (await db.select().from(turnoverDiscoveryCandidates).where(and(eq(turnoverDiscoveryCandidates.id, Number(result[0].insertId)), eq(turnoverDiscoveryCandidates.ownerId, ownerId))).limit(1))[0];
  await appendTurnoverEvent(ownerId, "discovery_candidate", candidate.id, "turnover.discovery_candidate_saved", { source: "google_places" });
  return candidate;
}

export async function reviewTurnoverDiscoveryCandidate(ownerId: number, candidateId: number, status: "reviewed" | "dismissed") {
  const db = await databaseOrThrow();
  const candidate = (await db.select().from(turnoverDiscoveryCandidates).where(and(eq(turnoverDiscoveryCandidates.id, candidateId), eq(turnoverDiscoveryCandidates.ownerId, ownerId))).limit(1))[0];
  if (!candidate) throw new Error("Referencia pública no encontrada");
  await db.update(turnoverDiscoveryCandidates).set({ status, reviewedAt: new Date() }).where(and(eq(turnoverDiscoveryCandidates.id, candidateId), eq(turnoverDiscoveryCandidates.ownerId, ownerId)));
  await appendTurnoverEvent(ownerId, "discovery_candidate", candidateId, "turnover.discovery_candidate_reviewed", { status });
  return (await db.select().from(turnoverDiscoveryCandidates).where(and(eq(turnoverDiscoveryCandidates.id, candidateId), eq(turnoverDiscoveryCandidates.ownerId, ownerId))).limit(1))[0];
}

export async function createTurnoverUnit(ownerId: number, input: { name: string; zone: string; unitType: string }) {
  const db = await databaseOrThrow();
  const result = await db.insert(turnoverUnits).values({ ownerId, ...input });
  const unit = await ownedUnit(ownerId, Number(result[0].insertId));
  await appendTurnoverEvent(ownerId, "unit", unit.id, "turnover.unit_created", { name: unit.name });
  return unit;
}

export async function createTurnover(ownerId: number, input: { unitId: number; checkoutAt?: number; checkinAt?: number }) {
  const db = await databaseOrThrow();
  await ownedUnit(ownerId, input.unitId);
  const result = await db.insert(turnovers).values({ ownerId, unitId: input.unitId, status: "planned", checkoutAt: input.checkoutAt ? new Date(input.checkoutAt) : null, checkinAt: input.checkinAt ? new Date(input.checkinAt) : null });
  const turnover = await ownedTurnover(ownerId, Number(result[0].insertId));
  await appendTurnoverEvent(ownerId, "turnover", turnover.id, "turnover.created", { unitId: turnover.unitId });
  return turnover;
}

export async function addTurnoverChecklistItem(ownerId: number, input: { turnoverId: number; label: string }) {
  const db = await databaseOrThrow();
  await ownedTurnover(ownerId, input.turnoverId);
  const result = await db.insert(turnoverChecklistItems).values({ ownerId, ...input });
  const item = (await db.select().from(turnoverChecklistItems).where(and(eq(turnoverChecklistItems.id, Number(result[0].insertId)), eq(turnoverChecklistItems.ownerId, ownerId))).limit(1))[0];
  await appendTurnoverEvent(ownerId, "checklist_item", item.id, "turnover.checklist_added", { turnoverId: input.turnoverId });
  return item;
}

export async function updateTurnoverChecklistItem(ownerId: number, itemId: number, status: ChecklistStatus) {
  const db = await databaseOrThrow();
  const item = (await db.select().from(turnoverChecklistItems).where(and(eq(turnoverChecklistItems.id, itemId), eq(turnoverChecklistItems.ownerId, ownerId))).limit(1))[0];
  if (!item) throw new Error("Punto de checklist no encontrado");
  await ownedTurnover(ownerId, item.turnoverId);
  await db.update(turnoverChecklistItems).set({ status, completedAt: status === "pending" ? null : new Date() }).where(and(eq(turnoverChecklistItems.id, itemId), eq(turnoverChecklistItems.ownerId, ownerId)));
  await appendTurnoverEvent(ownerId, "checklist_item", itemId, "turnover.checklist_updated", { status });
  return (await db.select().from(turnoverChecklistItems).where(and(eq(turnoverChecklistItems.id, itemId), eq(turnoverChecklistItems.ownerId, ownerId))).limit(1))[0];
}

export async function addTurnoverEvidence(ownerId: number, input: { turnoverId: number; description: string; fileUrl?: string }) {
  const db = await databaseOrThrow();
  await ownedTurnover(ownerId, input.turnoverId);
  const result = await db.insert(turnoverEvidence).values({ ownerId, turnoverId: input.turnoverId, description: input.description, fileUrl: input.fileUrl || null });
  const evidence = (await db.select().from(turnoverEvidence).where(and(eq(turnoverEvidence.id, Number(result[0].insertId)), eq(turnoverEvidence.ownerId, ownerId))).limit(1))[0];
  await appendTurnoverEvent(ownerId, "evidence", evidence.id, "turnover.evidence_added", { turnoverId: input.turnoverId });
  return evidence;
}

export async function addTurnoverIncident(ownerId: number, input: { turnoverId: number; description: string; severity: "low" | "medium" | "high" }) {
  const db = await databaseOrThrow();
  await ownedTurnover(ownerId, input.turnoverId);
  const result = await db.insert(turnoverIncidents).values({ ownerId, ...input });
  const incident = (await db.select().from(turnoverIncidents).where(and(eq(turnoverIncidents.id, Number(result[0].insertId)), eq(turnoverIncidents.ownerId, ownerId))).limit(1))[0];
  await appendTurnoverEvent(ownerId, "incident", incident.id, "turnover.incident_added", { severity: input.severity });
  return incident;
}

export async function resolveTurnoverIncident(ownerId: number, incidentId: number) {
  const db = await databaseOrThrow();
  const incident = (await db.select().from(turnoverIncidents).where(and(eq(turnoverIncidents.id, incidentId), eq(turnoverIncidents.ownerId, ownerId))).limit(1))[0];
  if (!incident) throw new Error("Incidencia no encontrada");
  await ownedTurnover(ownerId, incident.turnoverId);
  await db.update(turnoverIncidents).set({ status: "resolved", resolvedAt: new Date() }).where(and(eq(turnoverIncidents.id, incidentId), eq(turnoverIncidents.ownerId, ownerId)));
  await appendTurnoverEvent(ownerId, "incident", incidentId, "turnover.incident_resolved");
  return (await db.select().from(turnoverIncidents).where(and(eq(turnoverIncidents.id, incidentId), eq(turnoverIncidents.ownerId, ownerId))).limit(1))[0];
}

export async function releaseTurnoverManually(ownerId: number, turnoverId: number, confirmation: string) {
  const db = await databaseOrThrow();
  const turnover = await ownedTurnover(ownerId, turnoverId);
  const [checklist, incidents] = await Promise.all([
    db.select().from(turnoverChecklistItems).where(and(eq(turnoverChecklistItems.ownerId, ownerId), eq(turnoverChecklistItems.turnoverId, turnoverId))),
    db.select().from(turnoverIncidents).where(and(eq(turnoverIncidents.ownerId, ownerId), eq(turnoverIncidents.turnoverId, turnoverId))),
  ]);
  assertManualRelease({ status: turnover.status as TurnoverStatus, confirmation, checklistStatuses: checklist.map(item => item.status), openIncidentCount: incidents.filter(item => item.status === "open").length });
  const released = await db.update(turnovers).set({ status: "released", releasedAt: new Date(), releasedByUserId: ownerId }).where(and(eq(turnovers.id, turnoverId), eq(turnovers.ownerId, ownerId), eq(turnovers.status, turnover.status)));
  if (!released[0].affectedRows) throw new Error("El cambio de ocupación fue actualizado por otra sesión");
  await appendTurnoverEvent(ownerId, "turnover", turnoverId, "turnover.manually_released", { releaseMode: "manual_ui" });
  return ownedTurnover(ownerId, turnoverId);
}
