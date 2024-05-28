import { FacebookTokens, GoogleTokens, SpotifyTokens } from 'arctic';
import { z } from 'zod';

import { FacebookUser } from './providers/facebook';
import { GoogleUser } from './providers/google';
import { SpotifyUser } from './providers/spotify';

export type OAuthProvider = z.infer<ReturnType<typeof zOAuthProvider>>;
export const zOAuthProvider = () => z.enum(['google', 'facebook', 'spotify']);

type OAuthCode = {
  code: string;
};
type OAuthCodeWithVerifier = OAuthCode & {
  codeVerifier: string;
};

type OAuthProviderData = {
  google: {
    tokens: GoogleTokens;
    user: GoogleUser;
    verificationCode: OAuthCodeWithVerifier;
  };
  facebook: {
    tokens: FacebookTokens;
    user: FacebookUser;
    verificationCode: OAuthCode;
  };
  spotify: {
    tokens: SpotifyTokens;
    user: SpotifyUser;
    verificationCode: OAuthCode;
  };
};

type ProviderToken<TProvider extends OAuthProvider> =
  OAuthProviderData[TProvider]['tokens'];

type ProviderUser<TProvider extends OAuthProvider> =
  OAuthProviderData[TProvider]['user'];

type ProviderCode<TProvider extends OAuthProvider> =
  OAuthProviderData[TProvider]['verificationCode'];

export type { ProviderToken, ProviderUser, ProviderCode };
