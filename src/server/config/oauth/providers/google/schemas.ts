import { z } from 'zod';

export type GoogleUser = z.infer<ReturnType<typeof zGoogleUser>>;
export const zGoogleUser = () =>
  z.object({
    id: z.string(),
    email: z.string().email(),
    verified_email: z.boolean(),
    name: z.string(),
    given_name: z.string(),
    family_name: z.string(),
    picture: z.string(),
    locale: z.string(),
  });
