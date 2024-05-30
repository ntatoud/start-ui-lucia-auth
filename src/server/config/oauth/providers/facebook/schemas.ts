import { z } from 'zod';

export type FacebookUser = z.infer<ReturnType<typeof zFacebookUser>>;
export const zFacebookUser = () =>
  z.object({
    name: z.string(),
    id: z.string(),
    email: z.string(),
    picture: z.object({
      data: z.object({
        height: z.number(),
        width: z.number(),
        is_silhouette: z.boolean(),
        url: z.string().url(),
      }),
    }),
  });
