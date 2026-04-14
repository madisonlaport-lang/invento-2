import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuth();

  // ✅ On attend proprement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Chargement...
      </div>
    );
  }

  // 🔐 Si pas connecté → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Sinon on affiche
  return <>{children}</>;
}
