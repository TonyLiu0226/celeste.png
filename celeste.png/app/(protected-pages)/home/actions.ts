"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Book } from "../interfaces";

export const addBookAction = async (title: string, userId: string) => {
    const supabase = await createClient();
    const { error } = await supabase.from("Books").insert({ id: uuidv4(), "Title": title, "UserId": userId });
    if (error) {
        console.error("Error adding book:", error);
        return { error: "Failed to add book" };
    }
    return { success: "Book added" };
};

export const deleteBookAction = async (id: string) => {
    const supabase = await createClient();
    const { error } = await supabase.from("Books").delete().eq("id", id);
    if (error) {
        console.error("Error deleting book:", error);
        return { error: "Failed to delete book" };
    }
    return { success: "Book deleted" };
};

export const getAllBooks = async (userId: string): Promise<{ data: Book[], error: Error | null }> => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("Books").select("*").eq("UserId", userId).order('created_at', { ascending: false });
    if (error) {
        console.error("Error loading books:", error);
    }
    return { data: data as Book[], error: error };
};
