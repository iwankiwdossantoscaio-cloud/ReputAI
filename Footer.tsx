import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const quickLinks = [
  { to: '/', label: 'Início', protected: false },
  { to: '/mapa', label: 'Mapa', protected: true },
  { to: '/empresas', label: 'Empresas', protected: true },
  { to: '/avaliacao', label: 'Avaliar', protected: true },
];

const Footer: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg">R</div>
              <h3 className="text-xl font-bold">ReputAí</h3>
            </div>
            <p className="text-sm opacity-70">Avaliações reais de empresas brasileiras</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm opacity-70">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  {link.protected && !currentUser ? (
                    <span className="notranslate cursor-not-allowed transition-opacity" translate="no">{link.label}</span>
                  ) : (
                    <Link to={link.to} className="notranslate hover:opacity-100 transition-opacity" translate="no">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <p className="flex items-center gap-2 text-sm opacity-70">
              <Mail className="w-4 h-4" /> contato@reputai.com.br
            </p>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-white/20 text-sm opacity-60">
          <p>© 2026 ReputAí. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
