import { FacebookTokens } from 'arctic';
import { generateId } from 'lucia';

import { FacebookUser } from '@/server/config/oauth/providers/facebook/schemas';
import { AppContext } from '@/server/config/trpc';

export const saveFacebookUser = async ({
  ctx,
  facebookUser,
  tokens: { accessToken, accessTokenExpiresAt },
}: {
  ctx: AppContext;
  facebookUser: FacebookUser;
  tokens: FacebookTokens;
}): Promise<{ userId: string }> => {
  const existingUser = await ctx.db.user.findFirst({
    where: {
      email: facebookUser.email,
    },
    select: {
      id: true,
      oauth: {
        where: {
          providerId: 'facebook',
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
          email: facebookUser.email,
          profilePictureUrl: facebookUser.picture.data.url,
          name: facebookUser.name,
          accountStatus: 'ENABLED',
        },
      });

      await tx.oAuthAccount.create({
        data: {
          userId,
          providerId: 'facebook',
          providerUserId: facebookUser.id,
          accessToken,
          expiresAt: accessTokenExpiresAt,
        },
      });

      return userId;
    });
  } else if (!existingUser.oauth.length) {
    // If the user exists but does not have a facebook account linked; add it
    userId = existingUser.id;

    await ctx.db.oAuthAccount.create({
      data: {
        userId: existingUser.id,
        providerId: 'facebook',
        providerUserId: facebookUser.id,
        accessToken,
        expiresAt: accessTokenExpiresAt,
      },
      select: {
        userId: true,
      },
    });

    return { userId };
  } else {
    // If the user exists and is linked to a facebook account; update it
    userId = existingUser.id;

    await ctx.db.oAuthAccount.update({
      where: {
        providerId_providerUserId: {
          providerId: 'facebook',
          providerUserId: facebookUser.id,
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
