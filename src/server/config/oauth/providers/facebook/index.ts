import { Facebook } from 'arctic';

import { env } from '@/env.mjs';
import { APP_PATH } from '@/features/app/constants';

export const facebook = new Facebook(
  env.FACEBOOK_CLIENT_ID,
  env.FACEBOOK_CLIENT_SECRET,
  `${env.NEXT_PUBLIC_BASE_URL}${APP_PATH}/oauth/facebook`
);

export { zFacebookUser, type FacebookUser } from './schemas';
export type { FacebookTokens } from 'arctic';

export { saveFacebookUser } from './functions';
