import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  PhoneCall, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Upload, 
  Share2, 
  Trash2, 
  Sun, 
  Moon, 
  ArrowLeft,
  X,
  Globe,
  Check,
  FileText,
  AlertCircle
} from 'lucide-react';
import { NetraLogo } from './components/NetraLogo';
import { HelpAssistant } from './components/HelpAssistant';
import { AnalysisResult, Theme } from './types';
import { PRESET_SVGS, CALL_PRESETS } from './data/presets';
import { LOCALIZATION } from './data/localization';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('cs-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Defaulting to clean, trustworthy light mode as requested
  });

  // Language State
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>(() => {
    const saved = localStorage.getItem('cs-lang');
    if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved;
    return 'en';
  });

  // Navigation: 'home' | 'call' | 'whatsapp' | 'currency' | 'news' | 'chatbot'
  const [activeTab, setActiveTab] = useState<'home' | 'call' | 'whatsapp' | 'currency' | 'news' | 'chatbot'>('home');

  // Fraud News and Alerts State
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsFilter, setNewsFilter] = useState('All');
  const [aiSummaries, setAiSummaries] = useState<Record<string, { text: string; loading: boolean }>>({});

  // Fetch News Helper
  const fetchNews = async (force = false) => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const response = await fetch(`/api/news?forceRefresh=${force}`);
      if (!response.ok) {
        throw new Error('Latest fraud news is temporarily unavailable. Please try again.');
      }
      const data = await response.json();
      setNewsArticles(data.articles || []);
    } catch (err: any) {
      setNewsError(err.message || 'Latest fraud news is temporarily unavailable. Please try again.');
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleGetAiSummary = async (articleUrl: string, title: string, description: string) => {
    if (aiSummaries[articleUrl]?.text) return;
    
    setAiSummaries(prev => ({
      ...prev,
      [articleUrl]: { text: '', loading: true }
    }));
    
    try {
      const response = await fetch('/api/summarize-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, language })
      });
      if (!response.ok) throw new Error('Failed to summarize.');
      const data = await response.json();
      setAiSummaries(prev => ({
        ...prev,
        [articleUrl]: { text: data.summary, loading: false }
      }));
    } catch (e) {
      setAiSummaries(prev => ({
        ...prev,
        [articleUrl]: { text: 'Summary failed. Please try again.', loading: false }
      }));
    }
  };
  
  // State for user inputs
  const [callText, setCallText] = useState('');
  
  // WhatsApp Screenshot State
  const [whatsappImage, setWhatsappImage] = useState<string | null>(null);
  const [whatsappMimeType, setWhatsappMimeType] = useState<string | null>(null);
  const [whatsappFileName, setWhatsappFileName] = useState<string | null>(null);
  const [whatsappDragActive, setWhatsappDragActive] = useState(false);

  // Currency Note State
  const [currencyImage, setCurrencyImage] = useState<string | null>(null);
  const [currencyMimeType, setCurrencyMimeType] = useState<string | null>(null);
  const [currencyFileName, setCurrencyFileName] = useState<string | null>(null);
  const [currencyDragActive, setCurrencyDragActive] = useState(false);

  // Common analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [copiedAlert, setCopiedAlert] = useState(false);

  // Persist Theme
  useEffect(() => {
    localStorage.setItem('cs-theme', theme);
  }, [theme]);

  // Persist Language
  useEffect(() => {
    localStorage.setItem('cs-lang', language);
  }, [language]);

  const t = LOCALIZATION[language];

  const getLocalizedCategory = (cat: string) => {
    switch (cat) {
      case 'Digital Arrest': return t.lblCategoryDigitalArrest;
      case 'Bank Fraud': return t.lblCategoryBankFraud;
      case 'UPI Fraud': return t.lblCategoryUpiFraud;
      case 'WhatsApp Scam': return t.lblCategoryWhatsAppScam;
      case 'Investment Scam': return t.lblCategoryInvestmentScam;
      case 'Job Scam': return t.lblCategoryJobScam;
      case 'Phishing': return t.lblCategoryPhishing;
      case 'Identity Theft': return t.lblCategoryIdentityTheft;
      default: return t.lblCategoryOtherCyberFraud;
    }
  };

  // Helper to convert SVG string to Base64 PNG for Gemini Multimodal
  const convertSvgToPng = (svgStr: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 420;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const pngDataUrl = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            resolve(pngDataUrl);
          } catch (e) {
            URL.revokeObjectURL(url);
            reject(e);
          }
        } else {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to create canvas context'));
        }
      };
      
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      
      img.src = url;
    });
  };

  // Preset Selection Handlers
  const handleLoadCallPreset = (desc: string) => {
    setCallText(desc);
    setAnalysisResult(null);
    setError(null);
  };

  const handleLoadWhatsappPreset = async (type: 'lottery' | 'partTimeJob') => {
    setError(null);
    setAnalysisResult(null);
    try {
      setIsAnalyzing(true);
      const pngDataUrl = await convertSvgToPng(PRESET_SVGS[type]);
      setWhatsappImage(pngDataUrl);
      setWhatsappMimeType('image/png');
      setWhatsappFileName(type === 'lottery' ? 'KBC_Lottery_Scam_Preset.png' : 'Job_Scam_Preset.png');
    } catch (err: any) {
      console.error('Error converting SVG preset to PNG:', err);
      // Fallback
      setWhatsappImage(null);
      setError('Failed to load screenshot preset.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Common File Reading Helper
  const readFileAsDataURL = (file: File, onSuccess: (result: string, file: File) => void) => {
    if (!file.type.startsWith('image/')) {
      setError(t.errorImageUploadType);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultStr = event.target?.result as string;
      onSuccess(resultStr, file);
      setError(null);
      setAnalysisResult(null);
    };
    reader.onerror = () => {
      setError('Error reading file.');
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers for WhatsApp
  const handleWhatsappDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setWhatsappDragActive(true);
    } else if (e.type === 'dragleave') {
      setWhatsappDragActive(false);
    }
  };

  const handleWhatsappDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWhatsappDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readFileAsDataURL(e.dataTransfer.files[0], (result, file) => {
        setWhatsappImage(result);
        setWhatsappFileName(file.name);
        setWhatsappMimeType(file.type);
      });
    }
  };

  // Drag and Drop handlers for Currency Notes
  const handleCurrencyDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setCurrencyDragActive(true);
    } else if (e.type === 'dragleave') {
      setCurrencyDragActive(false);
    }
  };

  const handleCurrencyDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrencyDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readFileAsDataURL(e.dataTransfer.files[0], (result, file) => {
        setCurrencyImage(result);
        setCurrencyFileName(file.name);
        setCurrencyMimeType(file.type);
      });
    }
  };

  // Clear uploads
  const clearWhatsappImage = () => {
    setWhatsappImage(null);
    setWhatsappMimeType(null);
    setWhatsappFileName(null);
    setAnalysisResult(null);
    setError(null);
  };

  const clearCurrencyImage = () => {
    setCurrencyImage(null);
    setCurrencyMimeType(null);
    setCurrencyFileName(null);
    setAnalysisResult(null);
    setError(null);
  };

  // API Call: Analyze Call
  const handleAnalyzeCall = async () => {
    if (!callText.trim()) {
      setError(t.errorNoInputCall);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: callText, language }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error.');
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check server connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // API Call: Analyze WhatsApp Screenshot
  const handleAnalyzeScreenshot = async () => {
    if (!whatsappImage) {
      setError(t.errorNoInputScreenshot);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Data = whatsappImage.split(',')[1] || whatsappImage;
      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: whatsappMimeType || 'image/png',
          language
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error.');
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message || 'Image analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // API Call: Scan Currency Note
  const handleAnalyzeCurrency = async () => {
    if (!currencyImage) {
      setError(t.errorNoInputCurrency);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Data = currencyImage.split(',')[1] || currencyImage;
      const response = await fetch('/api/analyze-currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: currencyMimeType || 'image/png',
          language
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error.');
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message || 'Currency scanning failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy and Share Warning Alert (WhatsApp optimized)
  const handleCopyAlertMessage = () => {
    if (!analysisResult) return;
    
    const message = `🚨 *${t.appName.toUpperCase()} - ${t.resultTitle.toUpperCase()}* 🚨
    
*${t.scamType}:* ${analysisResult.scamType}
*${t.riskLevel}:* ${analysisResult.riskLevel} (${analysisResult.riskScore}/100)

*${t.summary}:*
${analysisResult.explanation}

*${t.whyFlagged}:*
${analysisResult.signals.map(s => `• ${s}`).join('\n')}

*${t.whatToDo}:*
${analysisResult.actions.map(a => `👉 ${a}`).join('\n')}

_🛡️ ${t.officialWarning}_`;

    navigator.clipboard.writeText(message);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2000);
  };

  // Navigation handlers
  const navigateToTab = (tab: 'home' | 'call' | 'whatsapp' | 'currency' | 'news' | 'chatbot') => {
    setActiveTab(tab);
    setAnalysisResult(null);
    setError(null);
  };

  // Helper for risk status display styling (Trustworthy, simple branding styles)
  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'LOW':
        return {
          text: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/30 dark:border-green-900',
          badge: 'bg-green-600 text-white',
          barColor: 'bg-green-600'
        };
      case 'MEDIUM':
        return {
          text: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900',
          badge: 'bg-amber-500 text-white',
          barColor: 'bg-amber-500'
        };
      case 'HIGH':
        return {
          text: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-900',
          badge: 'bg-orange-600 text-white',
          barColor: 'bg-orange-600'
        };
      case 'CRITICAL':
        return {
          text: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900',
          badge: 'bg-red-600 text-white',
          barColor: 'bg-red-600'
        };
      default:
        return {
          text: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900',
          badge: 'bg-blue-600 text-white',
          barColor: 'bg-blue-600'
        };
    }
  };

  const riskStyle = analysisResult ? getRiskStyles(analysisResult.riskLevel) : getRiskStyles('LOW');

  return (
    <div 
      id="fraud-shield-root-container" 
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Respectful Tricolor Accent Top Ribbon */}
      <div id="tricolor-accent-bar" className="h-1 bg-gradient-to-r from-[#FF6F00] via-[#FFFFFF] to-[#00A86B]"></div>

      {/* Main Header / Navigation */}
      <header 
        id="app-navigation-header"
        className={`border-b transition-colors duration-200 ${
          theme === 'dark' ? 'border-slate-900 bg-slate-900' : 'border-slate-200 bg-white shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* App Title & Badge */}
          <button 
            id="logo-home-button"
            onClick={() => navigateToTab('home')}
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
          >
            <NetraLogo className="w-10 h-10 flex-shrink-0" />
            <div>
              <h1 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.appName}
              </h1>
              <p className={`text-[11px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Made by-System Builders
              </p>
            </div>
          </button>

          {/* Nav Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Home Navigation button */}
            <button
              id="nav-home-btn"
              onClick={() => navigateToTab('home')}
              className={`text-sm font-medium px-3 py-1.5 rounded-md hover:underline transition-all ${
                activeTab === 'home' ? 'text-blue-600 font-semibold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.home}
            </button>

            {/* Fraud News Navigation button */}
            <button
              id="nav-news-btn"
              onClick={() => navigateToTab('news')}
              className={`text-sm font-medium px-3 py-1.5 rounded-md hover:underline transition-all ${
                activeTab === 'news' ? 'text-blue-600 font-semibold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.navFraudNews}
            </button>

            {/* Help Assistant Navigation button */}
            <button
              id="nav-help-assistant-btn"
              onClick={() => navigateToTab('chatbot')}
              className={`text-sm font-medium px-3 py-1.5 rounded-md hover:underline transition-all ${
                activeTab === 'chatbot' ? 'text-blue-600 font-semibold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.navHelpAssistant}
            </button>

            {/* Language Selector */}
            <div id="language-dropdown-wrapper" className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <select
                id="language-selector"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr')}
                className={`text-xs border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-inherit font-medium cursor-pointer ${
                  theme === 'dark' ? 'border-slate-700 text-slate-200 bg-slate-800' : 'border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Light/Dark Mode Switcher */}
            <button
              id="theme-switcher-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                theme === 'dark' 
                  ? 'border-slate-800 text-yellow-500 hover:bg-slate-800' 
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* ======================================= */}
        {/* 1. HOME SCREEN SECTION                  */}
        {/* ======================================= */}
        {activeTab === 'home' && (
          <div id="home-view-container" className="flex flex-col gap-8 animate-fade-in">
            {/* Hero Banner */}
            <div className="text-center py-6 max-w-3xl mx-auto flex flex-col gap-3">
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.heroTitle}
              </h2>
              <p className={`text-base sm:text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {t.heroSubtitle}
              </p>
            </div>

            {/* Service Cards Grid */}
            <div id="services-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Suspicious Call */}
              <div 
                id="card-call"
                className={`flex flex-col justify-between border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  theme === 'dark' 
                    ? 'border-slate-800 bg-slate-900 hover:border-blue-800' 
                    : 'border-slate-200 bg-white hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="text-blue-600 bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg w-fit mb-4">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {t.cardCallTitle}
                  </h3>
                  <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t.cardCallDesc}
                  </p>
                </div>
                <button
                  id="btn-open-call"
                  onClick={() => navigateToTab('call')}
                  className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {t.cardCallBtn}
                </button>
              </div>

              {/* Card 2: WhatsApp Screen */}
              <div 
                id="card-whatsapp"
                className={`flex flex-col justify-between border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  theme === 'dark' 
                    ? 'border-slate-800 bg-slate-900 hover:border-blue-800' 
                    : 'border-slate-200 bg-white hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="text-blue-600 bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg w-fit mb-4">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {t.cardScreenshotTitle}
                  </h3>
                  <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t.cardScreenshotDesc}
                  </p>
                </div>
                <button
                  id="btn-open-whatsapp"
                  onClick={() => navigateToTab('whatsapp')}
                  className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {t.cardScreenshotBtn}
                </button>
              </div>

              {/* Card 3: Currency Note */}
              <div 
                id="card-currency"
                className={`flex flex-col justify-between border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  theme === 'dark' 
                    ? 'border-slate-800 bg-slate-900 hover:border-blue-800' 
                    : 'border-slate-200 bg-white hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="text-blue-600 bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg w-fit mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {t.cardCurrencyTitle}
                  </h3>
                  <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t.cardCurrencyDesc}
                  </p>
                </div>
                <button
                  id="btn-open-currency"
                  onClick={() => navigateToTab('currency')}
                  className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {t.cardCurrencyBtn}
                </button>
              </div>

            </div>

            {/* Latest Fraud Alerts Section */}
            <div 
              id="latest-fraud-alerts-section"
              className={`border rounded-xl p-6 transition-colors duration-200 ${
                theme === 'dark' ? 'border-slate-800 bg-slate-900/20' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {t.sectionNewsTitle}
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t.sectionNewsDesc}
                  </p>
                </div>
                
                {/* Manual Refresh / Retry Controls */}
                <div className="flex items-center gap-2">
                  <button
                    id="btn-refresh-news-home"
                    onClick={() => fetchNews(true)}
                    disabled={newsLoading}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      theme === 'dark' 
                        ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-50' 
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? 'animate-spin' : ''}`} />
                    {t.btnRefresh}
                  </button>
                </div>
              </div>

              {newsLoading ? (
                <div id="loading-news-container-home" className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-slate-500">{t.lblLoadingNews}</p>
                </div>
              ) : newsError ? (
                <div id="error-news-container-home" className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-md">
                    {t.lblNewsUnavailable}
                  </p>
                  <button
                    id="btn-retry-news-home"
                    onClick={() => fetchNews(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    {t.btnRetry}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {newsArticles.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">No news available.</p>
                  ) : (
                    <div id="news-home-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {newsArticles.slice(0, 3).map((art) => (
                        <div 
                          key={art.url}
                          className={`border rounded-xl overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md ${
                            theme === 'dark' ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div>
                            {art.urlToImage && (
                              <img 
                                src={art.urlToImage} 
                                alt={art.title} 
                                referrerPolicy="no-referrer"
                                className="w-full h-36 object-cover" 
                              />
                            )}
                            <div className="p-4 flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  {getLocalizedCategory(art.category)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {new Date(art.publishedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                                {art.title}
                              </h4>
                              <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                {art.source}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mt-1">
                                {art.description}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 pt-0">
                            <a
                              href={art.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-center block w-full text-[11px] font-bold py-2 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                              {t.btnReadFullArticle}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center mt-2">
                    <button
                      id="btn-view-all-news"
                      onClick={() => navigateToTab('news')}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-6 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      {t.btnViewAllNews}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Need Help Reporting a Fraud? Section */}
            <div 
              id="help-assistant-home-section"
              className={`border rounded-xl p-6 transition-colors duration-200 flex flex-col md:flex-row items-center justify-between gap-6 ${
                theme === 'dark' ? 'border-blue-900/40 bg-blue-950/10' : 'border-blue-200 bg-blue-50/50'
              }`}
            >
              <div className="flex-1 flex gap-4 items-start">
                <div className="text-blue-600 bg-blue-100 dark:bg-blue-950/30 p-3 rounded-full flex-shrink-0">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {t.homeHelpHeading}
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t.homeHelpDesc}
                  </p>
                </div>
              </div>
              <button
                id="btn-talk-to-help-assistant"
                onClick={() => navigateToTab('chatbot')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                {t.homeHelpBtn}
              </button>
            </div>

            {/* National Crime Record Bureau / Safety Callout Banner */}
            <div 
              id="safety-crime-banner"
              className={`border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 mt-4 ${
                theme === 'dark' ? 'border-amber-900/30 bg-amber-950/10' : 'border-amber-200 bg-amber-50/50'
              }`}
            >
              <div className="text-amber-600 bg-amber-100 dark:bg-amber-950/30 p-3 rounded-full flex-shrink-0">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  How {t.appName} Helps You
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  This platform is a community visual &amp; semantic screening initiative. We run real-time natural language evaluation using official cyber safety protocols. <strong>We do not save or log your private photos.</strong>
                </p>
              </div>
              <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-300 dark:border-slate-700 pt-4 md:pt-0 md:pl-6 text-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">HELPLINE NUMBER</span>
                <span className="text-2xl font-black text-red-600 select-all font-mono">1930</span>
              </div>
            </div>

            {/* Prototype Disclaimer */}
            <div 
              id="home-prototype-disclaimer-box"
              className={`border rounded-xl p-5 flex gap-4 items-start ${
                theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <AlertCircle className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.prototypeDisclaimer}
              </p>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* 2. CALL ANALYSIS VIEW                   */}
        {/* ======================================= */}
        {activeTab === 'call' && !isAnalyzing && !analysisResult && (
          <div id="call-analysis-view" className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto w-full">
            {/* Back Button */}
            <button 
              id="back-home-btn-call"
              onClick={() => navigateToTab('home')}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 w-fit cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> {t.backToHome}
            </button>

            {/* Header */}
            <div>
              <h2 className="text-2xl font-black">{t.callAnalyzerTitle}</h2>
              <p className="text-sm text-slate-500 mt-1">{t.callAnalyzerSub}</p>
            </div>

            {/* Preset Section */}
            <div 
              id="call-preset-block"
              className={`border rounded-lg p-4 ${
                theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
              }`}
            >
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t.callPresetLabel}
              </label>
              <div className="flex flex-col gap-2">
                {CALL_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    id={`preset-call-btn-${idx}`}
                    onClick={() => handleLoadCallPreset(preset.description)}
                    className={`text-left text-xs font-semibold px-3 py-2 rounded-md transition-colors border cursor-pointer ${
                      theme === 'dark' 
                        ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' 
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Section */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.callLabel}
              </label>
              <textarea
                id="call-text-input"
                rows={6}
                value={callText}
                onChange={(e) => setCallText(e.target.value)}
                placeholder={t.callPlaceholder}
                className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white'
                }`}
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t.callLength}: {callText.length}</span>
                {callText && (
                  <button 
                    id="clear-call-text-btn"
                    onClick={() => setCallText('')} 
                    className="text-red-500 hover:underline cursor-pointer"
                  >
                    {t.callClear}
                  </button>
                )}
              </div>
            </div>

            {/* Primary Button */}
            <button
              id="submit-call-analysis-btn"
              onClick={handleAnalyzeCall}
              disabled={!callText.trim() || isAnalyzing}
              className="w-full bg-blue-600 text-white text-sm font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
            >
              {t.cardCallBtn}
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* 3. WHATSAPP SCREENSHOT VIEW             */}
        {/* ======================================= */}
        {activeTab === 'whatsapp' && !isAnalyzing && !analysisResult && (
          <div id="whatsapp-analysis-view" className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto w-full">
            {/* Back Button */}
            <button 
              id="back-home-btn-whatsapp"
              onClick={() => navigateToTab('home')}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 w-fit cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> {t.backToHome}
            </button>

            {/* Header */}
            <div>
              <h2 className="text-2xl font-black">{t.screenshotAnalyzerTitle}</h2>
              <p className="text-sm text-slate-500 mt-1">{t.screenshotAnalyzerSub}</p>
            </div>

            {/* Preset Section */}
            <div 
              id="whatsapp-preset-block"
              className={`border rounded-lg p-4 ${
                theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
              }`}
            >
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t.screenshotPresetLabel}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  id="preset-whatsapp-lottery"
                  onClick={() => handleLoadWhatsappPreset('lottery')}
                  className={`flex-1 text-left sm:text-center text-xs font-semibold px-3 py-2 rounded-md border transition-colors cursor-pointer ${
                    theme === 'dark' 
                      ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' 
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t.presetKbcTitle}
                </button>
                <button
                  id="preset-whatsapp-job"
                  onClick={() => handleLoadWhatsappPreset('partTimeJob')}
                  className={`flex-1 text-left sm:text-center text-xs font-semibold px-3 py-2 rounded-md border transition-colors cursor-pointer ${
                    theme === 'dark' 
                      ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' 
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t.presetElectricityTitle}
                </button>
              </div>
            </div>

            {/* Upload Section */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.screenshotUploadLabel}
              </label>
              
              {/* Drag and Drop Zone */}
              {!whatsappImage ? (
                <div
                  id="whatsapp-dropzone"
                  onDragEnter={handleWhatsappDrag}
                  onDragOver={handleWhatsappDrag}
                  onDragLeave={handleWhatsappDrag}
                  onDrop={handleWhatsappDrop}
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 text-center transition-all cursor-pointer ${
                    whatsappDragActive 
                      ? 'border-blue-500 bg-blue-50/20' 
                      : theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-white'
                  }`}
                  onClick={() => document.getElementById('whatsapp-file-input')?.click()}
                >
                  <input
                    type="file"
                    id="whatsapp-file-input"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        readFileAsDataURL(file, (result, f) => {
                          setWhatsappImage(result);
                          setWhatsappFileName(f.name);
                          setWhatsappMimeType(f.type);
                        });
                      }
                    }}
                  />
                  <Upload className="w-10 h-10 text-slate-400" />
                  <div>
                    <span className="text-sm font-semibold text-blue-600 hover:underline">
                      Click to upload
                    </span>
                    <span className="text-sm text-slate-500"> or drag and drop</span>
                    <p className="text-xs text-slate-400 mt-1">{t.screenshotUploadHint}</p>
                  </div>
                </div>
              ) : (
                <div 
                  id="whatsapp-preview-container"
                  className={`border rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 relative ${
                    theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <img
                    id="whatsapp-image-preview"
                    src={whatsappImage}
                    alt="WhatsApp Screenshot Preview"
                    className="w-32 h-auto max-h-32 object-contain border rounded border-slate-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {whatsappFileName || 'uploaded_image.png'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-mono">
                      Format: {whatsappMimeType?.split('/')[1] || 'png'}
                    </p>
                  </div>
                  <button
                    id="clear-whatsapp-img-btn"
                    onClick={clearWhatsappImage}
                    className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="submit-whatsapp-analysis-btn"
              onClick={handleAnalyzeScreenshot}
              disabled={!whatsappImage || isAnalyzing}
              className="w-full bg-blue-600 text-white text-sm font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
            >
              {t.cardScreenshotBtn}
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* 4. CURRENCY NOTE SCANNER VIEW            */}
        {/* ======================================= */}
        {activeTab === 'currency' && !isAnalyzing && !analysisResult && (
          <div id="currency-analysis-view" className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto w-full">
            {/* Back Button */}
            <button 
              id="back-home-btn-currency"
              onClick={() => navigateToTab('home')}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 w-fit cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> {t.backToHome}
            </button>

            {/* Header with Netra Branding integration */}
            <div className="flex items-center gap-4">
              <NetraLogo className="w-12 h-12 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-black">{t.currencyAnalyzerTitle}</h2>
                <p className="text-sm text-slate-500 mt-1">{t.currencyAnalyzerSub}</p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.currencyUploadLabel}
              </label>

              {/* Drag and Drop zone */}
              {!currencyImage ? (
                <div
                  id="currency-dropzone"
                  onDragEnter={handleCurrencyDrag}
                  onDragOver={handleCurrencyDrag}
                  onDragLeave={handleCurrencyDrag}
                  onDrop={handleCurrencyDrop}
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 text-center transition-all cursor-pointer ${
                    currencyDragActive 
                      ? 'border-blue-500 bg-blue-50/20' 
                      : theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-white'
                  }`}
                  onClick={() => document.getElementById('currency-file-input')?.click()}
                >
                  <input
                    type="file"
                    id="currency-file-input"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        readFileAsDataURL(file, (result, f) => {
                          setCurrencyImage(result);
                          setCurrencyFileName(f.name);
                          setCurrencyMimeType(f.type);
                        });
                      }
                    }}
                  />
                  <Upload className="w-10 h-10 text-slate-400" />
                  <div>
                    <span className="text-sm font-semibold text-blue-600 hover:underline">
                      Click to upload
                    </span>
                    <span className="text-sm text-slate-500"> or drag and drop</span>
                    <p className="text-xs text-slate-400 mt-1">{t.currencyUploadHint}</p>
                  </div>
                </div>
              ) : (
                <div 
                  id="currency-preview-container"
                  className={`border rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 relative ${
                    theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <img
                    id="currency-image-preview"
                    src={currencyImage}
                    alt="Currency Note Preview"
                    className="w-48 h-auto max-h-32 object-contain border rounded border-slate-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {currencyFileName || 'currency_note.png'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-mono">
                      Format: {currencyMimeType?.split('/')[1] || 'png'}
                    </p>
                  </div>
                  <button
                    id="clear-currency-img-btn"
                    onClick={clearCurrencyImage}
                    className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Security Disclaimer Banner */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1">
                {t.disclaimer}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.currencyScannerDisclaimer}
              </p>
            </div>

            {/* Submit Button */}
            <button
              id="submit-currency-analysis-btn"
              onClick={handleAnalyzeCurrency}
              disabled={!currencyImage || isAnalyzing}
              className="w-full bg-blue-600 text-white text-sm font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
            >
              {t.cardCurrencyBtn}
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* 4.5. FRAUD NEWS & ALERTS VIEW            */}
        {/* ======================================= */}
        {activeTab === 'news' && (
          <div id="fraud-news-alerts-view" className="flex flex-col gap-6 animate-fade-in max-w-5xl mx-auto w-full">
            {/* Back Button */}
            <button 
              id="back-home-btn-news"
              onClick={() => navigateToTab('home')}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 w-fit cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> {t.backToHome}
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-2xl font-black">{t.navFraudNews} &amp; Alerts</h2>
                <p className="text-sm text-slate-500 mt-1">{t.sectionNewsDesc}</p>
              </div>
              
              {/* Refresh controls */}
              <button
                id="btn-refresh-news-page"
                onClick={() => fetchNews(true)}
                disabled={newsLoading}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                  theme === 'dark' 
                    ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-50' 
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? 'animate-spin' : ''}`} />
                {t.btnRefresh}
              </button>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="flex flex-col gap-4">
              {/* Search Box */}
              <div className="relative">
                <input
                  id="search-news-input"
                  type="text"
                  placeholder={t.lblSearchPlaceholder}
                  value={newsSearch}
                  onChange={(e) => setNewsSearch(e.target.value)}
                  className={`w-full text-sm rounded-lg pl-4 pr-10 py-3 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-900 text-slate-100 placeholder-slate-500'
                      : 'border-slate-200 bg-white text-slate-800 placeholder-slate-400'
                  }`}
                />
                {newsSearch && (
                  <button
                    id="btn-clear-news-search"
                    onClick={() => setNewsSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
                {['All', 'Digital Arrest', 'Bank Fraud', 'UPI Fraud', 'WhatsApp', 'Investment', 'Phishing'].map((filterOption) => {
                  const isSelected = newsFilter === filterOption;
                  let localizedLabel = filterOption;
                  if (filterOption === 'All') localizedLabel = t.lblFilterAll;
                  else if (filterOption === 'Digital Arrest') localizedLabel = t.lblCategoryDigitalArrest;
                  else if (filterOption === 'Bank Fraud') localizedLabel = t.lblCategoryBankFraud;
                  else if (filterOption === 'UPI Fraud') localizedLabel = t.lblCategoryUpiFraud;
                  else if (filterOption === 'WhatsApp') localizedLabel = t.lblCategoryWhatsAppScam;
                  else if (filterOption === 'Investment') localizedLabel = t.lblCategoryInvestmentScam;
                  else if (filterOption === 'Phishing') localizedLabel = t.lblCategoryPhishing;

                  return (
                    <button
                      key={filterOption}
                      id={`btn-filter-news-${filterOption.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setNewsFilter(filterOption)}
                      className={`text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : theme === 'dark'
                          ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {localizedLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* News Cards Feed */}
            {newsLoading ? (
              <div id="loading-news-container-page" className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-slate-500">{t.lblLoadingNews}</p>
              </div>
            ) : newsError ? (
              <div id="error-news-container-page" className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="text-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded-full">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-md">
                  {t.lblNewsUnavailable}
                </p>
                <button
                  id="btn-retry-news-page"
                  onClick={() => fetchNews(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-6 rounded-lg transition-colors cursor-pointer"
                >
                  {t.btnRetry}
                </button>
              </div>
            ) : (
              <div>
                {newsArticles.filter(art => {
                  let categoryMatch = true;
                  if (newsFilter !== 'All') {
                    if (newsFilter === 'WhatsApp') {
                      categoryMatch = art.category === 'WhatsApp Scam';
                    } else if (newsFilter === 'Investment') {
                      categoryMatch = art.category === 'Investment Scam';
                    } else {
                      categoryMatch = art.category === newsFilter;
                    }
                  }
                  
                  let searchMatch = true;
                  if (newsSearch.trim()) {
                    const q = newsSearch.toLowerCase();
                    searchMatch = art.title.toLowerCase().includes(q) || art.description.toLowerCase().includes(q);
                  }
                  
                  return categoryMatch && searchMatch;
                }).length === 0 ? (
                  <div className="text-center py-20 text-slate-500 text-sm">
                    No articles match your search or filter criteria.
                  </div>
                ) : (
                  <div id="news-page-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsArticles.filter(art => {
                      let categoryMatch = true;
                      if (newsFilter !== 'All') {
                        if (newsFilter === 'WhatsApp') {
                          categoryMatch = art.category === 'WhatsApp Scam';
                        } else if (newsFilter === 'Investment') {
                          categoryMatch = art.category === 'Investment Scam';
                        } else {
                          categoryMatch = art.category === newsFilter;
                        }
                      }
                      
                      let searchMatch = true;
                      if (newsSearch.trim()) {
                        const q = newsSearch.toLowerCase();
                        searchMatch = art.title.toLowerCase().includes(q) || art.description.toLowerCase().includes(q);
                      }
                      
                      return categoryMatch && searchMatch;
                    }).map((art) => (
                      <div 
                        key={art.url}
                        className={`border rounded-xl overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md ${
                          theme === 'dark' ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div>
                          {art.urlToImage && (
                            <img 
                              src={art.urlToImage} 
                              alt={art.title} 
                              referrerPolicy="no-referrer"
                              className="w-full h-44 object-cover" 
                            />
                          )}
                          <div className="p-4 flex flex-col gap-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {getLocalizedCategory(art.category)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(art.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2" title={art.title}>
                              {art.title}
                            </h4>
                            <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                              Source: {art.source}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              {art.description}
                            </p>

                            {/* AI Summary Section */}
                            {aiSummaries[art.url] ? (
                              <div className="mt-2 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/20">
                                <div className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                                  <span>💡</span> {t.lblAiSummary}
                                </div>
                                {aiSummaries[art.url].loading ? (
                                  <p className="text-xs text-slate-400 animate-pulse">{t.lblGeneratingSummary}</p>
                                ) : (
                                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed select-text">
                                    {aiSummaries[art.url].text}
                                  </p>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="p-4 pt-0 flex gap-2">
                          <button
                            onClick={() => handleGetAiSummary(art.url, art.title, art.description)}
                            className={`text-[10px] font-bold py-2 px-2.5 rounded-md transition-colors w-1/2 border flex items-center justify-center gap-1 cursor-pointer ${
                              theme === 'dark'
                                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            💡 {t.btnGetAiSummary}
                          </button>
                          <a
                            href={art.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center text-[10px] font-bold py-2 px-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors w-1/2 flex items-center justify-center cursor-pointer"
                          >
                            {t.btnReadFullArticle}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* 4.6. CITIZEN HELP ASSISTANT VIEW         */}
        {/* ======================================= */}
        {activeTab === 'chatbot' && (
          <HelpAssistant
            theme={theme}
            language={language}
            onNavigateHome={() => navigateToTab('home')}
          />
        )}

        {/* ======================================= */}
        {/* 5. LOADING SCREEN COMPONENT             */}
        {/* ======================================= */}
        {isAnalyzing && (
          <div id="loading-spinner-view" className="flex flex-col items-center justify-center py-20 gap-6 text-center animate-pulse">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="flex flex-col gap-2 max-w-md">
              <h3 className="text-xl font-bold">
                {activeTab === 'call' && t.loadingCall}
                {activeTab === 'whatsapp' && t.loadingScreenshot}
                {activeTab === 'currency' && t.loadingCurrency}
              </h3>
              <p className="text-sm text-slate-500">
                {t.loadingSubtitle}
              </p>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* 6. SYSTEM ERROR DISPLAY                 */}
        {/* ======================================= */}
        {error && (
          error === 'AI_QUOTA_EXCEEDED' ? (
            <div id="quota-error-card" className="border border-amber-200 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/10 rounded-xl p-8 max-w-2xl mx-auto w-full flex flex-col gap-5 animate-fade-in text-center items-center shadow-lg">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/40 rounded-full text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-black text-xl text-amber-800 dark:text-amber-400">
                  AI analysis is currently unavailable
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Our prototype has reached its available AI analysis limit. Your content was not analysed and no result was generated. Please try again later.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  id="quota-retry-btn"
                  onClick={() => {
                    setError(null);
                    setAnalysisResult(null);
                  }}
                  className="bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-amber-700 transition-colors cursor-pointer shadow-sm"
                >
                  Try Again Later
                </button>
                <button
                  id="quota-home-btn"
                  onClick={() => {
                    setError(null);
                    setAnalysisResult(null);
                    setActiveTab('home');
                  }}
                  className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <div id="error-display-view" className="border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 rounded-xl p-6 max-w-2xl mx-auto w-full flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-bold text-lg">{t.errorHeading}</h3>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                {error}
              </p>
              <button
                id="error-reset-btn"
                onClick={() => {
                  setError(null);
                  setAnalysisResult(null);
                }}
                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors w-fit cursor-pointer"
              >
                {t.errorReset}
              </button>
            </div>
          )
        )}

        {/* ======================================= */}
        {/* 7. REDESIGNED AI THREAT REPORT DISPLAY   */}
        {/* ======================================= */}
        {analysisResult && !isAnalyzing && (
          <div id="analysis-report-view" className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
            
            {/* Back Button / Reset */}
            <button 
              id="back-to-input-btn"
              onClick={() => {
                setAnalysisResult(null);
                setError(null);
              }}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 w-fit cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Analyzer
            </button>

            {analysisResult.isFallback && (
              <div 
                id="offline-fallback-warning-banner"
                className="border border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl p-4 flex gap-3 text-sm font-medium leading-relaxed shadow-sm animate-fade-in"
              >
                <div className="shrink-0 text-base">💡</div>
                <div>
                  <span className="font-bold">Offline Security Screening Mode Active:</span> The AI service is currently at daily capacity limit. Netra AI automatically engaged local pattern screening heuristics to immediately verify your safety guidelines without data loss.
                </div>
              </div>
            )}

            {/* Main Report Card */}
            <div 
              id="report-card-container"
              className={`border rounded-xl shadow-xs overflow-hidden transition-colors duration-200 ${
                theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              }`}
            >
              
              {/* Header Status Bar (solid colored horizontal indicator) */}
              <div id="report-risk-indicator-bar" className={`h-2 ${riskStyle.barColor}`}></div>

              {/* Top Banner: Basic Vetting Metrics */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Title */}
                  <div className="flex items-center gap-3">
                    <Shield className="w-7 h-7 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-black tracking-tight">{t.resultTitle}</h3>
                      <p className="text-xs text-slate-500 uppercase font-mono">ID: CFS-{Math.floor(100000 + Math.random() * 900000)}</p>
                    </div>
                  </div>

                  {/* Copy Alert Button */}
                  <button
                    id="share-copy-alert-btn"
                    onClick={handleCopyAlertMessage}
                    className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedAlert ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t.copiedText}
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        {t.shareWarning}
                      </>
                    )}
                  </button>

                </div>
              </div>

              {/* Grid Layout: Left Details, Right image reference (if image provided) */}
              <div className="grid grid-cols-1 lg:grid-cols-12">
                
                {/* Visual Evidence Sidebar if upload exists */}
                {((activeTab === 'whatsapp' && whatsappImage) || (activeTab === 'currency' && currencyImage)) && (
                  <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {t.evidence}
                    </span>
                    <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 p-2 flex items-center justify-center">
                      <img
                        id="evidence-sidebar-image"
                        src={activeTab === 'whatsapp' ? whatsappImage! : currencyImage!}
                        alt="Submitted Evidence"
                        className="w-full h-auto max-h-60 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {analysisResult.extractedText && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {t.extractedTextTitle}
                        </span>
                        <p className="text-xs font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded p-2.5 max-h-40 overflow-y-auto whitespace-pre-wrap select-all leading-relaxed">
                          {analysisResult.extractedText}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Evaluation Results */}
                <div className={`p-6 flex flex-col gap-6 ${
                  ((activeTab === 'whatsapp' && whatsappImage) || (activeTab === 'currency' && currencyImage)) 
                    ? 'lg:col-span-8' 
                    : 'lg:col-span-12'
                }`}>
                  
                  {/* Three-Column Responsive Metric Grid - NO NARROW WRAPPING */}
                  <div 
                    id="results-metric-grid"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-slate-200 dark:border-slate-800 pb-6"
                  >
                    
                    {/* Column 1: Risk Score */}
                    <div className="flex flex-col gap-1 text-center sm:text-left min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {t.riskScore}
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white block">
                        {analysisResult.riskScore} <span className="text-sm font-medium text-slate-400">/ 100</span>
                      </span>
                    </div>

                    {/* Column 2: Risk Level */}
                    <div className="flex flex-col gap-1 text-center sm:text-left min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {t.riskLevel}
                      </span>
                      <span className={`text-sm font-bold uppercase py-1 px-2.5 rounded border w-fit mx-auto sm:mx-0 ${riskStyle.text}`}>
                        {analysisResult.riskLevel === 'LOW' && t.riskLow}
                        {analysisResult.riskLevel === 'MEDIUM' && t.riskMedium}
                        {analysisResult.riskLevel === 'HIGH' && t.riskHigh}
                        {analysisResult.riskLevel === 'CRITICAL' && t.riskCritical}
                        {analysisResult.riskLevel === 'INCONCLUSIVE' && t.riskInconclusive}
                      </span>
                    </div>

                    {/* Column 3: Scam Type */}
                    <div className="flex flex-col gap-1 text-center sm:text-left min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        {t.scamType}
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white leading-tight break-words block">
                        {analysisResult.scamType}
                      </span>
                    </div>

                  </div>

                  {/* Summary / Explanation Block */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t.explanation}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {analysisResult.explanation}
                    </p>
                  </div>

                  {/* Warning Signals Grid */}
                  {analysisResult.signals && analysisResult.signals.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {t.whyFlagged}
                      </h4>
                      <div className="flex flex-col gap-2">
                        {analysisResult.signals.map((signal, idx) => (
                          <div 
                            key={idx}
                            id={`signal-item-${idx}`}
                            className={`border rounded-lg p-3.5 flex gap-3 text-xs leading-relaxed font-medium transition-colors ${
                              theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <span className="text-amber-500 font-bold shrink-0">⚠️ {t.signalItem} {idx + 1}:</span>
                            <span className="text-slate-700 dark:text-slate-300 select-text">{signal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items List */}
                  {analysisResult.actions && analysisResult.actions.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {t.whatToDo}
                      </h4>
                      <div className="flex flex-col gap-2">
                        {analysisResult.actions.map((action, idx) => (
                          <div 
                            key={idx}
                            id={`action-item-${idx}`}
                            className="border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-3.5 flex gap-3 text-xs leading-relaxed font-medium"
                          >
                            <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">👉 {t.actionItem} {idx + 1}:</span>
                            <span className="text-slate-700 dark:text-slate-300 select-text">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* National Complaint Disclaimer Footer */}
              <div className="bg-slate-100 dark:bg-slate-950/60 p-5 border-t border-slate-200 dark:border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 leading-normal text-center sm:text-left">
                  {t.officialWarning}
                </p>
                <div className="flex gap-2">
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    cybercrime.gov.in
                  </a>
                  <a
                    href="tel:1930"
                    className="text-xs font-bold px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-mono"
                  >
                    Call 1930
                  </a>
                </div>
              </div>

            </div>

            {/* Prototype Disclaimer on Results Page */}
            <div 
              id="results-prototype-disclaimer-box"
              className={`border rounded-xl p-5 flex gap-4 items-start ${
                theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <AlertCircle className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.prototypeDisclaimer}
              </p>
            </div>

          </div>
        )}

      </main>

      {/* Trust Footnotes */}
      <footer 
        id="app-visual-footer"
        className={`border-t py-6 text-center text-xs transition-colors duration-200 ${
          theme === 'dark' ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-slate-100 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 {t.appName} • Developed by security experts in India</p>
          <div className="flex gap-4">
            <a href="https://sancharsaathi.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Sanchar Saathi
            </a>
            <span>•</span>
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Cyber Crime Helpline
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
