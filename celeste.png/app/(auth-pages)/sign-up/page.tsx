'use client';
import { signUpAction } from "@/app/(auth-pages)/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { useState } from "react";
import { useSearchParams } from 'next/navigation';


export default function Signup(props: {
  searchParams: Message;
}) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    event.preventDefault();
    setValidationError(null);
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+$/;
    if (!passwordRegex.test(password)) {
      setValidationError('Password must have at least one uppercase, one lowercase, and one number');
      return;
    }

    // If validation passes, submit the form
    const resut = await signUpAction(formData);
    if (resut.error) {
      setValidationError(resut.error);
    }
  };

  if (message) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={{message}} />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input 
            name="email" 
            placeholder="you@example.com" 
            required 
            type="email"
          />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={8}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            Sign up
          </SubmitButton>
          {validationError && (
            <div className="text-red-500 text-sm mt-2">{validationError}</div>
          )}
          <FormMessage message={props.searchParams} />
        </div>
      </form>
      <SmtpMessage />
    </>
  );
}