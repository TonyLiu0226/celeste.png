'use client'
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { FormEvent, useState, useEffect } from "react";
import { generateStory } from "./actions";
import { User } from "@supabase/supabase-js";

export default function HomePage() {
  const supabase = createClient();
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect("/sign-in");
      }
      setUser(user);
    };
    getUser();
  }, []);

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.target as HTMLFormElement);
    const story = formData.get('story')?.toString();
    if (!story) {
      setErrorMessage('Please enter a valid prompt');
      return;
    }
    const response = await generateStory(story);
    if (response instanceof Response) {
      setErrorMessage('');
    } else {
      setErrorMessage('Encountered an error trying to generate your story');
    }
  }

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="flex-1 w-full flex flex-col gap-4 max-w-5xl mx-auto py-8 px-4">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">
          Welcome {userName}
        </h1>
        <h2 className="text-2xl text-gray-600">
          Are you ready to create your next story?
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          name="story"
          placeholder="Start writing your story here..."
          className="w-full min-h-[200px] p-4 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <SubmitButton pendingText="Submitting story...">
          Submit Story
        </SubmitButton>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      </form>
    </div>
  );
}
