import { motion } from 'framer-motion';
import { Book } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRightLeft } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onToggleBorrow: (id: string) => void;
  index: number;
}

const BookCard: React.FC<BookCardProps> = ({ book, onToggleBorrow, index }) => {
  const { user } = useAuth();
  const isAvailable = book.status === 'available';
  const isBorrowedByMe = book.borrowedBy === user?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="glass-card overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 rounded-md bg-muted p-2">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <Badge
            variant={isAvailable ? 'default' : 'secondary'}
            className={isAvailable ? 'bg-success text-success-foreground' : ''}
          >
            {isAvailable ? 'Available' : 'Borrowed'}
          </Badge>
        </div>

        <h3 className="mb-1 font-semibold leading-tight text-foreground">{book.title}</h3>
        <p className="mb-2 text-sm text-muted-foreground">{book.author}</p>

        {book.description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{book.description}</p>
        )}

        <div className="mb-4 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">{book.category}</Badge>
          {book.publishedYear && (
            <Badge variant="outline" className="text-xs">{book.publishedYear}</Badge>
          )}
        </div>

        <Button
          size="sm"
          variant={isAvailable ? 'default' : 'outline'}
          className="w-full gap-2"
          onClick={() => onToggleBorrow(book.id)}
          disabled={!isAvailable && !isBorrowedByMe}
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          {isAvailable ? 'Borrow' : isBorrowedByMe ? 'Return' : 'Unavailable'}
        </Button>
      </div>
    </motion.div>
  );
};

export default BookCard;
