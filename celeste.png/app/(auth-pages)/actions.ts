"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();

  if (!email || !password) {
    return {
      error: "Email and password are required"
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  console.log(data);
  if (!(data.user && data.session)) {
    throw new Error('Error creating user');
  }
  if (error) {
    console.log(error.code + " " + error.message);
    return {
      error: error.message
    };
  }
    return encodedRedirect(
      "success",
      "/sign-in",
      "Check your email for a verification link.",
    );
  };

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {error: error.message};
  }

  return redirect("/protected");
};