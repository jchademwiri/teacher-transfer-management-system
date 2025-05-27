import * as z from "zod";

export const USER_ROLES = ["teacher", "headmaster", "admin"] as const;

export const userSchema = z.object({
  // Basic Information
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .regex(/^[a-zA-Z\s]*$/, { message: "Name can only contain letters and spaces" }),
  
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .toLowerCase(),
  
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .optional(),
  
  role: z.enum(USER_ROLES, {
    required_error: "Please select a role",
  }),

  // Contact Information
  ecNumber: z.string()
    .min(1, { message: "EC Number is required" })
    .regex(/^EC-[A-Z]\d{3,4}$/, {
      message: "EC Number must be in format EC-X000 or EC-X0000 (X being a letter)",
    }),
  
  phone: z.string()
    .regex(/^(?:\+?263|0)(?:7[1378]|86)\d{7}$/, {
      message: "Please enter a valid Zimbabwean phone number",
    })
    .optional(),
  // School Information
  schoolId: z.string().min(1, { message: "Please select a school" })
    .optional()
    .refine((val, ctx) => {
      if (ctx.parent.role === 'teacher' && !val) {
        return false;
      }
      return true;
    }, { message: "School is required for teachers" }),
  subjectId: z.string().min(1, { message: "Please select a subject" })
    .optional()
    .refine((val, ctx) => {
      if (ctx.parent.role === 'teacher' && !val) {
        return false;
      }
      return true;
    }, { message: "Subject is required for teachers" }),

  // Account Status
  isActive: z.boolean().default(true),
  setupComplete: z.boolean().default(true),
});

export type UserFormValues = z.infer<typeof userSchema>;
