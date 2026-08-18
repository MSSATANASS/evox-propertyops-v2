import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { tourDepartures, tourEvidence, tourEvents, tourGuides, tourIncidents, tourParticipants, tourStops } from "../drizzle/schema";
import { getDb } from "./db";
import { assertManualDepartureTransition, assertTourOwned, TourDepartureStatus } from "./tourRunRules";

async function database() {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible");
  return db as ReturnType<typeof drizzle>;
}

async function ownedGuide(ownerId: number, guideId: number) {
  const db = await database();
  const guide = (await db.select().from(tourGuides).where(and(eq(tourGuides.id, guideId), eq(tourGuides.ownerId, ownerId))).limit(1))[0];
  if (!guide) throw new Error("Guía no encontrado");
  return guide;
}

async function ownedDeparture(ownerId: number, departureId: number) {
  const db = await database();
  const departure = (await db.select().from(tourDepartures).where(and(eq(tourDepartures.id, departureId), eq(tourDepartures.ownerId, ownerId))).limit(1))[0];
  if (!departure) throw new Error("Salida no encontrada");
  assertTourOwned(departure.ownerId, ownerId);
  return departure;
}

async function appendTourEvent(ownerId: number, departureId: number | null, entityType: string, entityId: number, action: string, metadata?: Record<string, unknown>) {
  const db = await database();
  await db.insert(tourEvents).values({ ownerId, actorId: ownerId, departureId, entityType, entityId, action, metadata: metadata ? JSON.stringify(metadata) : null });
}

export async function listTourRunDashboard(ownerId: number) {
  const db = await database();
  const [guides, departures, stops, participants, incidents, evidence, events] = await Promise.all([
    db.select().from(tourGuides).where(eq(tourGuides.ownerId, ownerId)).orderBy(desc(tourGuides.updatedAt)),
    db.select().from(tourDepartures).where(eq(tourDepartures.ownerId, ownerId)).orderBy(desc(tourDepartures.updatedAt)),
    db.select().from(tourStops).where(eq(tourStops.ownerId, ownerId)).orderBy(tourStops.sequence),
    db.select().from(tourParticipants).where(eq(tourParticipants.ownerId, ownerId)).orderBy(desc(tourParticipants.createdAt)),
    db.select().from(tourIncidents).where(eq(tourIncidents.ownerId, ownerId)).orderBy(desc(tourIncidents.createdAt)),
    db.select().from(tourEvidence).where(eq(tourEvidence.ownerId, ownerId)).orderBy(desc(tourEvidence.createdAt)),
    db.select().from(tourEvents).where(eq(tourEvents.ownerId, ownerId)).orderBy(desc(tourEvents.createdAt)).limit(40),
  ]);
  return { guides, departures, stops, participants, incidents, evidence, events };
}

export async function createTourGuide(ownerId: number, input: { name: string; phone?: string; notes?: string }) {
  const db = await database();
  const result = await db.insert(tourGuides).values({ ownerId, name: input.name, phone: input.phone || null, notes: input.notes || null });
  const guide = await ownedGuide(ownerId, Number(result[0].insertId));
  await appendTourEvent(ownerId, null, "guide", guide.id, "tour.guide_created", { name: guide.name });
  return guide;
}

export async function createTourDeparture(ownerId: number, input: { title: string; routeLabel: string; guideId?: number; departureAt?: number }) {
  const db = await database();
  if (input.guideId) await ownedGuide(ownerId, input.guideId);
  const result = await db.insert(tourDepartures).values({ ownerId, title: input.title, routeLabel: input.routeLabel, guideId: input.guideId || null, departureAt: input.departureAt ? new Date(input.departureAt) : null });
  const departure = await ownedDeparture(ownerId, Number(result[0].insertId));
  await appendTourEvent(ownerId, departure.id, "departure", departure.id, "tour.departure_created", { guideId: departure.guideId ?? undefined });
  return departure;
}

export async function addTourStop(ownerId: number, input: { departureId: number; sequence: number; name: string; notes?: string; scheduledAt?: number }) {
  const db = await database();
  await ownedDeparture(ownerId, input.departureId);
  const result = await db.insert(tourStops).values({ ownerId, departureId: input.departureId, sequence: input.sequence, name: input.name, notes: input.notes || null, scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null });
  const stop = (await db.select().from(tourStops).where(and(eq(tourStops.id, Number(result[0].insertId)), eq(tourStops.ownerId, ownerId))).limit(1))[0];
  await appendTourEvent(ownerId, input.departureId, "stop", stop.id, "tour.stop_added", { sequence: stop.sequence });
  return stop;
}

export async function addTourParticipant(ownerId: number, input: { departureId: number; displayName: string; partySize: number }) {
  const db = await database();
  await ownedDeparture(ownerId, input.departureId);
  const result = await db.insert(tourParticipants).values({ ownerId, ...input });
  const participant = (await db.select().from(tourParticipants).where(and(eq(tourParticipants.id, Number(result[0].insertId)), eq(tourParticipants.ownerId, ownerId))).limit(1))[0];
  await appendTourEvent(ownerId, input.departureId, "participant", participant.id, "tour.participant_added", { partySize: participant.partySize });
  return participant;
}

export async function addTourEvidence(ownerId: number, input: { departureId: number; description: string; fileUrl?: string }) {
  const db = await database();
  await ownedDeparture(ownerId, input.departureId);
  const result = await db.insert(tourEvidence).values({ ownerId, departureId: input.departureId, description: input.description, fileUrl: input.fileUrl || null });
  const evidence = (await db.select().from(tourEvidence).where(and(eq(tourEvidence.id, Number(result[0].insertId)), eq(tourEvidence.ownerId, ownerId))).limit(1))[0];
  await appendTourEvent(ownerId, input.departureId, "evidence", evidence.id, "tour.evidence_added");
  return evidence;
}

export async function addTourIncident(ownerId: number, input: { departureId: number; description: string; severity: "low" | "medium" | "high" }) {
  const db = await database();
  await ownedDeparture(ownerId, input.departureId);
  const result = await db.insert(tourIncidents).values({ ownerId, ...input });
  const incident = (await db.select().from(tourIncidents).where(and(eq(tourIncidents.id, Number(result[0].insertId)), eq(tourIncidents.ownerId, ownerId))).limit(1))[0];
  await appendTourEvent(ownerId, input.departureId, "incident", incident.id, "tour.incident_added", { severity: incident.severity });
  return incident;
}

export async function resolveTourIncident(ownerId: number, incidentId: number) {
  const db = await database();
  const incident = (await db.select().from(tourIncidents).where(and(eq(tourIncidents.id, incidentId), eq(tourIncidents.ownerId, ownerId))).limit(1))[0];
  if (!incident) throw new Error("Incidencia no encontrada");
  await ownedDeparture(ownerId, incident.departureId);
  await db.update(tourIncidents).set({ status: "resolved", resolvedAt: new Date() }).where(and(eq(tourIncidents.id, incidentId), eq(tourIncidents.ownerId, ownerId), eq(tourIncidents.status, "open")));
  await appendTourEvent(ownerId, incident.departureId, "incident", incidentId, "tour.incident_resolved");
  return (await db.select().from(tourIncidents).where(and(eq(tourIncidents.id, incidentId), eq(tourIncidents.ownerId, ownerId))).limit(1))[0];
}

export async function transitionTourDepartureManually(ownerId: number, input: { departureId: number; nextStatus: TourDepartureStatus; confirmation: string; reason?: string }) {
  const db = await database();
  const departure = await ownedDeparture(ownerId, input.departureId);
  const [stops, incidents] = await Promise.all([
    db.select({ id: tourStops.id }).from(tourStops).where(and(eq(tourStops.ownerId, ownerId), eq(tourStops.departureId, input.departureId))),
    db.select({ id: tourIncidents.id }).from(tourIncidents).where(and(eq(tourIncidents.ownerId, ownerId), eq(tourIncidents.departureId, input.departureId), eq(tourIncidents.status, "open"))),
  ]);
  assertManualDepartureTransition({ currentStatus: departure.status as TourDepartureStatus, nextStatus: input.nextStatus, confirmation: input.confirmation, guideAssigned: Boolean(departure.guideId), stopCount: stops.length, openIncidentCount: incidents.length, reason: input.reason });
  const update = await db.update(tourDepartures).set({ status: input.nextStatus, statusChangedByUserId: ownerId, statusChangedAt: new Date(), cancellationReason: input.nextStatus === "cancelled" ? input.reason?.trim() || null : null }).where(and(eq(tourDepartures.id, input.departureId), eq(tourDepartures.ownerId, ownerId), eq(tourDepartures.status, departure.status)));
  if (!update[0].affectedRows) throw new Error("La salida fue actualizada por otra sesión");
  await appendTourEvent(ownerId, input.departureId, "departure", input.departureId, "tour.departure_manually_transitioned", { from: departure.status, to: input.nextStatus, decisionMode: "manual_ui" });
  return ownedDeparture(ownerId, input.departureId);
}
