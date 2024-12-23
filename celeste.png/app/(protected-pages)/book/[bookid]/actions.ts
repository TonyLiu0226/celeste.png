'use server'
import { Ollama } from 'ollama'
import { GenerationParameters } from '@/components/elements/toggleModelParameters';

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
        return response;
    } catch (error) {
        throw new Error('Failed to generate story: ' + error);
    }
}