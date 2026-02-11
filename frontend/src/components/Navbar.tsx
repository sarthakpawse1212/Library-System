import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, LogOut, Shield, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <Library className="h-6 w-6" />
          <span className="text-lg font-bold tracking-tight">LibraryMS</span>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-1">
            <Link to="/books">
              <Button
                variant={isActive('/books') ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Books
              </Button>
            </Link>

            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant={isActive('/admin') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            )}

            <div className="ml-4 flex items-center gap-3 border-l border-border pl-4">
              <div className="text-right">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
