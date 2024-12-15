import React from 'react';
import { useTheme } from 'next-themes';

const Notebook = ({ text }: { text: string }) => {
    const { theme } = useTheme();
  return (
    <div 
      className="bg-brown-200 rounded-lg shadow-lg p-6"
    >
        <p className="text-2xl font-bold p-4">Story Output</p>
        {theme === 'dark' ? (
            <div 
                className="bg-[url('https://transparenttextures.com/patterns/notebook-dark.png')] text-gray-400 border border-yellow-900 border-8 rounded-md p-4 shadow-md overflow-y-scroll"
                style={{ backgroundSize: '75px 125px', minHeight: '250px', maxHeight: '500px', height: 'fit-content', maxWidth: '100%' }}
            >
                <div className="whitespace-pre-wrap break-words font-sans">
                    {text}
                </div>
            </div>
        ) : (
            <div 
                className="bg-[url('https://transparenttextures.com/patterns/notebook.png')] text-gray-800 border border-yellow-900 border-8 rounded-md p-4 shadow-md overflow-y-scroll"
                style={{ backgroundSize: '75px 125px', minHeight: '250px', maxHeight: '500px', height: 'fit-content', maxWidth: '100%' }}
            >
                <div className="whitespace-pre-wrap break-words font-sans">
                    {text}
                </div>
            </div>
        )}
    </div>
  );
};

export default Notebook;