import { SpotifyTokens } from 'arctic';
import { generateId } from 'lucia';

import { SpotifyUser } from '@/server/config/oauth/providers/spotify/schemas';
import { AppContext } from '@/server/config/trpc';

export const saveSpotifyUser = async ({
  ctx,
  spotifyUser,
  tokens: { accessToken, refreshToken, accessTokenExpiresAt },
}: {
  ctx: AppContext;
  spotifyUser: SpotifyUser;
  tokens: SpotifyTokens;
}): Promise<{ userId: string }> => {
  const existingUser = await ctx.db.user.findFirst({
    where: {
      email: spotifyUser.email,
    },
    select: {
      id: true,
      oauth: {
        where: {
          providerId: 'Spotify',
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
          email: spotifyUser.email,
          profilePictureUrl: spotifyUser.images[0]?.url,
          name: spotifyUser.display_name,
          accountStatus: 'ENABLED',
        },
      });

      await tx.oAuthAccount.create({
        data: {
          userId,
          providerId: 'spotify',
          providerUserId: spotifyUser.id,
          accessToken,
          refreshToken,
          expiresAt: accessTokenExpiresAt,
        },
      });

      return userId;
    });
  } else if (!existingUser.oauth.length) {
    // If the user exists but does not have a Spotify account linked; add it
    userId = existingUser.id;

    await ctx.db.oAuthAccount.create({
      data: {
        userId: existingUser.id,
        providerId: 'spotify',
        providerUserId: spotifyUser.id,
        accessToken,
        expiresAt: accessTokenExpiresAt,
      },
      select: {
        userId: true,
      },
    });
  } else {
    // If the user exists and is linked to a Spotify account; update it
    userId = existingUser.id;

    await ctx.db.oAuthAccount.update({
      where: {
        providerId_providerUserId: {
          providerId: 'spotify',
          providerUserId: spotifyUser.id,
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
