import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { classifyQuestion } from '../../lib/classifyQuestion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length * 0.75);
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreWarning, setShowPreWarning] = useState(false);
  const [warningRemaining, setWarningRemaining] = useState(0);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { session, user, subscription } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setShowPreWarning(false);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const token = session?.access_token;

      if (!token) {
        throw new Error('Você precisa estar logado para usar o chat');
      }

      const isSubscribed = subscription && subscription.subscription_status === 'active';

      if (!isSubscribed && user?.id) {
        const category = classifyQuestion(userMessage);
        const tokens = estimateTokens(userMessage);
        const isBulario = category === 'bulario';

        const checkResponse = await fetch(`${supabaseUrl}/functions/v1/increment-tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            tokens,
            category,
            question_preview: userMessage,
          }),
        });

        const usage = await checkResponse.json();

        if (!isBulario && !usage.allowed) {
          setShowBlockModal(true);
          setMessages(prev => prev.slice(0, -1));
          setLoading(false);
          return;
        }

        if (!isBulario && usage.remaining < 100) {
          setShowPreWarning(true);
          setWarningRemaining(usage.remaining);
        }

        if (typeof window !== 'undefined' && (window as any).updateHeaderTokenCounter) {
          (window as any).updateHeaderTokenCounter(usage.remaining);
        }

        window.dispatchEvent(new CustomEvent('tervis:tokens:update', { detail: usage.remaining }));
      }

      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar mensagem');
      }

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Erro ao enviar mensagem');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Card className="flex flex-col h-[600px] relative">
      {showBlockModal && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md text-center shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-r from-[#0EA5E9] to-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Limite diário atingido</h3>
            <p className="text-sm text-gray-600 mb-4">
              Você atingiu seu limite diário gratuito de 1000 tokens. Para continuar usando o TERVIS.AI sem interrupções:
            </p>
            <ul className="text-sm text-gray-700 mb-6 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Acesso ilimitado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> IA mais rápida
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Prioridade nas análises
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Experiência premium
              </li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  (window as any).navigateToPlans?.();
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0EA5E9] to-[#22C55E] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Assinar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-tervis rounded-xl flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">TERVIS.AI</h3>
          <p className="text-sm text-gray-500">Assistente de Saúde Inteligente</p>
        </div>
      </div>

      {showPreWarning && (
        <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900 mb-1">
                Atenção - restam apenas {warningRemaining} tokens hoje
              </p>
              <p className="text-xs text-orange-800">
                Você pode fazer esta última pergunta, mas em breve seu limite diário gratuito será atingido.
                Assine o TERVIS.AI para desbloquear uso ilimitado, respostas mais rápidas e prioridade no processamento.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Olá! Sou TERVIS.AI</p>
            <p className="text-sm">
              Como posso ajudar você hoje?
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-tervis-blue'
                  : 'bg-gradient-tervis'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-tervis-blue text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-tervis flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
            rows={1}
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="lg"
            className="px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          TERVIS.AI adapta suas respostas ao seu perfil. Não substitui consulta médica.
        </p>
      </div>
    </Card>
  );
}
