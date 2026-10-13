import React from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[3000] p-5 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-primary text-primary-foreground p-5 rounded-t-xl flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold">Termos de Uso</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-sm text-foreground leading-relaxed space-y-4">
          <p className="font-semibold text-base">Bem-vindo ao ReputAí!</p>
          <p>Ao utilizar esta plataforma, você concorda com os seguintes termos:</p>

          <h3 className="font-semibold text-primary">1. Responsabilidade do Usuário</h3>
          <p>
            O usuário é <strong>inteiramente responsável</strong> por todo conteúdo que publicar na plataforma, incluindo avaliações, comentários e qualquer informação compartilhada. 
            O ReputAí não se responsabiliza por opiniões, avaliações ou conteúdos publicados pelos usuários.
          </p>

          <h3 className="font-semibold text-primary">2. Veracidade das Informações</h3>
          <p>
            O usuário compromete-se a fornecer informações verdadeiras e precisas em suas avaliações. 
            Avaliações falsas, difamatórias ou que violem direitos de terceiros poderão ser removidas e o usuário poderá ter sua conta suspensa.
          </p>

          <h3 className="font-semibold text-primary">3. Conteúdo Proibido</h3>
          <p>É expressamente proibido publicar conteúdo que:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contenha linguagem ofensiva, discriminatória ou de ódio</li>
            <li>Viole a privacidade de terceiros</li>
            <li>Constitua crime ou contravenção penal</li>
            <li>Contenha informações falsas ou enganosas</li>
            <li>Viole direitos autorais ou propriedade intelectual</li>
          </ul>

          <h3 className="font-semibold text-primary">4. Conformidade Legal</h3>
          <p>
            O ReputAí prioriza o respeito a <strong>todas as leis vigentes</strong> da República Federativa do Brasil, incluindo mas não limitado a:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</li>
            <li>Marco Civil da Internet (Lei nº 12.965/2014)</li>
            <li>Código de Defesa do Consumidor (Lei nº 8.078/1990)</li>
            <li>Código Civil Brasileiro</li>
          </ul>

          <h3 className="font-semibold text-primary">5. Moderação</h3>
          <p>
            A equipe do ReputAí reserva-se o direito de moderar, editar ou remover qualquer conteúdo que viole estes termos, 
            sem aviso prévio. Casos graves poderão resultar em banimento permanente da plataforma.
          </p>

          <h3 className="font-semibold text-primary">6. Dados Pessoais</h3>
          <p>
            Os dados pessoais fornecidos (CPF, data de nascimento, email) são utilizados exclusivamente para 
            garantir a autenticidade das avaliações e prevenir fraudes. Não compartilhamos seus dados com terceiros.
          </p>

          <h3 className="font-semibold text-primary">7. Alterações nos Termos</h3>
          <p>
            O ReputAí poderá alterar estes termos a qualquer momento, notificando os usuários sobre as mudanças. 
            O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
          </p>

          <div className="bg-secondary p-4 rounded-lg mt-4 border border-border">
            <p className="text-xs text-muted-foreground">
              Última atualização: Março de 2026. Ao marcar a caixa "Li e aceito os Termos de Uso", 
              você declara ter lido e concordado com todos os termos acima.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
