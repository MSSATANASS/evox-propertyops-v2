import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createServiceRequest, createVendor, createVendorQuote, decideQuoteManually, listVendorDashboard } from "../vendorDb";
import { protectedProcedure, router } from "../_core/trpc";

const id = z.number().int().positive();
const fail = (error: unknown): never => { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "No se pudo completar la operación" }); };

export const vendorRouter = router({
  dashboard: protectedProcedure.query(({ ctx }) => listVendorDashboard(ctx.user.id).catch(fail)),
  createVendor: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(160), category: z.string().trim().min(2).max(120), phone: z.string().trim().max(40).optional(), contactEmail: z.string().email().max(320).optional(), notes: z.string().trim().max(4000).optional() })).mutation(({ ctx, input }) => createVendor(ctx.user.id, input).catch(fail)),
  createRequest: protectedProcedure.input(z.object({ vendorId: id.optional(), title: z.string().trim().min(2).max(180), location: z.string().trim().min(2).max(240), description: z.string().trim().min(2).max(4000) })).mutation(({ ctx, input }) => createServiceRequest(ctx.user.id, input).catch(fail)),
  createQuote: protectedProcedure.input(z.object({ requestId: id, vendorId: id, description: z.string().trim().min(2).max(4000), amountCents: z.number().int().positive(), evidenceUrl: z.string().url().max(2048).optional() })).mutation(({ ctx, input }) => createVendorQuote(ctx.user.id, input).catch(fail)),
  decideQuoteManually: protectedProcedure.input(z.object({ quoteId: id, decision: z.enum(["accepted", "rejected"]), confirmation: z.string().trim().max(32) })).mutation(({ ctx, input }) => decideQuoteManually(ctx.user.id, input.quoteId, input.decision, input.confirmation).catch(fail)),
});
