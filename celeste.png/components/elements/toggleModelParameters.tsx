// components/AdvancedMode.tsx
import { useState } from 'react';

export interface GenerationParameters {
  top_k: number;
  top_p: number;
  min_p: number;
  temperature: number;
  repeat_penalty: number;
}

interface ToggleModelParametersProps {
  parameters: GenerationParameters;
  setParameters: (parameters: GenerationParameters) => void;
}

const defaultParameters: GenerationParameters = {
  top_k: 0,
  top_p: 1,
  min_p: 0.1,
  temperature: 0.7,
  repeat_penalty: 1.08
};

export default function ToggleModelParameters({ parameters, setParameters }: ToggleModelParametersProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="top_k" className="text-sm font-medium text-gray-700">
            Top K: {parameters.top_k}
          </label>
          <span className="text-xs text-gray-500">Range: 0-1</span>
        </div>
        <input
          type="range"
          id="top_k"
          min="0"
          max="1"
          step="0.01"
          value={parameters.top_k}
          onChange={(e) => setParameters({...parameters, top_k: parseFloat(e.target.value)})}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="top_p" className="text-sm font-medium text-gray-700">
            Top P: {parameters.top_p}
          </label>
          <span className="text-xs text-gray-500">Range: 0-1</span>
        </div>
        <input
          type="range"
          id="top_p"
          min="0"
          max="1"
          step="0.01"
          value={parameters.top_p}
          onChange={(e) => setParameters({...parameters, top_p: parseFloat(e.target.value)})}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="min_p" className="text-sm font-medium text-gray-700">
            Min P: {parameters.min_p}
          </label>
          <span className="text-xs text-gray-500">Range: 0-1</span>
        </div>
        <input
          type="range"
          id="min_p"
          min="0"
          max="1"
          step="0.01"
          value={parameters.min_p}
          onChange={(e) => setParameters({...parameters, min_p: parseFloat(e.target.value)})}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="temperature" className="text-sm font-medium text-gray-700">
            Temperature: {parameters.temperature}
          </label>
          <span className="text-xs text-gray-500">Range: 0-2</span>
        </div>
        <input
          type="range"
          id="temperature"
          min="0"
          max="2"
          step="0.01"
          value={parameters.temperature}
          onChange={(e) => setParameters({...parameters, temperature: parseFloat(e.target.value)})}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="repeat_penalty" className="text-sm font-medium text-gray-700">
            Repeat Penalty: {parameters.repeat_penalty}
          </label>
          <span className="text-xs text-gray-500">Range: 0-10</span>
        </div>
        <input
          type="range"
          id="repeat_penalty"
          min="0"
          max="10"
          step="0.01"
          value={parameters.repeat_penalty}
          onChange={(e) => setParameters({...parameters, repeat_penalty: parseFloat(e.target.value)})}
          className="w-full"
        />
      </div>

      <button
        type="button"
        onClick={() => setParameters(defaultParameters)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Reset to Defaults
      </button>
    </div>
  );
}

export { defaultParameters };