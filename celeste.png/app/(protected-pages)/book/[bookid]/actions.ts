'use server'
import { Ollama } from 'ollama'
import { GenerationParameters } from '@/components/elements/toggleModelParameters';
import { createClient } from "@/utils/supabase/server";
import { NotebookChapter } from "../../interfaces";

export async function generateStory(story: string, systemPrompt: string, parameters: GenerationParameters) {
    try {
        const ollama = new Ollama({ host: 'http://localhost:11434' });
        const response = await ollama.chat({
            model: 'vanilj/mistral-nemo-12b-celeste-v1.9',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: story,
                }
            ],
            format: 'string',
            stream: true,
            options: {
                top_k: parameters.top_k,
                top_p: parameters.top_p,
                frequency_penalty: parameters.min_p,
                temperature: parameters.temperature,
                repeat_penalty: parameters.repeat_penalty,
            }
        });
        
        if (!response) {
            throw new Error('No response from model');
        }
        return response;
    } catch (error) {
        console.error('Generation error:', error);
        // Re-throw the error so it can be caught by the client
        throw error;
    }
}

export interface ChapterSegment {
    text: string;
    sequenceNo: number;
}

export interface Chapter {
    chapterNo: number;
    title: string;
    segments: ChapterSegment[];
}

export async function fetchBookSegments(bookId: string) {
    const supabase = await createClient();
    const { data: segments, error } = await supabase
        .from('Segments')
        .select('*')
        .eq('BookId', bookId)
        .order('ChapterNo', { ascending: true })
        .order('SequenceNo', { ascending: true });

    if (error) {
        console.error('Error fetching segments:', error);
        return { error: error.message };
    }

    if (segments && segments.length > 0) {
        // Group segments by chapter
        const chaptersMap = new Map<number, Chapter>();
        
        segments.forEach(segment => {
            if (!chaptersMap.has(segment.ChapterNo)) {
                chaptersMap.set(segment.ChapterNo, {
                    chapterNo: segment.ChapterNo,
                    title: segment.Title,
                    segments: []
                });
            }
            
            chaptersMap.get(segment.ChapterNo)?.segments.push({
                text: segment.Text,
                sequenceNo: segment.SequenceNo
            });
        });

        // Convert map to array and sort by chapter number
        const chapters = Array.from(chaptersMap.values());
        return { data: chapters };
    }

    return { data: [] };
}

export async function saveSegment(
    bookId: string, 
    text: string, 
    chapterNo: number,
    sequenceNo: number, 
    userId: string,
    title: string
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('Segments')
        .insert({
            BookId: bookId,
            Title: title,
            Text: text,
            ChapterNo: chapterNo,
            SequenceNo: sequenceNo,
            UserId: userId
        });

    if (error) {
        console.error('Error saving segment:', error);
        return { error: error.message };
    }

    return { success: true };
}