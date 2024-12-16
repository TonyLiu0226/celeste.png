'use server'
import { Ollama } from 'ollama'

export async function generateStory(story: string, systemPrompt: string) {
    try {
        const ollama = new Ollama({ host: 'http://localhost:11434' });
        console.log(systemPrompt);
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
        });
        return response;
    } catch (error) {
        throw new Error('Failed to generate story: ' + error);
    }
}