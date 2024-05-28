import { z } from 'zod';

export type SpotifyUser = z.infer<ReturnType<typeof zSpotifyUser>>;
export const zSpotifyUser = () =>
  z.object({
    id: z.string(),
    email: z.string().email(),
    display_name: z.string(),
    images: z.array(
      z.object({
        url: z.string(),
        height: z.number(),
        width: z.number(),
      })
    ),
  });
