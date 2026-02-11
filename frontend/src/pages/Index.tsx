import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/books' : '/login'} replace />;
};

export default Index;
