import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, MessageSquare, Copy, Check, Trash2 } from 'lucide-react';
import { VirtualNumber, SmsMessage } from '../types';
import { api } from '../api';
import { formatPhoneNumber, extractVerificationCode } from '../utils/formatters';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InboxProps {
  numberData: VirtualNumber;
  onBack: () => void;
  onDelete: (sid: string) => void;
}

export function Inbox({ numberData, onBack, onDelete }: InboxProps) {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchMessages = async () => {
    try {
      setError(null);
      const msgs = await api.getMessages(numberData.phoneNumber);
      setMessages(msgs);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar mensagens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Auto-refresh removed as requested. User will manually refresh when SMS is requested.
  }, [numberData.phoneNumber]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(numberData.phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#121212]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-[#1a1a1a]/50 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div 
          onClick={handleCopyNumber}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer group px-2"
        >
          <div className="font-display font-semibold text-lg tracking-wide flex items-center gap-2 text-white">
            {formatPhoneNumber(numberData.phoneNumber)}
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />}
          </div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
            {copied ? 'Número Copiado!' : 'Toque para copiar número'}
          </span>
        </div>
        <div className="flex items-center -mr-2">
          <button 
            onClick={() => {
              if (window.confirm("Tem certeza que deseja excluir este número? Ele não poderá ser recuperado.")) {
                onDelete(numberData.sid);
                onBack();
              }
            }}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
          <button 
            onClick={() => { setLoading(true); fetchMessages(); }}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center text-sm">
            {error}
          </div>
        )}
        
        {!loading && messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium text-zinc-400">Caixa de entrada vazia</p>
            <p className="text-sm mt-1 text-center max-w-[250px]">
              Aguardando códigos SMS do WhatsApp, Telegram, Instagram, etc.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const code = extractVerificationCode(msg.body);
          
          return (
            <div key={msg.id} className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-zinc-300">{msg.from}</span>
                <span className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(msg.dateCreated), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              
              <p className="text-zinc-400 text-sm leading-relaxed">
                {msg.body}
              </p>
              
              {code && (
                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold">
                    Código de Verificação
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl py-3 px-4 flex items-center justify-center">
                    <span className="font-display text-4xl font-bold tracking-[0.2em] text-white">
                      {code}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
