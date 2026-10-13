import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Building2, Star, User, LogOut, Crown, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import ThemeToggle from '@/components/ThemeToggle';

interface HeaderProps {
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { notifications } = useCompanies();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const navLinks = [
    { to: '/', label: 'Início', icon: Home, protected: false },
    { to: '/mapa', label: 'Mapa', icon: Map, protected: true },
    { to: '/empresas', label: 'Empresas', icon: Building2, protected: true },
    { to: '/avaliacao', label: 'Avaliar', icon: Star, protected: true },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  const handleProtectedNavigation = (isProtected: boolean, onDone?: () => void) => (event: React.MouseEvent) => {
    if (isProtected && !currentUser) {
      event.preventDefault();
      onDone?.();
      onLoginClick();
    }
  };

  return (
    <header className={`fixed top-0 w-full z-[1000] bg-card border-b border-border transition-all duration-300 ${scrolled ? 'py-2 shadow-lg' : 'py-4 shadow-md'}`}>
      <div className="container mx-auto px-5">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className={`bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold transition-all ${scrolled ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-2xl'}`}>R</div>
            <div>
              <h1 className={`font-bold text-foreground transition-all ${scrolled ? 'text-lg' : 'text-xl'}`}>ReputAí</h1>
              <span className={`text-muted-foreground transition-all ${scrolled ? 'text-xs' : 'text-sm'}`}>Avaliações reais de empresas</span>
            </div>
          </Link>

          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <nav className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={handleProtectedNavigation(link.protected)}
                    className={`notranslate flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.to) ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'}`}
                    translate="no"
                  >
                    <link.icon className="w-4 h-4" /><span translate="no">{link.label}</span>
                  </Link>
                </li>
              ))}
              {isAdmin && unreadCount > 0 && (
                <li>
                  <Link to="/admin" className="relative p-2 text-foreground hover:bg-secondary rounded-lg">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  </Link>
                </li>
              )}
              <li><ThemeToggle /></li>
              <li>
                {currentUser ? (
                  <div ref={menuRef} className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white border-2 transition-all hover:scale-105 ${isAdmin ? 'bg-gradient-to-br from-destructive to-red-700 border-red-300' : 'bg-gradient-to-br from-primary to-blue-700 border-border'}`}
                      title={currentUser.name}>
                      {currentUser.avatar}
                    </button>
                    {menuOpen && (
                      <div className="absolute top-12 right-0 bg-card rounded-lg shadow-xl border border-border min-w-[250px] animate-fade-in overflow-hidden">
                        <div className="p-4 bg-secondary border-b border-border">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isAdmin ? 'bg-gradient-to-br from-destructive to-red-700' : 'bg-gradient-to-br from-primary to-blue-700'}`}>
                              {currentUser.avatar}
                            </div>
                            <div>
                              <strong className="text-foreground text-sm">{currentUser.name} {isAdmin && '👑'}</strong>
                              <p className="text-muted-foreground text-xs">{currentUser.email}</p>
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors border-b border-border" onClick={() => setMenuOpen(false)}>
                            <Crown className="w-4 h-4 text-warning" /> Painel Admin
                            {unreadCount > 0 && <span className="ml-auto bg-destructive text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                          </Link>
                        )}
                        <Link to="/perfil" className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors border-b border-border" onClick={() => setMenuOpen(false)}>
                          <User className="w-4 h-4" /> Meu Perfil
                        </Link>
                        <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-secondary transition-colors">
                          <LogOut className="w-4 h-4" /> Sair
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={onLoginClick} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
                    <User className="w-4 h-4" /> Entrar
                  </button>
                )}
              </li>
            </ul>
          </nav>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
            <ul className="flex flex-col gap-2">
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={handleProtectedNavigation(link.protected, closeMobileMenu)}
                    className={`notranslate flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(link.to) ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'}`}
                    translate="no"
                  >
                    <link.icon className="w-4 h-4" /><span translate="no">{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                {currentUser ? (
                  <div className="space-y-2 mt-2">
                    <div className="px-4 py-2 flex justify-center">
                      <ThemeToggle />
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-foreground hover:bg-secondary">
                        <Crown className="w-4 h-4 text-warning" /> Painel Admin
                      </Link>
                    )}
                    <Link to="/perfil" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-foreground hover:bg-secondary">
                      <User className="w-4 h-4" /> Meu Perfil
                    </Link>
                    <button onClick={() => { logout(); closeMobileMenu(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-secondary">
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    <div className="px-4 py-2 flex justify-center"><ThemeToggle /></div>
                    <button onClick={() => { onLoginClick(); closeMobileMenu(); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold mt-2">
                      <User className="w-4 h-4" /> Entrar
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
