import React, { useState, useCallback, useEffect } from 'react';
import { translateText, lookupWord } from './services/geminiService';
import { TranslationSegment, DictionaryEntry, LoadingState } from './types';
import Word from './components/Word';
import DictionarySidebar from './components/DictionarySidebar';
import { Sparkles, ArrowRight, Eraser, AlertCircle, Key, LogOut } from 'lucide-react';

const STORAGE_KEY = 'gemini_api_key';

export default function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [tempKey, setTempKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  const [inputText, setInputText] = useState('');
  const [segments, setSegments] = useState<TranslationSegment[]>([]);
  const [translationStatus, setTranslationStatus] = useState<LoadingState>({ status: 'idle' });
  
  // Dictionary State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDictLoading, setIsDictLoading] = useState(false);
  const [dictEntry, setDictEntry] = useState<DictionaryEntry | null>(null);

  // Initialize key from storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setIsKeySaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      localStorage.setItem(STORAGE_KEY, tempKey.trim());
      setApiKey(tempKey.trim());
      setIsKeySaved(true);
      setTempKey('');
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setIsKeySaved(false);
    setSegments([]);
    setInputText('');
  };

  const handleTranslate = async () => {
    if (!inputText.trim() || !apiKey) return;

    setTranslationStatus({ status: 'loading' });
    try {
      const result = await translateText(inputText, apiKey);
      setSegments(result);
      setTranslationStatus({ status: 'success' });
    } catch (error) {
      setTranslationStatus({ 
        status: 'error', 
        message: 'Failed to translate. Check your API key or connection.' 
      });
    }
  };

  const handleTripleClick = useCallback(async (word: string) => {
    if (!apiKey) return;
    setIsSidebarOpen(true);
    setIsDictLoading(true);
    setDictEntry(null); 

    try {
      const entry = await lookupWord(word, apiKey);
      setDictEntry(entry);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDictLoading(false);
    }
  }, [apiKey]);

  const closeSidebar = () => setIsSidebarOpen(false);

  // Render text segments
  const renderInteractiveEnglish = (text: string) => {
    const words = text.split(' ');
    return words.map((word, index) => (
      <React.Fragment key={index}>
        <Word text={word} onTripleClick={handleTripleClick} />
        {index < words.length - 1 && ' '}
      </React.Fragment>
    ));
  };

  // ----------------------------------------------------------------------
  // VIEW: API Key Setup
  // ----------------------------------------------------------------------
  if (!isKeySaved) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span className="text-white font-bold font-burmese text-3xl">ဗ</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome</h1>
            <p className="text-indigo-100">Burmese Interlinear Translator</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-semibold text-slate-800">API Key Required</h2>
              <p className="text-sm text-slate-500">
                To use this application, you need to provide your own Google Gemini API Key. It will be stored locally on your device.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Gemini API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <input 
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <button
                onClick={handleSaveKey}
                disabled={!tempKey.trim()}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Start Translating <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
              >
                Get a Gemini API Key here
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: Main Application
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold font-burmese">M</span>
            </div>
            <h1 className="font-bold text-slate-800 text-lg sm:text-xl hidden sm:block">Burmese Interlinear</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline-block">API Key Active</span>
            <button 
              onClick={handleClearKey}
              className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
              title="Remove API Key"
            >
              <LogOut className="w-3.5 h-3.5" />
              Reset Key
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-8">
        
        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
          <div className="relative">
            <textarea
              className="w-full min-h-[150px] p-6 text-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl resize-y bg-transparent"
              placeholder="Enter English text here to translate..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            {inputText && (
              <button 
                onClick={() => setInputText('')}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                title="Clear text"
              >
                <Eraser className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="border-t border-slate-100 p-3 flex justify-between items-center bg-slate-50/50 rounded-b-xl">
             <div className="text-sm text-slate-400 pl-2">
              Triple-click words for definitions
            </div>
            <button
              onClick={handleTranslate}
              disabled={translationStatus.status === 'loading' || !inputText.trim()}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm
                ${translationStatus.status === 'loading' || !inputText.trim() 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-md active:transform active:scale-95'
                }
              `}
            >
              {translationStatus.status === 'loading' ? (
                <>Translating...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Translate
                </>
              )}
            </button>
          </div>
        </section>

        {/* Output Section */}
        {translationStatus.status === 'error' && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{translationStatus.message}</p>
          </div>
        )}

        {segments.length > 0 && (
          <section className="space-y-6 pb-20">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Translation Result</h2>
            
            <div className="grid gap-4">
              {segments.map((segment, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors group"
                >
                  {/* English Line */}
                  <div className="text-lg md:text-xl text-slate-800 leading-relaxed mb-3 font-medium">
                    {renderInteractiveEnglish(segment.english)}
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-slate-100 w-full mb-3 group-hover:bg-indigo-50 transition-colors" />

                  {/* Burmese Line */}
                  <div className="text-lg md:text-xl text-indigo-900 leading-relaxed font-burmese opacity-90">
                    {segment.burmese}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State / Intro */}
        {segments.length === 0 && translationStatus.status === 'idle' && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
              <ArrowRight className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-slate-500">Ready to translate</p>
            <p className="text-sm">Type or paste a paragraph above to get started.</p>
          </div>
        )}

      </main>

      {/* Dictionary Sidebar */}
      <DictionarySidebar 
        isOpen={isSidebarOpen} 
        isLoading={isDictLoading} 
        entry={dictEntry} 
        onClose={closeSidebar}
        apiKey={apiKey}
      />

    </div>
  );
}