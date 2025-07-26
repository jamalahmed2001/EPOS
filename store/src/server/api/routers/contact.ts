import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const contactRouter = createTRPCRouter({
  submitForm: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(10, "Message must be at least 10 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, you would:
      // 1. Send an email to the support team
      // 2. Save to a database for tracking
      // 3. Send confirmation email to the user
      
      // For now, we'll just log it and simulate success
      console.log("Contact form submission:", {
        ...input,
        timestamp: new Date().toISOString(),
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, you might want to:
      // - Use a service like SendGrid, AWS SES, or Resend
      // - Store in database for CRM purposes
      // - Implement rate limiting to prevent spam
      
      return {
        success: true,
        message: "Thank you for your message. We'll get back to you within 24 hours.",
      };
    }),
}); 