import { createTRPCRouter } from '@/server/config/trpc';
import { accountRouter } from '@/server/routers/account';
import { authRouter } from '@/server/routers/auth';
import { repositoriesRouter } from '@/server/routers/repositories';
import { usersRouter } from '@/server/routers/users';

import { oauthRouter } from './routers/oauth';

/**
 * This is the primary router for your server.
 *
 * All routers added in /src/server/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  account: accountRouter,
  auth: authRouter,
  oauth: oauthRouter,
  repositories: repositoriesRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
