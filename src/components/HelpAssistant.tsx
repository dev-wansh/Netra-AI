import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  AlertTriangle, 
  User, 
  Bot, 
  ExternalLink,
  Phone,
  FileText,
  Check,
  Copy
} from 'lucide-react';
import { LOCALIZATION } from '../data/localization';
import { Theme } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HelpAssistantProps {
  theme: Theme;
  language: 'en' | 'hi' | 'mr';
  onNavigateHome: () => void;
}

export function HelpAssistant({ theme, language, onNavigateHome }: HelpAssistantProps) {
  const t = LOCALIZATION[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on selected language
  const suggestedQuestions: Record<'en' | 'hi' | 'mr', string[]> = {
    en: [
      "How do I report a cyber financial fraud?",
      "What is the cyber crime helpline number?",
      "What evidence should I preserve after getting scammed?",
      "How do I use the National Cyber Crime Reporting Portal?"
    ],
    hi: [
      "साइबर वित्तीय धोखाधड़ी की रिपोर्ट कैसे करें?",
      "साइबर अपराध हेल्पलाइन नंबर क्या है?",
      "धोखाधड़ी के बाद मुझे क्या सबूत सहेजने चाहिए?",
      "राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल का उपयोग कैसे करें?"
    ],
    mr: [
      "सायबर आर्थिक फसवणुकीची तक्रार कशी करावी?",
      "सायबर गुन्हे हेल्पलाइन नंबर काय आहे?",
      "फसवणूक झाल्यावर मी कोणते पुरावे जतन करावेत?",
      "राष्ट्रीय सायबर गुन्हे नोंदणी पोर्टलचा वापर कसा करावा?"
    ]
  };

  const initialWelcome: Record<'en' | 'hi' | 'mr', string> = {
    en: "Namaste! I am your Citizen Help Assistant. If you have experienced or suspect cyber fraud, tell me what happened. I can guide you step-by-step on how to report it, what evidence to preserve, and what safety actions to take immediately. How can I assist you today?",
    hi: "नमस्ते! मैं आपका नागरिक सहायता सहायक हूँ। यदि आपके साथ साइबर धोखाधड़ी हुई है या आपको कोई संदेह है, तो मुझे बताएं कि क्या हुआ था। मैं आपको रिपोर्ट करने, सबूत सहेजने और तुरंत सुरक्षा उपाय करने के बारे में चरण-दर-चरण मार्गदर्शन कर सकता हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
    mr: "नमस्ते! मी तुमचा नागरिक सहायता सहाय्यक आहे. तुमच्यासोबत सायबर फसवणूक झाली असल्यास किंवा संशय असल्यास, मला काय घडले ते सांगा. मी तुम्हाला तक्रार कशी करावी, पुरावे कसे जतन करावे आणि त्वरित काय सुरक्षा उपाय करावेत याबद्दल चरण-दर-चरण मार्गदर्शन करू शकतो. मी आज तुम्हाला कशी मदत करू?"
  };

  useEffect(() => {
    // Load initial welcome message if history is empty
    if (messages.length === 0) {
      setMessages([
        { role: 'assistant', content: initialWelcome[language] }
      ]);
    }
  }, [language]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsg: Message = { role: 'user', content: textToSend };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/help-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Service unavailable');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setError('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{ role: 'assistant', content: initialWelcome[language] }]);
    setInput('');
    setError(null);
  };

  // Helper to extract Complaint Preparation Summary
  const parseMessageContent = (text: string, msgIndex: number) => {
    // Check for "Complaint Preparation Summary", "शिकायत तैयारी सारांश" or "तक्रार तयारी सारांश"
    const headingMarkers = [
      "Complaint Preparation Summary",
      "शिकायत तैयारी सारांश",
      "तक्रार तयारी सारांश"
    ];

    let foundMarker = '';
    for (const marker of headingMarkers) {
      if (text.includes(marker)) {
        foundMarker = marker;
        break;
      }
    }

    if (!foundMarker) {
      return <p className="whitespace-pre-wrap text-sm leading-relaxed select-text">{text}</p>;
    }

    // Split text to separate the summary card from general text
    const parts = text.split(foundMarker);
    const preText = parts[0];
    const postText = parts[1];

    // Try to find the end of the block or just box the rest
    const handleCopy = (contentToCopy: string) => {
      navigator.clipboard.writeText(contentToCopy);
      setCopiedIndex(msgIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    };

    const fullCardText = `${foundMarker}${postText}`;

    return (
      <div className="flex flex-col gap-3 w-full">
        {preText && <p className="whitespace-pre-wrap text-sm leading-relaxed select-text">{preText}</p>}
        
        <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-5 shadow-xs flex flex-col gap-3 relative select-text">
          <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-900/40 pb-2.5">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <FileText className="w-5 h-5" />
              <span className="font-bold text-sm tracking-tight">{foundMarker}</span>
            </div>
            <button
              onClick={() => handleCopy(fullCardText)}
              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded text-blue-600 dark:text-blue-400 transition-colors"
              title="Copy Summary"
            >
              {copiedIndex === msgIndex ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">
            {postText}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="help-assistant-container" className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-black">{t.chatTitle}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.chatSubheading}</p>
        </div>
        
        <button
          id="btn-chat-reset"
          onClick={handleReset}
          className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
            theme === 'dark' 
              ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' 
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t.chatReset}
        </button>
      </div>

      {/* Trust Advisory banner */}
      <div className="border border-blue-200 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/10 rounded-xl p-4 flex gap-3 text-xs leading-relaxed font-medium">
        <span className="shrink-0 text-base">🛡️</span>
        <p className="text-slate-600 dark:text-slate-400">
          {t.chatDisclaimer}
        </p>
      </div>

      {/* Main Chat Box */}
      <div 
        id="chat-messages-viewport" 
        className={`border rounded-xl flex flex-col h-[500px] overflow-hidden transition-colors ${
          theme === 'dark' ? 'border-slate-800 bg-slate-900/20' : 'border-slate-200 bg-white shadow-xs'
        }`}
      >
        
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={index}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser 
                    ? 'bg-blue-600 text-white' 
                    : theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`rounded-2xl p-4 text-xs font-medium ${
                  isUser 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : theme === 'dark' 
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none' 
                    : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed select-text">{msg.content}</p>
                  ) : (
                    parseMessageContent(msg.content, index)
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className={`rounded-2xl p-4 text-xs font-medium rounded-tl-none flex items-center gap-1.5 ${
                theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-100'
              }`}>
                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          {error === 'failed' ? (
            <div className="border border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/10 rounded-xl p-5 flex flex-col gap-4 text-center items-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-sm text-red-800 dark:text-red-400">{t.chatErrTitle}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                  {t.chatErrDesc}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <a
                  href="tel:1930"
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer font-mono"
                >
                  <Phone className="w-3.5 h-3.5" />
                  1930 Helpline
                </a>
                <a
                  href="https://www.cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  cybercrime.gov.in
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                Try Reconnecting
              </button>
            </div>
          ) : (
            <form 
              id="chat-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <input
                id="chat-message-input"
                type="text"
                placeholder={t.chatPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className={`flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                  theme === 'dark' 
                    ? 'border-slate-800 bg-slate-900 text-slate-100 placeholder-slate-500' 
                    : 'border-slate-300 bg-white text-slate-800 placeholder-slate-400'
                }`}
              />
              <button
                id="btn-chat-send"
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                <span>{t.chatSend}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Suggested Questions Section */}
      <div id="chat-suggestions-container" className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          {t.chatSuggestedHeading}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedQuestions[language].map((question, idx) => (
            <button
              key={idx}
              id={`btn-chat-suggestion-${idx}`}
              onClick={() => handleSend(question)}
              disabled={loading}
              className={`text-left text-xs font-semibold p-3 rounded-lg border transition-colors cursor-pointer ${
                theme === 'dark' 
                  ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' 
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Footnote Disclaimer Box */}
      <div 
        id="chat-footer-disclaimer-box"
        className={`border rounded-xl p-5 flex gap-4 items-start ${
          theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/70'
        }`}
      >
        <AlertTriangle className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
        <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {t.chatDisclaimerFooter}
        </p>
      </div>

    </div>
  );
}
