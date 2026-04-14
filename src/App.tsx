import { useAuth } from '@/contexts/AuthContext';
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./contexts/AuthContext";
import { InventoryProvider } from "./contexts/InventoryContext";

// 🔥 Nouveau composant interne
function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Chargement...
      </div>
    );
  }

  return <AppRoutes />;
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
function AuthWrapper() {
  const { user } = useAuth();

  return (
    <InventoryProvider key={user?.id || 'no-user'}>
      <AppContent />
    </InventoryProvider>
  );
}

export default App;
