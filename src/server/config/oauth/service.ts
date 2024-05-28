import { TRPCError } from '@trpc/server';
import { GoogleTokens, generateCodeVerifier, generateState } from 'arctic';
import ky from 'ky';

import {
  baseValidateOAuthRequest,
  baseValidateOAuthRequestWithVerifier,
  createOAuthProviderCookies,
} from '@/server/config/oauth/common/utils';
import {
  FacebookUser,
  facebook,
  saveFacebookUser,
  zFacebookUser,
} from '@/server/config/oauth/providers/facebook';
import {
  GoogleUser,
  google,
  saveGoogleUser,
  zGoogleUser,
} from '@/server/config/oauth/providers/google';
import {
  OAuthProvider,
  ProviderCode,
  ProviderToken,
  ProviderUser,
} from '@/server/config/oauth/types';
import { AppContext } from '@/server/config/trpc';

export const createAuthorizationURL = async <TProvider extends OAuthProvider>({
  provider,
}: {
  provider: TProvider;
}): Promise<{ url: string }> => {
  const state = generateState();
  switch (provider) {
    case 'facebook':
      createOAuthProviderCookies(state);

      const facebookUrl = await facebook.createAuthorizationURL(state, {
        scopes: ['email', 'public_profile'],
      });
      return {
        url: facebookUrl.toString(),
      };

    case 'google':
      const codeVerifier = generateCodeVerifier();
      createOAuthProviderCookies(state, codeVerifier);
      const googleUrl = await google.createAuthorizationURL(
        state,
        codeVerifier,
        {
          scopes: ['email', 'profile'],
        }
      );
      return {
        url: googleUrl.toString(),
      };

    default:
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid provider',
      });
  }
};

export const valideOAuthRequest = <TProvider extends OAuthProvider>({
  provider,
  searchParams,
}: {
  provider: TProvider;
  searchParams: Record<string, string>;
}): Promise<ProviderCode<TProvider>> => {
  switch (provider) {
    case 'google':
      const error = searchParams['error'];
      if (error && error === 'access_denied') {
        throw new TRPCError({
          code: 'CLIENT_CLOSED_REQUEST',
          message: 'The user cancel the authentication',
        });
      }
      return baseValidateOAuthRequestWithVerifier(searchParams);

    case 'facebook':
      return baseValidateOAuthRequest(searchParams);

    default:
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid provider',
      });
  }
};

export const validateAuthenticationCode = <TProvider extends OAuthProvider>({
  provider,
  verifier,
}: {
  provider: TProvider;
  verifier: ProviderCode<TProvider>;
}): Promise<ProviderToken<TProvider>> => {
  switch (provider) {
    case 'facebook':
      const facebookVerifier = verifier as ProviderCode<'facebook'>;
      return facebook.validateAuthorizationCode(facebookVerifier.code);

    case 'google':
      const googleVerifier = verifier as ProviderCode<'google'>;
      return google.validateAuthorizationCode(
        googleVerifier.code,
        googleVerifier.codeVerifier
      );

    default:
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid provider',
      });
  }
};

export const fetchUserData = async <TProvider extends OAuthProvider>({
  provider,
  accessToken,
}: {
  provider: TProvider;
  accessToken: string;
}): Promise<ProviderUser<TProvider>> => {
  switch (provider) {
    case 'facebook':
      const facebookUserResponse = await ky
        .get(
          `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`
        )
        .json();

      return zFacebookUser().parse(facebookUserResponse);

    case 'google':
      const googleUserResponse = await ky
        .get('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .json();

      return zGoogleUser().parse(googleUserResponse);

    default:
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid provider',
      });
  }
};

export const saveUser = <TProvider extends OAuthProvider>({
  ctx,
  provider,
  providerUser,
  tokens,
}: {
  ctx: AppContext;
  provider: TProvider;
  providerUser: ProviderUser<TProvider>;
  tokens: ProviderToken<TProvider>;
}): Promise<{ userId: string }> => {
  switch (provider) {
    case 'facebook':
      return saveFacebookUser({
        ctx,
        facebookUser: providerUser as FacebookUser,
        tokens,
      });

    case 'google':
      return saveGoogleUser({
        ctx,
        googleUser: providerUser as GoogleUser,
        tokens: tokens as GoogleTokens,
      });

    default:
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid provider',
      });
  }
};
