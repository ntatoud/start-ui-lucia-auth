'use client';

import { redirect, useParams, useSearchParams } from 'next/navigation';
import { stringify } from 'superjson';

import { LoaderFull } from '@/components/LoaderFull';
import { trpc } from '@/lib/trpc/client';
import { OAuthProvider } from '@/server/config/oauth/types';

export default function PageOauth() {
  const { provider } = useParams<{ provider: OAuthProvider }>();

  const searchParams = useSearchParams();

  const searchParamsObject = Object.fromEntries(searchParams);
  const { data } = trpc.oauth.validateLogin.useQuery({
    provider: provider,
    searchParams: stringify(searchParamsObject),
  });

  if (data) {
    redirect('/app');
  }

  return <LoaderFull />;
}
