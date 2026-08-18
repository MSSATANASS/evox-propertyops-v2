import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addTourEvidence, addTourIncident, addTourParticipant, addTourStop, createTourDeparture, createTourGuide, listTourRunDashboard, resolveTourIncident, transitionTourDepartureManually } from "../tourRunDb";
import { protectedProcedure, router } from "../_core/trpc";

const id = z.number().int().positive();
const epoch = z.number().int().positive().optional();
function fail(error: unknown): never { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "No se pudo completar la operación" }); }

export const tourRunRouter = router({
  dashboard: protectedProcedure.query(({ ctx }) => listTourRunDashboard(ctx.user.id).catch(fail)),
  createGuide: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(160), phone: z.string().trim().min(5).max(40).optional(), notes: z.string().trim().max(4000).optional() })).mutation(({ ctx, input }) => createTourGuide(ctx.user.id, input).catch(fail)),
  createDeparture: protectedProcedure.input(z.object({ title: z.string().trim().min(3).max(180), routeLabel: z.string().trim().min(3).max(240), guideId: id.optional(), departureAt: epoch })).mutation(({ ctx, input }) => createTourDeparture(ctx.user.id, input).catch(fail)),
  addStop: protectedProcedure.input(z.object({ departureId: id, sequence: z.number().int().positive().max(99), name: z.string().trim().min(2).max(180), notes: z.string().trim().max(4000).optional(), scheduledAt: epoch })).mutation(({ ctx, input }) => addTourStop(ctx.user.id, input).catch(fail)),
  addParticipant: protectedProcedure.input(z.object({ departureId: id, displayName: z.string().trim().min(2).max(160), partySize: z.number().int().min(1).max(30) })).mutation(({ ctx, input }) => addTourParticipant(ctx.user.id, input).catch(fail)),
  addEvidence: protectedProcedure.input(z.object({ departureId: id, description: z.string().trim().min(2).max(4000), fileUrl: z.string().url().max(2048).optional() })).mutation(({ ctx, input }) => addTourEvidence(ctx.user.id, input).catch(fail)),
  addIncident: protectedProcedure.input(z.object({ departureId: id, description: z.string().trim().min(2).max(4000), severity: z.enum(["low", "medium", "high"]) })).mutation(({ ctx, input }) => addTourIncident(ctx.user.id, input).catch(fail)),
  resolveIncident: protectedProcedure.input(z.object({ incidentId: id })).mutation(({ ctx, input }) => resolveTourIncident(ctx.user.id, input.incidentId).catch(fail)),
  transitionManually: protectedProcedure.input(z.object({ departureId: id, nextStatus: z.enum(["ready", "in_progress", "completed", "cancelled"]), confirmation: z.string().trim().max(64), reason: z.string().trim().max(4000).optional() })).mutation(({ ctx, input }) => transitionTourDepartureManually(ctx.user.id, input).catch(fail)),
});
