import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Clock, 
  Bed, 
  Utensils, 
  CreditCard, 
  Wrench, 
  Shield, 
  Minimize2, 
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';

export default function HostelAssistantWidget({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with personalized welcome message
  useEffect(() => {
    if (currentUser) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `👋 Hi **${currentUser.name || 'Resident'}**! I am your **SmartHostel AI Assistant**.\n\nI have access to your live hostel records (room assignment, fee invoices, active complaints) and official campus regulations. How can I help you today?`,
          source: 'SmartHostel Campus Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const quickPrompts = [
    { label: 'Curfew & Quiet Hours', text: 'What are the hostel curfew and quiet hours?' },
    { label: 'My Room & Roommates', text: 'Who are my roommates and what is my room number?' },
    { label: 'Mess Schedule & Meals', text: 'What are the daily mess timings and leave policies?' },
    { label: 'Fee Dues & Invoices', text: 'Do I have any pending fee invoices or dues?' },
    { label: 'How to File Complaints', text: 'How do I submit an urgent maintenance complaint?' },
    { label: 'Visitor Pass Policy', text: 'What is the visitor policy and how do digital passes work?' },
  ];

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Build lightweight conversation history
      const history = messages.slice(-5).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await api.post('/assistant/chat', {
        message: text,
        history
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.data.reply,
        source: res.data.source || 'SmartHostel Campus Engine',
        model: res.data.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: '⚠️ I encountered an error connecting to the campus assistant service. Please check your network or try again in a moment.',
          source: 'System Error',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `Chat cleared. Hi **${currentUser?.name}**, what else would you like to know?`,
        source: 'SmartHostel Campus Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper function to format basic markdown (bold, lists, emojis)
  const renderFormattedText = (rawText) => {
    const paragraphs = rawText.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      const lines = para.split('\n');
      return (
        <div key={pIdx} className="space-y-1 mb-2 last:mb-0">
          {lines.map((line, lIdx) => {
            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
            const cleanLine = isBullet ? line.replace(/^[-•]\s*/, '') : line;

            // Simple parser for **bold** text
            const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
            const formattedContent = parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
              }
              return part;
            });

            if (isBullet) {
              return (
                <div key={lIdx} className="flex items-start space-x-2 pl-2">
                  <span className="text-indigo-400 mt-1 text-[10px]">•</span>
                  <span className="flex-1 leading-relaxed">{formattedContent}</span>
                </div>
              );
            }

            return <p key={lIdx} className="leading-relaxed">{formattedContent}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* ========================================================
          1. FLOATING ACTION TRIGGER BUTTON
      ======================================================== */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center space-x-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white p-3 sm:px-4 sm:py-3 rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-400/30 backdrop-blur-md"
          title="Open SmartHostel AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black tracking-wide leading-tight">AI Assistant</p>
            <p className="text-[10px] text-indigo-100 font-medium leading-tight">Hostel & Policy Bot</p>
          </div>
        </button>
      )}

      {/* ========================================================
          2. INTERACTIVE ASSISTANT CHAT WINDOW
      ======================================================== */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-[#0c101c]/95 border border-white/[0.1] rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-scaleUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0c101c] via-indigo-950/40 to-[#0c101c] border-b border-white/[0.06] p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <Bot className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-sm">SmartHostel Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-indigo-300/80 font-mono">Live Database & Policy Aware</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearHistory}
                className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3.5 py-2 bg-[#080c16]/70 border-b border-white/[0.06] overflow-x-auto scrollbar-none flex items-center space-x-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.text)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-[#121826] hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-white/[0.06] text-[11px] font-medium transition-all cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2.5 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 shadow-md ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-sm'
                      : 'bg-slate-950/80 border border-slate-800/90 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  <div className="text-[12px]">{renderFormattedText(m.text)}</div>

                  <div className="flex items-center justify-between text-[10px] opacity-60 pt-1 border-t border-white/10">
                    <span className="font-mono">{m.timestamp}</span>
                    {m.source && (
                      <span className="text-[9px] font-medium tracking-tight">
                        {m.source}
                      </span>
                    )}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 text-[11px] font-bold">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start space-x-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl rounded-bl-sm flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-400 ml-1.5 font-medium">Consulting campus data...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#080c16]/95 border-t border-white/[0.06] space-y-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about room, mess, curfew, fees, repairs..."
                disabled={loading}
                className="flex-1 bg-[#0c101c] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span>Google Gemini AI & Local Knowledge Base</span>
              <span className="font-mono text-indigo-400/80">SmartHostel v2.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
