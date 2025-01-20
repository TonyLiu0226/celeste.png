'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { TrashIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { addBookAction, deleteBookAction, getAllBooks } from './actions';
import { Book } from '../interfaces';

const HomePage = () => {
    const { theme } = useTheme();
    const [user, setUser] = useState<User | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [newBookTitle, setNewBookTitle] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<string | null>(null);
    const [AddBookError, setAddBookError] = useState<string>("");
    const [DeleteBookError, setDeleteBookError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const booksPerPage = 10;
    const router = useRouter();
    const supabase = createClient();

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

    const loadBooks = async (page: number) => {
        if (!user?.id) return;
        
        setIsLoading(true);
        const { data, error } = await getAllBooks(user.id, page, booksPerPage);
        setIsLoading(false);

        if (error) {
            console.error("Error loading books:", error);
            setBooks([]);
            setTotalBooks(0);
            return;
        }

        setBooks(data.data);
        setTotalBooks(data.count);
    };

    useEffect(() => {
        loadBooks(currentPage);
    }, [user?.id, currentPage]);

    const handleAddBook = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAddBookError("");
        const userId = user?.id;
        if (!userId) {
            console.error("User ID is not available");
            return;
        }
        const { error } = await addBookAction(newBookTitle, userId);
        if (error) {
            console.error("Error adding book:", error);
            setAddBookError(error);
        } else {
            setNewBookTitle('');
            // Reload the current page after adding
            loadBooks(currentPage);
        }
    };

    const handleDeleteBook = async (id: string) => {
        const { error } = await deleteBookAction(id);
        if (error) {
            console.error("Error deleting book:", error);
            setDeleteBookError(error);
        } else {
            setShowModal(false);
            setBookToDelete(null);
            // If we're on a page with only one item and it's not the first page,
            // go to previous page after deletion
            if (books.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                // Otherwise, reload current page
                loadBooks(currentPage);
            }
        }
    };

    const openDeleteModal = (id: string) => {
        setDeleteBookError("");
        setBookToDelete(id);
        setShowModal(true);
    };
     const closeDeleteModal = () => {
        setShowModal(false);
        setBookToDelete(null);
    };
    useEffect(() => {
         const handleKeyPress = (event: KeyboardEvent) => {
            closeDeleteModal();
        };
         if (showModal) {
            document.addEventListener('keydown', handleKeyPress);
        } else {
            document.removeEventListener('keydown', handleKeyPress);
        }
         return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [showModal]);

    const totalPages = Math.ceil(totalBooks / booksPerPage);

    return (
    <div className="gap-4 max-w-screen-xl mx-auto py-8 px-4">
        <div className="space-y-4">
            <h1 className="text-4xl font-bold">
                Welcome {user?.email}
            </h1>
            <h2 className="text-2xl text-gray-600">
                Are you ready to create your next story?
            </h2>
        </div>
        <div className='flex flex-row w-full justify-center items-center'>
            {/* Left Side: List of Books */}
            <div className="flex-[0_0_60%] p-2.5">
                <h2 className='text-xl font-bold text-center py-10'>My books</h2>
                {isLoading ? (
                    <div className="text-center">Loading...</div>
                ) : books.length === 0 ? (
                    <p className="text-center text-gray-500">
                        No books found. Add a new book to get started.
                    </p>
                ) : (
                    <>
                        {books.map(book => (
                            <div key={book.id} 
                                className="flex justify-between items-center border border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => router.push(`/book/${book.id}`)}
                            >
                                <div className="flex flex-col">
                                 <h3 className="text-lg font-semibold">{book.Title}</h3>
                                 <h4 className="text-sm text-gray-500">created at: {new Date(book.created_at).toLocaleString('en-US', {
                                     year: 'numeric',
                                     month: '2-digit', 
                                     day: '2-digit',
                                     hour: '2-digit',
                                     minute: '2-digit',
                                     second: '2-digit',
                                     hour12: false
                                 }).replace(',','')}</h4>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent navigation when clicking delete
                                        openDeleteModal(book.id);
                                    }} 
                                    className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        
                        {/* Pagination controls */}
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    currentPage === 1 
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                                        : 'bg-amber-700 text-white hover:bg-amber-800 active:bg-amber-900'
                                }`}
                            >
                                Previous
                            </button>
                            
                            <span className="mx-4 font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    currentPage === totalPages 
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                                        : 'bg-amber-700 text-white hover:bg-amber-800 active:bg-amber-900'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Right Side: Add Book Form */}
            <div className="flex-[0_0_40%] p-2.5 self-start">
                <h1 className="text-2xl font-bold text-center py-10">Add a new book</h1>
                <form onSubmit={handleAddBook} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={newBookTitle}
                        onChange={(e) => setNewBookTitle(e.target.value)}
                        placeholder="Enter book title"
                        required
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Add Book
                    </button>
                    {AddBookError && <p className="text-red-500">{AddBookError}</p>}
                </form>
            </div>
             {/* Delete Confirmation Modal */}
           {showModal && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                   <div className={`${
                       theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                   } p-6 rounded-lg shadow-xl max-w-sm w-full mx-4`}>
                       <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                       <p className="mb-6">Are you sure you want to delete this book?</p>
                       <div className="flex justify-end gap-4">
                           <button 
                               onClick={() => handleDeleteBook(bookToDelete as string)} 
                               className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 active:bg-red-800 transition-colors"
                           >
                               Delete
                           </button>
                           <button 
                               onClick={closeDeleteModal}
                               className="px-4 py-2 bg-amber-700 text-white rounded-md font-medium hover:bg-amber-800 active:bg-amber-900 transition-colors"
                           >
                               Cancel
                           </button>
                       </div>
                       {DeleteBookError && (
                           <p className="mt-4 text-red-500 text-center">{DeleteBookError}</p>
                       )}
                   </div>
               </div>
           )}
        </div>
    </div>
    );
};

export default HomePage;
