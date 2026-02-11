import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bookService } from '@/services/api';
import { Book } from '@/types';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import SearchFilter from '@/components/SearchFilter';
import BookCard from '@/components/BookCard';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const BooksPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await bookService.getBooks();
      setBooks(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load books.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => [...new Set(books.map(b => b.category))], [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = !searchQuery ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [books, searchQuery, statusFilter, categoryFilter]);

  const handleToggleBorrow = async (bookId: string) => {
    if (!user) return;

    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const nextStatus =
      book.status === 'available' ? 'borrowed' : 'available';

    try {

      const updated = await bookService.toggleBorrow(
      bookId,
      nextStatus,
      user.id
    );

      //const updated = await bookService.toggleBorrow(bookId, user.id);
      setBooks(prev => prev.map(b => b.id === bookId ? updated : b));
      toast({
        title: updated.status === 'borrowed' ? 'Book Borrowed' : 'Book Returned',
        description: `"${updated.title}" has been ${updated.status === 'borrowed' ? 'borrowed' : 'returned'}.`,
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to update book status.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection
        title="Browse Library"
        subtitle="Discover and borrow books from our curated collection"
        bookCount={books.length}
      />
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      <div className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-20 text-muted-foreground"
          >
            <BookOpen className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No books found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book, i) => (
              <BookCard key={book.id} book={book} onToggleBorrow={handleToggleBorrow} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksPage;
