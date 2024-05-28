import { GoogleTokens } from 'arctic';
import { generateId } from 'lucia';

import { GoogleUser } from '@/server/config/oauth/providers/google/schemas';
import { AppContext } from '@/server/config/trpc';

export const saveGoogleUser = async ({
  ctx,
  googleUser,
  tokens: { accessToken, refreshToken, accessTokenExpiresAt },
}: {
  ctx: AppContext;
  googleUser: GoogleUser;
  tokens: GoogleTokens;
}): Promise<{ userId: string }> => {
  const existingUser = await ctx.db.user.findFirst({
    where: {
      email: googleUser.email,
    },
    select: {
      id: true,
      oauth: {
        where: {
          providerId: 'google',
        },
      },
    },
  });

  let userId;

  if (!existingUser) {
    // If the user does not exist, create it and add the provider.
    userId = await ctx.db.$transaction(async (tx) => {
      const userId = generateId(15);

      await tx.user.create({
        data: {
          id: userId,
          email: googleUser.email,
          profilePictureUrl: googleUser.picture,
          name: googleUser.name,
          accountStatus: 'ENABLED',
        },
      });

      await tx.oAuthAccount.create({
        data: {
          userId,
          providerId: 'google',
          providerUserId: googleUser.id,
          accessToken,
          refreshToken,
          expiresAt: accessTokenExpiresAt,
        },
      });

      return userId;
    });
  } else if (!existingUser.oauth.length) {
    // If the user exists but does not have a google account linked; add it
    userId = existingUser.id;

    await ctx.db.oAuthAccount.create({
      data: {
        userId: existingUser.id,
        providerId: 'google',
        providerUserId: googleUser.id,
        accessToken,
        expiresAt: accessTokenExpiresAt,
      },
      select: {
        userId: true,
      },
    });
  } else {
    // If the user exists and is linked to a google account; update it
    userId = existingUser.id;

    await ctx.db.oAuthAccount.update({
      where: {
        providerId_providerUserId: {
          providerId: 'google',
          providerUserId: googleUser.id,
        },
      },
      data: {
        accessToken,
        expiresAt: accessTokenExpiresAt,
      },
      select: {
        userId: true,
      },
    });
  }

  return { userId };
};
