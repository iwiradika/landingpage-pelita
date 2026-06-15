'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { knowledgeBase } from '@/data/knowledgeBase';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  // const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Halo! Saya asisten AI PELITA yang dikembangkan berdasarkan Buku Panduan lengkap dari I Nyoman Indhi Wiradika, M.Pd., Prof. Dr. Samsul Hadi, M.Pd., M.T., dan Prof. Ir. Moh. Khairudin, S.Pd., S.T., M.T., Ph.D. Saya siap membantu Anda memahami platform PELITA, kerangka kompetensi digital, CDM-GDINA, dan semua aspek teknis maupun pedagogis. Apa yang ingin Anda ketahui?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-popup disabled - let users open chat manually
  // useEffect(() => {
  //   if (!hasAutoOpened) {
  //     const timer = setTimeout(() => {
  //       setIsOpen(true);
  //       setHasAutoOpened(true);
  //       
  //       // Tambahkan pesan welcome khusus untuk auto-popup
  //       setTimeout(() => {
  //         const welcomeMessage: Message = {
  //           id: 'welcome-auto',
  //           content: '👋 Hai! Saya melihat Anda sedang menjelajahi platform PELITA. Ada yang ingin Anda tanyakan? Saya siap membantu!',
  //           sender: 'ai',
  //           timestamp: new Date()
  //         };
  //         setMessages(prev => [...prev, welcomeMessage]);
  //       }, 1000);
  //     }, 5000);
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [hasAutoOpened]);

  const findBestMatch = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Exact matches
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerQuery.includes(key)) {
        return value;
      }
    }
    
    // Keyword matches
    if (lowerQuery.includes('pengembang') || lowerQuery.includes('pembuat') || lowerQuery.includes('author') || lowerQuery.includes('tim') || lowerQuery.includes('developer')) {
      return knowledgeBase["pengembang"];
    }
    if (lowerQuery.includes('kerangka') || lowerQuery.includes('framework') || lowerQuery.includes('dimensi') || lowerQuery.includes('kompetensi')) {
      return knowledgeBase["kerangka kompetensi"];
    }
    if (lowerQuery.includes('konten teknologi') || lowerQuery.includes('teknis') || lowerQuery.includes('teknologi informasi')) {
      return knowledgeBase["konten teknologi informasi"];
    }
    if (lowerQuery.includes('pedagogik') || lowerQuery.includes('pembelajaran') || lowerQuery.includes('mengajar')) {
      return knowledgeBase["pedagogik digital"];
    }
    if (lowerQuery.includes('profesionalisme') || lowerQuery.includes('etika') || lowerQuery.includes('reflektif')) {
      return knowledgeBase["profesionalisme digital"];
    }
    if (lowerQuery.includes('sosial') || lowerQuery.includes('kolaborasi') || lowerQuery.includes('komunikasi')) {
      return knowledgeBase["keterlibatan sosial digital"];
    }
    if (lowerQuery.includes('cdm') || lowerQuery.includes('cognitive') || lowerQuery.includes('diagnostik')) {
      return knowledgeBase["cognitive diagnostic model"];
    }
    if (lowerQuery.includes('gdina') || lowerQuery.includes('analisis') || lowerQuery.includes('model')) {
      return knowledgeBase["gdina"];
    }
    if (lowerQuery.includes('laporan') || lowerQuery.includes('hasil') || lowerQuery.includes('report')) {
      return knowledgeBase["laporan diagnostik"];
    }
    if (lowerQuery.includes('radar') || lowerQuery.includes('visualisasi') || lowerQuery.includes('grafik')) {
      return knowledgeBase["radar chart"];
    }
    if (lowerQuery.includes('fase') || lowerQuery.includes('proses') || lowerQuery.includes('langkah')) {
      return knowledgeBase["fase analisis"];
    }
    if (lowerQuery.includes('admin') || lowerQuery.includes('rater') || lowerQuery.includes('test-taker') || lowerQuery.includes('peran')) {
      return knowledgeBase["peran pengguna"];
    }
    if (lowerQuery.includes('validasi') || lowerQuery.includes('validator') || lowerQuery.includes('review')) {
      return knowledgeBase["validasi soal"];
    }
    if (lowerQuery.includes('rekomendasi') || lowerQuery.includes('saran') || lowerQuery.includes('pembelajaran')) {
      return knowledgeBase["rekomendasi pembelajaran"];
    }
    
    return "Maaf, saya belum memiliki informasi spesifik tentang pertanyaan Anda. Bisa Anda coba tanyakan tentang: pengembang PELITA, kerangka kompetensi, dimensi pedagogik digital, CDM-GDINA, laporan diagnostik, atau cara kerja sistem? Saya memiliki pengetahuan lengkap berdasarkan Buku Panduan PELITA.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = findBestMatch(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay 1-2 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!mounted) return null;

  const chatComponent = (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-14 h-14"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 999999,
            pointerEvents: 'auto'
          }}
        >
          {/* Pulse ring effect */}
          <div className="absolute inset-0 w-14 h-14 bg-blue-500/30 rounded-full animate-ping"></div>
          <div className="absolute inset-0 w-14 h-14 bg-blue-500/20 rounded-full animate-pulse"></div>
          
          <Button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
          >
            <MessageCircle className="h-6 w-6 text-white group-hover:animate-bounce" />
            
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="w-96 h-[500px] bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/50 flex flex-col relative overflow-hidden"
          style={{
            position: 'fixed',
            bottom: '6rem',
            right: '1.5rem',
            zIndex: 999999,
            pointerEvents: 'auto'
          }}
        >
          
          {/* Background glow effects */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-sm border-b border-slate-700/50 rounded-t-xl relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">PELITA Assistant</h3>
                <div className="text-xs text-emerald-400 flex items-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                  Online sekarang
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                  }`}>
                    {message.sender === 'user' ? 
                      <User className="h-4 w-4" /> : 
                      <Bot className="h-4 w-4" />
                    }
                  </div>
                  <div className={`rounded-xl p-3 shadow-lg backdrop-blur-sm border ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-white border-purple-500/30'
                      : 'bg-slate-800/80 text-gray-100 border-slate-600/50'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.sender === 'user' ? 'text-purple-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-xl p-3 shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-b-xl relative z-10">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tanyakan tentang PELITA..."
                  className="w-full px-4 py-3 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-sm text-white placeholder-gray-400 transition-all duration-200"
                  disabled={isTyping}
                />
                {/* Input glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-200 peer-focus:opacity-100 pointer-events-none"></div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white p-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-400 mt-3 text-center flex items-center justify-center space-x-2">
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Hasil chat ini mungkin tidak sepenuhnya tepat</span>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <span>Berdasarkan Panduan PELITA</span>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return typeof window !== 'undefined' 
    ? createPortal(chatComponent, document.body)
    : null;
}