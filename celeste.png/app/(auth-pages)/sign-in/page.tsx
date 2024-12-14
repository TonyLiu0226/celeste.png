'use client'
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React, {useState} from 'react';
import { useSearchParams } from 'next/navigation';

export default function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const result = await signInAction(formData);
    event.preventDefault();
    setValidationError(null);

      if (result.error) {
        setValidationError(result.error);
      }
    }

  return (
    <form onSubmit={handleSignIn} className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
        {validationError && (
            <div className="text-red-500 text-sm mt-2">{validationError}</div>
          )}
        <FormMessage message={props.searchParams} />
      </div>
    </form>
  );
}
