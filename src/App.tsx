import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./contexts/AuthContext";
import { InventoryProvider } from "./contexts/InventoryContext";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_ID;
    if (!gaId || !window.gtag) return;

    window.gtag('config', gaId, {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
}

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Chargement...
      </div>
    );
  }

  return (
    <>
      <PageTracker />
      <AppRoutes />
    </>
  );
}

function AuthWrapper() {
  const { user } = useAuth();

  return (
    <InventoryProvider key={user?.id || 'no-user'}>
      <AppContent />
    </InventoryProvider>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <AuthProvider>
          <AuthWrapper />
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
