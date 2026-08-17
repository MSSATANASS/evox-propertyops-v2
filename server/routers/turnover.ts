import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addTurnoverChecklistItem, addTurnoverEvidence, addTurnoverIncident, createTurnover, createTurnoverUnit, listTurnoverDashboard, releaseTurnoverManually, resolveTurnoverIncident, reviewTurnoverDiscoveryCandidate, saveTurnoverDiscoveryCandidate, updateTurnoverChecklistItem } from "../turnoverDb";
import { protectedProcedure, router } from "../_core/trpc";

const id = z.number().int().positive();
function translateError(error: unknown): never {
  throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "No se pudo completar la operación" });
}

export const turnoverRouter = router({
  dashboard: protectedProcedure.query(({ ctx }) => listTurnoverDashboard(ctx.user.id).catch(translateError)),
  saveDiscoveryCandidate: protectedProcedure.input(z.object({ query: z.string().trim().min(3).max(320), externalId: z.string().trim().min(2).max(255), name: z.string().trim().min(2).max(240), address: z.string().trim().max(4000).optional(), mapsUrl: z.string().url().max(2048).optional(), websiteUrl: z.string().url().max(2048).optional(), category: z.string().trim().max(160).optional(), latitude: z.string().trim().max(32).optional(), longitude: z.string().trim().max(32).optional() })).mutation(({ ctx, input }) => saveTurnoverDiscoveryCandidate(ctx.user.id, input).catch(translateError)),
  reviewDiscoveryCandidate: protectedProcedure.input(z.object({ candidateId: id, status: z.enum(["reviewed", "dismissed"]) })).mutation(({ ctx, input }) => reviewTurnoverDiscoveryCandidate(ctx.user.id, input.candidateId, input.status).catch(translateError)),
  createUnit: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(120), zone: z.string().trim().min(2).max(160), unitType: z.string().trim().min(2).max(80) })).mutation(({ ctx, input }) => createTurnoverUnit(ctx.user.id, input).catch(translateError)),
  createTurnover: protectedProcedure.input(z.object({ unitId: id, checkoutAt: z.number().int().optional(), checkinAt: z.number().int().optional() })).mutation(({ ctx, input }) => createTurnover(ctx.user.id, input).catch(translateError)),
  addChecklistItem: protectedProcedure.input(z.object({ turnoverId: id, label: z.string().trim().min(2).max(180) })).mutation(({ ctx, input }) => addTurnoverChecklistItem(ctx.user.id, input).catch(translateError)),
  updateChecklistItem: protectedProcedure.input(z.object({ itemId: id, status: z.enum(["pending", "done", "skipped"]) })).mutation(({ ctx, input }) => updateTurnoverChecklistItem(ctx.user.id, input.itemId, input.status).catch(translateError)),
  addEvidence: protectedProcedure.input(z.object({ turnoverId: id, description: z.string().trim().min(2).max(4000), fileUrl: z.string().url().max(2048).optional() })).mutation(({ ctx, input }) => addTurnoverEvidence(ctx.user.id, input).catch(translateError)),
  addIncident: protectedProcedure.input(z.object({ turnoverId: id, description: z.string().trim().min(2).max(4000), severity: z.enum(["low", "medium", "high"]) })).mutation(({ ctx, input }) => addTurnoverIncident(ctx.user.id, input).catch(translateError)),
  resolveIncident: protectedProcedure.input(z.object({ incidentId: id })).mutation(({ ctx, input }) => resolveTurnoverIncident(ctx.user.id, input.incidentId).catch(translateError)),
  releaseManually: protectedProcedure.input(z.object({ turnoverId: id, confirmation: z.string().trim().max(32) })).mutation(({ ctx, input }) => releaseTurnoverManually(ctx.user.id, input.turnoverId, input.confirmation).catch(translateError)),
});
