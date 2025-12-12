import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { AIChat } from './AIChat';
import { useAuth } from '../../hooks/useAuth';

interface ChatBubbleProps {
  onLoginRequired: () => void;
}

export function ChatBubble({ onLoginRequired }: ChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const handleClick = () => {
    if (!user) {
      onLoginRequired();
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isOpen && user && (
        <div className="fixed bottom-24 right-6 w-[400px] shadow-2xl rounded-2xl overflow-hidden z-50">
          <AIChat />
        </div>
      )}

      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50"
      >
        {isOpen && user ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
        )}
      </button>
    </>
  );
}
