import { Google } from 'arctic';

import { env } from '@/env.mjs';
import { APP_PATH } from '@/features/app/constants';

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.NEXT_PUBLIC_BASE_URL}${APP_PATH}/oauth/google`
);

export { zGoogleUser, type GoogleUser } from './schemas';
export type { GoogleTokens } from 'arctic';

export { saveGoogleUser } from './functions';
