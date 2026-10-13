import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { AppToastProvider } from "@/contexts/ToastContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import Index from "./pages/Index";
import MapaPage from "./pages/Mapa";
import EmpresasPage from "./pages/Empresas";
import EmpresaDetailPage from "./pages/EmpresaDetail";
import AvaliacaoPage from "./pages/Avaliacao";
import PerfilPage from "./pages/Perfil";
import AdminPage from "./pages/Admin";
import ResetPasswordPage from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const ProtectedRoute = ({ children, onLoginRequired }: { children: JSX.Element; onLoginRequired: () => void }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      onLoginRequired();
      navigate('/', { replace: true, state: { from: location.pathname } });
    }
  }, [currentUser, loading, onLoginRequired, navigate, location.pathname]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  );
  if (!currentUser) return null;

  return children;
};

const App = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <AuthProvider>
      <AppToastProvider>
        <BrowserRouter>
          <Header onLoginClick={() => setAuthOpen(true)} />
          <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/mapa" element={<ProtectedRoute onLoginRequired={() => setAuthOpen(true)}><MapaPage /></ProtectedRoute>} />
              <Route path="/empresas" element={<ProtectedRoute onLoginRequired={() => setAuthOpen(true)}><EmpresasPage /></ProtectedRoute>} />
              <Route path="/empresa/:id" element={<EmpresaDetailPage />} />
              <Route path="/avaliacao" element={<ProtectedRoute onLoginRequired={() => setAuthOpen(true)}><AvaliacaoPage /></ProtectedRoute>} />
              <Route path="/perfil" element={<PerfilPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </AppToastProvider>
    </AuthProvider>
  );
};

export default App;
