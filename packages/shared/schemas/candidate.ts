import { z } from "zod";

export const candidateProfileSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  jobId: z.string().min(1),
  status: z.enum(["applied", "screening", "interview", "offer"]),
});
