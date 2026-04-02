'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React, { useState } from 'react';
import { ArrowRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError('Invalid email or password.');
      setIsLoading(false);
      return;
    }

    if (!result?.url) {
      setError('Failed to sign in. Please try again.');
      setIsLoading(false);
      return;
    }

    router.push(result?.url || callbackUrl);
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-16 pt-14 sm:px-6 lg:px-8">
      <div className="apple-surface apple-card-shadow rounded-[32px] border border-white/10 p-8 sm:p-10">
        <p className="apple-caption mb-2">Account</p>
        <h1 className="apple-title text-4xl font-semibold">Welcome Back</h1>
        <p className="mt-3 text-muted-foreground">Sign in to sync your game library across devices.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-muted-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-11"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-muted-foreground">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-11"
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full rounded-full" size="lg" disabled={isLoading}>
            <LogIn className="mr-2 h-4 w-4" />
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-6 text-sm text-muted-foreground">
          No account yet?{' '}
          <Link href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-medium text-foreground">
            Create one
          </Link>
          .
        </div>

        <Link
          href={callbackUrl}
          className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          Continue without sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
