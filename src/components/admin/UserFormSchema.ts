
import * as z from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["teacher", "headmaster", "admin"], {
    required_error: "Please select a role",
  }),
  ecNumber: z.string().optional(),
  schoolId: z.string().optional(),
  isActive: z.boolean().default(true),
  setupComplete: z.boolean().default(false),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
