import { VirtualNumber, SmsMessage } from './types';

export const api = {
  async getBalance(): Promise<{ balance: string; demoMode: boolean }> {
    const res = await fetch('/api/balance');
    const data = await res.json();
    return { balance: data.balance || '∞', demoMode: !!data.demoMode };
  },

  async buyNumber(countryCode: string = 'BR', service: string = 'Outros'): Promise<VirtualNumber> {
    const res = await fetch('/api/numbers/buy', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryCode, service })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao obter número');
    }
    const data = await res.json();
    return {
      ...data,
      isFavorite: false,
      isStarred: false,
    };
  },

  async getMessages(phoneNumber: string): Promise<SmsMessage[]> {
    const res = await fetch(`/api/messages/${encodeURIComponent(phoneNumber)}`);
    if (!res.ok) {
      throw new Error('Erro ao buscar mensagens');
    }
    const data = await res.json();
    return data.messages;
  }
};
