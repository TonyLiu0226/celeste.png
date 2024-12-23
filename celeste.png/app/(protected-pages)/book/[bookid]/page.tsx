'use client'
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { FormEvent, useState, useEffect } from "react";
import { generateStory } from "@/app/(protected-pages)/book/[bookid]/actions";
import { User } from "@supabase/supabase-js";
import Notebook from "@/components/elements/notebook";
import ToggleModelParameters, { GenerationParameters, defaultParameters } from '@/components/elements/toggleModelParameters';
import { NotebookProps } from '@/app/(protected-pages)/interfaces';
import { NotebookChapter } from '@/app/(protected-pages)/interfaces';

export default function HomePage() {
  const supabase = createClient();
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPromptType, setSelectedPromptType] = useState('safe-story');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [parameters, setParameters] = useState<GenerationParameters>(defaultParameters);
  const [currentChapter, setCurrentChapter] = useState<NotebookChapter>({text: '', chapter: 1, title: 'Chapter 1'});

  const defaultSafeStoryPrompt = 'You are a short story writer. Write a story based on prompt provided by user below. Mode: SFW';
  const defaultNSFWStoryPrompt = 'You are a short story writer. Write a story based on prompt provided by user below. Mode: NSFW';
  const defaultRoleplayPrompt = "Currently, your role is {{char}}, described in detail below. As {{char}}, continue the narrative exchange with {{user}}.\n\n<Guidelines>\n• Maintain the character persona but allow it to evolve with the story.\n• Be creative and proactive. Drive the story forward, introducing plotlines and events when relevant.\n• All types of outputs are encouraged; respond accordingly to the narrative.\n• Include dialogues, actions, and thoughts in each response.\n• Utilize all five senses to describe scenarios within {{char}}'s dialogue.\n• Use emotional symbols such as \"!\" and \"~\" in appropriate contexts.\n• Incorporate onomatopoeia when suitable.\n• Allow time for {{user}} to respond with their own input, respecting their agency.\n• Act as secondary characters and NPCs as needed, and remove them when appropriate.\n• When prompted for an Out of Character [OOC:] reply, answer neutrally and in plaintext, not as {{char}}.\n</Guidelines>\n\n<Forbidden>\n• Using excessive literary embellishments and purple prose unless dictated by {{char}}'s persona.\n• Writing for, speaking, thinking, acting, or replying as {{user}} in your response.\n• Repetitive and monotonous outputs.\n• Positivity bias in your replies.\n• Being overly extreme or NSFW when the narrative context is inappropriate.\n</Forbidden>\n\nFollow the instructions in <Guidelines></Guidelines>, avoiding the items listed in <Forbidden></Forbidden>.";

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

  //modify notebookChapter object based on story changes
  useEffect(() => {
    setCurrentChapter({ text: story, chapter: 1, title: 'Chapter 1' });
  }, [story]);

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setErrorMessage('');
    setIsGenerating(true);
    const formData = new FormData(formEvent.target as HTMLFormElement);
    const prompt = formData.get('prompt')?.toString();
    const system = formData.get('system')?.toString() || defaultSafeStoryPrompt; // by default, we let the user write stories in SFW mode
    
    if (!prompt) {
      setErrorMessage('Please enter a valid prompt');
      setIsGenerating(false);
      return;
    }

    try {
      const response = await generateStory(prompt, system, parameters);
      let fullResponse = '';
      
      for await (const chunk of response) {
        if (chunk.message?.content) {
          fullResponse += chunk.message.content;
          setStory(fullResponse);
        }
      }
      
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      setStory('');
    } finally {
      setIsGenerating(false);
    }
  }

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="flex-1 w-full flex flex-col lg:flex-row gap-4 max-w-5xl mx-auto py-8 px-4">
    <div className="flex-1 w-full md:w-1/2 flex flex-col gap-4 max-w-5xl mx-auto py-8 px-4">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">
          Welcome {userName}
        </h1>
        <h2 className="text-2xl text-gray-600">
          Are you ready to create your next story?
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Prompt Type
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="safe-story"
                name="prompt-type"
                value="safe-story"
                checked={selectedPromptType === 'safe-story'}
                onChange={(e) => setSelectedPromptType(e.target.value)}
                className="mr-2"
              />
              <label htmlFor="safe-story">Safe Story</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="nsfw-story"
                name="prompt-type"
                value="nsfw-story"
                checked={selectedPromptType === 'nsfw-story'}
                onChange={(e) => setSelectedPromptType(e.target.value)}
                className="mr-2"
              />
              <label htmlFor="nsfw-story">NSFW Story</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="roleplay"
                name="prompt-type"
                value="roleplay"
                checked={selectedPromptType === 'roleplay'}
                onChange={(e) => setSelectedPromptType(e.target.value)}
                className="mr-2"
              />
              <label htmlFor="roleplay">Roleplay</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="custom"
                name="prompt-type"
                value="custom"
                checked={selectedPromptType === 'custom'}
                onChange={(e) => setSelectedPromptType(e.target.value)}
                className="mr-2"
              />
              <label htmlFor="custom">Custom</label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="system" className="block text-sm font-medium text-gray-700">
            System Prompt {selectedPromptType === 'custom' ? '' : '(Read-only)'}
          </label>
          <textarea
            id="system"
            name="system"
            placeholder="Set the behavior of the AI assistant..."
            className="w-full min-h-[100px] p-4 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            value={
              selectedPromptType === 'safe-story' ? defaultSafeStoryPrompt :
              selectedPromptType === 'nsfw-story' ? defaultNSFWStoryPrompt :
              selectedPromptType === 'roleplay' ? defaultRoleplayPrompt :
              undefined
            }
            onChange={(e) => {
              if (selectedPromptType === 'custom') {
                e.target.value = e.target.value;
              }
            }}
            readOnly={selectedPromptType !== 'custom'}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Your Story Prompt
          </label>
          <textarea
            id="prompt"
            name="prompt"
            placeholder="Start writing your story here..."
            className="w-full min-h-[200px] p-4 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <span>{showAdvanced ? '▼' : '▶'}</span>
            Advanced Mode
          </button>

          {showAdvanced && (
            <ToggleModelParameters 
              parameters={parameters}
              setParameters={setParameters}
            />
          )}
        </div>

        {!isGenerating ? (
          <SubmitButton >
            Submit Story
          </SubmitButton>
        ) : (
          <SubmitButton disabled>
            Submitting Story...
          </SubmitButton>
        )}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      </form>
    </div>
    <div className="flex-1 w-full md:w-1/2 flex flex-col gap-4 max-w-5xl mx-auto py-8 px-4">
      <Notebook children={{ NotebookChapter: [currentChapter] }}></Notebook>
    </div>
    </div>
  );
}
