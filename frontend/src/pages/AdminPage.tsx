import { useState, useEffect } from 'react';
import { bookService } from '@/services/api';
import { Book } from '@/types';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label.tsx';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  publishedYear: string;
}

const emptyForm: BookFormData = { title: '', author: '', isbn: '', category: '', description: '', publishedYear: '' };

const AdminPage = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    try {
      setBooks(await bookService.getBooks());
    } catch {
      toast({ title: 'Error', description: 'Failed to load books.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditingBook(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({ title: book.title, author: book.author, isbn: book.isbn, category: book.category, description: book.description || '', publishedYear: String(book.publishedYear || '') });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim() || !form.category.trim()) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const bookData = {
        title: form.title, author: form.author, isbn: form.isbn, category: form.category,
        description: form.description, publishedYear: form.publishedYear ? parseInt(form.publishedYear) : undefined,
        status: 'available' as const,
      };
      if (editingBook) {
        const updated = await bookService.updateBook(editingBook.id, bookData);
        setBooks(prev => prev.map(b => b.id === editingBook.id ? updated : b));
        toast({ title: 'Book Updated', description: `"${updated.title}" has been updated.` });
      } else {
        const newBook = await bookService.addBook(bookData);
        setBooks(prev => [...prev, newBook]);
        toast({ title: 'Book Added', description: `"${newBook.title}" has been added.` });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to save book.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (book: Book) => {
    try {
      await bookService.deleteBook(book.id);
      setBooks(prev => prev.filter(b => b.id !== book.id));
      toast({ title: 'Book Deleted', description: `"${book.title}" has been removed.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete book.', variant: 'destructive' });
    }
  };

  const updateField = (field: keyof BookFormData, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection title="Admin Panel" subtitle="Manage your library collection — add, edit, and remove books" />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">All Books ({books.length})</h2>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Book
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {books.map(book => (
                    <motion.tr
                      key={book.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell className="text-muted-foreground">{book.author}</TableCell>
                      <TableCell><Badge variant="outline">{book.category}</Badge></TableCell>
                      <TableCell>
                        <Badge className={book.status === 'available' ? 'bg-success text-success-foreground' : ''} variant={book.status === 'available' ? 'default' : 'secondary'}>
                          {book.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(book)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(book)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => updateField('title', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Author *</Label>
              <Input value={form.author} onChange={e => updateField('author', e.target.value)} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ISBN *</Label>
                <Input value={form.isbn} onChange={e => updateField('isbn', e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Year</Label>
                <Input type="number" value={form.publishedYear} onChange={e => updateField('publishedYear', e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Category *</Label>
              <Input value={form.category} onChange={e => updateField('category', e.target.value)} placeholder="e.g. Fiction, Technology" className="mt-1.5" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => updateField('description', e.target.value)} className="mt-1.5" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingBook ? 'Update' : 'Add Book'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
