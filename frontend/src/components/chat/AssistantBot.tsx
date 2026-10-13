import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { MessageSquare, Send, X, Bot, User, Sparkles, RotateCcw, ShieldCheck, Cpu } from 'lucide-react';
import { MarkdownContent } from './MarkdownContent';

interface ChatMessage {
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
  engine?: string;
}

const QUICK_ACTIONS = [
  { label: '📊 Model Accuracies', query: 'Show all AI systems and their accuracy' },
  { label: '⚡ Recent Audits', query: 'Audit the latest decisions' },
  { label: '📜 Governance Rules', query: 'What governance rules are active?' },
  { label: '⚠️ Safety Anomalies', query: 'Are there any unresolved anomaly alerts?' },
];

const AssistantBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'bot',
      content:
        '### 🛡️ NeuroCloak AI Governance Officer Active\n' +
        'I am your real-time **AI Safety & Compliance Intelligence Agent**, equipped with live autonomous tool access across your deployed models, 4-layer CDT decision traces, and regulatory policies.\n\n' +
        'How may I assist with your governance audit today?',
      timestamp: new Date(),
      engine: 'gemini',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen, isLoading]);

  const executeSend = async (userPrompt: string) => {
    const trimmed = userPrompt.trim();
    if (!trimmed || isLoading) return;

    setMessage('');
    const newHistory = [...chatHistory, { role: 'user' as const, content: trimmed, timestamp: new Date() }];
    setChatHistory(newHistory);
    setIsLoading(true);

    try {
      // Prepare multi-turn history payload
      const historyPayload = newHistory.map(c => ({
        role: c.role === 'user' ? 'user' : 'model',
        content: c.content,
      }));

      const data = await apiClient('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
        }),
      });

      setChatHistory(prev => [
        ...prev,
        {
          role: 'bot',
          content: data.response || 'No response returned from governance engine.',
          timestamp: new Date(),
          engine: data.engine || 'gemini',
        },
      ]);
    } catch (error) {
      setChatHistory(prev => [
        ...prev,
        {
          role: 'bot',
          content:
            '⚠️ **Core Telemetry Interrupted:** Unable to complete governance query. Please verify that your backend server and MongoDB service are running.',
          timestamp: new Date(),
          engine: 'error',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    executeSend(message);
  };

  const handleResetChat = () => {
    setChatHistory([
      {
        role: 'bot',
        content:
          '### 🛡️ NeuroCloak AI Governance Officer Reset\n' +
          'Context cleared. Ready to audit your deployed models, inference traces, and compliance constraints.',
        timestamp: new Date(),
        engine: 'gemini',
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 group border border-cyan-400/40"
          aria-label="Open AI Governance Assistant"
        >
          <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 animate-ping opacity-75 pointer-events-none" />
          <MessageSquare className="w-8 h-8 group-hover:rotate-6 transition-transform relative z-10" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl w-[440px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-6rem)] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-slate-950/80 p-4 border-b border-cyan-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 shadow-inner">
                <Bot className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm tracking-wide">Governance Officer</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-medium border border-cyan-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Gemini
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live MongoDB Tool Access
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded-lg transition-colors"
                title="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          >
            {chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-2.5 max-w-[90%] ${
                    chat.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-1 ${
                      chat.role === 'user'
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {chat.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs ${
                      chat.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-950/80 text-slate-200 rounded-tl-none border border-slate-800 shadow-md w-full'
                    }`}
                  >
                    {chat.role === 'user' ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{chat.content}</p>
                    ) : (
                      <div>
                        <MarkdownContent content={chat.content} />
                        {chat.engine && (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1 text-slate-400">
                              <ShieldCheck className="w-3 h-3 text-cyan-400" />
                              {chat.engine === 'gemini' ? 'Gemini 2.5 Flash' : 'Neuro-Symbolic Core'}
                            </span>
                            <span>{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2.5 items-center bg-slate-950/80 p-3.5 rounded-2xl rounded-tl-none border border-cyan-900/40 shadow-inner">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                    <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-300">Auditing telemetry via Gemini tools...</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-none">
            {QUICK_ACTIONS.map(chip => (
              <button
                key={chip.label}
                disabled={isLoading}
                onClick={() => executeSend(chip.query)}
                className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/40 transition-colors disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-cyan-900/40 bg-slate-950/90"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Ask about model drift, disparity, or trace audits..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all pr-12 font-sans"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="absolute right-1.5 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AssistantBot;
