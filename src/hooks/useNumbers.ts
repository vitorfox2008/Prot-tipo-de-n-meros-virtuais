import { useState, useEffect } from 'react';
import { VirtualNumber } from '../types';

export function useNumbers() {
  const [numbers, setNumbers] = useState<VirtualNumber[]>(() => {
    const saved = localStorage.getItem('infinity_numbers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('infinity_numbers', JSON.stringify(numbers));
  }, [numbers]);

  const addNumber = (newNumber: VirtualNumber) => {
    setNumbers(prev => [newNumber, ...prev]);
  };

  const toggleFavorite = (sid: string) => {
    setNumbers(prev => prev.map(n => 
      n.sid === sid ? { ...n, isFavorite: !n.isFavorite } : n
    ));
  };

  const toggleStar = (sid: string) => {
    setNumbers(prev => prev.map(n => 
      n.sid === sid ? { ...n, isStarred: !n.isStarred } : n
    ));
  };

  const removeNumber = (sid: string) => {
    setNumbers(prev => prev.filter(n => n.sid !== sid));
  };

  return {
    numbers,
    addNumber,
    toggleFavorite,
    toggleStar,
    removeNumber
  };
}
