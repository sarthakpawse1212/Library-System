import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Library, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label.tsx';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({ title: 'Validation Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ username, password });
      toast({ title: 'Welcome back!', description: 'You have been logged in successfully.' });
      navigate('/books');
    } catch (err: any) {
      toast({ title: 'Login Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="gradient-hero hidden w-1/2 items-center justify-center lg:flex">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md px-8 text-primary-foreground"
        >
          <Library className="mb-6 h-16 w-16" />
          <h1 className="mb-4 text-4xl font-bold">LibraryMS</h1>
          <p className="text-lg opacity-80">
            A modern library management system. Organize, track, and manage your book collection effortlessly.
          </p>
          <div className="mt-8 rounded-lg bg-primary-foreground/10 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium">Demo Credentials</p>
            <p className="mt-1 text-xs opacity-80">Admin: admin / admin123</p>
            <p className="text-xs opacity-80">User: user / user123</p>
          </div>
        </motion.div>
      </div>

      <div className="flex w-full items-center justify-center bg-background px-4 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 text-center lg:hidden">
            <Library className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">LibraryMS</h1>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-foreground">Sign in</h2>
          <p className="mb-6 text-sm text-muted-foreground">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link>
          </p>

          <div className="mt-4 rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground lg:hidden">
            <p className="font-medium">Demo: admin / admin123 or user / user123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
