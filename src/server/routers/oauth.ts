import { parse } from 'superjson';
import { z } from 'zod';

import { createSession } from '@/server/config/auth';
import { clearOAuthProviderCookies } from '@/server/config/oauth/common/utils';
import {
  createAuthorizationURL,
  fetchUserData,
  saveUser,
  validateAuthenticationCode,
  valideOAuthRequest,
} from '@/server/config/oauth/service';
import { zOAuthProvider } from '@/server/config/oauth/types';
import { createTRPCRouter, publicProcedure } from '@/server/config/trpc';

export const oauthRouter = createTRPCRouter({
  createAuthorizationUrl: publicProcedure()
    .input(z.object({ provider: zOAuthProvider() }))
    .output(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      return await createAuthorizationURL({
        provider: input.provider,
      });
    }),
  validateLogin: publicProcedure()
    .input(
      z.object({
        provider: zOAuthProvider(),
        searchParams: z.string(),
      })
    )
    .output(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { provider, searchParams } = input;
      ctx.logger.info(`Begginning authentication with provider "${provider}"`);

      ctx.logger.info('Validating the request');
      const verifier = await valideOAuthRequest({
        provider,
        searchParams: parse(searchParams),
      });

      ctx.logger.info('Validating the authentication code');
      const tokens = await validateAuthenticationCode({
        provider,
        verifier,
      });

      ctx.logger.info('Retrieving user data...');
      const providerUser = await fetchUserData({
        provider,
        accessToken: tokens.accessToken,
      });

      ctx.logger.info('Saving user in the database');
      const { userId } = await saveUser({
        ctx,
        provider,
        providerUser,
        tokens,
      });

      ctx.logger.info("Creating user's session");
      await createSession(userId);

      ctx.logger.info(
        'Clearing cookies used to authenticate with the provider'
      );
      clearOAuthProviderCookies();

      // Validate the request with search params
      return {
        id: userId,
      };
    }),
});
