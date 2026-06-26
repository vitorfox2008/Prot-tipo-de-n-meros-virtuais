import React, { useState, useEffect } from 'react';
import { Infinity as InfinityIcon, Heart, Star, Phone, Plus, Loader2, Code2, Globe2, X } from 'lucide-react';
import { useNumbers } from './hooks/useNumbers';
import { api } from './api';
import { VirtualNumber } from './types';
import { NumberCard } from './components/NumberCard';
import { Inbox } from './components/Inbox';
import { AndroidKotlinCode } from './components/AndroidKotlinCode';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'main' | 'favorites' | 'starred' | 'sdk';

const COUNTRIES = [
  { code: 'BR', name: 'Brasil', ddi: '+55' },
  { code: 'US', name: 'Estados Unidos', ddi: '+1' },
  { code: 'GB', name: 'Reino Unido', ddi: '+44' },
  { code: 'CA', name: 'Canadá', ddi: '+1' },
  { code: 'PT', name: 'Portugal', ddi: '+351' },
  { code: 'ES', name: 'Espanha', ddi: '+34' },
  { code: 'CH', name: 'Suíça', ddi: '+41' },
  { code: 'PL', name: 'Polônia', ddi: '+48' },
];

export default function App() {
  const { numbers, addNumber, toggleFavorite, toggleStar, removeNumber } = useNumbers();
  const [activeTab, setActiveTab] = useState<Tab>('main');
  const [balance, setBalance] = useState<string>('...');
  const [isBuying, setIsBuying] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<VirtualNumber | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('WhatsApp');
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    api.getBalance().then(res => {
      setBalance(res.balance);
      setDemoMode(res.demoMode);
    }).catch(() => setBalance('∞'));
  }, []);

  const handleBuyNumber = async (countryCode: string) => {
    setShowCountryModal(false);
    try {
      setIsBuying(true);
      const newNum = await api.buyNumber(countryCode, selectedService);
      addNumber(newNum);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsBuying(false);
    }
  };

  if (selectedNumber) {
    return <Inbox numberData={selectedNumber} onBack={() => setSelectedNumber(null)} onDelete={removeNumber} />;
  }

  const filteredNumbers = numbers.filter(n => {
    if (activeTab === 'favorites') return n.isFavorite;
    if (activeTab === 'starred') return n.isStarred;
    return true;
  });

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#121212] relative overflow-hidden">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 flex items-center justify-between z-10 relative bg-[#121212]">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-white flex items-center gap-2">
            INFINITY
            <span className="text-zinc-500 font-medium text-lg">NUMBERS</span>
          </h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Saldo</span>
          <div className="flex items-center gap-1 text-white">
            <span className="font-display text-2xl font-bold leading-none">{balance}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 relative z-0">
        {activeTab === 'sdk' ? (
          <AndroidKotlinCode />
        ) : (
          <div className="px-4">
            {activeTab === 'main' && (
              <div className="mb-8 mt-2">
                {demoMode && (
                  <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs leading-relaxed text-center">
                    <strong className="block text-sm mb-1">⚠️ Modo Demonstração Ativo</strong>
                    Os números gerados agora são <strong>falsos</strong> e aparecerão como "inválidos" no WhatsApp/Telegram. Para gerar números reais e funcionais, adicione sua <strong>API Key da Twilio</strong> (TWILIO_ACCOUNT_SID e TOKEN) no arquivo .env do servidor.
                  </div>
                )}
                <button
                  onClick={() => setShowCountryModal(true)}
                  disabled={isBuying}
                  className="w-full bg-white text-black font-semibold rounded-2xl py-5 px-6 flex items-center justify-center gap-3 hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                  {isBuying ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6" />
                      <span className="text-lg tracking-tight">Obter Número Virtual</span>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-zinc-500 mt-4 px-8 leading-relaxed">
                  Números móveis reais 100% funcionais para ativação de <strong className="text-zinc-300">Telegram</strong>, WhatsApp e Instagram.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {filteredNumbers.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-zinc-500"
                  >
                    {activeTab === 'favorites' ? (
                      <Heart className="w-12 h-12 mb-4 opacity-20" />
                    ) : activeTab === 'starred' ? (
                      <Star className="w-12 h-12 mb-4 opacity-20" />
                    ) : (
                      <Phone className="w-12 h-12 mb-4 opacity-20" />
                    )}
                    <p className="font-medium text-sm">Nenhum número encontrado</p>
                  </motion.div>
                ) : (
                  filteredNumbers.map(num => (
                    <motion.div
                      key={num.sid}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NumberCard 
                        numberData={num} 
                        onToggleFavorite={toggleFavorite}
                        onToggleStar={toggleStar}
                        onClick={setSelectedNumber}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Country Selection Modal */}
      <AnimatePresence>
        {showCountryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowCountryModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#1a1a1a] w-full max-h-[80vh] rounded-t-3xl border-t border-zinc-800 p-6 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-display font-bold text-xl">Selecionar País</h3>
                  <p className="text-zinc-500 text-xs mt-1">Escolha o serviço e a região</p>
                </div>
                <button 
                  onClick={() => setShowCountryModal(false)}
                  className="p-2 bg-zinc-800/50 rounded-full hover:bg-zinc-800 text-zinc-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">1. Serviço Desejado</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedService('WhatsApp')}
                    className={cn(
                      "p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all",
                      selectedService === 'WhatsApp' 
                        ? "bg-green-500/20 border-green-500 text-green-400" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                    )}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setSelectedService('Telegram')}
                    className={cn(
                      "p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all",
                      selectedService === 'Telegram' 
                        ? "bg-blue-500/20 border-blue-500 text-blue-400" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                    )}
                  >
                    Telegram
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto space-y-2 flex-1 pb-4">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">2. Selecione a Região</label>
                {COUNTRIES.map(country => (
                  <button
                    key={country.code}
                    onClick={() => handleBuyNumber(country.code)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Globe2 className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-zinc-200 font-medium text-sm">{country.name}</div>
                        <div className="text-zinc-500 text-xs">{country.code}</div>
                      </div>
                    </div>
                    <div className="font-display font-semibold text-white tracking-wider bg-zinc-800 px-3 py-1 rounded-lg text-sm">
                      {country.ddi}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-[#121212]/90 backdrop-blur-xl border-t border-zinc-800/80 px-4 py-3 flex items-center justify-between z-20">
        {[
          { id: 'main', icon: InfinityIcon, label: 'Início' },
          { id: 'favorites', icon: Heart, label: 'Favoritos' },
          { id: 'starred', icon: Star, label: 'Estrelas' },
          { id: 'sdk', icon: Code2, label: 'Android SDK' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-colors flex-1",
              activeTab === tab.id ? "text-white" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            <div className={cn("p-1.5 rounded-xl transition-colors", activeTab === tab.id && "bg-zinc-800/50")}>
              <tab.icon className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

