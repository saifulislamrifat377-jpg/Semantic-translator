import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Languages, 
  BookOpen, 
  Bookmark, 
  History, 
  Volume2, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Heart,
  Sun,
  Moon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { translateText, generateSpeech } from './services/geminiService';
import { TranslationResult, WordBreakdown, IslamicPhrase, SavedPhrase } from './types';
import { ISLAMIC_PHRASES } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TypingText = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
  // Use Intl.Segmenter for correct Bengali grapheme (character) splitting
  const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(text)).map(s => s.segment);
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={cn("flex flex-wrap justify-center whitespace-pre-wrap", className)}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.15, delayChildren: delay }
        }
      }}
    >
      {segments.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'islamic' | 'saved'>('home');
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>([]);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedIslamicPhrase, setSelectedIslamicPhrase] = useState<IslamicPhrase | null>(null);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('saved_phrases');
    if (saved) {
      setSavedPhrases(JSON.parse(saved));
    }
  }, []);

  const handleClear = () => {
    setInputText("");
    setResult(null);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    try {
      const res = await translateText(inputText);
      setResult(res);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = () => {
    if (!result || !inputText) return;
    const newSaved: SavedPhrase = {
      id: Date.now().toString(),
      originalText: inputText,
      result: result,
      timestamp: Date.now(),
    };
    const updated = [newSaved, ...savedPhrases];
    setSavedPhrases(updated);
    localStorage.setItem('saved_phrases', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedPhrases.filter(p => p.id !== id);
    setSavedPhrases(updated);
    localStorage.setItem('saved_phrases', JSON.stringify(updated));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayAudio = async (text: string) => {
    setAudioLoading(text);
    try {
      const audioUrl = await generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
    } finally {
      setAudioLoading(null);
    }
  };

  const filteredIslamicPhrases = ISLAMIC_PHRASES.filter(p => 
    p.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bengaliTranslation.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-blue-500/30 transition-colors duration-300">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-400/10 dark:bg-blue-800/10 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                শব্দার্থ অনুবাদক
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavButton 
                active={activeTab === 'home'} 
                onClick={() => setActiveTab('home')}
                icon={<Languages className="w-4 h-4" />}
                label="হোম"
              />
              <NavButton 
                active={activeTab === 'islamic'} 
                onClick={() => setActiveTab('islamic')}
                icon={<BookOpen className="w-4 h-4" />}
                label="ইসলামিক ফ্রেজ"
              />
              <NavButton 
                active={activeTab === 'saved'} 
                onClick={() => setActiveTab('saved')}
                icon={<Bookmark className="w-4 h-4" />}
                label="সংরক্ষিত"
              />
              <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-all"
                title={theme === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-2">
                <MobileNavButton 
                  active={activeTab === 'home'} 
                  onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
                  icon={<Languages className="w-5 h-5" />}
                  label="হোম"
                />
                <MobileNavButton 
                  active={activeTab === 'islamic'} 
                  onClick={() => { setActiveTab('islamic'); setIsMobileMenuOpen(false); }}
                  icon={<BookOpen className="w-5 h-5" />}
                  label="ইসলামিক ফ্রেজ"
                />
                <MobileNavButton 
                  active={activeTab === 'saved'} 
                  onClick={() => { setActiveTab('saved'); setIsMobileMenuOpen(false); }}
                  icon={<Bookmark className="w-5 h-5" />}
                  label="সংরক্ষিত"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
                  <TypingText text="প্রতিটি শব্দ গভীরভাবে" />
                  <TypingText 
                    text="এবং স্পষ্টভাবে বুঝুন" 
                    delay={3.5}
                    className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
                  />
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  ইংরেজি, আরবি এবং উর্দু থেকে বাংলায় অনুবাদ করুন প্রতিটি শব্দের বিস্তারিত অর্থ ও ব্যাখ্যাসহ।
                </p>
              </div>

              {/* Translation Input */}
              <div className="max-w-4xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-[2.5rem] blur-xl opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="ইংরেজি, আরবি বা উর্দুতে বাক্য লিখুন..."
                      className="w-full bg-transparent border-none focus:ring-0 outline-none text-2xl md:text-4xl font-bold min-h-[180px] resize-none placeholder:text-slate-400 dark:placeholder:text-slate-700 leading-tight text-slate-900 dark:text-white"
                    />
                    <div className="flex items-center justify-end mt-8 pt-8 border-t border-slate-200 dark:border-white/5 gap-4">
                      <button
                        onClick={handleClear}
                        className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all shadow-xl"
                        title="সব মুছে ফেলুন"
                      >
                        <RotateCcw className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleTranslate}
                        disabled={isTranslating || !inputText.trim()}
                        className={cn(
                          "px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-2xl whitespace-nowrap",
                          isTranslating || !inputText.trim() 
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed" 
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                        )}
                      >
                        {isTranslating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            অনুবাদ হচ্ছে...
                          </>
                        ) : (
                          <>
                            অনুবাদ করুন
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Full Translation Card */}
                  <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">সম্পূর্ণ অনুবাদ</h2>
                      <div className="flex items-center gap-2">
                        <ActionButton 
                          icon={copied ? <Check className="w-4 h-4 text-green-500 dark:text-green-400" /> : <Copy className="w-4 h-4" />} 
                          onClick={() => handleCopy(result.fullTranslation)}
                          label={copied ? "কপি হয়েছে" : "কপি করুন"}
                        />
                        <ActionButton 
                          icon={isSaved ? <Check className="w-4 h-4 text-green-500 dark:text-green-400" /> : <Bookmark className="w-4 h-4" />} 
                          onClick={handleSave}
                          label={isSaved ? "সংরক্ষিত হয়েছে" : "সংরক্ষণ করুন"}
                        />
                      </div>
                    </div>
                    <p className="text-2xl md:text-4xl font-bold leading-tight text-slate-900 dark:text-white">
                      {result.fullTranslation}
                    </p>
                    <div className="mt-4 inline-block px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-xs text-slate-500 dark:text-slate-400">
                      শনাক্তকৃত ভাষা: <span className="text-blue-600 dark:text-blue-400 font-medium">{result.detectedLanguage}</span>
                    </div>
                  </div>

                  {/* Word Breakdown Board */}
                  <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">প্রতিটি শব্দের অর্থ</h2>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
                      {result.breakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-2xl md:text-3xl font-arabic text-blue-600 dark:text-blue-400" dir="rtl">{item.word}</span>
                          <span className="text-slate-400 dark:text-slate-600 font-light">—</span>
                          <span className="text-slate-700 dark:text-slate-200 text-lg font-medium">{item.meaning}</span>
                          {idx < result.breakdown.length - 1 && (
                            <div className="hidden md:block ml-4 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/10" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bengali Pronunciation Board */}
                  <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl relative group">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">বাংলা উচ্চারণ</h2>
                      <div className="flex items-center gap-2">
                        <ActionButton 
                          icon={copied ? <Check className="w-4 h-4 text-green-500 dark:text-green-400" /> : <Copy className="w-4 h-4" />} 
                          onClick={() => handleCopy(result.pronunciation)}
                          label={copied ? "কপি হয়েছে" : "কপি করুন"}
                        />
                      </div>
                    </div>
                    <p className="text-2xl md:text-4xl font-bold text-center text-indigo-900 dark:text-indigo-100 leading-relaxed">
                      {result.pronunciation}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'islamic' && (
            <motion.div
              key="islamic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <AnimatePresence mode="wait">
                {selectedIslamicPhrase ? (
                  <motion.div
                    key="detailed-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-4xl mx-auto space-y-8"
                  >
                    <button 
                      onClick={() => setSelectedIslamicPhrase(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                      তালিকায় ফিরে যান
                    </button>

                    <IslamicPhraseDetailedView 
                      phrase={selectedIslamicPhrase}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">নামাজের প্রয়োজনীয় ফ্রেজ</h1>
                      <p className="text-slate-600 dark:text-slate-400">সালাতে ব্যবহৃত গুরুত্বপূর্ণ দোয়া ও তাসবীহগুলো শিখুন</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                      {ISLAMIC_PHRASES.map((phrase) => (
                        <IslamicPhraseCard 
                          key={phrase.id} 
                          phrase={phrase} 
                          onClick={() => setSelectedIslamicPhrase(phrase)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">সংরক্ষিত ফ্রেজ</h1>
                <p className="text-slate-600 dark:text-slate-400">শেখার জন্য আপনার সংরক্ষিত অনুবাদের সংগ্রহ</p>
              </div>

              {savedPhrases.length === 0 ? (
                <div className="text-center py-20 bg-white/60 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                  <Bookmark className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">এখনও কোনো ফ্রেজ সংরক্ষিত নেই। সংরক্ষণ করতে অনুবাদ শুরু করুন!</p>
                </div>
              ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {savedPhrases.map((item) => (
                      <SavedPhraseCard 
                        key={item.id} 
                        item={item} 
                        onDelete={() => handleDeleteSaved(item.id)}
                        onCopy={() => handleCopy(item.result.fullTranslation)}
                      />
                    ))}
                  </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-12 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Languages className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            <span className="font-bold text-slate-900 dark:text-white">শব্দার্থ অনুবাদক</span>
          </div>
          <p className="text-slate-500 text-sm">
            জেমিনি এআই দ্বারা চালিত • গভীর ভাষাগত বোঝার জন্য ডিজাইন করা হয়েছে
          </p>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
        active ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all",
        active ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ActionButton({ icon, onClick, label }: { icon: React.ReactNode, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className="p-2 rounded-lg bg-white/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-white/5"
    >
      {icon}
    </button>
  );
}


function IslamicPhraseCard({ phrase, onClick }: { phrase: IslamicPhrase, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, backgroundColor: "var(--hover-bg, rgba(255, 255, 255, 0.08))" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 cursor-pointer transition-all group flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center border border-blue-200 dark:border-blue-500/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20 transition-colors">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {phrase.phrase}
        </h3>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
    </motion.div>
  );
}

function IslamicPhraseDetailedView({ phrase }: { phrase: IslamicPhrase }) {
  return (
    <div className="space-y-8">
      {/* Board 1: Arabic & Pronunciation - Unified Board */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-xl text-center">
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{phrase.phrase}</span>
          </div>
        </div>
        
        <h3 className="text-4xl md:text-5xl font-arabic text-blue-600 dark:text-blue-400 leading-[1.8] md:leading-[2.2] mb-10" dir="rtl">
          {phrase.arabic}
        </h3>
        
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">উচ্চারণ</p>
          <p className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-100/80 font-mono">
            {phrase.pronunciation}
          </p>
        </div>
      </div>

      {/* Board 2: Bengali Translation */}
      <div className="bg-gradient-to-br from-blue-100/50 to-indigo-100/50 dark:from-blue-600/10 dark:to-indigo-600/10 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-xl">
        <h4 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6">অনুবাদ</h4>
        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
          {phrase.bengaliTranslation}
        </p>
      </div>

      {/* Board 3: Word Breakdown - Single Board with List */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-xl">
        <h4 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-8">প্রতিটি শব্দের অর্থ</h4>
        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {phrase.breakdown.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-8 py-6 first:pt-0 last:pb-0"
            >
              <div className="text-2xl md:text-3xl font-arabic text-blue-600 dark:text-blue-400 min-w-[100px]" dir="rtl">
                {item.word}
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-white/10" />
              <div className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                {item.meaning}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SavedPhraseCard({ item, onDelete, onCopy }: { item: SavedPhrase, onDelete: () => void, onCopy: () => void }) {
  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400 italic">"{item.originalText}"</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onCopy}
            className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/20 transition-all"
            title="কপি করুন"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 transition-all"
            title="ডিলিট করুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.result.fullTranslation}</p>
    </div>
  );
}

