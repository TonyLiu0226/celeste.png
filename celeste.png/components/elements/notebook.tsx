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
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBookContent(children.NotebookChapter);
  }, [children]);

  // Function to measure and split text into pages
  const splitContentIntoPages = () => {
    if (!measureRef.current) return;

    const pages: any[] = [];
    let currentChapter = null;
    const chapters = children.NotebookChapter;
    
    chapters.forEach(chapter => {
      const words = chapter.text.split(' ');
      let currentPage = '';
      let isFirstPageOfChapter = true;

      // Create a temporary div for measurement
      const tempDiv = document.createElement('div');
      tempDiv.style.width = `${measureRef.current ? measureRef.current.clientWidth : 0}px`;
      tempDiv.style.height = '700px'; // Fixed height
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.fontSize = '1.125rem'; // text-lg
      tempDiv.style.lineHeight = '1.75rem'; // leading-relaxed
      document.body.appendChild(tempDiv);

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testContent = currentPage ? currentPage + ' ' + word : word;
        
        // Create content with chapter heading if it's the first page
        let fullContent = '';
        if (isFirstPageOfChapter) {
          fullContent = `
            <div style="margin-bottom: 1.5rem;">
              <h2 style="font-size: 1.5rem; text-align: center; margin-bottom: 0.5rem;">
                Chapter ${chapter.chapter}
              </h2>
              <h3 style="font-size: 1.25rem; text-align: center; margin-bottom: 1.5rem;">
                ${chapter.title}
              </h3>
              <div style="width: 6rem; height: 1px; background: #000; margin: 0 auto 2rem;"></div>
            </div>
            ${testContent}
          `;
        } else {
          fullContent = testContent;
        }

        tempDiv.innerHTML = fullContent;

        // Check if content fits
        if (tempDiv.scrollHeight > 700) {
          pages.push({
            text: currentPage,
            chapter: chapter.chapter,
            title: chapter.title,
            isChapterStart: isFirstPageOfChapter
          });
          currentPage = word;
          isFirstPageOfChapter = false;
        } else {
          currentPage = testContent;
        }
      }

      // Add remaining content as the last page
      if (currentPage) {
        pages.push({
          text: currentPage,
          chapter: chapter.chapter,
          title: chapter.title,
          isChapterStart: isFirstPageOfChapter
        });
      }

      document.body.removeChild(tempDiv);
    });

    setBookContent(pages);
  };

  useEffect(() => {
    splitContentIntoPages();
    window.addEventListener('resize', splitContentIntoPages);
    return () => window.removeEventListener('resize', splitContentIntoPages);
  }, []);

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
    }
  };

  const PageContent = ({ page }: { page: any }) => (
    <>
      {page.isChapterStart && (
        <div className="mb-6">
          <h2 className="text-2xl font-serif text-center text-amber-900 mb-2">
            Chapter {page.chapter}
          </h2>
          <h3 className="text-xl font-serif text-center text-amber-800 italic mb-6">
            {page.title}
          </h3>
          <div className="w-24 h-[1px] bg-amber-900 mx-auto mb-8"></div>
        </div>
      )}
      <p className="mb-4">
        {page.text}
      </p>
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
          <div className={`relative ${theme === 'dark' ? 'bg-black' : 'bg-white'} mx-16 my-6 p-8 rounded shadow-inner overflow-y-scroll`}>
            {/* Current page */}
            <div 
              ref={measureRef}
              className={`transition-transform duration-300 ${
                isAnimating && animationDirection === 'next' ? '-translate-x-full' : 
                isAnimating && animationDirection === 'prev' ? 'translate-x-full' : ''
              }`}
            >
              <div className="text-center text-sm text-gray-500 mb-4">
                <div>Page {currentPage + 1} of {bookContent.length}</div>
              </div>
              
              <div className="font-serif text-lg leading-relaxed h-[750px]">
                {bookContent.length > 0 && <PageContent page={bookContent[currentPage]} />}
              </div>
            </div>

            {/* Next/Previous page preview */}
            {isAnimating && bookContent.length > 0 && (
              <div 
                className={`absolute top-0 left-0 right-0 bottom-0 p-8
                  ${animationDirection === 'next' ? 'animate-slide-from-right' : 'animate-slide-from-left'}`}
              >
                <div className="text-center text-sm text-gray-500 mb-4">
                  <div>Page {
                    animationDirection === 'next' ? 
                      Math.min(currentPage + 2, bookContent.length) : 
                      Math.max(currentPage, 1)
                  } of {bookContent.length}</div>
                </div>
                
                <div className="font-serif text-lg leading-relaxed h-[750px]">
                  <PageContent 
                    page={bookContent[                      animationDirection === 'next' ?                         Math.min(currentPage + 1, bookContent.length - 1) :                         Math.max(currentPage - 1, 0)                    ]} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent rounded-b-lg 
                        flex items-center justify-center z-20">
            <div className="w-48 h-[1px] bg-transparent"></div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center items-center gap-8 mt-6">
          <button
            onClick={() => turnPage('prev')}
            disabled={currentPage === 0 || isAnimating}
            className={`p-3 rounded-full transition-all ${
              currentPage === 0 || isAnimating
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-amber-900 hover:bg-amber-900 hover:text-white'
            }`}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => turnPage('next')}
            disabled={currentPage === bookContent.length - 1 || isAnimating}
            className={`p-3 rounded-full transition-all ${
              currentPage === bookContent.length - 1 || isAnimating
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-amber-900 hover:bg-amber-900 hover:text-white'
            }`}
          >
            <ChevronRight size={24} />
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