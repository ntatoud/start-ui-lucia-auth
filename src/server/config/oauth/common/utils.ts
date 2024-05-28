import { TRPCError } from '@trpc/server';
import { cookies } from 'next/headers';

import { env } from '@/env.mjs';

export const STATE_COOKIE_NAME = 'state';
export const CODE_COOKIE_NAME = 'code_verifier';

type ValidateOAuthRequestOptions = {
  // Name of the state parameter in the query string
  stateParam?: string;
  // Name of the code parameter in the query string
  codeParam?: string;
};
export async function baseValidateOAuthRequest(
  searchParams: Record<string, string>,
  opts?: ValidateOAuthRequestOptions
): Promise<{ code: string }> {
  const { stateParam, codeParam } = opts ?? {};

  const code = searchParams[codeParam ?? 'code'];
  const state = searchParams[stateParam ?? 'state'];
  const savedState = cookies().get(STATE_COOKIE_NAME)?.value;

  if (!code || !state || !savedState) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid request',
    });
  }

  if (savedState !== state) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid state',
    });
  }

  return { code };
}

export async function baseValidateOAuthRequestWithVerifier(
  searchParams: Record<string, string>,
  opts?: ValidateOAuthRequestOptions
): Promise<{ code: string; codeVerifier: string }> {
  const { code } = await baseValidateOAuthRequest(searchParams, opts);

  const codeVerifier = cookies().get(CODE_COOKIE_NAME)?.value;

  if (!codeVerifier) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing code verifier',
    });
  }
  return { code, codeVerifier };
}

export function createOAuthProviderCookies(
  state: string,
  codeVerifier?: string
) {
  cookies().set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
  });

  if (codeVerifier) {
    cookies().set(CODE_COOKIE_NAME, codeVerifier, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
    });
  }
}

export function clearOAuthProviderCookies() {
  cookies().delete(CODE_COOKIE_NAME);
  cookies().delete(STATE_COOKIE_NAME);
}
