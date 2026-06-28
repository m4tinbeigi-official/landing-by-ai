import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Download, 
  Sparkles, 
  Layout, 
  RotateCcw, 
  Loader2, 
  Bot, 
  User, 
  Code2, 
  Monitor,
  AlertCircle,
  WifiOff
} from 'lucide-react';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: 'سلام! من دستیار هوش مصنوعی شما برای طراحی لندینگ پیج هستم. چه نوع صفحه‌ای می‌خواهید بسازید؟ (مثلا: یک لندینگ پیج برای فروشگاه قهوه با تم تاریک)'
    }
  ]);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isGenerating]);

  // Inject Vazirmatn Font for beautiful Persian typography
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;900&display=swap');
      * {
        font-family: 'Vazirmatn', sans-serif;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #374151;
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // لینک‌ها و کلیدها برای سیستم جایگزین (Fallback)
  const WORKER_URL = 'https://landing.m4tinbeigi.workers.dev/';
  const DIRECT_API_URL = 'https://router.bynara.id/v1/chat/completions';
  const API_KEY = 'sk-nry-zrEqwi-FhMLmuo-xvvFFrRjLuN_1Uqf8hfXhYaB5UQc';

  const extractHTML = (text) => {
    if (!text) return '';
    const htmlMatch = text.match(/```html\s*([\s\S]*?)\s*```/i);
    if (htmlMatch) return htmlMatch[1];
    
    const genericMatch = text.match(/```\s*([\s\S]*?)\s*```/i);
    if (genericMatch) return genericMatch[1];
    
    return text;
  };

  const generateOfflineTemplate = (userIdea) => {
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>قالب آفلاین | FocusAI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;900&display=swap');
        body { font-family: 'Vazirmatn', sans-serif; }
    </style>
</head>
<body class="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
    <!-- Header -->
    <header class="px-8 py-6 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">F</div>
            <h1 class="text-xl font-bold tracking-tight">FocusAI</h1>
        </div>
        <nav class="hidden md:flex gap-8 text-sm text-gray-300">
            <a href="#" class="hover:text-white transition-colors">امکانات</a>
            <a href="#" class="hover:text-white transition-colors">مستندات</a>
            <a href="#" class="hover:text-white transition-colors">قیمت‌گذاری</a>
        </nav>
        <button class="bg-white text-black px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
            ورود / ثبت‌نام
        </button>
    </header>

    <!-- Hero Section -->
    <main class="flex-1 flex flex-col items-center justify-center px-4 text-center py-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-gray-950">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs mb-8">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            حالت آفلاین (محدودیت شبکه)
        </div>
        <h2 class="text-4xl md:text-6xl font-extrabold mb-6 leading-tight max-w-4xl">
            طراحی هوشمند برای:<br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                ${userIdea || 'کسب و کار شما'}
            </span>
        </h2>
        <p class="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
            ارتباط با سرور هوش مصنوعی به دلیل فیلترینگ مسدود شده است. این یک قالب جایگزین آفلاین است. برای تولید صفحات اختصاصی و واقعی لطفاً VPN خود را متصل کنید.
        </p>
        <div class="flex gap-4 flex-col sm:flex-row">
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25">
                شروع قدرتمند
            </button>
            <button class="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-8 py-3 rounded-lg font-medium transition-all">
                مشاهده مستندات
            </button>
        </div>
    </main>
</body>
</html>`;
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userText = prompt.trim();
    setPrompt('');
    setError('');
    
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setIsGenerating(true);

    try {
      let finalMessages = [];
      const systemInstruction = `شما یک توسعه‌دهنده ارشد فرانت‌اند و طراح UI/UX هستید. وظیفه شما طراحی لندینگ پیج‌های خیره‌کننده است. قوانین: 1. فقط از HTML5 و Tailwind CSS استفاده کنید. 2. فقط کد خالص برگردانید.`;

      if (!generatedCode || generatedCode.includes('حالت آفلاین')) {
        const enhancedPrompt = `لطفاً ایده زیر را به یک لندینگ پیج فوق‌العاده حرفه‌ای تبدیل کن: "${userText}"`;
        finalMessages = [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: enhancedPrompt }
        ];
      } else {
        const updatePrompt = `این کد لندینگ پیج فعلی من است: \`\`\`html\n${generatedCode}\n\`\`\` کاربر این تغییر را می‌خواهد: "${userText}". لطفا کد کامل جدید را بده.`;
        finalMessages = [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: updatePrompt }
        ];
      }

      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: finalMessages,
        temperature: 0.7,
      };

      const fetchTargets = [
        { url: WORKER_URL, useAuth: false, name: 'Cloudflare Worker' },
        { url: `https://corsproxy.io/?${encodeURIComponent(DIRECT_API_URL)}`, useAuth: true, name: 'CORS Proxy 1' },
        { url: `https://thingproxy.freeboard.io/fetch/${DIRECT_API_URL}`, useAuth: true, name: 'CORS Proxy 2' },
        { url: DIRECT_API_URL, useAuth: true, name: 'Direct API' }
      ];

      let response;
      let success = false;
      let lastErrorMessage = '';

      for (const target of fetchTargets) {
        try {
          console.log(`Trying endpoint: ${target.name}`);
          const headers = { 'Content-Type': 'application/json' };
          if (target.useAuth) headers['Authorization'] = `Bearer ${API_KEY}`;

          response = await fetch(target.url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            success = true;
            break; 
          } else {
            const errorText = await response.text();
            lastErrorMessage = `وضعیت ${response.status}: ${errorText.substring(0, 50)}`;
          }
        } catch (err) {
          lastErrorMessage = err.message;
        }
      }

      if (!success) {
        // هندل کردن زیبای خطای شبکه با بارگذاری قالب آفلاین
        if (lastErrorMessage.includes('Failed to fetch') || lastErrorMessage.includes('NetworkError') || lastErrorMessage.includes('Load failed')) {
            const offlineCode = generateOfflineTemplate(userText);
            setGeneratedCode(offlineCode);
            setChatHistory(prev => [...prev, { 
                sender: 'ai', 
                text: 'ارتباط با سرور هوش مصنوعی به دلیل فیلترینگ برقرار نشد. برای اینکه روند کار شما متوقف نشود، یک قالب آزمایشی زیبا بر اساس ایده شما برایتان بارگذاری کردم. برای دریافت طرح‌های واقعی، VPN را روشن کنید.',
                isWarning: true
            }]);
            return; // خروج موفقیت‌آمیز از بلاک
        } else {
             throw new Error(`خطای سرور: ${lastErrorMessage}`);
        }
      }

      const data = await response.json();
      
      const rawCode = data.choices && data.choices[0] 
        ? data.choices[0].message.content 
        : (data.response || data.text || '');
        
      if (!rawCode) {
        throw new Error('فرمت پاسخ دریافتی از سرور نامعتبر است.');
      }

      const cleanCode = extractHTML(rawCode);

      setGeneratedCode(cleanCode);
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: 'طراحی انجام شد! تغییرات در صفحه پیش‌نمایش قابل مشاهده است.' 
      }]);

    } catch (err) {
      console.error(err);
      setError(err.message);
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: err.message,
        isError: true
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if(window.confirm('آیا مطمئن هستید که می‌خواهید پروژه فعلی را پاک کنید؟')) {
      setGeneratedCode('');
      setChatHistory([{
        sender: 'ai',
        text: 'پروژه بازنشانی شد. چه صفحه جدیدی می‌خواهید بسازیم؟'
      }]);
      setError('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0a0a] text-white" dir="rtl">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#111111]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">کدساز هوشمند | FocusAI Builder</h1>
        </div>
        <div className="flex items-center gap-3">
          {generatedCode && (
            <>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-green-600/10 text-green-500 rounded-md hover:bg-green-600/20 border border-green-600/20"
              >
                <Download className="w-4 h-4" />
                دانلود سورس کد
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-red-600/10 text-red-500 rounded-md hover:bg-red-600/20 border border-red-600/20"
              >
                <RotateCcw className="w-4 h-4" />
                شروع مجدد
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Right Sidebar (Chat & Prompt) */}
        <div className="w-[400px] flex flex-col border-l border-gray-800 bg-[#121212] z-10 shadow-2xl">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row' : 'flex-row'}`}
              >
                <div className="flex-shrink-0">
                  {msg.sender === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isError ? 'bg-red-600' : msg.isWarning ? 'bg-orange-500' : 'bg-indigo-600'}`}>
                      {msg.isError ? <AlertCircle className="w-4 h-4 text-white" /> : msg.isWarning ? <WifiOff className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                  )}
                </div>
                <div className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'items-start' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 mb-1">
                    {msg.sender === 'user' ? 'شما' : 'هوش مصنوعی'}
                  </span>
                  <div 
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-[#1e1e1e] border border-gray-700/50 text-gray-200 rounded-tr-sm' 
                        : msg.isError
                          ? 'bg-red-950/30 border border-red-900/50 text-red-200 rounded-tr-sm'
                          : msg.isWarning 
                            ? 'bg-orange-950/30 border border-orange-900/50 text-orange-200 rounded-tr-sm'
                            : 'bg-indigo-950/30 border border-indigo-900/50 text-indigo-100 rounded-tr-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex gap-3 flex-row">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                </div>
                <div className="flex flex-col max-w-[85%] items-start">
                  <span className="text-xs text-gray-500 mb-1">هوش مصنوعی</span>
                  <div className="p-3 rounded-2xl text-sm leading-relaxed bg-indigo-950/30 border border-indigo-900/50 text-indigo-200 rounded-tr-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    در حال تفکر و برنامه‌نویسی...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#111111] border-t border-gray-800">
            {error && (
              <div className="mb-3 text-xs text-red-400 flex items-start gap-2 bg-red-950/30 p-3 rounded border border-red-900/50 leading-relaxed">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> 
                <span className="text-right">{error}</span>
              </div>
            )}
            <div className="relative flex items-end gap-2 bg-[#1e1e1e] border border-gray-700 rounded-xl p-2 focus-within:border-indigo-500 transition-colors">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={generatedCode && !generatedCode.includes('حالت آفلاین') ? "چه تغییری در این صفحه ایجاد کنم؟" : "درباره لندینگ پیج خود توضیح دهید..."}
                className="w-full max-h-40 min-h-[44px] bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-sm p-2 custom-scrollbar"
                rows={1}
                dir="rtl"
                disabled={isGenerating}
              />
              <button
                onClick={handleSend}
                disabled={!prompt.trim() || isGenerating}
                className={`p-2.5 rounded-lg flex-shrink-0 transition-all ${
                  !prompt.trim() || isGenerating
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/20'
                }`}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rotate-180" />}
              </button>
            </div>
            <div className="text-[10px] text-gray-500 mt-2 text-center">
              مدل هوش مصنوعی به صورت خودکار توضیحات شما را بهبود می‌بخشد تا بهترین خروجی حاصل شود.
            </div>
          </div>
        </div>

        {/* Left Preview Area */}
        <div className="flex-1 flex flex-col bg-[#050505] relative">
          {/* Fake Browser Toolbar */}
          <div className="h-10 bg-[#1a1a1a] border-b border-gray-800 flex items-center px-4 gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="flex-1 max-w-md mx-auto bg-[#0a0a0a] rounded text-center py-1 text-xs text-gray-500 border border-gray-800 flex items-center justify-center gap-2">
              <Monitor className="w-3 h-3" /> localhost:3000
            </div>
          </div>

          {/* Iframe for safe html rendering */}
          <div className="flex-1 w-full h-full bg-white relative">
            {!generatedCode ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] text-gray-500 gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-2 border border-gray-800">
                  <Layout className="w-8 h-8 text-gray-600" />
                </div>
                <h2 className="text-xl font-medium text-gray-300">پیش‌نمایش لندینگ پیج</h2>
                <p className="text-sm text-gray-600 max-w-sm text-center">
                  درخواست خود را در پنل سمت راست بنویسید تا هوش مصنوعی بلافاصله آن را طراحی کرده و اینجا نمایش دهد.
                </p>
              </div>
            ) : (
              <iframe
                title="Preview"
                srcDoc={generatedCode}
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
            
            {isGenerating && (
              <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="bg-[#121212] border border-gray-800 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Code2 className="w-5 h-5 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-200">در حال پردازش درخواست...</p>
                    <p className="text-xs text-gray-500 mt-1">طراحی المان‌ها و اعمال استایل‌های Tailwind</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
      </main>
    </div>
  );
}
