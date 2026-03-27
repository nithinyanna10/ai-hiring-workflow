import { z } from "zod";

export const offerFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  title: z.string().trim().min(1, "Confirmed job title is required."),
  startDate: z.string().trim().min(1, "Start date is required."),
  baseSalary: z.string().trim().min(1, "Base salary is required."),
  equity: z.string().trim().optional().default(""),
  bonus: z.string().trim().optional().default(""),
  managerName: z.string().trim().min(1, "Manager name is required."),
  customTerms: z.string().trim().optional().default(""),
});

export type OfferFormInput = z.infer<typeof offerFormSchema>;
