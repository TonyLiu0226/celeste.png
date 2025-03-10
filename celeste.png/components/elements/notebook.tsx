import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { NotebookProps } from '@/app/(protected-pages)/interfaces';

export default function Notebook({ children }: { children: NotebookProps }) {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('');
  const [bookContent, setBookContent] = useState(children.NotebookChapter);

  useEffect(() => {
    setBookContent(children.NotebookChapter);
  }, [children]);

  const turnPage = (direction: string) => {
    if (isAnimating) return;
    
    if (direction === 'next' && currentPage < bookContent.length - 1) {
      setIsAnimating(true);
      setAnimationDirection('next');
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsAnimating(false);
      }, 300);
    } else if (direction === 'prev' && currentPage > 0) {
      setIsAnimating(true);
      setAnimationDirection('prev');
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsAnimating(false);
      }, 300);
    } else if (direction === 'first') {
      setIsAnimating(true);
      setAnimationDirection('prev');
      setTimeout(() => {
        setCurrentPage(0);
        setIsAnimating(false);
      }, 300);
    } else if (direction === 'last') {
      setIsAnimating(true);
      setAnimationDirection('next');
      setTimeout(() => {
        setCurrentPage(bookContent.length - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const PageContent = ({ page }: { page: any }) => (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-center text-amber-900 mb-2">
          Chapter {page.chapter}
        </h2>
        <h3 className="text-xl font-serif text-center text-amber-800 italic mb-6">
          {page.title}
        </h3>
        <div className="w-24 h-[1px] bg-amber-900 mx-auto mb-8"></div>
      </div>
      <div className="mb-4 whitespace-pre-wrap">
        {page.text}
      </div>
    </>
  );

  const randomColors = ['bg-green-50', 'bg-green-600', 'bg-purple-100', 'bg-purple-500', 'bg-pink-100', 'bg-pink-500', 'bg-red-100', 'bg-red-500'];

  return (
    <div className="flex items-center justify-center min-h-[900px] p-0 bg-amber-50">
      <div className="relative max-w-2xl w-full flex flex-col">
        <div className="relative bg-leather-brown rounded-lg shadow-2xl overflow-hidden">
          {/* Top border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-900 rounded-t-lg 
                        flex items-center justify-center z-20">
            <div className="w-48 h-[1px] bg-golden-accent"></div>
          </div>

          {/* Book binding */}
          <div className={`absolute left-[4%] top-0 bottom-0 w-3 ${randomColors[Math.floor(Math.random() * randomColors.length)]} z-20`}></div>
          
          {/* Content area */}
          <div className={`relative ${theme === 'dark' ? 'bg-black' : 'bg-white'} mx-16 my-6 p-8 rounded shadow-inner`}>
            {/* Page number */}
            <div className="text-center text-sm text-gray-500 mb-4">
              <div>Page {currentPage + 1} of {bookContent.length}</div>
            </div>
            
            {/* Content with scroll */}
            <div className="font-serif text-lg leading-relaxed h-[700px] overflow-y-auto">
              {bookContent.length > 0 && (
                <div className={`transition-transform duration-300 ${
                  isAnimating && animationDirection === 'next' ? '-translate-x-full' : 
                  isAnimating && animationDirection === 'prev' ? 'translate-x-full' : ''
                }`}>
                  <PageContent page={bookContent[currentPage]} />
                </div>
              )}
            </div>
          </div>

          {/* Bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent rounded-b-lg 
                        flex items-center justify-center z-20">
            <div className="w-48 h-[1px] bg-transparent"></div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => turnPage('first')}
            disabled={currentPage === 0 || isAnimating}
            className="p-2 rounded-full bg-amber-800 text-white hover:bg-amber-700 disabled:opacity-40 disabled:bg-amber-800 disabled:cursor-not-allowed flex items-center"
            title="First Page"
          >
            <ChevronLeft className="w-6 h-6" />
            <ChevronLeft className="w-6 h-6 -ml-4" />
          </button>
          <button
            onClick={() => turnPage('prev')}
            disabled={currentPage === 0 || isAnimating}
            className="p-2 rounded-full bg-amber-800 text-white hover:bg-amber-700 disabled:opacity-40 disabled:bg-amber-800 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => turnPage('next')}
            disabled={currentPage === bookContent.length - 1 || isAnimating}
            className="p-2 rounded-full bg-amber-800 text-white hover:bg-amber-700 disabled:opacity-40 disabled:bg-amber-800 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={() => turnPage('last')}
            disabled={currentPage === bookContent.length - 1 || isAnimating}
            className="p-2 rounded-full bg-amber-800 text-white hover:bg-amber-700 disabled:opacity-40 disabled:bg-amber-800 disabled:cursor-not-allowed flex items-center"
            title="Last Page"
          >
            <ChevronRight className="w-6 h-6" />
            <ChevronRight className="w-6 h-6 -ml-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Add custom styles to the style tag
const style = document.createElement('style');
style.textContent = `
  .bg-leather-brown {
    background-color: #8B4513;
    background-image: linear-gradient(45deg, #8B4513 25%, #A0522D 25%, #A0522D 50%, #8B4513 50%, #8B4513 75%, #A0522D 75%, #A0522D 100%);
    background-size: 10px 10px;
  }
  .bg-golden-accent {
    background-color: #D4AF37;
  }
  
  @keyframes slideFromRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  @keyframes slideFromLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  .animate-slide-from-right {
    animation: slideFromRight 0.3s ease-out forwards;
  }
  
  .animate-slide-from-left {
    animation: slideFromLeft 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);