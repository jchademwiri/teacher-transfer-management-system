import * as z from "zod";

export const USER_ROLES = ["teacher", "headmaster", "admin"] as const;

export const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  role: z.enum(USER_ROLES, {
    required_error: "Please select a role",
  }),
  ecNumber: z.string().min(1, { message: "EC Number is required" }),
  schoolId: z.string().optional(),
  subjectId: z.string().optional(),
  isActive: z.boolean().default(true),
  setupComplete: z.boolean().default(false),
});

export type UserFormValues = z.infer<typeof userSchema>;
