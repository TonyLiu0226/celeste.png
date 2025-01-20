"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Book } from "../interfaces";

export interface PaginatedResponse<T> {
    data: T[];
    count: number;
}

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

export const getAllBooks = async (
    userId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<{ data: PaginatedResponse<Book>, error: Error | null }> => {
    const supabase = await createClient();
    
    // Calculate range for pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // Get total count
    const { count, error: countError } = await supabase
        .from("Books")
        .select('*', { count: 'exact', head: true })
        .eq("UserId", userId);

    if (countError) {
        console.error("Error getting count:", countError);
        return { data: { data: [], count: 0 }, error: countError };
    }

    // Get paginated data
    const { data, error } = await supabase
        .from("Books")
        .select("*")
        .eq("UserId", userId)
        .order('created_at', { ascending: false })
        .range(start, end);

    if (error) {
        console.error("Error loading books:", error);
        return { data: { data: [], count: 0 }, error };
    }

    return { 
        data: { 
            data: data as Book[], 
            count: count || 0 
        }, 
        error: null 
    };
};
