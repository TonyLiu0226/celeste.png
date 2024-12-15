'use server'
export async function generateStory(story: string) {
    try {
        const data = await fetch('http://localhost:11434', {
            method: 'POST',
            body: story,
        });
        const response = await data.json();
        return response;
    } catch (error) {
        return {error: error};
    }
  }