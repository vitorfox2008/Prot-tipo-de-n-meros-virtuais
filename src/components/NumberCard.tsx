import React from 'react';
import { Heart, Star, Phone, ChevronRight } from 'lucide-react';
import { VirtualNumber } from '../types';
import { cn } from '../lib/utils';
import { formatPhoneNumber } from '../utils/formatters';

interface NumberCardProps {
  numberData: VirtualNumber;
  onToggleFavorite: (sid: string) => void;
  onToggleStar: (sid: string) => void;
  onClick: (numberData: VirtualNumber) => void;
}

export function NumberCard({ numberData, onToggleFavorite, onToggleStar, onClick }: NumberCardProps) {
  return (
    <div 
      className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-4 flex items-center justify-between mb-3 cursor-pointer hover:bg-zinc-800/50 transition-colors active:scale-[0.98]"
      onClick={() => onClick(numberData)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center">
          <Phone className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <div className="font-display text-lg font-semibold tracking-wide text-white">
            {formatPhoneNumber(numberData.phoneNumber)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {numberData.service && (
              <span className={cn(
                "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
                numberData.service === 'WhatsApp' ? "bg-green-500/20 text-green-400" :
                numberData.service === 'Telegram' ? "bg-blue-500/20 text-blue-400" :
                "bg-zinc-800 text-zinc-400"
              )}>
                {numberData.service}
              </span>
            )}
            <div className="text-[10px] text-zinc-500 font-medium">
              {numberData.countryCode || 'BR'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <button 
          onClick={() => onToggleFavorite(numberData.sid)}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <Heart 
            className={cn("w-5 h-5 transition-colors", numberData.isFavorite ? "text-red-500 fill-red-500" : "text-zinc-500")} 
          />
        </button>
        <button 
          onClick={() => onToggleStar(numberData.sid)}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <Star 
            className={cn("w-5 h-5 transition-colors", numberData.isStarred ? "text-yellow-500 fill-yellow-500" : "text-zinc-500")} 
          />
        </button>
        <div className="w-px h-6 bg-zinc-800 mx-1"></div>
        <div className="p-2">
          <ChevronRight className="w-5 h-5 text-zinc-600" />
        </div>
      </div>
    </div>
  );
}
