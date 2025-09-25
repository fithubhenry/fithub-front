'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatProps {
  className?: string;
}

const Chat: React.FC<ChatProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy el asistente de FitHub. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (userMessage: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await res.json();
      return data.reply;
    } catch (error) {
      console.error('Error sending message:', error);
      return 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botReply = await sendMessage(userMessage.text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un problema al procesar tu mensaje.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-[#fee600] hover:bg-[#fee600] text-black rounded-full p-3 sm:p-4 shadow-lg transition-all duration-300 z-[9999]"
        aria-label="Abrir chat"
      >
        <MessageCircle size={20} className="sm:w-6 sm:h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-white rounded-lg shadow-2xl border border-black w-[calc(100vw-2rem)] sm:w-96 h-[60vh] sm:h-[500px] flex flex-col z-[9999] max-w-sm ${className}`}>
      {/* Header */}
      <div className="bg-[#fee600] text-black p-2 sm:p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Bot size={16} className="sm:w-5 sm:h-5" />
          <h3 className="font-semibold text-sm sm:text-base">Asistente FitHub</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-black rounded-full p-1 transition-colors"
          aria-label="Cerrar chat"
        >
          <X size={16} className="sm:w-[18px] sm:h-[18px] hover:text-white" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                message.isUser
                  ? 'bg-[#fee600] text-black rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <div className="flex items-start space-x-1 sm:space-x-2">
                {!message.isUser && (
                  <Bot size={14} className="sm:w-4 sm:h-4 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${
                    message.isUser ? 'text-black' : 'text-black'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.isUser && (
                  <User size={14} className="sm:w-4 sm:h-4 mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-2 sm:p-3 rounded-lg rounded-bl-none max-w-[85%] sm:max-w-[80%]">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Bot size={14} className="sm:w-4 sm:h-4" />
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-2 sm:p-4 border-t border-gray-200">
        <div className="flex space-x-1 sm:space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-[#fee600] focus:border-transparent text-sm sm:text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="bg-[#fee600] hover:bg-[#fcd200] disabled:bg-black disabled:text-white disabled:cursor-not-allowed text-black rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 transition-colors"
            aria-label="Enviar mensaje"
          >
            <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;