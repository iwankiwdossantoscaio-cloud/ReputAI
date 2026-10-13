import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToastContext } from '@/contexts/ToastContext';
import { formatCPF, validateCPF, formatBirthDate, validateBirthDate } from '@/utils/cpfValidator';
import { lovable } from '@/integrations/lovable/index';
import TermsModal from '@/components/TermsModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = 'login' | 'register' | 'recover';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<ModalView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, register, resetPassword } = useAuth();
  const { showToast } = useToastContext();

  if (!isOpen) return null;

  const reset = () => {
    setEmail(''); setPassword(''); setName(''); setCpf(''); setBirthDate('');
    setRecoverEmail(''); setTermsAccepted(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        showToast('Erro ao entrar com Google', 'error');
      }
    } catch {
      showToast('Erro ao entrar com Google', 'error');
    }
    setGoogleLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { showToast('Preencha email e senha', 'error'); return; }
    const result = await login(email, password);
    if (result === true) { showToast('Login realizado com sucesso!', 'success'); onClose(); reset(); }
    else showToast(result || 'Email ou senha incorretos', 'error');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !cpf || !birthDate) {
      showToast('Preencha todos os campos obrigatórios', 'error'); return;
    }
    if (password.length < 8) { showToast('Senha deve ter no mínimo 8 caracteres, uma maiúscula e um número', 'error'); return; }
    if (!validateCPF(cpf)) { showToast('CPF inválido. Verifique os números.', 'error'); return; }
    if (!validateBirthDate(birthDate)) { showToast('Data de nascimento inválida (idade mínima: 16 anos)', 'error'); return; }
    if (!termsAccepted) { showToast('Você precisa aceitar os Termos de Uso', 'error'); return; }

    const cleanCpf = cpf.replace(/\D/g, '');
    const result = await register(name, email, password, cleanCpf, birthDate);
    if (result === true) { showToast(`Conta criada! Verifique seu email para confirmar.`, 'success'); onClose(); reset(); }
    else showToast(result, 'error');
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverEmail) { showToast('Informe seu email', 'error'); return; }
    const ok = await resetPassword(recoverEmail);
    if (ok) showToast('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');
    else showToast('Erro ao enviar email de recuperação', 'error');
  };

  const inputClass = "w-full px-3 py-3 border-2 border-input rounded-lg bg-background text-foreground focus:border-primary focus:outline-none transition-colors";

  return (
    <>
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-5 animate-fade-in" onClick={onClose}>
        <div className="bg-card rounded-xl w-full max-w-md overflow-hidden animate-slide-up shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="bg-primary text-primary-foreground p-6 text-center relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold">
              {view === 'login' ? 'Bem-vindo ao ReputAí' : view === 'register' ? 'Criar Conta' : 'Recuperar Senha'}
            </h2>
            <p className="text-sm opacity-90 mt-1">
              {view === 'login' ? 'Entre para avaliar empresas' : view === 'register' ? 'Preencha seus dados para se cadastrar' : 'Enviaremos um link de recuperação'}
            </p>
          </div>

          <div className="p-6 overflow-y-auto">
            {view === 'login' && (
              <div className="space-y-4">
                {/* Google login button */}
                <button onClick={handleGoogleLogin} disabled={googleLoading}
                  className="w-full py-3 border-2 border-input rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-secondary transition-colors text-foreground disabled:opacity-50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoading ? 'Conectando...' : 'Entrar com Google'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">ou</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Senha</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" className={inputClass} />
                  </div>
                  <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <LogIn className="w-4 h-4" /> Entrar
                  </button>
                  <div className="text-center text-sm text-muted-foreground mt-4 space-y-2">
                    <p>Não tem conta?{' '}<button type="button" onClick={() => setView('register')} className="text-primary font-medium hover:underline">Cadastre-se</button></p>
                    <p><button type="button" onClick={() => setView('recover')} className="text-primary font-medium hover:underline flex items-center gap-1 mx-auto"><KeyRound className="w-3 h-3" /> Esqueci minha senha</button></p>
                  </div>
                </form>
              </div>
            )}

            {view === 'register' && (
              <div className="space-y-4">
                <button onClick={handleGoogleLogin} disabled={googleLoading}
                  className="w-full py-3 border-2 border-input rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-secondary transition-colors text-foreground disabled:opacity-50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoading ? 'Conectando...' : 'Cadastrar com Google'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">ou preencha manualmente</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Nome Completo *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">CPF *</label>
                    <input type="text" value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} className={inputClass} />
                    <small className="text-xs text-muted-foreground">Usado para garantir uma conta por pessoa</small>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Data de Nascimento *</label>
                    <input type="text" value={birthDate} onChange={e => setBirthDate(formatBirthDate(e.target.value))} placeholder="DD/MM/AAAA" maxLength={10} className={inputClass} />
                    <small className="text-xs text-muted-foreground">Idade mínima: 16 anos</small>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Email *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Senha *</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} />
                  </div>

                  <div className="bg-secondary p-4 rounded-lg border border-border space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={e => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-primary"
                      />
                      <label htmlFor="terms" className="text-sm text-foreground leading-relaxed">
                        Li e aceito os{' '}
                        <button type="button" onClick={() => setShowTerms(true)} className="text-primary font-semibold hover:underline">
                          Termos de Uso
                        </button>
                        . Estou ciente de que sou inteiramente responsável pelo conteúdo que publicar nesta plataforma.
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <UserPlus className="w-4 h-4" /> Criar Conta
                  </button>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Já tem conta?{' '}<button type="button" onClick={() => setView('login')} className="text-primary font-medium hover:underline">Entre aqui</button>
                  </p>
                </form>
              </div>
            )}

            {view === 'recover' && (
              <form onSubmit={handleRecover} className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">Informe seu email para receber o link de recuperação:</p>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Email</label>
                  <input type="email" value={recoverEmail} onChange={e => setRecoverEmail(e.target.value)} placeholder="seu@email.com" className={inputClass} />
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <KeyRound className="w-4 h-4" /> Enviar Link de Recuperação
                </button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  <button type="button" onClick={() => { setView('login'); reset(); }} className="text-primary font-medium hover:underline flex items-center gap-1 mx-auto">
                    <ArrowLeft className="w-3 h-3" /> Voltar para login
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
