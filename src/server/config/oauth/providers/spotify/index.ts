import { Spotify } from 'arctic';

import { env } from '@/env.mjs';
import { APP_PATH } from '@/features/app/constants';

export const spotify = new Spotify(
  env.SPOTIFY_CLIENT_ID,
  env.SPOTIFY_CLIENT_SECRET,
  `${env.NEXT_PUBLIC_BASE_URL}${APP_PATH}/oauth/spotify`
);

export { zSpotifyUser, type SpotifyUser } from './schemas';
export type { SpotifyTokens } from 'arctic';

export { saveSpotifyUser } from './functions';
