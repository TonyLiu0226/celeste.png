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
    const [showModal, setShowModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<string | null>(null);
    const [AddBookError, setAddBookError] = useState<string>("");
    const [DeleteBookError, setDeleteBookError] = useState<string>("");     

    const booksPerPage = 10;
    console.log(books);

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

    const loadBooks = async () => {
        if (!user?.id) {
            return;
        }
        const { data, error } = await getAllBooks(user?.id);
        if (error) {
            console.error("Error loading books:", error);
            setBooks([]);
        }
        setBooks(data);
    };

    //initial load books from database
    useEffect(() => {
        loadBooks();
    }, [user?.id]);

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
        }
        loadBooks();
    };

    const handleDeleteBook = async (id: string) => {
        const { error } = await deleteBookAction(id);
        if (error) {
            console.error("Error deleting book:", error);
            setDeleteBookError(error);
        }
        else {
            setShowModal(false);
            setBookToDelete(null);
            loadBooks();
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

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                {currentBooks.length === 0 && (
                    <p className="text-center text-gray-500">No books found. Add a new book to get started.</p>
                )}
               {currentBooks.length > 0 && currentBooks.map(book => (
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
               <div className="flex justify-center mt-4">
                   {Array.from({ length: Math.ceil(books.length / booksPerPage) }, (_, i) => (
                       <button key={i} onClick={() => paginate(i + 1)} className="mx-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                           {i + 1}
                       </button>
                   ))}
               </div>
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
               <div style={{
                   position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                   backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
               }}>
                   <div className={`bg-white p-5 rounded-md ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
                       <h2>Confirm Deletion</h2>
                       <p>Are you sure you want to delete this book?</p>
                       <button onClick={() => handleDeleteBook(bookToDelete as string)} className="mr-2">Yes</button>
                       <button onClick={closeDeleteModal}>No</button>
                       {DeleteBookError && <p className="text-red-500">{DeleteBookError}</p>}
                   </div>
               </div>
           )}
        </div>
    </div>
    );
};

export default HomePage;
