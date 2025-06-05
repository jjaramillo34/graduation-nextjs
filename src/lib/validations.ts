import { z } from 'zod';

export const registrationSchema = z.object({
  eventId: z.number().min(1, 'Please select an event'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .refine(
      (email) => email.endsWith('@schools.nyc.gov'),
      'Email must be from @schools.nyc.gov domain'
    ),
});

export type RegistrationFormSchema = z.infer<typeof registrationSchema>;
